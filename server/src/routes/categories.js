import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const CATEGORY_FIELDS = 'id, label, label_ru, label_uz, label_en, label_tr, tab, image_url, position';

// Get all categories
router.get('/', async (req, res) => {
  const tab = req.query.tab;

  let query = `SELECT ${CATEGORY_FIELDS} FROM menu_categories ORDER BY tab, position`;
  const params = [];

  if (tab) {
    query = `SELECT ${CATEGORY_FIELDS} FROM menu_categories WHERE tab = $1 ORDER BY position`;
    params.push(tab);
  }

  const result = await pool.query(query, params);

  // Get dish count for each category
  const categoriesWithCounts = await Promise.all(result.rows.map(async (cat) => {
    const countResult = await pool.query('SELECT COUNT(*) FROM dishes WHERE category_id = $1', [cat.id]);
    return {
      ...cat,
      dishCount: parseInt(countResult.rows[0].count)
    };
  }));

  res.json(categoriesWithCounts);
});

// Get single category with dishes
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const catResult = await pool.query(`SELECT ${CATEGORY_FIELDS} FROM menu_categories WHERE id = $1`, [id]);

  if (catResult.rows.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const dishesResult = await pool.query(
    'SELECT id, name_ru, name_uz, name_en, name_tr, price, image_url, status FROM dishes WHERE category_id = $1 ORDER BY position',
    [id]
  );

  res.json({
    ...catResult.rows[0],
    dishes: dishesResult.rows
  });
});

// Create category
router.post('/', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { label_ru, label_uz, label_en, label_tr, tab, image_url } = req.body;

  const normalizedLabels = [label_ru, label_uz, label_en, label_tr].map((value) => typeof value === 'string' ? value.trim() : '');
  const primaryLabel = normalizedLabels.find((value) => value.length > 0) || '';

  if (!primaryLabel || !tab) {
    return res.status(400).json({ error: 'At least one localized name and tab are required' });
  }

  const fallbackLabelRu = label_ru && String(label_ru).trim() ? String(label_ru).trim() : primaryLabel;

  const result = await pool.query(
    `INSERT INTO menu_categories (label, label_ru, label_uz, label_en, label_tr, tab, image_url, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT COALESCE(MAX(position), -1) + 1 FROM menu_categories WHERE tab = $6))
     RETURNING ${CATEGORY_FIELDS}`,
    [fallbackLabelRu, label_ru, label_uz, label_en, label_tr, tab, image_url]
  );

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'create', 'category', result.rows[0].id, `Created category: ${fallbackLabelRu}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update category
router.put('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const { label_ru, label_uz, label_en, label_tr, tab, image_url } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 0;

  const fieldsMap = { label_ru, label_uz, label_en, label_tr, tab, image_url };

  Object.entries(fieldsMap).forEach(([key, value]) => {
    if (value !== undefined) {
      paramCount++;
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
    }
  });

  // Keep the legacy `label` column in sync with the primary localized name
  if (label_ru !== undefined || label_uz !== undefined || label_en !== undefined || label_tr !== undefined) {
    const normalizedLabels = [label_ru, label_uz, label_en, label_tr].map((value) => typeof value === 'string' ? value.trim() : '');
    const primaryLabel = normalizedLabels.find((value) => value.length > 0);
    if (primaryLabel) {
      paramCount++;
      updates.push(`label = $${paramCount}`);
      values.push(primaryLabel);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  paramCount++;
  values.push(id);

  const result = await pool.query(
    `UPDATE menu_categories SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING ${CATEGORY_FIELDS}`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'category', id, `Updated category: ${result.rows[0].label}`]
  );

  res.json(result.rows[0]);
});

// Delete category
router.delete('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM menu_categories WHERE id = $1 RETURNING id, label', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'category', id, `Deleted category: ${result.rows[0].label}`]
  );

  res.json({ message: 'Category deleted' });
});

export default router;
