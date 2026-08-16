import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all settings
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  const result = await pool.query('SELECT key, value FROM settings ORDER BY key');
  
  const settings = {};
  result.rows.forEach(row => {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  });

  res.json(settings);
});

// Get single setting
router.get('/:key', async (req, res) => {
  const { key } = req.params;

  const result = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Setting not found' });
  }

  try {
    res.json(JSON.parse(result.rows[0].value));
  } catch {
    res.json({ value: result.rows[0].value });
  }
});

// Update setting
router.put('/:key', authenticate, authorize(['admin']), async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: 'Value required' });
  }

  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

  await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
    [key, stringValue]
  );

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'setting', null, `Updated setting: ${key}`]
  );

  res.json({ message: 'Setting updated' });
});

// Bulk update settings
router.put('/', authenticate, authorize(['admin']), async (req, res) => {
  const settings = req.body;

  for (const [key, value] of Object.entries(settings)) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
      [key, stringValue]
    );
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
    [req.user.id, 'bulk_update', 'setting', `Updated ${Object.keys(settings).length} settings`]
  );

  res.json({ message: 'Settings updated' });
});

export default router;
