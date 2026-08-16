import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all activity logs
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 100;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  const result = await pool.query(`
    SELECT a.id, a.user_id, a.action, a.target_type, a.target_id, a.details, a.created_at,
           u.name as user_name
    FROM activity_log a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const countResult = await pool.query('SELECT COUNT(*) FROM activity_log');

  res.json({
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  });
});

// Get activity for specific entity
router.get('/:type/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { type, id } = req.params;

  const result = await pool.query(`
    SELECT a.id, a.user_id, a.action, a.details, a.created_at,
           u.name as user_name
    FROM activity_log a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.target_type = $1 AND a.target_id = $2
    ORDER BY a.created_at DESC
  `, [type, id]);

  res.json(result.rows);
});

export default router;
