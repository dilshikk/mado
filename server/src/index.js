import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
