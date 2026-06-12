#!/usr/bin/env python3
"""
Convert PHP pages → static HTML files for Vercel deployment.
Strategy:
  1. Read each .php file in php-site/
  2. Inline the PHP includes (head.php, header.php, footer.php, scripts.php)
  3. Strip PHP tags / expand PHP-rendered HTML
  4. Replace all .php links with .html links
  5. Write output to php-site/ as .html files
"""

import re, os, sys

PHP_DIR = os.path.join(os.path.dirname(__file__), 'php-site')

# ──────────────────────────────────────────────────────────────────────────────
# Pre-rendered HTML for the shared includes
# (We read the actual files and strip PHP to produce static HTML)
# ──────────────────────────────────────────────────────────────────────────────

HEAD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#3E2723" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <title>__PAGE_TITLE__</title>
  <meta name="description" content="__PAGE_DESC__" />

  <!-- Favicon -->
  <link rel="icon"             type="image/png" sizes="32x32"   href="/assets/favicon.png" />
  <link rel="apple-touch-icon"                  sizes="180x180" href="/assets/favicon.png" />
  <link rel="shortcut icon"    type="image/png"                 href="/assets/favicon.png" />

  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://cdn.tailwindcss.com" />
  <link rel="preconnect" href="https://firestore.googleapis.com" />
  <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
  <link rel="preconnect" href="https://www.googletagmanager.com" />

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" /></noscript>

  <!-- Custom CSS -->
  <link rel="stylesheet" href="css/style.css" />

  <!-- Tailwind CDN -->
  <script>
    window._tailwindConfig = {
      theme: {
        extend: {
          fontFamily: { heading: ['"Playfair Display"', 'serif'] },
          colors: {
            brand: '#D97736',
            'brand-dark': '#C96626',
            'brand-orange': '#E8620A',
            'brand-gold': '#F5A800',
          }
        }
      }
    };
  </script>
  <script src="https://cdn.tailwindcss.com" onload="if(window.tailwind&&window._tailwindConfig)tailwind.config=window._tailwindConfig;"></script>
  __RAZORPAY__
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-BWJJHYGDQ3"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-BWJJHYGDQ3');</script>
</head>
<body class="bg-[#FFF8EC] text-[#3E2723]">

