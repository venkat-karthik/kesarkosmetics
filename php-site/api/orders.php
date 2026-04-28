<?php
/**
 * POST /api/orders.php  — Create a COD order
 * GET  /api/orders.php  — Returns empty (orders fetched from Firestore by frontend)
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/_security.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$method = $_SERVER['REQUEST_METHOD'];

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $userId = sanitize_string($_SERVER['HTTP_X_USER_ID'] ?? '', 128);
    if (!$userId) { http_response_code(401); echo json_encode(['error' => 'Not authenticated']); exit; }
    echo json_encode([]);
    exit;
}

// ── POST ──────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    // Rate limit: 10 orders per IP per hour
    rate_limit('orders_' . get_client_ip(), 10, 3600);

    $body = json_decode(file_get_contents('php://input'), true) ?: [];

    $userId    = sanitize_string($body['user_id']    ?? ($_SERVER['HTTP_X_USER_ID'] ?? ''), 128);
    $userEmail = sanitize_email($body['user_email']  ?? ($_SERVER['HTTP_X_USER_EMAIL'] ?? ''));
    $userName  = sanitize_string($body['user_name']  ?? 'Customer', 100);
    $userPhone = sanitize_string($body['user_phone'] ?? '', 20);

    if (!$userId) { http_response_code(401); echo json_encode(['error' => 'Not authenticated']); exit; }

    $total = floatval($body['total'] ?? 0);
    if ($total <= 0) { http_response_code(400); echo json_encode(['error' => 'Invalid order total']); exit; }

    // Sanitize items
    $rawItems = is_array($body['items'] ?? null) ? $body['items'] : [];
    $items = array_map(function($item) {
        return [
            'product_id'   => sanitize_string($item['product_id']   ?? '', 128),
            'product_name' => sanitize_string($item['product_name'] ?? 'Product', 200),
            'quantity'     => max(1, intval($item['quantity'] ?? 1)),
            'price'        => max(0, floatval($item['price'] ?? 0)),
            'variant'      => sanitize_string($item['variant'] ?? '', 100),
            'image'        => sanitize_string($item['image'] ?? '', 500),
        ];
    }, $rawItems);

    // Sanitize shipping address
    $rawAddr = is_array($body['shipping_address'] ?? null) ? $body['shipping_address'] : [];
    $addr = [
        'name'        => sanitize_string($rawAddr['name']    ?? '', 100),
        'phone'       => sanitize_string($rawAddr['phone']   ?? '', 20),
        'address'     => sanitize_string($rawAddr['address'] ?? '', 300),
        'city'        => sanitize_string($rawAddr['city']    ?? '', 100),
        'state'       => sanitize_string($rawAddr['state']   ?? '', 100),
        'pincode'     => sanitize_string($rawAddr['pincode'] ?? '', 20),
        'country'     => sanitize_string($rawAddr['country'] ?? 'India', 100),
        'addressType' => sanitize_string($rawAddr['addressType'] ?? '', 20),
    ];

    $orderId = generateUUID();
    $order = [
        'id'               => $orderId,
        'user_id'          => $userId,
        'user_email'       => $userEmail,
        'user_name'        => $userName,
        'items'            => $items,
        'shipping_address' => $addr,
        'payment_method'   => 'cod',
        'total'            => $total,
        'status'           => 'pending',
        'contact_email'    => $userEmail,
        'contact_phone'    => $addr['phone'] ?: $userPhone,
        'created_at'       => date('c'),
    ];

    sendOrderEmail($order);

    echo json_encode($order);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateUUID() {
    if (function_exists('random_bytes')) {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
        mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
        mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff)
    );
}

function sendOrderEmail($order) {
    $to = $order['contact_email'] ?? '';
    if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) return;

    $subject = 'Your order has been received — Kesar Kosmetics';
    $itemsHtml = '';
    foreach ($order['items'] as $item) {
        $itemsHtml .= "<tr>"
            . "<td style='padding:8px;border-bottom:1px solid #eee'>" . htmlspecialchars($item['product_name'] ?? 'Product', ENT_QUOTES, 'UTF-8') . "</td>"
            . "<td style='padding:8px;border-bottom:1px solid #eee;text-align:center'>" . intval($item['quantity'] ?? 1) . "</td>"
            . "<td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>₹" . number_format(floatval($item['price'] ?? 0) * intval($item['quantity'] ?? 1), 0) . "</td>"
            . "</tr>";
    }

    $html = "
    <div style='font-family:Arial,sans-serif;color:#3E2723;max-width:600px;margin:0 auto'>
      <div style='background:linear-gradient(135deg,#3E2723,#5D4037);padding:2rem;text-align:center;border-radius:1rem 1rem 0 0'>
        <h1 style='color:#F5A800;margin:0;font-size:1.5rem'>Order Confirmed! 🎉</h1>
        <p style='color:rgba(255,255,255,.8);margin:.5rem 0 0'>Thank you for your purchase</p>
      </div>
      <div style='background:#fff;padding:2rem;border:1px solid #E0D8C8'>
        <p>Hi <strong>" . htmlspecialchars($order['user_name'] ?? 'Customer', ENT_QUOTES, 'UTF-8') . "</strong>,</p>
        <p>We've received your order and are preparing it now.</p>
        <div style='background:#FAF7F2;border-radius:.75rem;padding:1rem;margin:1rem 0'>
          <p style='margin:0;font-size:.875rem'><strong>Order ID:</strong> " . htmlspecialchars($order['id'], ENT_QUOTES, 'UTF-8') . "</p>
          <p style='margin:.25rem 0 0;font-size:.875rem'><strong>Payment:</strong> Cash on Delivery</p>
          <p style='margin:.25rem 0 0;font-size:.875rem'><strong>Total:</strong> ₹" . number_format(floatval($order['total'] ?? 0), 0) . "</p>
        </div>
        <table style='width:100%;border-collapse:collapse;margin:1rem 0'>
          <thead><tr style='background:#F5EEE6'><th style='padding:8px;text-align:left'>Item</th><th style='padding:8px;text-align:center'>Qty</th><th style='padding:8px;text-align:right'>Price</th></tr></thead>
          <tbody>$itemsHtml</tbody>
        </table>
        <p style='margin-top:1.5rem'>You can track your order at <a href='" . htmlspecialchars(SITE_URL, ENT_QUOTES, 'UTF-8') . "/track-order.php' style='color:#D97736'>Track Order</a>.</p>
      </div>
      <div style='background:#FAF7F2;padding:1rem;text-align:center;border-radius:0 0 1rem 1rem;font-size:.75rem;color:#8A7768'>
        © 2025 Kesar Kosmetics · kesarkosmetics@gmail.com
      </div>
    </div>";

    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require_once __DIR__ . '/../vendor/autoload.php';
        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = SMTP_HOST; $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER; $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = SMTP_SECURE
                ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = SMTP_PORT;
            $mail->setFrom(SMTP_FROM, 'Kesar Kosmetics');
            $mail->addAddress($to);
            $mail->isHTML(true); $mail->Subject = $subject; $mail->Body = $html;
            $mail->send(); return;
        } catch (Exception $e) { error_log('Order email error: ' . $e->getMessage()); }
    }

    $safeFrom  = filter_var(SMTP_FROM, FILTER_SANITIZE_EMAIL);
    $headers   = "From: Kesar Kosmetics <{$safeFrom}>\r\nContent-Type: text/html; charset=UTF-8\r\nMIME-Version: 1.0\r\n";
    @mail($to, $subject, $html, $headers);
}
