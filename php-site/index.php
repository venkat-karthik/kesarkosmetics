<?php
$pageTitle = 'Kesar Kosmetics — Premium Kashmiri Saffron';
$pageDesc  = 'Discover authentic Kashmiri saffron skincare and wellness products.';
$currentPage = 'index.php';
$cssPath = 'css/style.css';
include 'includes/head.php';
include 'includes/header.php';
?>

<!-- ── Hero Carousel ──────────────────────────────────────────────────────── -->
<section id="hero">
  <div id="hero-slides" style="position:relative;overflow:hidden;">
    <!-- Slides rendered by JS -->
    <div id="hero-loading" class="flex items-center justify-center bg-[#1A0800]" style="height:420px">
      <div class="spinner"></div>
    </div>
  </div>
</section>

<!-- ── Marquee Banner ─────────────────────────────────────────────────────── -->
<section class="bg-gradient-to-r from-[#3E1200] via-[#5D2A00] to-[#3E1200] py-4 overflow-hidden border-y border-[#F5A800]/20">
  <div class="marquee-track">
    <?php
    $tags = ["🌸 Hand-harvested Kashmiri Saffron","✦ 100% Natural Ingredients","🌿 Cruelty-Free & Vegan","✦ Each strand picked at dawn","🏔️ Grown at 2,200m altitude in Pampore, Kashmir","✦ Rich in Crocin & Safranal antioxidants","🌙 Saffron takes 75,000 flowers for 1 pound","✦ GMP Certified Manufacturing","🌸 Brightens skin in 2–4 weeks","✦ Free shipping above ₹2,000","🌿 No Parabens · No Sulfates · No Synthetics","✦ Dermatologist Tested","🏆 Premium Kashmiri Kesar — Red Gold of India"];
    $doubled = array_merge($tags, $tags);
    foreach ($doubled as $t): ?>
    <span><?= htmlspecialchars($t) ?> <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <?php endforeach; ?>
  </div>
</section>

<!-- ── Products Section ───────────────────────────────────────────────────── -->
<section id="products" class="py-16 md:py-24 bg-[#FFF8EC]">
  <div class="container">
    <div class="text-center mb-10 sm:mb-14">
      <p class="section-label">Our Collection</p>
      <h2 class="section-title mt-2" id="products-heading">Our Products</h2>
      <div class="section-divider mx-auto mt-3"></div>
    </div>
    <div id="products-loading" class="flex justify-center py-12">
      <div class="spinner"></div>
    </div>
    <div id="products-error" class="hidden text-center text-red-600 py-8"></div>
    <div id="products-grid" class="product-grid hidden"></div>
    <div id="products-empty" class="hidden text-center text-[#7A3B00] py-12">
      <p>No products yet. Check back soon!</p>
    </div>
  </div>
</section>

