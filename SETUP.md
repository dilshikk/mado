# MADO Admin Panel - Complete Setup Guide

Complete guide to set up and run the MADO Admin Panel with PostgreSQL backend.

## Project Structure

```
madouz/
├── madouz/                    # React Frontend
│   ├── src/
│   │   ├── pages/admin/      # Admin dashboard pages
│   │   ├── lib/api.ts        # API client
│   │   └── ...
│   ├── vite.config.ts
│   ├── package.json
│   ├── API_INTEGRATION.md    # Frontend integration guide
│   └── ...
│
└── server/                    # Node.js/Express Backend
    ├── src/
    │   ├── db/              # Database setup
    │   ├── middleware/      # Authentication
    │   ├── routes/          # API endpoints
    │   └── index.js         # Server entry
    ├── package.json
    ├── .env.example
    ├── README.md            # Backend setup guide
    └── ...
```

## Prerequisites

- **Node.js** 16+ (download from [nodejs.org](https://nodejs.org))
- **PostgreSQL** 12+ (download from [postgresql.org](https://www.postgresql.org))
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for version control)

## Step 1: Clone/Download Project

```bash
# If using git
git clone <repository-url>
cd madouz

# Or extract downloaded zip file
```

## Step 2: Set Up PostgreSQL Database

### Windows/Mac/Linux:

1. **Install PostgreSQL** from [postgresql.org](https://www.postgresql.org/download/)

2. **Start PostgreSQL service**
   - Windows: PostgreSQL service should auto-start, or start from Services
   - Mac: `brew services start postgresql` (if installed via Homebrew)
   - Linux: `sudo systemctl start postgresql`

3. **Create database** (using psql or pgAdmin):
   ```bash
   psql -U postgres

   # In psql prompt:
   CREATE DATABASE mado_db;
   \q
   ```

4. **Verify connection**:
   ```bash
   psql -U postgres -d mado_db
   ```

## Step 3: Backend Setup

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# Linux/Mac:
nano .env

# Windows: Open with any text editor
# Set your PostgreSQL password in DB_PASSWORD
```

### .env Configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=mado_db

# Server
PORT=3000
NODE_ENV=development

# JWT (keep secret in production!)
JWT_SECRET=your-super-secret-key-change-in-production

# Frontend URL
CORS_ORIGIN=http://localhost:5173
```

### Initialize Database:

```bash
# Run database initialization script
npm run db:init
```

This will:
- Create all tables
- Insert default admin user
- Insert default settings

**Default Admin:**
- Email: `admin@madouz.uz`
- Password: `password` (change in production!)

### Start Backend Server:

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Server should show: `🚀 Server running on http://localhost:3000`

## Step 4: Frontend Setup

In a **new terminal**:

```bash
# Navigate to frontend folder
cd madouz

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# (If .env.example doesn't exist, create .env.local manually)

# Add to .env.local:
VITE_API_URL=http://localhost:3000/api
```

### Start Frontend Server:

```bash
npm run dev
```

Frontend should be available at: `http://localhost:5173`

## Step 5: Access Admin Panel

1. Open browser and go to: **http://localhost:5173/admin**

2. Login with:
   - Email: `admin@madouz.uz`
   - Password: `password`

3. You should see the admin dashboard!

## Testing the Setup

### Test Backend API:

```bash
# Check if server is running
curl http://localhost:3000/health

# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@madouz.uz","password":"password"}'

# Should return: {"token":"...","user":{...}}
```

### Test Frontend:

- Admin Dashboard accessible at `/admin`
- All pages should load without errors
- Try creating a new category or dish

## File Structure - Quick Reference

### Frontend Key Files:

```
src/
├── pages/admin/
│   ├── layout.tsx              # Main admin layout
│   ├── dashboard/page.tsx      # Dashboard
│   ├── menu/
│   │   ├── categories/page.tsx
│   │   └── dishes/page.tsx
│   ├── locations/page.tsx
│   ├── promotions/page.tsx
│   ├── reviews/page.tsx
│   ├── requests/page.tsx
│   ├── catering/
│   │   ├── content/page.tsx
│   │   └── requests/page.tsx
│   ├── careers/
│   │   ├── vacancies/page.tsx
│   │   └── applications/page.tsx
│   ├── faq/page.tsx
│   ├── settings/page.tsx
│   ├── users/page.tsx
│   └── activity/page.tsx
└── lib/
    └── api.ts                  # API client
```

### Backend Key Files:

```
src/
├── index.js                    # Main server
├── middleware/auth.js          # Auth middleware
├── db/
│   ├── pool.js                # Database connection
│   └── init.js                # Database schema
└── routes/
    ├── auth.js                # Authentication
    ├── categories.js          # Menu categories
    ├── dishes.js              # Menu dishes
    ├── locations.js           # Locations
    ├── promotions.js          # Promotions
    ├── reviews.js             # Reviews
    ├── requests.js            # Contact requests
    ├── catering.js            # Catering
    ├── vacancies.js           # Job vacancies
    ├── applications.js        # Job applications
    ├── faq.js                 # FAQ
    ├── settings.js            # Settings
    ├── users.js               # User management
    ├── activity.js            # Activity log
    └── pages.js               # Pages management
```

## Common Commands

### Frontend:
```bash
cd madouz

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend:
```bash
cd server

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Reinitialize database
npm run db:init
```

## Troubleshooting

### Problem: PostgreSQL connection failed

**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres

# If failed, start PostgreSQL
# Windows: Use Services control panel
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Problem: Port 3000 already in use

**Solution:**
```bash
# Change PORT in server/.env to another port (e.g., 3001)
PORT=3001

# Or kill process using port
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problem: Port 5173 already in use

**Solution:**
```bash
# Vite will automatically use next available port
# Or specify manually:
npm run dev -- --port 3001
```

### Problem: "Cannot GET /admin"

**Solution:**
- Make sure frontend is running on `http://localhost:5173`
- Check browser console for errors (F12)
- Ensure API_INTEGRATION.md setup is complete

### Problem: Login fails with "Invalid email or password"

**Solution:**
```bash
# Reset database and reinitialize
cd server
npm run db:init

# Default credentials will be reset
# Email: admin@madouz.uz
# Password: password
```

### Problem: API requests return 401 Unauthorized

**Solution:**
- Login first to get token
- Check token is saved in localStorage
- Verify JWT_SECRET is same in backend .env
- Token expires in 7 days, login again if needed

### Problem: "ECONNREFUSED" - Cannot connect to backend

**Solution:**
```bash
# Check backend is running
curl http://localhost:3000/health

# If failed, start backend:
cd server && npm run dev

# Check VITE_API_URL in frontend .env.local
VITE_API_URL=http://localhost:3000/api
```

## Database Reset

To completely reset the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate database
DROP DATABASE mado_db;
CREATE DATABASE mado_db;
\q

# Reinitialize
cd server
npm run db:init
```

## Production Deployment

### Frontend:

```bash
cd madouz

# Build for production
npm run build

# Deploy 'dist' folder to:
# - Vercel
# - Netlify
# - GitHub Pages
# - Any static hosting
```

### Backend:

1. **Deploy to a server** (VPS, Heroku, AWS, etc.)

2. **Set environment variables** in production:
   ```env
   NODE_ENV=production
   DB_HOST=<production-db-host>
   DB_PASSWORD=<secure-password>
   JWT_SECRET=<generate-new-secret>
   CORS_ORIGIN=<your-domain.com>
   ```

3. **Start server**:
   ```bash
   npm install
   npm run db:init  # Only first time
   npm start
   ```

## Security Checklist

- [ ] Change default admin password: `admin@madouz.uz`
- [ ] Generate strong JWT_SECRET (production)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS on both frontend and backend
- [ ] Restrict CORS to your domain only
- [ ] Set database password securely
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Enable error logging
- [ ] Set up monitoring

## Next Steps

1. **Change Admin Password**: Go to Settings or user profile
2. **Add Menu Items**: Start adding dishes in Menu > Dishes
3. **Configure Locations**: Add your restaurant locations
4. **Set Up Pages**: Edit home page and other content pages
5. **Create Vacancies**: Add job positions if using careers section
6. **Configure Settings**: Set business information

## Support & Documentation

- **Backend API Docs**: See `server/README.md`
- **Frontend Integration**: See `API_INTEGRATION.md`
- **Database Schema**: Check `server/src/db/init.js`

## Quick Start Summary

```bash
# Terminal 1: Backend
cd server
npm install
cp .env.example .env
# Edit .env with PostgreSQL details
npm run db:init
npm run dev

# Terminal 2: Frontend (in new terminal)
cd madouz
npm install
echo "VITE_API_URL=http://localhost:3000/api" > .env.local
npm run dev

# Open http://localhost:5173/admin in browser
# Login: admin@madouz.uz / password
```

**That's it! Your MADO Admin Panel is ready to use!** 🎉
