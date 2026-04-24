# Nexus Portal — Django + React Authentication

A full-stack authentication system using:
- **Backend**: Django 4.2 + Django REST Framework (Simple Token Auth)
- **Frontend**: React 18 + Vite + Tailwind CSS v4
- **Database**: MySQL via XAMPP

---

## 📁 Project Structure

```
auth_project/
├── backend/
│   ├── core/                     # Django project config
│   │   ├── __init__.py
│   │   ├── settings.py           # All Django settings
│   │   ├── urls.py               # Root URL config
│   │   └── wsgi.py
│   ├── authentication/           # Auth app
│   │   ├── __init__.py
│   │   ├── admin.py              # Admin panel config
│   │   ├── apps.py
│   │   ├── models.py             # UserProfile model
│   │   ├── serializers.py        # Login & User serializers
│   │   ├── urls.py               # Auth endpoints
│   │   └── views.py              # login, logout, profile, verify
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js           # Axios instance + interceptors
    │   │   └── auth.js            # Auth API calls
    │   ├── components/
    │   │   ├── AccessDeniedModal.jsx  # Invalid credentials modal
    │   │   └── ProtectedRoute.jsx     # Route guard
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx      # Login form
    │   │   └── DashboardPage.jsx  # Post-login dashboard
    │   ├── App.jsx                # Router setup
    │   ├── main.jsx               # Entry point
    │   └── index.css              # Global styles + CSS vars
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Setup Instructions

### Step 1 — XAMPP MySQL Setup

1. Start **XAMPP** and launch **phpMyAdmin** (`http://localhost/phpmyadmin`)
2. Create a new database:
   ```sql
   CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Default XAMPP MySQL credentials:
   - **Host**: `127.0.0.1`
   - **Port**: `3306`
   - **User**: `root`
   - **Password**: *(empty)*

   > If you have a password set, update `DATABASES['default']['PASSWORD']` in `backend/core/settings.py`.

---

### Step 2 — Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (creates all tables in auth_db)
python manage.py migrate

# Create a superuser to test login
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

Backend runs on: **http://127.0.0.1:8000**

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend runs on: **http://localhost:5173**

> The Vite proxy is configured to forward `/api/*` requests to Django automatically.

---

## 🔐 API Endpoints

| Method | Endpoint              | Auth Required | Description              |
|--------|-----------------------|---------------|--------------------------|
| POST   | `/api/auth/login/`    | No            | Login, returns token     |
| POST   | `/api/auth/logout/`   | Yes (Token)   | Deletes token            |
| GET    | `/api/auth/profile/`  | Yes (Token)   | Returns user info        |
| GET    | `/api/auth/verify/`   | Yes (Token)   | Validates token          |

### Login Request
```json
POST /api/auth/login/
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### Login Response (Success)
```json
{
  "success": true,
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "department": null
  }
}
```

### Login Response (Failure)
```json
HTTP 401 Unauthorized
{
  "success": false,
  "message": "Invalid credentials. You do not have access.",
  "errors": { ... }
}
```

### Authenticated Request Header
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

---

## 🗄️ Database Tables Created

| Table                  | Description                        |
|------------------------|------------------------------------|
| `auth_user`            | Django built-in user model         |
| `authtoken_token`      | Django REST Framework token table  |
| `user_profiles`        | Extended profile (dept, login IP)  |

---

## 🎨 Design Features

- **Dark luxury aesthetic** — deep navy/charcoal with gold (#c9a84c) accents
- **Playfair Display** serif for headings, **DM Sans** for body
- Split-panel layout (decorative left, form right)
- Shimmer gold text animation
- Password show/hide toggle
- Inline field validation
- **Access Denied Modal** with pulse animation on invalid credentials
- Token display on dashboard
- Fully responsive

---

## 🔧 Adding Users via Admin

1. Go to: `http://127.0.0.1:8000/admin/`
2. Login with your superuser credentials
3. Go to **Users** → **Add User**
4. Set username, password, and profile department

---

## 📝 Notes

- Tokens are persistent (do not expire by default). To add expiry, consider `djangorestframework-simplejwt`.
- The `UserProfile` model extends Django's built-in `User` with a department field and last login IP tracking.
- CORS is configured to allow `localhost:5173` and `localhost:3000` only. Update `CORS_ALLOWED_ORIGINS` in settings for production.