<!-- ── Customer Reviews ───────────────────────────────────────────────────── -->
<section id="reviews-section">
  <div style="height:1px;background:linear-gradient(to right,transparent,rgba(245,168,0,.5),transparent)"></div>
  <div class="container py-20 sm:py-28">
    <div class="text-center mb-14">
      <div class="inline-flex items-center gap-3 mb-5">
        <div style="height:1px;width:2.5rem;background:linear-gradient(to right,transparent,rgba(245,168,0,.6))"></div>
        <span style="font-size:.625rem;font-weight:700;text-transform:uppercase;letter-spacing:.45em;color:#F5A800">Customer Reviews</span>
        <div style="height:1px;width:2.5rem;background:linear-gradient(to left,transparent,rgba(245,168,0,.6))"></div>
      </div>
      <h2 class="font-heading text-4xl sm:text-5xl text-white font-light">What They're <em class="text-[#F5A800] not-italic">Saying</em></h2>
    </div>
    <div id="reviews-container" class="max-w-4xl mx-auto">
      <div id="review-card-wrap" class="transition-all duration-500">
        <div class="review-card">
          <div class="flex justify-center gap-1.5 mb-8" id="review-stars"></div>
          <p id="review-text" class="text-xl sm:text-2xl text-white/90 font-light italic leading-relaxed max-w-2xl mx-auto mb-10"></p>
          <div class="flex items-center justify-center gap-4 mb-6">
            <div style="height:1px;width:4rem;background:linear-gradient(to right,transparent,rgba(245,168,0,.5))"></div>
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-[#F5A800]"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
            <div style="height:1px;width:4rem;background:linear-gradient(to left,transparent,rgba(245,168,0,.5))"></div>
          </div>
          <p id="review-author" class="text-white font-semibold text-sm tracking-[.2em] uppercase mb-1"></p>
          <p id="review-product" class="text-[#F5A800]/60 text-xs tracking-[.18em] uppercase"></p>
          <div class="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style="background:rgba(245,168,0,.1);border:1px solid rgba(245,168,0,.25)">
            <svg viewBox="0 0 20 20" class="w-3 h-3 fill-[#F5A800]"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            <span class="text-[#F5A800] text-[10px] font-bold tracking-[.25em] uppercase">Verified Purchase</span>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center gap-6 mt-10">
        <button id="review-prev" class="w-11 h-11 rounded-full flex items-center justify-center text-[#F5A800] transition-all hover:scale-110" style="border:1px solid rgba(245,168,0,.3)" aria-label="Previous review">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
        </button>
        <div id="review-dots" class="flex gap-2 items-center"></div>
        <button id="review-next" class="w-11 h-11 rounded-full flex items-center justify-center text-[#F5A800] transition-all hover:scale-110" style="border:1px solid rgba(245,168,0,.3)" aria-label="Next review">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
        </button>
      </div>
      <p id="review-counter" class="text-center text-white/25 text-[10px] tracking-[.3em] uppercase mt-5"></p>
    </div>
  </div>
</section>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { getAllProducts } from './js/products.js';
import { formatPrice, addToCart, readCart } from './js/cart.js';
import { isWishlisted, toggleWishlist } from './js/wishlist.js';
import { getCurrentUser } from './js/firebase-config.js';

// ── Products ──────────────────────────────────────────────────────────────
let allProducts = [];
let currentSlide = 0;
let slideInterval;

async function loadProducts() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  document.getElementById('products-heading').textContent = category || 'Our Products';
  try {
    allProducts = await getAllProducts(category || null);
    renderHero();
    renderProducts();
    renderReviews();
  } catch (e) {
    document.getElementById('products-loading').classList.add('hidden');
    document.getElementById('products-error').textContent = 'Could not load products.';
    document.getElementById('products-error').classList.remove('hidden');
  }
}

function renderHero() {
  const container = document.getElementById('hero-slides');
  document.getElementById('hero-loading')?.remove();
  if (allProducts.length === 0) return;

  container.innerHTML = `
    <div style="position:relative;overflow:hidden">
      <div id="hero-img-wrap" style="position:relative">
        <img id="hero-img" src="${allProducts[0].images?.[0]||'assets/logo.jpeg'}" alt="${allProducts[0].name}" style="width:100%;height:420px;object-fit:cover;object-position:center" />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <div style="max-width:42rem">
          <p id="hero-badge" class="inline-block text-xs font-bold uppercase tracking-[.2em] text-[#F5A800] bg-[#F5A800]/15 border border-[#F5A800]/30 rounded-full px-4 py-1.5 mb-3">Featured</p>
          <h2 id="hero-title" class="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">${allProducts[0].name}</h2>
          <p id="hero-desc" class="text-sm sm:text-base text-white/75 mb-6 leading-relaxed max-w-lg line-clamp-2">${allProducts[0].description||''}</p>
          <div class="flex items-center gap-3">
            <a href="products.php" class="btn btn-primary">Shop Now</a>
            <a href="product.php?id=${allProducts[0].id}" class="text-white/80 hover:text-white text-sm font-medium underline-offset-4 hover:underline transition-colors">View Details →</a>
          </div>
        </div>
      </div>
      <button class="hero-nav-btn prev" id="hero-prev" aria-label="Previous">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
      </button>
      <button class="hero-nav-btn next" id="hero-next" aria-label="Next">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
      </button>
      <div class="hero-dots" id="hero-dots">
        ${allProducts.slice(0,6).map((_,i)=>`<button class="hero-dot${i===0?' active':''}" data-idx="${i}" aria-label="Slide ${i+1}"></button>`).join('')}
      </div>
    </div>
  `;

  document.getElementById('hero-prev')?.addEventListener('click', () => { clearInterval(slideInterval); goSlide(currentSlide-1); startAuto(); });
  document.getElementById('hero-next')?.addEventListener('click', () => { clearInterval(slideInterval); goSlide(currentSlide+1); startAuto(); });
  document.querySelectorAll('.hero-dot').forEach(btn => {
    btn.addEventListener('click', () => { clearInterval(slideInterval); goSlide(parseInt(btn.dataset.idx)); startAuto(); });
  });
  startAuto();
}

