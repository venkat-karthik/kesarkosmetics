// Firebase configuration — same as React app
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA18p6t_il_hFEsE59CWSdUjy7xYQKAU7w",
  authDomain: "kesarkosmetics-6ef0e.firebaseapp.com",
  projectId: "kesarkosmetics-6ef0e",
  storageBucket: "kesarkosmetics-6ef0e.firebasestorage.app",
  messagingSenderId: "210204996887",
  appId: "1:210204996887:web:326cbcc14d7b7c31477352",
  measurementId: "G-8Y5RN9ZX3Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const ADMIN_EMAILS = ["gsrinadh55@gmail.com", "kesarkosmetics@gmail.com"];

export function isAdmin(email) {
  return ADMIN_EMAILS.includes((email || "").toLowerCase());
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserProfile(fbUser, extra = {}) {
  const ref = doc(db, "users", fbUser.uid);
  const admin = isAdmin(fbUser.email);
  await setDoc(ref, {
    uid: fbUser.uid,
    name: fbUser.displayName || extra.name || "User",
    email: fbUser.email,
    phone: extra.phone || "",
    role: admin ? "admin" : "customer",
    provider: extra.provider || "google",
    createdAt: serverTimestamp(),
  });
  return (await getDoc(ref)).data();
}

export function mapFirebaseUser(fbUser, profile = {}) {
  if (!fbUser) return null;
  const admin = isAdmin(fbUser.email);
  return {
    _id: fbUser.uid,
    uid: fbUser.uid,
    name: fbUser.displayName || profile.name || "User",
    email: fbUser.email,
    phone: profile.phone || fbUser.phoneNumber || "",
    photoURL: fbUser.photoURL || null,
    role: admin ? "admin" : (profile.role || "customer"),
    email_verified: fbUser.emailVerified,
  };
}

// ── Auth state ────────────────────────────────────────────────────────────────

let _currentUser = null;
const _authListeners = [];

export function getCurrentUser() { return _currentUser; }

export function onUserChange(fn) {
  _authListeners.push(fn);
  fn(_currentUser); // call immediately with current state
}

onAuthStateChanged(auth, async (fbUser) => {
  if (fbUser) {
    try {
      let profile = await getUserProfile(fbUser.uid);
      if (!profile) profile = await createUserProfile(fbUser, { provider: "google" });
      _currentUser = mapFirebaseUser(fbUser, profile);
    } catch {
      _currentUser = mapFirebaseUser(fbUser);
    }
  } else {
    _currentUser = null;
  }
  _authListeners.forEach(fn => fn(_currentUser));
});

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  let profile = await getUserProfile(cred.user.uid);
  if (!profile) profile = await createUserProfile(cred.user, { provider: "google" });
  _currentUser = mapFirebaseUser(cred.user, profile);
  _authListeners.forEach(fn => fn(_currentUser));
  return _currentUser;
}

export async function logout() {
  await signOut(auth);
  _currentUser = null;
  _authListeners.forEach(fn => fn(null));
  localStorage.removeItem("kesar_cart");
}

// ── Firestore re-exports ──────────────────────────────────────────────────────
export { doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc };
