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

function withFullUrl(req, row) {
  if (!row) return row;
  if (!row.file_url) return { ...row, full_url: null };

  if (/^https?:\/\//i.test(row.file_url)) {
    return { ...row, full_url: row.file_url };
  }

  const relativePath = row.file_url.startsWith('/')
    ? row.file_url
    : `/${row.file_url}`;

  if (process.env.BASE_URL) {
    const base = process.env.BASE_URL.replace(/\/+$/, '');
    return { ...row, full_url: `${base}${relativePath}` };
  }

  return { ...row, full_url: relativePath };
}

/**
 * Sanitize a user-provided filename into a safe on-disk filename.
 * Keeps ASCII alphanumerics, hyphens, underscores, and dots.
 */
function sanitizeDiskName(name) {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'file';
}

/**
 * Given a desired disk filename, return a non-colliding name.
 * If "logo.jpg" exists, returns "logo-1.jpg", then "logo-2.jpg", etc.
 * Skips collision check for the file that is currently occupying oldDiskName
 * (i.e. the file being renamed — it will be moved away).
 */
function resolveUniqueDiskName(desiredName, oldDiskName) {
  const ext = path.extname(desiredName);
  const base = path.basename(desiredName, ext);

  let candidate = desiredName;
  let counter = 1;

  while (true) {
    // If the candidate is the file we're about to move, it won't conflict
    if (candidate === oldDiskName) return candidate;

    const candidatePath = path.join(uploadDir, candidate);
    if (!fs.existsSync(candidatePath)) return candidate;

    // Collision: append / increment suffix
    candidate = `${base}-${counter}${ext}`;
    counter++;
  }
}

// ── Multer config ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `orig-${Date.now()}${ext}`);
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
      const filePath = `/uploads/${file.filename}`;
      const result = await pool.query(
        `INSERT INTO media (filename, file_url, file_size, file_type, category_id, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [file.originalname, filePath, file.size, file.mimetype, category_id || null, req.user.id]
      );
      inserted.push(withFullUrl(req, result.rows[0]));
    }

    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'upload', 'media', `Uploaded ${inserted.length} file(s): ${inserted.map(f => f.filename).join(', ')}`]
    );

    res.status(201).json(inserted);
  }
);

/**
 * PATCH /media/:id/rename
 *
 * Renames the display name AND the physical file on disk.
 * If the desired disk name is already taken by another file, appends -1, -2, …
 * Cascades the updated file_url to dishes, promotions, and menu_categories.
 */
router.patch('/:id/rename', authenticate, authorize(['admin', 'marketing', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const { filename } = req.body;

  if (!filename || !String(filename).trim()) {
    return res.status(400).json({ error: 'filename is required' });
  }

  const newDisplayName = String(filename).trim();

  // ── 1. Fetch current record ──────────────────────────────────────────────────
  const existing = await pool.query('SELECT * FROM media WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'File not found' });
  }
  const file = existing.rows[0];
  const oldFileUrl = file.file_url;

  // ── 2. Compute new disk filename ─────────────────────────────────────────────
  const isLocal = typeof oldFileUrl === 'string' && oldFileUrl.startsWith('/uploads/');
  let newFileUrl = oldFileUrl;

  if (isLocal) {
    const oldDiskName = path.basename(oldFileUrl);   // e.g. orig-1787887561860.jpg
    const oldExt = path.extname(oldDiskName);         // e.g. .jpg

    // Build sanitized desired disk name, preserving extension
    const userExt = path.extname(newDisplayName);
    const baseSanitized = sanitizeDiskName(newDisplayName);
    const desiredDiskName = userExt ? baseSanitized : `${baseSanitized}${oldExt}`;

    // Resolve collision: if desired name is taken, use logo-1.jpg, logo-2.jpg …
    const newDiskName = resolveUniqueDiskName(desiredDiskName, oldDiskName);
    newFileUrl = `/uploads/${newDiskName}`;

    const oldPath = path.join(uploadDir, oldDiskName);
    const newPath = path.join(uploadDir, newDiskName);

    if (oldPath !== newPath && fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  }

  // ── 3. Update media table ────────────────────────────────────────────────────
  const updated = await pool.query(
    'UPDATE media SET filename = $1, file_url = $2 WHERE id = $3 RETURNING *',
    [newDisplayName, newFileUrl, id]
  );

  // ── 4. Cascade: update image_url in all tables that reference this file ──────
  if (isLocal && oldFileUrl !== newFileUrl) {
    const oldDiskName = path.basename(oldFileUrl);
    const newDiskName = path.basename(newFileUrl);

    const cascadeSQL = (table, column) => pool.query(
      `UPDATE ${table}
       SET ${column} = REPLACE(${column}, $1, $2)
       WHERE ${column} LIKE $3`,
      [oldDiskName, newDiskName, `%${oldDiskName}`]
    );

    await Promise.all([
      cascadeSQL('dishes', 'image_url'),
      cascadeSQL('promotions', 'image_url'),
      cascadeSQL('menu_categories', 'image_url'),
    ]);
  }

  // ── 5. Log ───────────────────────────────────────────────────────────────────
  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'media', id, `Renamed file: ${file.filename} → ${newDisplayName}`]
  );

  res.json(withFullUrl(req, updated.rows[0]));
});

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

router.delete('/:id', authenticate, authorize(['admin', 'marketing', 'content_manager']), async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM media WHERE id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });

  const file = result.rows[0];
  const diskName = file.file_url.replace(/^\/uploads\//, '');
  if (diskName) {
    const filePath = path.join(uploadDir, diskName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'delete', 'media', id, `Deleted file: ${file.filename}`]
  );

  res.json({ message: 'File deleted' });
});

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
    const diskName = file.file_url.replace(/^\/uploads\//, '');
    if (diskName) {
      const filePath = path.join(uploadDir, diskName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, details) VALUES ($1, $2, $3, $4)',
    [req.user.id, 'bulk_delete', 'media', `Bulk deleted ${result.rowCount} file(s)`]
  );

  res.json({ deleted: result.rowCount });
});

export default router;
