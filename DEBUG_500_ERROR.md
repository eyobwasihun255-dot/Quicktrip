# Quick Debug Guide for 500 Error on Admin Login

## 🔍 Step 1: Check Render Logs (MOST IMPORTANT)

1. Go to **Render Dashboard** → Your Backend Service
2. Click **"Logs"** tab
3. Try to login again
4. **Copy the exact error message** - this tells you what's wrong!

Common errors you might see:

---

## 🔴 Error: "SECRET_KEY not found"

**Fix:**
1. Go to Environment Variables
2. Add: `SECRET_KEY` = `[generate a secret key]`
3. Generate one: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
4. Redeploy

---

## 🔴 Error: "could not connect to server" (Database)

**Fix:**
1. Check `DATABASE_URL` environment variable is set
2. Verify PostgreSQL database is running in Render
3. Check build logs - migrations must run successfully
4. Make sure you're using the **Internal Database URL** from Render

---

## 🔴 Error: "DisallowedHost" or "Invalid HTTP_HOST"

**Fix:**
1. Add `ALLOWED_HOSTS` environment variable
2. Value: `your-backend-name.onrender.com` (no https://, no trailing slash)
3. Redeploy

---

## 🔴 Error: "CSRF verification failed"

**Fix:**
1. Add `CSRF_TRUSTED_ORIGINS` environment variable
2. Value: `https://your-backend-name.onrender.com` (with https://, no trailing slash)
3. Redeploy

---

## 🔴 Error: "User matching query does not exist"

**Fix:**
1. Check build logs for: `SUCCESS: Created a with phone 911111111`
2. If not found, superuser wasn't created
3. Make sure build command includes: `python create_superuser.py`
4. Redeploy

---

## 🔴 Error: "No such table" or migration errors

**Fix:**
1. Check build logs - migrations must run
2. Build command should include: `python manage.py migrate`
3. If migrations failed, check the error in build logs

---

## 🔴 No error in logs, but still 500 error

**Try these:**

1. **Enable DEBUG temporarily:**
   - Set `DEBUG=True` in environment variables
   - Redeploy
   - Try login - you'll see detailed error
   - **Set back to `False` after debugging!**

2. **Check all environment variables are set:**
   ```
   DATABASE_URL=postgresql://...
   SECRET_KEY=your-key-here
   DEBUG=False
   ALLOWED_HOSTS=your-backend-name.onrender.com
   CSRF_TRUSTED_ORIGINS=https://your-backend-name.onrender.com
   ```

3. **Verify credentials:**
   - Phone: `911111111` (numeric only, from create_superuser.py)
   - Password: `admin@123` (from create_superuser.py)

---

## ✅ Quick Checklist

Before checking logs, verify:

- [ ] Service is running (not stuck in build)
- [ ] All environment variables are set (check list above)
- [ ] Build logs show migrations completed successfully
- [ ] Build logs show superuser created: `SUCCESS: Created a with phone 911111111`
- [ ] You're using correct credentials: phone `911111111`, password `admin@123`
- [ ] You're entering phone number as numeric only (no dashes/spaces)

---

## 🎯 Most Likely Issues (in order of probability)

1. **Missing SECRET_KEY** - Check environment variables
2. **Database connection issue** - Check DATABASE_URL and migrations
3. **CSRF/ALLOWED_HOSTS** - Check environment variables
4. **Superuser not created** - Check build logs
5. **Wrong credentials** - Use phone `911111111`, password `admin@123`

---

## 📝 What to Share When Asking for Help

1. **The exact error from Render logs** (most important!)
2. Screenshot of environment variables (hide sensitive values)
3. Build logs showing migrations and superuser creation
4. The URL you're trying to access

---

## 🚀 Quick Fix Steps

1. ✅ Check Render logs for exact error
2. ✅ Verify all environment variables are set
3. ✅ Check build logs for successful migrations and superuser creation
4. ✅ Try login with phone: `911111111`, password: `admin@123`
5. ✅ If still failing, enable DEBUG=True temporarily to see detailed error
6. ✅ Redeploy after any changes

---

## 📞 Test Credentials

After deployment, use:
- **Phone:** `911111111`
- **Password:** `admin@123`

Enter phone number as **numeric only** - no dashes, spaces, or special characters.

