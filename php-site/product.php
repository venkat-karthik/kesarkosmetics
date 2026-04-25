<?php
$pageTitle = 'Product — Kesar Kosmetics';
$cssPath = 'css/style.css';
$loadRazorpay = false;
include 'includes/head.php';
include 'includes/header.php';
?>
<div id="product-loading" class="flex justify-center items-center min-h-[60vh]"><div class="spinner"></div></div>
<div id="product-content" class="hidden min-h-screen bg-[#FFF8EC] pb-28 md:pb-0"></div>
<?php include 'includes/footer.php'; ?>
<script type="module">
import { getProduct, getAllProducts, addReview } from './js/products.js';
import { getCurrentUser, onUserChange } from './js/firebase-config.js';
import { addToCart } from './js/cart.js';
import { toggleWishlist, isWishlisted } from './js/wishlist.js';

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
if (!productId) { window.location.href = 'products.php'; }

let product = null;
let allProducts = [];
let selectedImage = 0;
let selectedVariant = null;
let quantity = 1;
let currentUser = null;

onUserChange(u => { currentUser = u; });

async function load() {
  try {
    [product, allProducts] = await Promise.all([getProduct(productId), getAllProducts()]);
    if (!product) { window.location.href = 'products.php'; return; }
    selectedVariant = product.variants?.[0]?.name || null;
    render();
  } catch(e) {
    window.location.href = 'products.php';
  }
}

