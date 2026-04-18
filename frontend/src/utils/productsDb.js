/**
 * productsDb.js — all product reads/writes go through Firestore.
 * No backend calls needed for products.
 */
import {
  collection, doc, getDocs, getDoc,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
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
      ? query(collection(db, COL), where("category", "==", categoryFilter), orderBy("createdAt", "desc"))
      : query(collection(db, COL), orderBy("createdAt", "desc"))
  );
  return snap.docs.map(d => normalize(d.id, d.data()));
}

export async function searchProducts(searchQuery) {
  // Firestore doesn't support full-text search — fetch all and filter client-side
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
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
