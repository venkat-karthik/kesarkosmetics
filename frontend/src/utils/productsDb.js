/**
 * productsDb.js — all product reads/writes go through Firestore.
 * No backend calls needed for products.
 */
import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseClient";

const COL = "products";

function normalize(id, data) {
  return {
    id,
    name: data.name || "",
    description: data.description || "",
    price: Number(data.price || 0),
    category: data.category || "General",
    images: Array.isArray(data.images) ? data.images : [],
    video: data.video || null,
    rating: Number(data.rating || 4.5),
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    variants: Array.isArray(data.variants) ? data.variants : [{ name: "Default" }],
    createdAt: data.createdAt || null,
  };
}

export async function getAllProducts(categoryFilter = null) {
  const snap = await getDocs(
    categoryFilter
      ? query(collection(db, COL), where("category", "==", categoryFilter))
      : collection(db, COL)
  );
  return snap.docs
    .map(d => normalize(d.id, d.data()))
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
      const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
      return tb - ta;
    });
}

export async function searchProducts(searchQuery) {
  const snap = await getDocs(collection(db, COL));
  const q = searchQuery.toLowerCase();
  return snap.docs
    .map(d => normalize(d.id, d.data()))
    .filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
}

export async function getProduct(productId) {
  const snap = await getDoc(doc(db, COL, productId));
  if (!snap.exists()) return null;
  return normalize(snap.id, snap.data());
}

export async function createProduct(data) {
  const payload = {
    name: data.name,
    description: data.description || "",
    price: Number(data.price),
    category: data.category || "General",
    images: data.images || [],
    video: data.video || null,
    rating: Number(data.rating || 4.5),
    reviews: [],
    variants: data.variants || [{ name: "Default" }],
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return normalize(ref.id, payload);
}

export async function updateProduct(productId, data) {
  const ref = doc(db, COL, productId);
  await updateDoc(ref, {
    name: data.name,
    description: data.description || "",
    price: Number(data.price),
    category: data.category || "General",
    images: data.images || [],
    ...(data.video !== undefined ? { video: data.video } : {}),
  });
  const snap = await getDoc(ref);
  return normalize(snap.id, snap.data());
}

export async function deleteProduct(productId) {
  await deleteDoc(doc(db, COL, productId));
}

export async function addReview(productId, review) {
  const ref = doc(db, COL, productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Product not found");
  const data = snap.data();
  const reviews = [review, ...(Array.isArray(data.reviews) ? data.reviews : [])];
  const rating = Number((reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1));
  await updateDoc(ref, { reviews, rating });
  return normalize(snap.id, { ...data, reviews, rating });
}

export async function deleteReview(productId, reviewIndex) {
  const ref = doc(db, COL, productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Product not found");
  const data = snap.data();
  const reviews = (Array.isArray(data.reviews) ? data.reviews : []).filter((_, i) => i !== reviewIndex);
  const rating = reviews.length
    ? Number((reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1))
    : Number(data.rating || 4.5);
  await updateDoc(ref, { reviews, rating });
  return normalize(snap.id, { ...data, reviews, rating });
}
