import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const SECTION_FIELDS = 'id, slug, label, label_ru, label_uz, label_en, label_tr, position';

// Get all sections, ordered by position
router.get('/', async (req, res) => {
  const result = await pool.query(`SELECT ${SECTION_FIELDS} FROM menu_sections ORDER BY position`);

  // Category count for each section
  const sectionsWithCounts = await Promise.all(result.rows.map(async (section) => {
    const countResult = await pool.query('SELECT COUNT(*) FROM menu_categories WHERE section_id = $1', [section.id]);
    return {
      ...section,
      categoryCount: parseInt(countResult.rows[0].count),
    };
  }));

  res.json(sectionsWithCounts);
});

// Get single section
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`SELECT ${SECTION_FIELDS} FROM menu_sections WHERE id = $1`, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Section not found' });
  }

  res.json(result.rows[0]);
});

// Create section
router.post('/', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { slug, label_ru, label_uz, label_en, label_tr } = req.body;

  const normalizedLabels = [label_ru, label_uz, label_en, label_tr].map((value) => typeof value === 'string' ? value.trim() : '');
  const primaryLabel = normalizedLabels.find((value) => value.length > 0) || '';
  const normalizedSlug = typeof slug === 'string' ? slug.trim().toLowerCase() : '';

  if (!primaryLabel || !normalizedSlug) {
    return res.status(400).json({ error: 'Slug and at least one localized name are required' });
  }

  const fallbackLabelRu = label_ru && String(label_ru).trim() ? String(label_ru).trim() : primaryLabel;

  const result = await pool.query(
    `INSERT INTO menu_sections (slug, label, label_ru, label_uz, label_en, label_tr, position)
     VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(position), -1) + 1 FROM menu_sections))
     RETURNING ${SECTION_FIELDS}`,
    [normalizedSlug, fallbackLabelRu, label_ru, label_uz, label_en, label_tr]
  );

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'create', 'section', result.rows[0].id, `Created menu section: ${fallbackLabelRu}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update section (rename, change slug)
router.put('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const { slug, label_ru, label_uz, label_en, label_tr } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 0;

  const fieldsMap = { slug, label_ru, label_uz, label_en, label_tr };

  Object.entries(fieldsMap).forEach(([key, value]) => {
    if (value !== undefined) {
      paramCount++;
      updates.push(`${key} = $${paramCount}`);
      values.push(key === 'slug' ? String(value).trim().toLowerCase() : value);
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
    `UPDATE menu_sections SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING ${SECTION_FIELDS}`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Section not found' });
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'section', id, `Updated menu section: ${result.rows[0].label}`]
  );

  res.json(result.rows[0]);
});

// Reorder sections — accepts an ordered array of section IDs
router.put('/reorder/all', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ error: 'orderedIds array is required' });
  }

  await Promise.all(
    orderedIds.map((sectionId, index) =>
      pool.query('UPDATE menu_sections SET position = $1, updated_at = NOW() WHERE id = $2', [index, sectionId])
    )
  );

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
    [req.user.id, 'update', 'section', 'Reordered menu sections']
  );

  const result = await pool.query(`SELECT ${SECTION_FIELDS} FROM menu_sections ORDER BY position`);
  res.json(result.rows);
});

// Delete section
router.delete('/:id', authenticate, authorize(['admin', 'content_manager']), async (req, res) => {
  const { id } = req.params;

  // Categories referencing this section are kept, just unlinked (section_id -> NULL via FK ON DELETE SET NULL)
  const result = await pool.query('DELETE FROM menu_sections WHERE id = $1 RETURNING id, label', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Section not found' });
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'section', id, `Deleted menu section: ${result.rows[0].label}`]
  );

  res.json({ message: 'Section deleted' });
});

export default router;
