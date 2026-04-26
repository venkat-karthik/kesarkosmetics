<?php
// Common <head> block — include at top of every page
// Usage: include 'includes/head.php'; (adjust path as needed)
// $pageTitle and $pageDesc can be set before including
// $requireAuth can be set to true for pages that require authentication (cart, checkout, etc.)
$pageTitle = $pageTitle ?? 'Kesar Kosmetics';
$pageDesc  = $pageDesc  ?? 'Authentic Kashmiri saffron skincare and wellness products.';
$requireAuth = $requireAuth ?? false;

// Add cache control headers for authenticated pages to prevent back button access after logout
if ($requireAuth) {
  header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
  header("Cache-Control: post-check=0, pre-check=0", false);
  header("Pragma: no-cache");
  header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-BWJJHYGDQ3"></script>
  <script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-BWJJHYGDQ3');</script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#3E2723" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <meta name="description" content="<?= htmlspecialchars($pageDesc) ?>" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />

  <!-- Tailwind CDN (utility classes used inline) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
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
    }
  </script>

  <!-- Custom CSS -->
  <link rel="stylesheet" href="<?= $cssPath ?? 'css/style.css' ?>" />

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32"   href="/assets/favicon.png" />
  <link rel="icon" type="image/png" sizes="16x16"   href="/assets/favicon.png" />
  <link rel="apple-touch-icon"      sizes="180x180" href="/assets/favicon.png" />
  <link rel="shortcut icon"         type="image/png" href="/assets/favicon.png" />

  <!-- Razorpay (loaded on checkout page only) -->
  <?php if (!empty($loadRazorpay)): ?>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <?php endif; ?>

  <!-- Lucide icons via CDN -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  
  <?php if ($requireAuth): ?>
  <script>
    // Prevent back button access after logout for authenticated pages
    window.addEventListener('pageshow', function(event) {
      // If page is loaded from cache (back button), force reload to check auth
      if (event.persisted) {
        window.location.reload();
      }
    });
  </script>
  <?php endif; ?>
</head>
<body class="bg-[#FFF8EC] text-[#3E2723]">

<!-- Toast container -->
<div id="toast-container"></div>

<!-- Falling particles -->
<div id="falling-particles" aria-hidden="true"></div>
