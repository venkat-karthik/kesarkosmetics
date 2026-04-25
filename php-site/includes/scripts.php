<!-- ── Shared JS (loaded at bottom of every page) ─────────────────────────── -->
<script type="module">
import { loginWithGoogle, logout, onUserChange, getCurrentUser, isAdmin, db } from './js/firebase-config.js';
import { readCart, getCartCount, getCartTotal, formatPrice, loadCartForUser, addToCart, removeFromCart, updateQuantity } from './js/cart.js';
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
  window.location.href = 'index.php';
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
    return;
  }
  body.innerHTML = items.map(item => `
    <div class="flex gap-3 py-3 border-b border-[#F0E8DC]">
      <img src="${item.product?.images?.[0] || 'assets/logo.jpeg'}" alt="${item.product?.name || ''}" class="w-16 h-16 object-cover rounded-xl shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-[#3E2723] line-clamp-2">${item.product?.name || 'Product'}</p>
        <p class="text-xs text-[#8A7768] mt-0.5">${item.variant ? 'Size: '+item.variant : ''}</p>
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
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal(items));
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
        <img src="${p.images?.[0] || 'assets/logo.jpeg'}" alt="${p.name}" />
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

// ── Admin login modal ─────────────────────────────────────────────────────
const adminModal = document.getElementById('admin-modal');
document.getElementById('admin-footer-btn')?.addEventListener('click', () => adminModal?.classList.add('open'));
document.getElementById('admin-modal-close')?.addEventListener('click', () => adminModal?.classList.remove('open'));
adminModal?.addEventListener('click', (e) => { if (e.target === adminModal) adminModal.classList.remove('open'); });

document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-password').value;
  const errEl = document.getElementById('admin-modal-error');
  const btn = document.getElementById('admin-login-btn');
  const ADMIN_EMAILS = ['gsrinadh55@gmail.com', 'kesarkosmetics@gmail.com'];
  if (!ADMIN_EMAILS.includes(email)) {
    errEl.textContent = 'Not an admin email.'; errEl.classList.remove('hidden'); return;
  }
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { auth, db, doc, setDoc, getDoc, serverTimestamp } = await import('./js/firebase-config.js');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const ref = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { uid: cred.user.uid, name: cred.user.displayName || 'Admin', email, phone: '', role: 'admin', provider: 'email', createdAt: serverTimestamp() });
    }
    adminModal?.classList.remove('open');
    window.location.href = 'admin/dashboard.php';
  } catch (err) {
    const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
      ? 'Invalid email or password.' : err.message || 'Login failed.';
    errEl.textContent = msg; errEl.classList.remove('hidden');
  } finally { btn.textContent = 'Login'; btn.disabled = false; }
});

// ── Expose helpers globally for inline onclick ────────────────────────────
window._addToCart = addToCart;
window._toggleWishlist = toggleWishlist;
window._isWishlisted = isWishlisted;
window._formatPrice = formatPrice;
window._openCartDrawer = openCartDrawer;
</script>
