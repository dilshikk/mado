import express from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Returns key counts and recent activity in a single round-trip.
 * Accessible to all authenticated admin users.
 */
router.get('/stats', authenticate, async (req, res) => {
  const [
    dishesResult,
    locationsResult,
    usersResult,
    newRequestsResult,
    newCateringResult,
    newApplicationsResult,
    activeVacanciesResult,
    activePromotionsResult,
    activityResult,
  ] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM dishes WHERE status = 'published'"),
    pool.query("SELECT COUNT(*) FROM locations WHERE status = 'open'"),
    pool.query("SELECT COUNT(*) FROM users WHERE status = 'active'"),
    pool.query("SELECT COUNT(*) FROM requests WHERE status = 'new'"),
    pool.query("SELECT COUNT(*) FROM catering_requests WHERE status = 'new'"),
    pool.query("SELECT COUNT(*) FROM applications WHERE status = 'new'"),
    pool.query("SELECT COUNT(*) FROM vacancies WHERE status = 'published'"),
    pool.query("SELECT COUNT(*) FROM promotions WHERE status = 'published' AND end_date >= CURRENT_DATE"),
    pool.query(`
      SELECT a.id, a.action, a.target_type, a.target_id, a.details, a.created_at,
             u.name AS user_name
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 8
    `),
  ]);

  res.json({
    dishes:           parseInt(dishesResult.rows[0].count),
    locations:        parseInt(locationsResult.rows[0].count),
    users:            parseInt(usersResult.rows[0].count),
    newRequests:      parseInt(newRequestsResult.rows[0].count) + parseInt(newCateringResult.rows[0].count),
    newApplications:  parseInt(newApplicationsResult.rows[0].count),
    activeVacancies:  parseInt(activeVacanciesResult.rows[0].count),
    activePromotions: parseInt(activePromotionsResult.rows[0].count),
    recentActivity:   activityResult.rows,
  });
});

export default router;
