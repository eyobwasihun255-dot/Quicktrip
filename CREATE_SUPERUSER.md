# How to Create Superuser - Step by Step Guide

## Method 1: Using Render Shell (Easiest - Recommended)

### Step 1: Access Render Shell
1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your **backend service** (e.g., `quicktrip-backend`)
3. Click on the **"Shell"** tab (or look for "Open Shell" button)

### Step 2: Run the Command
In the shell, type this command (replace with your phone number and password):

```bash
python manage.py createsuperuser_custom --phone-number 912345678 --password YourSecurePassword123
```

**Important Notes:**
- Phone number must be **numeric only** (no dashes, spaces, or special characters)
- Example: `912345678` ✅ (correct)
- Example: `912-345-678` ❌ (wrong - has dashes)
- Example: `+251912345678` ❌ (wrong - has plus sign)

### Step 3: Verify Success
You should see:
```
Superuser created successfully with phone number: 912345678
```

### Step 4: Test Login
1. Go to: `https://your-backend-name.onrender.com/admin`
2. Enter your phone number: `912345678`
3. Enter your password: `YourSecurePassword123`
4. Click "Log in"

---

## Method 2: Using Environment Variables (Non-Interactive)

### Step 1: Add Environment Variables in Render
1. Go to your backend service in Render dashboard
2. Click on **"Environment"** tab
3. Add these two variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `SUPERUSER_PHONE_NUMBER` | Your phone number (numeric) | `912345678` |
| `SUPERUSER_PASSWORD` | Your password | `YourSecurePassword123` |

4. Click **"Save Changes"**

### Step 2: Access Render Shell
1. Click on the **"Shell"** tab
2. Run this command:
```bash
python manage.py createsuperuser_custom --no-input
```

### Step 3: Verify Success
You should see:
```
Superuser created successfully with phone number: 912345678
```

---

## Method 3: Using Django Shell (Alternative)

### Step 1: Access Render Shell
1. Go to your backend service → **"Shell"** tab

### Step 2: Open Django Shell
```bash
python manage.py shell
```

### Step 3: Create Superuser
Copy and paste this code (replace phone number and password):

```python
from user.models import User
User.objects.create_superuser(phone_number=912345678, password='YourSecurePassword123', user_type=User.type.ADMIN)
```

### Step 4: Exit Shell
```python
exit()
```

---

## Troubleshooting

### Error: "User with phone number already exists"
**Solution:** The phone number is already registered. Use a different phone number or delete the existing user first.

### Error: "Phone number must be numeric"
**Solution:** Remove all non-numeric characters from your phone number. Use only digits (0-9).

### Error: "Command not found: createsuperuser_custom"
**Solution:** Make sure you've deployed the latest code that includes the management command. The file should be at:
`backend/user/management/commands/createsuperuser_custom.py`

### Error: "No such file or directory"
**Solution:** Make sure you're running the command from the correct directory. In Render Shell, you should be in the `backend` directory automatically.

### Can't Access Shell
**Solution:** 
- Make sure your service is deployed and running
- Try redeploying if shell doesn't open
- Check Render status page if there are service issues

---

## Quick Reference

**Command Format:**
```bash
python manage.py createsuperuser_custom --phone-number PHONE_NUMBER --password PASSWORD
```

**Example:**
```bash
python manage.py createsuperuser_custom --phone-number 912345678 --password MyPassword123
```

**Phone Number Rules:**
- ✅ Must be numeric only: `912345678`
- ❌ No dashes: `912-345-678`
- ❌ No spaces: `912 345 678`
- ❌ No plus signs: `+251912345678`
- ❌ No parentheses: `(912) 345-678`

---

## After Creating Superuser

1. **Test Admin Login:**
   - URL: `https://your-backend-name.onrender.com/admin`
   - Username: Your phone number (e.g., `912345678`)
   - Password: Your password

2. **If Login Works:**
   - ✅ Superuser created successfully!
   - You can now manage your Django admin panel

3. **If Login Fails:**
   - Check that you're using the correct phone number (numeric only)
   - Verify the password is correct
   - Make sure migrations have run: `python manage.py migrate`

