<?php
$pageTitle = 'Manage Blogs — Admin';
$cssPath = '../css/style.css';
include '../includes/head.php';
?>

<div class="flex min-h-screen bg-gray-100">
  <aside class="admin-sidebar hidden md:flex flex-col">
    <div class="px-6 py-5 border-b border-white/10"><img src="../assets/logo.jpeg" alt="Kesar Kosmetics" class="h-10 object-contain" /></div>
    <nav class="flex-1 py-4">
      <a href="dashboard.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>Dashboard</a>
      <a href="orders.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>Orders</a>
      <a href="products.php"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"/></svg>Products</a>
      <a href="blogs.php" class="active"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"/></svg>Blogs</a>
      <div class="border-t border-white/10 mt-4 pt-4">
        <button id="admin-logout-btn" class="w-full text-left"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>Logout</button>
      </div>
    </nav>
  </aside>

  <main class="admin-content flex-1">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Blogs</h1>
        <p class="text-[#8A7768] mt-1">Create and manage blog posts</p>
      </div>
      <button id="add-blog-btn" class="btn btn-primary">+ Add Blog</button>
    </div>

    <div id="blogs-loading" class="text-center py-12 text-[#8A7768]">Loading blogs…</div>
    <div id="blogs-list" class="hidden space-y-4"></div>
  </main>
</div>

<!-- Blog Modal -->
<div id="blog-modal" class="modal-backdrop" role="dialog" aria-modal="true">
  <div class="modal" style="max-width:600px">
    <div class="modal-header">
      <h2 id="blog-modal-title" class="font-heading text-xl font-bold text-[#3E2723]">Add Blog Post</h2>
      <button id="blog-modal-close" class="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <form id="blog-form" class="space-y-4">
        <input type="hidden" id="blog-id" />
        <div class="form-group"><label class="form-label">Title *</label><input type="text" id="b-title" class="form-input" required /></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Category</label><input type="text" id="b-category" class="form-input" placeholder="Beauty, Health, Wellness…" /></div>
          <div class="form-group"><label class="form-label">Emoji</label><input type="text" id="b-emoji" class="form-input" placeholder="🌸" /></div>
        </div>
        <div class="form-group"><label class="form-label">Excerpt</label><textarea id="b-excerpt" class="form-input" rows="2" placeholder="Short description…"></textarea></div>
        <div class="form-group"><label class="form-label">Content *</label><textarea id="b-content" class="form-input" rows="8" required placeholder="Full blog content…"></textarea></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Author</label><input type="text" id="b-author" class="form-input" placeholder="Kesar Kosmetics Team" /></div>
          <div class="form-group"><label class="form-label">Read Time</label><input type="text" id="b-readtime" class="form-input" placeholder="5 min read" /></div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="submit" id="blog-save-btn" class="btn btn-primary flex-1 justify-center">Save Blog</button>
          <button type="button" id="blog-cancel-btn" class="btn btn-outline flex-1 justify-center">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>

<div id="toast-container"></div>

<script type="module">
import { getCurrentUser, onUserChange, isAdmin, logout, db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from '../js/firebase-config.js';

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

let blogs = [];
let editingId = null;

async function loadBlogs() {
  try {
    const snap = await getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')));
    blogs = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
  } catch { blogs = []; }

  document.getElementById('blogs-loading').classList.add('hidden');
  const list = document.getElementById('blogs-list');
  list.classList.remove('hidden');

  if (blogs.length === 0) {
    list.innerHTML = '<div class="text-center py-12 text-[#8A7768] bg-white rounded-2xl border border-[#E0D8C8]">No blog posts yet. Click "+ Add Blog" to create one.</div>';
    return;
  }

  list.innerHTML = blogs.map(b => `
    <div class="bg-white rounded-2xl border border-[#E0D8C8] p-5 shadow-sm flex items-start gap-4">
      <div class="text-4xl shrink-0">${b.emoji||'📝'}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-heading text-lg font-bold text-[#3E2723] line-clamp-1">${b.title||'Untitled'}</h3>
        <p class="text-sm text-[#6B5B52] mt-1 line-clamp-2">${b.excerpt||''}</p>
        <div class="flex items-center gap-3 mt-2 text-xs text-[#8A7768]">
          <span class="rounded-full bg-[#F7F1E8] px-2 py-0.5 font-semibold">${b.category||'General'}</span>
          <span>${b.readTime||'3 min read'}</span>
          <span>${b.author||'Kesar Kosmetics Team'}</span>
        </div>
      </div>
      <div class="flex gap-2 shrink-0">
        <button onclick="editBlog('${b._docId}')" class="btn btn-outline text-xs px-3 py-1.5">Edit</button>
        <button onclick="deleteBlog('${b._docId}')" class="btn btn-danger text-xs px-3 py-1.5">Delete</button>
      </div>
    </div>
  `).join('');
}

const modal = document.getElementById('blog-modal');
document.getElementById('add-blog-btn').addEventListener('click', () => {
  editingId = null;
  document.getElementById('blog-modal-title').textContent = 'Add Blog Post';
  document.getElementById('blog-form').reset();
  document.getElementById('blog-id').value = '';
  modal.classList.add('open');
});
document.getElementById('blog-modal-close').addEventListener('click', () => modal.classList.remove('open'));
document.getElementById('blog-cancel-btn').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

window.editBlog = (id) => {
  const b = blogs.find(x => x._docId === id);
  if (!b) return;
  editingId = id;
  document.getElementById('blog-modal-title').textContent = 'Edit Blog Post';
  document.getElementById('blog-id').value = id;
  document.getElementById('b-title').value = b.title || '';
  document.getElementById('b-category').value = b.category || '';
  document.getElementById('b-emoji').value = b.emoji || '';
  document.getElementById('b-excerpt').value = b.excerpt || '';
  document.getElementById('b-content').value = b.content || '';
  document.getElementById('b-author').value = b.author || '';
  document.getElementById('b-readtime').value = b.readTime || '';
  modal.classList.add('open');
};

document.getElementById('blog-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('blog-save-btn');
  btn.disabled = true; btn.textContent = 'Saving…';
  const data = {
    title: document.getElementById('b-title').value.trim(),
    category: document.getElementById('b-category').value.trim() || 'General',
    emoji: document.getElementById('b-emoji').value.trim() || '✨',
    excerpt: document.getElementById('b-excerpt').value.trim(),
    content: document.getElementById('b-content').value.trim(),
    author: document.getElementById('b-author').value.trim() || 'Kesar Kosmetics Team',
    readTime: document.getElementById('b-readtime').value.trim() || '3 min read',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
  try {
    if (editingId) {
      await updateDoc(doc(db, 'blogs', editingId), data);
      showToast('Blog updated!', 'success');
    } else {
      await addDoc(collection(db, 'blogs'), { ...data, createdAt: serverTimestamp() });
      showToast('Blog created!', 'success');
    }
    modal.classList.remove('open');
    await loadBlogs();
  } catch(err) { showToast('Error: ' + err.message, 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Save Blog'; }
});

window.deleteBlog = async (id) => {
  if (!confirm('Delete this blog post?')) return;
  try {
    await deleteDoc(doc(db, 'blogs', id));
    showToast('Blog deleted', 'success');
    await loadBlogs();
  } catch(err) { showToast('Error: ' + err.message, 'error'); }
};

loadBlogs();
</script>
</body>
</html>
