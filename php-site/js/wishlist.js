// Wishlist — localStorage only (mirrors WishlistContext.js)
const LS_KEY = "nei-native-wishlist";

export function getWishlist() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}

function save(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("wishlist:updated"));
}

export function isWishlisted(productId) {
  return getWishlist().some(p => (p.id || p._id) === productId);
}

export function addToWishlist(product) {
  const pid = product.id || product._id;
  if (!pid) return false;
  const items = getWishlist();
  if (items.some(p => (p.id || p._id) === pid)) return false;
  save([product, ...items]);
  return true;
}

export function removeFromWishlist(productId) {
  const items = getWishlist().filter(p => (p.id || p._id) !== productId);
  save(items);
}

export function toggleWishlist(product) {
  const pid = product.id || product._id;
  if (isWishlisted(pid)) { removeFromWishlist(pid); return false; }
  addToWishlist(product); return true;
}

export function clearWishlist() {
  save([]);
}