<div id="toast-container"></div>
<div id="falling-particles" aria-hidden="true"></div>
"""

HEADER_HTML = """<!-- ── Promo Banner ──────────────────────────────────────────────────────── -->
<div id="promo-banner">
  <div class="marquee-track" id="marquee-track">
    <span>🌸 Hand-harvested Kashmiri Saffron <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ 100% Natural Ingredients <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌿 Cruelty-Free &amp; Vegan <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ Each strand picked at dawn <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🏔️ Grown at 2,200m altitude in Pampore, Kashmir <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ Rich in Crocin &amp; Safranal antioxidants <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌙 Saffron takes 75,000 flowers for 1 pound <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ GMP Certified Manufacturing <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌸 Brightens skin in 2–4 weeks <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ Free shipping above ₹2,000 <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌿 No Parabens · No Sulfates · No Synthetics <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ Dermatologist Tested <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🏆 Premium Kashmiri Kesar — Red Gold of India <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌸 Hand-harvested Kashmiri Saffron <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ 100% Natural Ingredients <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌿 Cruelty-Free &amp; Vegan <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ Each strand picked at dawn <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🏔️ Grown at 2,200m altitude in Pampore, Kashmir <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ Rich in Crocin &amp; Safranal antioxidants <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌙 Saffron takes 75,000 flowers for 1 pound <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ GMP Certified Manufacturing <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌸 Brightens skin in 2–4 weeks <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ Free shipping above ₹2,000 <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🌿 No Parabens · No Sulfates · No Synthetics <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>✦ Dermatologist Tested <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
    <span>🏆 Premium Kashmiri Kesar — Red Gold of India <span style="color:rgba(245,168,0,.3);font-size:1.125rem">|</span></span>
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
        <a href="index.html" class="header-logo">
          <img src="assets/main.png" alt="Kesar Kosmetics" width="48" height="48" style="height:2.5rem;width:auto;object-fit:contain;display:block;" />
        </a>
      </div>

      <!-- Desktop nav -->
      <nav class="header-nav">
        <a href="index.html" class="__ACTIVE_index__">Home</a>
        <a href="products.html" class="__ACTIVE_products__">Products</a>
        <a href="track-order.html" class="__ACTIVE_track-order__">Track Order</a>
        <a href="about.html" class="__ACTIVE_about__">About Us</a>
        <a href="blogs.html" class="__ACTIVE_blogs__">Blogs</a>
        <a href="faq.html" class="__ACTIVE_faq__">FAQ</a>
        <a href="contact.html" class="__ACTIVE_contact__">Contact</a>
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
        <a href="wishlist.html" id="wishlist-target-icon" class="icon-btn" aria-label="Wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
          <span id="wishlist-count-badge" class="icon-badge hidden">0</span>
        </a>

        <!-- User menu -->
        <div id="user-menu-wrap" class="relative">
          <!-- Shown when logged out -->
          <a href="login.html" id="login-link" class="hidden sm:block ml-2">
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
    <a href="index.html">Home</a>
    <a href="products.html">Products</a>
    <a href="track-order.html">Track Order</a>
    <a href="about.html">About Us</a>
    <a href="blogs.html">Blogs</a>
    <a href="faq.html">FAQ</a>
    <a href="contact.html">Contact</a>
    <a href="wishlist.html" class="mt-2">Wishlist</a>
    <a href="cart.html" class="mt-2">Cart</a>
    <div id="mobile-auth-links" class="mt-4">
      <a href="login.html" id="mobile-login-link" class="btn btn-primary w-full justify-center">Login</a>
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
      <div id="cart-free-shipping-bar" class="mb-3 p-2.5 rounded-xl bg-[#FFF8EC] border border-[#F5A800]/30 text-xs text-[#7A3B00]">
        <p class="text-xs font-semibold text-green-700 text-center">🎉 You've unlocked FREE shipping!</p>
        <div class="mt-1.5 h-2 rounded-full bg-green-100 overflow-hidden"><div class="h-full rounded-full bg-green-500 transition-all duration-500" style="width:100%"></div></div>
      </div>
      <div class="flex justify-between mb-3 text-sm font-semibold text-[#3E2723]">
        <span>Total</span>
        <span id="cart-drawer-total">₹0</span>
      </div>
      <a href="cart.html" class="btn btn-primary w-full justify-center mb-2">View Cart</a>
      <a href="checkout.html" class="btn btn-dark w-full justify-center">Checkout</a>
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
"""

# Pages to convert: (source php name, page title, page desc, current page key, load_razorpay)
PAGES = [
    ('index.php',       'Kesar Kosmetics — Premium Kashmiri Saffron',
                        'Discover authentic Kashmiri saffron skincare and wellness products.',
                        'index', False),
    ('about.php',       'About Us — Kesar Kosmetics',
                        'Learn about Kesar Kosmetics and our authentic Kashmiri saffron products.',
                        'about', False),
    ('products.php',    'Products — Kesar Kosmetics',
                        'Browse our full collection of Kashmiri saffron skincare and wellness products.',
                        'products', False),
    ('product.php',     'Product — Kesar Kosmetics',
                        'View product details at Kesar Kosmetics.',
                        'product', False),
    ('contact.php',     'Contact Us — Kesar Kosmetics',
                        'Get in touch with Kesar Kosmetics.',
                        'contact', False),
    ('cart.php',        'Cart — Kesar Kosmetics',
                        'Your shopping cart at Kesar Kosmetics.',
                        'cart', False),
    ('checkout.php',    'Checkout — Kesar Kosmetics',
                        'Complete your purchase at Kesar Kosmetics.',
                        'checkout', True),
    ('login.php',       'Login — Kesar Kosmetics',
                        'Sign in to your Kesar Kosmetics account.',
                        'login', False),
    ('login_admin.php', 'Admin Login — Kesar Kosmetics',
                        'Admin login for Kesar Kosmetics.',
                        'login_admin', False),
    ('wishlist.php',    'Wishlist — Kesar Kosmetics',
                        'Your wishlist at Kesar Kosmetics.',
                        'wishlist', False),
    ('blogs.php',       'Blogs — Kesar Kosmetics',
                        'Read the latest saffron & wellness blogs from Kesar Kosmetics.',
                        'blogs', False),
    ('faq.php',         'FAQ — Kesar Kosmetics',
                        'Frequently asked questions about Kesar Kosmetics.',
                        'faq', False),
    ('track-order.php', 'Track Order — Kesar Kosmetics',
                        'Track your order from Kesar Kosmetics.',
                        'track-order', False),
    ('track-results.php','Track Results — Kesar Kosmetics',
                        'Your order tracking results from Kesar Kosmetics.',
                        'track-results', False),
    ('track-status.php','Track Status — Kesar Kosmetics',
                        'Your order status at Kesar Kosmetics.',
                        'track-status', False),
    ('order-success.php','Order Success — Kesar Kosmetics',
                        'Your order was successful at Kesar Kosmetics.',
                        'order-success', False),
]

def strip_php_preamble(content):
    """Remove the PHP preamble block (<?php ... ?>) at the top of the file."""
    # Remove the opening PHP block that sets variables and calls includes
    content = re.sub(
        r'<\?php\s*(?:\$\w+\s*=\s*[^;]+;\s*)*(?:include\s+[\'"]includes/[^\'"\s]+[\'"]\s*;\s*)*\?>\s*\n?',
        '',
        content,
        count=1,
        flags=re.DOTALL
    )
    return content

def remove_php_include_lines(content):
    """Remove remaining PHP include lines for footer/scripts at end of file."""
    content = re.sub(r'<\?php\s+include\s+[\'"]includes/(?:footer|scripts|head|header)\.php[\'"]\s*;\s*\?>\s*\n?', '', content)
    return content

def remove_all_php_tags(content):
    """Remove any remaining PHP blocks."""
    # Remove <?php ... ?> blocks
    content = re.sub(r'<\?php.*?\?>', '', content, flags=re.DOTALL)
    # Remove <?= ... ?> echo blocks
    content = re.sub(r'<\?=.*?\?>', '', content, flags=re.DOTALL)
    return content

def expand_about_php_loops(content):
    """Expand the PHP foreach loops in about.php into static HTML."""
    
    # Stats grid loop
    stats_html = """
    <div class="card p-6 text-center hover:shadow-md transition-shadow">
            <div class="text-3xl mb-2">🌸</div>
            <p class="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723]">3,000+</p>
            <p class="mt-1 text-xs text-[#8A7768] leading-snug">Years of Saffron Heritage</p>
          </div>
          <div class="card p-6 text-center hover:shadow-md transition-shadow">
            <div class="text-3xl mb-2">🌺</div>
            <p class="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723]">75,000</p>
            <p class="mt-1 text-xs text-[#8A7768] leading-snug">Flowers per Pound of Saffron</p>
          </div>
          <div class="card p-6 text-center hover:shadow-md transition-shadow">
            <div class="text-3xl mb-2">🌿</div>
            <p class="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723]">100%</p>
            <p class="mt-1 text-xs text-[#8A7768] leading-snug">Natural &amp; Chemical-Free</p>
          </div>
          <div class="card p-6 text-center hover:shadow-md transition-shadow">
            <div class="text-3xl mb-2">🏔️</div>
            <p class="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723]">2,200m</p>
            <p class="mt-1 text-xs text-[#8A7768] leading-snug">Altitude — Pampore, Kashmir</p>
          </div>"""
    content = re.sub(
        r"<\?php foreach \(\[\['3,000\+.*?endforeach; \?>",
        stats_html,
        content, flags=re.DOTALL
    )

    # Features grid loop
    features_html = """
        <div class="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          </div>
          <h3 class="font-semibold text-[#3E2723] text-lg mb-2">100% Natural Ingredients</h3>
          <p class="text-[#6B5B52] text-sm leading-relaxed">No parabens, no sulfates, no synthetic fragrances. Every ingredient is chosen for its purity and efficacy.</p>
        </div>
        <div class="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          </div>
          <h3 class="font-semibold text-[#3E2723] text-lg mb-2">Small-Batch Crafted</h3>
          <p class="text-[#6B5B52] text-sm leading-relaxed">We produce in small batches to ensure maximum freshness and potency. Each jar is made to order.</p>
        </div>
        <div class="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          </div>
          <h3 class="font-semibold text-[#3E2723] text-lg mb-2">Dermatologist Tested</h3>
          <p class="text-[#6B5B52] text-sm leading-relaxed">Our formulations are tested and verified for safety. GMP-certified manufacturing ensures quality.</p>
        </div>
        <div class="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          </div>
          <h3 class="font-semibold text-[#3E2723] text-lg mb-2">Cruelty-Free &amp; Vegan</h3>
          <p class="text-[#6B5B52] text-sm leading-relaxed">We never test on animals and use no animal-derived ingredients.</p>
        </div>
        <div class="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          </div>
          <h3 class="font-semibold text-[#3E2723] text-lg mb-2">Saffron at the Core</h3>
          <p class="text-[#6B5B52] text-sm leading-relaxed">Kashmiri saffron is rich in crocin, safranal, and picrocrocin — powerful antioxidants.</p>
        </div>
        <div class="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          </div>
          <h3 class="font-semibold text-[#3E2723] text-lg mb-2">Ethically Sourced</h3>
          <p class="text-[#6B5B52] text-sm leading-relaxed">We work directly with saffron farmers in Pampore, ensuring fair wages and sustainable harvesting.</p>
        </div>"""
    content = re.sub(
        r"<\?php\s*\$features\s*=.*?endforeach; \?>",
        features_html,
        content, flags=re.DOTALL
    )

    # Mission values loop
    mission_html = """
        <div class="bg-white/8 border border-white/12 rounded-2xl p-6">
          <div class="text-2xl mb-3">🌱</div>
          <h4 class="font-semibold text-white mb-2">Sustainability</h4>
          <p class="text-white/60 text-sm leading-relaxed">We support regenerative farming practices that protect Kashmir's saffron fields for future generations.</p>
        </div>
        <div class="bg-white/8 border border-white/12 rounded-2xl p-6">
          <div class="text-2xl mb-3">🤝</div>
          <h4 class="font-semibold text-white mb-2">Fair Trade</h4>
          <p class="text-white/60 text-sm leading-relaxed">Direct partnerships with Pampore farmers ensure fair compensation and community development.</p>
        </div>
        <div class="bg-white/8 border border-white/12 rounded-2xl p-6">
          <div class="text-2xl mb-3">💛</div>
          <h4 class="font-semibold text-white mb-2">Transparency</h4>
          <p class="text-white/60 text-sm leading-relaxed">We share exactly what goes into every product — no hidden ingredients, no greenwashing.</p>
        </div>"""
    content = re.sub(
        r"<\?php foreach \(\[\['🌱'.*?endforeach; \?>",
        mission_html,
        content, flags=re.DOTALL
    )
    return content

def expand_contact_php_loops(content):
    """Expand the PHP foreach loops in contact.php into static HTML."""
    
    # Contact cards
    cards_html = """        <div class="card p-6">
          <div class="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
            </svg>
          </div>
          <p class="text-xs font-bold uppercase tracking-[.2em] text-[#8A7768] mb-1">Email Us</p>
          <a href="mailto:kesarkosmetics@gmail.com" class="font-semibold text-[#3E2723] hover:text-[#D97736] transition-colors text-sm leading-snug block">kesarkosmetics@gmail.com</a>
          <p class="mt-1 text-xs text-[#8A7768] leading-snug">We reply within 24 hours</p>
        </div>
        <div class="card p-6">
          <div class="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/>
            </svg>
          </div>
          <p class="text-xs font-bold uppercase tracking-[.2em] text-[#8A7768] mb-1">Call Us</p>
          <a href="tel:+919841524064" class="font-semibold text-[#3E2723] hover:text-[#D97736] transition-colors text-sm leading-snug block">+91 98415 24064</a>
          <p class="mt-1 text-xs text-[#8A7768] leading-snug">Mon–Sat, 9 AM – 6 PM IST</p>
        </div>
        <div class="card p-6">
          <div class="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
            </svg>
          </div>
          <p class="text-xs font-bold uppercase tracking-[.2em] text-[#8A7768] mb-1">Head Office</p>
          <p class="font-semibold text-[#3E2723] text-sm leading-snug">Pampore, J&amp;K</p>
          <p class="mt-1 text-xs text-[#8A7768] leading-snug">Befina Pampore – 192121</p>
        </div>
        <div class="card p-6">
          <div class="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
          </div>
          <p class="text-xs font-bold uppercase tracking-[.2em] text-[#8A7768] mb-1">Business Hours</p>
          <p class="font-semibold text-[#3E2723] text-sm leading-snug">Mon–Fri: 9 AM – 6 PM</p>
          <p class="mt-1 text-xs text-[#8A7768] leading-snug">Sat: 10 AM – 4 PM · Sun: Online only</p>
        </div>"""
    content = re.sub(
        r"<\?php\s*\$cards\s*=.*?endforeach; \?>",
        cards_html,
        content, flags=re.DOTALL
    )

    # Topic tags
    topics_html = """              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">Order tracking</span>
              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">Returns &amp; refunds</span>
              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">Product enquiry</span>
              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">Bulk orders</span>
              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">Wholesale</span>
              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">Skincare advice</span>
              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">Gifting</span>
              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">Careers</span>"""
    content = re.sub(
        r"<\?php foreach \(\['Order tracking'.*?endforeach; \?>",
        topics_html,
        content, flags=re.DOTALL
    )
    return content

