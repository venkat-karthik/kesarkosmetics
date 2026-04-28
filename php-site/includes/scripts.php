<!-- ── Shared JS (loaded at bottom of every page) ─────────────────────────── -->
<script type="module">
import { loginWithGoogle, logout, onUserChange, getCurrentUser, isAdmin, db } from './js/firebase-config.js';
import { readCart, getCartCount, getCartTotal, formatPrice, loadCartForUser, addToCart, removeFromCart, updateQuantity, getGstLabel } from './js/cart.js';
import { getWishlist, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist } from './js/wishlist.js';
import { searchProducts } from './js/products.js';

// ── Toast ─────────────────────────────────────────────────────────────────
window.showToast = function(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  el.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, duration);
};

// ── Falling particles ─────────────────────────────────────────────────────
(function() {
  const container = document.getElementById('falling-particles');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `left:${4+(i*7.5)%90}%;animation-duration:${12+(i*1.1)%6}s;animation-delay:${-(i*1.4)%14}s;--sway:${(i%2===0?1:-1)*(18+(i*2.3)%22)}px;opacity:${0.1+(i*0.01)%0.12}`;
    el.innerHTML = `<svg width="${8+(i*.7)%8}" height="${(8+(i*.7)%8)*4}" viewBox="0 0 10 40" fill="none"><line x1="5" y1="0" x2="5" y2="28" stroke="#E8620A" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="5" cy="32" rx="2.8" ry="4.5" fill="#C8380A"/><ellipse cx="5" cy="30" rx="1.5" ry="2" fill="#F5A800"/></svg>`;
    container.appendChild(el);
  }
})();

// ── Cart badge update ─────────────────────────────────────────────────────
function updateCartBadge() {
  const items = readCart();
  const count = getCartCount(items);
  const badge = document.getElementById('cart-count-badge');
  if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }
}
updateCartBadge();
window.addEventListener('cart:updated', updateCartBadge);

// ── Wishlist badge update ─────────────────────────────────────────────────
function updateWishlistBadge() {
  const count = getWishlist().length;
  const badge = document.getElementById('wishlist-count-badge');
  if (badge) { badge.textContent = count; badge.classList.toggle('hidden', count === 0); }
}
updateWishlistBadge();
window.addEventListener('wishlist:updated', updateWishlistBadge);

// ── Auth state → header UI ────────────────────────────────────────────────
onUserChange(async (user) => {
  const loginLink = document.getElementById('login-link');
  const userBtn = document.getElementById('user-btn');
  const userNameDd = document.getElementById('user-name-dd');
  const userEmailDd = document.getElementById('user-email-dd');
  const mobileLoginLink = document.getElementById('mobile-login-link');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

  if (user) {
    loginLink?.classList.add('hidden');
    userBtn?.classList.remove('hidden');
    if (userNameDd) userNameDd.textContent = user.name;
    if (userEmailDd) userEmailDd.textContent = user.email;
    mobileLoginLink?.classList.add('hidden');
    mobileLogoutBtn?.classList.remove('hidden');
    // Load Firestore cart
    await loadCartForUser(user._id);
    updateCartBadge();
  } else {
    loginLink?.classList.remove('hidden');
    userBtn?.classList.add('hidden');
    mobileLoginLink?.classList.remove('hidden');
    mobileLogoutBtn?.classList.add('hidden');
  }
});

// Prevent back button access after logout - check on page show
window.addEventListener('pageshow', function(event) {
  // If page is loaded from cache (back button) and user logged out
  if (event.persisted && sessionStorage.getItem('kesar_logged_out') === 'true') {
    window.location.reload();
  }
});

// ── User dropdown ─────────────────────────────────────────────────────────
const userBtn = document.getElementById('user-btn');
const userDropdown = document.getElementById('user-dropdown');
userBtn?.addEventListener('click', () => userDropdown?.classList.toggle('hidden'));
document.addEventListener('click', (e) => {
  if (!userBtn?.contains(e.target) && !userDropdown?.contains(e.target)) {
    userDropdown?.classList.add('hidden');
  }
});

// ── Logout ────────────────────────────────────────────────────────────────
async function doLogout() {
  await logout();
  showToast('Logged out successfully', 'success');
  setTimeout(() => window.location.replace('index.php'), 500);
}
document.getElementById('logout-btn')?.addEventListener('click', doLogout);
document.getElementById('mobile-logout-btn')?.addEventListener('click', doLogout);

