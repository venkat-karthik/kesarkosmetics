# Railway Deployment Guide for Backend API

## STEP 1: Create Railway Account & Project

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)
4. Authorize Railway to access your GitHub
5. Create a new **blank project**

---

## STEP 2: Deploy Backend from GitHub

### Option A: Connect GitHub Repository (Recommended)

1. In your Railway project → Click **"Add Service"**
2. Select **"GitHub Repo"**
3. If first time, click **"Connect GitHub"**
   - Select your repository: `client11`
   - Choose branch: `main` (or your branch)
4. Configure deployment:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start` (already in package.json)
5. Click **"Deploy"**

---

## STEP 3: Add Environment Variables in Railway

1. Click on your **Backend** service
2. Go to **"Variables"** tab
3. Click **"Raw Editor"** or add one-by-one:

### Step 3A: Get Brevo SMTP Credentials (Recommended for Email)

**Why Brevo?** Free 300 emails/day, works reliably from Railway, no timeout issues.

1. Go to https://www.brevo.com/en/
2. Click **"Sign up free"** (or login if you have account)
3. After signup, go to **Settings** (top menu)
4. Click **"SMTP & API"** in left sidebar
5. Find **"SMTP Configuration"** section:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **SMTP Port**: `587`
   - **Login**: Your Brevo email address
   - **Password**: Click **"Generate SMTP password"** and copy it

**Copy these values** - you'll paste them in Railway variables below.

### Copy-Paste All Variables:

```
NODE_ENV=production
PORT=8000
SUPABASE_URL=https://vmyaljqxutoxntcjvhhq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteWFsanF4dXRveG50Y2p2aGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI2NTg4NCwiZXhwIjoyMDkxODQxODg0fQ.d12QD9Ntk7GTAaUhWymgpeIABHqfSo8U7_dlFVExhMw
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteWFsanF4dXRveG50Y2p2aGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjU4ODQsImV4cCI6MjA5MTg0MTg4NH0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZteWFsanF4dXRveG50Y2p2aGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjU4ODQsImV4cCI6MjA5MTg0MTg4NH0
RAZORPAY_KEY_ID=rzp_test_1ksAJ0pZ7Bffa2
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=webhook_secret_test
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=[your Brevo email or API key]
SMTP_PASS=[your Brevo SMTP password]
SMTP_FROM=[your sender email]
FRONTEND_URL=https://YOUR_FRONTEND_DOMAIN_HERE
CORS_ORIGINS=https://YOUR_FRONTEND_DOMAIN_HERE,http://localhost:3000
```

### Important: Brevo SMTP Values Explained

- **SMTP_HOST=smtp-relay.brevo.com** ← Always this for Brevo
- **SMTP_PORT=587** ← Always 587 for Brevo  
- **SMTP_SECURE=false** ← Always false with port 587
- **SMTP_USER** ← Your Brevo account email (example: your@gmail.com)
- **SMTP_PASS** ← The SMTP password you generated in Brevo Settings (NOT your regular password)
- **SMTP_FROM** ← Email address that will appear as sender (usually same as SMTP_USER)

---

## STEP 4: Add Brevo Variables to Railway

1. Go to **Railway Dashboard** → Your **Backend service**
2. Click **Variables** tab
3. Paste all variables from above, replacing placeholders:
   - `[your Brevo email or API key]` → Your Brevo account email
   - `[your Brevo SMTP password]` → The SMTP password from Brevo Settings (NOT your regular password)
   - `[your sender email]` → Same as SMTP_USER
4. **Save** → Railway automatically redeploys with new variables ✅

---

## STEP 5: Get Your Backend URL

1. After deployment succeeds (check **Deployments** tab)
2. Click your service → **Settings**
3. Look for **"Public URL"** (something like: `https://kesarkosmotiescom-production.up.railway.app`)
4. **Copy this URL** - you'll need it for frontend

---

## STEP 6: Deploy Frontend (Vercel Recommended)

### Using Vercel (Easiest):

1. Go to https://vercel.com
2. Click **"Import Project"**
3. Connect your GitHub repo: `client11`
4. Configure:
   - **Framework**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
5. Add **Environment Variables**:
   ```
   REACT_APP_SUPABASE_URL=https://vmyaljqxutoxntcjvhhq.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   REACT_APP_BACKEND_URL=https://YOUR_RAILWAY_BACKEND_URL (from Step 5)
   ```
6. Click **"Deploy"**

---

## STEP 7: Update Frontend Backend URL in Railway

After you deploy frontend on Vercel:

1. Go back to **Railway Dashboard**
2. Click **Backend service**
3. Go to **Variables** tab
4. Update `FRONTEND_URL` with your Vercel domain:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
5. Railway redeploys automatically ✅

---

## STEP 8: Test Email Registration

1. Open your frontend URL: `https://your-frontend.vercel.app/register`
2. Fill in form and click **"Create Account"**
3. Should receive OTP email in inbox (sent by Brevo)
4. Enter OTP and complete registration
5. Check:
   - ✅ OTP received in email
   - ✅ User created in Supabase (check Table Editor → users)
   - ✅ No errors in browser console

---

## STEP 9: Test Connection

1. Open your frontend URL: `https://your-frontend.vercel.app`
2. Go to **Register** page
3. Fill in form and click **"Create Account"**
4. Check:
   - ✅ User created in Supabase (check Table Editor → users)
   - ✅ No CORS errors in browser console
   - ✅ Success message shown

---

## Troubleshooting

### Email not being sent (Brevo)

**Problem:** Registration works but no OTP email received

**Solution:**
1. Verify Brevo variables in Railway exactly match what you generated:
   - `SMTP_HOST=smtp-relay.brevo.com` (no typos)
   - `SMTP_PORT=587` (exactly 587, not 465)
   - `SMTP_SECURE=false` (false with port 587)
   - `SMTP_USER=` (your Brevo account email)
   - `SMTP_PASS=` (the generated SMTP password, NOT your Brevo login password)

2. Check Railway logs for SMTP errors:
   - Railway Dashboard → Backend Service → Logs
   - Look for "SMTP" or "mail" errors

3. Check Brevo quota:
   - Login to Brevo: https://app.brevo.com
   - Check if you still have emails remaining (300/day free)

4. Resend: Try registration again after 1-2 minutes (may take time to connect)

### Backend won't deploy
- Check Railway **Deployments** tab for error logs
- Ensure `root directory` is set to `backend`
- Verify `package.json` exists in backend folder

### Frontend can't reach backend
- Verify `REACT_APP_BACKEND_URL` points to Railway backend URL (not localhost)
- Check browser **Network** tab for failed API calls
- Check CORS errors (look at backend console logs)

### CORS errors
- Backend must have `CORS_ORIGINS` set to your frontend domain
- Check backend `.env` file has correct CORS_ORIGINS value

### Database connection fails
- Verify Supabase credentials are correct
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Ensure tables exist in Supabase (check SQL Editor)

---

## Quick Reference

| What | Where |
|------|-------|
| Railway Dashboard | https://railway.app/dashboard |
| Backend API URL | Railway → Backend Service → Settings |
| Supabase Dashboard | https://app.supabase.com |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Enable auto-deploys (Railway does this by default)
3. Monitor logs: Railway Dashboard → Logs tab
4. Set up webhooks for Razorpay
5. Enable email verification (requires SMTP config)
