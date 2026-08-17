import pool from './src/db/pool.js';
import bcrypt from 'bcryptjs';

const resetAdminPassword = async () => {
  try {
    const newPassword = 'password'; // Пароль для админа
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, name, role',
      [hashedPassword, 'admin@madouz.uz']
    );

    if (result.rows.length === 0) {
      // Если админа нет, создадим его
      console.log('Админ не найден, создаём нового...');
      const createResult = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
        ['Admin', 'admin@madouz.uz', hashedPassword, 'admin', 'active']
      );
      console.log('✅ Админ создан:', createResult.rows[0]);
    } else {
      console.log('✅ Пароль админа обновлён:', result.rows[0]);
    }

    console.log('Email: admin@madouz.uz');
    console.log('Password: password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();
