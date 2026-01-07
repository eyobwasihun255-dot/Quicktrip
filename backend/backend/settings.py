"""
Production Settings Example for Render Deployment

This file shows the changes needed in settings.py for production deployment.
DO NOT use this file directly - instead, update your settings.py with these changes.

Key changes:
1. Use environment variables for SECRET_KEY and DEBUG
2. Configure PostgreSQL database using DATABASE_URL
3. Add WhiteNoise for static file serving
4. Update ALLOWED_HOSTS
5. Configure static files properly
"""

from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY: Use environment variable for SECRET_KEY
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key-change-in-production')

# SECURITY: Set DEBUG to False in production
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# Update ALLOWED_HOSTS with your Render domain
# Handle empty string case properly
allowed_hosts_env = os.getenv('ALLOWED_HOSTS', '').strip()
if allowed_hosts_env:
    ALLOWED_HOSTS = [host.strip() for host in allowed_hosts_env.split(',') if host.strip()]
else:
    # Default to allow all hosts (for development) - change to specific domains in production
    ALLOWED_HOSTS = ['*']

# CSRF trusted origins - required for admin and API requests
csrf_origins_env = os.getenv('CSRF_TRUSTED_ORIGINS', '').strip()
if csrf_origins_env:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_origins_env.split(',') if origin.strip()]
else:
    CSRF_TRUSTED_ORIGINS = []


REST_FRAMEWORK = {
     "DEFAULT_AUTHENTICATION_CLASSES":(
         "rest_framework_simplejwt.authentication.JWTAuthentication",
     ),
     "DEFAULT_PERMISSION_CLASSES":[
         "rest_framework.permissions.IsAuthenticated",
     ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30000),
    "REFRESH_TOKEN_LIFETIME": timedelta(days =100)
}


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'alert',
    'booking',
    'payment',
    'user',
    'vehicle_management',
    'rest_framework',
    'corsheaders', 
    'api', 
    'whitenoise.runserver_nostatic',  # Add WhiteNoise for static files
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add WhiteNoise middleware (after SecurityMiddleware)
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, "templates")],
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

WSGI_APPLICATION = 'backend.wsgi.application'


# Database configuration - Use PostgreSQL on Render
# Render provides DATABASE_URL environment variable
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Fallback to SQLite for local development if DATABASE_URL is not set
if not os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',   
        }
    }


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files configuration for production
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files configuration
# NOTE: Render's filesystem is ephemeral - consider using cloud storage (S3, Cloudinary) for production
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL ='user.User'

# CORS configuration
# For production, consider restricting to specific origins instead of allowing all
cors_origins_env = os.getenv('CORS_ALLOWED_ORIGINS', '').strip()
if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]
    CORS_ALLOW_ALL_ORIGINS = False
else:
    CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins if not specified (for development)

CORS_ALLOW_CREDENTIALS = True




