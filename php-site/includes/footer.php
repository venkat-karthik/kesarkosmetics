<?php
// Shared footer — policies, links, admin login trigger
?>
<footer>
  <div style="height:1px;background:linear-gradient(to right,transparent,rgba(245,168,0,.5),transparent)"></div>
  <div class="container py-12 md:py-16">

    <div class="footer-grid">
      <!-- Brand -->
      <div>
        <div class="w-28 h-28 mb-4">
          <img src="assets/main.png" alt="Kesar Kosmetics" class="w-full h-full object-contain" />
        </div>
        <p class="text-sm text-white/60 leading-relaxed mb-4 max-w-xs">
          Authentic, handcrafted essentials for a healthier, sustainable life.
        </p>
        <div class="flex gap-3">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>
      </div>

      <!-- Products -->
      <div>
        <h4 class="footer-heading">Products</h4>
        <ul class="space-y-3" id="footer-products-col1">
          <li><a href="products.php">All Products</a></li>
          <li><a href="products.php?category=Saffron">Saffron</a></li>
          <li><a href="products.php?category=Skincare">Skincare</a></li>
          <li><a href="products.php?category=Wellness">Wellness</a></li>
        </ul>
      </div>

      <!-- More Products -->
      <div>
        <h4 class="footer-heading">More Products</h4>
        <ul class="space-y-3" id="footer-products-col2">
          <li><a href="products.php?category=Oils">Oils</a></li>
          <li><a href="products.php?category=Ghee">Ghee</a></li>
          <li><a href="products.php?category=Flours">Flours</a></li>
          <li><a href="products.php?category=Gift+Hampers">Gift Hampers</a></li>
        </ul>
      </div>

      <!-- Company -->
      <div>
        <h4 class="footer-heading">Company</h4>
        <ul class="space-y-3">
          <li><a href="about.php">About Us</a></li>
          <li><a href="contact.php">Contact Us</a></li>
          <li><a href="blogs.php">Blogs</a></li>
          <li><a href="track-order.php">Track Order</a></li>
        </ul>
      </div>

      <!-- Policies -->
      <div>
        <h4 class="footer-heading">Policies</h4>
        <ul class="space-y-3">
          <li><button class="policy-link text-sm text-white/70 hover:text-[#F5A800] transition-colors" data-policy="refund-policy">Refund &amp; Return Policy</button></li>
          <li><button class="policy-link text-sm text-white/70 hover:text-[#F5A800] transition-colors" data-policy="privacy-policy">Privacy Policy</button></li>
          <li><button class="policy-link text-sm text-white/70 hover:text-[#F5A800] transition-colors" data-policy="terms-of-service">Terms of Service</button></li>
          <li><button class="policy-link text-sm text-white/70 hover:text-[#F5A800] transition-colors" data-policy="shipping-policy">Shipping Policy</button></li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
      <p class="text-xs text-white/40">&copy; 2025 Kesar Kosmetics. All rights reserved.</p>
      <p class="text-xs text-white/40">Made with ❤️ for a sustainable future</p>
      <p class="text-xs text-white/40">Designed and made by <a href="https://velfound.com" target="_blank" rel="noopener noreferrer" class="text-[#F5A800] hover:text-[#E8620A] transition-colors font-medium">Velfound</a></p>
      <button id="admin-footer-btn" class="text-xs text-white/10 hover:text-white/30 transition-colors" aria-label="Admin">Admin</button>
    </div>
  </div>
</footer>

<!-- ── Policy Modal ───────────────────────────────────────────────────────── -->
<div id="policy-modal" class="modal-backdrop" role="dialog" aria-modal="true">
  <div class="modal policy-modal">
    <div class="modal-header">
      <h2 id="policy-title" class="font-heading text-xl font-bold text-[#3E2723]"></h2>
      <button id="policy-close-btn" class="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body space-y-5" id="policy-body"></div>
    <div class="modal-footer bg-gray-50 rounded-b-3xl">
      <p class="text-xs text-gray-400 text-center">Last updated: January 2025 · Kesar Kosmetics</p>
    </div>
  </div>
</div>

<!-- Admin login modal removed — admin access via login.php?admin=1 -->
