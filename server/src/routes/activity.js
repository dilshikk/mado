import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/activity — paginated list with optional filters ─────────────────
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  const limit  = Math.min(200, Math.max(1, parseInt(req.query.limit)  || 50));
  const offset = Math.max(0,              parseInt(req.query.offset) || 0);
  const { action, target_type, user_id, search } = req.query;

  const conditions = [];
  const params     = [];
  let p = 0;

  if (action) {
    p++; conditions.push(`a.action = $${p}`); params.push(action);
  }
  if (target_type) {
    p++; conditions.push(`a.target_type = $${p}`); params.push(target_type);
  }
  if (user_id) {
    p++; conditions.push(`a.user_id = $${p}`); params.push(parseInt(user_id));
  }
  if (search) {
    p++; conditions.push(`(a.details ILIKE $${p} OR u.name ILIKE $${p})`); params.push(`%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    pool.query(`
      SELECT a.id, a.user_id, a.action, a.target_type, a.target_id, a.details, a.created_at,
             u.name AS user_name
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      ${where}
      ORDER BY a.created_at DESC
      LIMIT $${p + 1} OFFSET $${p + 2}
    `, [...params, limit, offset]),
    pool.query(`
      SELECT COUNT(*) FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      ${where}
    `, params),
  ]);

  res.json({
    data:  dataResult.rows,
    total: parseInt(countResult.rows[0].count),
  });
});

// ── GET /api/activity/:type/:id — history for a specific entity ──────────────
router.get('/:type/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { type, id } = req.params;

  const result = await pool.query(`
    SELECT a.id, a.user_id, a.action, a.details, a.created_at,
           u.name AS user_name
    FROM activity_log a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.target_type = $1 AND a.target_id = $2
    ORDER BY a.created_at DESC
  `, [type, id]);

  res.json(result.rows);
});

// ── DELETE /api/activity/clear — remove ALL log entries (admin only) ─────────
router.delete('/clear', authenticate, authorize(['admin']), async (req, res) => {
  const countResult = await pool.query('SELECT COUNT(*) FROM activity_log');
  await pool.query('TRUNCATE TABLE activity_log RESTART IDENTITY');

  // Re-log the clear action so there's at least one entry after
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
    [req.user.id, 'clear', 'activity_log', `Cleared ${countResult.rows[0].count} log entries`]
  );

  res.json({ message: 'Activity log cleared', deleted: parseInt(countResult.rows[0].count) });
});

// ── DELETE /api/activity/prune — remove entries older than N days (default 30)
// Fixed: use parameterized query to prevent SQL injection via `days` param.
router.delete('/prune', authenticate, authorize(['admin']), async (req, res) => {
  const days = Math.max(1, parseInt(req.query.days) || 30);

  // Use parameterized interval to avoid SQL injection
  const result = await pool.query(
    `DELETE FROM activity_log WHERE created_at < NOW() - ($1 * INTERVAL '1 day') RETURNING id`,
    [days]
  );

  const deleted = result.rowCount ?? 0;
  if (deleted > 0) {
    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'prune', 'activity_log', `Auto-pruned ${deleted} entries older than ${days} days`]
    );
  }

  res.json({ message: `Pruned entries older than ${days} days`, deleted });
});

export default router;
