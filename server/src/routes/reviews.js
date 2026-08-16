import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews
router.get('/', async (req, res) => {
  const { status, location_id } = req.query;

  let query = 'SELECT id, author_name, rating, text, source, location_id, status, created_at FROM reviews';
  const params = [];
  let paramCount = 0;

  if (status || location_id) {
    const conditions = [];
    if (status) {
      paramCount++;
      conditions.push(`status = $${paramCount}`);
      params.push(status);
    }
    if (location_id) {
      paramCount++;
      conditions.push(`location_id = $${paramCount}`);
      params.push(location_id);
    }
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Get review stats
router.get('/stats/summary', async (req, res) => {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
      COUNT(CASE WHEN status = 'new' THEN 1 END) as new,
      ROUND(AVG(CASE WHEN status = 'approved' THEN rating ELSE NULL END)::numeric, 1) as avg_rating
    FROM reviews
  `);

  const ratingDist = await pool.query(`
    SELECT rating, COUNT(*) as count
    FROM reviews
    WHERE status = 'approved'
    GROUP BY rating
    ORDER BY rating DESC
  `);

  res.json({
    stats: result.rows[0],
    ratingDistribution: ratingDist.rows
  });
});

// Create review
router.post('/', async (req, res) => {
  const { author_name, rating, text, source, location_id } = req.body;

  if (!author_name || !rating || !text || !source) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const result = await pool.query(`
    INSERT INTO reviews (author_name, rating, text, source, location_id, status)
    VALUES ($1, $2, $3, $4, $5, 'new')
    RETURNING id, author_name, rating
  `, [author_name, rating, text, source, location_id || null]);

  res.status(201).json(result.rows[0]);
});

// Update review status
router.patch('/:id/status', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  const result = await pool.query(
    'UPDATE reviews SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status',
    [status, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Review not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'review', id, `Changed review status to ${status}`]
  );

  res.json(result.rows[0]);
});

// Delete review
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING id, author_name', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Review not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'review', id, `Deleted review by ${result.rows[0].author_name}`]
  );

  res.json({ message: 'Review deleted' });
});

export default router;