// ── Mobile menu ───────────────────────────────────────────────────────────
const mobileMenu = document.getElementById('mobile-menu');
document.getElementById('menu-btn')?.addEventListener('click', () => mobileMenu?.classList.add('open'));
document.getElementById('menu-close-btn')?.addEventListener('click', () => mobileMenu?.classList.remove('open'));
mobileMenu?.addEventListener('click', (e) => { if (e.target === mobileMenu) mobileMenu.classList.remove('open'); });

// ── Cart drawer ───────────────────────────────────────────────────────────
const cartDrawer = document.getElementById('cart-drawer');
function openCartDrawer() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.php?redirect=cart.php'; return; }
  renderCartDrawer();
  cartDrawer?.classList.add('open');
  // Sync bar state on open without triggering celebration for already-unlocked carts
  const total = getCartTotal(readCart());
  _prevFreeShippingUnlocked = total >= FREE_SHIPPING_THRESHOLD;
}
function closeCartDrawer() { cartDrawer?.classList.remove('open'); }
document.getElementById('cart-btn')?.addEventListener('click', openCartDrawer);
document.getElementById('cart-close-btn')?.addEventListener('click', closeCartDrawer);
cartDrawer?.addEventListener('click', (e) => { if (e.target === cartDrawer) closeCartDrawer(); });
window.addEventListener('cart:updated', () => { if (cartDrawer?.classList.contains('open')) renderCartDrawer(); });

function renderCartDrawer() {
  const items = readCart();
  const body = document.getElementById('cart-drawer-items');
  const totalEl = document.getElementById('cart-drawer-total');
  if (!body) return;
  if (items.length === 0) {
    body.innerHTML = '<p class="text-center text-[#8A7768] py-8">Your cart is empty.</p>';
    if (totalEl) totalEl.textContent = '₹0';
    updateFreeShippingBar(0);
    return;
  }
  body.innerHTML = items.map(item => `
    <div class="flex gap-3 py-3 border-b border-[#F0E8DC]">
      <img src="${item.product?.images?.[0] || 'assets/main.png'}" alt="${item.product?.name || ''}" class="w-16 h-16 object-cover rounded-xl shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-[#3E2723] line-clamp-2">${item.product?.name || 'Product'}</p>
        <p class="text-xs text-[#8A7768] mt-0.5">${item.variant ? 'Size: '+item.variant : ''}</p>
        <p class="text-[10px] text-[#A07850] mt-0.5">${getGstLabel(item.product?.name || '')}</p>
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center gap-2 border border-[#E0D8C8] rounded-lg px-2 py-1">
            <button onclick="window._cartQty('${item.product_id}',${item.quantity-1},'${item.variant||''}')" class="text-[#3E2723] font-bold">−</button>
            <span class="text-sm font-semibold w-5 text-center">${item.quantity}</span>
            <button onclick="window._cartQty('${item.product_id}',${item.quantity+1},'${item.variant||''}')" class="text-[#3E2723] font-bold">+</button>
          </div>
          <span class="text-sm font-bold text-[#3E2723]">${formatPrice((item.product?.price||0)*item.quantity)}</span>
        </div>
      </div>
      <button onclick="window._cartRemove('${item.product_id}','${item.variant||''}')" class="text-red-400 hover:text-red-600 shrink-0 self-start mt-1" aria-label="Remove">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
      </button>
    </div>
  `).join('');
  const total = getCartTotal(items);
  if (totalEl) totalEl.textContent = formatPrice(total);
  updateFreeShippingBar(total);
}

const FREE_SHIPPING_THRESHOLD = 2000;
let _prevFreeShippingUnlocked = false;

function updateFreeShippingBar(total) {
  const bar = document.getElementById('cart-free-shipping-bar');
  if (!bar) return;
  const pct = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = FREE_SHIPPING_THRESHOLD - total;
  const unlocked = total >= FREE_SHIPPING_THRESHOLD;

  bar.innerHTML = unlocked
    ? `<p class="text-xs font-semibold text-green-700 text-center">🎉 You've unlocked FREE shipping!</p>
       <div class="mt-1.5 h-2 rounded-full bg-green-100 overflow-hidden"><div class="h-full rounded-full bg-green-500 transition-all duration-500" style="width:100%"></div></div>`
    : `<p class="text-xs text-[#7A3B00]">Add <span class="font-bold text-[#D97736]">${formatPrice(remaining)}</span> more for <span class="font-bold text-green-700">FREE shipping</span> 🚚</p>
       <div class="mt-1.5 h-2 rounded-full bg-[#F5EEE6] overflow-hidden"><div class="h-full rounded-full bg-[#D97736] transition-all duration-500" style="width:${pct}%"></div></div>`;

  // Trigger celebration only when crossing the threshold for the first time
  if (unlocked && !_prevFreeShippingUnlocked) {
    triggerFreeShippingCelebration();
  }
  _prevFreeShippingUnlocked = unlocked;
}

