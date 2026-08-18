import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all vacancies (public + admin list)
router.get('/', async (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT id, position, position_ru, position_uz, position_en, position_tr,
           department, branch, employment_type, salary, status, created_at
    FROM vacancies
  `;
  const params = [];

  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);

  // Get application count for each vacancy
  const vacanciesWithCounts = await Promise.all(result.rows.map(async (vac) => {
    const appResult = await pool.query(
      'SELECT COUNT(*) FROM applications WHERE vacancy_id = $1',
      [vac.id]
    );
    return {
      ...vac,
      applicationCount: parseInt(appResult.rows[0].count),
    };
  }));

  res.json(vacanciesWithCounts);
});

// Get single vacancy (full detail)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`
    SELECT id, position, position_ru, position_uz, position_en, position_tr,
           department, branch, employment_type, salary, status,
           description_ru, description_uz, description_en, description_tr,
           requirements_ru, requirements_uz, requirements_en, requirements_tr,
           created_at, updated_at
    FROM vacancies
    WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Vacancy not found' });
  }

  // Count applications
  const appResult = await pool.query(
    'SELECT COUNT(*) FROM applications WHERE vacancy_id = $1',
    [id]
  );

  res.json({
    ...result.rows[0],
    applicationCount: parseInt(appResult.rows[0].count),
  });
});

// Create vacancy
router.post('/', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const {
    position, position_ru, position_uz, position_en, position_tr,
    department, branch, employment_type, salary, status = 'published',
    description_ru, description_uz, description_en, description_tr,
    requirements_ru, requirements_uz, requirements_en, requirements_tr,
  } = req.body;

  if (!position || !department || !branch || !employment_type) {
    return res.status(400).json({ error: 'Required fields missing: position, department, branch, employment_type' });
  }

  const result = await pool.query(`
    INSERT INTO vacancies (
      position, position_ru, position_uz, position_en, position_tr,
      department, branch, employment_type, salary, status,
      description_ru, description_uz, description_en, description_tr,
      requirements_ru, requirements_uz, requirements_en, requirements_tr
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id, position
  `, [
    position, position_ru || null, position_uz || null, position_en || null, position_tr || null,
    department, branch, employment_type, salary || null, status,
    description_ru || null, description_uz || null, description_en || null, description_tr || null,
    requirements_ru || null, requirements_uz || null, requirements_en || null, requirements_tr || null,
  ]);

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'create', 'vacancy', result.rows[0].id, `Created vacancy: ${position}`]
  );

  res.status(201).json(result.rows[0]);
});

// Update vacancy
router.put('/:id', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const {
    position, position_ru, position_uz, position_en, position_tr,
    department, branch, employment_type, salary, status,
    description_ru, description_uz, description_en, description_tr,
    requirements_ru, requirements_uz, requirements_en, requirements_tr,
  } = req.body;

  const result = await pool.query(`
    UPDATE vacancies SET
      position = $1, position_ru = $2, position_uz = $3, position_en = $4, position_tr = $5,
      department = $6, branch = $7, employment_type = $8, salary = $9, status = $10,
      description_ru = $11, description_uz = $12, description_en = $13, description_tr = $14,
      requirements_ru = $15, requirements_uz = $16, requirements_en = $17, requirements_tr = $18,
      updated_at = NOW()
    WHERE id = $19
    RETURNING id, position
  `, [
    position, position_ru || null, position_uz || null, position_en || null, position_tr || null,
    department, branch, employment_type, salary || null, status,
    description_ru || null, description_uz || null, description_en || null, description_tr || null,
    requirements_ru || null, requirements_uz || null, requirements_en || null, requirements_tr || null,
    id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Vacancy not found' });
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'vacancy', id, `Updated vacancy: ${position}`]
  );

  res.json({ message: 'Vacancy updated' });
});

// Delete vacancy
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM vacancies WHERE id = $1 RETURNING id, position',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Vacancy not found' });
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'vacancy', id, `Deleted vacancy: ${result.rows[0].position}`]
  );

  res.json({ message: 'Vacancy deleted' });
});

export default router;