function goSlide(idx) {
  const n = allProducts.length;
  currentSlide = ((idx % n) + n) % n;
  const p = allProducts[currentSlide];
  document.getElementById('hero-img').src = p.images?.[0] || 'assets/logo.jpeg';
  document.getElementById('hero-img').alt = p.name;
  document.getElementById('hero-title').textContent = p.name;
  document.getElementById('hero-desc').textContent = p.description || '';
  document.querySelector('.hero-content a[href^="product"]').href = `product.php?id=${p.id}`;
  document.querySelectorAll('.hero-dot').forEach((d,i) => d.classList.toggle('active', i===currentSlide));
}

function startAuto() {
  slideInterval = setInterval(() => goSlide(currentSlide+1), 5000);
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
  // Attach wishlist buttons
  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const pid = btn.dataset.pid;
      const product = allProducts.find(p => p.id === pid);
      if (!product) return;
      const wasWishlisted = window._isWishlisted(pid);
      window._toggleWishlist(product);
      btn.classList.toggle('active', !wasWishlisted);
      showToast(wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
    });
    btn.classList.toggle('active', window._isWishlisted(btn.dataset.pid));
  });
  // Attach add-to-cart buttons
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const user = getCurrentUser();
      if (!user) { window.location.href = 'login.php?redirect=index.php'; return; }
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
  const stars = [1,2,3,4,5].map(s => `<svg viewBox="0 0 20 20" class="${s<=Math.round(p.rating||4.8)?'star-filled':'star-empty'}" style="width:.875rem;height:.875rem"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('');
  return `
    <div class="product-card">
      <div class="product-card-img">
        <button class="wishlist-btn${wishlisted?' active':''}" data-pid="${p.id}" aria-label="${wishlisted?'Remove from wishlist':'Add to wishlist'}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="${wishlisted?'currentColor':'none'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
        </button>
        <a href="product.php?id=${p.id}">
          <img src="${p.images?.[0]||'assets/logo.jpeg'}" alt="${p.name}" loading="lazy" />
        </a>
      </div>
      <div class="product-card-body">
        <a href="product.php?id=${p.id}" class="product-card-title">${p.name}</a>
        <div class="stars justify-center mb-2">${stars}<span class="text-xs text-[#7A3B00] ml-1 font-medium">${p.rating||4.8}</span></div>
        <div class="product-card-price">
          ${window._formatPrice(p.price)}
          ${p.compare_at_price && p.compare_at_price > p.price ? `<span class="product-card-old-price">${window._formatPrice(p.compare_at_price)}</span>` : ''}
        </div>
        <button class="add-to-cart-btn btn btn-primary w-full mt-auto" data-pid="${p.id}">Add to Cart</button>
      </div>
    </div>
  `;
}

// ── Reviews ───────────────────────────────────────────────────────────────
const staticReviews = [
  { rating:5, comment:"Absolutely love the quality! The saffron cream has transformed my skin — rich aroma, pure formula. Will never go back to store-bought.", userName:"Ananya S.", productName:"Kesar Kosmetics" },
  { rating:5, comment:"The saffron face cream is exceptional. You can feel the difference immediately — clean, natural, and so much better for the skin.", userName:"Rajesh M.", productName:"Saffron Cream" },
  { rating:5, comment:"Switched to Kesar Kosmetics and the whole family noticed the difference. Authentic, wholesome, and beautiful.", userName:"Preethi K.", productName:"Kesar Kosmetics" },
  { rating:5, comment:"The saffron is so vibrant and fragrant — nothing like the supermarket stuff. Fast delivery and beautifully packaged too.", userName:"Vikram N.", productName:"Kashmiri Saffron" },
];

let reviews = [];
let reviewIdx = 0;
let reviewTimer;

function renderReviews() {
  const fromProducts = allProducts.flatMap(p => (p.reviews||[]).filter(r=>r.rating>=3&&r.comment).map(r=>({rating:Number(r.rating),comment:r.comment,userName:r.user_name||'Anonymous',productName:p.name,productId:p.id})));
  reviews = fromProducts.length > 0 ? fromProducts.slice(0,12) : staticReviews;
  showReview(0);
  renderReviewDots();
  clearInterval(reviewTimer);
  reviewTimer = setInterval(() => advanceReview(1), 5000);
}

function showReview(idx) {
  reviewIdx = ((idx % reviews.length) + reviews.length) % reviews.length;
  const r = reviews[reviewIdx];
  const wrap = document.getElementById('review-card-wrap');
  wrap.style.opacity = '0'; wrap.style.transform = 'translateY(.75rem)';
  setTimeout(() => {
    document.getElementById('review-stars').innerHTML = [1,2,3,4,5].map(i=>`<svg viewBox="0 0 20 20" style="width:1.25rem;height:1.25rem;fill:${i<=r.rating?'#F5A800':'rgba(255,255,255,.1)'}"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('');
    document.getElementById('review-text').textContent = `"${r.comment}"`;
    document.getElementById('review-author').textContent = r.userName;
    document.getElementById('review-product').textContent = r.productName;
    document.getElementById('review-counter').textContent = `${reviewIdx+1} of ${reviews.length}`;
    document.querySelectorAll('.review-dot').forEach((d,i) => d.classList.toggle('active', i===reviewIdx));
    wrap.style.opacity = '1'; wrap.style.transform = 'translateY(0)'; wrap.style.transition = 'all .5s';
  }, 200);
}

function advanceReview(dir) { showReview(reviewIdx + dir); }

function renderReviewDots() {
  const el = document.getElementById('review-dots');
  el.innerHTML = reviews.map((_,i) => `<button class="review-dot${i===0?' active':''}" data-idx="${i}" style="border-radius:9999px;border:none;cursor:pointer;transition:all .3s;background:${i===0?'#F5A800':'rgba(255,255,255,.2)'};width:${i===0?'2rem':'.5rem'};height:.5rem" aria-label="Review ${i+1}"></button>`).join('');
  el.querySelectorAll('.review-dot').forEach(btn => {
    btn.addEventListener('click', () => { clearInterval(reviewTimer); showReview(parseInt(btn.dataset.idx)); reviewTimer = setInterval(()=>advanceReview(1),5000); });
  });
}

document.getElementById('review-prev')?.addEventListener('click', () => { clearInterval(reviewTimer); advanceReview(-1); reviewTimer = setInterval(()=>advanceReview(1),5000); });
document.getElementById('review-next')?.addEventListener('click', () => { clearInterval(reviewTimer); advanceReview(1); reviewTimer = setInterval(()=>advanceReview(1),5000); });

loadProducts();
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
