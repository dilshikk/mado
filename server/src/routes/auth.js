import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import pool from '../db/pool.js';
import { authenticate, authorize, VALID_ROLES, JWT_SECRET } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarDir = path.resolve(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const router = express.Router();

// Rate limiter: max 10 login attempts per IP per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password policy: minimum 8 characters
function validatePassword(password) {
  if (!password || password.length < 8) {
    return 'Пароль должен содержать не менее 8 символов';
  }
  return null;
}

// Avatar upload: store in memory, then process with sharp
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP allowed'));
  },
});

/**
 * Build the full avatar URL from a relative path stored in DB.
 * Returns null if no avatar_url.
 */
function buildAvatarUrl(req, relativeUrl) {
  if (!relativeUrl) return null;
  if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;
  const base = process.env.BASE_URL
    ? process.env.BASE_URL.replace(/\/$/, '')
    : `${req.protocol}://${req.get('host')}`;
  return `${base}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
}

/**
 * Try to fetch a user with avatar_url. If the column doesn't exist yet
 * (migration not run), fall back to a query without it.
 */
async function getUserById(req, id) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, status, last_seen, created_at, avatar_url FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    const user = result.rows[0];
    user.avatar_url = buildAvatarUrl(req, user.avatar_url);
    return user;
  } catch (err) {
    // Column avatar_url might not exist yet — fall back without it
    if (err.code === '42703') {
      const result = await pool.query(
        'SELECT id, name, email, role, status, last_seen, created_at FROM users WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) return null;
      return { ...result.rows[0], avatar_url: null };
    }
    throw err;
  }
}

// Login (protected against brute force: max 10 attempts per IP per 15 min)
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const result = await pool.query(
    'SELECT id, name, email, password_hash, role, status FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = result.rows[0];

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'This account has been blocked' });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  await pool.query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id]);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Register a new team member (admin only)
router.post('/register', authenticate, authorize(['admin']), async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role required' });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
  }

  // Validate password strength
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status, last_seen, created_at',
      [name, email, hashedPassword, role, 'active']
    );

    const newUser = result.rows[0];

    await pool.query(
      'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'user', newUser.id, `Created team member: ${newUser.email}`]
    );

    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    throw error;
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(req, decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update own profile (name, email, optionally password)
router.put('/me', authenticate, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const emailCheck = await pool.query(
    'SELECT id FROM users WHERE email = $1 AND id != $2',
    [email, req.user.id]
  );
  if (emailCheck.rows.length > 0) {
    return res.status(400).json({ error: 'Email already in use' });
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password' });
    }

    // Validate new password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET name = $1, email = $2, password_hash = $3 WHERE id = $4',
      [name, email, hashedPassword, req.user.id]
    );
  } else {
    await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, req.user.id]
    );
  }

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'user', req.user.id, 'Updated own profile']
  );

  const user = await getUserById(req, req.user.id);
  res.json(user);
});

// Upload / replace profile avatar (auto-cropped to 200×200)
router.post('/me/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Delete old avatar file if it was stored locally
  try {
    const existing = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [req.user.id]);
    const oldUrl = existing.rows[0]?.avatar_url;
    if (oldUrl && oldUrl.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(process.cwd(), oldUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  } catch {
    // avatar_url column might not exist yet — ignore
  }

  const filename = `avatar-${req.user.id}-${Date.now()}.jpg`;
  const filePath = path.join(avatarDir, filename);
  const relativeUrl = `/uploads/avatars/${filename}`;

  await sharp(req.file.buffer)
    .resize(200, 200, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85 })
    .toFile(filePath);

  // Ensure column exists before updating
  await pool.query(
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)'
  );
  await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [relativeUrl, req.user.id]);

  await pool.query(
    'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
    [req.user.id, 'update', 'user', req.user.id, 'Updated profile avatar']
  );

  const fullUrl = buildAvatarUrl(req, relativeUrl);
  res.json({ avatar_url: fullUrl });
});

export default router;
