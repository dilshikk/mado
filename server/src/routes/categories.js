import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const CATEGORY_FIELDS = 'id, label, label_ru, label_uz, label_en, label_tr, tab, section_id, parent_id, image_url, position';

// Get all categories
router.get('/', async (req, res) => {
  const tab = req.query.tab;
  const sectionId = req.query.section_id;
  const parentId = req.query.parent_id;

  let query = `
    SELECT c.${CATEGORY_FIELDS.replace(/, /g, ', c.')},
           s.slug as section_slug, s.label as section_label,
           s.label_ru as section_label_ru, s.label_uz as section_label_uz,
           s.label_en as section_label_en, s.label_tr as section_label_tr,
           p.label as parent_label, p.label_ru as parent_label_ru, p.label_uz as parent_label_uz,
           p.label_en as parent_label_en, p.label_tr as parent_label_tr
    FROM menu_categories c
    LEFT JOIN menu_sections s ON c.section_id = s.id
    LEFT JOIN menu_categories p ON c.parent_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (tab) {
    params.push(tab);
    query += ` AND c.tab = $${params.length}`;
  }

  if (sectionId) {
    params.push(sectionId);
    query += ` AND c.section_id = $${params.length}`;
  }

  if (parentId === 'none') {
    query += ` AND c.parent_id IS NULL`;
  } else if (parentId) {
    params.push(parentId);
    query += ` AND c.parent_id = $${params.length}`;
  }

  query += ' ORDER BY c.position';

  const result = await pool.query(query, params);

  // Get dish count for each category
  const categoriesWithCounts = await Promise.all(result.rows.map(async (cat) => {
    const countResult = await pool.query('SELECT COUNT(*) FROM dishes WHERE category_id = $1', [cat.id]);
    const childCountResult = await pool.query('SELECT COUNT(*) FROM menu_categories WHERE parent_id = $1', [cat.id]);
    return {
      ...cat,
      dishCount: parseInt(countResult.rows[0].count),
      childCount: parseInt(childCountResult.rows[0].count),
    };
  }));

  res.json(categoriesWithCounts);
});

// Reorder all categories — accepts a fully ordered array of category IDs.
// Must be defined BEFORE /:id so Express does not treat "reorder" as an id param.
router.put('/reorder/all', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ error: 'orderedIds array is required' });
  }

  await Promise.all(
    orderedIds.map((categoryId, index) =>
      pool.query('UPDATE menu_categories SET position = $1, updated_at = NOW() WHERE id = $2', [index, categoryId])
    )
  );

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
    [req.user.id, 'update', 'category', 'Reordered menu categories']
  );

  const result = await pool.query(`SELECT ${CATEGORY_FIELDS} FROM menu_categories ORDER BY position`);
  res.json(result.rows);
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

  const childrenResult = await pool.query(
    `SELECT ${CATEGORY_FIELDS} FROM menu_categories WHERE parent_id = $1 ORDER BY position`,
    [id]
  );

  res.json({
    ...catResult.rows[0],
    dishes: dishesResult.rows,
    children: childrenResult.rows,
  });
});

// Create category
router.post('/', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { label_ru, label_uz, label_en, label_tr, tab, section_id, parent_id, image_url } = req.body;

  const normalizedLabels = [label_ru, label_uz, label_en, label_tr].map((value) => typeof value === 'string' ? value.trim() : '');
  const primaryLabel = normalizedLabels.find((value) => value.length > 0) || '';

  if (!primaryLabel || !tab) {
    return res.status(400).json({ error: 'At least one localized name and tab are required' });
  }

  if (parent_id) {
    const parentCheck = await pool.query('SELECT id FROM menu_categories WHERE id = $1', [parent_id]);
    if (parentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Parent category not found' });
    }
  }

  const fallbackLabelRu = label_ru && String(label_ru).trim() ? String(label_ru).trim() : primaryLabel;

  const positionResult = await pool.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM menu_categories WHERE tab = $1',
    [tab]
  );
  const nextPosition = positionResult.rows[0].next_position;

  const result = await pool.query(
    `INSERT INTO menu_categories (label, label_ru, label_uz, label_en, label_tr, tab, section_id, parent_id, image_url, position)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${CATEGORY_FIELDS}`,
    [fallbackLabelRu, label_ru, label_uz, label_en, label_tr, tab, section_id ?? null, parent_id ?? null, image_url, nextPosition]
  );

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'create', 'category', result.rows[0].id, `Created category: ${fallbackLabelRu}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update category
router.put('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const { label_ru, label_uz, label_en, label_tr, tab, section_id, parent_id, image_url } = req.body;

  if (parent_id !== undefined && parent_id !== null) {
    if (String(parent_id) === String(id)) {
      return res.status(400).json({ error: 'A category cannot be its own parent' });
    }
    const parentCheck = await pool.query('SELECT id FROM menu_categories WHERE id = $1', [parent_id]);
    if (parentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Parent category not found' });
    }
    let ancestorId = parent_id;
    for (let depth = 0; depth < 20 && ancestorId; depth++) {
      if (String(ancestorId) === String(id)) {
        return res.status(400).json({ error: 'Cannot set a descendant category as parent' });
      }
      const ancestorResult = await pool.query('SELECT parent_id FROM menu_categories WHERE id = $1', [ancestorId]);
      ancestorId = ancestorResult.rows[0]?.parent_id ?? null;
    }
  }

  const updates = [];
  const values = [];
  let paramCount = 0;

  const fieldsMap = { label_ru, label_uz, label_en, label_tr, tab, section_id, parent_id, image_url };

  Object.entries(fieldsMap).forEach(([key, value]) => {
    if (value !== undefined) {
      paramCount++;
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
    }
  });

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

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'category', id, `Deleted category: ${result.rows[0].label}`]
  );

  res.json({ message: 'Category deleted' });
});

export default router;
