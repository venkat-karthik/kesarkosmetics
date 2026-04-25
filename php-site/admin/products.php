<?php
$pageTitle = 'Manage Products — Admin';
$cssPath = '../css/style.css';
include '../includes/head.php';
?>

<div class="flex min-h-screen bg-gray-100">
  <!-- Sidebar -->
  <aside class="admin-sidebar hidden md:flex flex-col">
    <div class="px-6 py-5 border-b border-white/10">
      <img src="../assets/main.png" alt="Kesar Kosmetics" class="h-10 object-contain" />
    </div>
    <nav class="flex-1 py-4">
      <a href="dashboard.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>Dashboard</a>
      <a href="orders.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>Orders</a>
      <a href="products.php" class="active"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"/></svg>Products</a>
      <a href="blogs.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"/></svg>Blogs</a>
      <div class="border-t border-white/10 mt-4 pt-4">
        <button id="admin-logout-btn" class="w-full text-left"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>Logout</button>
      </div>
    </nav>
  </aside>

  <main class="admin-content flex-1">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Products</h1>
        <p class="text-[#8A7768] mt-1">Manage your product catalog</p>
      </div>
      <button id="add-product-btn" class="btn btn-primary">+ Add Product</button>
    </div>

    <div id="products-loading" class="text-center py-12 text-[#8A7768]">Loading products…</div>
    <div id="products-table-wrap" class="hidden bg-white rounded-2xl border border-[#E0D8C8] shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead><tr class="bg-[#FAF7F2] border-b border-[#E0D8C8] text-[#8A7768] text-xs uppercase tracking-wider">
          <th class="text-left py-3 px-4">Product</th>
          <th class="text-left py-3 px-4">Category</th>
          <th class="text-left py-3 px-4">Price</th>
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
  <div class="modal" style="max-width:600px">
    <div class="modal-header">
      <h2 id="product-modal-title" class="font-heading text-xl font-bold text-[#3E2723]">Add Product</h2>
      <button id="product-modal-close" class="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <form id="product-form" class="space-y-4">
        <input type="hidden" id="product-id" />
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group col-span-2"><label class="form-label">Product Name *</label><input type="text" id="p-name" class="form-input" required /></div>
          <div class="form-group"><label class="form-label">Price (₹) *</label><input type="number" id="p-price" class="form-input" min="0" step="0.01" required /></div>
          <div class="form-group"><label class="form-label">Compare Price (₹)</label><input type="number" id="p-compare-price" class="form-input" min="0" step="0.01" /></div>
          <div class="form-group col-span-2"><label class="form-label">Category</label><input type="text" id="p-category" class="form-input" placeholder="e.g. Saffron, Skincare" /></div>
          <div class="form-group col-span-2"><label class="form-label">Description</label><textarea id="p-description" class="form-input" rows="3"></textarea></div>
          <div class="form-group col-span-2">
            <label class="form-label">Images (upload or paste URLs)</label>
            <input type="file" id="p-images" class="form-input" accept="image/*" multiple />
            <p class="text-xs text-[#8A7768] mt-1">Select multiple images. They'll be compressed and stored.</p>
            <div id="p-images-preview" class="flex gap-2 flex-wrap mt-2"></div>
          </div>
          <div class="form-group col-span-2">
            <label class="form-label">Variants (one per line: Name|Price)</label>
            <textarea id="p-variants" class="form-input" rows="3" placeholder="50g|499&#10;100g|899&#10;200g|1599"></textarea>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="submit" id="product-save-btn" class="btn btn-primary flex-1 justify-center">Save Product</button>
          <button type="button" id="product-cancel-btn" class="btn btn-outline flex-1 justify-center">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>

<div id="toast-container"></div>

<script type="module">
import { getCurrentUser, onUserChange, isAdmin, logout } from '../js/firebase-config.js';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../js/products.js';

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

let products = [];
let editingId = null;
let pendingImages = [];

async function loadProducts() {
  products = await getAllProducts();
  document.getElementById('products-loading').classList.add('hidden');
  document.getElementById('products-table-wrap').classList.remove('hidden');
  document.getElementById('products-tbody').innerHTML = products.map(p => `
    <tr class="border-b border-[#F0E8DC] hover:bg-[#FAF7F2]">
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <img src="${p.images?.[0]||'../assets/main.png'}" alt="${p.name}" class="w-10 h-10 object-cover rounded-lg" />
          <span class="font-medium text-[#3E2723]">${p.name}</span>
        </div>
      </td>
      <td class="py-3 px-4 text-[#5D4037]">${p.category||'—'}</td>
      <td class="py-3 px-4 font-semibold text-[#3E2723]">₹${p.price}</td>
      <td class="py-3 px-4 text-[#5D4037]">${p.rating||4.5} ⭐</td>
      <td class="py-3 px-4">
        <div class="flex gap-2">
          <button onclick="editProduct('${p.id}')" class="btn btn-outline text-xs px-3 py-1.5">Edit</button>
          <button onclick="deleteProductById('${p.id}')" class="btn btn-danger text-xs px-3 py-1.5">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Modal
const modal = document.getElementById('product-modal');
document.getElementById('add-product-btn').addEventListener('click', () => {
  editingId = null; pendingImages = [];
  document.getElementById('product-modal-title').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('p-images-preview').innerHTML = '';
  modal.classList.add('open');
});
document.getElementById('product-modal-close').addEventListener('click', () => modal.classList.remove('open'));
document.getElementById('product-cancel-btn').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

window.editProduct = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  editingId = id; pendingImages = [...(p.images||[])];
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('product-id').value = id;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-compare-price').value = p.compare_at_price || '';
  document.getElementById('p-category').value = p.category || '';
  document.getElementById('p-description').value = p.description || '';
  document.getElementById('p-variants').value = (p.variants||[]).map(v=>`${v.name}|${v.price||p.price}`).join('\n');
  document.getElementById('p-images-preview').innerHTML = pendingImages.map((img,i) => `<div class="relative"><img src="${img}" class="w-16 h-16 object-cover rounded-lg" /><button type="button" onclick="removeImg(${i})" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button></div>`).join('');
  modal.classList.add('open');
};

window.removeImg = (idx) => {
  pendingImages.splice(idx, 1);
  document.getElementById('p-images-preview').innerHTML = pendingImages.map((img,i) => `<div class="relative"><img src="${img}" class="w-16 h-16 object-cover rounded-lg" /><button type="button" onclick="removeImg(${i})" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button></div>`).join('');
};

// Image file handling
document.getElementById('p-images').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const dataUrl = await compressImage(file);
    pendingImages.push(dataUrl);
  }
  document.getElementById('p-images-preview').innerHTML = pendingImages.map((img,i) => `<div class="relative"><img src="${img}" class="w-16 h-16 object-cover rounded-lg" /><button type="button" onclick="removeImg(${i})" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button></div>`).join('');
});

function compressImage(file, maxW=1200, maxH=1200, quality=0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let {width, height} = img;
      if (width > maxW || height > maxH) { const r = Math.min(maxW/width, maxH/height); width = Math.round(width*r); height = Math.round(height*r); }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('product-save-btn');
  btn.disabled = true; btn.textContent = 'Saving…';

  const variantLines = document.getElementById('p-variants').value.trim().split('\n').filter(Boolean);
  const variants = variantLines.map(line => {
    const [name, price] = line.split('|');
    return { name: name?.trim(), price: parseFloat(price) || parseFloat(document.getElementById('p-price').value) };
  });

  const data = {
    name: document.getElementById('p-name').value.trim(),
    price: parseFloat(document.getElementById('p-price').value),
    compare_at_price: parseFloat(document.getElementById('p-compare-price').value) || null,
    category: document.getElementById('p-category').value.trim(),
    description: document.getElementById('p-description').value.trim(),
    images: pendingImages,
    variants: variants.length > 0 ? variants : [{ name: 'Default', price: parseFloat(document.getElementById('p-price').value) }],
  };

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
    showToast('Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Save Product';
  }
});

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
