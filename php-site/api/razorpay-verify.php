<?php
/**
 * POST /api/razorpay-verify.php
 * Verifies Razorpay payment signature.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, user_email }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User-Id, X-User-Email');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Method not allowed']); exit; }

require_once __DIR__ . '/../config.php';

$body = json_decode(file_get_contents('php://input'), true) ?: [];

$rzpOrderId   = trim($body['razorpay_order_id']   ?? '');
$rzpPaymentId = trim($body['razorpay_payment_id'] ?? '');
$rzpSignature = trim($body['razorpay_signature']  ?? '');
$userId       = trim($body['user_id']             ?? ($_SERVER['HTTP_X_USER_ID'] ?? ''));

if (!$userId) { http_response_code(401); echo json_encode(['error'=>'Not authenticated']); exit; }
if (!$rzpOrderId || !$rzpPaymentId || !$rzpSignature) {
    http_response_code(400); echo json_encode(['error'=>'Missing Razorpay verification fields']); exit;
}

// Verify signature
$expectedSignature = hash_hmac('sha256', "$rzpOrderId|$rzpPaymentId", RAZORPAY_KEY_SECRET);
if (!hash_equals($expectedSignature, $rzpSignature)) {
    http_response_code(400); echo json_encode(['error'=>'Invalid Razorpay signature']); exit;
}

// Find and update order in local store
$file = __DIR__ . '/../data/orders.json';
$orders = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
$found = false;
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
if ($found) {
    file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));
}

// Return success (frontend saves to Firestore)
echo json_encode([
    'id'             => $updatedOrder['id'] ?? $rzpOrderId,
    'status'         => 'confirmed',
    'payment_status' => 'captured',
    'razorpay_payment_id' => $rzpPaymentId,
]);
