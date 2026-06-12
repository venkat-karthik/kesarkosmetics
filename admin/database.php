<?php
$pageTitle = 'Database — Admin';
$cssPath = '../css/style.css';
$adminPage = 'database';
include 'head.php';
?>
<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1 pt-14 md:pt-0">
    <div class="mb-8">
      <h1 class="font-heading text-3xl font-bold text-[#3E2723]">🗄 Database</h1>
      <p class="text-[#8A7768] mt-1">View and manage Firestore collections</p>
    </div>

    <!-- Collection cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8" id="collections-grid">
      <div class="col-span-full text-center py-8 text-[#8A7768]">Loading collections…</div>
    </div>

    <!-- Collection viewer -->
    <div id="collection-viewer" class="hidden bg-white rounded-2xl border border-[#E0D8C8] shadow-sm">
      <div class="flex items-center justify-between px-5 py-4 border-b border-[#E0D8C8]">
        <h2 class="font-heading text-xl font-bold text-[#3E2723]" id="viewer-title">Collection</h2>
        <div class="flex gap-2">
          <button id="clear-collection-btn" class="btn btn-danger text-sm">⚠️ Clear All</button>
          <button id="close-viewer-btn" class="btn btn-outline text-sm">Close</button>
        </div>
      </div>
      <div id="viewer-loading" class="text-center py-10 text-[#8A7768]">Loading…</div>
      <div id="viewer-content" class="hidden overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table class="w-full text-xs">
          <thead><tr class="bg-[#FAF7F2] border-b border-[#E0D8C8] sticky top-0">
            <th class="text-left py-2 px-4 text-[#8A7768] uppercase tracking-wider">Doc ID</th>
            <th class="text-left py-2 px-4 text-[#8A7768] uppercase tracking-wider">Data (preview)</th>
            <th class="py-2 px-4"></th>
          </tr></thead>
          <tbody id="viewer-tbody"></tbody>
        </table>
      </div>
    </div>
  </main>
</div>
<script type="module">
import { db, collection, getDocs, doc, deleteDoc, writeBatch } from '../js/firebase-config.js';
import '../js/admin-common.js';

const COLLECTIONS = [
  { name: 'orders',      icon: '📦' },
  { name: 'users',       icon: '👤' },
  { name: 'products',    icon: '🛍' },
  { name: 'blogs',       icon: '📝' },
  { name: 'subscribers', icon: '📧' },
  { name: 'carts',       icon: '🛒' },
];

let currentCollection = null;
let currentDocs = [];

async function loadCollections() {
  const counts = await Promise.all(COLLECTIONS.map(async c => {
    try { const s = await getDocs(collection(db, c.name)); return s.size; }
    catch { return '?'; }
  }));

  document.getElementById('collections-grid').innerHTML = COLLECTIONS.map((c, i) => `
    <button onclick="viewCollection('${c.name}')" class="stat-card text-center hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
      <div class="text-3xl mb-2">${c.icon}</div>
      <p class="font-mono text-2xl font-bold text-[#D97736]">${counts[i]}</p>
      <p class="text-xs text-[#8A7768] mt-1 capitalize">${c.name}</p>
    </button>
  `).join('');
}

window.viewCollection = async (name) => {
  currentCollection = name;
  document.getElementById('collection-viewer').classList.remove('hidden');
  document.getElementById('viewer-title').textContent = name + ' collection';
  document.getElementById('viewer-loading').classList.remove('hidden');
  document.getElementById('viewer-content').classList.add('hidden');
  document.getElementById('collection-viewer').scrollIntoView({ behavior: 'smooth' });

  try {
    const snap = await getDocs(collection(db, name));
    currentDocs = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
    renderDocs();
  } catch(e) {
    document.getElementById('viewer-loading').textContent = 'Failed to load collection.';
  }
};

function renderDocs() {
  document.getElementById('viewer-loading').classList.add('hidden');
  document.getElementById('viewer-content').classList.remove('hidden');

  if (currentDocs.length === 0) {
    document.getElementById('viewer-tbody').innerHTML = '<tr><td colspan="3" class="py-8 text-center text-[#8A7768]">Collection is empty.</td></tr>';
    return;
  }

  document.getElementById('viewer-tbody').innerHTML = currentDocs.map(d => {
    const { _docId, ...rest } = d;
    const preview = JSON.stringify(rest).substring(0, 120) + (JSON.stringify(rest).length > 120 ? '…' : '');
    return `
      <tr class="border-b border-[#F0E8DC] hover:bg-[#FAF7F2]">
        <td class="py-2 px-4 font-mono text-[#3E2723] whitespace-nowrap">${_docId}</td>
        <td class="py-2 px-4 text-[#5D4037] max-w-xs truncate">${preview}</td>
        <td class="py-2 px-4 text-right"><button onclick="deleteDoc_('${_docId}')" class="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button></td>
      </tr>
    `;
  }).join('');
}

window.deleteDoc_ = async (docId) => {
  if (!confirm('Delete this document?')) return;
  try {
    await deleteDoc(doc(db, currentCollection, docId));
    currentDocs = currentDocs.filter(d => d._docId !== docId);
    renderDocs();
    showToast('Document deleted', 'success');
    loadCollections();
  } catch(e) { showToast('Failed to delete', 'error'); }
};

document.getElementById('clear-collection-btn').addEventListener('click', async () => {
  if (!confirm(`⚠️ This will permanently delete ALL documents in "${currentCollection}". This cannot be undone. Continue?`)) return;
  try {
    const batch = writeBatch(db);
    currentDocs.forEach(d => batch.delete(doc(db, currentCollection, d._docId)));
    await batch.commit();
    currentDocs = [];
    renderDocs();
    showToast(`Cleared all documents from "${currentCollection}"`, 'success');
    loadCollections();
  } catch(e) { showToast('Failed to clear collection', 'error'); }
});

document.getElementById('close-viewer-btn').addEventListener('click', () => {
  document.getElementById('collection-viewer').classList.add('hidden');
  currentCollection = null;
});

loadCollections();
</script>
</body>
</html>
