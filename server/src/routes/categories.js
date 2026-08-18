import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  const tab = req.query.tab;
  
  let query = 'SELECT id, label, tab, position FROM menu_categories ORDER BY tab, position';
  const params = [];

  if (tab) {
    query = 'SELECT id, label, tab, position FROM menu_categories WHERE tab = $1 ORDER BY position';
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

  const catResult = await pool.query('SELECT id, label, tab FROM menu_categories WHERE id = $1', [id]);
  
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
  const { label, tab } = req.body;

  if (!label || !tab) {
    return res.status(400).json({ error: 'Label and tab required' });
  }

  const result = await pool.query(
    'INSERT INTO menu_categories (label, tab, position) VALUES ($1, $2, (SELECT COALESCE(MAX(position), -1) + 1 FROM menu_categories WHERE tab = $2)) RETURNING id, label, tab, position',
    [label, tab]
  );

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'create', 'category', result.rows[0].id, `Created category: ${label}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update category
router.put('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const { label } = req.body;

  if (!label) {
    return res.status(400).json({ error: 'Label required' });
  }

  const result = await pool.query(
    'UPDATE menu_categories SET label = $1, updated_at = NOW() WHERE id = $2 RETURNING id, label, tab, position',
    [label, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'category', id, `Updated category: ${label}`]
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
