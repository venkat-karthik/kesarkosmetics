<?php
$pageTitle = 'Contact Us — Kesar Kosmetics';
$cssPath = 'css/style.css';
$currentPage = 'contact.php';
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-[#FAF7F2]">

  <!-- Hero -->
  <section class="page-hero">
    <div class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#F5A800]/10 blur-3xl pointer-events-none"></div>
    <div class="container relative">
      <p class="badge badge-gold mb-6">We're Here for You</p>
      <h1>Get in <span class="text-[#F5A800]">Touch</span></h1>
      <p class="mt-4">Questions about an order, a product, or just want to say hello? We'd love to hear from you.</p>
    </div>
  </section>

  <section class="py-14 sm:py-20">
    <div class="container">

      <!-- Quick contact cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        <?php
        $cards = [
          ['Mail','Email Us','kesarkosmetics@gmail.com','We reply within 24 hours','mailto:kesarkosmetics@gmail.com'],
          ['Phone','Call Us','+91 98415 24064','Mon–Sat, 9 AM – 6 PM IST','tel:+919841524064'],
          ['MapPin','Head Office','Pampore, J&K','Befina Pampore – 192121',null],
          ['Clock','Business Hours','Mon–Fri: 9 AM – 6 PM','Sat: 10 AM – 4 PM · Sun: Online only',null],
        ];
        foreach ($cards as [$icon,$label,$value,$sub,$href]): ?>
        <div class="card p-6">
          <div class="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <?php if ($icon==='Mail'): ?><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
              <?php elseif ($icon==='Phone'): ?><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/>
              <?php elseif ($icon==='MapPin'): ?><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
              <?php else: ?><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              <?php endif; ?>
            </svg>
          </div>
          <p class="text-xs font-bold uppercase tracking-[.2em] text-[#8A7768] mb-1"><?= $label ?></p>
          <?php if ($href): ?>
          <a href="<?= $href ?>" class="font-semibold text-[#3E2723] hover:text-[#D97736] transition-colors text-sm leading-snug block"><?= htmlspecialchars($value) ?></a>
          <?php else: ?>
          <p class="font-semibold text-[#3E2723] text-sm leading-snug"><?= htmlspecialchars($value) ?></p>
          <?php endif; ?>
          <p class="mt-1 text-xs text-[#8A7768] leading-snug"><?= htmlspecialchars($sub) ?></p>
        </div>
        <?php endforeach; ?>
      </div>

      <!-- Form + info -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

        <!-- Contact form -->
        <div class="bg-white rounded-3xl border-2 border-[#E9E0D2] p-7 sm:p-10 shadow-sm">
          <p class="section-label mb-2">Send a Message</p>
          <h2 class="font-heading text-3xl text-[#3E2723] mb-7">How can we help?</h2>

          <div id="form-success" class="hidden" style="display:none">
            <div class="flex flex-col items-center justify-center py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
              <h3 class="font-heading text-2xl text-[#3E2723] mb-2">Message Sent!</h3>
              <p class="text-[#6B5B52]">Thank you for reaching out. We'll get back to you within 24 hours.</p>
            </div>
          </div>

          <form id="contact-form" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="form-group"><label class="form-label">Full Name *</label><input type="text" name="name" class="form-input" placeholder="Your name" required /></div>
              <div class="form-group"><label class="form-label">Email Address *</label><input type="email" name="email" class="form-input" placeholder="your@email.com" required /></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="form-group"><label class="form-label">Phone Number</label><input type="tel" name="phone" class="form-input" placeholder="+91 98765 43210" /></div>
              <div class="form-group"><label class="form-label">Subject *</label><input type="text" name="subject" class="form-input" placeholder="What's this about?" required /></div>
            </div>
            <div class="form-group"><label class="form-label">Message *</label><textarea name="message" class="form-input" rows="6" placeholder="Tell us how we can help you…" required></textarea></div>
            <button type="submit" id="contact-submit" class="btn btn-primary w-full justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/></svg>
              Send Message
            </button>
          </form>
        </div>

        <!-- Right info -->
        <div class="space-y-5">
          <div class="card p-6">
            <p class="text-xs font-bold uppercase tracking-[.2em] text-[#D97736] mb-4">Our Offices</p>
            <div class="space-y-4 text-sm text-[#6B5B52]">
              <div><p class="font-semibold text-[#3E2723]">Head Office — Kashmir</p><p class="mt-0.5 leading-relaxed">Befina Pampore, Near Govt Middle School<br/>Pampore – 192121, J&K, India</p></div>
              <hr class="border-[#F0E7DA]" />
              <div><p class="font-semibold text-[#3E2723]">Branch Office — Chennai</p><p class="mt-0.5 leading-relaxed">19, Valliammal Road, Vepery<br/>Chennai – 600007, Tamil Nadu, India</p></div>
            </div>
          </div>
          <div class="card p-6">
            <p class="text-xs font-bold uppercase tracking-[.2em] text-[#D97736] mb-4">Common Topics</p>
            <div class="flex flex-wrap gap-2">
              <?php foreach (['Order tracking','Returns & refunds','Product enquiry','Bulk orders','Wholesale','Skincare advice','Gifting','Careers'] as $t): ?>
              <span class="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full"><?= $t ?></span>
              <?php endforeach; ?>
            </div>
          </div>
          <div class="bg-gradient-to-br from-[#2D0F00] to-[#4A1A00] rounded-2xl p-6 text-white">
            <p class="text-xs font-bold uppercase tracking-[.2em] text-[#F5A800] mb-3">Follow Us</p>
            <p class="text-sm text-white/70 mb-4 leading-relaxed">Stay connected for new products, saffron stories, and wellness tips.</p>
            <div class="flex items-center gap-3">
              <a href="https://instagram.com/kesarkosmetics" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://facebook.com/kesarkosmetics" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

</div>

<?php include 'includes/footer.php'; ?>

<script type="module">
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('contact-submit');
  btn.disabled = true; btn.textContent = 'Sending…';

  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const res = await fetch('api/contact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      // Fade out form
      form.style.opacity = '0';
      form.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        form.classList.add('hidden');
        const successEl = document.getElementById('form-success');
        successEl.style.display = 'block';
        successEl.style.opacity = '0';
        successEl.style.transition = 'opacity 0.5s ease-in';
        // Trigger reflow to enable transition
        void successEl.offsetHeight;
        successEl.style.opacity = '1';
      }, 300);
      showToast("Message sent! We'll get back to you soon.", 'success');
    } else {
      throw new Error('Server error');
    }
  } catch {
    // Fallback: open email client
    const subject = encodeURIComponent(data.subject || 'Contact Form Enquiry');
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone||'N/A'}\n\nMessage:\n${data.message}`);
    window.location.href = `mailto:kesarkosmetics@gmail.com?subject=${subject}&body=${body}`;
    showToast('Your email client has been opened.', 'success');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/></svg> Send Message`;
  }
});
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
