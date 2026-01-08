# 🔴 URGENT FIX: 400 Bad Request Error

## Your Error:
```
https://quicktrip-e761.onrender.com/
Status Code: 400 Bad Request
```

## ✅ SOLUTION (Do This Now):

### Step 1: Open Render Dashboard
1. Go to: https://dashboard.render.com
2. Click on your backend service (should be named something like `quicktrip-e761` or `quicktrip-backend`)

### Step 2: Go to Environment Tab
1. Click on **"Environment"** tab in your service dashboard
2. Scroll down to see existing environment variables

### Step 3: Add/Update These TWO Variables

**Variable 1:**
- **Name:** `ALLOWED_HOSTS`
- **Value:** `quicktrip-e761.onrender.com`
- ⚠️ **NO** `https://`
- ⚠️ **NO** trailing `/`
- ⚠️ Just the domain: `quicktrip-e761.onrender.com`

**Variable 2:**
- **Name:** `CSRF_TRUSTED_ORIGINS`
- **Value:** `https://quicktrip-e761.onrender.com`
- ✅ **MUST** include `https://`
- ⚠️ **NO** trailing `/`
- ✅ Full URL: `https://quicktrip-e761.onrender.com`

### Step 4: Save and Wait
1. Click **"Save Changes"** button
2. Render will automatically redeploy (takes 2-5 minutes)
3. Watch the "Events" or "Logs" tab to see deployment progress

### Step 5: Test
After deployment completes, visit:
- ✅ `https://quicktrip-e761.onrender.com/admin` (should work now!)
- ✅ `https://quicktrip-e761.onrender.com/` (should work now!)

---

## 📸 Visual Guide:

```
Render Dashboard → Your Service → Environment Tab

┌─────────────────────────────────────┐
│ Environment Variables               │
├─────────────────────────────────────┤
│ Name: ALLOWED_HOSTS                 │
│ Value: quicktrip-e761.onrender.com │
├─────────────────────────────────────┤
│ Name: CSRF_TRUSTED_ORIGINS          │
│ Value: https://quicktrip-e761...    │
└─────────────────────────────────────┘
```

---

## ⚠️ Common Mistakes:

❌ **WRONG:**
- `ALLOWED_HOSTS` = `https://quicktrip-e761.onrender.com` (has https://)
- `ALLOWED_HOSTS` = `quicktrip-e761.onrender.com/` (has trailing slash)
- `CSRF_TRUSTED_ORIGINS` = `quicktrip-e761.onrender.com` (missing https://)

✅ **CORRECT:**
- `ALLOWED_HOSTS` = `quicktrip-e761.onrender.com`
- `CSRF_TRUSTED_ORIGINS` = `https://quicktrip-e761.onrender.com`

---

## 🔍 How to Verify It's Fixed:

1. **Check Environment Variables:**
   - Go to Environment tab
   - Make sure both variables are there
   - Check spelling (case-sensitive!)

2. **Check Deployment:**
   - Go to "Events" or "Logs" tab
   - Look for "Deploy succeeded" or "Build succeeded"
   - Wait until deployment is 100% complete

3. **Test the URL:**
   - Open: `https://quicktrip-e761.onrender.com/admin`
   - Should see Django admin login page (not 400 error)

---

## 🆘 Still Not Working?

### Check 1: Is the service name correct?
- Your URL is: `quicktrip-e761.onrender.com`
- Make sure `ALLOWED_HOSTS` matches exactly (without https://)

### Check 2: Did you save and redeploy?
- After saving environment variables, Render should auto-redeploy
- If not, click "Manual Deploy" → "Deploy latest commit"

### Check 3: Check the logs
- Go to "Logs" tab
- Look for any error messages
- Check if Django is starting correctly

### Check 4: Verify in Shell
1. Open "Shell" tab
2. Run: `echo $ALLOWED_HOSTS`
3. Should output: `quicktrip-e761.onrender.com`
4. Run: `echo $CSRF_TRUSTED_ORIGINS`
5. Should output: `https://quicktrip-e761.onrender.com`

---

## 📝 Quick Copy-Paste Values:

If your service URL is `https://quicktrip-e761.onrender.com`, use these:

```
ALLOWED_HOSTS=quicktrip-e761.onrender.com
CSRF_TRUSTED_ORIGINS=https://quicktrip-e761.onrender.com
```

---

## ✅ Success Indicators:

After fixing, you should see:
- ✅ No more 400 Bad Request error
- ✅ Django admin login page loads
- ✅ Can access API endpoints
- ✅ No errors in Render logs

