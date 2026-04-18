# Setup Guide

## Architecture

- **Auth** — Firebase Authentication (Google sign-in)
- **Database** — Firebase Firestore (products, orders, users, carts, blogs, subscribers)
- **Backend** — Express.js (Razorpay payments + email only)
- **Frontend** — React (reads/writes Firestore directly)

No Supabase. No separate database setup needed.

---

## 1. Firebase Setup

The Firebase project is already configured in `frontend/src/firebaseClient.js`.  
Your friend can use the same project — no changes needed.

If you want your own Firebase project:
1. Go to [firebase.google.com](https://firebase.google.com) → create a project
2. Enable **Firestore** and **Authentication → Google sign-in**
3. Replace the config in `frontend/src/firebaseClient.js`

---

## 2. Backend `.env`

Create `backend/.env`:

```
PORT=8001
NODE_ENV=development

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

That's it. No Supabase, no extra DB credentials.

---

## 3. Frontend `.env.local`

Create `frontend/.env.local`:

```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Firebase config is already hardcoded in `firebaseClient.js`.

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

Frontend → http://localhost:3000  
Backend → http://localhost:8001

---

## 5. Add Products

1. Open http://localhost:3000
2. Click **Admin** in the footer
3. Log in with an admin Google account
4. Go to **Admin Panel → New Product** and add products

Products are saved to **Firestore** and persist for everyone automatically.
