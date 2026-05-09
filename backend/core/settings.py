"""
Django settings for auth_project — using Djoser for authentication.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-change-this-in-production-xk3#@!mz9q'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'djoser',
    'authentication',
    'items',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database - MySQL via XAMPP
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'auth_db',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}



# ─── Email Configuration (SMTP via Gmail) ──────────────────────────────────────
# To use Gmail:
#   1. Enable 2-Step Verification on your Google Account
#   2. Generate an App Password: myaccount.google.com → Security → App Passwords
#   3. Replace the placeholders below with your credentials
#
# For local development / testing without a real SMTP server, switch to:
#   EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
#   This prints emails to the terminal instead of sending them.

EMAIL_BACKEND   = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST      = 'smtp.gmail.com'
EMAIL_PORT      = 587
EMAIL_USE_TLS   = True
EMAIL_HOST_USER     = 'rojo.dave2004@gmail.com'   # ← replace
EMAIL_HOST_PASSWORD = 'wkwt kudx urtf qoww'         # ← replace (App Password, not account password)
DEFAULT_FROM_EMAIL  = EMAIL_HOST_USER

# ─────────────────────────────────────────────────────────────────────────────
# IMPORTANT NOTES
# ─────────────────────────────────────────────────────────────────────────────
# • Never commit real credentials to version control.
#   Use environment variables in production, e.g.:
#       import os
#       EMAIL_HOST_USER     = os.environ.get('EMAIL_HOST_USER', '')
#       EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
#
# • Gmail blocks "less secure app access" by default.
#   App Passwords are the correct way to authenticate.
#
# • Other SMTP providers (Outlook, Yahoo, SendGrid, Mailgun) work too;
#   simply change EMAIL_HOST, EMAIL_PORT, and EMAIL_USE_TLS accordingly.
# ─────────────────────────────────────────────────────────────────────────────

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Manila'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── REST Framework ────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# ─── Djoser Configuration ──────────────────────────────────────────────────────
DJOSER = {
    'LOGIN_FIELD': 'username',
    'USER_CREATE_PASSWORD_RETYPE': False,
    'SERIALIZERS': {
        'user': 'authentication.serializers.UserSerializer',
        'current_user': 'authentication.serializers.UserSerializer',
        'user_create': 'authentication.serializers.RegisterSerializer',
    },
    'PERMISSIONS': {
        # Only admins can list all users via /api/auth/users/
        'user_list': ['authentication.permissions.IsAdminUser'],
        # Any authenticated user can view/update their own profile via /api/auth/users/me/
        'current_user': ['rest_framework.permissions.IsAuthenticated'],
        # Viewing other users by ID is admin only
        'user': ['authentication.permissions.IsAdminUser'],
    },
    # Must be False so users can access their own /users/me/ endpoint
    'HIDE_USERS': False,
}

# Relaxed password validation for development
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

# ─── CORS ──────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True

# ─── Logging ───────────────────────────────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
}