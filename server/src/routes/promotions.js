import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all promotions
router.get('/', async (req, res) => {
  const { status } = req.query;

  let query = 'SELECT id, title, description, image_url, start_date, end_date, status, created_at FROM promotions';
  const params = [];

  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }

  query += ' ORDER BY start_date DESC';

  const result = await pool.query(query, params);

  // Get pages for each promotion
  const promos = await Promise.all(result.rows.map(async (promo) => {
    const pagesResult = await pool.query('SELECT page FROM promotion_pages WHERE promotion_id = $1', [promo.id]);
    return {
      ...promo,
      pages: pagesResult.rows.map(p => p.page)
    };
  }));

  res.json(promos);
});

// Get single promotion
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('SELECT * FROM promotions WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  const pagesResult = await pool.query('SELECT page FROM promotion_pages WHERE promotion_id = $1', [id]);

  res.json({
    ...result.rows[0],
    pages: pagesResult.rows.map(p => p.page)
  });
});

// Create promotion
router.post('/', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { title, description, image_url, start_date, end_date, status = 'draft', pages = [] } = req.body;

  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: 'Title, start_date, and end_date required' });
  }

  const result = await pool.query(`
    INSERT INTO promotions (title, description, image_url, start_date, end_date, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, title
  `, [title, description, image_url, start_date, end_date, status]);

  const promoId = result.rows[0].id;

  // Insert pages
  for (const page of pages) {
    await pool.query('INSERT INTO promotion_pages (promotion_id, page) VALUES ($1, $2)', [promoId, page]);
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'create', 'promotion', promoId, `Created promotion: ${title}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update promotion
router.put('/:id', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const { title, description, image_url, start_date, end_date, status, pages = [] } = req.body;

  await pool.query(`
    UPDATE promotions SET title = $1, description = $2, image_url = $3, start_date = $4, end_date = $5, status = $6, updated_at = NOW()
    WHERE id = $7
  `, [title, description, image_url, start_date, end_date, status, id]);

  // Update pages
  await pool.query('DELETE FROM promotion_pages WHERE promotion_id = $1', [id]);
  for (const page of pages) {
    await pool.query('INSERT INTO promotion_pages (promotion_id, page) VALUES ($1, $2)', [id, page]);
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'promotion', id, `Updated promotion: ${title}`]
  );

  res.json({ message: 'Promotion updated' });
});

// Delete promotion
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM promotions WHERE id = $1 RETURNING id, title', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Promotion not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'promotion', id, `Deleted promotion: ${result.rows[0].title}`]
  );

  res.json({ message: 'Promotion deleted' });
});

export default router;
