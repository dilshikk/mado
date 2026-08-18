import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all applications
router.get('/', async (req, res) => {
  const { vacancy_id, status } = req.query;

  let query = `
    SELECT a.id, a.vacancy_id, a.name, a.phone, a.email, a.experience,
           a.message, a.note, a.status, a.created_at,
           v.position, v.position_ru, v.position_uz, v.position_en, v.position_tr, v.branch
    FROM applications a
    JOIN vacancies v ON a.vacancy_id = v.id
  `;
  const params = [];
  let paramCount = 0;

  if (vacancy_id || status) {
    const conditions = [];
    if (vacancy_id) {
      paramCount++;
      conditions.push(`a.vacancy_id = $${paramCount}`);
      params.push(vacancy_id);
    }
    if (status) {
      paramCount++;
      conditions.push(`a.status = $${paramCount}`);
      params.push(status);
    }
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY a.created_at DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Get single application
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`
    SELECT a.*, v.position, v.position_ru, v.position_uz, v.position_en, v.position_tr, v.branch
    FROM applications a
    JOIN vacancies v ON a.vacancy_id = v.id
    WHERE a.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }

  res.json(result.rows[0]);
});

// Create application (public endpoint)
router.post('/', async (req, res) => {
  const { vacancy_id, name, phone, email, experience, message } = req.body;

  if (!vacancy_id || !name || !phone || !email) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Validate vacancy exists
  const vacancyCheck = await pool.query(
    'SELECT id FROM vacancies WHERE id = $1 AND status = $2',
    [vacancy_id, 'published']
  );
  if (vacancyCheck.rows.length === 0) {
    return res.status(404).json({ error: 'Vacancy not found or not active' });
  }

  const result = await pool.query(`
    INSERT INTO applications (vacancy_id, name, phone, email, experience, message, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'new')
    RETURNING id, name, vacancy_id
  `, [vacancy_id, name, phone, email, experience || null, message || null]);

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [null, 'received', 'application', result.rows[0].id, `New application from ${name}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update application status
router.patch('/:id/status', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  const result = await pool.query(
    'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status',
    [status, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'application', id, `Changed application status to ${status}`]
  );

  res.json(result.rows[0]);
});

// Save internal note for application
router.patch('/:id/note', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  const result = await pool.query(
    'UPDATE applications SET note = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
    [note || null, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }

  res.json({ message: 'Note saved' });
});

// Delete application
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM applications WHERE id = $1 RETURNING id, name',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Application not found' });
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'application', id, `Deleted application from ${result.rows[0].name}`]
  );

  res.json({ message: 'Application deleted' });
});

export default router;
