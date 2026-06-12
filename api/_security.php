<?php
/**
 * _security.php — Shared API security helpers
 * Include at the top of every API endpoint.
 */

// ── CORS: restrict to same origin ────────────────────────────────────────────
function set_cors_headers() {
    $allowed_origins = [
        'http://localhost:8080',
        'http://localhost',
        'http://127.0.0.1:8080',
        'http://127.0.0.1',
    ];

    // Add production domain if configured
    if (defined('SITE_URL') && SITE_URL && SITE_URL !== 'https://yourdomain.com') {
        $base = rtrim(SITE_URL, '/');
        $allowed_origins[] = $base;
        // Also allow www. variant
        if (strpos($base, '://www.') === false) {
            $allowed_origins[] = str_replace('://', '://www.', $base);
        } else {
            $allowed_origins[] = str_replace('://www.', '://', $base);
        }
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } elseif (empty($origin)) {
        // Same-origin request (no Origin header) — allow
    } else {
        // Unknown origin — deny with 403
        http_response_code(403);
        echo json_encode(['error' => 'Origin not allowed']);
        exit;
    }

    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-User-Id, X-User-Email');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');
}

// ── Rate limiting via file-based token bucket ─────────────────────────────────
// $key: unique identifier (e.g. 'contact_' . $ip)
// $limit: max requests per window
// $window: time window in seconds
function rate_limit($key, $limit = 10, $window = 60) {
    $dir = sys_get_temp_dir() . '/kesar_rl';
    if (!is_dir($dir)) {
        mkdir($dir, 0700, true);
    }

    // Sanitize key for use as filename
    $file = $dir . '/' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $key) . '.json';

    $now = time();
    $data = ['count' => 0, 'window_start' => $now];

    if (file_exists($file)) {
        $raw = @file_get_contents($file);
        if ($raw) {
            $saved = json_decode($raw, true);
            if ($saved && ($now - $saved['window_start']) < $window) {
                $data = $saved;
            }
        }
    }

    $data['count']++;
    file_put_contents($file, json_encode($data), LOCK_EX);

    if ($data['count'] > $limit) {
        http_response_code(429);
        header('Retry-After: ' . ($window - ($now - $data['window_start'])));
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }
}

// ── Sanitize string input ─────────────────────────────────────────────────────
function sanitize_string($value, $max_length = 1000) {
    $value = trim((string)$value);
    $value = mb_substr($value, 0, $max_length);
    return $value;
}

// ── Sanitize email ────────────────────────────────────────────────────────────
function sanitize_email($value) {
    $value = trim((string)$value);
    $value = filter_var($value, FILTER_SANITIZE_EMAIL);
    return strtolower($value);
}

// ── Get client IP ─────────────────────────────────────────────────────────────
function get_client_ip() {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = trim(explode(',', $_SERVER[$key])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}

// ── Safe file write with locking ──────────────────────────────────────────────
function safe_write_json($file, $data) {
    $dir = dirname($file);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $tmp = $file . '.tmp.' . uniqid('', true);
    file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
    rename($tmp, $file); // atomic on most systems
}

// ── Safe read JSON with locking ───────────────────────────────────────────────
function safe_read_json($file) {
    if (!file_exists($file)) return [];
    $fp = fopen($file, 'r');
    if (!$fp) return [];
    flock($fp, LOCK_SH);
    $content = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return json_decode($content, true) ?: [];
}
