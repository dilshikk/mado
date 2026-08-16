# MADO Admin Server - PostgreSQL API Backend

Complete REST API backend for MADO Admin Panel with PostgreSQL database.

## Features

✅ **Full Admin Module APIs**
- Menu Management (Categories, Dishes)
- Locations Management
- Promotions Management
- Reviews Management
- Request Handling (Contact, Catering, Applications)
- Career Vacancies & Applications
- FAQ Management
- Pages Management
- User Management
- Activity Logging
- Settings Management

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (admin, editor)
- Secure password hashing with bcrypt

✅ **Database**
- PostgreSQL with full schema
- Multilingual support (RU, UZ, EN, TR)
- Activity logging for all changes
- Relationship management

## Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mado_db
JWT_SECRET=your-secret-key-here
```

### 3. Initialize Database

Run the database initialization script:

```bash
npm run db:init
```

This will:
- Create all necessary tables
- Insert default admin user
- Insert default settings

**Default Admin User:**
- Email: `admin@madouz.uz`
- Password: `password` (change immediately in production)

### 4. Start Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only)
- `GET /api/auth/me` - Get current user

### Menu Management
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

- `GET /api/dishes` - List dishes
- `POST /api/dishes` - Create dish
- `PUT /api/dishes/:id` - Update dish
- `DELETE /api/dishes/:id` - Delete dish

### Locations
- `GET /api/locations` - List locations
- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Promotions
- `GET /api/promotions` - List promotions
- `POST /api/promotions` - Create promotion
- `PUT /api/promotions/:id` - Update promotion
- `DELETE /api/promotions/:id` - Delete promotion

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Submit review
- `PATCH /api/reviews/:id/status` - Update review status
- `DELETE /api/reviews/:id` - Delete review

### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Submit request
- `PATCH /api/requests/:id/status` - Update request status
- `DELETE /api/requests/:id` - Delete request

### Catering
- `GET /api/catering/requests` - List catering requests
- `POST /api/catering/requests` - Submit catering request
- `PATCH /api/catering/requests/:id/status` - Update status
- `GET /api/catering/content` - Get catering page content
- `PUT /api/catering/content` - Update catering page content

### Careers
- `GET /api/vacancies` - List vacancies
- `POST /api/vacancies` - Create vacancy
- `PUT /api/vacancies/:id` - Update vacancy
- `DELETE /api/vacancies/:id` - Delete vacancy

- `GET /api/applications` - List applications
- `POST /api/applications` - Submit application
- `PATCH /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Delete application

### FAQ
- `GET /api/faq` - List FAQ items
- `POST /api/faq` - Create FAQ item
- `PUT /api/faq/:id` - Update FAQ item
- `DELETE /api/faq/:id` - Delete FAQ item

### Pages
- `GET /api/pages` - List pages
- `GET /api/pages/:slug` - Get page by slug
- `POST /api/pages` - Create page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get setting by key
- `PUT /api/settings/:key` - Update setting
- `PUT /api/settings` - Bulk update settings

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/reset-password` - Reset password
- `DELETE /api/users/:id` - Delete user

### Activity Log
- `GET /api/activity` - Get activity log
- `GET /api/activity/:type/:id` - Get activity for entity

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

To get a token, login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@madouz.uz",
    "password": "password"
  }'
```

Response includes token to use for subsequent requests.

## Database Schema

### Core Tables
- `users` - Admin users with roles
- `settings` - Global configuration
- `activity_log` - All admin actions

### Menu System
- `menu_categories` - Dish categories
- `dishes` - Menu items in multiple languages

### Location Management
- `locations` - Restaurant branches
- `location_hours` - Operating hours per day
- `location_services` - Services offered

### Content Management
- `promotions` - Special offers
- `promotion_pages` - Page associations
- `reviews` - Customer reviews
- `pages` - Website pages
- `faq` - FAQ items

### Request Management
- `requests` - Contact/inquiry requests
- `catering_requests` - Catering inquiries

### Careers
- `vacancies` - Job postings
- `applications` - Job applications

### Media
- `media` - Uploaded files

## Development

### File Structure

```
server/
├── src/
│   ├── index.js                 # Main server entry
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── db/
│   │   ├── pool.js             # Database connection pool
│   │   └── init.js             # Database initialization
│   └── routes/
│       ├── auth.js
│       ├── dishes.js
│       ├── categories.js
│       ├── locations.js
│       ├── promotions.js
│       ├── reviews.js
│       ├── requests.js
│       ├── catering.js
│       ├── vacancies.js
│       ├── applications.js
│       ├── faq.js
│       ├── settings.js
│       ├── users.js
│       ├── activity.js
│       └── pages.js
├── .env.example                # Environment variables template
└── package.json
```

### Running Tests

To test API endpoints, use curl or Postman. Examples:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@madouz.uz","password":"password"}'

# Get categories
curl http://localhost:3000/api/categories

# Create category (requires auth)
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"label":"New Category","tab":"food"}'
```

## Environment Variables

```
DB_HOST          PostgreSQL host
DB_PORT          PostgreSQL port
DB_USER          PostgreSQL user
DB_PASSWORD      PostgreSQL password
DB_NAME          Database name
PORT             Server port (default: 3000)
NODE_ENV         development or production
JWT_SECRET       Secret for JWT signing
CORS_ORIGIN      Frontend URL for CORS
```

## Security Considerations

⚠️ **Production Setup:**

1. **Change default password immediately**
2. **Use strong JWT_SECRET** (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. **Enable HTTPS**
4. **Set NODE_ENV=production**
5. **Use strong database password**
6. **Configure CORS properly**
7. **Add rate limiting**
8. **Set up database backups**
9. **Use environment variables for all secrets**
10. **Enable database logging**

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running
- Check DB_HOST and DB_PORT in .env
- Verify database credentials

### Database Already Exists
- Drop and recreate: `psql -U postgres -c "DROP DATABASE mado_db;"`
- Then run `npm run db:init` again

### Token Expired
- Tokens expire in 7 days
- Login again to get new token

### Permission Denied
- Verify user role has required permissions
- Admin role needed for destructive operations
- Editor role for content changes

## Support

For issues or questions:
1. Check PostgreSQL is running
2. Verify environment variables in .env
3. Check logs in terminal
4. Ensure Node.js version 16+

## License

ISC
