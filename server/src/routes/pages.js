import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all pages
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT id, title, slug, status, sections, created_at, updated_at FROM pages ORDER BY title');
  res.json(result.rows);
});

// Get single page
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  const result = await pool.query('SELECT id, title, slug, content, status, sections FROM pages WHERE slug = $1', [slug]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Page not found' });
  }

  res.json(result.rows[0]);
});

// Create page
router.post('/', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { title, slug, content, status = 'published' } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: 'Title and slug required' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO pages (title, slug, content, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, slug
    `, [title, slug, content || null, status]);

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'page', result.rows[0].id, `Created page: ${title}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    throw error;
  }
});

// Update page
router.put('/:id', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const { title, content, status, sections } = req.body;

  await pool.query(`
    UPDATE pages SET title = $1, content = $2, status = $3, sections = $4, updated_at = NOW()
    WHERE id = $5
  `, [title, content, status, sections, id]);

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'page', id, `Updated page: ${title}`]
  );

  res.json({ message: 'Page updated' });
});

// Delete page
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM pages WHERE id = $1 RETURNING id, title', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Page not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'page', id, `Deleted page: ${result.rows[0].title}`]
  );

  res.json({ message: 'Page deleted' });
});

export default router;
