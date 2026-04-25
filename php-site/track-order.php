<?php
$pageTitle = 'Track Order — Kesar Kosmetics';
$cssPath = 'css/style.css';
$currentPage = 'track-order.php';
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-[#F6F5F2]">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

    <!-- Header card -->
    <div class="mb-8 rounded-[2rem] border border-[#E9E0D2] bg-white p-5 sm:p-7 shadow-sm">
      <p class="section-label">Track Orders</p>
      <h1 class="mt-2 font-heading text-3xl md:text-4xl text-[#3E2723]">Your recent orders</h1>
      <p class="mt-3 max-w-3xl text-sm sm:text-base text-[#5D4037] leading-7">
        If you are signed in, we will show the orders you already placed. You can also search by order ID, email, or phone.
      </p>
    </div>

    <!-- My Orders (logged in) -->
    <div id="my-orders-section" class="hidden mb-8">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <p class="section-label">My Orders</p>
          <h2 id="my-orders-heading" class="mt-1 font-heading text-2xl text-[#3E2723]">Placed by you</h2>
        </div>
        <p id="orders-count" class="text-sm text-[#6B5B52]"></p>
      </div>
      <div id="my-orders-loading" class="rounded-3xl border border-dashed border-[#E0D8C8] bg-white p-10 text-center text-[#5D4037]">Loading your orders…</div>
      <div id="my-orders-empty" class="hidden rounded-3xl border border-dashed border-[#E0D8C8] bg-white p-10 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-[#D97736] mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
        <p class="text-[#5D4037]">No orders found yet.</p>
        <p class="mt-2 text-sm text-[#6B5B52]">Place an order first and it will appear here automatically.</p>
      </div>
      <div id="my-orders-list" class="hidden space-y-4"></div>
    </div>

    <!-- Search form -->
    <div class="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-5 sm:p-8 shadow-sm">
      <p class="section-label">Order Support</p>
      <h1 class="mt-2 font-heading text-3xl md:text-4xl text-[#3E2723]">Track your order</h1>
      <p class="mt-3 text-sm sm:text-base text-[#5D4037] leading-7">Enter your order ID, phone number, or email to find your orders.</p>
      <form id="track-form" class="mt-6 space-y-4">
        <div>
          <label for="track-input" class="form-label">Order ID / Email / Phone</label>
          <input id="track-input" type="text" placeholder="Order ID, email, or phone number" required class="form-input h-12" />
        </div>
        <button type="submit" class="btn btn-primary h-12 px-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
          Track Order
        </button>
      </form>
    </div>

  </div>
</div>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { getCurrentUser, onUserChange, db, collection, query, where, getDocs } from './js/firebase-config.js';
import { formatPrice } from './js/cart.js';

onUserChange(async (user) => {
  if (!user) return;
  document.getElementById('my-orders-section').classList.remove('hidden');
  document.getElementById('my-orders-heading').textContent = 'Placed by ' + (user.name || 'you');

  try {
    const q = query(collection(db, 'orders'), where('userId', '==', user._id));
    const snap = await getDocs(q);
    const orders = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime() || 0;
        const tb = b.createdAt?.toDate?.()?.getTime() || 0;
        return tb - ta;
      });

    document.getElementById('my-orders-loading').classList.add('hidden');
    document.getElementById('orders-count').textContent = orders.length + ' order' + (orders.length===1?'':'s');

    if (orders.length === 0) {
      document.getElementById('my-orders-empty').classList.remove('hidden');
      return;
    }

    document.getElementById('my-orders-list').classList.remove('hidden');
    document.getElementById('my-orders-list').innerHTML = orders.map(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      const statusLabel = String(order.status || 'pending').replace(/_/g, ' ');
      const createdAt = order.createdAt?.toDate?.()?.toLocaleString() || '';
      const contact = encodeURIComponent(user.email || '');
      return `
        <div class="rounded-3xl border-2 border-[#E6DCCB] bg-white p-4 sm:p-6 shadow-sm">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-xs uppercase tracking-[.18em] text-[#8A7768]">Order ID</p>
              <p class="font-semibold text-[#3E2723] break-all text-sm">${order.orderId || order.id}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#8B2C6D] capitalize">${statusLabel}</span>
              <span class="text-sm text-[#6B5B52]">${createdAt}</span>
            </div>
          </div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            ${items.map(item => `
              <div class="rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3">
                <img src="${item.image||'assets/main.png'}" alt="${item.product_name||''}" class="h-36 w-full rounded-xl object-cover" />
                <p class="mt-3 font-medium text-[#3E2723] line-clamp-2 text-sm">${item.product_name||'Product'}</p>
                <div class="mt-2 flex items-center justify-between gap-3 text-sm text-[#6B5B52]">
                  <span>Qty: ${item.quantity||1}</span>
                  <span class="font-semibold text-[#3E2723]">${formatPrice(Number(item.price||0)*Number(item.quantity||1))}</span>
                </div>
              </div>`).join('')}
          </div>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#F0E7DA] pt-4">
            <div class="text-sm text-[#6B5B52]">
              <p>Total amount</p>
              <p class="font-semibold text-[#3E2723]">${formatPrice(Number(order.total||0))}</p>
            </div>
            <a href="track-status.php?orderId=${order.orderId||order.id}&contact=${contact}" class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111] px-5 py-3 font-semibold text-white transition hover:bg-[#2A2A2A] text-sm">
              View order
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
            </a>
          </div>
        </div>`;
    }).join('');
  } catch(e) {
    document.getElementById('my-orders-loading').textContent = 'Could not load orders.';
  }
});

document.getElementById('track-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const val = document.getElementById('track-input').value.trim();
  if (!val) { showToast('Please enter order ID, email, or phone', 'error'); return; }
  window.location.href = 'track-results.php?query=' + encodeURIComponent(val);
});
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
