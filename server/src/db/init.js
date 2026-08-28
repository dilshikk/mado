import pool from './pool.js';

const initDb = async () => {
  try {
    console.log('Initializing database...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'editor',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        last_seen TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migration: avatar_url column
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)`);

    // Settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Menu sections table (top-level tabs: Food / Beverages / Desserts / Takeaway, etc.)
    // These are now DB-driven so admins can rename, reorder, add, or remove them.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_sections (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(50) UNIQUE NOT NULL,
        label VARCHAR(255) NOT NULL,
        label_ru VARCHAR(255),
        label_uz VARCHAR(255),
        label_en VARCHAR(255),
        label_tr VARCHAR(255),
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Menu categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        tab VARCHAR(50) NOT NULL,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migrations for menu_categories: multilingual labels + image
    const categoryCols = [
      'label_ru VARCHAR(255)',
      'label_uz VARCHAR(255)',
      'label_en VARCHAR(255)',
      'label_tr VARCHAR(255)',
      'image_url VARCHAR(500)',
    ];
    for (const col of categoryCols) {
      const colName = col.split(' ')[0];
      const colType = col.split(' ').slice(1).join(' ');
      await pool.query(`ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS ${colName} ${colType}`);
    }

    // Safe migration: section_id FK on menu_categories (categories are now children of menu_sections)
    await pool.query(`ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS section_id INT REFERENCES menu_sections(id) ON DELETE SET NULL`);

    // Seed default sections (Food / Beverages / Desserts / Takeaway) if none exist yet
    const defaultSections = [
      { slug: 'food', label_ru: 'Еда', label_uz: 'Taomlar', label_en: 'Food', label_tr: 'Yemekler', position: 0 },
      { slug: 'beverage', label_ru: 'Напитки', label_uz: 'Ichimliklar', label_en: 'Beverages', label_tr: 'İçecekler', position: 1 },
      { slug: 'dessert', label_ru: 'Десерты', label_uz: 'Shirinliklar', label_en: 'Desserts', label_tr: 'Tatlılar', position: 2 },
      { slug: 'takeaway', label_ru: 'Навынос', label_uz: 'Olib ketish', label_en: 'Takeaway', label_tr: 'Paket', position: 3 },
    ];
    for (const section of defaultSections) {
      await pool.query(
        `INSERT INTO menu_sections (slug, label, label_ru, label_uz, label_en, label_tr, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (slug) DO NOTHING`,
        [section.slug, section.label_ru, section.label_ru, section.label_uz, section.label_en, section.label_tr, section.position]
      );
    }

    // Auto-migrate existing categories: link section_id based on their current `tab` value
    await pool.query(`
      UPDATE menu_categories c
      SET section_id = s.id
      FROM menu_sections s
      WHERE c.section_id IS NULL AND c.tab = s.slug
    `);

    // Dishes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dishes (
        id SERIAL PRIMARY KEY,
        category_id INT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
        name_ru VARCHAR(255) NOT NULL,
        name_uz VARCHAR(255),
        name_en VARCHAR(255),
        name_tr VARCHAR(255),
        description_ru TEXT,
        description_uz TEXT,
        description_en TEXT,
        description_tr TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        status VARCHAR(50) NOT NULL DEFAULT 'published',
        is_new BOOLEAN DEFAULT FALSE,
        is_signature BOOLEAN DEFAULT FALSE,
        is_vegetarian BOOLEAN DEFAULT FALSE,
        is_spicy BOOLEAN DEFAULT FALSE,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Locations table (with multilingual fields + photo)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_ru VARCHAR(255),
        name_uz VARCHAR(255),
        name_en VARCHAR(255),
        name_tr VARCHAR(255),
        district VARCHAR(100) NOT NULL,
        district_ru VARCHAR(100),
        district_uz VARCHAR(100),
        district_en VARCHAR(100),
        district_tr VARCHAR(100),
        address TEXT NOT NULL,
        address_ru TEXT,
        address_uz TEXT,
        address_en TEXT,
        address_tr TEXT,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        maps_url VARCHAR(500),
        photo_url VARCHAR(500),
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migrations for existing locations table
    const locationCols = [
      'name_ru VARCHAR(255)',
      'name_uz VARCHAR(255)',
      'name_en VARCHAR(255)',
      'name_tr VARCHAR(255)',
      'district_ru VARCHAR(100)',
      'district_uz VARCHAR(100)',
      'district_en VARCHAR(100)',
      'district_tr VARCHAR(100)',
      'address_ru TEXT',
      'address_uz TEXT',
      'address_en TEXT',
      'address_tr TEXT',
      'photo_url VARCHAR(500)',
    ];
    for (const col of locationCols) {
      const colName = col.split(' ')[0];
      const colType = col.split(' ').slice(1).join(' ');
      await pool.query(`ALTER TABLE locations ADD COLUMN IF NOT EXISTS ${colName} ${colType}`);
    }

    // Location hours table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS location_hours (
        id SERIAL PRIMARY KEY,
        location_id INT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        day_of_week INT NOT NULL,
        open_time TIME NOT NULL,
        close_time TIME NOT NULL,
        is_closed BOOLEAN DEFAULT FALSE
      )
    `);

    // Location services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS location_services (
        id SERIAL PRIMARY KEY,
        location_id INT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        service VARCHAR(100) NOT NULL
      )
    `);

    // Promotions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Promotion pages mapping
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promotion_pages (
        id SERIAL PRIMARY KEY,
        promotion_id INT NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
        page VARCHAR(100) NOT NULL
      )
    `);

    // Reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        text TEXT NOT NULL,
        source VARCHAR(50) NOT NULL,
        location_id INT REFERENCES locations(id),
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Requests table (Contact/Inquiry)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        message TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Catering requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS catering_requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        event_date DATE NOT NULL,
        guest_count INT NOT NULL,
        budget DECIMAL(12, 2),
        message TEXT,
        note TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`ALTER TABLE catering_requests ADD COLUMN IF NOT EXISTS note TEXT`);

    // Career vacancies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vacancies (
        id SERIAL PRIMARY KEY,
        position VARCHAR(255) NOT NULL,
        position_ru VARCHAR(255),
        position_uz VARCHAR(255),
        position_en VARCHAR(255),
        position_tr VARCHAR(255),
        department VARCHAR(100) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        employment_type VARCHAR(50) NOT NULL,
        salary VARCHAR(100),
        description_ru TEXT,
        description_uz TEXT,
        description_en TEXT,
        description_tr TEXT,
        requirements_ru TEXT,
        requirements_uz TEXT,
        requirements_en TEXT,
        requirements_tr TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migrations for vacancies: multilingual position fields
    const vacancyCols = [
      'position_ru VARCHAR(255)',
      'position_uz VARCHAR(255)',
      'position_en VARCHAR(255)',
      'position_tr VARCHAR(255)',
    ];
    for (const col of vacancyCols) {
      const colName = col.split(' ')[0];
      const colType = col.split(' ').slice(1).join(' ');
      await pool.query(`ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS ${colName} ${colType}`);
    }

    // Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        vacancy_id INT NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
        location_id INT REFERENCES locations(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        experience TEXT,
        message TEXT,
        note TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migrations for applications table
    await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS note TEXT`);
    await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS location_id INT REFERENCES locations(id) ON DELETE SET NULL`);

    // FAQ table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faq (
        id SERIAL PRIMARY KEY,
        question_ru VARCHAR(500) NOT NULL,
        question_uz VARCHAR(500),
        question_en VARCHAR(500),
        question_tr VARCHAR(500),
        answer_ru TEXT NOT NULL,
        answer_uz TEXT,
        answer_en TEXT,
        answer_tr TEXT,
        category VARCHAR(50) NOT NULL,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT,
        sections INT DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migrations for pages: multilingual titles + base SEO fields
    const pageCols = [
      'title_ru VARCHAR(255)',
      'title_uz VARCHAR(255)',
      'title_en VARCHAR(255)',
      'title_tr VARCHAR(255)',
      'meta_title VARCHAR(255)',
      'meta_description TEXT',
      'og_image VARCHAR(500)',
    ];
    for (const col of pageCols) {
      const colName = col.split(' ')[0];
      const colType = col.split(' ').slice(1).join(' ');
      await pool.query(`ALTER TABLE pages ADD COLUMN IF NOT EXISTS ${colName} ${colType}`);
    }

    // Safe migrations for pages: multilingual meta_title + meta_description (8 new columns)
    const pageMetaLangCols = [
      'meta_title_ru VARCHAR(255)',
      'meta_title_uz VARCHAR(255)',
      'meta_title_en VARCHAR(255)',
      'meta_title_tr VARCHAR(255)',
      'meta_description_ru TEXT',
      'meta_description_uz TEXT',
      'meta_description_en TEXT',
      'meta_description_tr TEXT',
    ];
    for (const col of pageMetaLangCols) {
      const colName = col.split(' ')[0];
      const colType = col.split(' ').slice(1).join(' ');
      await pool.query(`ALTER TABLE pages ADD COLUMN IF NOT EXISTS ${colName} ${colType}`);
    }

    // Media categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default media categories
    const defaultMediaCategories = ['Menu', 'Catering', 'Beverages', 'Desserts', 'Brand', 'Interior'];
    for (const name of defaultMediaCategories) {
      await pool.query(
        'INSERT INTO media_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [name]
      );
    }

    // Media table (with category_id FK)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_size INT,
        file_type VARCHAR(50),
        category_id INT REFERENCES media_categories(id) ON DELETE SET NULL,
        uploaded_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migration: add category_id column to existing media table
    await pool.query(`ALTER TABLE media ADD COLUMN IF NOT EXISTS category_id INT REFERENCES media_categories(id) ON DELETE SET NULL`);

    // Activity log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id INT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ Database tables created successfully');

    // Insert default admin user
    // NOTE: This is a placeholder hash. Run `node reset-password.js` after init
    // to set a real password for the admin account.
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ('Admin', 'admin@madouz.uz', '$2a$10$YmTj7Gy9u1.5S8Z5O0Dkz.5dZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'admin', 'active')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✓ Default admin user inserted (run reset-password.js to set a real password!)');

    // Insert default settings
    const defaultSettings = {
      siteName: 'MADO UZ',
      defaultLang: 'Russian',
      timezone: 'Asia/Tashkent',
      phone: '+998 71 123 45 67',
      email: 'hello@madouz.uz',
      currency: 'UZS',
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await pool.query(`
        INSERT INTO settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO NOTHING
      `, [key, String(value)]);
    }

    console.log('✓ Default settings inserted');

    // ── Catering content seed (stored in settings table) ──────────────────────
    // The catering route reads keys: catering_content_ru, catering_content_uz,
    // catering_content_en, catering_content_tr from the settings table.
    // Without these rows the admin content editor shows a blank form on first load.
    const cateringContentDefaults = {
      catering_content_ru: {
        headline: 'Кейтеринг MADO',
        subheadline: 'Для любых мероприятий',
        description: 'Мы организуем кейтеринг для корпоративных мероприятий, свадеб, дней рождения и частных вечеринок.',
        cta: 'Оставить заявку',
      },
      catering_content_uz: {
        headline: 'MADO Keytring',
        subheadline: 'Har qanday tadbir uchun',
        description: "Biz korporativ tadbirlar, to'ylar, tug'ilgan kunlar va xususiy partiyalar uchun keytering tashkil qilamiz.",
        cta: 'Ariza qoldirish',
      },
      catering_content_en: {
        headline: 'MADO Catering',
        subheadline: 'For any occasion',
        description: 'We organise catering for corporate events, weddings, birthdays and private parties.',
        cta: 'Send a request',
      },
      catering_content_tr: {
        headline: 'MADO Catering',
        subheadline: 'Her etkinlik için',
        description: 'Kurumsal etkinlikler, düğünler, doğum günleri ve özel partiler için catering organize ediyoruz.',
        cta: 'Talep gönderin',
      },
    };

    for (const [key, value] of Object.entries(cateringContentDefaults)) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [key, JSON.stringify(value)]
      );
    }

    console.log('✓ Catering content defaults inserted');
    console.log('Database initialization complete!');
    console.log('');
    console.log('IMPORTANT: Run `node reset-password.js` to set a real admin password.');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

initDb();
