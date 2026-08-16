import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all dishes with filters
router.get('/', async (req, res) => {
  const { category, tab, status } = req.query;

  let query = `
    SELECT d.id, d.name_ru, d.name_uz, d.name_en, d.name_tr, 
           d.description_ru, d.price, d.image_url, d.status,
           d.is_new, d.is_signature, d.is_vegetarian, d.is_spicy,
           c.label as category, c.tab
    FROM dishes d
    JOIN menu_categories c ON d.category_id = c.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (category) {
    paramCount++;
    query += ` AND d.category_id = $${paramCount}`;
    params.push(category);
  }

  if (tab) {
    paramCount++;
    query += ` AND c.tab = $${paramCount}`;
    params.push(tab);
  }

  if (status) {
    paramCount++;
    query += ` AND d.status = $${paramCount}`;
    params.push(status);
  }

  query += ' ORDER BY c.tab, d.position';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Get single dish
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`
    SELECT d.*, c.label as category, c.tab
    FROM dishes d
    JOIN menu_categories c ON d.category_id = c.id
    WHERE d.id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Dish not found' });
  }

  res.json(result.rows[0]);
});

// Create dish
router.post('/', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const {
    category_id,
    name_ru, name_uz, name_en, name_tr,
    description_ru, description_uz, description_en, description_tr,
    price, image_url, status = 'published',
    is_new = false, is_signature = false, is_vegetarian = false, is_spicy = false
  } = req.body;

  if (!category_id || !name_ru || !price) {
    return res.status(400).json({ error: 'Category, name, and price required' });
  }

  const result = await pool.query(`
    INSERT INTO dishes (
      category_id, name_ru, name_uz, name_en, name_tr,
      description_ru, description_uz, description_en, description_tr,
      price, image_url, status, is_new, is_signature, is_vegetarian, is_spicy
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING id, name_ru, price, status
  `, [
    category_id, name_ru, name_uz, name_en, name_tr,
    description_ru, description_uz, description_en, description_tr,
    price, image_url, status, is_new, is_signature, is_vegetarian, is_spicy
  ]);

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'create', 'dish', result.rows[0].id, `Created dish: ${name_ru}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update dish
router.put('/:id', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const {
    name_ru, name_uz, name_en, name_tr,
    description_ru, description_uz, description_en, description_tr,
    price, image_url, status,
    is_new, is_signature, is_vegetarian, is_spicy
  } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 0;

  const fieldsMap = {
    name_ru, name_uz, name_en, name_tr,
    description_ru, description_uz, description_en, description_tr,
    price, image_url, status, is_new, is_signature, is_vegetarian, is_spicy
  };

  Object.entries(fieldsMap).forEach(([key, value]) => {
    if (value !== undefined) {
      paramCount++;
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  paramCount++;
  values.push(id);

  const query = `UPDATE dishes SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING id, name_ru, price, status`;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Dish not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'dish', id, `Updated dish: ${name_ru || 'Unknown'}`]
  );

  res.json(result.rows[0]);
});

// Delete dish
router.delete('/:id', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM dishes WHERE id = $1 RETURNING id, name_ru', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Dish not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'dish', id, `Deleted dish: ${result.rows[0].name_ru}`]
  );

  res.json({ message: 'Dish deleted' });
});

// Bulk update status
router.put('/bulk/status', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || !status) {
    return res.status(400).json({ error: 'IDs array and status required' });
  }

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const result = await pool.query(
    `UPDATE dishes SET status = $${ids.length + 1}, updated_at = NOW() WHERE id = ANY($${ids.length + 2}) RETURNING id`,
    [...ids, status, ids]
  );

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
    [req.user.id, 'bulk_update', 'dish', `Updated status to ${status} for ${ids.length} dishes`]
  );

  res.json({ updated: result.rowCount });
});

export default router;