def fix_php_links(content):
    """Replace .php links with .html, handle admin paths."""
    # Fix href/src links
    content = re.sub(r"""(href=["'])([^"']*?)\.php(\??[^"']*)(['"])""", 
                     lambda m: m.group(1) + m.group(2) + '.html' + m.group(3) + m.group(4), 
                     content)
    # Fix JS location.href references
    content = re.sub(r"(location\.href\s*=\s*['\"])([^'\"]*?)\.php(\??[^'\"]*?)(['\"])",
                     lambda m: m.group(1) + m.group(2) + '.html' + m.group(3) + m.group(4),
                     content)
    content = re.sub(r"(location\.replace\s*\(\s*['\"])([^'\"]*?)\.php(['\"])",
                     lambda m: m.group(1) + m.group(2) + '.html' + m.group(3),
                     content)
    # Fix window.location.href = 'xxx.php'
    content = re.sub(r"(window\.location\.href\s*=\s*['\"])([^'\"]*?)\.php(\??[^'\"]*?)(['\"])",
                     lambda m: m.group(1) + m.group(2) + '.html' + m.group(3) + m.group(4),
                     content)
    # Fix template literals `product.php?id=...`
    content = re.sub(r'`([^`]*?)\.php(\?[^`]*?)`',
                     lambda m: '`' + m.group(1) + '.html' + m.group(2) + '`',
                     content)
    # Fix contact form api call - update to use mailto fallback directly
    content = content.replace("fetch('api/contact.php'", "fetch('api/contact.php'")  # keep as-is, fallback handles it
    # Fix admin dashboard links
    content = content.replace("admin/dashboard.php", "admin/dashboard.html")
    content = content.replace("admin/dashboard.html'", "admin/dashboard.html'")  # no double replace
    return content

