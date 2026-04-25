<?php
/**
 * config.php — Site-wide configuration
 * Copy this file and fill in your real values.
 * NEVER commit real credentials to version control.
 */

// ── Site ──────────────────────────────────────────────────────────────────
define('SITE_URL',    getenv('SITE_URL')    ?: 'https://yourdomain.com');
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'kesarkosmetics@gmail.com');

// ── SMTP (for contact form & order emails) ────────────────────────────────
// Use Gmail App Password: https://myaccount.google.com/apppasswords
define('SMTP_HOST',   getenv('SMTP_HOST')   ?: 'smtp.gmail.com');
define('SMTP_PORT',   (int)(getenv('SMTP_PORT')   ?: 587));
define('SMTP_USER',   getenv('SMTP_USER')   ?: 'kesarkosmetics@gmail.com');
define('SMTP_PASS',   getenv('SMTP_PASS')   ?: '');          // ← fill in App Password
define('SMTP_FROM',   getenv('SMTP_FROM')   ?: 'kesarkosmetics@gmail.com');
define('SMTP_SECURE', (bool)(getenv('SMTP_SECURE') ?: false)); // true = SSL (port 465), false = TLS (port 587)

// ── Razorpay ──────────────────────────────────────────────────────────────
define('RAZORPAY_KEY_ID',        getenv('RAZORPAY_KEY_ID')        ?: '');
define('RAZORPAY_KEY_SECRET',    getenv('RAZORPAY_KEY_SECRET')    ?: '');
define('RAZORPAY_WEBHOOK_SECRET',getenv('RAZORPAY_WEBHOOK_SECRET')?: '');
