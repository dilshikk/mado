import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { runSeedBeverages } from '../db/seed-beverages.js';
import { runSeedKitchen } from '../db/seed-kitchen.js';
import { runSeedDesserts } from '../db/seed-desserts.js';

const router = express.Router();

// Get all dishes with filters
router.get('/', async (req, res) => {
  const { category, tab, status } = req.query;

  let query = `
    SELECT d.id, d.category_id, d.name_ru, d.name_uz, d.name_en, d.name_tr,
           d.description_ru, d.description_uz, d.description_en, d.description_tr,
           d.price, d.image_url, d.status,
           d.is_new, d.is_signature, d.is_vegetarian, d.is_spicy,
           c.label as category, c.label_ru as category_label_ru, c.label_uz as category_label_uz,
           c.label_en as category_label_en, c.label_tr as category_label_tr, c.tab
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

  query += ' ORDER BY c.position, d.position';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Seed endpoints — must be defined BEFORE /:id so Express does not treat
// "seed-beverages" / "seed-kitchen" / "seed-desserts" as an id parameter.
router.post('/seed-beverages', authenticate, authorize(['admin']), async (req, res) => {
  const result = await runSeedBeverages();
  res.json(result);
});

router.post('/seed-kitchen', authenticate, authorize(['admin']), async (req, res) => {
  const result = await runSeedKitchen();
  res.json(result);
});

router.post('/seed-desserts', authenticate, authorize(['admin']), async (req, res) => {
  const result = await runSeedDesserts();
  res.json(result);
});

// Bulk status update — also defined before /:id
router.put('/bulk/status', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { ids, status } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
    return res.status(400).json({ error: 'IDs array and status required' });
  }

  // Pass status as $1 and the ids array as $2 for ANY($2).
  // Do NOT spread ids as individual params — ANY() expects a single array param.
  const result = await pool.query(
    `UPDATE dishes SET status = $1 WHERE id = ANY($2) RETURNING id`,
    [status, ids]
  );

  // Log the activity — wrapped in try/catch so a missing table never breaks the response.
  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'bulk_update', 'dish', `Updated status to ${status} for ${ids.length} dishes`]
    );
  } catch (_) {
    // activity_log is non-critical
  }

  res.json({ updated: result.rowCount });
});

// Reorder dishes within a category — accepts { categoryId, orderedIds }.
// Also defined before /:id.
router.put('/reorder/category', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { categoryId, orderedIds } = req.body;

  if (!categoryId || !Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ error: 'categoryId and orderedIds array are required' });
  }

  await Promise.all(
    orderedIds.map((dishId, index) =>
      pool.query('UPDATE dishes SET position = $1 WHERE id = $2 AND category_id = $3', [index, dishId, categoryId])
    )
  );

  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update', 'dish', `Reordered dishes in category ${categoryId}`]
    );
  } catch (_) {
    // activity_log is non-critical
  }

  const result = await pool.query(
    'SELECT id, name_ru, position FROM dishes WHERE category_id = $1 ORDER BY position',
    [categoryId]
  );
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
router.post('/', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const {
    category_id,
    name_ru, name_uz, name_en, name_tr,
    description_ru, description_uz, description_en, description_tr,
    price, image_url, status = 'published',
    is_new = false, is_signature = false, is_vegetarian = false, is_spicy = false
  } = req.body;

  const normalizedNames = [name_ru, name_uz, name_en, name_tr].map((value) => typeof value === 'string' ? value.trim() : '');
  const primaryName = normalizedNames.find((value) => value.length > 0) || '';

  if (!category_id || !price || !primaryName) {
    return res.status(400).json({ error: 'Category, price, and at least one localized name are required' });
  }

  const fallbackNameRu = name_ru && String(name_ru).trim() ? String(name_ru).trim() : primaryName;

  const result = await pool.query(`
    INSERT INTO dishes (
      category_id, name_ru, name_uz, name_en, name_tr,
      description_ru, description_uz, description_en, description_tr,
      price, image_url, status, is_new, is_signature, is_vegetarian, is_spicy
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING id, name_ru, price, status
  `, [
    category_id, fallbackNameRu, name_uz, name_en, name_tr,
    description_ru, description_uz, description_en, description_tr,
    price, image_url, status, is_new, is_signature, is_vegetarian, is_spicy
  ]);

  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'dish', result.rows[0].id, `Created dish: ${fallbackNameRu}`]
    );
  } catch (_) {
    // activity_log is non-critical
  }

  res.status(201).json(result.rows[0]);
});

// Update dish
router.put('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const {
    name_ru, name_uz, name_en, name_tr,
    description_ru, description_uz, description_en, description_tr,
    price, image_url, status,
    is_new, is_signature, is_vegetarian, is_spicy,
    category_id,
  } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 0;

  const fieldsMap = {
    category_id,
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

  const query = `UPDATE dishes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name_ru, price, status`;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Dish not found' });
  }

  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update', 'dish', id, `Updated dish: ${name_ru || 'Unknown'}`]
    );
  } catch (_) {
    // activity_log is non-critical
  }

  res.json(result.rows[0]);
});

// Delete dish
router.delete('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM dishes WHERE id = $1 RETURNING id, name_ru', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Dish not found' });
  }

  try {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'dish', id, `Deleted dish: ${result.rows[0].name_ru}`]
    );
  } catch (_) {
    // activity_log is non-critical
  }

  res.json({ message: 'Dish deleted' });
});

export default router;
