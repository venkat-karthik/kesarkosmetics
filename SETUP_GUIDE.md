# Complete Setup Guide: Supabase + Railway

## PART 1: SET UP SUPABASE (Database)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub/Email
4. Create a new organization (or use existing)

### Step 2: Create Supabase Project
1. Click **"New Project"**
2. Fill in:
   - **Project name**: `client11` (or your choice)
   - **Database password**: Create strong password (SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
3. Click **"Create new project"** (wait 2-3 minutes for setup)

### Step 3: Get Supabase Credentials
1. Project created → Go to **Settings** (bottom left)
2. Click **"API"**
3. Copy and save these:
   ```
   SUPABASE_URL = [Project URL]
   SUPABASE_SERVICE_ROLE_KEY = [Service Role Key]
   SUPABASE_ANON_KEY = [Anon Public Key]
   ```
4. Also note **DB password** you created

### Step 4: Create Database Schema
1. In Supabase dashboard → **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy entire content from `backend/supabase-schema.sql`
4. Paste into SQL editor
5. Click **"Run"**
6. Check **Table Editor** to verify tables created:
   - `users` table
   - `orders` table

### Step 5: Set Up Authentication (Optional but Recommended)
1. Go to **Authentication** (left sidebar)
2. Click **"Providers"**
3. Enable providers you want (Email, GitHub, Google)
4. Configure redirect URL: `http://localhost:3000/auth/callback`

---

## PART 2: SET UP RAILWAY (Deployment)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2: Create New Project
1. Dashboard → Click **"New Project"**
2. Select **"Blank Project"**

### Step 3: Add PostgreSQL Database (Optional - Use Supabase Instead)
**RECOMMENDED**: Use Supabase database instead
- Skip adding PostgreSQL in Railway
- You'll connect to your Supabase database via environment variables

### Step 4: Deploy Backend from GitHub
1. In Railway project → **"Add Service"**
2. Select **"GitHub Repo"**
3. Authorize Railway to access GitHub
4. Select your repository: `client11`
5. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`

### Step 5: Set Environment Variables
1. After adding service, click on it
2. Go to **"Variables"** tab
3. Add all these variables:
   ```
   NODE_ENV=production
   PORT=8000
   SUPABASE_URL=[from Supabase API]
   SUPABASE_SERVICE_ROLE_KEY=[from Supabase API]
   SUPABASE_ANON_KEY=[from Supabase API]
   
   RAZORPAY_KEY_ID=[your Razorpay key]
   RAZORPAY_KEY_SECRET=[your Razorpay secret]
   RAZORPAY_WEBHOOK_SECRET=[your webhook secret]
   
   FRONTEND_URL=https://[your-frontend-domain]
   CORS_ORIGINS=https://[your-frontend-domain]
   
   SMTP_HOST=[if using email]
   SMTP_PORT=587
   SMTP_USER=[your email]
   SMTP_PASS=[app password]
   ```

### Step 6: Add Custom Domain (Optional)
1. Click on Backend service
2. Go to **"Settings"**
3. Look for **"Custom Domain"**
4. Add your domain (e.g., `api.yourdomain.com`)

### Step 7: Deploy Frontend (Vercel or Railway)

#### Option A: Vercel (Recommended)
1. Go to https://vercel.com
2. Import project from GitHub
3. Select `frontend` as root directory
4. Add environment variables:
   ```
   REACT_APP_SUPABASE_URL=[from Supabase]
   REACT_APP_SUPABASE_ANON_KEY=[from Supabase]
   REACT_APP_API_URL=https://[backend-domain]
   ```
5. Deploy

#### Option B: Railway
1. In same Railway project → **"Add Service"** 
2. Select **"GitHub Repo"**
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add environment variables (same as above)

---

## PART 3: CONFIGURE LOCAL ENVIRONMENT

### Step 1: Create `.env.local` in `frontend/`
```
REACT_APP_SUPABASE_URL=https://[your-supabase-id].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[anon key from Supabase]
REACT_APP_API_URL=http://localhost:8001
```

### Step 2: Create `.env` in `backend/`
```
NODE_ENV=development
PORT=8001
SUPABASE_URL=https://[your-supabase-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[service role key]
SUPABASE_ANON_KEY=[anon key]
RAZORPAY_KEY_ID=[your key]
RAZORPAY_KEY_SECRET=[your secret]
RAZORPAY_WEBHOOK_SECRET=[your webhook secret]
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
```

### Step 3: Install Dependencies
```bash
npm --prefix backend install
npm --prefix frontend install
```

### Step 4: Run Locally
```bash
# Terminal 1 - Backend
npm --prefix backend start

# Terminal 2 - Frontend
npm --prefix frontend start
```

---

## PART 4: TESTING CHECKLIST

- [ ] Supabase project created & schema deployed
- [ ] Railway project created with backend deployed
- [ ] Frontend deployed (Vercel or Railway)
- [ ] Backend can connect to Supabase (check logs)
- [ ] Frontend loads without errors
- [ ] Can register/login (tests database connection)
- [ ] Can create orders (tests payment integration)
- [ ] Environment variables all set correctly

---

## TROUBLESHOOTING

### Backend won't connect to Supabase
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Ensure they're in backend environment variables
- Check Railway logs: Click service → "Logs" tab

### Frontend can't reach backend
- Verify `REACT_APP_API_URL` points to correct backend
- Check CORS settings in backend `server.js`
- Add frontend URL to `CORS_ORIGINS`

### Database operations failing
- Check schema was created in Supabase
- Verify credentials in environment variables
- Check table names match in your queries

### Railway deployment stuck
- Check build logs for errors: Click service → "Logs"
- Ensure root directory is correct
- Verify `package.json` exists in that directory

---

## QUICK REFERENCE: Environment Variables Needed

**Supabase Dashboard → Settings → API:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

**Railway Dashboard:**
- Set all above + `NODE_ENV`, `PORT`, RAZORPAY keys, etc.

**Frontend .env.local:**
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_API_URL`
