<?php
$pageTitle   = $pageTitle   ?? 'Kesar Kosmetics';
$pageDesc    = $pageDesc    ?? 'Authentic Kashmiri saffron skincare and wellness products.';
$requireAuth = $requireAuth ?? false;

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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#3E2723" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <meta name="description" content="<?= htmlspecialchars($pageDesc) ?>" />

  <!-- Favicon -->
  <link rel="icon"             type="image/png" sizes="32x32"   href="/assets/favicon.png" />
  <link rel="apple-touch-icon"                  sizes="180x180" href="/assets/favicon.png" />
  <link rel="shortcut icon"    type="image/png"                 href="/assets/favicon.png" />

  <!-- Preconnect to external origins so DNS+TLS is resolved before they're needed -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://cdn.tailwindcss.com" />
  <link rel="preconnect" href="https://firestore.googleapis.com" />
  <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
  <link rel="preconnect" href="https://www.googletagmanager.com" />

  <!-- Fonts — display=swap prevents render-blocking -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" /></noscript>

  <!-- Custom CSS — loaded first, before Tailwind, so it renders immediately -->
  <link rel="stylesheet" href="<?= $cssPath ?? 'css/style.css' ?>" />

  <!-- Tailwind CDN — loaded synchronously so classes apply on first paint -->
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

  <!-- Razorpay — only on checkout, preloaded so it's ready when user clicks Buy Now -->
  <?php if (!empty($loadRazorpay)): ?>
  <script src="https://checkout.razorpay.com/v1/checkout.js" defer></script>
  <?php endif; ?>

  <!-- Google Analytics — async, non-blocking -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-BWJJHYGDQ3"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-BWJJHYGDQ3');</script>

  <?php if ($requireAuth): ?>
  <script>
    window.addEventListener('pageshow', function(e) { if (e.persisted) window.location.reload(); });
  </script>
  <?php endif; ?>
</head>
<body class="bg-[#FFF8EC] text-[#3E2723]">

<div id="toast-container"></div>
<div id="falling-particles" aria-hidden="true"></div>
