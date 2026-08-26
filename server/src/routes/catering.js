import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Allowed statuses for catering requests
const VALID_CATERING_STATUSES = ['new', 'confirmed', 'in_progress', 'completed', 'rejected', 'cancelled'];

// Get all catering requests (requires auth — contains sensitive client data)
router.get('/requests', authenticate, authorize(['admin', 'restaurant_manager']), async (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT id, name, phone, email, event_type, event_date, guest_count, budget, message, note, status, created_at
    FROM catering_requests
  `;
  const params = [];

  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Get single catering request (requires auth)
router.get('/requests/:id', authenticate, authorize(['admin', 'restaurant_manager']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`
    SELECT id, name, phone, email, event_type, event_date, guest_count, budget, message, note, status, created_at
    FROM catering_requests
    WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json(result.rows[0]);
});

// Create catering request (public — clients submit from website)
router.post('/requests', async (req, res) => {
  const { name, phone, email, event_type, event_date, guest_count, budget, message } = req.body;

  if (!name || !phone || !email || !event_type || !event_date || !guest_count) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const result = await pool.query(`
    INSERT INTO catering_requests (name, phone, email, event_type, event_date, guest_count, budget, message, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new')
    RETURNING id, name, event_type
  `, [name, phone, email, event_type, event_date, guest_count, budget || null, message || null]);

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [null, 'received', 'catering_request', result.rows[0].id, `New catering request from ${name}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update catering request status (validate against whitelist)
router.patch('/requests/:id/status', authenticate, authorize(['admin', 'restaurant_manager']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  if (!VALID_CATERING_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Allowed values: ${VALID_CATERING_STATUSES.join(', ')}`
    });
  }

  const result = await pool.query(
    'UPDATE catering_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status',
    [status, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'catering_request', id, `Changed catering request status to ${status}`]
  );

  res.json(result.rows[0]);
});

// Update internal note for a catering request
router.patch('/requests/:id/note', authenticate, authorize(['admin', 'restaurant_manager']), async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (note === undefined) {
    return res.status(400).json({ error: 'Note field required' });
  }

  const result = await pool.query(
    'UPDATE catering_requests SET note = $1, updated_at = NOW() WHERE id = $2 RETURNING id, note',
    [note || null, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json(result.rows[0]);
});

// Get catering page content (public)
router.get('/content', async (req, res) => {
  const lang = req.query.lang || 'ru';
  const result = await pool.query('SELECT value FROM settings WHERE key = $1', [`catering_content_${lang}`]);

  const defaultContent = {
    ru: { headline: 'Кейтеринг MADO', subheadline: 'Для любых мероприятий', description: 'Мы организуем кейтеринг для корпоративных мероприятий, свадеб, дней рождения и частных вечеринок.', cta: 'Оставить заявку' },
    uz: { headline: 'MADO Keytring', subheadline: 'Har qanday tadbir uchun', description: "Biz korporativ tadbirlar, to'ylar, tug'ilgan kunlar va xususiy partiyalar uchun keytering tashkil qilamiz.", cta: 'Ariza qoldirish' },
    en: { headline: 'MADO Catering', subheadline: 'For any occasion', description: 'We organise catering for corporate events, weddings, birthdays and private parties.', cta: 'Send a request' },
    tr: { headline: 'MADO Catering', subheadline: 'Her etkinlik için', description: 'Kurumsal etkinlikler, düğünler, doğum günleri ve özel partiler için catering organize ediyoruz.', cta: 'Talep gönderin' },
  };

  if (result.rows.length === 0) {
    return res.json(defaultContent[lang] || defaultContent.en);
  }

  res.json(JSON.parse(result.rows[0].value));
});

// Update catering page content
router.put('/content', authenticate, authorize(['admin', 'restaurant_manager']), async (req, res) => {
  const { lang, content } = req.body;

  if (!lang || !content) {
    return res.status(400).json({ error: 'Lang and content required' });
  }

  await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
    [`catering_content_${lang}`, JSON.stringify(content)]
  );

  res.json({ message: 'Content updated' });
});

export default router;