def fix_category_links(content):
    """Fix products.php?category=... links in products page."""
    content = re.sub(r'products\.html\?category=', 'products.html?category=', content)
    return content

def build_page(php_filename, page_title, page_desc, current_page_key, load_razorpay):
    """Build a complete HTML page from a PHP source file."""
    src_path = os.path.join(PHP_DIR, php_filename)
    if not os.path.exists(src_path):
        print(f"  ⚠  {php_filename} not found, skipping.")
        return

    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Strip PHP preamble (opening block with $vars + includes)
    content = strip_php_preamble(content)
    # 2. Remove remaining include lines
    content = remove_php_include_lines(content)
    # 3. Expand PHP loops for about/contact
    if php_filename == 'about.php':
        content = expand_about_php_loops(content)
    if php_filename == 'contact.php':
        content = expand_contact_php_loops(content)
    # 4. Strip any remaining PHP tags
    content = remove_all_php_tags(content)
    # 5. Fix .php → .html links
    content = fix_php_links(content)

    # Build head
    razorpay_tag = '<script src="https://checkout.razorpay.com/v1/checkout.js" defer></script>' if load_razorpay else ''
    head = HEAD_HTML.replace('__PAGE_TITLE__', page_title)
    head = head.replace('__PAGE_DESC__', page_desc)
    head = head.replace('__RAZORPAY__', razorpay_tag)

    # Build header with active nav class
    header = HEADER_HTML
    nav_keys = ['index', 'products', 'track-order', 'about', 'blogs', 'faq', 'contact']
    for key in nav_keys:
        placeholder = f'__ACTIVE_{key}__'
        header = header.replace(placeholder, 'active' if key == current_page_key else '')

    # Build footer (read and strip PHP)
    footer_path = os.path.join(PHP_DIR, 'includes', 'footer.php')
    with open(footer_path, 'r', encoding='utf-8') as f:
        footer = f.read()
    footer = re.sub(r'<\?php.*?\?>', '', footer, flags=re.DOTALL)
    footer = fix_php_links(footer)

    # Build scripts (read and strip PHP)
    scripts_path = os.path.join(PHP_DIR, 'includes', 'scripts.php')
    with open(scripts_path, 'r', encoding='utf-8') as f:
        scripts = f.read()
    scripts = re.sub(r'<\?php.*?\?>', '', scripts, flags=re.DOTALL)
    scripts = fix_php_links(scripts)

    # Assemble full HTML
    full_html = head + '\n' + header + '\n' + content.strip() + '\n' + footer + '\n' + scripts + '\n</body>\n</html>\n'

    # Write output .html file
    out_filename = php_filename.replace('.php', '.html')
    out_path = os.path.join(PHP_DIR, out_filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f"  ✓  {php_filename} → {out_filename}")

def main():
    print("Converting PHP pages to static HTML for Vercel deployment...")
    print(f"Source: {PHP_DIR}\n")
    for args in PAGES:
        try:
            build_page(*args)
        except Exception as e:
            print(f"  ✗  {args[0]}: {e}")
    print("\n✅ Conversion complete!")

if __name__ == '__main__':
    main()
