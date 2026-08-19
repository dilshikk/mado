import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Shared list of new multilingual meta columns
const META_LANG_COLS = [
  'meta_title_ru', 'meta_title_uz', 'meta_title_en', 'meta_title_tr',
  'meta_description_ru', 'meta_description_uz', 'meta_description_en', 'meta_description_tr',
];

// Get all pages
router.get('/', async (req, res) => {
  const { status } = req.query;
  let query = `SELECT id, title, title_ru, title_uz, title_en, title_tr, slug, status, sections,
    meta_title, meta_description, og_image,
    meta_title_ru, meta_title_uz, meta_title_en, meta_title_tr,
    meta_description_ru, meta_description_uz, meta_description_en, meta_description_tr,
    created_at, updated_at FROM pages`;
  const params = [];
  if (status) {
    query += ` WHERE status = $1`;
    params.push(status);
  }
  query += ` ORDER BY title`;
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Get single page by slug (public — no auth)
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const result = await pool.query(
    `SELECT id, title, title_ru, title_uz, title_en, title_tr, slug, content, status, sections,
      meta_title, meta_description, og_image,
      meta_title_ru, meta_title_uz, meta_title_en, meta_title_tr,
      meta_description_ru, meta_description_uz, meta_description_en, meta_description_tr
    FROM pages WHERE slug = $1`,
    [slug]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Page not found' });
  }
  res.json(result.rows[0]);
});

// Create page
router.post('/', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const {
    title, title_ru, title_uz, title_en, title_tr,
    slug, content, status = 'published', sections = 0,
    meta_title, meta_description, og_image,
    meta_title_ru, meta_title_uz, meta_title_en, meta_title_tr,
    meta_description_ru, meta_description_uz, meta_description_en, meta_description_tr,
  } = req.body;

  if (!title || slug === undefined) {
    return res.status(400).json({ error: 'Title and slug required' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO pages (
        title, title_ru, title_uz, title_en, title_tr, slug, content, status, sections,
        meta_title, meta_description, og_image,
        meta_title_ru, meta_title_uz, meta_title_en, meta_title_tr,
        meta_description_ru, meta_description_uz, meta_description_en, meta_description_tr
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING id, title, slug
    `, [
      title, title_ru || null, title_uz || null, title_en || null, title_tr || null,
      slug, content || null, status, sections,
      meta_title || null, meta_description || null, og_image || null,
      meta_title_ru || null, meta_title_uz || null, meta_title_en || null, meta_title_tr || null,
      meta_description_ru || null, meta_description_uz || null, meta_description_en || null, meta_description_tr || null,
    ]);

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
router.put('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const {
    title, title_ru, title_uz, title_en, title_tr,
    content, status, sections,
    meta_title, meta_description, og_image,
    meta_title_ru, meta_title_uz, meta_title_en, meta_title_tr,
    meta_description_ru, meta_description_uz, meta_description_en, meta_description_tr,
  } = req.body;

  await pool.query(`
    UPDATE pages SET
      title = $1, title_ru = $2, title_uz = $3, title_en = $4, title_tr = $5,
      content = $6, status = $7, sections = $8,
      meta_title = $9, meta_description = $10, og_image = $11,
      meta_title_ru = $12, meta_title_uz = $13, meta_title_en = $14, meta_title_tr = $15,
      meta_description_ru = $16, meta_description_uz = $17, meta_description_en = $18, meta_description_tr = $19,
      updated_at = NOW()
    WHERE id = $20
  `, [
    title, title_ru || null, title_uz || null, title_en || null, title_tr || null,
    content || null, status, sections || 0,
    meta_title || null, meta_description || null, og_image || null,
    meta_title_ru || null, meta_title_uz || null, meta_title_en || null, meta_title_tr || null,
    meta_description_ru || null, meta_description_uz || null, meta_description_en || null, meta_description_tr || null,
    id,
  ]);

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

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'page', id, `Deleted page: ${result.rows[0].title}`]
  );

  res.json({ message: 'Page deleted' });
});

export default router;
