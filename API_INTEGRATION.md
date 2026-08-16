# MADO Admin Frontend - API Integration Guide

This guide explains how to connect the React admin panel to the PostgreSQL backend.

## Quick Setup

### 1. Backend Setup

First, set up the Node.js/PostgreSQL backend:

```bash
# Navigate to server folder
cd ../server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your PostgreSQL details
nano .env

# Initialize database
npm run db:init

# Start server
npm run dev
```

Backend should be running on `http://localhost:3000`

### 2. Frontend Configuration

In the frontend project, update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
```

### 3. Environment Variables

Create `.env.local` in the frontend root:

```
VITE_API_URL=http://localhost:3000/api
```

### 4. API Client Usage

The API client is available at `src/lib/api.ts`:

```typescript
import api from '@/lib/api';

// Login
const { token, user } = await api.login('admin@madouz.uz', 'password');

// Get categories
const categories = await api.getCategories('food');

// Create dish
await api.createDish({
  category_id: 1,
  name_ru: 'Кебаб',
  price: 50000,
  status: 'published'
});

// Update review status
await api.updateReviewStatus(123, 'approved');
```

## API Methods

### Authentication

```typescript
// Login
api.login(email, password)

// Register new user
api.register(name, email, password, role)

// Get current user
api.getMe()
```

### Menu Management

```typescript
// Categories
api.getCategories(tab?)
api.getCategory(id)
api.createCategory(label, tab)
api.updateCategory(id, label)
api.deleteCategory(id)

// Dishes
api.getDishes(params)
api.getDish(id)
api.createDish(dish)
api.updateDish(id, dish)
api.deleteDish(id)
api.bulkUpdateDishStatus(ids, status)
```

### Locations

```typescript
api.getLocations()
api.getLocation(id)
api.createLocation(location)
api.updateLocation(id, location)
api.deleteLocation(id)
```

### Promotions

```typescript
api.getPromotions(status?)
api.getPromotion(id)
api.createPromotion(promo)
api.updatePromotion(id, promo)
api.deletePromotion(id)
```

### Reviews

```typescript
api.getReviews(params)
api.getReviewStats()
api.createReview(review)
api.updateReviewStatus(id, status)
api.deleteReview(id)
```

### Requests

```typescript
api.getRequests(params)
api.getRequestStats()
api.createRequest(request)
api.updateRequestStatus(id, status)
api.deleteRequest(id)
```

### Catering

```typescript
api.getCateringRequests(status?)
api.getCateringRequest(id)
api.createCateringRequest(request)
api.updateCateringRequestStatus(id, status)
api.getCateringContent(lang)
api.updateCateringContent(lang, content)
```

### Careers

```typescript
// Vacancies
api.getVacancies(status?)
api.getVacancy(id)
api.createVacancy(vacancy)
api.updateVacancy(id, vacancy)
api.deleteVacancy(id)

// Applications
api.getApplications(params)
api.getApplication(id)
api.createApplication(app)
api.updateApplicationStatus(id, status)
api.deleteApplication(id)
```

### FAQ

```typescript
api.getFaqItems(category?)
api.getFaqItem(id)
api.createFaqItem(item)
api.updateFaqItem(id, item)
api.deleteFaqItem(id)
```

### Settings

```typescript
api.getSettings()
api.getSetting(key)
api.updateSetting(key, value)
api.updateSettings(settings)
```

### Users

```typescript
api.getUsers()
api.getUser(id)
api.updateUser(id, user)
api.resetUserPassword(id, password)
api.deleteUser(id)
```

### Activity Log

```typescript
api.getActivityLog(limit, offset)
api.getActivityForEntity(type, id)
```

### Pages

```typescript
api.getPages()
api.getPage(slug)
api.createPage(page)
api.updatePage(id, page)
api.deletePage(id)
```

## Integrating with React Components

Example: Update Categories page to use API:

```typescript
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (label, tab) => {
    try {
      const newCategory = await api.createCategory(label, tab);
      setCategories([...categories, newCategory]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    // Component JSX here
  );
}
```

## Error Handling

The API client automatically handles errors and redirects to login on 401:

```typescript
try {
  const result = await api.getDishes();
} catch (error) {
  console.error('Failed to load dishes:', error.message);
  // Show error toast/modal
}
```

## Authentication

Tokens are automatically stored in localStorage and included in all requests:

```typescript
// Login stores token
const { token } = await api.login(email, password);

// Token automatically included in subsequent requests
api.setToken(token);

// Logout
api.clearToken();
```

## Default Admin Credentials

After database initialization:
- Email: `admin@madouz.uz`
- Password: `password`

**⚠️ Change immediately in production!**

## Development Tips

1. **Check console for API errors** - The client logs errors to console
2. **Use React DevTools** - Monitor component state updates
3. **Test API with curl first** - Verify endpoints before frontend integration
4. **Use Postman** - Test complex requests with headers and auth

## Troubleshooting

### "API Error" when loading data
- Ensure backend server is running
- Check VITE_API_URL in .env.local
- Verify API endpoint exists

### 401 Unauthorized
- Login first to get token
- Token may have expired (7 days)
- Check JWT_SECRET in backend .env

### CORS Error
- Ensure CORS_ORIGIN in backend matches frontend URL
- Check proxy configuration in vite.config.ts

### Database Connection Error
- Verify PostgreSQL is running
- Check connection details in server/.env
- Ensure mado_db database exists

## Production Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to hosting
```

### Backend
```bash
# Set environment to production
NODE_ENV=production

# Use strong JWT_SECRET
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Deploy to your server/hosting
```

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS for production
- [ ] Set NODE_ENV=production
- [ ] Configure database backups
- [ ] Set up rate limiting
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for all secrets
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## Support

For issues or questions, check:
1. Backend logs: `npm run dev` output
2. Frontend console: Browser DevTools
3. Database: Verify tables exist with `psql`
4. Postman: Test API endpoints directly
