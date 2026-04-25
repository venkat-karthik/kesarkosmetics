<?php
$pageTitle = 'Cart — Kesar Kosmetics';
$cssPath = 'css/style.css';
$currentPage = 'cart.php';
$requireAuth = true; // Prevent browser caching
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-[#FAF7F2]">
  <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">
    <div class="flex flex-col gap-2 mb-8">
      <p class="section-label">Shopping Cart</p>
      <h1 class="font-heading text-3xl sm:text-4xl text-[#3E2723]">Your selected products</h1>
      <p id="cart-subtitle" class="text-sm sm:text-base text-[#6B5B52]">Loading…</p>
    </div>

    <div id="cart-empty" class="hidden rounded-[2rem] border-2 border-dashed border-[#E0D8C8] bg-white p-10 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EEE6] text-[#D97736]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>
      </div>
      <h2 class="font-heading text-2xl text-[#3E2723]">Cart is empty</h2>
      <p class="mx-auto mt-2 max-w-md text-sm text-[#6B5B52]">Explore the collection and add a few products to see them here.</p>
      <a href="products.php" class="btn btn-primary mt-6">Continue Shopping</a>
    </div>

    <div id="cart-content" class="hidden">
      <div class="grid gap-6 lg:grid-cols-[1.85fr_0.8fr]">
        <div id="cart-items" class="space-y-4"></div>
        <div class="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div class="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-6 shadow-sm">
            <p class="section-label">Order Summary</p>
            <div class="mt-4 space-y-3 text-sm text-[#6B5B52]">
              <div class="flex items-center justify-between">
                <span>Subtotal</span>
                <span id="cart-subtotal" class="font-semibold text-[#3E2723]">₹0</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Shipping</span>
                <span class="font-semibold text-[#3E2723]">Calculated at checkout</span>
              </div>
            </div>
            <a href="checkout.php" id="checkout-btn" class="btn btn-primary mt-6 w-full justify-center">Proceed to Checkout</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { readCart, getCartTotal, getCartCount, formatPrice, updateQuantity, removeFromCart, loadCartForUser } from './js/cart.js';
import { getCurrentUser, onUserChange } from './js/firebase-config.js';

let currentUser = null;
onUserChange(async u => {
  currentUser = u;
  if (!u) { window.location.href = 'login.php?redirect=cart.php'; return; }
  // Wait for Firestore cart to load before rendering so we show the correct state
  await loadCartForUser(u._id);
  renderCart();
});

function renderCart() {
  const items = readCart();
  const count = getCartCount(items);
  const total = getCartTotal(items);

  document.getElementById('cart-subtitle').textContent = count > 0
    ? `${count} item${count===1?'':'s'} in your cart`
    : 'Your cart is empty right now.';

  if (items.length === 0) {
    document.getElementById('cart-empty').classList.remove('hidden');
    document.getElementById('cart-content').classList.add('hidden');
    return;
  }

  document.getElementById('cart-empty').classList.add('hidden');
  document.getElementById('cart-content').classList.remove('hidden');
  document.getElementById('cart-subtotal').innerHTML = formatPrice(total);

  document.getElementById('cart-items').innerHTML = items.map((item, idx) => `
    <div class="rounded-[1.75rem] border-2 border-[#E6DCCB] bg-white p-4 sm:p-5 shadow-sm">
      <div class="flex gap-4">
        <a href="product.php?id=${item.product_id}" class="shrink-0">
          <img src="${item.product?.images?.[0]||'assets/main.png'}" alt="${item.product?.name||''}" class="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />
        </a>
        <div class="flex-1 min-w-0">
          <a href="product.php?id=${item.product_id}" class="font-heading text-lg font-bold text-[#3E2723] hover:text-[#D97736] transition-colors line-clamp-2">${item.product?.name||'Product'}</a>
          <p class="mt-1 text-base font-semibold text-[#3E2723]">${formatPrice(item.product?.price||0)}</p>
          <p class="mt-1 text-sm text-[#5D4037]">${item.variant?'Size: '+item.variant:'Size: Standard'}</p>
          <div class="mt-3 flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-2 border border-[#7A7A7A] rounded-xl px-2.5 py-1.5">
              <button onclick="changeQty('${item.product_id}',${item.quantity-1},'${item.variant||''}')" class="p-1 text-[#1E1E1E] font-bold" aria-label="Decrease">−</button>
              <span class="w-7 text-center text-lg font-medium">${item.quantity}</span>
              <button onclick="changeQty('${item.product_id}',${item.quantity+1},'${item.variant||''}')" class="p-1 text-[#1E1E1E] font-bold" aria-label="Increase">+</button>
            </div>
            <p class="text-xl font-bold text-[#111]">${formatPrice((item.product?.price||0)*item.quantity)}</p>
            <button onclick="removeItem('${item.product_id}','${item.variant||''}')" class="btn btn-danger text-sm px-3 py-2" aria-label="Remove">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

window.changeQty = async (pid, qty, variant) => {
  await updateQuantity(pid, qty, variant || null);
  renderCart();
};
window.removeItem = async (pid, variant) => {
  await removeFromCart(pid, variant || null);
  showToast('Item removed from cart', 'success');
  renderCart();
};

window.addEventListener('cart:updated', renderCart);
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
