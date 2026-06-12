<?php
$pageTitle = 'Blogs — Admin';
$cssPath = '../css/style.css';
$adminPage = 'blogs';
include 'head.php';
?>
<div class="flex min-h-screen bg-gray-100">
  <?php include '_sidebar.php'; ?>
  <main class="admin-content flex-1 pt-14 md:pt-0">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-heading text-3xl font-bold text-[#3E2723]">Blogs</h1>
        <p class="text-[#8A7768] mt-1" id="blogs-subtitle">Loading…</p>
      </div>
      <button id="add-blog-btn" class="btn btn-primary">+ Add Blog</button>
    </div>

    <div id="blogs-loading" class="text-center py-12 text-[#8A7768]">Loading blogs…</div>
    <div id="blogs-list" class="hidden space-y-4"></div>
  </main>
</div>

<!-- Blog Modal -->
<div id="blog-modal" class="modal-backdrop" role="dialog" aria-modal="true">
  <div class="modal" style="max-width:600px;max-height:92vh;overflow-y:auto">
    <div class="modal-header sticky top-0 bg-white z-10">
      <h2 id="blog-modal-title" class="font-heading text-xl font-bold text-[#3E2723]">Add Blog Post</h2>
      <button id="blog-modal-close" class="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <form id="blog-form" class="space-y-4">
        <input type="hidden" id="blog-id" />
        <div class="form-group"><label class="form-label">Title *</label><input type="text" id="b-title" class="form-input" required placeholder="Blog post title…" /></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group"><label class="form-label">Category</label><input type="text" id="b-category" class="form-input" placeholder="Beauty, Health, Wellness…" /></div>
          <div class="form-group"><label class="form-label">Emoji</label><input type="text" id="b-emoji" class="form-input" placeholder="🌸" /></div>
        </div>
        <div class="form-group"><label class="form-label">Excerpt <span class="text-[#8A7768] font-normal text-xs">— short summary shown on blog listing</span></label><textarea id="b-excerpt" class="form-input" rows="2" placeholder="Short description…"></textarea></div>
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

<script type="module">
import { db, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from '../js/firebase-config.js';
import '../js/admin-common.js';

let blogs = [];
let editingId = null;

async function loadBlogs() {
  try {
    const snap = await getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')));
    blogs = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
  } catch {
    // orderBy may fail without index — fallback without ordering
    try {
      const snap = await getDocs(collection(db, 'blogs'));
      blogs = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
    } catch(e) {
      showToast('Failed to load blogs: ' + e.message, 'error');
      blogs = [];
    }
  }

  document.getElementById('blogs-loading').classList.add('hidden');
  document.getElementById('blogs-subtitle').textContent = blogs.length + ' post' + (blogs.length===1?'':'s');
  const list = document.getElementById('blogs-list');
  list.classList.remove('hidden');

  if (blogs.length === 0) {
    list.innerHTML = '<div class="text-center py-12 text-[#8A7768] bg-white rounded-2xl border border-[#E0D8C8]">No blog posts yet. Click "+ Add Blog" to create one.</div>';
    return;
  }

  list.innerHTML = blogs.map(b => {
    const esc = (s) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    return `
    <div class="bg-white rounded-2xl border border-[#E0D8C8] p-5 shadow-sm flex items-start gap-4">
      <div class="text-4xl shrink-0">${esc(b.emoji||'📝')}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-heading text-lg font-bold text-[#3E2723] line-clamp-1">${esc(b.title||'Untitled')}</h3>
        <p class="text-sm text-[#6B5B52] mt-1 line-clamp-2">${esc(b.excerpt||(b.content?.substring(0,100)||''))}</p>
        <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#8A7768]">
          <span class="rounded-full bg-[#F7F1E8] px-2 py-0.5 font-semibold">${esc(b.category||'General')}</span>
          <span>${esc(b.readTime||'3 min read')}</span>
          <span>${esc(b.author||'Kesar Kosmetics Team')}</span>
          ${b.date ? `<span>${esc(b.date)}</span>` : ''}
        </div>
      </div>
      <div class="flex gap-2 shrink-0">
        <button onclick="editBlog('${esc(b._docId)}')" class="btn btn-outline text-xs px-3 py-1.5">Edit</button>
        <button onclick="deleteBlog('${esc(b._docId)}')" class="btn btn-danger text-xs px-3 py-1.5">Delete</button>
      </div>
    </div>
  `}).join('');
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
  btn.disabled = true;
  btn.innerHTML = '<svg class="animate-spin w-4 h-4 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Saving…';

  const content = document.getElementById('b-content').value.trim();
  const data = {
    title:    document.getElementById('b-title').value.trim(),
    category: document.getElementById('b-category').value.trim() || 'General',
    emoji:    document.getElementById('b-emoji').value.trim() || '✨',
    excerpt:  document.getElementById('b-excerpt').value.trim(),
    content,
    author:   document.getElementById('b-author').value.trim() || 'Kesar Kosmetics Team',
    readTime: document.getElementById('b-readtime').value.trim() || Math.max(1, Math.ceil(content.split(' ').length / 200)) + ' min read',
    date:     new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }),
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, 'blogs', editingId), data);
      showToast('Blog updated!', 'success');
    } else {
      await addDoc(collection(db, 'blogs'), { ...data, createdAt: serverTimestamp() });
      showToast('Blog published!', 'success');
    }
    modal.classList.remove('open');
    await loadBlogs();
  } catch(err) {
    showToast('Error: ' + (err.message || 'Unknown error'), 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Save Blog';
  }
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
