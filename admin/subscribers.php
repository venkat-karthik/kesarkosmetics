<?php
$pageTitle = 'Subscribers — Admin';
$cssPath = '../css/style.css';
$adminPage = 'subscribers';
include 'head.php';
?>
<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1 pt-14 md:pt-0">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Subscribers</h1>
        <p class="text-[#8A7768] mt-1">Newsletter subscribers</p>
      </div>
      <button id="clear-all-btn" class="btn btn-danger text-sm hidden">🗑 Clear All</button>
    </div>

    <div id="subs-loading" class="text-center py-12 text-[#8A7768]">Loading…</div>
    <div id="subs-table-wrap" class="hidden bg-white rounded-2xl border border-[#E0D8C8] shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="bg-[#FAF7F2] border-b border-[#E0D8C8] text-[#8A7768] text-xs uppercase tracking-wider">
          <th class="text-left py-3 px-4">Email</th>
          <th class="text-left py-3 px-4">Source</th>
          <th class="text-left py-3 px-4">Subscribed At</th>
          <th class="py-3 px-4"></th>
        </tr></thead>
        <tbody id="subs-tbody"></tbody>
      </table>
    </div>
  </main>
</div>
<script type="module">
import { db, collection, getDocs, doc, deleteDoc, writeBatch } from '../js/firebase-config.js';
import '../js/admin-common.js';

let subs = [];

async function load() {
  const snap = await getDocs(collection(db, 'subscribers'));
  subs = snap.docs.map(d => ({ _docId: d.id, ...d.data() }))
    .sort((a,b) => (b.subscribedAt?.toDate?.()?.getTime()||0) - (a.subscribedAt?.toDate?.()?.getTime()||0));

  document.getElementById('subs-loading').classList.add('hidden');
  document.getElementById('subs-table-wrap').classList.remove('hidden');

  if (subs.length > 0) document.getElementById('clear-all-btn').classList.remove('hidden');

  if (subs.length === 0) {
    document.getElementById('subs-tbody').innerHTML = '<tr><td colspan="4" class="py-10 text-center text-[#8A7768]">No subscribers yet.</td></tr>';
    return;
  }

  render();
}

function render() {
  document.getElementById('subs-tbody').innerHTML = subs.map(s => `
    <tr class="border-b border-[#F0E8DC] hover:bg-[#FAF7F2]">
      <td class="py-3 px-4 text-[#3E2723]">${s.email||'—'}</td>
      <td class="py-3 px-4 text-[#5D4037] capitalize">${s.source||'—'}</td>
      <td class="py-3 px-4 text-xs text-[#8A7768]">${s.subscribedAt?.toDate?.()?.toLocaleString()||'—'}</td>
      <td class="py-3 px-4 text-right"><button onclick="deleteSub('${s._docId}')" class="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button></td>
    </tr>
  `).join('');
}

window.deleteSub = async (docId) => {
  if (!confirm('Delete this subscriber?')) return;
  try {
    await deleteDoc(doc(db, 'subscribers', docId));
    subs = subs.filter(s => s._docId !== docId);
    render();
    showToast('Subscriber deleted', 'success');
    if (subs.length === 0) document.getElementById('clear-all-btn').classList.add('hidden');
  } catch(e) { showToast('Failed to delete', 'error'); }
};

document.getElementById('clear-all-btn').addEventListener('click', async () => {
  if (!confirm('⚠️ Delete ALL subscribers? This cannot be undone.')) return;
  try {
    const batch = writeBatch(db);
    subs.forEach(s => batch.delete(doc(db, 'subscribers', s._docId)));
    await batch.commit();
    subs = [];
    render();
    document.getElementById('clear-all-btn').classList.add('hidden');
    showToast('All subscribers cleared', 'success');
  } catch(e) { showToast('Failed to clear', 'error'); }
});

load();
</script>
</body>
</html>
