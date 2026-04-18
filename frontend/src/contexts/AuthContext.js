import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebaseClient";

const AuthContext = createContext(null);

// The admin emails — both have full admin access
export const ADMIN_EMAILS = ["gsrinadh55@gmail.com", "kesarkosmetics@gmail.com"];
export const ADMIN_EMAIL = ADMIN_EMAILS[0]; // kept for backward compat

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || "").toLowerCase());
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function mapFirebaseUser(fbUser, extra = {}) {
  if (!fbUser) return null;
  const admin = isAdminEmail(fbUser.email);
  return {
    _id: fbUser.uid,
    uid: fbUser.uid,
    name: fbUser.displayName || extra.name || "User",
    email: fbUser.email,
    phone: extra.phone || fbUser.phoneNumber || "",
    email_verified: fbUser.emailVerified,
    photoURL: fbUser.photoURL || null,
    role: admin ? "admin" : (extra.role || "customer"),
  };
}

async function createUserProfile(fbUser, extra = {}) {
  const ref = doc(db, "users", fbUser.uid);
  const admin = isAdminEmail(fbUser.email);
  await setDoc(ref, {
    uid: fbUser.uid,
    name: fbUser.displayName || extra.name || "User",
    email: fbUser.email,
    phone: extra.phone || "",
    role: admin ? "admin" : "customer",
    provider: extra.provider || "email",
    createdAt: serverTimestamp(),
  });
  return (await getDoc(ref)).data();
}

async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          setUser(mapFirebaseUser(fbUser, profile || {}));
        } catch {
          setUser(mapFirebaseUser(fbUser));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Register — creates account + Firestore doc + sends verification email
  const register = async (name, email, phone, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await createUserProfile(cred.user, { name, phone, provider: "email" });
    try { await sendEmailVerification(cred.user); } catch {}
    await signOut(auth);
    return { requires_verification: true, email };
  };

  // Email login — only allow if Firestore profile exists (i.e. registered)
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = cred.user;

    // Admins bypass profile check and email verification requirement
    if (isAdminEmail(fbUser.email)) {
      // Ensure admin has a Firestore profile
      let profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        profile = await createUserProfile(fbUser, { provider: "email" });
      }
      const mapped = mapFirebaseUser(fbUser, profile);
      setUser(mapped);
      return mapped;
    }

    // Regular users must have a profile
    const profile = await getUserProfile(fbUser.uid);
    if (!profile) {
      await signOut(auth);
      throw new Error("No account found. Please register first.");
    }

    const mapped = mapFirebaseUser(fbUser, profile);
    setUser(mapped);
    return mapped;
  };

  // Google sign-in — auto-creates profile for new users, signs in existing users
  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    let profile = await getUserProfile(cred.user.uid);
    if (!profile) {
      // New user — create profile automatically
      profile = await createUserProfile(cred.user, { provider: "google" });
    }
    const mapped = mapFirebaseUser(cred.user, profile);
    setUser(mapped);
    return mapped;
  };

  // registerWithGoogle is the same flow
  const registerWithGoogle = loginWithGoogle;

  const sendPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
  };

  const verifyRegistration = async () => {
    await auth.currentUser?.reload();
    const fbUser = auth.currentUser;
    if (fbUser) {
      const profile = await getUserProfile(fbUser.uid);
      const mapped = mapFirebaseUser(fbUser, profile || {});
      setUser(mapped);
      return mapped;
    }
  };

  const resendRegistrationCode = async () => { await resendVerificationEmail(); };

  const checkAuth = async () => {
    const fbUser = auth.currentUser;
    if (fbUser) {
      await fbUser.reload();
      const profile = await getUserProfile(fbUser.uid);
      setUser(mapFirebaseUser(fbUser, profile || {}));
    }
  };

  const value = useMemo(() => ({
    user, loading,
    login, loginWithGoogle, registerWithGoogle,
    register, verifyRegistration, resendRegistrationCode,
    sendPasswordReset, resendVerificationEmail,
    logout, checkAuth,
    isAdmin: isAdminEmail(user?.email),
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
