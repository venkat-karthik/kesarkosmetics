<?php
/**
 * POST /api/razorpay-verify.php
 * Verifies Razorpay payment signature.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, user_email }
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/_security.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Method not allowed']); exit; }

// Rate limit: 20 verify attempts per IP per hour
rate_limit('razorpay_verify_' . get_client_ip(), 20, 3600);

$body = json_decode(file_get_contents('php://input'), true) ?: [];

$rzpOrderId   = sanitize_string($body['razorpay_order_id']   ?? '', 128);
$rzpPaymentId = sanitize_string($body['razorpay_payment_id'] ?? '', 128);
$rzpSignature = sanitize_string($body['razorpay_signature']  ?? '', 256);
$userId       = sanitize_string($body['user_id'] ?? ($_SERVER['HTTP_X_USER_ID'] ?? ''), 128);

if (!$userId) { http_response_code(401); echo json_encode(['error'=>'Not authenticated']); exit; }

if (!$rzpOrderId || !$rzpPaymentId || !$rzpSignature) {
    http_response_code(400);
    echo json_encode(['error'=>'Missing Razorpay verification fields']);
    exit;
}

// Validate format — Razorpay IDs are alphanumeric with underscores
if (!preg_match('/^[a-zA-Z0-9_]+$/', $rzpOrderId) ||
    !preg_match('/^[a-zA-Z0-9_]+$/', $rzpPaymentId) ||
    !preg_match('/^[a-fA-F0-9]+$/', $rzpSignature)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid Razorpay field format']);
    exit;
}

// Demo mode — skip real signature check
$isDemoOrder = strpos($rzpOrderId, 'demo_order_') === 0;
if (!$isDemoOrder) {
    // Verify real Razorpay signature
    $secret = RAZORPAY_KEY_SECRET;
    if (!$secret) {
        http_response_code(500);
        echo json_encode(['error' => 'Payment verification not configured']);
        exit;
    }
    $expectedSignature = hash_hmac('sha256', "$rzpOrderId|$rzpPaymentId", $secret);
    if (!hash_equals($expectedSignature, $rzpSignature)) {
        error_log("Razorpay signature mismatch for order: $rzpOrderId");
        http_response_code(400);
        echo json_encode(['error' => 'Invalid payment signature']);
        exit;
    }
}

// Find and update order in local store
$file = __DIR__ . '/../data/orders.json';
$orders = safe_read_json($file);

$found = false;
$updatedOrder = null;

foreach ($orders as &$order) {
    if (($order['razorpay_order_id'] ?? '') === $rzpOrderId) {
        $order['payment_status']      = 'captured';
        $order['status']              = 'confirmed';
        $order['razorpay_payment_id'] = $rzpPaymentId;
        $order['razorpay_signature']  = $rzpSignature;
        $found = true;
        $updatedOrder = $order;
        break;
    }
}
unset($order);

if ($found) {
    safe_write_json($file, $orders);
}

// Return success regardless of whether local order was found
// (Firestore is the source of truth — frontend saves there)
echo json_encode([
    'id'                  => $updatedOrder['id'] ?? $rzpOrderId,
    'status'              => 'confirmed',
    'payment_status'      => 'captured',
    'razorpay_payment_id' => $rzpPaymentId,
]);
