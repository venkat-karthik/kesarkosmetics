// Cart logic — localStorage + Firestore sync
import { db, getCurrentUser } from "./firebase-config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const LS_KEY = "kesar_cart";

// Tracks in-flight Firestore saves so we never read stale data during a pending write
let _pendingSave = Promise.resolve();

export function readCart() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}

function writeCart(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

// Normalize variant: treat empty string and undefined as null for consistency
function normVariant(v) {
  return (v === '' || v === undefined || v === null) ? null : String(v).trim();
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
  // Wait for any in-flight save to finish before reading Firestore
  await _pendingSave;

  try {
    const snap = await getDoc(doc(db, "carts", uid));
    const local = readCart();

    if (snap.exists()) {
      const firestoreItems = snap.data().items || [];

      // If Firestore has fewer items than local, Firestore wins — a delete happened
      // If local has items not in Firestore, they were added offline — merge them in
      if (local.length > 0 && firestoreItems.length >= local.length) {
        // Firestore has same or more items — merge any local-only items in
        const merged = [...firestoreItems];
        for (const li of local) {
          const nv = normVariant(li.variant);
          const exists = merged.some(
            i => i.product_id === li.product_id && normVariant(i.variant) === nv
          );
          if (!exists) merged.push({ ...li, variant: nv });
        }
        writeCart(merged);
        _pendingSave = saveToFirestore(uid, merged);
        await _pendingSave;
        window.dispatchEvent(new Event("cart:updated"));
        return merged;
      }

      // Firestore is authoritative (has fewer items = delete happened, or local is empty)
      writeCart(firestoreItems);
      window.dispatchEvent(new Event("cart:updated"));
      return firestoreItems;
    } else {
      // No Firestore cart yet — push local cart up
      if (local.length > 0) {
        _pendingSave = saveToFirestore(uid, local);
        await _pendingSave;
      }
      return local;
    }
  } catch {
    return readCart();
  }
}

export async function addToCart(product, quantity = 1, variant = null) {
  const nv = normVariant(variant);
  const pid = product.id || product._id;
  let items = readCart();
  const idx = items.findIndex(i => i.product_id === pid && normVariant(i.variant) === nv);
  if (idx >= 0) {
    items[idx] = { ...items[idx], quantity: items[idx].quantity + quantity };
  } else {
    items = [...items, { product_id: pid, product, quantity, variant: nv }];
  }
  writeCart(items);
  window.dispatchEvent(new Event("cart:updated"));

  // Chain onto _pendingSave so this save never races with a concurrent remove/update.
  // We don't await here (instant UI response) but the chain ensures ordering.
  const user = getCurrentUser();
  if (user?._id) {
    const snapshot = items; // capture current items for this save
    _pendingSave = _pendingSave.then(() => saveToFirestore(user._id, snapshot));
    _pendingSave.catch(e => console.error("Cart sync error:", e));
  }
  return items;
}

export async function updateQuantity(productId, quantity, variant = null) {
  const nv = normVariant(variant);
  let items = readCart();
  if (quantity <= 0) {
    items = items.filter(i => !(i.product_id === productId && normVariant(i.variant) === nv));
  } else {
    items = items.map(i =>
      i.product_id === productId && normVariant(i.variant) === nv
        ? { ...i, quantity }
        : i
    );
  }
  writeCart(items);
  window.dispatchEvent(new Event("cart:updated"));
  const user = getCurrentUser();
  if (user?._id) {
    _pendingSave = saveToFirestore(user._id, items);
    await _pendingSave;
  }
  return items;
}

export async function removeFromCart(productId, variant = null) {
  const nv = normVariant(variant);
  const items = readCart().filter(
    i => !(i.product_id === productId && normVariant(i.variant) === nv)
  );
  writeCart(items);
  window.dispatchEvent(new Event("cart:updated"));
  const user = getCurrentUser();
  if (user?._id) {
    _pendingSave = saveToFirestore(user._id, items);
    await _pendingSave;
  }
  return items;
}

export async function clearCart() {
  writeCart([]);
  window.dispatchEvent(new Event("cart:updated"));
  const user = getCurrentUser();
  if (user?._id) {
    _pendingSave = saveToFirestore(user._id, []);
    await _pendingSave;
  }
}

export function getCartTotal(items) {
  return items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
}

// GST rates by product name keyword
export function getGstRate(productName = '') {
  const name = productName.toLowerCase();
  if (name.includes('cream')) return 0.18;
  if (name.includes('strand') || name.includes('saffron strand') || name.includes('kesar strand')) return 0.05;
  return 0.18; // default
}

export function getGstLabel(productName = '') {
  const rate = getGstRate(productName);
  return `Incl. ${rate * 100}% GST`;
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
