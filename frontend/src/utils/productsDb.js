/**
 * productsDb.js — all product reads/writes go through Firestore.
 * Images are compressed client-side before being stored as base64 in Firestore.
 * (Firebase Storage requires Blaze plan; this approach works on Spark.)
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
    compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
    category: data.category || "General",
    images: Array.isArray(data.images) ? data.images : [],
    video: data.video || null,
    rating: Number(data.rating || 4.5),
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    variants: Array.isArray(data.variants) ? data.variants : [{ name: "Default" }],
    createdAt: data.createdAt || null,
  };
}

/**
 * Compress an image File or data-URL to a JPEG data-URL.
 * maxWidth/maxHeight: resize if larger. quality: 0–1 JPEG quality.
 * Already-stored https:// URLs are returned as-is.
 */
function compressImage(source, maxWidth = 1200, maxHeight = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    // Already a remote URL — no processing needed
    if (typeof source === "string" && source.startsWith("http")) {
      resolve(source);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;

    if (typeof source === "string") {
      img.src = source; // data URL
    } else {
      // File / Blob
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Convert a video File to a data URL (no compression — videos stay as-is).
 * Already-stored https:// URLs are returned as-is.
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    if (typeof file === "string") { resolve(file); return; } // already a URL
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Resolve an array of image sources (File, data URL, or https:// URL)
 * into compressed JPEG data URLs (or pass-through https:// URLs).
 */
async function resolveImages(images) {
  return Promise.all(images.map(img => compressImage(img)));
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
      const ta = a.createdAt?.toMillis?.() || (a.createdAt?.seconds || 0) * 1000;
      const tb = b.createdAt?.toMillis?.() || (b.createdAt?.seconds || 0) * 1000;
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
  const imageUrls = data.images?.length ? await resolveImages(data.images) : [];
  const videoUrl = data.video ? await fileToDataUrl(data.video) : null;

  const payload = {
    name: data.name,
    description: data.description || "",
    price: Number(data.price),
    ...(data.compare_at_price ? { compare_at_price: Number(data.compare_at_price) } : {}),
    category: data.category || "General",
    images: imageUrls,
    video: videoUrl,
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

  // Compress/resolve all images; existing https:// URLs pass through untouched
  const imageUrls = data.images?.length ? await resolveImages(data.images) : [];

  // Video: File → data URL, existing URL → pass through, null → null
  const videoUrl = data.video !== undefined ? await fileToDataUrl(data.video) : undefined;

  const patch = {
    name: data.name,
    description: data.description || "",
    price: Number(data.price),
    compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
    category: data.category || "General",
    images: imageUrls,
    ...(videoUrl !== undefined ? { video: videoUrl } : {}),
  };

  await updateDoc(ref, patch);
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
