# Settings Operations - Complete Reference

Полная документация всех операций с настройками (Settings) в MADO Admin System.

## 📋 Содержание
- [Backend API Routes](#backend-api-routes)
- [Frontend API Client Methods](#frontend-api-client-methods)
- [Testing All Operations](#testing-all-operations)
- [Error Handling](#error-handling)
- [Security Notes](#security-notes)

---

## Backend API Routes

### GET /api/settings
**Получить все настройки**

```bash
# Requires authentication & admin role
curl -X GET http://localhost:3000/api/settings \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "siteName": "MADO UZ",
  "email": "hello@madouz.uz",
  "phone": "+998 71 123 45 67",
  "currency": "UZS",
  // ... all settings
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

---

### GET /api/settings/:key
**Получить одну настройку по ключу**

```bash
# Requires authentication & admin role
curl -X GET http://localhost:3000/api/settings/siteName \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
"MADO UZ"
```

or (if value is JSON):
```json
{
  "value": "MADO UZ"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - Setting not found
- `500` - Server error

---

### PUT /api/settings/:key
**Обновить одну настройку**

```bash
# Requires authentication & admin role
curl -X PUT http://localhost:3000/api/settings/siteName \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "MADO TASHKENT"}'
```

**Request Body:**
```json
{
  "value": "MADO TASHKENT"
}
```

**Response:**
```json
{
  "message": "Setting updated",
  "key": "siteName",
  "value": "MADO TASHKENT"
}
```

**Activity Logged:**
- User ID
- Action: `update`
- Target Type: `setting`
- Details: `Updated setting: siteName`

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing value or key)
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

---

### PUT /api/settings
**Обновить несколько настроек за раз (Bulk Update)**

```bash
# Requires authentication & admin role
curl -X PUT http://localhost:3000/api/settings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "siteName": "MADO TASHKENT",
    "email": "new@madouz.uz",
    "phone": "+998 90 999 99 99"
  }'
```

**Request Body:**
```json
{
  "siteName": "MADO TASHKENT",
  "email": "new@madouz.uz",
  "phone": "+998 90 999 99 99"
}
```

**Response:**
```json
{
  "message": "Settings updated",
  "count": 3
}
```

**Activity Logged:**
- User ID
- Action: `bulk_update`
- Target Type: `setting`
- Details: `Updated 3 settings`

**Status Codes:**
- `200` - Success
- `400` - Bad request (empty settings or invalid keys)
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

---

### DELETE /api/settings/:key
**Удалить одну настройку**

```bash
# Requires authentication & admin role
curl -X DELETE http://localhost:3000/api/settings/ogImage \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "message": "Setting deleted",
  "key": "ogImage"
}
```

**Activity Logged:**
- User ID
- Action: `delete`
- Target Type: `setting`
- Details: `Deleted setting: ogImage`

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing key)
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - Setting not found
- `500` - Server error

---

## Frontend API Client Methods

### JavaScript/TypeScript Usage

```typescript
import api from '@/lib/api';

// Get all settings
const allSettings = await api.getSettings();

// Get single setting
const siteName = await api.getSetting('siteName');

// Update single setting
await api.updateSetting('email', 'new@madouz.uz');

// Update multiple settings
await api.updateSettings({
  siteName: 'MADO TASHKENT',
  email: 'new@madouz.uz',
  phone: '+998 90 999 99 99'
});

// Delete setting
await api.deleteSetting('ogImage');
```

### Error Handling

```typescript
try {
  await api.updateSettings(settings);
} catch (error) {
  if (error.response?.status === 401) {
    console.log('Authentication failed');
  } else if (error.response?.status === 403) {
    console.log('Permission denied - admin access required');
  } else if (error.response?.status === 400) {
    console.log('Validation error - check request body');
  } else {
    console.log('Server error:', error.message);
  }
}
```

---

## Testing All Operations

### 1. Test with cURL

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@madouz.uz","password":"password"}' \
  | jq -r '.token')

# 2. Get all settings
curl -X GET http://localhost:3000/api/settings \
  -H "Authorization: Bearer $TOKEN"

# 3. Update single setting
curl -X PUT http://localhost:3000/api/settings/siteName \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"MADO TEST"}'

# 4. Bulk update
curl -X PUT http://localhost:3000/api/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998 90 111 11 11",
    "email": "test@madouz.uz"
  }'

# 5. Get single setting
curl -X GET http://localhost:3000/api/settings/siteName \
  -H "Authorization: Bearer $TOKEN"

# 6. Delete setting
curl -X DELETE http://localhost:3000/api/settings/ogImage \
  -H "Authorization: Bearer $TOKEN"

# 7. Verify it's deleted
curl -X GET http://localhost:3000/api/settings/ogImage \
  -H "Authorization: Bearer $TOKEN"
  # Should return 404
```

### 2. Test with Frontend Admin Panel

1. Open http://localhost:5173/admin/settings
2. Change any field (e.g., Site Name)
3. Click "Save Changes" button
4. Verify "Saved!" message appears
5. Refresh page - value should be persisted
6. Check browser console for any errors

### 3. Test Error Cases

```bash
TOKEN="valid_token_here"

# Test missing value
curl -X PUT http://localhost:3000/api/settings/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# Should return 400: Value required

# Test empty settings
curl -X PUT http://localhost:3000/api/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
# Should return 400: Settings object is required

# Test with invalid token
curl -X GET http://localhost:3000/api/settings \
  -H "Authorization: Bearer invalid_token"
# Should return 401: Unauthorized

# Test non-existent setting
curl -X GET http://localhost:3000/api/settings/nonexistent \
  -H "Authorization: Bearer $TOKEN"
# Should return 404: Setting not found
```

---

## Error Handling

### Common Error Responses

```json
{
  "error": "Value required"
}
```

```json
{
  "error": "Setting key is required"
}
```

```json
{
  "error": "Settings object is required"
}
```

```json
{
  "error": "Invalid setting key"
}
```

```json
{
  "error": "Setting not found"
}
```

```json
{
  "error": "Failed to retrieve settings"
}
```

### Frontend Error Display

Settings page displays errors in red alert box:
```
⚠️ [Error message from API]
```

---

## Security Notes

### ✅ What's Implemented

1. **Authentication Required** - All operations require valid JWT token
2. **Authorization Check** - Only admin users can modify settings
3. **Input Validation** - Keys and values are validated
4. **SQL Injection Protection** - Parameterized queries
5. **Activity Logging** - All changes are logged with user ID
6. **Error Handling** - Proper error messages and status codes

### ⚠️ Production Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET (32+ chars)
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting to API
- [ ] Implement setting value size limits
- [ ] Add backup/restore functionality
- [ ] Implement audit trail view
- [ ] Add settings export/import

---

## Database Schema

```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Troubleshooting

### Settings not saving

**Symptoms:** Click "Save Changes" but nothing happens

**Solution:**
1. Check browser console (F12) for errors
2. Verify backend is running on port 3000
3. Check API proxy in vite.config.ts
4. Ensure token is valid (check auth)

### 401 Unauthorized error

**Symptoms:** API returns 401 when trying to save

**Solution:**
1. User is not logged in - login first
2. Token has expired - logout and login again
3. Check browser cookies/localStorage for valid token

### 403 Forbidden error

**Symptoms:** Logged in but getting 403

**Solution:**
1. User is not admin - only admins can modify settings
2. Check user role in database: `SELECT role FROM users WHERE email='...';`

---

## Performance Tips

1. **Bulk updates** - Use `updateSettings()` for multiple changes instead of individual updates
2. **Caching** - Settings are loaded once on admin page load
3. **Debouncing** - Consider adding debounce to live preview features

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-17 | Initial implementation with CRUD + error handling |