function render() {
  document.getElementById('product-loading').classList.add('hidden');
  const content = document.getElementById('product-content');
  content.classList.remove('hidden');
  document.title = product.name + ' — Kesar Kosmetics';

  const images = product.images?.length ? product.images : ['/assets/main_logo.png'];
  const related = allProducts.filter(p => p.id !== product.id).slice(0, 4);
  const wishlisted = isWishlisted(product.id);

  content.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <button onclick="history.back()" class="mb-5 hidden md:flex items-center gap-2 text-[#7A3B00] hover:text-[#E8620A] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
        <span class="text-sm font-medium">Back</span>
      </button>
      <div class="grid gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <!-- Images -->
        <section class="space-y-3">
          <div class="overflow-hidden rounded-2xl md:rounded-3xl bg-white shadow-sm ring-1 ring-[#F5A800]/20">
            <img id="main-img" src="${images[0]}" alt="${product.name}" class="w-full object-cover" style="height:280px" />
          </div>
          ${images.length > 1 ? `<div class="flex gap-2 overflow-x-auto pb-1">${images.map((img,i)=>`<button onclick="selectImage(${i})" class="shrink-0 overflow-hidden rounded-xl border-2 transition-all ${i===0?'border-[#E8620A]':'border-transparent opacity-60 hover:opacity-100'}"><img src="${img}" alt="${product.name} ${i+1}" class="h-20 w-20 object-cover" /></button>`).join('')}</div>` : ''}
          <div class="hidden md:block">
            <div class="rounded-2xl border border-[#F5A800]/25 bg-[#FFF3D6] p-4">
              <div class="grid grid-cols-[130px_1fr_1fr] items-center gap-3">
                <div class="flex h-12 items-center justify-between rounded-xl border-2 border-[#E8620A] px-3 text-[#4A1A00]">
                  <button onclick="setQty(quantity-1)" aria-label="Decrease">−</button>
                  <span id="qty-display" class="font-bold text-base">1</span>
                  <button onclick="setQty(quantity+1)" aria-label="Increase">+</button>
                </div>
                <button onclick="handleAddToCart()" class="h-12 rounded-xl bg-[#4A1A00] hover:bg-[#2A0A00] text-[#FFF8EC] text-sm font-bold transition-colors">ADD TO CART</button>
                <button onclick="handleBuyNow()" class="h-12 rounded-xl bg-[#E8620A] hover:bg-[#C8380A] text-white text-sm font-bold transition-colors">BUY IT NOW</button>
              </div>
            </div>
          </div>
        </section>
        <!-- Info -->
        <section class="space-y-4">
          <div class="rounded-2xl md:rounded-3xl border border-[#F5A800]/25 bg-white p-5 sm:p-6 shadow-sm">
            <span class="inline-block text-[10px] font-bold rounded-full px-3 py-1 bg-[#E8620A]/10 text-[#E8620A] uppercase tracking-widest border border-[#E8620A]/20">New Launch</span>
            <h1 class="mt-3 font-heading text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#4A1A00]">${product.name}</h1>
            <div class="mt-2 flex items-center gap-2">
              <div class="flex gap-0.5">${[1,2,3,4,5].map(i=>`<svg viewBox="0 0 20 20" style="width:1rem;height:1rem;fill:#F5A800"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('')}</div>
              <span class="text-sm font-semibold text-[#7A3B00]">${(product.rating||4.5).toFixed(1)}</span>
              <span class="text-[#C8A060]">·</span>
              <span class="text-sm text-[#8B5E1A]">${(product.reviews||[]).length} reviews</span>
            </div>
            <p class="mt-2 text-sm leading-relaxed text-[#7A3B00]">${product.description||'Authentic product crafted with traditional care.'}</p>
            <div class="mt-4 flex items-baseline gap-3">
              <p class="text-2xl sm:text-3xl font-bold text-[#4A1A00]">${window._formatPrice(product.price)}</p>
              ${product.compare_at_price && product.compare_at_price > product.price ? `<p class="text-base font-medium text-[#B0906A] line-through">${window._formatPrice(product.compare_at_price)}</p><span class="rounded-full bg-[#E8620A] px-2.5 py-0.5 text-xs font-bold text-white">${Math.round(((product.compare_at_price-product.price)/product.compare_at_price)*100)}% OFF</span>` : ''}
            </div>
            ${product.variants?.length > 0 ? `
            <div class="mt-4">
              <p class="text-sm font-bold text-[#4A1A00] mb-2">Size</p>
              <div class="grid grid-cols-2 gap-2 sm:max-w-xs" id="variants-grid">
                ${product.variants.map(v=>`<button onclick="selectVariant('${v.name}')" class="variant-btn rounded-xl border-2 px-3 py-2.5 text-left transition-all ${v.name===selectedVariant?'border-[#E8620A] bg-[#E8620A] text-white':'border-[#F5A800]/30 bg-[#FFF3D6] text-[#4A1A00] hover:border-[#E8620A]'}" data-variant="${v.name}"><div class="font-bold text-sm">${v.name}</div><div class="text-xs mt-0.5 opacity-80">${window._formatPrice(v.price||product.price)}</div></button>`).join('')}
              </div>
            </div>` : ''}
            <div class="mt-4 rounded-xl bg-[#E8F5E9] p-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#2E7D32] shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
              <p class="text-xs font-medium text-[#1B5E20]">100% Secure Payment · GPay · VISA · PayPal · Mastercard</p>
            </div>
            <div class="mt-4 flex gap-2">
              <button onclick="handleWishlist()" id="wishlist-product-btn" class="flex-1 btn btn-outline text-sm">${wishlisted?'❤️ Wishlisted':'🤍 Add to Wishlist'}</button>
            </div>
          </div>
        </section>
      </div>

      <!-- Reviews -->
      <div class="mt-6 rounded-2xl md:rounded-3xl border border-[#F5A800]/25 bg-white p-5 sm:p-6 shadow-sm">
        <p class="text-[10px] font-bold uppercase tracking-[.25em] text-[#E8620A] mb-1">Customer Reviews</p>
        <h2 class="font-heading text-xl sm:text-2xl text-[#4A1A00] mb-4">What people are saying</h2>
        <div id="review-write-section"></div>
        <div id="reviews-list" class="mt-5 space-y-3">
          ${(product.reviews||[]).length === 0 ? '<p class="text-sm text-[#8B5E1A]">No reviews yet. Be the first!</p>' :
            (product.reviews||[]).map(r=>`
            <div class="rounded-xl border border-[#F5A800]/20 bg-[#FFF8EC] p-4">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-[#4A1A00]">${r.user_name||'Anonymous'}</span>
                  <span class="inline-flex items-center rounded-full bg-[#E8620A]/10 px-2 py-0.5 text-[10px] font-bold text-[#E8620A]">✓ Verified</span>
                </div>
                <div class="flex gap-0.5">${[1,2,3,4,5].map(i=>`<svg viewBox="0 0 20 20" style="width:.75rem;height:.75rem;fill:${i<=r.rating?'#F5A800':'#E8D5A0'}"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('')}</div>
              </div>
              <p class="text-sm text-[#7A3B00] leading-relaxed">${r.comment||''}</p>
            </div>`).join('')}
        </div>
      </div>

      <!-- Related -->
      ${related.length > 0 ? `
      <div class="mt-6 rounded-2xl md:rounded-3xl border border-[#F5A800]/25 bg-white p-5 sm:p-6 shadow-sm">
        <p class="text-[10px] font-bold uppercase tracking-[.25em] text-[#E8620A] mb-1">You May Also Like</p>
        <h2 class="font-heading text-xl sm:text-2xl text-[#4A1A00] mb-4">More from the collection</h2>
        <div class="grid gap-3 grid-cols-2 lg:grid-cols-4">
          ${related.map(item=>`
          <a href="product.php?id=${item.id}" class="group rounded-xl border border-[#F5A800]/20 bg-[#FFF8EC] p-2.5 transition-all hover:border-[#E8620A]/40 hover:shadow-md hover:-translate-y-0.5">
            <div class="overflow-hidden rounded-lg"><img src="${item.images?.[0]||'assets/main_logo.png'}" alt="${item.name}" class="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
            <h3 class="mt-2 text-xs font-bold text-[#4A1A00] line-clamp-2 group-hover:text-[#E8620A] transition-colors leading-snug">${item.name}</h3>
            <p class="mt-1 text-xs font-bold text-[#E8620A]">${window._formatPrice(item.price)}</p>
          </a>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <!-- Mobile sticky bar -->
    <div class="fixed bottom-0 inset-x-0 z-30 md:hidden border-t border-[#F5A800]/20 bg-[#FFF8EC]/95 p-3 backdrop-blur-sm">
      <div class="grid grid-cols-[100px_1fr_1fr] gap-2">
        <div class="flex h-11 items-center justify-between rounded-xl border-2 border-[#E8620A] px-3 text-[#4A1A00]">
          <button onclick="setQty(quantity-1)" aria-label="Decrease">−</button>
          <span id="qty-display-mobile" class="font-bold text-sm">1</span>
          <button onclick="setQty(quantity+1)" aria-label="Increase">+</button>
        </div>
        <button onclick="handleAddToCart()" class="h-11 rounded-xl bg-[#4A1A00] text-[#FFF8EC] text-sm font-bold hover:bg-[#2A0A00]">ADD TO CART</button>
        <button onclick="handleBuyNow()" class="h-11 rounded-xl bg-[#E8620A] text-white text-sm font-bold hover:bg-[#C8380A]">BUY NOW</button>
      </div>
    </div>
  `;

  // Review write section
  updateReviewSection();
}

function updateReviewSection() {
  const el = document.getElementById('review-write-section');
  if (!el) return;
  if (currentUser) {
    el.innerHTML = `
      <div class="rounded-xl bg-[#FFF3D6] border border-[#F5A800]/25 p-4 mb-4">
        <p class="text-sm font-semibold text-[#4A1A00] mb-3">Write a Review</p>
        <div class="flex gap-1 mb-3" id="star-picker">
          ${[1,2,3,4,5].map(s=>`<button onclick="setReviewStar(${s})" class="star-pick text-2xl text-[#CBBEAC] hover:text-[#D97736] transition-colors" data-star="${s}">★</button>`).join('')}
        </div>
        <textarea id="review-comment" placeholder="Share your experience…" class="form-input mb-3" rows="3"></textarea>
        <button onclick="submitReview()" class="btn btn-primary text-sm">Submit Review</button>
      </div>`;
  } else {
    el.innerHTML = `<div class="rounded-xl bg-[#FFF3D6] border border-[#F5A800]/25 p-4 mb-4 text-sm text-[#7A3B00]"><a href="login.php" class="font-bold text-[#E8620A] hover:underline">Login</a> to write a review.</div>`;
  }
}

let reviewStarRating = 0;
window.setReviewStar = (s) => {
  reviewStarRating = s;
  document.querySelectorAll('.star-pick').forEach((btn,i) => {
    btn.style.color = i < s ? '#D97736' : '#CBBEAC';
  });
};

window.submitReview = async () => {
  if (!currentUser) { showToast('Please login to submit a review', 'error'); return; }
  if (!reviewStarRating) { showToast('Please select a rating', 'error'); return; }
  const comment = document.getElementById('review-comment')?.value?.trim() || '';
  try {
    const updated = await addReview(product.id, {
      rating: reviewStarRating, comment,
      user_name: currentUser.name || currentUser.email || 'Anonymous',
      user_uid: currentUser._id,
      created_at: new Date().toISOString(),
    });
    product = updated;
    showToast('Review submitted!', 'success');
    window.dispatchEvent(new Event('reviews:updated'));
    render();
  } catch(e) { showToast('Failed to submit review', 'error'); }
};

window.selectImage = (idx) => {
  selectedImage = idx;
  const images = product.images?.length ? product.images : ['assets/main_logo.png'];
  document.getElementById('main-img').src = images[idx];
  document.querySelectorAll('.product-card-img button').forEach((btn,i) => {
    btn.className = `shrink-0 overflow-hidden rounded-xl border-2 transition-all ${i===idx?'border-[#E8620A]':'border-transparent opacity-60 hover:opacity-100'}`;
  });
};

window.selectVariant = (name) => {
  selectedVariant = name;
  document.querySelectorAll('.variant-btn').forEach(btn => {
    const active = btn.dataset.variant === name;
    btn.className = `variant-btn rounded-xl border-2 px-3 py-2.5 text-left transition-all ${active?'border-[#E8620A] bg-[#E8620A] text-white':'border-[#F5A800]/30 bg-[#FFF3D6] text-[#4A1A00] hover:border-[#E8620A]'}`;
  });
};

window.setQty = (n) => {
  quantity = Math.max(1, n);
  const d1 = document.getElementById('qty-display');
  const d2 = document.getElementById('qty-display-mobile');
  if (d1) d1.textContent = quantity;
  if (d2) d2.textContent = quantity;
};

window.handleAddToCart = async () => {
  if (!currentUser) { window.location.href = 'login.php?redirect=product.php?id=' + productId; return; }
  await addToCart(product, quantity, selectedVariant);
  showToast(product.name + ' added to cart!', 'success');
  window._openCartDrawer();
};

window.handleBuyNow = async () => {
  if (!currentUser) { window.location.href = 'login.php?redirect=product.php?id=' + productId; return; }
  await addToCart(product, quantity, selectedVariant);
  window.location.href = 'checkout.php';
};

window.handleWishlist = () => {
  const was = isWishlisted(product.id);
  toggleWishlist(product);
  const btn = document.getElementById('wishlist-product-btn');
  if (btn) btn.textContent = was ? '🤍 Add to Wishlist' : '❤️ Wishlisted';
  showToast(was ? 'Removed from wishlist' : 'Added to wishlist', 'success');
};

onUserChange(u => { currentUser = u; updateReviewSection(); });
load();
</script>
<?php include 'includes/scripts.php'; ?>
</body>
</html>
