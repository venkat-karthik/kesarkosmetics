<?php
$pageTitle = 'Admin Dashboard — Kesar Kosmetics';
$cssPath = '../css/style.css';
include '../includes/head.php';
?>

<div class="flex min-h-screen bg-gray-100">

  <!-- Sidebar -->
  <aside class="admin-sidebar hidden md:flex flex-col">
    <div class="px-6 py-5 border-b border-white/10">
      <img src="../assets/logo.jpeg" alt="Kesar Kosmetics" class="h-10 object-contain" />
    </div>
    <nav class="flex-1 py-4">
      <a href="dashboard.php" class="active">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>
        Dashboard
      </a>
      <a href="orders.php">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>
        Orders
      </a>
      <a href="products.php">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"/></svg>
        Products
      </a>
      <a href="blogs.php">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"/></svg>
        Blogs
      </a>
      <a href="users.php">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
        Users
      </a>
      <div class="border-t border-white/10 mt-4 pt-4">
        <button id="admin-logout-btn" class="w-full text-left">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>
          Logout
        </button>
      </div>
    </nav>
  </aside>

  <!-- Main content -->
  <main class="admin-content flex-1">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Dashboard</h1>
        <p class="text-[#8A7768] mt-1">Welcome back, Admin</p>
      </div>
      <a href="../index.php" class="btn btn-outline text-sm">← View Site</a>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="stat-card">
        <p class="stat-label">Total Orders</p>
        <p class="stat-value" id="stat-orders">—</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total Revenue</p>
        <p class="stat-value" id="stat-revenue">—</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Products</p>
        <p class="stat-value" id="stat-products">—</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Subscribers</p>
        <p class="stat-value" id="stat-subscribers">—</p>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-2xl border border-[#E0D8C8] p-6 shadow-sm mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-heading text-xl font-bold text-[#3E2723]">Recent Orders</h2>
        <a href="orders.php" class="text-sm text-[#D97736] hover:text-[#C96626] font-medium">View all →</a>
      </div>
      <div id="recent-orders-loading" class="text-center py-8 text-[#8A7768]">Loading…</div>
      <div id="recent-orders-table" class="hidden overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[#E0D8C8] text-[#8A7768] text-xs uppercase tracking-wider">
            <th class="text-left py-3 pr-4">Order ID</th>
            <th class="text-left py-3 pr-4">Customer</th>
            <th class="text-left py-3 pr-4">Total</th>
            <th class="text-left py-3 pr-4">Status</th>
            <th class="text-left py-3">Date</th>
          </tr></thead>
          <tbody id="recent-orders-body"></tbody>
        </table>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <a href="products.php" class="card p-6 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-3">📦</div>
        <p class="font-semibold text-[#3E2723]">Manage Products</p>
        <p class="text-xs text-[#8A7768] mt-1">Add, edit, or remove products</p>
      </a>
      <a href="blogs.php" class="card p-6 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-3">📝</div>
        <p class="font-semibold text-[#3E2723]">Manage Blogs</p>
        <p class="text-xs text-[#8A7768] mt-1">Create and edit blog posts</p>
      </a>
      <a href="orders.php" class="card p-6 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-3">🚚</div>
        <p class="font-semibold text-[#3E2723]">Update Orders</p>
        <p class="text-xs text-[#8A7768] mt-1">Change order statuses</p>
      </a>
    </div>
  </main>
</div>

<div id="toast-container"></div>

<script type="module">
import { getCurrentUser, onUserChange, isAdmin, logout, db, collection, getDocs, query, orderBy } from '../js/firebase-config.js';

// Auth guard
onUserChange(user => {
  if (!user || !isAdmin(user.email)) {
    window.location.href = '../login.php';
  }
});

document.getElementById('admin-logout-btn').addEventListener('click', async () => {
  await logout();
  window.location.href = '../login.php';
});

window.showToast = function(msg, type='info') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type==='success'?'✓':'ℹ'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

async function loadStats() {
  try {
    const [ordersSnap, productsSnap, subsSnap] = await Promise.all([
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'subscribers')),
    ]);

    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-revenue').textContent = '₹' + revenue.toLocaleString('en-IN');
    document.getElementById('stat-products').textContent = productsSnap.size;
    document.getElementById('stat-subscribers').textContent = subsSnap.size;

    // Recent orders table
    const recent = orders
      .sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime() || 0;
        const tb = b.createdAt?.toDate?.()?.getTime() || 0;
        return tb - ta;
      })
      .slice(0, 10);

    document.getElementById('recent-orders-loading').classList.add('hidden');
    document.getElementById('recent-orders-table').classList.remove('hidden');
    document.getElementById('recent-orders-body').innerHTML = recent.map(o => `
      <tr class="border-b border-[#F0E8DC] hover:bg-[#FAF7F2]">
        <td class="py-3 pr-4 font-mono text-xs text-[#3E2723]">${(o.orderId||o.id||'').substring(0,12)}…</td>
        <td class="py-3 pr-4 text-[#5D4037]">${o.userName||o.userEmail||'—'}</td>
        <td class="py-3 pr-4 font-semibold text-[#3E2723]">₹${Number(o.total||0).toLocaleString('en-IN')}</td>
        <td class="py-3 pr-4"><span class="rounded-full bg-[#F7F1E8] px-2 py-0.5 text-xs font-semibold text-[#8B2C6D] capitalize">${String(o.status||'pending').replace(/_/g,' ')}</span></td>
        <td class="py-3 text-xs text-[#8A7768]">${o.createdAt?.toDate?.()?.toLocaleDateString()||'—'}</td>
      </tr>
    `).join('');
  } catch(e) {
    console.error('Stats error:', e);
  }
}

loadStats();
</script>
</body>
</html>
