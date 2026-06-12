<?php
$pageTitle = 'Reviews — Admin';
$cssPath = '../css/style.css';
$adminPage = 'reviews';
include 'head.php';
?>
<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1 pt-14 md:pt-0">
    <div class="mb-8">
      <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Reviews</h1>
      <p class="text-[#8A7768] mt-1">Customer reviews across all products</p>
    </div>

    <div id="reviews-loading" class="text-center py-12 text-[#8A7768]">Loading reviews…</div>
    <div id="reviews-list" class="hidden space-y-6"></div>
    <div id="reviews-empty" class="hidden text-center py-12 text-[#8A7768] bg-white rounded-2xl border border-[#E0D8C8]">No reviews yet.</div>
  </main>
</div>
<script type="module">
import { db, collection, getDocs, doc, updateDoc, getDoc } from '../js/firebase-config.js';
import '../js/admin-common.js';

let products = [];

async function load() {
  const snap = await getDocs(collection(db, 'products'));
  products = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(p => Array.isArray(p.reviews) && p.reviews.length > 0)
    .sort((a,b) => (b.reviews?.length||0) - (a.reviews?.length||0));

  document.getElementById('reviews-loading').classList.add('hidden');

  if (products.length === 0) {
    document.getElementById('reviews-empty').classList.remove('hidden');
    return;
  }

  document.getElementById('reviews-list').classList.remove('hidden');
  render();
}

function stars(n) {
  return [1,2,3,4,5].map(i => `<svg viewBox="0 0 20 20" style="width:.875rem;height:.875rem;fill:${i<=n?'#F5A800':'#E5E7EB'}"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('');
}

function render() {
  document.getElementById('reviews-list').innerHTML = products.map(p => `
    <div class="bg-white rounded-2xl border border-[#E0D8C8] shadow-sm overflow-hidden">
      <div class="flex items-center gap-3 px-5 py-4 bg-[#FAF7F2] border-b border-[#E0D8C8]">
        <img src="${p.images?.[0]||'../assets/main.png'}" alt="${p.name}" class="w-10 h-10 object-cover rounded-lg shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-[#3E2723] truncate">${p.name}</p>
          <p class="text-xs text-[#8A7768]">${p.reviews.length} review${p.reviews.length===1?'':'s'} · avg ${p.rating||4.5}★</p>
        </div>
        <a href="../product.php?id=${p.id}" target="_blank" class="btn btn-outline text-xs px-3 py-1.5 shrink-0">View</a>
      </div>
      <div class="divide-y divide-[#F0E8DC]">
        ${p.reviews.map((r, idx) => `
          <div class="flex items-start gap-3 px-5 py-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-sm text-[#3E2723]">${r.user_name||'Anonymous'}</span>
                <span class="inline-flex items-center rounded-full bg-[#E8620A]/10 px-2 py-0.5 text-[10px] font-bold text-[#E8620A]">✓ Verified</span>
                <div class="flex gap-0.5 ml-1">${stars(r.rating||5)}</div>
              </div>
              <p class="text-sm text-[#5D4037] leading-relaxed">${r.comment||''}</p>
              ${r.created_at ? `<p class="text-xs text-[#8A7768] mt-1">${new Date(r.created_at).toLocaleDateString()}</p>` : ''}
            </div>
            <button onclick="deleteReview('${p.id}', ${idx})" class="shrink-0 text-red-400 hover:text-red-600 transition-colors p-1" title="Delete review">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

window.deleteReview = async (productId, reviewIndex) => {
  if (!confirm('Delete this review?')) return;
  try {
    const ref = doc(db, 'products', productId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const reviews = (data.reviews||[]).filter((_,i) => i !== reviewIndex);
    const rating = reviews.length
      ? Number((reviews.reduce((s,r) => s+Number(r.rating||0), 0) / reviews.length).toFixed(1))
      : Number(data.rating||4.5);
    await updateDoc(ref, { reviews, rating });
    // Update local state
    const p = products.find(x => x.id === productId);
    if (p) { p.reviews = reviews; p.rating = rating; }
    products = products.filter(p => p.reviews.length > 0);
    if (products.length === 0) {
      document.getElementById('reviews-list').classList.add('hidden');
      document.getElementById('reviews-empty').classList.remove('hidden');
    } else { render(); }
    showToast('Review deleted', 'success');
  } catch(e) { showToast('Failed to delete review', 'error'); }
};

load();
</script>
</body>
</html>
