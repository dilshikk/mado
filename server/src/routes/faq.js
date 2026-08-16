import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all FAQ items
router.get('/', async (req, res) => {
  const { category } = req.query;

  let query = 'SELECT id, question_ru, question_uz, question_en, question_tr, answer_ru, answer_uz, answer_en, answer_tr, category, position FROM faq';
  const params = [];

  if (category) {
    query += ' WHERE category = $1';
    params.push(category);
  }

  query += ' ORDER BY category, position';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Get single FAQ item
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('SELECT * FROM faq WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'FAQ item not found' });
  }

  res.json(result.rows[0]);
});

// Create FAQ item
router.post('/', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { question_ru, answer_ru, category } = req.body;

  if (!question_ru || !answer_ru || !category) {
    return res.status(400).json({ error: 'Question, answer, and category required' });
  }

  const result = await pool.query(`
    INSERT INTO faq (question_ru, answer_ru, category)
    VALUES ($1, $2, $3)
    RETURNING id, question_ru
  `, [question_ru, answer_ru, category]);

  res.status(201).json(result.rows[0]);
});

// Update FAQ item
router.put('/:id', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const { question_ru, question_uz, question_en, question_tr, answer_ru, answer_uz, answer_en, answer_tr, category } = req.body;

  await pool.query(`
    UPDATE faq SET
      question_ru = $1, question_uz = $2, question_en = $3, question_tr = $4,
      answer_ru = $5, answer_uz = $6, answer_en = $7, answer_tr = $8,
      category = $9, updated_at = NOW()
    WHERE id = $10
  `, [question_ru, question_uz, question_en, question_tr, answer_ru, answer_uz, answer_en, answer_tr, category, id]);

  res.json({ message: 'FAQ item updated' });
});

// Delete FAQ item
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM faq WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'FAQ item not found' });
  }

  res.json({ message: 'FAQ item deleted' });
});

export default router;
