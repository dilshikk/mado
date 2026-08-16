# Admin Panel Security - Complete Guide

Полное описание системы защиты администраторской панели.

## 📋 Содержание
- [Архитектура авторизации](#архитектура-авторизации)
- [Компоненты](#компоненты)
- [Поток авторизации](#поток-авторизации)
- [Использование](#использование)
- [Тестирование](#тестирование)
- [Производственный чеклист](#производственный-чеклист)

---

## Архитектура авторизации

### Как это работает:

```
Пользователь
    ↓
/admin/login (Login Page)
    ↓
Проверка учетных данных (API /auth/login)
    ↓
Получение JWT токена
    ↓
Сохранение в localStorage
    ↓
Редирект на /admin/dashboard
    ↓
Проверка токена (AdminLayout useEffect)
    ↓
Доступ к админ панели ✓
```

### Если токена нет или он истекся:

```
Прямой доступ на /admin/*
    ↓
AdminLayout проверяет токен
    ↓
Токена нет → Редирект на /admin/login
    ↓
Пользователь видит форму логина
```

---

## Компоненты

### 1. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)

Компонент для защиты маршрутов (опционально, текущая реализация в AdminLayout).

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Использование:
<ProtectedRoute>
  <AdminLayout />
</ProtectedRoute>
```

### 2. **AdminLayout** (`src/pages/admin/layout.tsx`)

Основной компонент админ панели с проверкой авторизации.

**Что делает:**
- ✓ Проверяет наличие токена в `localStorage`
- ✓ Валидирует токен через API (`/api/auth/me`)
- ✓ Показывает экран загрузки пока идет проверка
- ✓ Редиректит на логин если токена нет
- ✓ Предоставляет кнопку "Logout" в сайдбаре
- ✓ Показывает сообщение об ошибке при проблемах с авторизацией

**Ключевой код:**

```typescript
const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/admin/login', { state: { from: location } });
      return;
    }

    try {
      await api.getMe(); // Проверка валидности токена
      setIsAuthenticated(true);
    } catch (error) {
      // Токен невалидный - логаут
      localStorage.removeItem('token');
      api.clearToken();
      navigate('/admin/login');
    }
  };

  checkAuth();
}, [navigate, location]);
```

### 3. **AdminLoginPage** (`src/pages/admin/login.tsx`)

Страница логина для администраторов.

**Функции:**
- ✓ Форма с Email и Password
- ✓ Обработка логина через API (`/api/auth/login`)
- ✓ Сохранение токена в `localStorage` и в API клиенте
- ✓ Автоматический редирект если уже залогинен
- ✓ Красивая темная тема
- ✓ Показывает ошибки логина
- ✓ Состояние загрузки при логине

**Скрин:**
```
┌─────────────────────────────┐
│          MADO              │
│      Admin Panel            │
├─────────────────────────────┤
│  Admin Login                │
│                             │
│  Email: [admin@madouz.uz]   │
│  Password: [•••••••]        │
│                             │
│  [    Log In     ]          │
│                             │
│  Default credentials in     │
│  SETUP.md                   │
└─────────────────────────────┘
```

---

## Поток авторизации

### Логин:

```
1. Пользователь открывает /admin
   ↓
2. AdminLayout проверяет localStorage.getItem('token')
   ↓
3a. Токен есть → Проверяем валидность через api.getMe()
    ✓ Валиден → Показываем админ панель
    ✗ Невалиден → Логаут и редирект на логин
   
3b. Токена нет → Редирект на /admin/login
   ↓
4. Пользователь видит форму логина
   ↓
5. Вводит email и пароль, нажимает "Log In"
   ↓
6. Отправляем POST /api/auth/login
   ↓
7a. ✓ Получили токен
    - Сохраняем в localStorage
    - Передаем в ApiClient (api.setToken())
    - Редиректим на /admin
   
7b. ✗ Ошибка
    - Показываем сообщение об ошибке
    - Пользователь может попробовать снова
```

### Логаут:

```
1. Пользователь нажимает "Logout" в сайдбаре
   ↓
2. handleLogout():
   - api.clearToken()
   - localStorage.removeItem('token')
   - navigate('/admin/login')
   ↓
3. Редирект на страницу логина
```

---

## Использование

### В компонентах админки:

```typescript
// Все компоненты админки уже защищены!
// Если пользователь не залогинен - он не сможет открыть админку

// Но если нужно проверить авторизацию внутри компонента:
import api from '@/lib/api';
import { useEffect, useState } from 'react';

function MyAdminComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    loadUser();
  }, []);

  return <div>User: {user?.name}</div>;
}
```

### Получение токена:

```typescript
// Получить текущий токен
const token = localStorage.getItem('token');

