<?php
$pageTitle = 'Users — Admin';
$cssPath = '../css/style.css';
$adminPage = 'users';
include 'head.php';
?>

<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Users</h1>
        <p class="text-[#8A7768] mt-1">Registered customers and admins</p>
      </div>
      <span id="users-count" class="text-sm text-[#8A7768]"></span>
    </div>

    <div id="users-loading" class="text-center py-12 text-[#8A7768]">Loading users…</div>
    <div id="users-table-wrap" class="hidden bg-white rounded-2xl border border-[#E0D8C8] shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="bg-[#FAF7F2] border-b border-[#E0D8C8] text-[#8A7768] text-xs uppercase tracking-wider">
          <th class="text-left py-3 px-4">Name</th>
          <th class="text-left py-3 px-4">Email</th>
          <th class="text-left py-3 px-4">Phone</th>
          <th class="text-left py-3 px-4">Role</th>
          <th class="text-left py-3 px-4">Provider</th>
          <th class="text-left py-3 px-4">Joined</th>
        </tr></thead>
        <tbody id="users-tbody"></tbody>
      </table>
    </div>
  </main>
</div>

<script type="module">
import { db, collection, getDocs } from '../js/firebase-config.js';
import '../js/admin-common.js';


async function load() {
  const snap = await getDocs(collection(db, 'users'));
  const users = snap.docs.map(d => ({ _docId: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toDate?.()?.getTime()||0) - (a.createdAt?.toDate?.()?.getTime()||0));

  document.getElementById('users-count').textContent = users.length + ' user' + (users.length===1?'':'s');
  document.getElementById('users-loading').classList.add('hidden');
  document.getElementById('users-table-wrap').classList.remove('hidden');

  if (users.length === 0) {
    document.getElementById('users-tbody').innerHTML = '<tr><td colspan="6" class="py-10 text-center text-[#8A7768]">No users yet.</td></tr>';
    return;
  }

  document.getElementById('users-tbody').innerHTML = users.map(u => `
    <tr class="border-b border-[#F0E8DC] hover:bg-[#FAF7F2]">
      <td class="py-3 px-4 font-medium text-[#3E2723]">${u.name||'—'}</td>
      <td class="py-3 px-4 text-[#5D4037]">${u.email||'—'}</td>
      <td class="py-3 px-4 text-[#5D4037]">${u.phone||'—'}</td>
      <td class="py-3 px-4"><span class="rounded-full px-2 py-0.5 text-xs font-semibold ${u.role==='admin'?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}">${u.role||'customer'}</span></td>
      <td class="py-3 px-4 text-[#5D4037] capitalize">${u.provider||'google'}</td>
      <td class="py-3 px-4 text-xs text-[#8A7768]">${u.createdAt?.toDate?.()?.toLocaleDateString()||'—'}</td>
    </tr>
  `).join('');
}
load();
</script>
</body>
</html>
