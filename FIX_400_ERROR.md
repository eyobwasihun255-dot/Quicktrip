# Fix for 400 Bad Request Error

## Problem
When accessing `/admin` or any API endpoint, you get a **400 Bad Request** error.

## Root Cause
Django's `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` settings were not properly configured for Render deployment.

## Solution Applied

### 1. Fixed `ALLOWED_HOSTS` Configuration
Updated `backend/backend/settings.py` to properly handle environment variables:
- Now correctly parses `ALLOWED_HOSTS` from environment variable
- Handles empty strings properly
- Defaults to `['*']` for development if not set

### 2. Added `CSRF_TRUSTED_ORIGINS` Support
Added support for `CSRF_TRUSTED_ORIGINS` environment variable:
- Required for Django admin and CSRF-protected endpoints
- Properly parses comma-separated values

### 3. Updated CORS Configuration
Made CORS configuration use environment variables:
- Can now set `CORS_ALLOWED_ORIGINS` via environment variable
- Automatically disables `CORS_ALLOW_ALL_ORIGINS` when specific origins are set

## What You Need to Do on Render

### Step 1: Set Environment Variables
In your Render backend service, add/update these environment variables:

```
ALLOWED_HOSTS=your-backend-name.onrender.com
CSRF_TRUSTED_ORIGINS=https://your-backend-name.onrender.com
```

**Important Notes:**
- `ALLOWED_HOSTS` should NOT include `https://` or trailing `/`
- `CSRF_TRUSTED_ORIGINS` MUST include `https://` but NO trailing `/`
- Replace `your-backend-name` with your actual Render service name

**Example:**
If your service is named `quicktrip-backend`, then:
- `ALLOWED_HOSTS` = `quicktrip-backend.onrender.com`
- `CSRF_TRUSTED_ORIGINS` = `https://quicktrip-backend.onrender.com`

### Step 2: Redeploy
After setting the environment variables, redeploy your backend service.

### Step 3: Verify
Visit `https://your-backend-name.onrender.com/admin` - you should no longer see the 400 error.

---

## Creating Superuser

Since your project uses a custom User model with `phone_number` as the username field, use the custom management command:

### Option 1: Using Render Shell (Recommended)
1. Go to your Render service dashboard
2. Click on **"Shell"** tab
3. Run:
   ```bash
   python manage.py createsuperuser_custom --phone-number 912345678 --password yourpassword
   ```
   Replace `912345678` with your phone number (numeric only) and `yourpassword` with your desired password.

### Option 2: Using Environment Variables
1. Add to your Render environment variables:
   - `SUPERUSER_PHONE_NUMBER` = `912345678`
   - `SUPERUSER_PASSWORD` = `yourpassword`
2. In Render Shell, run:
   ```bash
   python manage.py createsuperuser_custom --no-input
   ```

### Option 3: Using Django Shell
1. In Render Shell, run:
   ```bash
   python manage.py shell
   ```
2. Execute:
   ```python
   from user.models import User
   User.objects.create_superuser(phone_number=912345678, password='yourpassword', user_type=User.type.ADMIN)
   exit()
   ```

---

## Quick Checklist

- [ ] Set `ALLOWED_HOSTS` environment variable (no `https://`)
- [ ] Set `CSRF_TRUSTED_ORIGINS` environment variable (with `https://`)
- [ ] Redeploy backend service
- [ ] Verify `/admin` works (no 400 error)
- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser using one of the methods above
- [ ] Log in to admin panel

