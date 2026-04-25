// Cart logic — localStorage + Firestore sync (mirrors CartContext.js)
import { db, getCurrentUser } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const LS_KEY = "kesar_cart";

export function readCart() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}

function writeCart(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

async function saveToFirestore(uid, items) {
  if (!uid) return;
  try {
    await setDoc(doc(db, "carts", uid), {
      userId: uid,
      items,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) { console.error("Cart save error:", e); }
}

export async function loadCartForUser(uid) {
  try {
    const snap = await getDoc(doc(db, "carts", uid));
    const local = readCart();
    if (snap.exists()) {
      const firestoreItems = snap.data().items || [];
      if (local.length > 0) {
        const merged = [...firestoreItems];
        for (const li of local) {
          const idx = merged.findIndex(i => i.product_id === li.product_id && i.variant === li.variant);
          if (idx < 0) merged.push(li);
        }
        writeCart(merged);
        await saveToFirestore(uid, merged);
        return merged;
      }
      writeCart(firestoreItems);
      return firestoreItems;
    } else {
      if (local.length > 0) await saveToFirestore(uid, local);
      return local;
    }
  } catch { return readCart(); }
}

export async function addToCart(product, quantity = 1, variant = null) {
  const pid = product.id || product._id;
  let items = readCart();
  const idx = items.findIndex(i => i.product_id === pid && i.variant === variant);
  if (idx >= 0) {
    items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
  } else {
    items = [...items, { product_id: pid, product, quantity, variant }];
  }
  writeCart(items);
  window.dispatchEvent(new Event("cart:updated"));
  const user = getCurrentUser();
  if (user?._id) await saveToFirestore(user._id, items);
  return items;
}

export async function updateQuantity(productId, quantity, variant = null) {
  let items = readCart();
  if (quantity <= 0) {
    items = items.filter(i => !(i.product_id === productId && i.variant === variant));
  } else {
    items = items.map(i => i.product_id === productId && i.variant === variant ? { ...i, quantity } : i);
  }
  writeCart(items);
  window.dispatchEvent(new Event("cart:updated"));
  const user = getCurrentUser();
  if (user?._id) await saveToFirestore(user._id, items);
  return items;
}

export async function removeFromCart(productId, variant = null) {
  const items = readCart().filter(i => !(i.product_id === productId && i.variant === variant));
  writeCart(items);
  window.dispatchEvent(new Event("cart:updated"));
  const user = getCurrentUser();
  if (user?._id) await saveToFirestore(user._id, items);
  return items;
}

export async function clearCart() {
  writeCart([]);
  window.dispatchEvent(new Event("cart:updated"));
  const user = getCurrentUser();
  if (user?._id) await saveToFirestore(user._id, []);
}

export function getCartTotal(items) {
  return items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
}

export function getCartCount(items) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number(price || 0));
}
