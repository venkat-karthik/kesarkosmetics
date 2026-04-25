<?php
// Shared site header — navigation, cart icon, search, user menu
$currentPage = $currentPage ?? '';
$navLinks = [
  ['href' => 'index.php',      'label' => 'Home'],
  ['href' => 'products.php',   'label' => 'Products'],
  ['href' => 'track-order.php','label' => 'Track Order'],
  ['href' => 'about.php',      'label' => 'About Us'],
  ['href' => 'blogs.php',      'label' => 'Blogs'],
  ['href' => 'contact.php',    'label' => 'Contact'],
];
?>

<!-- ── Promo Banner ──────────────────────────────────────────────────────── -->
<div id="promo-banner">
  <div class="marquee-track" id="marquee-track">
    <?php
    $tags = [
      "🌸 Hand-harvested Kashmiri Saffron","✦ 100% Natural Ingredients","🌿 Cruelty-Free & Vegan",
      "✦ Each strand picked at dawn","🏔️ Grown at 2,200m altitude in Pampore, Kashmir",
      "✦ Rich in Crocin & Safranal antioxidants","🌙 Saffron takes 75,000 flowers for 1 pound",
      "✦ GMP Certified Manufacturing","🌸 Brightens skin in 2–4 weeks",
      "✦ Free shipping above ₹2,000","🌿 No Parabens · No Sulfates · No Synthetics",
      "✦ Dermatologist Tested","🏆 Premium Kashmiri Kesar — Red Gold of India",
    ];
    $doubled = array_merge($tags, $tags);
    foreach ($doubled as $tag):
    ?>
    <span><?= htmlspecialchars($tag) ?> <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <?php endforeach; ?>
  </div>
</div>

<!-- ── Header ────────────────────────────────────────────────────────────── -->
<header id="site-header">
  <div class="container">
    <div class="header-inner">

      <!-- Logo + mobile menu btn -->
      <div class="flex items-center gap-2 shrink-0">
        <button id="menu-btn" class="icon-btn md:hidden" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
        </button>
        <a href="index.php" class="header-logo">
          <img src="assets/main.png" alt="Kesar Kosmetics" width="48" height="48" style="height:2.5rem;width:auto;object-fit:contain;display:block;" />
        </a>
      </div>

      <!-- Desktop nav -->
      <nav class="header-nav">
        <?php foreach ($navLinks as $link): ?>
        <a href="<?= $link['href'] ?>" class="<?= $currentPage === $link['href'] ? 'active' : '' ?>">
          <?= $link['label'] ?>
        </a>
        <?php endforeach; ?>
      </nav>

      <!-- Icons -->
      <div class="header-icons">
        <!-- Search -->
        <button id="search-btn" class="icon-btn" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
        </button>

        <!-- Cart -->
        <button id="cart-btn" class="icon-btn" aria-label="Cart">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/></svg>
          <span id="cart-count-badge" class="icon-badge hidden">0</span>
        </button>

        <!-- Wishlist -->
        <a href="wishlist.php" id="wishlist-target-icon" class="icon-btn" aria-label="Wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
          <span id="wishlist-count-badge" class="icon-badge hidden">0</span>
        </a>

        <!-- User menu -->
        <div id="user-menu-wrap" class="relative">
          <!-- Shown when logged out -->
          <a href="login.php" id="login-link" class="hidden sm:block ml-2">
            <span class="btn btn-primary text-sm">Login</span>
          </a>
          <!-- Shown when logged in -->
          <button id="user-btn" class="icon-btn hidden" aria-label="Account">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
          </button>
          <div id="user-dropdown" class="hidden absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-[#F0E8DC] py-2 z-50">
            <div class="px-4 py-3 border-b border-[#F5EEE6]">
              <p id="user-name-dd" class="text-sm font-semibold text-[#3E2723] truncate"></p>
              <p id="user-email-dd" class="text-xs text-[#8A7768] truncate mt-0.5"></p>
            </div>
            <button id="logout-btn" class="w-full px-4 py-2.5 text-left text-sm text-[#5D4037] hover:bg-[#FFF3E0] flex items-center gap-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/></svg>
              Logout
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</header>

<!-- ── Mobile Menu ────────────────────────────────────────────────────────── -->
<div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
  <div id="mobile-menu-panel">
    <div class="flex items-center justify-between mb-6">
      <img src="assets/main.png" alt="Kesar Kosmetics" width="40" height="40" style="height:2.5rem;width:auto;object-fit:contain;display:block;" />
      <button id="menu-close-btn" class="p-2 rounded-full hover:bg-gray-100" aria-label="Close menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <?php foreach ($navLinks as $link): ?>
    <a href="<?= $link['href'] ?>"><?= $link['label'] ?></a>
    <?php endforeach; ?>
    <a href="wishlist.php" class="mt-2">Wishlist</a>
    <a href="cart.php" class="mt-2">Cart</a>
    <div id="mobile-auth-links" class="mt-4">
      <a href="login.php" id="mobile-login-link" class="btn btn-primary w-full justify-center">Login</a>
      <button id="mobile-logout-btn" class="hidden btn btn-outline w-full justify-center mt-2">Logout</button>
    </div>
  </div>
</div>

<!-- ── Cart Drawer ────────────────────────────────────────────────────────── -->
<div id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
  <div id="cart-drawer-panel">
    <div class="cart-drawer-header">
      <h2 class="font-heading text-xl font-bold text-[#3E2723]">Your Cart</h2>
      <button id="cart-close-btn" class="p-2 rounded-full hover:bg-gray-100" aria-label="Close cart">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="cart-drawer-body" id="cart-drawer-items">
      <p class="text-center text-[#8A7768] py-8">Your cart is empty.</p>
    </div>
    <div class="cart-drawer-footer">
      <div class="flex justify-between mb-3 text-sm font-semibold text-[#3E2723]">
        <span>Total</span>
        <span id="cart-drawer-total">₹0</span>
      </div>
      <a href="cart.php" class="btn btn-primary w-full justify-center mb-2">View Cart</a>
      <a href="checkout.php" class="btn btn-dark w-full justify-center">Checkout</a>
    </div>
  </div>
</div>

<!-- ── Search Overlay ─────────────────────────────────────────────────────── -->
<div id="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
  <div id="search-box">
    <div class="flex gap-2 mb-3">
      <input id="search-input" type="text" placeholder="Search products…" class="form-input" autocomplete="off" />
      <button id="search-close-btn" class="p-2 rounded-xl hover:bg-gray-100 shrink-0" aria-label="Close search">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div id="search-results"></div>
  </div>
</div>
