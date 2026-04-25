<?php
// Common <head> block — include at top of every page
// Usage: include 'includes/head.php'; (adjust path as needed)
// $pageTitle and $pageDesc can be set before including
$pageTitle = $pageTitle ?? 'Kesar Kosmetics';
$pageDesc  = $pageDesc  ?? 'Authentic Kashmiri saffron skincare and wellness products.';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

  <!-- Razorpay (loaded on checkout page only) -->
  <?php if (!empty($loadRazorpay)): ?>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <?php endif; ?>

  <!-- Lucide icons via CDN -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
</head>
<body class="bg-[#FFF8EC] text-[#3E2723]">

<!-- Toast container -->
<div id="toast-container"></div>

<!-- Falling particles -->
<div id="falling-particles" aria-hidden="true"></div>
