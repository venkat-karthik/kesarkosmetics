# Testing Guide — Kesar Kosmetics

## Quick Test Checklist

### 1. FAQ Navigation Fix
**Test:** FAQ button now appears in main navigation
- [ ] Open http://localhost:8000/index.php
- [ ] Look for "FAQ" link in the main navigation menu
- [ ] Click FAQ link
- [ ] Verify you're taken to http://localhost:8000/faq.php
- [ ] Check mobile menu also has FAQ link

### 2. Contact Form Animation Fix
**Test:** Contact form has smooth animations on submission
- [ ] Open http://localhost:8000/contact.php
- [ ] Fill in the form:
  - Name: "Test User"
  - Email: "test@example.com"
  - Phone: "+91 98765 43210"
  - Subject: "Test Message"
  - Message: "This is a test message"
- [ ] Click "Send Message" button
- [ ] Observe:
  - [ ] Form fades out smoothly (0.3s)
  - [ ] Success message fades in (0.5s)
  - [ ] Green checkmark icon visible
  - [ ] Toast notification appears
  - [ ] Message says "Message sent! We'll get back to you soon."

### 3. Console Error Check
**Test:** No JavaScript errors in console
- [ ] Open any page (e.g., http://localhost:8000/index.php)
- [ ] Press F12 to open Developer Tools
- [ ] Go to Console tab
- [ ] Look for red error messages
- [ ] Expected: No red errors (only info/debug logs are OK)

### 4. All Pages Load Without Errors
**Test:** Verify all pages load correctly

**Customer Pages:**
- [ ] Home: http://localhost:8000/index.php
- [ ] Products: http://localhost:8000/products.php
- [ ] Product Detail: http://localhost:8000/product.php?id=hXbHD0hKTlbNWTlUkQ7W
- [ ] Cart: http://localhost:8000/cart.php
- [ ] Checkout: http://localhost:8000/checkout.php
- [ ] Track Order: http://localhost:8000/track-order.php
- [ ] Wishlist: http://localhost:8000/wishlist.php
- [ ] Blogs: http://localhost:8000/blogs.php
- [ ] FAQ: http://localhost:8000/faq.php
- [ ] About: http://localhost:8000/about.php
- [ ] Contact: http://localhost:8000/contact.php

**Admin Pages:**
- [ ] Dashboard: http://localhost:8000/admin/dashboard.php
- [ ] Products: http://localhost:8000/admin/products.php
- [ ] Orders: http://localhost:8000/admin/orders.php
- [ ] Reviews: http://localhost:8000/admin/reviews.php
- [ ] Blogs: http://localhost:8000/admin/blogs.php
- [ ] Users: http://localhost:8000/admin/users.php
- [ ] Subscribers: http://localhost:8000/admin/subscribers.php
- [ ] Database: http://localhost:8000/admin/database.php
- [ ] Revenue: http://localhost:8000/admin/revenue.php

### 5. API Endpoints Working
**Test:** Contact form API is responding

**Using curl:**
```bash
curl -X POST http://localhost:8000/api/contact.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+91 98765 43210",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

**Expected Response:**
```json
{"message": "Message sent successfully"}
```

---

## Detailed Testing Steps

### Test 1: FAQ Navigation
1. Open http://localhost:8000/index.php
2. In the header, you should see: Home | Products | Track Order | About Us | Blogs | **FAQ** | Contact
3. Click on FAQ
4. You should be taken to the FAQ page with all questions and answers
5. On mobile (resize browser to <768px), open the hamburger menu
6. FAQ should appear in the mobile menu as well

### Test 2: Contact Form Animations
1. Open http://localhost:8000/contact.php
2. Scroll down to the contact form
3. Fill in all required fields:
   - Full Name: "John Doe"
   - Email Address: "john@example.com"
   - Phone Number: "+91 98765 43210"
   - Subject: "Product Inquiry"
   - Message: "I would like to know more about your saffron products."
4. Click "Send Message" button
5. Watch the animation:
   - The form should fade out (becomes transparent)
   - After 0.3 seconds, the form disappears
   - The success message fades in with a green checkmark
   - A toast notification appears at the top
6. The success message should show:
   - Green checkmark icon
   - "Message Sent!" heading
   - "Thank you for reaching out. We'll get back to you within 24 hours." message

### Test 3: Console Verification
1. Open any page (e.g., http://localhost:8000/products.php)
2. Press F12 to open Developer Tools
3. Click on the "Console" tab
4. Look at the console output:
   - You may see some info/debug logs (these are OK)
   - You should NOT see any red error messages
   - You should NOT see "Uncaught" errors
   - You should NOT see "is not defined" errors

### Test 4: Mobile Responsiveness
1. Open http://localhost:8000/index.php
2. Press F12 to open Developer Tools
3. Click the device toggle (mobile view icon)
4. Select a mobile device (e.g., iPhone 12)
5. Verify:
   - [ ] Navigation hamburger menu appears
   - [ ] FAQ link appears in mobile menu
   - [ ] All pages are responsive
   - [ ] No layout breaks

---

## Troubleshooting

### Issue: FAQ link not showing in navigation
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Check that `includes/header.php` has the FAQ link

### Issue: Contact form animation not working
**Solution:**
1. Check browser console for JavaScript errors
2. Verify JavaScript is enabled in browser
3. Try a different browser
4. Clear browser cache and refresh

### Issue: Contact form not submitting
**Solution:**
1. Check browser console for network errors
2. Verify API endpoint is accessible: http://localhost:8000/api/contact.php
3. Check that all required fields are filled
4. Verify email format is valid

### Issue: Admin pages not loading
**Solution:**
1. Check if you're logged in as admin
2. Verify Firebase configuration is correct
3. Check browser console for auth errors
4. Try logging out and logging back in

---

## Performance Testing

### Page Load Times
Test page load times using browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check "Finish" time (should be < 3 seconds)

### API Response Times
Test API response times:
1. Open DevTools (F12)
2. Go to Network tab
3. Submit contact form
4. Check response time for `contact.php` (should be < 1 second)

---

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Notes

- All fixes have been applied and tested
- No breaking changes were made
- All existing functionality remains intact
- Site is ready for production deployment

---

*Last Updated: April 29, 2026*
