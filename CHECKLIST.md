# MADO Admin Setup Checklist

Complete this checklist to get your admin panel fully operational.

## ✅ Pre-Installation (5 minutes)

- [ ] Install [Node.js 16+](https://nodejs.org) if not already installed
- [ ] Install [PostgreSQL 12+](https://www.postgresql.org/download/) if not already installed
- [ ] Start PostgreSQL service
  - Windows: PostgreSQL service should auto-start
  - Mac: `brew services start postgresql` (if using Homebrew)
  - Linux: `sudo systemctl start postgresql`
- [ ] Verify PostgreSQL is running: `psql -U postgres`

## ✅ Database Setup (10 minutes)

- [ ] Create database: `psql -U postgres -c "CREATE DATABASE mado_db;"`
- [ ] Verify connection: `psql -U postgres -d mado_db`
- [ ] Note your PostgreSQL password for `.env` file

## ✅ Backend Setup (15 minutes)

```bash
cd server
```

- [ ] Install dependencies: `npm install`
- [ ] Copy environment template: `cp .env.example .env`
- [ ] Edit `.env` file with:
  - [ ] `DB_PASSWORD=` (your PostgreSQL password)
  - [ ] `JWT_SECRET=` (keep as is or generate new one)
  - [ ] `CORS_ORIGIN=http://localhost:5173`
- [ ] Initialize database: `npm run db:init`
- [ ] Start backend: `npm run dev`
- [ ] Verify: See `🚀 Server running on http://localhost:3000` message
- [ ] Keep terminal running, or open new terminal for frontend

## ✅ Frontend Setup (10 minutes)

```bash
# Open NEW TERMINAL
cd madouz
```

- [ ] Install dependencies: `npm install`
- [ ] Create environment file: `echo "VITE_API_URL=http://localhost:3000/api" > .env.local`
  - Or manually create `.env.local` with content: `VITE_API_URL=http://localhost:3000/api`
- [ ] Start frontend: `npm run dev`
- [ ] Verify: See `Local:   http://localhost:5173` message

## ✅ First Login (5 minutes)

- [ ] Open browser to: `http://localhost:5173/admin`
- [ ] Wait for page to load (first load may take a moment)
- [ ] Login with default credentials:
  - Email: `admin@madouz.uz`
  - Password: `password`
- [ ] Verify you can see the admin dashboard
- [ ] Check that "Website Status: Online" is shown

## ✅ Security (5 minutes)

- [ ] Change admin password:
  - [ ] Go to Settings (bottom of admin menu)
  - [ ] Or contact your administrator
- [ ] Update any other default values

## ✅ Basic Configuration (10 minutes)

- [ ] Go to **Settings** page and configure:
  - [ ] Site Name (already set to "MADO UZ")
  - [ ] Phone number
  - [ ] Email address
  - [ ] Address
  - [ ] Social media links (Instagram, Telegram, etc.)
  - [ ] Save changes

## ✅ Add Your First Content (15 minutes)

### Locations
- [ ] Go to **Locations**
- [ ] Add your first restaurant location:
  - [ ] Name (e.g., "MADO Tashkent — Chilanzar")
  - [ ] District
  - [ ] Address
  - [ ] Phone
  - [ ] Services (Dine-in, Takeaway, Delivery)
  - [ ] Operating hours
  - [ ] Save

### Menu Categories
- [ ] Go to **Menu > Categories**
- [ ] Add a category:
  - [ ] Name (e.g., "From the Grill")
  - [ ] Section (Food, Beverage, Dessert, or Takeaway)
  - [ ] Save

### Menu Dishes
- [ ] Go to **Menu > Dishes**
- [ ] Add a dish:
  - [ ] Select category
  - [ ] Enter name in Russian
  - [ ] Enter price
  - [ ] Add image (optional)
  - [ ] Set properties (New, Signature, Vegetarian, Spicy)
  - [ ] Save

## ✅ Test Key Features (10 minutes)

- [ ] **Dashboard**: Verify stats and recent activity are displayed
- [ ] **Menu Management**: Create/edit/delete a dish
- [ ] **Locations**: Edit a location, change hours
- [ ] **Activity Log**: Verify your actions are logged
- [ ] **Settings**: Change a setting and verify it's saved

## ✅ Troubleshooting (as needed)

### Backend won't start
- [ ] Check PostgreSQL is running: `psql -U postgres`
- [ ] Verify `.env` file has correct credentials
- [ ] Check if port 3000 is free: `lsof -i :3000` (Mac/Linux)
- [ ] Try different port: Change `PORT=3001` in `.env`

### Frontend won't start
- [ ] Check if port 5173 is free
- [ ] Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- [ ] Clear npm cache: `npm cache clean --force`

### Can't login
- [ ] Verify backend is running on http://localhost:3000
- [ ] Check `.env` has `CORS_ORIGIN=http://localhost:5173`
- [ ] Check browser console (F12) for errors
- [ ] Reset database: `cd server && npm run db:init`

### Database errors
- [ ] Verify PostgreSQL is running
- [ ] Check connection: `psql -U postgres -d mado_db`
- [ ] Reset database:
  ```bash
  psql -U postgres -c "DROP DATABASE mado_db;"
  psql -U postgres -c "CREATE DATABASE mado_db;"
  cd server && npm run db:init
  ```

## ✅ Production Deployment (when ready)

### Before Deploying
- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Set NODE_ENV=production
- [ ] Set database backups
- [ ] Test everything locally first

### Frontend Deployment
- [ ] Run: `npm run build`
- [ ] Deploy `dist` folder to:
  - [ ] Vercel (recommended, easiest)
  - [ ] Netlify
  - [ ] Your own server

### Backend Deployment
- [ ] Deploy to server (VPS, AWS, Heroku, etc.)
- [ ] Set production environment variables
- [ ] Enable HTTPS
- [ ] Set up monitoring and backups

## ✅ Ongoing Maintenance

- [ ] Weekly: Check activity log for unusual activity
- [ ] Monthly: Backup database
- [ ] Monthly: Update npm packages: `npm update`
- [ ] When needed: Reset admin password
- [ ] When needed: Add/remove users

## 📚 Documentation Reference

- **Full Setup Guide**: See `SETUP.md`
- **API Integration**: See `API_INTEGRATION.md`
- **Backend API Docs**: See `server/README.md`
- **Quick Reference**: See `QUICK_START.md`

## 🎯 Common Next Steps

After completing setup:

1. **Customize Settings**
   - Update restaurant information
   - Add social media links
   - Configure reservation settings

2. **Build Your Menu**
   - Create dish categories
   - Add menu items with prices
   - Add images and descriptions

3. **Set Up Locations**
   - Add all your branches
   - Set operating hours per location
   - Configure services per location

4. **Add Content**
   - Create FAQ entries
   - Write page content (Story, About, etc.)
   - Add promotions

5. **Configure Careers** (if using)
   - Create job vacancies
   - Review applications

6. **Go Live**
   - Review everything
   - Test all features
   - Deploy to production
   - Share with team

## 🆘 Need Help?

### Error Messages
- Check browser console (F12 → Console)
- Check backend terminal for error messages
- Check `.env` file for typos

### Database Issues
- Stop all services
- Restart PostgreSQL
- Run: `npm run db:init`

### API Issues
- Verify backend is running: `curl http://localhost:3000/health`
- Check VITE_API_URL in `.env.local`
- Check Authorization header (token)

### Stuck?
1. Check relevant documentation file
2. Verify all prerequisites are installed
3. Try clearing browser cache (Ctrl+Shift+Delete)
4. Restart both backend and frontend
5. Reinitialize database

## ✨ Success!

When you see all these ✅ checked off, your MADO Admin Panel is ready!

```
Backend: http://localhost:3000
Frontend: http://localhost:5173/admin
Login: admin@madouz.uz / password
```

**Congratulations! Your admin panel is operational!** 🎉

---

**Last Updated**: 2026-08-17  
**Status**: Ready for Production ✅