// Или из API клиента
import api from '@/lib/api';
const token = api.getToken();
```

### Очистка авторизации:

```typescript
import api from '@/lib/api';

// Способ 1: Через API клиент
api.clearToken();

// Способ 2: Напрямую через localStorage
localStorage.removeItem('token');
```

---

## Тестирование

### 1. Локальное тестирование:

```bash
# Запустить dev сервер
npm run dev

# Открыть в браузере
http://localhost:5173/admin

# Должны увидеть логин форму (если не авторизованы)
```

### 2. Тест логина:

```
1. Открыть http://localhost:5173/admin
2. Видим форму логина
3. Email: admin@madouz.uz
4. Password: password (или из .env)
5. Нажимаем "Log In"
6. Должны попасть в админ панель
7. Проверяем что в DevTools → Application → Local Storage есть 'token'
```

### 3. Тест логаута:

```
1. В админ панели нажимаем красную кнопку "Logout"
2. Должны вернуться на /admin/login
3. В DevTools → Local Storage должно исчезнуть значение 'token'
4. Попытка открыть /admin/dashboard напрямую → редирект на логин
```

### 4. Тест истекшего токена:

```
1. Авторизоваться (получить токен)
2. Открыть DevTools → Application → Local Storage
3. Отредактировать 'token' на какое-то случайное значение
4. Перезагрузить страницу
5. Должны видеть экран загрузки → редирект на логин
```

### 5. Тест прямого доступа:

```
1. Очистить localStorage (DevTools → Application)
2. Попытаться открыть http://localhost:5173/admin/settings
3. Должны перенаправиться на /admin/login
4. После логина должны попасть на /admin/settings (сохранилась история)
```

---

## Производственный чеклист

### 🔒 Перед деплоем:

- [ ] Изменить дефолтный пароль администратора
  ```bash
  # В базе данных измените пароль:
  UPDATE users SET password_hash = '$2a$10$...' WHERE email = 'admin@madouz.uz';
  ```

- [ ] Генерировать сильный JWT_SECRET (32+ символа)
  ```env
  # .env
  JWT_SECRET=your-very-long-random-string-with-32-characters-or-more
  ```

- [ ] Включить HTTPS на продакшене
  ```typescript
  // vite.config.ts
  secure: true
  ```

- [ ] Установить SameSite cookies
  ```typescript
  // На бэкенде в коде установки cookies:
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  ```

- [ ] Добавить Content Security Policy (CSP)
  ```typescript
  // nginx.conf или Express middleware
  'Content-Security-Policy': "default-src 'self'"
  ```

- [ ] Включить HSTS (HTTP Strict Transport Security)
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```

- [ ] Логирование попыток логина (успешные и неудачные)

- [ ] Мониторинг попыток брутфорса

- [ ] Регулярное резервное копирование

- [ ] Двухфакторная авторизация (2FA) - опционально

---

## Защита API эндпоинтов

### Все админ эндпоинты требуют авторизацию:

```javascript
// backend/src/middleware/auth.js
export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export async function authorize(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### Пример использования:

```javascript
// Только admin может обновлять настройки
router.put('/settings', authenticate, authorize(['admin']), async (req, res) => {
  // ... код
});
```

---

## Часто задаваемые вопросы

### Q: Где хранится токен?
**A:** В `localStorage` браузера под ключом `'token'`. Также передается в заголовке `Authorization: Bearer TOKEN` для каждого запроса.

### Q: Что если пользователь откроет админку в разных браузерах?
**A:** Каждый браузер имеет свой `localStorage`, поэтому авторизация в одном браузере не влияет на другие браузеры.

### Q: Как долго живет токен?
**A:** По умолчанию JWT токены живут определенное время (обычно 7 дней или 24 часа в зависимости от конфигурации). Время жизни设置在бэкенде.

### Q: Что произойдет если токен истечет?
**A:** При следующем обращении к API получим 401, AdminLayout перехватит ошибку и редиректит на логин.

### Q: Может ли кто-то украсть токен?
**A:** 
- ✓ Если `localStorage` в браузере - риск XSS атак
- ✓ Если `httpOnly cookies` - более безопасно
- Рекомендация: Используйте `httpOnly cookies` вместо `localStorage`

### Q: Как настроить 2FA?
**A:** Это требует расширения логики аутентификации. Нужно:
1. Сохранять в БД `2fa_secret` для каждого пользователя
2. При логине проверять не только пароль, но и код из 2FA приложения
3. Возвращать токен только после验证 обоих факторов

---

## Ссылки

- [JWT Authentication Handbook](https://auth0.com/intro-to-iam/jwt-json-web-token)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/overview)

---

## Версия

| Версия | Дата | Изменения |
|--------|------|----------|
| 1.0 | 2026-08-17 | Начальная реализация с JWT авторизацией |
