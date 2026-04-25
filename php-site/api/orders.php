<?php
/**
 * POST /api/orders.php  — Create a COD order (saves to Firestore via Firebase REST API)
 * GET  /api/orders.php  — Get user's orders (from Firestore via REST API)
 *
 * NOTE: Orders are primarily saved to Firestore by the frontend JS.
 * This PHP endpoint handles COD order creation and sends confirmation email.
 * It also stores a lightweight record in a local JSON file as backup.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User-Id, X-User-Email');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SERVER['HTTP_X_USER_ID'] ?? '';
$userEmail = strtolower($_SERVER['HTTP_X_USER_EMAIL'] ?? '');

// ── GET: return orders for user ───────────────────────────────────────────
if ($method === 'GET') {
    if (!$userId) { http_response_code(401); echo json_encode(['error' => 'Not authenticated']); exit; }
    // Orders are fetched from Firestore by the frontend directly.
    // Return empty array — frontend merges with Firestore data.
    echo json_encode([]);
    exit;
}

// ── POST: create COD order ────────────────────────────────────────────────
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];

    $userId    = $body['user_id']    ?? $userId;
    $userEmail = $body['user_email'] ?? $userEmail;
    $userName  = $body['user_name']  ?? 'Customer';
    $userPhone = $body['user_phone'] ?? '';

    if (!$userId) { http_response_code(401); echo json_encode(['error' => 'Not authenticated']); exit; }

    $orderId = generateUUID();
    $order = [
        'id'               => $orderId,
        'user_id'          => $userId,
        'user_email'       => $userEmail,
        'user_name'        => $userName,
        'items'            => $body['items'] ?? [],
        'shipping_address' => $body['shipping_address'] ?? [],
        'payment_method'   => $body['payment_method'] ?? 'cod',
        'total'            => floatval($body['total'] ?? 0),
        'status'           => 'pending',
        'contact_email'    => $userEmail,
        'contact_phone'    => $body['shipping_address']['phone'] ?? $userPhone,
        'created_at'       => date('c'),
    ];

    // Save to local JSON store (backup)
    saveOrderLocal($order);

    // Send confirmation email
    sendOrderEmail($order);

    echo json_encode($order);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

// ── Helpers ───────────────────────────────────────────────────────────────

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
        mt_rand(0,0x0fff)|0x4000, mt_rand(0,0x3fff)|0x8000,
        mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff)
    );
}

function saveOrderLocal($order) {
    $file = __DIR__ . '/../data/orders.json';
    if (!is_dir(dirname($file))) mkdir(dirname($file), 0755, true);
    $orders = [];
    if (file_exists($file)) {
        $orders = json_decode(file_get_contents($file), true) ?: [];
    }
    $orders[] = $order;
    file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));
}

function sendOrderEmail($order) {
    $to = $order['contact_email'] ?? '';
    if (!$to) return;

    $subject = 'Your order has been received — Kesar Kosmetics';
    $itemsHtml = '';
    foreach ($order['items'] as $item) {
        $itemsHtml .= "<tr><td style='padding:8px;border-bottom:1px solid #eee'>" . htmlspecialchars($item['product_name'] ?? 'Product') . "</td><td style='padding:8px;border-bottom:1px solid #eee;text-align:center'>" . intval($item['quantity'] ?? 1) . "</td><td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>₹" . number_format(floatval($item['price'] ?? 0) * intval($item['quantity'] ?? 1), 0) . "</td></tr>";
    }

    $html = "
    <div style='font-family:Arial,sans-serif;color:#3E2723;max-width:600px;margin:0 auto'>
      <div style='background:linear-gradient(135deg,#3E2723,#5D4037);padding:2rem;text-align:center;border-radius:1rem 1rem 0 0'>
        <h1 style='color:#F5A800;margin:0;font-size:1.5rem'>Order Confirmed! 🎉</h1>
        <p style='color:rgba(255,255,255,.8);margin:.5rem 0 0'>Thank you for your purchase</p>
      </div>
      <div style='background:#fff;padding:2rem;border:1px solid #E0D8C8'>
        <p>Hi <strong>" . htmlspecialchars($order['user_name'] ?? 'Customer') . "</strong>,</p>
        <p>We've received your order and are preparing it now.</p>
        <div style='background:#FAF7F2;border-radius:.75rem;padding:1rem;margin:1rem 0'>
          <p style='margin:0;font-size:.875rem'><strong>Order ID:</strong> " . htmlspecialchars($order['id']) . "</p>
          <p style='margin:.25rem 0 0;font-size:.875rem'><strong>Payment:</strong> " . htmlspecialchars(strtoupper($order['payment_method'] ?? 'COD')) . "</p>
          <p style='margin:.25rem 0 0;font-size:.875rem'><strong>Total:</strong> ₹" . number_format(floatval($order['total'] ?? 0), 0) . "</p>
        </div>
        <table style='width:100%;border-collapse:collapse;margin:1rem 0'>
          <thead><tr style='background:#F5EEE6'><th style='padding:8px;text-align:left'>Item</th><th style='padding:8px;text-align:center'>Qty</th><th style='padding:8px;text-align:right'>Price</th></tr></thead>
          <tbody>$itemsHtml</tbody>
        </table>
        <p style='margin-top:1.5rem'>You can track your order at <a href='" . SITE_URL . "/track-order.php' style='color:#D97736'>Track Order</a>.</p>
      </div>
      <div style='background:#FAF7F2;padding:1rem;text-align:center;border-radius:0 0 1rem 1rem;font-size:.75rem;color:#8A7768'>
        © 2025 Kesar Kosmetics · kesarkosmetics@gmail.com
      </div>
    </div>";

    $headers = "From: Kesar Kosmetics <" . SMTP_FROM . ">\r\nContent-Type: text/html; charset=UTF-8\r\nMIME-Version: 1.0\r\n";

    if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
        require_once __DIR__ . '/../vendor/autoload.php';
        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = SMTP_HOST; $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER; $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = SMTP_SECURE ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = SMTP_PORT;
            $mail->setFrom(SMTP_FROM, 'Kesar Kosmetics');
            $mail->addAddress($to);
            $mail->isHTML(true); $mail->Subject = $subject; $mail->Body = $html;
            $mail->send(); return;
        } catch (Exception $e) { error_log('Order email error: ' . $e->getMessage()); }
    }
    @mail($to, $subject, $html, $headers);
}
