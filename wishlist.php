<?php
$pageTitle = 'Wishlist — Kesar Kosmetics';
$cssPath = 'css/style.css';
$currentPage = 'wishlist.php';
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-[#FAF7F2]">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

    <div id="wishlist-empty" class="hidden rounded-[2rem] border-2 border-dashed border-[#E0D8C8] bg-white p-8 sm:p-12 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EEE6] text-[#D97736]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
      </div>
      <h1 class="font-heading text-3xl text-[#3E2723]">Your wishlist is empty</h1>
      <p class="mt-2 text-sm sm:text-base text-[#6B5B52]">Tap the heart on a product to save it here.</p>
      <a href="index.php" class="btn btn-primary mt-6">Browse products</a>
    </div>

    <div id="wishlist-content" class="hidden">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <p class="section-label">Saved products</p>
          <h1 class="font-heading text-3xl sm:text-4xl text-[#3E2723]">My Wishlist</h1>
        </div>
        <button id="clear-wishlist-btn" class="btn btn-outline">Clear all</button>
      </div>
      <div id="wishlist-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"></div>
    </div>

  </div>
</div>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { getWishlist, removeFromWishlist, clearWishlist } from './js/wishlist.js';
import { formatPrice } from './js/cart.js';

function render() {
  const items = getWishlist();
  if (items.length === 0) {
    document.getElementById('wishlist-empty').classList.remove('hidden');
    document.getElementById('wishlist-content').classList.add('hidden');
    return;
  }
  document.getElementById('wishlist-empty').classList.add('hidden');
  document.getElementById('wishlist-content').classList.remove('hidden');

  document.getElementById('wishlist-grid').innerHTML = items.map(product => {
    const pid = product.id || product._id;
    return `
      <div class="rounded-2xl border-2 border-[#E6DCCB] bg-white p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        <a href="product.php?id=${pid}">
          <div class="overflow-hidden rounded-xl">
            <img src="${product.images?.[0]||product.image||'assets/main.png'}" alt="${product.name||''}" class="w-full aspect-square object-cover transition-transform duration-500 hover:scale-105" />
          </div>
        </a>
        <h2 class="mt-3 font-heading text-xl font-bold text-[#111] line-clamp-2">${product.name||'Product'}</h2>
        <p class="mt-1 text-[#5D4037] font-medium">${formatPrice(product.price||0)}</p>
        <div class="mt-4 flex gap-2">
          <a href="product.php?id=${pid}" class="flex-1 btn btn-primary text-sm justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>
            View product
          </a>
          <button onclick="removeItem('${pid}')" class="btn btn-danger px-3" aria-label="Remove">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');
}

window.removeItem = (pid) => {
  removeFromWishlist(pid);
  showToast('Removed from wishlist', 'success');
  render();
};

document.getElementById('clear-wishlist-btn')?.addEventListener('click', () => {
  clearWishlist();
  render();
});

window.addEventListener('wishlist:updated', render);
render();
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
