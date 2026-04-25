<?php
$pageTitle = 'Products — Admin';
$cssPath = '../css/style.css';
$adminPage = 'products';
include 'head.php';
?>
<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1 pt-14 md:pt-0">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Products</h1>
        <p class="text-[#8A7768] mt-1" id="products-subtitle">Loading…</p>
      </div>
      <button id="add-product-btn" class="btn btn-primary">+ Add Product</button>
    </div>

    <div id="products-loading" class="text-center py-12 text-[#8A7768]">Loading products…</div>
    <div id="products-empty" class="hidden text-center py-16 bg-white rounded-2xl border border-[#E0D8C8]">
      <div class="text-5xl mb-3">📦</div>
      <p class="text-[#5D4037] font-medium">No products yet. Click "+ Add Product" to get started.</p>
    </div>
    <div id="products-table-wrap" class="hidden bg-white rounded-2xl border border-[#E0D8C8] shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="bg-[#FAF7F2] border-b border-[#E0D8C8] text-[#8A7768] text-xs uppercase tracking-wider">
          <th class="text-left py-3 px-4">Product</th>
          <th class="text-left py-3 px-4">Category</th>
          <th class="text-left py-3 px-4">Price</th>
          <th class="text-left py-3 px-4">Media</th>
          <th class="text-left py-3 px-4">Rating</th>
          <th class="text-left py-3 px-4">Actions</th>
        </tr></thead>
        <tbody id="products-tbody"></tbody>
      </table>
    </div>
  </main>
</div>

<!-- Add/Edit Product Modal -->
<div id="product-modal" class="modal-backdrop" role="dialog" aria-modal="true">
  <div class="modal" style="max-width:640px;max-height:92vh;overflow-y:auto">
    <div class="modal-header sticky top-0 bg-white z-10">
      <h2 id="product-modal-title" class="font-heading text-xl font-bold text-[#3E2723]">Add Product</h2>
      <button id="product-modal-close" class="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <form id="product-form" class="space-y-4">
        <input type="hidden" id="product-id" />

        <!-- Name -->
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input type="text" id="p-name" class="form-input" required placeholder="e.g. Kashmiri Saffron Cream" />
        </div>

        <!-- Price row -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Price (₹) *</label>
            <input type="number" id="p-price" class="form-input" min="0" step="0.01" required placeholder="999" />
          </div>
          <div class="form-group">
            <label class="form-label">Compare Price (₹) <span class="text-[#8A7768] font-normal text-xs">— crossed-off MRP</span></label>
            <input type="number" id="p-compare-price" class="form-input" min="0" step="0.01" placeholder="1499" />
          </div>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="p-category" class="form-input">
            <option value="">Select category</option>
            <?php foreach (['Skin Care','Serums','Moisturizers','Cleansers','Night Care','Toners','Masks','Ghee','Oils','Flours','Jaggery','Coffee','Turmeric','Peanut Butter','Gift Hampers','General'] as $c): ?>
            <option value="<?= $c ?>"><?= $c ?></option>
            <?php endforeach; ?>
          </select>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="p-description" class="form-input" rows="3" placeholder="Describe the product…"></textarea>
        </div>

        <!-- Images -->
        <div class="form-group">
          <label class="form-label">Product Images</label>
          <input type="file" id="p-images" class="form-input cursor-pointer" accept="image/*" multiple />
          <p class="text-xs text-[#8A7768] mt-1">Images are compressed to 800×800px automatically. Keep to 5–6 images max for best results.</p>
          <div id="p-images-preview" class="flex gap-2 flex-wrap mt-2 min-h-[4rem] p-2 rounded-xl border-2 border-dashed border-[#E0D8C8] transition-colors" id="p-images-preview"></div>
          <p class="text-xs text-[#8A7768] mt-1">Drag images to reorder · first image is the cover</p>
        </div>

        <!-- YouTube Video -->
        <div class="form-group">
          <label class="form-label">Product Video <span class="text-[#8A7768] font-normal text-xs">— YouTube URL (optional)</span></label>
          <input type="url" id="p-video" class="form-input" placeholder="https://www.youtube.com/watch?v=..." />
          <p class="text-xs text-[#8A7768] mt-1">Paste a YouTube link. It will appear after the main image in the product gallery.</p>
          <div id="p-video-preview" class="mt-2 hidden">
            <div class="relative w-full rounded-xl overflow-hidden bg-black" style="padding-top:56.25%">
              <iframe id="p-video-iframe" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe>
            </div>
            <button type="button" id="p-video-clear" class="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold">✕ Remove video</button>
          </div>
        </div>

        <!-- Variants -->
        <div class="form-group">
          <label class="form-label">Variants <span class="text-[#8A7768] font-normal text-xs">— one per line: Name|Price</span></label>
          <textarea id="p-variants" class="form-input" rows="3" placeholder="50g|499&#10;100g|899&#10;200g|1599"></textarea>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="submit" id="product-save-btn" class="btn btn-primary flex-1 justify-center">Save Product</button>
          <button type="button" id="product-cancel-btn" class="btn btn-outline flex-1 justify-center">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script type="module">
import { db, collection, getDocs, doc, deleteDoc } from '../js/firebase-config.js';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../js/products.js';
import '../js/admin-common.js';

let products = [];
let editingId = null;
let pendingImages = []; // array of data-URL strings or existing https:// URLs
let pendingVideo = '';  // YouTube URL string

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadProducts() {
  try {
    products = await getAllProducts();
  } catch(e) {
    showToast('Failed to load products: ' + e.message, 'error');
    products = [];
  }
  document.getElementById('products-loading').classList.add('hidden');
  document.getElementById('products-subtitle').textContent = products.length + ' product' + (products.length===1?'':'s');

  if (products.length === 0) {
    document.getElementById('products-empty').classList.remove('hidden');
    document.getElementById('products-table-wrap').classList.add('hidden');
    return;
  }
  document.getElementById('products-empty').classList.add('hidden');
  document.getElementById('products-table-wrap').classList.remove('hidden');

  document.getElementById('products-tbody').innerHTML = products.map(p => `
    <tr class="border-b border-[#F0E8DC] hover:bg-[#FAF7F2]">
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <img src="${p.images?.[0]||'../assets/main.png'}" alt="${p.name}" class="w-12 h-12 object-cover rounded-xl shrink-0" />
          <div>
            <p class="font-semibold text-[#3E2723] line-clamp-1">${p.name}</p>
            <p class="text-xs text-[#8A7768] line-clamp-1">${p.description?.substring(0,50)||''}</p>
          </div>
        </div>
      </td>
      <td class="py-3 px-4 text-[#5D4037]">${p.category||'—'}</td>
      <td class="py-3 px-4">
        <p class="font-semibold text-[#3E2723]">₹${Number(p.price).toLocaleString('en-IN')}</p>
        ${p.compare_at_price ? `<p class="text-xs text-[#8A7768] line-through">₹${Number(p.compare_at_price).toLocaleString('en-IN')}</p>` : ''}
      </td>
      <td class="py-3 px-4 text-xs text-[#5D4037]">
        ${p.images?.length||0} img${p.video?` · 🎬`:''}
      </td>
      <td class="py-3 px-4 text-[#5D4037]">${p.rating||4.5} ⭐ <span class="text-xs">(${p.reviews?.length||0})</span></td>
      <td class="py-3 px-4">
        <div class="flex gap-2">
          <button onclick="editProduct('${p.id}')" class="btn btn-outline text-xs px-3 py-1.5">Edit</button>
          <button onclick="deleteProductById('${p.id}')" class="btn btn-danger text-xs px-3 py-1.5">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Image helpers ─────────────────────────────────────────────────────────────
let dragSrcIdx = null;

function renderImagePreview() {
  const wrap = document.getElementById('p-images-preview');
  if (pendingImages.length === 0) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = pendingImages.map((img, i) => `
    <div class="relative group cursor-grab active:cursor-grabbing select-none"
         draggable="true"
         data-idx="${i}"
         style="touch-action:none">
      <img src="${img}"
        class="w-16 h-16 object-cover rounded-xl border-2 transition-all ${i===0?'border-[#D97736]':'border-[#E0D8C8] hover:border-[#D97736]/50'}"
        draggable="false" />
      ${i===0?'<span class="absolute -top-1 -left-1 bg-[#D97736] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold pointer-events-none">Cover</span>':''}
      <button type="button" onclick="removeImg(${i})"
        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">×</button>
      <!-- drag handle hint -->
      <div class="absolute bottom-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5"/></svg>
      </div>
    </div>
  `).join('');

  // Attach drag events
  wrap.querySelectorAll('[draggable]').forEach(el => {
    el.addEventListener('dragstart', e => {
      dragSrcIdx = parseInt(el.dataset.idx);
      e.dataTransfer.effectAllowed = 'move';
      el.style.opacity = '0.4';
    });
    el.addEventListener('dragend', () => { el.style.opacity = ''; });
    el.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    el.addEventListener('dragenter', e => { e.preventDefault(); el.style.outline = '2px solid #D97736'; el.style.borderRadius = '0.75rem'; });
    el.addEventListener('dragleave', () => { el.style.outline = ''; });
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.style.outline = '';
      const toIdx = parseInt(el.dataset.idx);
      if (dragSrcIdx === null || dragSrcIdx === toIdx) return;
      const moved = pendingImages.splice(dragSrcIdx, 1)[0];
      pendingImages.splice(toIdx, 0, moved);
      dragSrcIdx = null;
      renderImagePreview();
    });
  });
}

window.removeImg = (idx) => {
  pendingImages.splice(idx, 1);
  renderImagePreview();
};

function compressImage(file, maxW=800, maxH=800, quality=0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let {width, height} = img;
      if (width > maxW || height > maxH) {
        const r = Math.min(maxW/width, maxH/height);
        width = Math.round(width*r);
        height = Math.round(height*r);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      // If still too large (>150KB base64 ≈ ~112KB binary), compress harder
      if (dataUrl.length > 150_000) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.45);
      }
      resolve(dataUrl);
    };
    img.onerror = reject;
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('p-images').addEventListener('change', async (e) => {
  const btn = document.getElementById('product-save-btn');
  btn.disabled = true; btn.textContent = 'Processing images…';
  const files = Array.from(e.target.files);
  for (const file of files) {
    const dataUrl = await compressImage(file);
    pendingImages.push(dataUrl);
  }
  renderImagePreview();
  btn.disabled = false; btn.textContent = 'Save Product';
  e.target.value = ''; // reset so same file can be re-selected
});

// ── Video helpers ─────────────────────────────────────────────────────────────
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  // Handle youtu.be/ID and youtube.com/watch?v=ID and youtube.com/embed/ID
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function renderVideoPreview(url) {
  const embedUrl = getYouTubeEmbedUrl(url);
  const preview = document.getElementById('p-video-preview');
  const iframe = document.getElementById('p-video-iframe');
  if (embedUrl) {
    iframe.src = embedUrl;
    preview.classList.remove('hidden');
    pendingVideo = url;
  } else {
    iframe.src = '';
    preview.classList.add('hidden');
    pendingVideo = '';
  }
}

document.getElementById('p-video').addEventListener('input', (e) => {
  renderVideoPreview(e.target.value.trim());
});

document.getElementById('p-video-clear').addEventListener('click', () => {
  document.getElementById('p-video').value = '';
  document.getElementById('p-video-iframe').src = '';
  document.getElementById('p-video-preview').classList.add('hidden');
  pendingVideo = '';
});

// ── Modal ─────────────────────────────────────────────────────────────────────
const modal = document.getElementById('product-modal');

function openModal(title) {
  document.getElementById('product-modal-title').textContent = title;
  modal.classList.add('open');
  modal.scrollTop = 0;
}

document.getElementById('add-product-btn').addEventListener('click', () => {
  editingId = null; pendingImages = []; pendingVideo = '';
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('p-images-preview').innerHTML = '';
  document.getElementById('p-video-preview').classList.add('hidden');
  document.getElementById('p-video-iframe').src = '';
  openModal('Add Product');
});

document.getElementById('product-modal-close').addEventListener('click', () => modal.classList.remove('open'));
document.getElementById('product-cancel-btn').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

window.editProduct = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  pendingImages = [...(p.images||[])];
  pendingVideo = p.video || '';

  document.getElementById('product-id').value = id;
  document.getElementById('p-name').value = p.name || '';
  document.getElementById('p-price').value = p.price || '';
  document.getElementById('p-compare-price').value = p.compare_at_price || '';
  document.getElementById('p-category').value = p.category || '';
  document.getElementById('p-description').value = p.description || '';
  document.getElementById('p-variants').value = (p.variants||[]).filter(v=>v.name!=='Default').map(v=>`${v.name}|${v.price||p.price}`).join('\n');
  document.getElementById('p-video').value = pendingVideo;

  renderImagePreview();
  renderVideoPreview(pendingVideo);
  openModal('Edit Product');
};

// ── Save ──────────────────────────────────────────────────────────────────────
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('product-save-btn');
  btn.disabled = true;
  btn.innerHTML = '<svg class="animate-spin w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Saving…';

  const variantLines = document.getElementById('p-variants').value.trim().split('\n').filter(Boolean);
  const variants = variantLines.map(line => {
    const [name, price] = line.split('|');
    return { name: (name||'').trim(), price: parseFloat(price) || parseFloat(document.getElementById('p-price').value) };
  });

  const data = {
    name: document.getElementById('p-name').value.trim(),
    price: parseFloat(document.getElementById('p-price').value),
    compare_at_price: parseFloat(document.getElementById('p-compare-price').value) || null,
    category: document.getElementById('p-category').value,
    description: document.getElementById('p-description').value.trim(),
    images: pendingImages,
    video: pendingVideo || null,
    variants: variants.length > 0 ? variants : [{ name: 'Default', price: parseFloat(document.getElementById('p-price').value) }],
  };

  if (!data.name) { showToast('Product name is required', 'error'); btn.disabled=false; btn.textContent='Save Product'; return; }
  if (!data.price || data.price <= 0) { showToast('Valid price is required', 'error'); btn.disabled=false; btn.textContent='Save Product'; return; }

  // Guard: estimate total document size
  const totalImgBytes = data.images.reduce((sum, img) => sum + (img?.length || 0), 0);
  const MAX_BYTES = 900_000;
  if (totalImgBytes > MAX_BYTES) {
    const count = data.images.length;
    showToast(
      `Too many or too large images (${count} photos). Please remove a photo or two and try again.`,
      'error',
      6000
    );
    btn.disabled = false; btn.textContent = 'Save Product';
    return;
  }

  try {
    if (editingId) {
      await updateProduct(editingId, data);
      showToast('Product updated!', 'success');
    } else {
      await createProduct(data);
      showToast('Product created!', 'success');
    }
    modal.classList.remove('open');
    await loadProducts();
  } catch(err) {
    const msg = err?.message || '';
    if (msg.includes('exceeds the maximum') || msg.includes('1,048,576') || msg.includes('size')) {
      showToast('Too many photos — please remove one or two images and try again.', 'error', 6000);
    } else {
      showToast('Could not save product. Please try again.', 'error');
    }
  } finally {
    btn.disabled = false; btn.textContent = 'Save Product';
  }
});

// ── Delete ────────────────────────────────────────────────────────────────────
window.deleteProductById = async (id) => {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await deleteProduct(id);
    showToast('Product deleted', 'success');
    await loadProducts();
  } catch(err) { showToast('Error: ' + err.message, 'error'); }
};

loadProducts();
</script>
</body>
</html>
