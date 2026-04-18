/**
 * CartContext — stores cart in localStorage + syncs to Firestore for logged-in users.
 * Replaces the backend cookie-based cart entirely.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseClient";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const CartContext = createContext(null);
const LS_KEY = "kesar_cart";

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function writeLocal(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(readLocal);
  const [loading, setLoading] = useState(false);

  const saveToFirestore = useCallback(async (uid, cartItems) => {
    if (!uid) return;
    try {
      await setDoc(doc(db, "carts", uid), {
        userId: uid,
        items: cartItems,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Cart save error:", err);
    }
  }, []);

  // Load from Firestore when user logs in
  useEffect(() => {
    if (!user?._id) {
      setItems(readLocal());
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "carts", user._id));
        const local = readLocal();
        if (snap.exists()) {
          const firestoreItems = snap.data().items || [];
          // Merge local + firestore (local takes priority for qty)
          const merged = [...firestoreItems];
          for (const localItem of local) {
            const idx = merged.findIndex(i => i.product_id === localItem.product_id && i.variant === localItem.variant);
            if (idx >= 0) merged[idx].quantity += localItem.quantity;
            else merged.push(localItem);
          }
          setItems(merged);
          writeLocal(merged);
          if (local.length > 0) await saveToFirestore(user._id, merged);
        } else {
          setItems(local);
          if (local.length > 0) await saveToFirestore(user._id, local);
        }
      } catch (err) {
        console.error("Cart load error:", err);
        setItems(readLocal());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id, saveToFirestore]);

  const persist = useCallback(async (newItems) => {
    setItems(newItems);
    writeLocal(newItems);
    window.dispatchEvent(new Event("cart:updated"));
    if (user?._id) await saveToFirestore(user._id, newItems);
  }, [user?._id, saveToFirestore]);

  const addToCart = useCallback(async (product, quantity = 1, variant = null) => {
    const pid = product.id || product._id;
    setItems(prev => {
      const idx = prev.findIndex(i => i.product_id === pid && i.variant === variant);
      let next;
      if (idx >= 0) {
        next = prev.map((i, n) => n === idx ? { ...i, quantity: i.quantity + quantity } : i);
      } else {
        next = [...prev, { product_id: pid, product, quantity, variant }];
      }
      writeLocal(next);
      window.dispatchEvent(new Event("cart:updated"));
      if (user?._id) saveToFirestore(user._id, next);
      return next;
    });
  }, [user?._id, saveToFirestore]);

  const updateQuantity = useCallback(async (productId, quantity, variant = null) => {
    setItems(prev => {
      const next = quantity <= 0
        ? prev.filter(i => !(i.product_id === productId && i.variant === variant))
        : prev.map(i => i.product_id === productId && i.variant === variant ? { ...i, quantity } : i);
      writeLocal(next);
      window.dispatchEvent(new Event("cart:updated"));
      if (user?._id) saveToFirestore(user._id, next);
      return next;
    });
  }, [user?._id, saveToFirestore]);

  const removeFromCart = useCallback(async (productId, variant = null) => {
    setItems(prev => {
      const next = prev.filter(i => !(i.product_id === productId && i.variant === variant));
      writeLocal(next);
      window.dispatchEvent(new Event("cart:updated"));
      if (user?._id) saveToFirestore(user._id, next);
      return next;
    });
  }, [user?._id, saveToFirestore]);

  const clearCart = useCallback(async () => {
    setItems([]);
    writeLocal([]);
    window.dispatchEvent(new Event("cart:updated"));
    if (user?._id) await saveToFirestore(user._id, []);
  }, [user?._id, saveToFirestore]);

  // Compute totals from stored product data
  const cartTotal = items.reduce((sum, i) => {
    const price = i.product?.price || 0;
    return sum + price * i.quantity;
  }, 0);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Shape compatible with old backend cart format
  const cart = {
    items: items.map(i => ({
      product: i.product || { id: i.product_id, name: "Product", price: 0, images: [] },
      quantity: i.quantity,
      variant: i.variant || null,
    })),
    total: cartTotal,
  };

  return (
    <CartContext.Provider value={{ cart, items, cartCount, cartTotal, loading, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
