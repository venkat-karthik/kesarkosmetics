# Setup Guide

## Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Firebase](https://firebase.google.com) project (for auth)

---

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the left sidebar click **SQL Editor**
3. Open `backend/supabase-schema.sql` from this repo
4. Paste the entire contents into the SQL editor and click **Run**
5. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Backend `.env`

Create `backend/.env` with:

```
PORT=8001
NODE_ENV=development

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

---

## 3. Frontend `.env.local`

Create `frontend/.env.local` with:

```
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 4. Install & Run

```bash
# Backend
cd backend
npm install
node server.js

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000  
Backend runs on http://localhost:8001

---

## 5. Add Products

1. Open http://localhost:3000
2. Click **Admin** in the footer
3. Log in with an admin Google account
4. Go to Admin Panel → add your products

Products are now saved to Supabase and will persist across restarts and for anyone who clones the repo.
