<?php
$pageTitle = 'Products — Kesar Kosmetics';
$pageDesc  = 'Browse our full collection of Kashmiri saffron skincare and wellness products.';
$currentPage = 'products.php';
$cssPath = 'css/style.css';
include 'includes/head.php';
include 'includes/header.php';
?>

<!-- ── Page Hero ──────────────────────────────────────────────────────────── -->
<section class="page-hero">
  <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#F5A800]/10 blur-3xl pointer-events-none"></div>
  <div class="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#E8620A]/10 blur-3xl pointer-events-none"></div>
  <div class="container relative">
    <p class="badge badge-gold mb-5">Handcrafted with Care</p>
    <h1>Our Products</h1>
    <p class="mt-3">Discover our collection of natural products, made with devotion and the finest Kashmiri saffron.</p>
    <div class="section-divider mx-auto mt-6"></div>
  </div>
</section>

<!-- ── Category Filter ────────────────────────────────────────────────────── -->
<section class="py-6 bg-white border-b border-[#E8DECF]">
  <div class="container">
    <div id="category-filters" class="flex flex-wrap gap-2 justify-center">
      <a href="products.php" id="cat-all" class="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-[#D97736] text-white">All Products</a>
      <!-- Dynamic categories injected by JS -->
    </div>
  </div>
</section>

<!-- ── Products Grid ──────────────────────────────────────────────────────── -->
<section class="py-12 md:py-16 bg-[#FFF8EC]">
  <div class="container">
    <div id="products-loading" class="flex justify-center py-20">
      <div class="flex flex-col items-center gap-3 text-[#7A3B00]">
        <div class="spinner"></div>
        <p class="text-sm font-medium">Loading products…</p>
      </div>
    </div>
    <div id="products-error" class="hidden text-center text-red-600 py-8"></div>
    <div id="products-grid" class="product-grid hidden"></div>
    <div id="products-empty" class="hidden text-center py-20 text-[#7A3B00]">
      <p class="text-lg font-medium">No products found.</p>
      <p class="text-sm mt-1 text-[#A07850]">Check back soon!</p>
    </div>
  </div>
</section>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { getAllProducts } from './js/products.js';
import { getCurrentUser } from './js/firebase-config.js';

const urlParams = new URLSearchParams(window.location.search);
const activeCategory = urlParams.get('category') || null;

// Update "All Products" link active state
if (activeCategory) {
  document.getElementById('cat-all').className = 'px-4 py-2 rounded-full text-sm font-medium transition-colors bg-[#F5EEE6] text-[#5D4037] hover:bg-[#E8DECF]';
}

let allProducts = [];

async function load() {
  try {
    allProducts = await getAllProducts(activeCategory);
    renderCategories();
    renderProducts();
  } catch (e) {
    document.getElementById('products-loading').classList.add('hidden');
    document.getElementById('products-error').textContent = 'Could not load products.';
    document.getElementById('products-error').classList.remove('hidden');
  }
}

function renderCategories() {
  const allProds = allProducts; // already filtered if category set
  // Fetch all for categories
  getAllProducts(null).then(all => {
    const cats = [...new Set(all.map(p=>p.category).filter(Boolean))];
    const container = document.getElementById('category-filters');
    cats.forEach(cat => {
      const a = document.createElement('a');
      a.href = `products.php?category=${encodeURIComponent(cat)}`;
      a.textContent = cat;
      a.className = `px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory===cat?'bg-[#D97736] text-white':'bg-[#F5EEE6] text-[#5D4037] hover:bg-[#E8DECF]'}`;
      container.appendChild(a);
    });
  });
}

function renderProducts() {
  document.getElementById('products-loading').classList.add('hidden');
  const grid = document.getElementById('products-grid');
  if (allProducts.length === 0) {
    document.getElementById('products-empty').classList.remove('hidden');
    return;
  }
  grid.classList.remove('hidden');
  grid.innerHTML = allProducts.map(p => productCard(p)).join('');

  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.classList.toggle('active', window._isWishlisted(btn.dataset.pid));
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const pid = btn.dataset.pid;
      const product = allProducts.find(p => p.id === pid);
      if (!product) return;
      const was = window._isWishlisted(pid);
      window._toggleWishlist(product);
      btn.classList.toggle('active', !was);
      showToast(was ? 'Removed from wishlist' : 'Added to wishlist', 'success');
    });
  });

  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const user = getCurrentUser();
      if (!user) { window.location.href = 'login.php?redirect=products.php'; return; }
      const pid = btn.dataset.pid;
      const product = allProducts.find(p => p.id === pid);
      if (!product) return;
      btn.disabled = true; btn.textContent = 'Adding…';
      await window._addToCart(product, 1);
      btn.disabled = false; btn.textContent = 'Add to Cart';
      showToast(`${product.name} added to cart!`, 'success');
    });
  });
}

function productCard(p) {
  const wishlisted = window._isWishlisted(p.id);
  const stars = [1,2,3,4,5].map(s=>`<svg viewBox="0 0 20 20" style="width:.875rem;height:.875rem;fill:${s<=Math.round(p.rating||4.8)?'#F5A800':'#E5E7EB'}"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('');
  return `
    <div class="product-card">
      <div class="product-card-img">
        <button class="wishlist-btn${wishlisted?' active':''}" data-pid="${p.id}" aria-label="${wishlisted?'Remove from wishlist':'Add to wishlist'}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="${wishlisted?'currentColor':'none'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
        </button>
        <a href="product.php?id=${p.id}">
          <img src="${p.images?.[0]||'assets/main_logo.png'}" alt="${p.name}" loading="lazy" />
        </a>
      </div>
      <div class="product-card-body">
        <a href="product.php?id=${p.id}" class="product-card-title">${p.name}</a>
        <div class="stars justify-center mb-2">${stars}<span class="text-xs text-[#7A3B00] ml-1 font-medium">${p.rating||4.8}</span></div>
        <div class="product-card-price">
          ${window._formatPrice(p.price)}
          ${p.compare_at_price&&p.compare_at_price>p.price?`<span class="product-card-old-price">${window._formatPrice(p.compare_at_price)}</span>`:''}
        </div>
        <button class="add-to-cart-btn btn btn-primary w-full mt-auto" data-pid="${p.id}">Add to Cart</button>
      </div>
    </div>
  `;
}

load();
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
