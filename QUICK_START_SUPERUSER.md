# Quick Start: Create Superuser (No Shell Required)

## ✅ Solution for Free Tier Users

Since you don't have shell access on Render's free tier, use this **automatic method**.

---

## 3 Simple Steps

### Step 1: Add Environment Variables

1. Go to Render Dashboard → Your Backend Service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add these **two variables**:

   | Name | Value |
   |------|-------|
   | `SUPERUSER_PHONE_NUMBER` | `912345678` (your phone number, numbers only) |
   | `SUPERUSER_PASSWORD` | `YourPassword123` (your desired password) |

   ⚠️ **Important:** Phone number must be **numeric only** (no dashes, spaces, or special characters)

### Step 2: Update Build Command

1. In your backend service, go to **"Settings"** tab
2. Find **"Build Command"** field
3. Replace it with this:

   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && python create_superuser.py
   ```

4. Click **"Save Changes"**

### Step 3: Redeploy

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for deployment (3-5 minutes)
3. Check the **"Logs"** tab - you should see:
   ```
   SUCCESS: Superuser created successfully with phone number: 912345678
   ```

---

## Test It

1. Go to: `https://your-backend-name.onrender.com/admin`
2. Enter:
   - **Username:** `912345678` (your phone number)
   - **Password:** `YourPassword123` (your password)
3. Click **"Log in"**

✅ **Done!** You should now be logged into Django admin.

---

## Troubleshooting

### ❌ "Superuser not created"

**Check:**
- Environment variables are set correctly (exact names: `SUPERUSER_PHONE_NUMBER`, `SUPERUSER_PASSWORD`)
- Phone number is numeric only
- Build command includes `python create_superuser.py`
- Check build logs for error messages

### ❌ "Can't log in"

**Check:**
- Phone number matches exactly (numeric only)
- Password matches exactly
- Migrations ran successfully (check build logs)

### ❌ "Script not found"

**Check:**
- File `backend/create_superuser.py` exists in your repository
- You've committed and pushed the file to GitHub
- Root directory in Render is set to `backend`

---

## What Happens

The `create_superuser.py` script:
- ✅ Runs automatically during deployment
- ✅ Creates superuser if one doesn't exist
- ✅ Won't create duplicates (safe to run multiple times)
- ✅ Uses environment variables (no manual input needed)

---

## Example

**Environment Variables:**
```
SUPERUSER_PHONE_NUMBER = 912345678
SUPERUSER_PASSWORD = Admin123!
```

**After deployment, log in with:**
- Phone: `912345678`
- Password: `Admin123!`

---

## Need More Help?

See `CREATE_SUPERUSER_NO_SHELL.md` for detailed instructions and troubleshooting.

