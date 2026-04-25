<?php
/**
 * POST /api/razorpay-create.php
 * Creates a Razorpay order. Returns key_id + order details.
 * If Razorpay keys not configured, returns demo mode response.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User-Id, X-User-Email');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Method not allowed']); exit; }

require_once __DIR__ . '/../config.php';

$body = json_decode(file_get_contents('php://input'), true) ?: [];
$userId    = $body['user_id']    ?? ($_SERVER['HTTP_X_USER_ID'] ?? '');
$userEmail = $body['user_email'] ?? ($_SERVER['HTTP_X_USER_EMAIL'] ?? '');
$userName  = $body['user_name']  ?? 'Customer';
$userPhone = $body['user_phone'] ?? '';

if (!$userId) { http_response_code(401); echo json_encode(['error'=>'Not authenticated']); exit; }

$total    = floatval($body['total'] ?? 0);
$currency = strtoupper($body['currency'] ?? 'INR');
if ($total <= 0) { http_response_code(400); echo json_encode(['error'=>'Invalid order total']); exit; }

$orderId    = generateUUID();
$amountPaise = (int)round($total * 100);

// ── Demo mode (no real Razorpay keys) ────────────────────────────────────
$razKeyId     = RAZORPAY_KEY_ID;
$razKeySecret = RAZORPAY_KEY_SECRET;
$isReal = $razKeyId && strpos($razKeyId, 'rzp_') === 0 && strlen($razKeyId) > 20 && strpos($razKeyId, 'placeholder') === false;

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

// ── Real Razorpay ─────────────────────────────────────────────────────────
$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_USERPWD        => "$razKeyId:$razKeySecret",
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => json_encode([
        'amount'          => $amountPaise,
        'currency'        => $currency,
        'receipt'         => $orderId,
        'payment_capture' => 1,
        'notes'           => ['app_order_id' => $orderId, 'user_id' => $userId, 'email' => $userEmail],
    ]),
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create Razorpay order', 'details' => json_decode($response, true)]);
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

// ── Helpers ───────────────────────────────────────────────────────────────

function buildOrder($id, $uid, $email, $name, $phone, $body, $total, $currency, $amountPaise, $rzpOrderId, $demo) {
    return [
        'id'                  => $id,
        'user_id'             => $uid,
        'user_email'          => $email,
        'user_name'           => $name,
        'items'               => $body['items'] ?? [],
        'shipping_address'    => $body['shipping_address'] ?? [],
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
        'contact_phone'       => $body['shipping_address']['phone'] ?? $phone,
        'created_at'          => date('c'),
        'demo'                => $demo,
    ];
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff),
        mt_rand(0,0x0fff)|0x4000,mt_rand(0,0x3fff)|0x8000,
        mt_rand(0,0xffff),mt_rand(0,0xffff),mt_rand(0,0xffff)
    );
}

function saveOrderLocal($order) {
    $file = __DIR__ . '/../data/orders.json';
    if (!is_dir(dirname($file))) mkdir(dirname($file), 0755, true);
    $orders = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
    $orders[] = $order;
    file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));
}
