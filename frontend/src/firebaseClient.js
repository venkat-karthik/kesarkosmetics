import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA18p6t_il_hFEsE59CWSdUjy7xYQKAU7w",
  authDomain: "kesarkosmetics-6ef0e.firebaseapp.com",
  projectId: "kesarkosmetics-6ef0e",
  storageBucket: "kesarkosmetics-6ef0e.firebasestorage.app",
  messagingSenderId: "210204996887",
  appId: "1:210204996887:web:326cbcc14d7b7c31477352",
  measurementId: "G-8Y5RN9ZX3Q",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
