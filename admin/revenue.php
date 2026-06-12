<?php
$pageTitle = 'Revenue — Admin';
$cssPath = '../css/style.css';
$adminPage = 'revenue';
include 'head.php';
?>
<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1 pt-14 md:pt-0">
    <div class="mb-8">
      <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Revenue</h1>
      <p class="text-[#8A7768] mt-1">Sales overview and order revenue</p>
    </div>

    <!-- Period cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="stat-card flex items-center justify-between">
        <div><p class="stat-label">Today</p><p class="stat-value text-[#D97736]" id="rev-day">—</p></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#D97736] opacity-20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg>
      </div>
      <div class="stat-card flex items-center justify-between">
        <div><p class="stat-label">This Week</p><p class="stat-value text-[#D97736]" id="rev-week">—</p></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#D97736] opacity-20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg>
      </div>
      <div class="stat-card flex items-center justify-between">
        <div><p class="stat-label">This Month</p><p class="stat-value text-[#D97736]" id="rev-month">—</p></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#D97736] opacity-20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg>
      </div>
      <div class="stat-card flex items-center justify-between">
        <div><p class="stat-label">All Time</p><p class="stat-value text-green-600" id="rev-total">—</p></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-green-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg>
      </div>
    </div>

    <!-- Full orders table -->
    <div class="bg-white rounded-2xl border border-[#E0D8C8] shadow-sm overflow-x-auto">
      <div class="px-6 py-4 border-b border-[#E0D8C8]">
        <h2 class="font-heading text-xl font-bold text-[#3E2723]">All Orders Revenue</h2>
      </div>
      <div id="rev-loading" class="text-center py-10 text-[#8A7768]">Loading…</div>
      <table class="w-full text-sm hidden" id="rev-table">
        <thead><tr class="bg-[#FAF7F2] border-b border-[#E0D8C8] text-[#8A7768] text-xs uppercase tracking-wider">
          <th class="text-left py-3 px-4">Customer</th>
          <th class="text-left py-3 px-4">Date</th>
          <th class="text-left py-3 px-4">Payment</th>
          <th class="text-left py-3 px-4">Status</th>
          <th class="text-right py-3 px-4">Amount</th>
        </tr></thead>
        <tbody id="rev-tbody"></tbody>
        <tfoot><tr class="border-t-2 border-[#E0D8C8] bg-[#FAF7F2]">
          <td colspan="4" class="py-3 px-4 font-bold text-[#3E2723]">Total</td>
          <td class="py-3 px-4 text-right font-bold text-[#D97736]" id="rev-footer-total">—</td>
        </tr></tfoot>
      </table>
    </div>
  </main>
</div>
<script type="module">
import { db, collection, getDocs } from '../js/firebase-config.js';
import '../js/admin-common.js';

function fmt(n) { return '₹' + Number(n||0).toLocaleString('en-IN'); }

async function load() {
  const snap = await getDocs(collection(db, 'orders'));
  const orders = snap.docs.map(d => ({ _docId: d.id, ...d.data() }))
    .sort((a,b) => (b.createdAt?.toDate?.()?.getTime()||0) - (a.createdAt?.toDate?.()?.getTime()||0));

  const now = new Date();
  const startDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startWeek  = new Date(now); startWeek.setDate(now.getDate()-now.getDay()); startWeek.setHours(0,0,0,0);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let day=0, week=0, month=0, total=0;
  orders.forEach(o => {
    const t = Number(o.total||0);
    const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt||0);
    if (d >= startDay)   day   += t;
    if (d >= startWeek)  week  += t;
    if (d >= startMonth) month += t;
    total += t;
  });

  document.getElementById('rev-day').textContent   = fmt(day);
  document.getElementById('rev-week').textContent  = fmt(week);
  document.getElementById('rev-month').textContent = fmt(month);
  document.getElementById('rev-total').textContent = fmt(total);

  const statusColors = { pending:'bg-yellow-100 text-yellow-800', shipped:'bg-indigo-100 text-indigo-800', in_transit:'bg-blue-100 text-blue-800', delivered:'bg-green-100 text-green-800', cancelled:'bg-red-100 text-red-800' };

  document.getElementById('rev-loading').classList.add('hidden');
  document.getElementById('rev-table').classList.remove('hidden');
  document.getElementById('rev-tbody').innerHTML = orders.map(o => `
    <tr class="border-b border-[#F0E8DC] hover:bg-[#FAF7F2]">
      <td class="py-3 px-4 text-[#3E2723]">${o.userName||o.userEmail||'—'}</td>
      <td class="py-3 px-4 text-[#5D4037]">${o.createdAt?.toDate?.()?.toLocaleDateString()||'—'}</td>
      <td class="py-3 px-4 text-[#5D4037] capitalize">${o.paymentMethod||'cod'}</td>
      <td class="py-3 px-4"><span class="rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[o.status]||'bg-gray-100 text-gray-700'}">${(o.status||'pending').replace(/_/g,' ')}</span></td>
      <td class="py-3 px-4 text-right font-semibold text-[#D97736]">${fmt(o.total)}</td>
    </tr>
  `).join('');
  document.getElementById('rev-footer-total').textContent = fmt(total);
}
load();
</script>
</body>
</html>
