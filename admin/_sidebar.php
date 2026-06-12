<?php
// Shared admin sidebar — include at top of every admin page
// Set $adminPage = 'dashboard' | 'orders' | 'products' | 'blogs' | 'users' | 'revenue' | 'subscribers' | 'reviews' | 'database'
$adminPage = $adminPage ?? '';
$nav = [
  ['dashboard',   'dashboard.php',   'Dashboard',   '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/>'],
  ['orders',      'orders.php',      'Orders',      '<path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>'],
  ['revenue',     'revenue.php',     'Revenue',     '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/>'],
  ['products',    'products.php',    'Products',    '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"/>'],
  ['reviews',     'reviews.php',     'Reviews',     '<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>'],
  ['blogs',       'blogs.php',       'Blogs',       '<path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"/>'],
  ['users',       'users.php',       'Users',       '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>'],
  ['subscribers', 'subscribers.php', 'Subscribers', '<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>'],
  ['database',    'database.php',    '🗄 Database',  '<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/>'],
];
?>
<aside class="admin-sidebar hidden md:flex flex-col">
  <div class="px-4 py-4 border-b border-white/10">
    <div class="flex items-center justify-center">
      <img src="../assets/main.png" alt="Kesar Kosmetics"
        class="h-12 w-12 object-cover rounded-2xl"
        style="background:rgba(245,168,0,0.18);padding:4px;" />
    </div>
  </div>
  <nav class="flex-1 py-4">
    <?php foreach ($nav as [$id, $href, $label, $path]): ?>
    <a href="<?= $href ?>" class="<?= $adminPage === $id ? 'active' : '' ?>">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><?= $path ?></svg>
      <?= $label ?>
    </a>
    <?php endforeach; ?>
  </nav>
  <!-- Logout at bottom -->
  <div class="px-3 pb-5">
    <button id="admin-logout-btn"
      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
             bg-gradient-to-r from-[#E8620A] to-[#F5A800] text-white
             hover:from-[#C8380A] hover:to-[#E8620A] hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>
      Logout
    </button>
  </div>
</aside>

<!-- Mobile top bar for admin -->
<div class="md:hidden fixed top-0 inset-x-0 z-50 bg-[#3E2723] text-white flex items-center justify-between px-4 py-3 shadow-lg">
  <img src="../assets/main.png" alt="Kesar"
    class="h-9 w-9 object-cover rounded-xl"
    style="background:rgba(245,168,0,0.18);padding:3px;" />
  <div class="flex items-center gap-2">
    <span class="text-sm font-semibold"><?= ucfirst($adminPage ?: 'Admin') ?></span>
    <button id="admin-mobile-menu-btn" class="p-1.5 rounded-lg bg-white/10">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
    </button>
  </div>
</div>

<!-- Mobile nav drawer -->
<div id="admin-mobile-menu" class="md:hidden fixed inset-0 z-40 hidden">
  <div class="absolute inset-0 bg-black/50" id="admin-mobile-overlay"></div>
  <div class="absolute top-0 left-0 bottom-0 w-64 bg-[#3E2723] flex flex-col py-4 overflow-y-auto">
    <div class="px-5 pb-4 border-b border-white/10 mb-2 flex items-center gap-3">
      <img src="../assets/main.png" alt="Kesar Kosmetics"
        class="h-10 w-10 object-cover rounded-xl"
        style="background:rgba(245,168,0,0.18);padding:3px;" />
      <span class="text-white font-semibold text-sm">Kesar Admin</span>
    </div>
    <?php foreach ($nav as [$id, $href, $label, $path]): ?>
    <a href="<?= $href ?>" class="flex items-center gap-3 px-5 py-3 text-sm font-medium <?= $adminPage===$id ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white' ?> transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><?= $path ?></svg>
      <?= $label ?>
    </a>
    <?php endforeach; ?>
    <div class="mt-auto px-4 pb-4 pt-4 border-t border-white/10">
      <button id="admin-mobile-logout-btn"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
               bg-gradient-to-r from-[#E8620A] to-[#F5A800] text-white
               hover:from-[#C8380A] hover:to-[#E8620A] active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>
        Logout
      </button>
    </div>
  </div>
</div>

<script>
// Sidebar logout and mobile menu are handled by admin-common.js
// This script is intentionally empty — kept for structure.
</script>
