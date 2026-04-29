# Contact Form Setup & Configuration Guide

## Quick Answer: Where Do Messages Go?

**📧 Contact form messages are sent to:** `kesarkosmetics@gmail.com`

This is configured in `php-site/config.php`:
```php
define('ADMIN_EMAIL', 'kesarkosmetics@gmail.com');
```

---

## How It Works

### 1. User Submits Form
User fills out the contact form on `http://localhost:8000/contact.php` and clicks "Send Message"

### 2. Form Data Sent to API
The form data is sent as JSON to `http://localhost:8000/api/contact.php`

### 3. API Processes Request
- Validates all inputs
- Checks rate limiting
- Sanitizes data
- Prevents injection attacks

### 4. Email Sent to Admin
The message is formatted as an HTML email and sent to `kesarkosmetics@gmail.com`

### 5. Success Message Shown
User sees a success message with smooth animations

---

## Email Configuration

### Current Setup

**Email Address:** `kesarkosmetics@gmail.com`

**SMTP Server:** Gmail (smtp.gmail.com:587)

**Configuration File:** `php-site/config.php`

### To Enable Email Delivery

You need to set up Gmail App Password:

1. **Enable 2-Factor Authentication on Gmail**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password

3. **Update config.php**
   ```php
   define('SMTP_PASS', 'xxxx xxxx xxxx xxxx');  // Paste the 16-char password here
   ```

4. **Test Email Delivery**
   - Submit the contact form
   - Check if email arrives in `kesarkosmetics@gmail.com`

### Alternative: Use PHP mail()

If you don't want to set up Gmail SMTP, the system will automatically fall back to PHP's built-in `mail()` function. This works on most hosting providers.

---

## Email Content Example

When a user submits the contact form, the admin receives:

```
From: Kesar Kosmetics <kesarkosmetics@gmail.com>
To: kesarkosmetics@gmail.com
Subject: Product Inquiry

New Contact Form Message

Name: John Doe
Email: john@example.com
Phone: +91 98765 43210
Subject: Product Inquiry

Message:
I would like to know more about your saffron products.
```

---

## API Endpoint Details

### Endpoint
```
POST /api/contact.php
```

### Request Format
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "subject": "Product Inquiry",
  "message": "I would like to know more about your saffron products."
}
```

### Response (Success)
```json
{"message": "Message sent successfully"}
```

### Response (Error)
```json
{"error": "Name, email and message are required"}
```

### Validation Rules

| Field | Required | Max Length | Validation |
|-------|----------|-----------|-----------|
| name | Yes | 100 | Non-empty string |
| email | Yes | 254 | Valid email format |
| phone | No | 20 | Any string |
| subject | No | 200 | Any string |
| message | Yes | 5000 | Non-empty string |

### Rate Limiting

- **Limit:** 5 requests per IP per 10 minutes
- **Response:** HTTP 429 Too Many Requests
- **Message:** "Too many requests. Please try again later."

---

## Testing the API

### Using curl

```bash
curl -X POST http://localhost:8000/api/contact.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+91 98765 43210",
    "subject": "Test Message",
    "message": "This is a test message"
  }'
```

### Expected Response
```json
{"message":"Message sent successfully"}
```

### Test Cases

**Test 1: Valid submission**
```bash
curl -X POST http://localhost:8000/api/contact.php \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","subject":"Test","message":"Hello"}'
```
Expected: `{"message":"Message sent successfully"}`

**Test 2: Missing name**
```bash
curl -X POST http://localhost:8000/api/contact.php \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"john@example.com","subject":"Test","message":"Hello"}'
```
Expected: `{"error":"Name, email and message are required"}`

**Test 3: Invalid email**
```bash
curl -X POST http://localhost:8000/api/contact.php \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"invalid","subject":"Test","message":"Hello"}'
```
Expected: `{"error":"Invalid email address"}`

**Test 4: Wrong method**
```bash
curl -X GET http://localhost:8000/api/contact.php
```
Expected: `{"error":"Method not allowed"}`

---

## Security Features

### ✅ Input Validation
- All fields validated
- Email format checked
- Maximum lengths enforced

### ✅ Input Sanitization
- HTML special characters escaped
- Newlines normalized
- Prevents injection attacks

### ✅ Rate Limiting
- 5 requests per IP per 10 minutes
- Prevents spam and abuse
- File-based token bucket

### ✅ CORS Protection
- Same-origin requests allowed
- Cross-origin requests validated
- Localhost allowed for development

### ✅ Email Header Injection Prevention
- Carriage returns removed
- Line feeds normalized
- Reply-To header safely handled

---

## Troubleshooting

### Problem: "Message sent successfully" but email not received

**Check:**
1. Gmail spam folder
2. SMTP credentials in config.php
3. Gmail App Password is correct
4. Gmail 2-Factor Authentication is enabled

**Solution:**
1. Verify SMTP_PASS in config.php
2. Check Gmail security settings
3. Enable "Less secure app access" if needed
4. Check server error logs

### Problem: "Too many requests" error

**Cause:** Rate limit exceeded (5 requests per 10 minutes)

**Solution:**
1. Wait 10 minutes
2. Use different IP address
3. Clear rate limiting files: `/tmp/kesar_rl/`

### Problem: "Invalid email address" error

**Cause:** Email format is invalid

**Solution:**
1. Check email format (user@domain.com)
2. Remove extra spaces
3. Ensure @ symbol is present

### Problem: 500 Internal Server Error

**Cause:** Server configuration issue

**Solution:**
1. Check PHP error logs
2. Verify config.php exists
3. Check _security.php exists
4. Verify rate limiting directory is writable

---

## Production Deployment

### Before Going Live

1. **Update SMTP Password**
   ```php
   define('SMTP_PASS', 'your-gmail-app-password');
   ```

2. **Update Razorpay Keys**
   ```php
   define('RAZORPAY_KEY_ID', 'rzp_live_...');
   define('RAZORPAY_KEY_SECRET', '...');
   ```

3. **Update Site URL**
   ```php
   define('SITE_URL', 'https://yourdomain.com');
   ```

4. **Test Email Delivery**
   - Submit test form
   - Verify email arrives

5. **Enable HTTPS**
   - Install SSL certificate
   - Update SITE_URL to https://

6. **Monitor Logs**
   - Check error logs regularly
   - Monitor email delivery

---

## Files Involved

| File | Purpose |
|------|---------|
| `php-site/config.php` | Configuration (email, SMTP, etc.) |
| `php-site/contact.php` | Contact form page |
| `php-site/api/contact.php` | Contact API endpoint |
| `php-site/api/_security.php` | Security helpers (validation, rate limiting) |
| `php-site/includes/scripts.php` | Shared JavaScript (form handling) |

---

## Summary

✅ **Contact form is fully functional**

- Messages go to: `kesarkosmetics@gmail.com`
- API endpoint: `http://localhost:8000/api/contact.php`
- Validation: All inputs validated
- Security: All security measures in place
- Rate limiting: 5 requests per 10 minutes
- Email delivery: Working (requires SMTP setup)

---

*Last Updated: April 29, 2026*
