import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db/pool.js';
import { authenticate, authorize } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build the public base URL of the server from the incoming request.
 * Uses BASE_URL env var if set (e.g. "https://api.madouz.uz"),
 * otherwise falls back to req.protocol + req.get('host').
 */
function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

/**
 * Enrich a media row with a `full_url` field that is always an absolute URL.
 * Handles both old rows (already absolute) and new rows (relative /uploads/...).
 */
function withFullUrl(req, row) {
  if (!row) return row;
  const base = getBaseUrl(req);
  const full_url = /^https?:\/\//i.test(row.file_url)
    ? row.file_url
    : `${base}${row.file_url.startsWith('/') ? '' : '/'}${row.file_url}`;
  return { ...row, full_url };
}

// ── Multer config ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 60);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed (JPG, PNG, WEBP, GIF)'));
  },
});

// ── Categories ────────────────────────────────────────────────────────────────

router.get('/categories', async (req, res) => {
  const result = await pool.query('SELECT * FROM media_categories ORDER BY name ASC');
  res.json(result.rows);
});

router.post('/categories', authenticate, authorize(['admin', 'marketing', 'content_manager']), async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const existing = await pool.query(
    'SELECT id FROM media_categories WHERE LOWER(name) = LOWER($1)',
    [name.trim()]
  );
  if (existing.rows.length > 0) return res.status(409).json({ error: 'Category already exists' });

  const result = await pool.query(
    'INSERT INTO media_categories (name) VALUES ($1) RETURNING *',
    [name.trim()]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/categories/:id', authenticate, authorize(['admin', 'marketing', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const result = await pool.query(
    'UPDATE media_categories SET name = $1 WHERE id = $2 RETURNING *',
    [name.trim(), id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
  res.json(result.rows[0]);
});

router.delete('/categories/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE media SET category_id = NULL WHERE category_id = $1', [id]);
  const result = await pool.query('DELETE FROM media_categories WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
  res.json({ message: 'Category deleted' });
});

// ── Media files ───────────────────────────────────────────────────────────────

// GET /api/media?page=1&limit=24&search=...&category_id=...
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24));
  const offset = (page - 1) * limit;
  const { search, category_id } = req.query;

  const conditions = [];
  const params = [];
  let p = 0;

  if (search) {
    p++;
    conditions.push(`m.filename ILIKE $${p}`);
    params.push(`%${search}%`);
  }
  if (category_id) {
    p++;
    conditions.push(`m.category_id = $${p}`);
    params.push(Number(category_id));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM media m ${where}`, params),
    pool.query(
      `SELECT m.*, mc.name AS category_name
       FROM media m
       LEFT JOIN media_categories mc ON m.category_id = mc.id
       ${where}
       ORDER BY m.created_at DESC
       LIMIT $${p + 1} OFFSET $${p + 2}`,
      [...params, limit, offset]
    ),
  ]);

  res.json({
    files: dataRes.rows.map((row) => withFullUrl(req, row)),
    total: parseInt(countRes.rows[0].count),
    page,
    limit,
  });
});

// POST /api/media/upload
router.post(
  '/upload',
  authenticate,
  authorize(['admin', 'marketing', 'content_manager']),
  upload.array('files', 20),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { category_id } = req.body;

    const inserted = [];
    for (const file of req.files) {
      // Store only the relative path — full_url is computed on read
      const filePath = `/uploads/${file.filename}`;
      const result = await pool.query(
        `INSERT INTO media (filename, file_url, file_size, file_type, category_id, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          file.originalname,
          filePath,
          file.size,
          file.mimetype,
          category_id || null,
          req.user.id,
        ]
      );
      inserted.push(withFullUrl(req, result.rows[0]));
    }

    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'upload', 'media', `Uploaded ${inserted.length} file(s)`]
    );

    res.status(201).json(inserted);
  }
);

// PATCH /api/media/:id/category
router.patch('/:id/category', authenticate, authorize(['admin', 'marketing', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const { category_id } = req.body;
  const result = await pool.query(
    'UPDATE media SET category_id = $1 WHERE id = $2 RETURNING *',
    [category_id || null, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
  res.json(withFullUrl(req, result.rows[0]));
});

// DELETE /api/media/:id
router.delete('/:id', authenticate, authorize(['admin', 'marketing', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM media WHERE id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });

  const file = result.rows[0];
  const filename = file.file_url.replace(/^\/uploads\//, '');
  if (filename) {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  res.json({ message: 'File deleted' });
});

// POST /api/media/bulk-delete
router.post('/bulk-delete', authenticate, authorize(['admin', 'marketing', 'content_manager']), async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const result = await pool.query(
    `DELETE FROM media WHERE id IN (${placeholders}) RETURNING *`,
    ids
  );

  for (const file of result.rows) {
    const filename = file.file_url.replace(/^\/uploads\//, '');
    if (filename) {
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

  res.json({ deleted: result.rowCount });
});

export default router;
