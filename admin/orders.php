<?php
$pageTitle = 'Orders — Admin';
$cssPath = '../css/style.css';
$adminPage = 'orders';
include 'head.php';
?>
<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1 pt-14 md:pt-0">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Orders</h1>
        <p class="text-[#8A7768] mt-1" id="orders-subtitle">Loading…</p>
      </div>
      <button id="refresh-btn" class="btn btn-outline text-sm flex items-center gap-2">
        <svg id="refresh-icon" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
        Refresh
      </button>
    </div>

    <div id="orders-loading" class="text-center py-12 text-[#8A7768]">Loading orders…</div>
    <div id="orders-empty" class="hidden text-center py-16 bg-white rounded-2xl border border-[#E0D8C8]">
      <div class="text-5xl mb-3">📦</div>
      <p class="text-[#5D4037] font-medium">No orders yet</p>
    </div>
    <div id="orders-list" class="hidden space-y-3"></div>
  </main>
</div>

<script type="module">
import { db, collection, getDocs, doc, updateDoc, deleteDoc } from '../js/firebase-config.js';
import '../js/admin-common.js';

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Order Placed' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800', shipped: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-blue-100 text-blue-800', delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

let orders = [];
let expanded = null;

async function loadOrders() {
  document.getElementById('refresh-icon').classList.add('animate-spin');
  try {
    const snap = await getDocs(collection(db, 'orders'));
    orders = snap.docs.map(d => ({ _docId: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toDate?.()?.getTime()||0) - (a.createdAt?.toDate?.()?.getTime()||0));
    document.getElementById('orders-subtitle').textContent = orders.length + ' order' + (orders.length===1?'':'s');
    render();
  } catch(e) {
    showToast('Failed to load orders', 'error');
  } finally {
    document.getElementById('refresh-icon').classList.remove('animate-spin');
  }
}

function render() {
  document.getElementById('orders-loading').classList.add('hidden');
  if (orders.length === 0) {
    document.getElementById('orders-empty').classList.remove('hidden');
    document.getElementById('orders-list').classList.add('hidden');
    return;
  }
  document.getElementById('orders-empty').classList.add('hidden');
  document.getElementById('orders-list').classList.remove('hidden');

  document.getElementById('orders-list').innerHTML = orders.map(o => {
    const isExp = expanded === o._docId;
    const items = Array.isArray(o.items) ? o.items : [];
    const addr = o.shippingAddress || {};
    const statusColor = STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700';
    const currentStatus = o.status || 'pending';

    return `
    <div class="bg-white rounded-2xl border border-[#E0D8C8] overflow-hidden shadow-sm">
      <!-- Header row -->
      <button type="button" onclick="toggleExpand('${o._docId}')"
        class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4 bg-[#FAF7F2] hover:bg-[#F5EEE6] transition-colors text-left">
        <div class="min-w-0">
          <p class="font-mono text-xs text-[#8A7768] truncate">${o.orderId || o._docId}</p>
          <p class="font-semibold text-[#3E2723] mt-0.5">${o.userName || o.userEmail || 'Customer'}</p>
          <p class="text-xs text-[#8A7768]">${o.createdAt?.toDate?.()?.toLocaleString() || '—'}</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap shrink-0">
          <span class="font-bold text-[#D97736]">₹${Number(o.total||0).toLocaleString('en-IN')}</span>
          <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColor}">${currentStatus.replace(/_/g,' ')}</span>
          <span class="text-xs text-[#8A7768] capitalize">${o.paymentMethod||'cod'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#8A7768] transition-transform ${isExp?'rotate-180':''}" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
        </div>
      </button>

      <!-- Expanded details -->
      ${isExp ? `
      <div class="p-5 border-t border-[#E0D8C8] space-y-5">
        <!-- Info grid -->
        <div class="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-xs uppercase tracking-wide text-[#8A7768] mb-1">Customer</p>
            <p class="font-medium text-[#3E2723]">${addr.name || o.userName || '—'}</p>
            <p class="text-[#5D4037]">${o.userEmail || '—'}</p>
            <p class="text-[#5D4037]">${addr.phone || '—'}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-[#8A7768] mb-1">Shipping Address</p>
            <p class="text-[#3E2723]">${[addr.address, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(', ') || '—'}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-[#8A7768] mb-1">Summary</p>
            <p class="text-[#3E2723]">Items: ${items.length}</p>
            <p class="text-[#3E2723]">Total: <span class="font-bold text-[#D97736]">₹${Number(o.total||0).toLocaleString('en-IN')}</span></p>
            <p class="text-[#3E2723] capitalize">Payment: ${o.paymentMethod || 'cod'}</p>
          </div>
        </div>

        <!-- Items -->
        <div>
          <p class="text-xs uppercase tracking-wide text-[#8A7768] mb-2">Items</p>
          <div class="space-y-1.5">
            ${items.map(item => `
              <div class="flex items-center justify-between rounded-xl bg-[#FAF7F2] px-4 py-2 text-sm">
                <span class="font-medium text-[#3E2723]">${item.product_name || 'Product'}</span>
                <span class="text-[#5D4037]">×${item.quantity}</span>
                <span class="font-semibold text-[#D97736]">₹${Number((item.price||0)*(item.quantity||1)).toLocaleString('en-IN')}</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Status update + actions -->
        <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-[#F0E7DA]">
          <select id="status-select-${o._docId}" class="rounded-xl border border-[#D8D0C2] px-3 py-2 text-sm bg-white outline-none focus:border-[#D97736]">
            ${STATUS_OPTIONS.map(s => `<option value="${s.value}" ${s.value===currentStatus?'selected':''}>${s.label}</option>`).join('')}
          </select>
          <button onclick="updateStatus('${o._docId}')" id="status-btn-${o._docId}"
            class="btn btn-primary text-sm px-4 py-2">
            Update Status
          </button>
          <a href="../track-status.php?orderId=${o.orderId||o._docId}" target="_blank"
            class="btn btn-outline text-sm px-4 py-2">View</a>
          <button onclick="deleteOrder('${o._docId}')"
            class="btn btn-danger text-sm px-4 py-2 ml-auto">Delete</button>
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
}

window.toggleExpand = (docId) => {
  expanded = expanded === docId ? null : docId;
  render();
};

window.updateStatus = async (docId) => {
  const select = document.getElementById('status-select-' + docId);
  const btn = document.getElementById('status-btn-' + docId);
  const newStatus = select.value;
  btn.disabled = true;
  btn.innerHTML = '<svg class="animate-spin w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Updating…';
  try {
    await updateDoc(doc(db, 'orders', docId), { status: newStatus });
    const o = orders.find(x => x._docId === docId);
    if (o) o.status = newStatus;
    render();
    showToast('Status updated to ' + newStatus.replace(/_/g,' '), 'success');
  } catch(e) {
    showToast('Failed to update status', 'error');
    btn.disabled = false;
    btn.textContent = 'Update Status';
  }
};

window.deleteOrder = async (docId) => {
  if (!confirm('Delete this order? This cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'orders', docId));
    orders = orders.filter(o => o._docId !== docId);
    if (expanded === docId) expanded = null;
    document.getElementById('orders-subtitle').textContent = orders.length + ' order' + (orders.length===1?'':'s');
    render();
    showToast('Order deleted', 'success');
  } catch(e) { showToast('Failed to delete order', 'error'); }
};

document.getElementById('refresh-btn').addEventListener('click', loadOrders);
loadOrders();
</script>
</body>
</html>
