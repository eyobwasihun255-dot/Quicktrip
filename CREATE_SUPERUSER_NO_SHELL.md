# Create Superuser Without Shell Access (Free Tier Solution)

Since you're on Render's free tier and don't have shell access, here's how to create a superuser automatically during deployment.

## Method 1: Automatic Creation via Environment Variables (Recommended)

This method automatically creates a superuser during deployment if one doesn't exist.

### Step 1: Add Environment Variables in Render

1. Go to your Render dashboard
2. Click on your **backend service**
3. Go to **"Environment"** tab
4. Add these two environment variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `SUPERUSER_PHONE_NUMBER` | Your phone number (numeric only) | `912345678` |
| `SUPERUSER_PASSWORD` | Your desired password | `MySecurePassword123` |

**Important:**
- Phone number must be **numeric only** (no dashes, spaces, or special characters)
- Example: `912345678` ✅
- Example: `912-345-678` ❌ (wrong)

### Step 2: Update Build Command

1. In your Render backend service, go to **"Settings"** tab
2. Find **"Build Command"**
3. Update it to:

```bash
pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && python create_superuser.py
```

**What this does:**
- Installs dependencies
- Runs database migrations
- Collects static files
- **Creates superuser automatically** (if environment variables are set)

### Step 3: Redeploy

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for deployment to complete
3. Check the build logs - you should see:
   ```
   SUCCESS: Superuser created successfully with phone number: 912345678
   ```

### Step 4: Test Login

1. Go to: `https://your-backend-name.onrender.com/admin`
2. Enter your phone number: `912345678`
3. Enter your password: `MySecurePassword123`
4. Click "Log in"

---

## Method 2: Using Release Command (Alternative)

If Render supports release commands in your plan:

1. Go to **"Settings"** → **"Release Command"**
2. Set it to:
   ```bash
   python create_superuser.py
   ```
3. Keep your build command as:
   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --noinput
   ```

---

## How It Works

The `create_superuser.py` script:
- ✅ Checks if environment variables are set
- ✅ Validates phone number format
- ✅ Checks if superuser already exists (won't create duplicates)
- ✅ Creates superuser automatically
- ✅ Safe to run multiple times

---

## Troubleshooting

### Superuser Not Created

**Check Build Logs:**
1. Go to your service → **"Logs"** tab
2. Look for messages from `create_superuser.py`
3. Common issues:
   - `INFO: SUPERUSER_PHONE_NUMBER and SUPERUSER_PASSWORD not set` → Add environment variables
   - `ERROR: Phone number must be numeric` → Fix phone number format
   - `INFO: Superuser already exists` → Superuser was already created

### Environment Variables Not Working

1. Make sure variable names are **exact**:
   - `SUPERUSER_PHONE_NUMBER` (all caps, with underscores)
   - `SUPERUSER_PASSWORD` (all caps, with underscores)
2. No extra spaces in values
3. Redeploy after adding variables

### Still Can't Login

1. Verify phone number is correct (numeric only)
2. Check password is correct
3. Make sure migrations ran: Check build logs for `migrate` command
4. Try creating superuser again by redeploying

---

## Quick Setup Checklist

- [ ] Added `SUPERUSER_PHONE_NUMBER` environment variable
- [ ] Added `SUPERUSER_PASSWORD` environment variable
- [ ] Updated build command to include `python create_superuser.py`
- [ ] Redeployed the service
- [ ] Checked build logs for success message
- [ ] Tested login at `/admin`

---

## Security Note

⚠️ **Important:** After creating the superuser, you can optionally remove the `SUPERUSER_PASSWORD` environment variable for security. The superuser will remain in the database. However, if you need to reset the password later, you'll need to add it back and redeploy.

---

## Example Build Log Output

When successful, you'll see:
```
INFO: Running migrations...
Operations to perform:
  Apply all migrations: ...
Running migrations:
  Applying ... OK

INFO: Collecting static files...
...

INFO: Creating superuser...
SUCCESS: Superuser created successfully with phone number: 912345678
```

If superuser already exists:
```
INFO: Superuser with phone number 912345678 already exists. Skipping creation.
```

