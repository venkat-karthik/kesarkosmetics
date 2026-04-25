<?php
$pageTitle = 'Blogs — Kesar Kosmetics';
$cssPath = 'css/style.css';
$currentPage = 'blogs.php';
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-[#FAF7F2]">

  <!-- Hero -->
  <section class="relative overflow-hidden bg-gradient-to-br from-[#2D0F00] via-[#4A1A00] to-[#3E2723] text-white">
    <div class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#F5A800]/10 blur-3xl pointer-events-none"></div>
    <div class="container relative py-20 sm:py-28 text-center">
      <p class="badge badge-gold mb-6">Knowledge & Wellness</p>
      <h1 class="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
        Kesar Kosmetics <span class="text-[#F5A800]">Journal</span>
      </h1>
      <p class="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
        Insights, rituals, and stories about natural beauty, Kashmiri saffron, and the art of living well.
      </p>
    </div>
  </section>

  <!-- Blog Grid -->
  <section class="py-14 sm:py-20">
    <div class="container">
      <div id="blogs-loading" class="flex justify-center py-12"><div class="spinner"></div></div>
      <div id="blogs-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"></div>
    </div>
  </section>

  <!-- Newsletter -->
  <section class="py-20 sm:py-28 bg-gradient-to-br from-[#2D0F00] via-[#4A1A00] to-[#3E2723] text-white relative overflow-hidden">
    <div class="container relative text-center">
      <p class="text-xs font-bold uppercase tracking-[.28em] text-[#F5A800] mb-4">Stay in the Loop</p>
      <h2 class="font-heading text-3xl sm:text-4xl font-bold mb-4">Get wellness tips in your inbox</h2>
      <p class="text-white/70 text-base mb-8 leading-relaxed max-w-xl mx-auto">Subscribe for new articles, product launches, seasonal rituals, and exclusive offers.</p>
      <form id="subscribe-form" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input type="email" id="sub-email" placeholder="your@email.com" required class="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A800] transition-colors" />
        <button type="submit" id="sub-btn" class="bg-[#F5A800] hover:bg-[#E8620A] text-[#2D0F00] font-bold px-7 py-3 rounded-full transition-colors shrink-0">Subscribe</button>
      </form>
      <p class="mt-4 text-xs text-white/40">No spam, ever. Unsubscribe anytime.</p>
    </div>
  </section>

</div>

<!-- Blog Modal -->
<div id="blog-modal" class="modal-backdrop" role="dialog" aria-modal="true">
  <div class="modal" style="max-width:640px">
    <div class="modal-header sticky top-0 bg-white rounded-t-3xl z-10">
      <span id="blog-modal-category" class="text-xs font-bold px-3 py-1 rounded-full bg-[#F7F1E8] text-[#8B2C6D]"></span>
      <button id="blog-modal-close" class="p-2 hover:bg-[#F5EEE6] rounded-full transition-colors" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#3E2723]" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div id="blog-modal-emoji" class="w-full h-32 rounded-2xl bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center text-7xl mb-6"></div>
      <h2 id="blog-modal-title" class="font-heading text-2xl sm:text-3xl text-[#3E2723] mb-3 leading-snug"></h2>
      <div id="blog-modal-meta" class="flex flex-wrap items-center gap-4 text-xs text-[#8A7768] mb-6 pb-5 border-b border-[#E9E0D2]"></div>
      <div id="blog-modal-content" class="space-y-4 text-[#5D4037]"></div>
    </div>
  </div>
</div>

<?php include 'includes/footer.php'; ?>

<script type="module">
import { db, collection, getDocs, query, orderBy, addDoc, where, serverTimestamp } from './js/firebase-config.js';

const staticPosts = [
  { id: 1, title: 'Saffron Cream: A Natural Secret to Radiant, Glowing Skin', excerpt: 'For centuries, saffron — often called "red gold" — has been treasured in skincare rituals. Discover how saffron cream can transform your daily routine.', date: 'April 10, 2025', author: 'Kesar Kosmetics Team', category: 'Beauty', readTime: '7 min read', emoji: '🌸', featured: true, content: [{ type: 'p', text: 'For centuries, saffron has been treasured not only in culinary traditions but also in skincare rituals. Derived from the delicate stigmas of the Crocus sativus flower, saffron is packed with skin-loving properties that promote a healthy, luminous complexion.' }, { type: 'h3', text: 'Why Saffron for Skin?' }, { type: 'p', text: 'Saffron is rich in antioxidants such as crocin and safranal, which help protect the skin from environmental stressors. Its natural compounds support brighter, more even-toned skin.' }, { type: 'h3', text: 'Benefits' }, { type: 'list', items: ['Enhance skin radiance and glow', 'Improve uneven skin tone', 'Provide gentle hydration', 'Support a smoother, softer texture', 'Calm minor irritation and redness'] }] },
  { id: 2, title: 'The Power of A2 Ghee: Ancient Wisdom Meets Modern Health', excerpt: 'Discover how A2 ghee from desi cows provides superior nutrition and health benefits compared to regular ghee.', date: 'March 15, 2025', author: 'Kesar Kosmetics Team', category: 'Health', readTime: '5 min read', emoji: '🫙', content: [{ type: 'p', text: 'A2 ghee has been a cornerstone of Indian kitchens and Ayurvedic medicine for thousands of years. Unlike regular ghee made from hybrid cows, A2 ghee comes exclusively from indigenous desi breeds.' }, { type: 'h3', text: 'Health Benefits' }, { type: 'list', items: ['Rich in fat-soluble vitamins A, D, E, and K2', 'Contains butyric acid that supports gut health', 'High smoke point makes it ideal for high-heat cooking', 'Supports brain function and hormonal balance'] }] },
  { id: 3, title: 'Turmeric: Nature\'s Golden Healer', excerpt: 'Explore the scientifically-backed benefits of turmeric and how our pure turmeric products can enhance your wellness routine.', date: 'March 5, 2025', author: 'Kesar Kosmetics Team', category: 'Wellness', readTime: '4 min read', emoji: '🌿', content: [{ type: 'p', text: 'Turmeric has been used in Indian households for over 4,000 years — as a spice, a medicine, and a beauty ingredient. The active compound curcumin gives turmeric its vibrant golden colour.' }, { type: 'h3', text: 'Key Benefits' }, { type: 'list', items: ['Powerful anti-inflammatory properties', 'Strong antioxidant that neutralises free radicals', 'Supports joint health and mobility', 'Boosts brain function'] }] },
  { id: 4, title: 'Wood Pressed Oils: The Cold-Pressed Difference', excerpt: 'Most cooking oils are extracted using heat and chemicals. Wood pressed oils preserve nutrients, flavour, and natural goodness the traditional way.', date: 'March 25, 2025', author: 'Kesar Kosmetics Team', category: 'Cooking', readTime: '4 min read', emoji: '🫒', content: [{ type: 'p', text: 'Wood pressed oils are extracted using a traditional wooden press (ghani) that rotates slowly without generating heat. This preserves the oil\'s natural nutrients, flavour, and aroma.' }, { type: 'h3', text: 'Benefits' }, { type: 'list', items: ['Retains natural antioxidants and vitamins E & K', 'Rich, authentic flavour', 'No chemical residues or additives', 'Higher smoke point than refined oils'] }] },
];

const catColors = { Health: 'bg-emerald-100 text-emerald-700', Beauty: 'bg-pink-100 text-pink-700', Wellness: 'bg-amber-100 text-amber-700', Cooking: 'bg-yellow-100 text-yellow-700', Nutrition: 'bg-orange-100 text-orange-700' };
const catClass = (cat) => catColors[cat] || 'bg-[#F7F1E8] text-[#8B2C6D]';

async function loadBlogs() {
  let dynamicPosts = [];
  try {
    const snap = await getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')));
    dynamicPosts = snap.docs.map(d => ({
      id: 'fs-' + d.id, title: d.data().title, excerpt: d.data().excerpt || '',
      date: d.data().date || new Date().toLocaleDateString(),
      author: d.data().author || 'Kesar Kosmetics Team',
      category: d.data().category || 'Beauty', readTime: d.data().readTime || '3 min read',
      emoji: d.data().emoji || '✨',
      content: [{ type: 'p', text: d.data().content || '' }],
    }));
  } catch {}

  const allPosts = [...dynamicPosts, ...staticPosts];
  document.getElementById('blogs-loading').classList.add('hidden');
  const grid = document.getElementById('blogs-grid');
  grid.classList.remove('hidden');
  grid.innerHTML = allPosts.map(post => `
    <div class="group bg-white rounded-2xl overflow-hidden border border-[#E9E0D2] hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col" onclick="openBlog(${JSON.stringify(post).replace(/"/g,'&quot;')})">
      <div class="w-full h-36 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center text-6xl shrink-0">${post.emoji}</div>
      <div class="p-5 flex flex-col flex-1">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold px-3 py-1 rounded-full ${catClass(post.category)}">${post.category}</span>
          <span class="text-xs text-[#8A7768]">${post.readTime}</span>
        </div>
        <h3 class="font-heading text-lg text-[#3E2723] leading-snug mb-2 group-hover:text-[#D97736] transition-colors line-clamp-2">${post.title}</h3>
        <p class="text-[#6B5B52] text-sm leading-relaxed line-clamp-2 flex-1 mb-4">${post.excerpt}</p>
        <div class="flex items-center justify-between pt-4 border-t border-[#F0E7DA]">
          <span class="text-xs text-[#8A7768]">${post.date}</span>
          <span class="text-[#D97736] text-xs font-semibold flex items-center gap-1">Read more →</span>
        </div>
      </div>
    </div>
  `).join('');
}

window.openBlog = (post) => {
  document.getElementById('blog-modal-category').textContent = post.category;
  document.getElementById('blog-modal-category').className = `text-xs font-bold px-3 py-1 rounded-full ${catClass(post.category)}`;
  document.getElementById('blog-modal-emoji').textContent = post.emoji;
  document.getElementById('blog-modal-title').textContent = post.title;
  document.getElementById('blog-modal-meta').innerHTML = `<span>${post.author}</span><span>·</span><span>${post.date}</span><span>·</span><span>${post.readTime}</span>`;
  document.getElementById('blog-modal-content').innerHTML = (post.content||[]).map(block => {
    if (block.type === 'h3') return `<h3 class="font-heading text-xl font-semibold text-[#3E2723] mt-7 mb-2">${block.text}</h3>`;
    if (block.type === 'list') return `<ul class="space-y-2.5 pl-1">${(block.items||[]).map(item=>`<li class="flex items-start gap-3 text-sm leading-relaxed"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D97736] shrink-0"></span>${item}</li>`).join('')}</ul>`;
    return `<p class="text-sm sm:text-base leading-relaxed">${block.text||''}</p>`;
  }).join('');
  document.getElementById('blog-modal').classList.add('open');
};

document.getElementById('blog-modal-close').addEventListener('click', () => document.getElementById('blog-modal').classList.remove('open'));
document.getElementById('blog-modal').addEventListener('click', (e) => { if (e.target === document.getElementById('blog-modal')) document.getElementById('blog-modal').classList.remove('open'); });

// Newsletter
document.getElementById('subscribe-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('sub-email').value.trim().toLowerCase();
  const btn = document.getElementById('sub-btn');
  btn.disabled = true; btn.textContent = 'Subscribing…';
  try {
    const existing = await getDocs(query(collection(db, 'subscribers'), where('email', '==', email)));
    if (!existing.empty) { showToast("You're already subscribed!", 'success'); }
    else {
      await addDoc(collection(db, 'subscribers'), { email, subscribedAt: serverTimestamp(), source: 'blog' });
      showToast('Subscribed! Welcome to the Kesar family 🌸', 'success');
    }
    document.getElementById('sub-email').value = '';
  } catch { showToast('Could not subscribe. Please try again.', 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Subscribe'; }
});

loadBlogs();
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
