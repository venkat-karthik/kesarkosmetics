<?php
$pageTitle = 'Order Status — Kesar Kosmetics';
$cssPath = 'css/style.css';
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-[#F6F5F2]">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
    <a href="track-order.php" class="inline-flex items-center gap-2 text-[#7A3B00] hover:text-[#E8620A] mb-6 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
      Back to Orders
    </a>

    <div id="order-loading" class="flex justify-center py-20"><div class="spinner"></div></div>
    <div id="order-not-found" class="hidden text-center py-20">
      <p class="text-xl font-semibold text-[#3E2723]">Order not found</p>
      <p class="text-sm text-[#6B5B52] mt-2">Please check your order ID and try again.</p>
      <a href="track-order.php" class="btn btn-primary mt-6">Try Again</a>
    </div>
    <div id="order-content" class="hidden space-y-6"></div>
  </div>
</div>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { db, doc, getDoc, collection, query, where, getDocs } from './js/firebase-config.js';
import { formatPrice } from './js/cart.js';

const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');

if (!orderId) { window.location.href = 'track-order.php'; }

async function loadOrder() {
  try {
    // Search Firestore by orderId field
    const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
    const snap = await getDocs(q);
    if (snap.empty) {
      document.getElementById('order-loading').classList.add('hidden');
      document.getElementById('order-not-found').classList.remove('hidden');
      return;
    }
    const order = { id: snap.docs[0].id, ...snap.docs[0].data() };
    renderOrder(order);
  } catch(e) {
    document.getElementById('order-loading').classList.add('hidden');
    document.getElementById('order-not-found').classList.remove('hidden');
  }
}

function buildTrackingSteps(status) {
  const s = String(status||'pending').toLowerCase();
  const keys = ['pending','shipped','in_transit','delivered'];
  const activeIndex = Math.max(keys.indexOf(s), 0);
  return [
    { label: 'Order Placed', completed: activeIndex >= 0, active: activeIndex === 0 },
    { label: 'Shipped',      completed: activeIndex >= 1, active: activeIndex === 1 },
    { label: 'In Transit',   completed: activeIndex >= 2, active: activeIndex === 2 },
    { label: 'Delivered',    completed: activeIndex >= 3, active: activeIndex === 3 },
  ];
}

function renderOrder(order) {
  document.getElementById('order-loading').classList.add('hidden');
  document.getElementById('order-content').classList.remove('hidden');

  const steps = buildTrackingSteps(order.status);
  const items = Array.isArray(order.items) ? order.items : [];
  const addr = order.shippingAddress || {};
  const createdAt = order.createdAt?.toDate?.()?.toLocaleString() || '';

  document.getElementById('order-content').innerHTML = `
    <!-- Order header -->
    <div class="rounded-3xl border-2 border-[#E6DCCB] bg-white p-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[.18em] text-[#8A7768]">Order ID</p>
          <p class="font-semibold text-[#3E2723] break-all">${order.orderId || order.id}</p>
          <p class="text-sm text-[#6B5B52] mt-1">${createdAt}</p>
        </div>
        <span class="rounded-full bg-[#F7F1E8] px-4 py-2 text-sm font-semibold text-[#8B2C6D] capitalize self-start">${String(order.status||'pending').replace(/_/g,' ')}</span>
      </div>
    </div>

    <!-- Tracking steps -->
    <div class="rounded-3xl border-2 border-[#E6DCCB] bg-white p-6 shadow-sm">
      <h2 class="font-heading text-xl font-bold text-[#3E2723] mb-6">Tracking Status</h2>
      <div class="flex items-center">
        ${steps.map((step, i) => `
          <div class="flex flex-col items-center flex-1">
            <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center ${step.completed?'bg-[#D97736] border-[#D97736]':'border-[#D0C4B4] bg-white'}">
              ${step.completed ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>' : ''}
            </div>
            <p class="text-xs font-medium mt-2 text-center ${step.completed?'text-[#D97736]':'text-[#8A7768]'}">${step.label}</p>
          </div>
          ${i < steps.length-1 ? `<div class="flex-1 h-0.5 ${steps[i+1].completed?'bg-[#D97736]':'bg-[#D0C4B4]'} mb-5"></div>` : ''}
        `).join('')}
      </div>
    </div>

    <!-- Items -->
    <div class="rounded-3xl border-2 border-[#E6DCCB] bg-white p-6 shadow-sm">
      <h2 class="font-heading text-xl font-bold text-[#3E2723] mb-4">Order Items</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        ${items.map(item => `
          <div class="rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3 flex gap-3">
            <img src="${item.image||'assets/logo.png'}" alt="${item.product_name||''}" class="w-16 h-16 object-cover rounded-xl shrink-0" />
            <div>
              <p class="font-medium text-[#3E2723] text-sm line-clamp-2">${item.product_name||'Product'}</p>
              <p class="text-xs text-[#6B5B52] mt-1">Qty: ${item.quantity||1}</p>
              <p class="text-sm font-semibold text-[#3E2723] mt-1">${formatPrice(Number(item.price||0)*Number(item.quantity||1))}</p>
            </div>
          </div>`).join('')}
      </div>
      <div class="mt-4 pt-4 border-t border-[#E9E0D2] flex justify-between text-sm font-semibold text-[#3E2723]">
        <span>Total</span>
        <span class="text-[#D97736] text-lg">${formatPrice(Number(order.total||0))}</span>
      </div>
    </div>

    <!-- Shipping address -->
    <div class="rounded-3xl border-2 border-[#E6DCCB] bg-white p-6 shadow-sm">
      <h2 class="font-heading text-xl font-bold text-[#3E2723] mb-4">Shipping Address</h2>
      <div class="grid sm:grid-cols-2 gap-3 text-sm text-[#5D4037]">
        <p><span class="font-medium">Name:</span> ${addr.name||'—'}</p>
        <p><span class="font-medium">Phone:</span> ${addr.phone||'—'}</p>
        <p><span class="font-medium">Address:</span> ${addr.address||'—'}</p>
        <p><span class="font-medium">City:</span> ${addr.city||'—'}</p>
        <p><span class="font-medium">State:</span> ${addr.state||'—'}</p>
        <p><span class="font-medium">Pincode:</span> ${addr.pincode||'—'}</p>
      </div>
    </div>
  `;
}

loadOrder();
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
