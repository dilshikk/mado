import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  const result = await pool.query(`
    SELECT id, name, district, address, phone, email, maps_url, status, created_at
    FROM locations
    ORDER BY name
  `);

  // Get hours and services for each location
  const locationsWithDetails = await Promise.all(result.rows.map(async (loc) => {
    const hoursResult = await pool.query(`
      SELECT day_of_week, open_time, close_time, is_closed
      FROM location_hours
      WHERE location_id = $1
      ORDER BY day_of_week
    `, [loc.id]);

    const servicesResult = await pool.query(`
      SELECT service FROM location_services WHERE location_id = $1
    `, [loc.id]);

    return {
      ...loc,
      hours: hoursResult.rows,
      services: servicesResult.rows.map(s => s.service)
    };
  }));

  res.json(locationsWithDetails);
});

// Get single location
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`
    SELECT id, name, district, address, phone, email, maps_url, status
    FROM locations
    WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Location not found' });
  }

  const hoursResult = await pool.query(`
    SELECT day_of_week, open_time, close_time, is_closed
    FROM location_hours
    WHERE location_id = $1
    ORDER BY day_of_week
  `, [id]);

  const servicesResult = await pool.query(`
    SELECT service FROM location_services WHERE location_id = $1
  `, [id]);

  res.json({
    ...result.rows[0],
    hours: hoursResult.rows,
    services: servicesResult.rows.map(s => s.service)
  });
});

// Create location
router.post('/', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { name, district, address, phone, email, maps_url, services = [], hours = [] } = req.body;

  if (!name || !district || !address || !phone) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const locResult = await pool.query(`
    INSERT INTO locations (name, district, address, phone, email, maps_url, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'open')
    RETURNING id, name
  `, [name, district, address, phone, email || null, maps_url || null]);

  const locId = locResult.rows[0].id;

  // Insert hours
  if (hours.length > 0) {
    for (const hour of hours) {
      await pool.query(`
        INSERT INTO location_hours (location_id, day_of_week, open_time, close_time, is_closed)
        VALUES ($1, $2, $3, $4, $5)
      `, [locId, hour.day_of_week, hour.open_time, hour.close_time, hour.is_closed || false]);
    }
  }

  // Insert services
  if (services.length > 0) {
    for (const service of services) {
      await pool.query(`
        INSERT INTO location_services (location_id, service)
        VALUES ($1, $2)
      `, [locId, service]);
    }
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'create', 'location', locId, `Created location: ${name}`]
  );

  res.status(201).json(locResult.rows[0]);
});

// Update location
router.put('/:id', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const { name, district, address, phone, email, maps_url, status, services = [], hours = [] } = req.body;

  await pool.query(`
    UPDATE locations SET name = $1, district = $2, address = $3, phone = $4, email = $5, maps_url = $6, status = $7, updated_at = NOW()
    WHERE id = $8
  `, [name, district, address, phone, email, maps_url, status, id]);

  // Update hours
  await pool.query('DELETE FROM location_hours WHERE location_id = $1', [id]);
  for (const hour of hours) {
    await pool.query(`
      INSERT INTO location_hours (location_id, day_of_week, open_time, close_time, is_closed)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, hour.day_of_week, hour.open_time, hour.close_time, hour.is_closed || false]);
  }

  // Update services
  await pool.query('DELETE FROM location_services WHERE location_id = $1', [id]);
  for (const service of services) {
    await pool.query(`
      INSERT INTO location_services (location_id, service)
      VALUES ($1, $2)
    `, [id, service]);
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'location', id, `Updated location: ${name}`]
  );

  res.json({ message: 'Location updated' });
});

// Delete location
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM locations WHERE id = $1 RETURNING id, name', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Location not found' });
  }

  // Log activity
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'location', id, `Deleted location: ${result.rows[0].name}`]
  );

  res.json({ message: 'Location deleted' });
});

export default router;
