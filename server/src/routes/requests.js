import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Allowed statuses for requests
const VALID_REQUEST_STATUSES = ['new', 'in_progress', 'completed', 'rejected'];

// Get all requests (requires auth — contains sensitive client data)
router.get('/', authenticate, authorize(['admin', 'marketing']), async (req, res) => {
  const { type, status } = req.query;

  let query = 'SELECT id, type, name, phone, email, message, status, created_at FROM requests';
  const params = [];
  let paramCount = 0;

  if (type || status) {
    const conditions = [];
    if (type) {
      paramCount++;
      conditions.push(`type = $${paramCount}`);
      params.push(type);
    }
    if (status) {
      paramCount++;
      conditions.push(`status = $${paramCount}`);
      params.push(status);
    }
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Get request stats (requires auth)
router.get('/stats/summary', authenticate, authorize(['admin', 'marketing']), async (req, res) => {
  const typeStats = await pool.query(`
    SELECT type, COUNT(*) as total, COUNT(CASE WHEN status = 'new' THEN 1 END) as new
    FROM requests
    GROUP BY type
  `);

  res.json(typeStats.rows);
});

// Create request (public — clients submit from website)
router.post('/', async (req, res) => {
  const { type, name, phone, email, message } = req.body;

  if (!type || !name || !phone) {
    return res.status(400).json({ error: 'Type, name, and phone required' });
  }

  const result = await pool.query(`
    INSERT INTO requests (type, name, phone, email, message, status)
    VALUES ($1, $2, $3, $4, $5, 'new')
    RETURNING id, type, name
  `, [type, name, phone, email || null, message || null]);

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [null, 'received', 'request', result.rows[0].id, `New ${type} request from ${name}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update request status (validate against whitelist)
router.patch('/:id/status', authenticate, authorize(['admin', 'marketing']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  if (!VALID_REQUEST_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Allowed values: ${VALID_REQUEST_STATUSES.join(', ')}`
    });
  }

  const result = await pool.query(
    'UPDATE requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status',
    [status, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'request', id, `Changed request status to ${status}`]
  );

  res.json(result.rows[0]);
});

// Delete request
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM requests WHERE id = $1 RETURNING id, type, name', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Request not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'request', id, `Deleted ${result.rows[0].type} request from ${result.rows[0].name}`]
  );

  res.json({ message: 'Request deleted' });
});

export default router;
