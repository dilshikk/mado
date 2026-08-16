import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all vacancies
router.get('/', async (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT id, position, department, branch, employment_type, salary, status, created_at
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
    const appResult = await pool.query('SELECT COUNT(*) FROM applications WHERE vacancy_id = $1', [vac.id]);
    return {
      ...vac,
      applicationCount: parseInt(appResult.rows[0].count)
    };
  }));

  res.json(vacanciesWithCounts);
});

// Get single vacancy
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`
    SELECT id, position, department, branch, employment_type, salary, status,
           description_ru, description_uz, description_en, description_tr,
           requirements_ru, requirements_uz, requirements_en, requirements_tr
    FROM vacancies
    WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Vacancy not found' });
  }

  res.json(result.rows[0]);
});

// Create vacancy
router.post('/', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const {
    position, department, branch, employment_type, salary, status = 'published',
    description_ru, description_uz, description_en, description_tr,
    requirements_ru, requirements_uz, requirements_en, requirements_tr
  } = req.body;

  if (!position || !department || !branch || !employment_type) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const result = await pool.query(`
    INSERT INTO vacancies (
      position, department, branch, employment_type, salary, status,
      description_ru, description_uz, description_en, description_tr,
      requirements_ru, requirements_uz, requirements_en, requirements_tr
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id, position
  `, [
    position, department, branch, employment_type, salary, status,
    description_ru, description_uz, description_en, description_tr,
    requirements_ru, requirements_uz, requirements_en, requirements_tr
  ]);

  // Log activity
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
    position, department, branch, employment_type, salary, status,
    description_ru, description_uz, description_en, description_tr,
    requirements_ru, requirements_uz, requirements_en, requirements_tr
  } = req.body;

  await pool.query(`
    UPDATE vacancies SET
      position = $1, department = $2, branch = $3, employment_type = $4, salary = $5, status = $6,
      description_ru = $7, description_uz = $8, description_en = $9, description_tr = $10,
      requirements_ru = $11, requirements_uz = $12, requirements_en = $13, requirements_tr = $14,
      updated_at = NOW()
    WHERE id = $15
  `, [
    position, department, branch, employment_type, salary, status,
    description_ru, description_uz, description_en, description_tr,
    requirements_ru, requirements_uz, requirements_en, requirements_tr,
    id
  ]);

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'vacancy', id, `Updated vacancy: ${position}`]
  );

  res.json({ message: 'Vacancy updated' });
});

// Delete vacancy
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM vacancies WHERE id = $1 RETURNING id, position', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Vacancy not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'vacancy', id, `Deleted vacancy: ${result.rows[0].position}`]
  );

  res.json({ message: 'Vacancy deleted' });
});

export default router;
