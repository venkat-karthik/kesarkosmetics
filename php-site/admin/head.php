<?php
/**
 * Admin head.php — Shared <head> for all admin pages
 * Includes cache control headers to prevent back button access after logout
 */

// Prevent browser caching of admin pages
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");

$pageTitle = $pageTitle ?? 'Admin — Kesar Kosmetics';
$cssPath = $cssPath ?? '../css/style.css';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title><?= htmlspecialchars($pageTitle) ?></title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />

  <!-- Tailwind CDN -->
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

  <link rel="stylesheet" href="<?= $cssPath ?>" />
  <link rel="icon" type="image/png" href="../assets/main.png" />

  <!-- Prevent back button access after logout -->
  <script>
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        window.location.reload();
      }
    });
  </script>
</head>
<body class="bg-gray-100">
<div id="toast-container"></div>
