import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/auth.js';
import dishesRoutes from './routes/dishes.js';
import categoriesRoutes from './routes/categories.js';
import locationsRoutes from './routes/locations.js';
import promotionsRoutes from './routes/promotions.js';
import reviewsRoutes from './routes/reviews.js';
import requestsRoutes from './routes/requests.js';
import cateringRoutes from './routes/catering.js';
import vacanciesRoutes from './routes/vacancies.js';
import applicationsRoutes from './routes/applications.js';
import faqRoutes from './routes/faq.js';
import settingsRoutes from './routes/settings.js';
import usersRoutes from './routes/users.js';
import activityRoutes from './routes/activity.js';
import pagesRoutes from './routes/pages.js';
import mediaRoutes from './routes/media.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers (helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — allow trusted origins, or all origins if CORS_ORIGIN is not set
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : null; // null = allow all (open for dev/migration period)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // If no allowlist configured — allow all origins
    if (!allowedOrigins) return callback(null, true);
    // Check against allowlist
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Blocked origin — return 403, not a thrown error (avoids 500)
    return callback(null, false);
  },
  credentials: true,
}));

// Body parsers with reasonable size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// Static uploads
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/catering', cateringRoutes);
app.use('/api/vacancies', vacanciesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
