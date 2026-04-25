<?php
/**
 * POST /api/razorpay-create.php
 * Creates a Razorpay order. Returns key_id + order details.
 * If Razorpay keys not configured, returns demo mode response.
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/_security.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Method not allowed']); exit; }

// Rate limit: 20 payment attempts per IP per hour
rate_limit('razorpay_create_' . get_client_ip(), 20, 3600);

$body = json_decode(file_get_contents('php://input'), true) ?: [];

$userId    = sanitize_string($body['user_id']    ?? ($_SERVER['HTTP_X_USER_ID'] ?? ''), 128);
$userEmail = sanitize_email($body['user_email']  ?? ($_SERVER['HTTP_X_USER_EMAIL'] ?? ''));
$userName  = sanitize_string($body['user_name']  ?? 'Customer', 100);
$userPhone = sanitize_string($body['user_phone'] ?? '', 20);

if (!$userId) { http_response_code(401); echo json_encode(['error'=>'Not authenticated']); exit; }

$total    = floatval($body['total'] ?? 0);
$currency = preg_replace('/[^A-Z]/', '', strtoupper($body['currency'] ?? 'INR'));
if ($total <= 0) { http_response_code(400); echo json_encode(['error'=>'Invalid order total']); exit; }
if ($total > 500000) { http_response_code(400); echo json_encode(['error'=>'Order total exceeds maximum allowed']); exit; }

$orderId     = generateUUID();
$amountPaise = (int)round($total * 100);

// ── Demo mode ─────────────────────────────────────────────────────────────────
$razKeyId     = RAZORPAY_KEY_ID;
$razKeySecret = RAZORPAY_KEY_SECRET;
$isReal = $razKeyId
    && strpos($razKeyId, 'rzp_') === 0
    && strlen($razKeyId) > 20
    && strpos($razKeyId, 'placeholder') === false;

if (!$isReal) {
    $demoRazorpayOrderId = 'demo_order_' . $orderId;
    $order = buildOrder($orderId, $userId, $userEmail, $userName, $userPhone, $body, $total, $currency, $amountPaise, $demoRazorpayOrderId, true);
    saveOrderLocal($order);
    echo json_encode([
        'order' => $order,
        'demo'  => true,
        'razorpay' => [
            'key_id'   => 'rzp_test_demo',
            'order_id' => $demoRazorpayOrderId,
            'amount'   => $amountPaise,
            'currency' => $currency,
        ],
    ]);
    exit;
}

// ── Real Razorpay ─────────────────────────────────────────────────────────────
$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_USERPWD        => "$razKeyId:$razKeySecret",
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_SSL_VERIFYPEER => true, // always verify SSL
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_POSTFIELDS     => json_encode([
        'amount'          => $amountPaise,
        'currency'        => $currency,
        'receipt'         => $orderId,
        'payment_capture' => 1,
        'notes'           => ['app_order_id' => $orderId, 'user_id' => $userId],
    ]),
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error_log('Razorpay create error: ' . $response);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create payment order. Please try again.']);
    exit;
}

$rzpOrder = json_decode($response, true);
$order = buildOrder($orderId, $userId, $userEmail, $userName, $userPhone, $body, $total, $currency, $amountPaise, $rzpOrder['id'], false);
saveOrderLocal($order);

echo json_encode([
    'order'    => $order,
    'razorpay' => [
        'key_id'   => $razKeyId,
        'order_id' => $rzpOrder['id'],
        'amount'   => $amountPaise,
        'currency' => $currency,
    ],
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildOrder($id, $uid, $email, $name, $phone, $body, $total, $currency, $amountPaise, $rzpOrderId, $demo) {
    $rawAddr = is_array($body['shipping_address'] ?? null) ? $body['shipping_address'] : [];
    $addr = [
        'name'    => sanitize_string($rawAddr['name']    ?? '', 100),
        'phone'   => sanitize_string($rawAddr['phone']   ?? '', 20),
        'address' => sanitize_string($rawAddr['address'] ?? '', 300),
        'city'    => sanitize_string($rawAddr['city']    ?? '', 100),
        'state'   => sanitize_string($rawAddr['state']   ?? '', 100),
        'pincode' => sanitize_string($rawAddr['pincode'] ?? '', 20),
        'country' => sanitize_string($rawAddr['country'] ?? 'India', 100),
    ];

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

    return [
        'id'                  => $id,
        'user_id'             => $uid,
        'user_email'          => $email,
        'user_name'           => $name,
        'items'               => $items,
        'shipping_address'    => $addr,
        'payment_method'      => 'razorpay',
        'total'               => $total,
        'status'              => 'pending',
        'payment_status'      => 'created',
        'payment_gateway'     => $demo ? 'razorpay_demo' : 'razorpay',
        'razorpay_order_id'   => $rzpOrderId,
        'razorpay_payment_id' => null,
        'razorpay_signature'  => null,
        'currency'            => $currency,
        'amount_paise'        => $amountPaise,
        'contact_email'       => $email,
        'contact_phone'       => $addr['phone'] ?: $phone,
        'created_at'          => date('c'),
        'demo'                => $demo,
    ];
}

function generateUUID() {
    if (function_exists('random_bytes')) {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff),
        mt_rand(0,0x0fff)|0x4000,mt_rand(0,0x3fff)|0x8000,
        mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff)
    );
}

function saveOrderLocal($order) {
    $file = __DIR__ . '/../data/orders.json';
    $orders = safe_read_json($file);
    $orders[] = $order;
    safe_write_json($file, $orders);
}
