import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import { authenticate, authorize, VALID_ROLES } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role, status, last_seen, created_at FROM users ORDER BY created_at DESC');
  res.json(result.rows);
});

// Get single user
router.get('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('SELECT id, name, email, role, status, last_seen, created_at FROM users WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(result.rows[0]);
});

// Update user
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { name, role, status } = req.body;

  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
  }

  await pool.query(
    'UPDATE users SET name = $1, role = $2, status = $3 WHERE id = $4',
    [name, role, status, id]
  );

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'user', id, `Updated user: ${name}`]
  );

  res.json({ message: 'User updated' });
});

// Reset password
router.post('/:id/reset-password', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, id]);

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'reset_password', 'user', id, `Reset password for user ID ${id}`]
  );

  res.json({ message: 'Password reset' });
});

// Delete user
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  // Prevent deleting yourself
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'user', id, `Deleted user: ${result.rows[0].email}`]
  );

  res.json({ message: 'User deleted' });
});

export default router;
