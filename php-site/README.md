# Kesar Kosmetics — PHP Site

Full conversion of the React/Node.js e-commerce app to **HTML + CSS + JavaScript + PHP**.

## Structure

```
php-site/
├── index.php              # Home page
├── products.php           # Products listing
├── product.php            # Product detail (dynamic, ?id=...)
├── cart.php               # Shopping cart
├── checkout.php           # Multi-step checkout
├── order-success.php      # Order confirmation
├── login.php              # Google OAuth login
├── wishlist.php           # Wishlist
├── track-order.php        # Order tracking (my orders + search)
├── track-results.php      # Search results
├── track-status.php       # Order status detail
├── about.php              # About Us
├── contact.php            # Contact form
├── faq.php                # FAQ accordion
├── blogs.php              # Blog posts
├── config.php             # ← FILL IN YOUR CREDENTIALS
├── .htaccess              # Apache config
│
├── api/
│   ├── contact.php        # POST — sends contact form email
│   ├── orders.php         # POST/GET — COD order creation
│   ├── razorpay-create.php # POST — create Razorpay order
│   └── razorpay-verify.php # POST — verify Razorpay payment
│
├── admin/
│   ├── dashboard.php      # Admin overview + stats
│   ├── orders.php         # Order management (update status)
│   ├── products.php       # Product CRUD
│   └── blogs.php          # Blog management
│
├── js/
│   ├── firebase-config.js # Firebase init + auth helpers
│   ├── cart.js            # Cart logic (localStorage + Firestore)
│   ├── products.js        # Firestore product CRUD
│   └── wishlist.js        # Wishlist (localStorage)
│
├── css/
│   └── style.css          # All custom styles
│
├── includes/
│   ├── head.php           # HTML <head> block
│   ├── header.php         # Site header + nav + drawers
│   ├── footer.php         # Footer + policy modals
│   └── scripts.php        # Shared JS (auth, cart, search, etc.)
│
├── assets/
│   ├── logo.png
│   └── background1.jpeg
│
└── data/
    └── orders.json        # Local order backup (auto-created)
```

## Setup

### 1. Configure credentials

Edit `config.php` and fill in:

```php
define('SMTP_HOST',        'smtp.gmail.com');
define('SMTP_PORT',        587);
define('SMTP_USER',        'your@gmail.com');
define('SMTP_PASS',        'your-app-password');   // Gmail App Password
define('SMTP_FROM',        'your@gmail.com');
define('RAZORPAY_KEY_ID',  'rzp_live_...');
define('RAZORPAY_KEY_SECRET', '...');
define('SITE_URL',         'https://yourdomain.com');
```

### 2. Install PHPMailer (optional but recommended)

```bash
composer require phpmailer/phpmailer
```

If Composer is not available, the site falls back to PHP's built-in `mail()` function.

### 3. Upload to hosting

Upload the entire `php-site/` folder to your web host's `public_html` (or `www`) directory.

Make sure:
- PHP 7.4+ is available
- `mod_rewrite` is enabled (for `.htaccess`)
- The `data/` folder is writable: `chmod 755 data/`

### 4. Firebase stays the same

The Firebase project, Firestore database, and all data remain **unchanged**. The JS files use the same Firebase config as the original React app.

## What changed vs the original

| Feature | Original | PHP Version |
|---|---|---|
| Frontend framework | React 19 | Vanilla HTML/JS |
| Routing | React Router | Multi-page PHP files |
| Backend | Node.js/Express | PHP |
| Email | Nodemailer | PHPMailer / mail() |
| Razorpay backend | Node.js | PHP (curl) |
| Firebase Auth | React context | Firebase JS SDK (CDN) |
| Firestore | React context | Firebase JS SDK (CDN) |
| Cart | React context | Vanilla JS module |
| Wishlist | React context | Vanilla JS module |
| Styling | Tailwind (npm) | Tailwind CDN + custom CSS |

## Admin Access

1. Go to `yourdomain.com/index.php`
2. Scroll to footer → click "Admin" (hidden link)
3. Enter admin email + password
4. Redirects to `admin/dashboard.php`

Admin emails: `gsrinadh55@gmail.com`, `kesarkosmetics@gmail.com`

## Coupon Codes

- `KESAR10` — 10% off
- `SAVE20` — 20% off
- `SUMMER5` — 5% off

## Notes

- All product images are stored as base64 in Firestore (same as original)
- Orders are saved to Firestore by the frontend JS (same as original)
- The PHP backend also saves a local JSON backup in `data/orders.json`
- Razorpay runs in demo mode if keys are not configured
