# Fix 500 Error on Django Admin Login

## Common Causes & Solutions

### 1. Check Render Logs First

The most important step is to check what the actual error is:

1. Go to Render Dashboard → Your Backend Service
2. Click **"Logs"** tab
3. Try to login again
4. Look for the error message in the logs
5. The error will tell you exactly what's wrong

---

## Most Common Fixes

### Fix 1: Environment Variables Not Set

**Symptoms:** 500 error, logs show `SECRET_KEY` or `DATABASE_URL` errors

**Solution:**
1. Go to Render → Backend Service → **Environment** tab
2. Make sure these are set:
   - `SECRET_KEY` - Must be set! Generate one if missing
   - `DATABASE_URL` - Must be your PostgreSQL connection string
   - `ALLOWED_HOSTS` - Your Render domain
   - `CSRF_TRUSTED_ORIGINS` - Your backend URL with `https://`

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

### Fix 2: Database Connection Issues

**Symptoms:** 500 error, logs show database connection errors

**Solution:**
1. Verify `DATABASE_URL` is correct in Environment variables
2. Make sure PostgreSQL database is running in Render
3. Make sure migrations have run:
   - Check build logs for `migrate` command output
   - If migrations failed, check the error

**Test database connection:**
Add this to your build command temporarily:
```bash
python manage.py migrate --check
```

---

### Fix 3: CSRF Token Issues

**Symptoms:** 500 error when submitting login form

**Solution:**
1. Make sure `CSRF_TRUSTED_ORIGINS` is set:
   - Value: `https://your-backend-name.onrender.com`
   - Must include `https://`
   - No trailing slash

2. Verify in settings.py that CSRF_TRUSTED_ORIGINS is being used correctly

---

### Fix 4: Phone Number Format Issues

**Symptoms:** 500 error, logs show phone number validation errors

**Solution:**
When logging in, make sure:
- Enter only numeric characters (no dashes, spaces, or special characters)
- Example: `911111111` ✅
- Example: `911-111-111` ❌

---

### Fix 5: User Doesn't Exist or Password Wrong

**Symptoms:** 500 error, but might actually be authentication failing

**Solution:**
1. Verify user exists:
   - Check build logs for superuser creation message
   - Should see: `SUCCESS: Created a with phone 911111111`

2. Use correct credentials:
   - Phone: `911111111` (from create_superuser.py)
   - Password: `admin@123` (from create_superuser.py)

---

### Fix 6: Missing Static Files

**Symptoms:** 500 error, logs show static files not found

**Solution:**
1. Make sure build command includes:
   ```bash
   python manage.py collectstatic --noinput
   ```

2. Verify WhiteNoise is in settings.py:
   - `INSTALLED_APPS` includes `'whitenoise.runserver_nostatic'`
   - `MIDDLEWARE` includes `'whitenoise.middleware.WhiteNoiseMiddleware'`

---

### Fix 7: Custom User Model Authentication Issue

**Symptoms:** 500 error specifically on admin login page

**Solution:**
The custom admin configuration has been added to `backend/user/admin.py`. Make sure:
1. The file is committed and pushed to GitHub
2. The service has been redeployed after the change
3. The User model is properly registered

---

## Debugging Steps

### Step 1: Enable Debug Mode Temporarily

1. In Render → Environment variables:
   - Set `DEBUG=True`
2. Redeploy
3. Try to login - you'll see the actual error page with details
4. **Important:** Set `DEBUG=False` again after debugging!

### Step 2: Check All Environment Variables

Make sure these are set:
```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-backend-name.onrender.com
CSRF_TRUSTED_ORIGINS=https://your-backend-name.onrender.com
PYTHONUNBUFFERED=1
```

### Step 3: Test Database Connection

In build logs, look for:
- `Operations to perform:` (means migrations started)
- `Applying ... OK` (means migrations succeeded)
- Any database connection errors

### Step 4: Check Superuser Creation

In build logs, look for:
```
SUCCESS: Created a with phone 911111111
SUCCESS: Created s with phone 922222222
...
```

If you don't see these, the superuser wasn't created.

---

## Quick Checklist

- [ ] Checked Render logs for actual error message
- [ ] `SECRET_KEY` environment variable is set
- [ ] `DATABASE_URL` environment variable is set correctly
- [ ] `ALLOWED_HOSTS` is set to your Render domain
- [ ] `CSRF_TRUSTED_ORIGINS` includes your backend URL with `https://`
- [ ] Migrations ran successfully (check build logs)
- [ ] Superuser was created (check build logs)
- [ ] Using correct login credentials (phone: `911111111`, password: `admin@123`)
- [ ] Phone number entered as numeric only (no dashes/spaces)
- [ ] Build command includes `collectstatic`
- [ ] Service has been redeployed after any changes

---

## Test Login Credentials

After running `create_superuser.py`, use these credentials:

**Admin Superuser:**
- Phone: `911111111`
- Password: `admin@123`

**Sub Admin:**
- Phone: `922222222`
- Password: `admin@123`

**Regular User:**
- Phone: `933333333`
- Password: `admin@123`

**Driver:**
- Phone: `944444444`
- Password: `admin@123`

---

## Still Having Issues?

1. **Share the actual error from Render logs** - This is the most important!
2. Check if the service is actually running (not stuck in build)
3. Try accessing a simple endpoint first (like `/api/`) to see if backend is up
4. Verify all files are committed and pushed to GitHub
5. Try redeploying from scratch

---

## Common Error Messages

### "django.core.exceptions.ImproperlyConfigured: SECRET_KEY"
**Fix:** Set `SECRET_KEY` environment variable

### "django.db.utils.OperationalError: could not connect to server"
**Fix:** Check `DATABASE_URL` is correct, database is running

### "DisallowedHost: Invalid HTTP_HOST header"
**Fix:** Add domain to `ALLOWED_HOSTS` environment variable

### "CSRF verification failed"
**Fix:** Add URL to `CSRF_TRUSTED_ORIGINS` environment variable

### "User matching query does not exist"
**Fix:** Create superuser - check build logs for creation message

