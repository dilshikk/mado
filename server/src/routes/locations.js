import express from 'express';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  const result = await pool.query(`
    SELECT
      id, name,
      name_ru, name_uz, name_en, name_tr,
      district,
      district_ru, district_uz, district_en, district_tr,
      address,
      address_ru, address_uz, address_en, address_tr,
      phone, email, maps_url, photo_url, status, created_at
    FROM locations
    ORDER BY COALESCE(name_ru, name)
  `);

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
    SELECT
      id, name,
      name_ru, name_uz, name_en, name_tr,
      district,
      district_ru, district_uz, district_en, district_tr,
      address,
      address_ru, address_uz, address_en, address_tr,
      phone, email, maps_url, photo_url, status
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
  const {
    name, name_ru, name_uz, name_en, name_tr,
    district, district_ru, district_uz, district_en, district_tr,
    address, address_ru, address_uz, address_en, address_tr,
    phone, email, maps_url, photo_url, services = [], hours = []
  } = req.body;

  const primaryName = name_ru || name;
  const primaryDistrict = district_ru || district;
  const primaryAddress = address_ru || address;

  if (!primaryName || !primaryDistrict || !primaryAddress || !phone) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const locResult = await pool.query(`
    INSERT INTO locations (
      name, name_ru, name_uz, name_en, name_tr,
      district, district_ru, district_uz, district_en, district_tr,
      address, address_ru, address_uz, address_en, address_tr,
      phone, email, maps_url, photo_url, status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'open')
    RETURNING id, name
  `, [
    primaryName, name_ru || null, name_uz || null, name_en || null, name_tr || null,
    primaryDistrict, district_ru || null, district_uz || null, district_en || null, district_tr || null,
    primaryAddress, address_ru || null, address_uz || null, address_en || null, address_tr || null,
    phone, email || null, maps_url || null, photo_url || null
  ]);

  const locId = locResult.rows[0].id;

  if (hours.length > 0) {
    for (const hour of hours) {
      await pool.query(`
        INSERT INTO location_hours (location_id, day_of_week, open_time, close_time, is_closed)
        VALUES ($1, $2, $3, $4, $5)
      `, [locId, hour.day_of_week, hour.open_time, hour.close_time, hour.is_closed || false]);
    }
  }

  if (services.length > 0) {
    for (const service of services) {
      await pool.query(`
        INSERT INTO location_services (location_id, service) VALUES ($1, $2)
      `, [locId, service]);
    }
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
    [req.user.id, 'create', 'location', locId, `Created location: ${primaryName}`]
  );

  res.status(201).json(locResult.rows[0]);
});

// Update location
router.put('/:id', authenticate, authorize(['admin', 'editor']), async (req, res) => {
  const { id } = req.params;
  const {
    name, name_ru, name_uz, name_en, name_tr,
    district, district_ru, district_uz, district_en, district_tr,
    address, address_ru, address_uz, address_en, address_tr,
    phone, email, maps_url, photo_url, status, services = [], hours = []
  } = req.body;

  const primaryName = name_ru || name;
  const primaryDistrict = district_ru || district;
  const primaryAddress = address_ru || address;

  await pool.query(`
    UPDATE locations SET
      name = $1,
      name_ru = $2, name_uz = $3, name_en = $4, name_tr = $5,
      district = $6,
      district_ru = $7, district_uz = $8, district_en = $9, district_tr = $10,
      address = $11,
      address_ru = $12, address_uz = $13, address_en = $14, address_tr = $15,
      phone = $16, email = $17, maps_url = $18, photo_url = $19, status = $20,
      updated_at = NOW()
    WHERE id = $21
  `, [
    primaryName,
    name_ru || null, name_uz || null, name_en || null, name_tr || null,
    primaryDistrict,
    district_ru || null, district_uz || null, district_en || null, district_tr || null,
    primaryAddress,
    address_ru || null, address_uz || null, address_en || null, address_tr || null,
    phone, email || null, maps_url || null, photo_url || null, status, id
  ]);

  // Replace hours
  await pool.query('DELETE FROM location_hours WHERE location_id = $1', [id]);
  for (const hour of hours) {
    await pool.query(`
      INSERT INTO location_hours (location_id, day_of_week, open_time, close_time, is_closed)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, hour.day_of_week, hour.open_time, hour.close_time, hour.is_closed || false]);
  }

  // Replace services
  await pool.query('DELETE FROM location_services WHERE location_id = $1', [id]);
  for (const service of services) {
    await pool.query(`
      INSERT INTO location_services (location_id, service) VALUES ($1, $2)
    `, [id, service]);
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
    [req.user.id, 'update', 'location', id, `Updated location: ${primaryName}`]
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

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)',
    [req.user.id, 'delete', 'location', id, `Deleted location: ${result.rows[0].name}`]
  );

  res.json({ message: 'Location deleted' });
});

export default router;
