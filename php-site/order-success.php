<?php
$pageTitle = 'Order Confirmed — Kesar Kosmetics';
$cssPath = 'css/style.css';
include 'includes/head.php';
?>

<div class="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F0E8DC] flex items-center justify-center px-4 py-16">
  <div class="max-w-lg w-full bg-white rounded-3xl border border-[#EDE4D8] shadow-[0_8px_40px_rgba(62,39,35,0.1)] p-10 text-center">
    <div class="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center mb-6 shadow-inner">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
    </div>
    <div class="h-0.5 w-16 bg-gradient-to-r from-[#D97736] to-[#F5A800] rounded-full mx-auto mb-6"></div>
    <h1 class="font-heading text-4xl font-semibold text-[#3E2723] mb-2">Order Confirmed! 🎉</h1>
    <p class="text-[#8A7768] text-sm leading-relaxed">Thank you for your purchase. We're carefully preparing your order.</p>

    <div id="order-id-box" class="hidden mt-5 mb-6 bg-[#FAF7F2] rounded-2xl px-5 py-4 border border-[#EDE4D8] w-full">
      <p class="text-xs text-[#8A7768] uppercase tracking-widest mb-1">Order ID</p>
      <p id="order-id-text" class="font-mono text-sm font-semibold text-[#3E2723] break-all"></p>
    </div>

    <div class="mb-6 grid grid-cols-3 gap-3 text-center">
      <?php foreach ([['📦','Packed','Within 24h'],['🚚','Shipped','1–2 days'],['🏠','Delivered','4–7 days']] as [$emoji,$label,$sub]): ?>
      <div class="bg-[#FAF7F2] rounded-xl border border-[#EDE4D8] p-3">
        <div class="text-2xl mb-1"><?= $emoji ?></div>
        <p class="text-xs font-bold text-[#3E2723]"><?= $label ?></p>
        <p class="text-[10px] text-[#8A7768]"><?= $sub ?></p>
      </div>
      <?php endforeach; ?>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <a href="track-order.php" class="flex-1 btn btn-dark justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>
        Track Order
      </a>
      <a href="products.php" class="flex-1 btn btn-primary justify-center">Continue Shopping</a>
    </div>
  </div>
</div>

<div id="toast-container"></div>

<script>
const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');
if (orderId) {
  document.getElementById('order-id-text').textContent = orderId;
  document.getElementById('order-id-box').classList.remove('hidden');
}
window.showToast = function(msg, type='info') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type==='success'?'✓':'ℹ'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};
</script>
</body>
</html>
