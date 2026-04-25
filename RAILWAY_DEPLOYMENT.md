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
   - Select your repository
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
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=webhook_secret_here
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=[your Brevo email]
SMTP_PASS=[your Brevo SMTP password]
SMTP_FROM=[your sender email]
FRONTEND_URL=https://YOUR_FRONTEND_DOMAIN_HERE
CORS_ORIGINS=https://YOUR_FRONTEND_DOMAIN_HERE,http://localhost:3000
```

### Important: Brevo SMTP Values Explained

- **SMTP_HOST=smtp-relay.brevo.com** ← Always this for Brevo
- **SMTP_PORT=587** ← Always 587 for Brevo
- **SMTP_SECURE=false** ← Always false with port 587
- **SMTP_USER** ← Your Brevo account email
- **SMTP_PASS** ← The SMTP password you generated in Brevo Settings (NOT your regular password)
- **SMTP_FROM** ← Email address that will appear as sender (usually same as SMTP_USER)

---

## STEP 4: Get Your Backend URL

1. After deployment succeeds (check **Deployments** tab)
2. Click your service → **Settings**
3. Look for **"Public URL"** (something like: `https://kesarkosmotiescom-production.up.railway.app`)
4. **Copy this URL** - you'll need it for frontend

---

## STEP 5: Deploy Frontend (Vercel Recommended)

### Using Vercel (Easiest):

1. Go to https://vercel.com
2. Click **"Import Project"**
3. Connect your GitHub repo
4. Configure:
   - **Framework**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
5. Add **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL=https://YOUR_RAILWAY_BACKEND_URL (from Step 4)
   ```
6. Click **"Deploy"**

> **Note:** Firebase config is baked into `firebaseClient.js` — no env vars needed for Firebase.

---

## STEP 6: Update CORS in Railway

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

## STEP 7: Test the Deployment

1. Open your frontend URL
2. Sign in with Google (Firebase Auth)
3. Browse products, add to cart, place a test order
4. Check:
   - ✅ Products load from Firestore
   - ✅ Google sign-in works
   - ✅ Cart persists across sessions
   - ✅ Orders appear in Admin Dashboard
   - ✅ No CORS errors in browser console

---

## Troubleshooting

### Email not being sent (Brevo)

**Problem:** Contact form or order emails not received

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

---

## Quick Reference

| What | Where |
|------|-------|
| Railway Dashboard | https://railway.app/dashboard |
| Backend API URL | Railway → Backend Service → Settings |
| Firebase Console | https://console.firebase.google.com |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## Architecture Overview

- **Auth & Database**: Firebase (Firestore + Firebase Auth) — client-side, no backend needed
- **Backend**: Express on Railway — handles orders (in-memory), Razorpay payments, contact emails
- **Frontend**: React on Vercel — connects to Firebase directly and backend for orders/payments
- **Products, Cart, Users, Blogs**: All stored in Firestore, managed from Admin Dashboard

