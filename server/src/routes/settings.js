import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all settings
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// Get single setting (requires authentication)
router.get('/:key', authenticate, authorize(['admin']), async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get single setting error:', error);
    res.status(500).json({ error: 'Failed to retrieve setting' });
  }
});

// Update single setting
router.put('/:key', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value required' });
    }

    if (!key || key.trim().length === 0) {
      return res.status(400).json({ error: 'Setting key is required' });
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

    res.json({ message: 'Setting updated', key, value });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Bulk update settings
router.put('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const settings = req.body;

    if (!settings || Object.keys(settings).length === 0) {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    for (const [key, value] of Object.entries(settings)) {
      if (!key || key.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid setting key' });
      }

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

    res.json({ message: 'Settings updated', count: Object.keys(settings).length });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Delete setting
router.delete('/:key', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { key } = req.params;

    if (!key || key.trim().length === 0) {
      return res.status(400).json({ error: 'Setting key is required' });
    }

    const result = await pool.query(
      'DELETE FROM settings WHERE key = $1 RETURNING key, value',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'setting', null, `Deleted setting: ${key}`]
    );

    res.json({ message: 'Setting deleted', key });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

export default router;
