# QuickTrip Deployment Guide for Render

## Step-by-Step Deployment Instructions

### Prerequisites
- GitHub account with your code pushed to a repository
- Render account (sign up at https://render.com)

---

## PART 1: Deploy PostgreSQL Database

### Step 1: Create PostgreSQL Database on Render

1. Log in to your Render dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `quicktrip-db` (or your preferred name)
   - **Database**: `quicktrip` (or your preferred name)
   - **User**: Auto-generated (or custom)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: Latest stable (14+)
   - **Plan**: Free tier (or paid if needed)
4. Click **"Create Database"**
5. **IMPORTANT**: Copy the **Internal Database URL** (you'll need this later)
   - Format: `postgresql://user:password@host:port/dbname`

---

## PART 2: Deploy Django Backend

### Step 2: Create Backend Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

   **Basic Settings:**
   - **Name**: `quicktrip-backend` (or your preferred name)
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` ⚠️ **IMPORTANT: Set this to `backend`**
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command**: 
     ```bash
     gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
     ```

### Step 3: Configure Backend Environment Variables

In the **Environment** section, add these variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DATABASE_URL` | `[Your PostgreSQL Internal Database URL]` | From Step 1 |
| `SECRET_KEY` | `[Generate a random secret key]` | Use: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `False` | Set to False for production |
| `ALLOWED_HOSTS` | `your-backend-name.onrender.com` | Replace with your actual Render service name |
| `CSRF_TRUSTED_ORIGINS` | `https://your-backend-name.onrender.com` | Replace with your actual Render service URL |
| `PYTHONUNBUFFERED` | `1` | Recommended for Python logging |

**Example:**
- If your service name is `quicktrip-backend`, then:
  - `ALLOWED_HOSTS` = `quicktrip-backend.onrender.com`
  - `CSRF_TRUSTED_ORIGINS` = `https://quicktrip-backend.onrender.com`

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Note your backend URL: `https://your-backend-name.onrender.com`

### Step 5: Run Database Migrations

1. After deployment, go to your service dashboard
2. Click on **"Shell"** tab (or use **"Manual Deploy"** → **"Run in Shell"**)
3. Run these commands:
   ```bash
   python manage.py migrate
   ```
4. Wait for migrations to complete

### Step 6: Create Superuser

You have **two options**:

#### Option A: Using Custom Management Command (Recommended)

1. In the Render Shell, run:
   ```bash
   python manage.py createsuperuser_custom --phone-number YOUR_PHONE_NUMBER --password YOUR_PASSWORD
   ```
   Replace `YOUR_PHONE_NUMBER` with a numeric phone number (e.g., `912345678`) and `YOUR_PASSWORD` with your desired password.

#### Option B: Using Environment Variables (Non-Interactive)

1. Add these environment variables to your Render service:
   - `SUPERUSER_PHONE_NUMBER` = `912345678` (your phone number)
   - `SUPERUSER_PASSWORD` = `your-secure-password`

2. In Render Shell, run:
   ```bash
   python manage.py createsuperuser_custom --no-input
   ```

#### Option C: Using Django Shell (Alternative)

1. In Render Shell, run:
   ```bash
   python manage.py shell
   ```
2. Then execute:
   ```python
   from user.models import User
   User.objects.create_superuser(phone_number=912345678, password='your-password', user_type=User.type.ADMIN)
   ```
3. Type `exit()` to leave the shell

### Step 7: Verify Backend is Working

1. Visit: `https://your-backend-name.onrender.com/admin`
2. You should see the Django admin login page (no 400 error)
3. Log in with your superuser credentials

---

## PART 3: Deploy React Frontend

### Step 8: Create Frontend Static Site

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:

   **Basic Settings:**
   - **Name**: `quicktrip-frontend` (or your preferred name)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT: Set this to `frontend`**
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`

### Step 9: Configure Frontend Environment Variables

In the **Environment** section, add:

| Variable Name | Value |
|--------------|-------|
| `VITE_API_URL` | `https://your-backend-name.onrender.com/` ⚠️ **Must end with `/`** |

**Example:**
- If your backend URL is `https://quicktrip-backend.onrender.com`, then:
  - `VITE_API_URL` = `https://quicktrip-backend.onrender.com/`

### Step 10: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for build to complete (3-5 minutes)
3. Note your frontend URL: `https://your-frontend-name.onrender.com`

### Step 11: Update Backend CORS Settings (Optional but Recommended)

For better security, update your backend CORS settings:

1. Go to your backend service → **Environment** tab
2. Add/Update:
   - `CORS_ALLOWED_ORIGINS` = `https://your-frontend-name.onrender.com`
3. Update `backend/backend/settings.py` to use this environment variable:
   ```python
   # In settings.py, replace CORS_ALLOW_ALL_ORIGINS = True with:
   cors_origins_env = os.getenv('CORS_ALLOWED_ORIGINS', '').strip()
   if cors_origins_env:
       CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]
       CORS_ALLOW_ALL_ORIGINS = False
   else:
       CORS_ALLOW_ALL_ORIGINS = True
   ```
4. Redeploy the backend

---

## Troubleshooting

### Issue: 400 Bad Request Error on `/admin` or API endpoints

**Solution:**
1. Check that `ALLOWED_HOSTS` environment variable includes your Render domain
2. Check that `CSRF_TRUSTED_ORIGINS` includes your backend URL with `https://`
3. Make sure there are no extra spaces in environment variable values
4. Redeploy after making changes

**Example of correct values:**
- `ALLOWED_HOSTS` = `quicktrip-backend.onrender.com` (no `https://`, no trailing slash)
- `CSRF_TRUSTED_ORIGINS` = `https://quicktrip-backend.onrender.com` (with `https://`)

### Issue: Cannot create superuser

**Solution:**
1. Make sure migrations have run: `python manage.py migrate`
2. Use the custom command: `python manage.py createsuperuser_custom`
3. Phone number must be numeric (no dashes, spaces, or special characters)
4. User model requires `user_type`, which is automatically set to ADMIN for superusers

### Issue: Frontend cannot connect to backend

**Solution:**
1. Verify `VITE_API_URL` ends with `/`
2. Check backend is running and accessible
3. Check CORS settings in backend
4. Check browser console for specific error messages

### Issue: Static files not loading

**Solution:**
1. Make sure `collectstatic` runs during build: `python manage.py collectstatic --noinput`
2. Verify WhiteNoise is configured in `settings.py`
3. Check `STATIC_ROOT` is set correctly

### Issue: Database connection errors

**Solution:**
1. Verify `DATABASE_URL` is set correctly (use Internal Database URL)
2. Check database is running in Render dashboard
3. Verify `psycopg2-binary` is in `requirements.txt`

---

## Quick Reference: Environment Variables Summary

### Backend Environment Variables:
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-backend-name.onrender.com
CSRF_TRUSTED_ORIGINS=https://your-backend-name.onrender.com
PYTHONUNBUFFERED=1
```

### Frontend Environment Variables:
```
VITE_API_URL=https://your-backend-name.onrender.com/
```

---

## Post-Deployment Checklist

- [ ] Backend is accessible at `https://your-backend-name.onrender.com/admin`
- [ ] Can log in to Django admin with superuser
- [ ] Frontend is accessible at `https://your-frontend-name.onrender.com`
- [ ] Frontend can make API calls to backend
- [ ] Database migrations are applied
- [ ] Static files are loading correctly
- [ ] CORS is configured properly

---

## Notes

- **Free Tier Limitations**: Render free tier services spin down after 15 minutes of inactivity. First request after spin-down may take 30-60 seconds.
- **Media Files**: Render's filesystem is ephemeral. Uploaded media files will be lost on redeploy. Consider using cloud storage (AWS S3, Cloudinary) for production.
- **Database Backups**: Set up automatic backups for your PostgreSQL database in Render dashboard.

---

## Support

If you encounter issues:
1. Check Render service logs in the dashboard
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are in `requirements.txt` and `package.json`

