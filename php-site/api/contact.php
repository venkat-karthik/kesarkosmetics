<?php
/**
 * POST /api/contact.php
 * Sends contact form email using PHPMailer or PHP mail()
 * Body: { name, email, phone, subject, message }
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/_security.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Rate limit: 5 contact submissions per IP per 10 minutes
rate_limit('contact_' . get_client_ip(), 5, 600);

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    $body = $_POST;
}

// Sanitize all inputs — prevent header injection
$name    = sanitize_string($body['name']    ?? '', 100);
$email   = sanitize_email($body['email']    ?? '');
$phone   = sanitize_string($body['phone']   ?? '', 20);
$subject = sanitize_string($body['subject'] ?? '', 200);
$message = sanitize_string($body['message'] ?? '', 5000);

// Strip newlines from name/email/subject to prevent header injection
$name    = preg_replace('/[\r\n\t]/', ' ', $name);
$subject = preg_replace('/[\r\n\t]/', ' ', $subject);

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

$to         = ADMIN_EMAIL;
$mailSubject = $subject ?: "Contact Form: $name";

$htmlBody = "
<div style='font-family:Arial,sans-serif;color:#3E2723;line-height:1.6;max-width:600px'>
  <h2 style='color:#D97736'>New Contact Form Message</h2>
  <p><strong>Name:</strong> " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "</p>
  <p><strong>Email:</strong> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</p>
  <p><strong>Phone:</strong> " . htmlspecialchars($phone ?: 'N/A', ENT_QUOTES, 'UTF-8') . "</p>
  <p><strong>Subject:</strong> " . htmlspecialchars($mailSubject, ENT_QUOTES, 'UTF-8') . "</p>
  <hr style='border:1px solid #E0D8C8'/>
  <p><strong>Message:</strong></p>
  <p>" . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . "</p>
</div>
";

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
        $mail->SMTPSecure = SMTP_SECURE
            ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->setFrom(SMTP_FROM, 'Kesar Kosmetics');
        $mail->addAddress($to);
        $mail->addReplyTo($email, $name); // PHPMailer handles this safely
        $mail->isHTML(true);
        $mail->Subject = $mailSubject;
        $mail->Body    = $htmlBody;
        $mail->send();
        $sent = true;
    } catch (Exception $e) {
        error_log('PHPMailer error: ' . $e->getMessage());
    }
}

if (!$sent) {
    // Fallback: PHP mail() — use only safe header values
    $safeFrom    = filter_var(SMTP_FROM, FILTER_SANITIZE_EMAIL);
    $headerStr   = "From: Kesar Kosmetics <{$safeFrom}>\r\n"
                 . "Content-Type: text/html; charset=UTF-8\r\n"
                 . "MIME-Version: 1.0\r\n";
    // Do NOT add Reply-To via mail() headers — too risky for injection
    $sent = @mail($to, $mailSubject, $htmlBody, $headerStr);
}

if ($sent) {
    echo json_encode(['message' => 'Message sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message. Please email us directly at ' . ADMIN_EMAIL]);
}