function triggerFreeShippingCelebration() {
  // Remove any existing overlay
  document.getElementById('free-shipping-celebration')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'free-shipping-celebration';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);animation:fsOverlayIn .3s ease;
  `;
  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#fff8ec,#fff3d6);
      border:2px solid #F5A800;border-radius:2rem;padding:2.5rem 2rem;
      text-align:center;max-width:340px;width:90%;
      box-shadow:0 20px 60px rgba(0,0,0,.25);
      animation:fsBounceIn .5s cubic-bezier(.34,1.56,.64,1);
      position:relative;overflow:hidden;
    ">
      <div id="fs-confetti-wrap" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div>
      <div style="font-size:3.5rem;line-height:1;margin-bottom:.75rem;">🎉</div>
      <h2 style="font-size:1.5rem;font-weight:800;color:#3E2723;margin-bottom:.5rem;">You Unlocked Free Shipping!</h2>
      <p style="color:#7A3B00;font-size:.9rem;margin-bottom:1.5rem;">Your order qualifies for <strong>FREE delivery</strong> across India 🚚✨</p>
      <button id="fs-close-btn" style="
        background:#D97736;color:white;border:none;border-radius:1rem;
        padding:.65rem 2rem;font-weight:700;font-size:.95rem;cursor:pointer;
        transition:background .2s;
      ">Awesome!</button>
    </div>
  `;

  // Inject keyframes once
  if (!document.getElementById('fs-keyframes')) {
    const style = document.createElement('style');
    style.id = 'fs-keyframes';
    style.textContent = `
      @keyframes fsOverlayIn { from { opacity:0 } to { opacity:1 } }
      @keyframes fsBounceIn { from { transform:scale(.6);opacity:0 } to { transform:scale(1);opacity:1 } }
      @keyframes fsConfettiFall {
        0%   { transform:translateY(-10px) rotate(0deg); opacity:1; }
        100% { transform:translateY(320px) rotate(720deg); opacity:0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  // Spawn confetti pieces
  const wrap = overlay.querySelector('#fs-confetti-wrap');
  const colors = ['#F5A800','#E8620A','#D97736','#4CAF50','#2196F3','#E91E63','#9C27B0'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    const size = 6 + Math.random() * 8;
    piece.style.cssText = `
      position:absolute;
      left:${Math.random()*100}%;
      top:${-10 - Math.random()*20}px;
      width:${size}px;height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>.5?'50%':'2px'};
      animation:fsConfettiFall ${1.2+Math.random()*1.5}s ${Math.random()*.8}s ease-in forwards;
    `;
    wrap.appendChild(piece);
  }

  // Close handlers
  const close = () => { overlay.style.opacity='0'; overlay.style.transition='opacity .3s'; setTimeout(()=>overlay.remove(),300); };
  overlay.querySelector('#fs-close-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target===overlay) close(); });
  setTimeout(close, 6000);
}

window._cartQty = async (pid, qty, variant) => {
  await updateQuantity(pid, qty, variant || null);
};
window._cartRemove = async (pid, variant) => {
  await removeFromCart(pid, variant || null);
  showToast('Item removed', 'success');
};

// ── Search overlay ────────────────────────────────────────────────────────
const searchOverlay = document.getElementById('search-overlay');
document.getElementById('search-btn')?.addEventListener('click', () => {
  searchOverlay?.classList.add('open');
  document.getElementById('search-input')?.focus();
});
document.getElementById('search-close-btn')?.addEventListener('click', () => searchOverlay?.classList.remove('open'));
searchOverlay?.addEventListener('click', (e) => { if (e.target === searchOverlay) searchOverlay.classList.remove('open'); });

let searchTimeout;
document.getElementById('search-input')?.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const q = e.target.value.trim();
  if (!q) { document.getElementById('search-results').innerHTML = ''; return; }
  searchTimeout = setTimeout(async () => {
    const results = await searchProducts(q);
    const el = document.getElementById('search-results');
    if (!el) return;
    if (results.length === 0) { el.innerHTML = '<p class="text-sm text-[#8A7768] text-center py-4">No products found.</p>'; return; }
    el.innerHTML = results.slice(0, 6).map(p => `
      <a href="product.php?id=${p.id}" class="search-result-item" onclick="document.getElementById('search-overlay').classList.remove('open')">
        <img src="${p.images?.[0] || 'assets/main.png'}" alt="${p.name}" />
        <div>
          <p class="font-semibold text-sm text-[#3E2723]">${p.name}</p>
          <p class="text-xs text-[#8A7768]">${formatPrice(p.price)}</p>
        </div>
      </a>
    `).join('');
  }, 300);
});

// ── Policy modal ──────────────────────────────────────────────────────────
const policies = {
  'refund-policy': {
    title: 'Refund & Return Policy',
    sections: [
      { h: 'Overview', p: 'We want you to be completely satisfied with your purchase. If you are not satisfied for any reason, we offer a straightforward return and refund process.' },
      { h: 'Eligibility', p: 'Items must be returned within 7 days of delivery. Products must be unused, in original packaging, and in the same condition as received.' },
      { h: 'How to Initiate a Return', p: 'Contact our support team at kesarkosmetics@gmail.com with your order number and reason for return.' },
      { h: 'Refund Processing', p: 'Approved refunds are processed within 5–7 business days to your original payment method.' },
      { h: 'Damaged or Defective Items', p: 'If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos.' },
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    sections: [
      { h: 'Information We Collect', p: 'We collect information you provide directly to us, such as your name, email address, shipping address, and payment information.' },
      { h: 'How We Use Your Information', p: 'We use the information we collect to process transactions, send order confirmations and updates, and respond to your comments.' },
      { h: 'Information Sharing', p: 'We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.' },
      { h: 'Data Security', p: 'We implement a variety of security measures to maintain the safety of your personal information.' },
      { h: 'Your Rights', p: 'You have the right to access, correct, or delete your personal data at any time. Contact us at kesarkosmetics@gmail.com.' },
    ]
  },
  'terms-of-service': {
    title: 'Terms of Service',
    sections: [
      { h: 'Acceptance of Terms', p: 'By accessing and using the Kesar Kosmetics website, you accept and agree to be bound by the terms and provisions of this agreement.' },
      { h: 'Use of the Website', p: 'You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of others.' },
      { h: 'Pricing', p: 'All prices are listed in Indian Rupees (INR). We reserve the right to change prices at any time without prior notice.' },
      { h: 'Governing Law', p: 'These terms shall be governed by and construed in accordance with the laws of India.' },
    ]
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    sections: [
      { h: 'Processing Time', p: 'Orders are processed within 1–2 business days after payment confirmation.' },
      { h: 'Delivery Time', p: 'Standard delivery takes 4–7 business days across India.' },
      { h: 'Free Shipping', p: 'We offer free standard shipping on all orders above ₹2,000.' },
      { h: 'Tracking', p: 'Once your order is shipped, you will receive a tracking number via email.' },
    ]
  }
};

const policyModal = document.getElementById('policy-modal');
document.querySelectorAll('.policy-link').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.policy;
    const pol = policies[key];
    if (!pol) return;
    document.getElementById('policy-title').textContent = pol.title;
    document.getElementById('policy-body').innerHTML = pol.sections.map(s => `
      <div class="policy-section">
        <h3>${s.h}</h3>
        <p>${s.p}</p>
      </div>
    `).join('');
    policyModal?.classList.add('open');
  });
});
document.getElementById('policy-close-btn')?.addEventListener('click', () => policyModal?.classList.remove('open'));
policyModal?.addEventListener('click', (e) => { if (e.target === policyModal) policyModal.classList.remove('open'); });

// ── Admin footer button — smart auth check ───────────────────────────────
document.getElementById('admin-footer-btn')?.addEventListener('click', async () => {
  const { authReady, isAdmin } = await import('./js/firebase-config.js');
  const user = await authReady;
  if (!user) {
    // Not logged in — go to the dedicated admin login page
    window.location.href = 'login_admin.php';
  } else if (isAdmin(user.email)) {
    // Already logged in as admin — go straight to dashboard
    window.location.href = 'admin/dashboard.php';
  } else {
    // Logged in as regular user — friendly nudge to shop
    showToast("Hey! Start exploring our collection today 🌸", 'info', 4000);
    setTimeout(() => { window.location.href = 'products.php'; }, 1200);
  }
});

// ── Expose helpers globally for inline onclick ────────────────────────────
window._addToCart = addToCart;
window._toggleWishlist = toggleWishlist;
window._isWishlisted = isWishlisted;
window._formatPrice = formatPrice;
window._openCartDrawer = openCartDrawer;
window._getGstLabel = getGstLabel;
</script>
