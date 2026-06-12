<?php
$pageTitle = 'Track Order Results — Kesar Kosmetics';
$cssPath = 'css/style.css';
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-[#F6F5F2]">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
    <a href="track-order.php" class="inline-flex items-center gap-2 text-[#7A3B00] hover:text-[#E8620A] mb-6 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
      Back to Track Order
    </a>

    <div class="mb-6">
      <p class="section-label">Search Results</p>
      <h1 class="font-heading text-3xl text-[#3E2723] mt-1">Orders matching your search</h1>
    </div>

    <div id="results-loading" class="flex justify-center py-20"><div class="spinner"></div></div>
    <div id="results-empty" class="hidden rounded-3xl border border-dashed border-[#E0D8C8] bg-white p-10 text-center">
      <p class="text-xl font-semibold text-[#3E2723]">No orders found</p>
      <p class="text-sm text-[#6B5B52] mt-2">Try searching with a different order ID, email, or phone number.</p>
      <a href="track-order.php" class="btn btn-primary mt-6">Try Again</a>
    </div>
    <div id="results-list" class="hidden space-y-4"></div>
  </div>
</div>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { db, collection, query, where, getDocs } from './js/firebase-config.js';
import { formatPrice } from './js/cart.js';

const params = new URLSearchParams(window.location.search);
const searchQuery = params.get('query') || '';

async function search() {
  if (!searchQuery) { window.location.href = 'track-order.php'; return; }

  try {
    // Search by orderId, userEmail, and shipping phone
    const q1 = query(collection(db, 'orders'), where('orderId', '==', searchQuery));
    const q2 = query(collection(db, 'orders'), where('userEmail', '==', searchQuery.toLowerCase()));
    const q3 = query(collection(db, 'orders'), where('shippingAddress.phone', '==', searchQuery));

    const [snap1, snap2, snap3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);
    const seen = new Set();
    const orders = [];
    [...snap1.docs, ...snap2.docs, ...snap3.docs].forEach(d => {
      if (!seen.has(d.id)) { seen.add(d.id); orders.push({ id: d.id, ...d.data() }); }
    });

    document.getElementById('results-loading').classList.add('hidden');

    if (orders.length === 0) {
      document.getElementById('results-empty').classList.remove('hidden');
      return;
    }

    document.getElementById('results-list').classList.remove('hidden');
    document.getElementById('results-list').innerHTML = orders.map(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      const statusLabel = String(order.status || 'pending').replace(/_/g, ' ');
      const createdAt = order.createdAt?.toDate?.()?.toLocaleString() || '';
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
          <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#F0E7DA] pt-4">
            <div class="text-sm text-[#6B5B52]">
              <p>Total: <span class="font-semibold text-[#3E2723]">${formatPrice(Number(order.total||0))}</span></p>
              <p class="mt-1">${items.length} item${items.length===1?'':'s'}</p>
            </div>
            <a href="track-status.php?orderId=${order.orderId||order.id}" class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111] px-5 py-3 font-semibold text-white transition hover:bg-[#2A2A2A] text-sm">
              View order
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
            </a>
          </div>
        </div>`;
    }).join('');
  } catch(e) {
    document.getElementById('results-loading').classList.add('hidden');
    document.getElementById('results-empty').classList.remove('hidden');
  }
}

search();
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
