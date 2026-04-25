<?php
$pageTitle = 'Manage Orders — Admin';
$cssPath = '../css/style.css';
include '../includes/head.php';
?>

<div class="flex min-h-screen bg-gray-100">
  <aside class="admin-sidebar hidden md:flex flex-col">
    <div class="px-6 py-5 border-b border-white/10"><img src="../assets/main_logo.png" alt="Kesar Kosmetics" class="h-10 object-contain" /></div>
    <nav class="flex-1 py-4">
      <a href="dashboard.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>Dashboard</a>
      <a href="orders.php" class="active"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>Orders</a>
      <a href="products.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"/></svg>Products</a>
      <a href="blogs.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"/></svg>Blogs</a>
      <div class="border-t border-white/10 mt-4 pt-4">
        <button id="admin-logout-btn" class="w-full text-left"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>Logout</button>
      </div>
    </nav>
  </aside>

  <main class="admin-content flex-1">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Orders</h1>
        <p class="text-[#8A7768] mt-1">Manage and update order statuses</p>
      </div>
    </div>

    <div id="orders-loading" class="text-center py-12 text-[#8A7768]">Loading orders…</div>
    <div id="orders-table-wrap" class="hidden bg-white rounded-2xl border border-[#E0D8C8] shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead><tr class="bg-[#FAF7F2] border-b border-[#E0D8C8] text-[#8A7768] text-xs uppercase tracking-wider">
          <th class="text-left py-3 px-4">Order ID</th>
          <th class="text-left py-3 px-4">Customer</th>
          <th class="text-left py-3 px-4">Total</th>
          <th class="text-left py-3 px-4">Payment</th>
          <th class="text-left py-3 px-4">Status</th>
          <th class="text-left py-3 px-4">Date</th>
          <th class="text-left py-3 px-4">Actions</th>
        </tr></thead>
        <tbody id="orders-tbody"></tbody>
      </table>
    </div>
  </main>
</div>

<div id="toast-container"></div>

<script type="module">
import { getCurrentUser, onUserChange, isAdmin, logout, db, collection, getDocs, doc, updateDoc } from '../js/firebase-config.js';

onUserChange(user => {
  if (!user || !isAdmin(user.email)) window.location.href = '../login.php';
});
document.getElementById('admin-logout-btn').addEventListener('click', async () => { await logout(); window.location.href = '../login.php'; });

window.showToast = function(msg, type='info') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type==='success'?'✓':'ℹ'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

const statuses = ['pending','shipped','in_transit','delivered','cancelled'];

async function loadOrders() {
  const snap = await getDocs(collection(db, 'orders'));
  const orders = snap.docs
    .map(d => ({ _docId: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.createdAt?.toDate?.()?.getTime() || 0;
      const tb = b.createdAt?.toDate?.()?.getTime() || 0;
      return tb - ta;
    });

  document.getElementById('orders-loading').classList.add('hidden');
  document.getElementById('orders-table-wrap').classList.remove('hidden');
  document.getElementById('orders-tbody').innerHTML = orders.map(o => `
    <tr class="border-b border-[#F0E8DC] hover:bg-[#FAF7F2]">
      <td class="py-3 px-4 font-mono text-xs text-[#3E2723]">${(o.orderId||o._docId||'').substring(0,12)}…</td>
      <td class="py-3 px-4 text-[#5D4037]">
        <p class="font-medium">${o.userName||'—'}</p>
        <p class="text-xs text-[#8A7768]">${o.userEmail||'—'}</p>
      </td>
      <td class="py-3 px-4 font-semibold text-[#3E2723]">₹${Number(o.total||0).toLocaleString('en-IN')}</td>
      <td class="py-3 px-4 text-[#5D4037] capitalize">${o.paymentMethod||'cod'}</td>
      <td class="py-3 px-4">
        <select onchange="updateStatus('${o._docId}', this.value)" class="text-xs border border-[#E0D8C8] rounded-lg px-2 py-1 bg-white text-[#3E2723] focus:outline-none focus:border-[#D97736]">
          ${statuses.map(s => `<option value="${s}" ${s===(o.status||'pending')?'selected':''}>${s.replace(/_/g,' ')}</option>`).join('')}
        </select>
      </td>
      <td class="py-3 px-4 text-xs text-[#8A7768]">${o.createdAt?.toDate?.()?.toLocaleDateString()||'—'}</td>
      <td class="py-3 px-4">
        <a href="../track-status.php?orderId=${o.orderId||o._docId}" target="_blank" class="btn btn-outline text-xs px-3 py-1.5">View</a>
      </td>
    </tr>
  `).join('');
}

window.updateStatus = async (docId, status) => {
  try {
    await updateDoc(doc(db, 'orders', docId), { status });
    showToast('Status updated to ' + status, 'success');
  } catch(e) { showToast('Failed to update status', 'error'); }
};

loadOrders();
</script>
</body>
</html>
