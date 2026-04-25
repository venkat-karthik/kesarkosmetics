<?php
/**
 * POST /api/contact.php
 * Sends contact form email using PHPMailer or PHP mail()
 * Body: { name, email, phone, subject, message }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Load config
require_once __DIR__ . '/../config.php';

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    $body = $_POST;
}

$name    = trim($body['name']    ?? '');
$email   = trim($body['email']   ?? '');
$phone   = trim($body['phone']   ?? '');
$subject = trim($body['subject'] ?? '');
$message = trim($body['message'] ?? '');

if (!$name || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email and message are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

$to      = ADMIN_EMAIL;
$subject = $subject ?: "Contact Form: $name";
$headers = [
    'From'         => "Kesar Kosmetics <" . SMTP_FROM . ">",
    'Reply-To'     => "$name <$email>",
    'Content-Type' => 'text/html; charset=UTF-8',
    'MIME-Version' => '1.0',
];

$htmlBody = "
<div style='font-family:Arial,sans-serif;color:#3E2723;line-height:1.6;max-width:600px'>
  <h2 style='color:#D97736'>New Contact Form Message</h2>
  <p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>
  <p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
  <p><strong>Phone:</strong> " . htmlspecialchars($phone ?: 'N/A') . "</p>
  <p><strong>Subject:</strong> " . htmlspecialchars($subject) . "</p>
  <hr style='border:1px solid #E0D8C8'/>
  <p><strong>Message:</strong></p>
  <p>" . nl2br(htmlspecialchars($message)) . "</p>
</div>
";

$headerStr = '';
foreach ($headers as $k => $v) {
    $headerStr .= "$k: $v\r\n";
}

// Try PHPMailer if available, otherwise fall back to mail()
$sent = false;

if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = SMTP_SECURE ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->setFrom(SMTP_FROM, 'Kesar Kosmetics');
        $mail->addAddress($to);
        $mail->addReplyTo($email, $name);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->send();
        $sent = true;
    } catch (Exception $e) {
        error_log('PHPMailer error: ' . $e->getMessage());
    }
}

if (!$sent) {
    // Fallback to PHP mail()
    $sent = mail($to, $subject, $htmlBody, $headerStr);
}

if ($sent) {
    echo json_encode(['message' => 'Message sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message. Please email us directly at ' . ADMIN_EMAIL]);
}
