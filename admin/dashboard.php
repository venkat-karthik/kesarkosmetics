<?php
$pageTitle = 'Admin Dashboard — Kesar Kosmetics';
$cssPath = '../css/style.css';
$adminPage = 'dashboard';
include 'head.php';
?>

<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1 pt-14 md:pt-0">
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
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <a href="products.php" class="card p-5 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-2">📦</div>
        <p class="font-semibold text-[#3E2723] text-sm">Products</p>
      </a>
      <a href="orders.php" class="card p-5 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-2">🚚</div>
        <p class="font-semibold text-[#3E2723] text-sm">Orders</p>
      </a>
      <a href="revenue.php" class="card p-5 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-2">📈</div>
        <p class="font-semibold text-[#3E2723] text-sm">Revenue</p>
      </a>
      <a href="blogs.php" class="card p-5 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-2">📝</div>
        <p class="font-semibold text-[#3E2723] text-sm">Blogs</p>
      </a>
      <a href="reviews.php" class="card p-5 hover:shadow-md transition-shadow text-center">
        <div class="text-3xl mb-2">⭐</div>
        <p class="font-semibold text-[#3E2723] text-sm">Reviews</p>
      </a>
    </div>
  </main>
</div>

<script type="module">
import { db, collection, getDocs } from '../js/firebase-config.js';
import '../js/admin-common.js';

async function loadStats() {
  try {
    const [ordersSnap, productsSnap, subsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'subscribers')),
      getDocs(collection(db, 'users')),
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
