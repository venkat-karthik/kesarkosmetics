<?php
$pageTitle = 'FAQ — Kesar Kosmetics';
$cssPath = 'css/style.css';
$currentPage = 'faq.php';
include 'includes/head.php';
include 'includes/header.php';

$faqs = [
  ['Products & Ingredients', [
    ['Are your products 100% natural?', 'Yes. All Kesar Kosmetics products are formulated with natural, plant-based ingredients. We never use parabens, sulfates, artificial fragrances, or synthetic preservatives.'],
    ['Are your products dermatologist tested?', 'Our formulations are developed with dermatological guidance and tested for skin compatibility. They are suitable for all skin types including sensitive skin.'],
    ['Do your products contain saffron?', 'Yes — saffron is our hero ingredient. We source premium Kashmiri saffron (Crocus sativus) known for its high crocin content, which delivers brightening, antioxidant, and anti-inflammatory benefits.'],
    ['Are your products vegan and cruelty-free?', 'Absolutely. We do not test on animals at any stage of production, and our products contain no animal-derived ingredients.'],
    ['What is the shelf life of your products?', 'Most of our products have a shelf life of 12–24 months from the date of manufacture. Once opened, we recommend using within 6–12 months for best results.'],
  ]],
  ['Orders & Shipping', [
    ['How long does delivery take?', 'Standard delivery across India takes 4–7 business days. Express delivery (2–3 business days) is available at checkout for an additional charge.'],
    ['Do you offer free shipping?', 'Yes! We offer free standard shipping on all orders above ₹2,000. Orders below this amount are subject to a flat shipping fee of ₹100.'],
    ['Can I track my order?', 'Absolutely. Once your order is shipped, you\'ll receive a tracking ID via email. You can also track your order anytime on our Track Order page.'],
    ['Do you ship internationally?', 'Yes, we ship to select international destinations including the UAE, USA, UK, Canada, Singapore, Malaysia, and Saudi Arabia.'],
  ]],
  ['Returns & Refunds', [
    ['What is your return policy?', 'We accept returns within 7 days of delivery for unused, unopened products in their original packaging. If you received a damaged or defective product, contact us within 48 hours with photos.'],
    ['How do I initiate a return?', 'Email us at kesarkosmetics@gmail.com with your order number and reason for return. We\'ll respond within 24 hours with instructions.'],
    ['When will I receive my refund?', 'Approved refunds are processed within 5–7 business days to your original payment method.'],
  ]],
  ['Payments & Security', [
    ['What payment methods do you accept?', 'We accept all major payment methods: Credit/Debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery.'],
    ['Is my payment information secure?', 'Yes. All online payments are processed through Razorpay, a PCI-DSS compliant payment gateway. All transactions are encrypted with 256-bit SSL security.'],
    ['Can I use a coupon code?', 'Yes! Enter your coupon code at checkout. Current active codes include KESAR10 (10% off), SAVE20 (20% off), and SUMMER5 (5% off).'],
  ]],
];
?>

<div class="min-h-screen bg-[#FAF7F2]">

  <!-- Hero -->
  <section class="relative py-20 sm:py-28 md:py-36 bg-gradient-to-br from-[#3E2723] via-[#5D4037] to-[#8B4513] text-white overflow-hidden">
    <div class="container relative text-center">
      <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#F5A800]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"/></svg>
        Frequently Asked Questions
      </div>
      <h1 class="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">Everything You Need to Know</h1>
      <p class="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">Find answers to the most common questions about our products, orders, and brand.</p>
    </div>
  </section>

  <!-- FAQ Content -->
  <section class="py-16 sm:py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <?php foreach ($faqs as [$category, $items]): ?>
      <div>
        <div class="inline-flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl px-5 py-3 mb-6">
          <h2 class="font-heading text-lg font-bold text-[#3E2723]"><?= htmlspecialchars($category) ?></h2>
          <span class="text-xs font-semibold text-[#8A7768] bg-white/60 px-2 py-0.5 rounded-full"><?= count($items) ?></span>
        </div>
        <div class="space-y-3">
          <?php foreach ($items as $i => [$q, $a]): ?>
          <div class="faq-item border rounded-2xl overflow-hidden transition-all duration-300 border-[#E0D8C8]">
            <button type="button" onclick="toggleFaq(this)" class="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-[#FAF7F2] transition-colors">
              <span class="font-semibold text-sm sm:text-base leading-snug text-[#3E2723]"><?= htmlspecialchars($q) ?></span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0 transition-transform duration-300 text-[#8A7768] faq-chevron" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
            </button>
            <div class="faq-answer hidden px-6 pb-5 pt-1 text-sm text-[#5D4037] leading-relaxed bg-white border-t border-[#F0E7DA]">
              <?= htmlspecialchars($a) ?>
            </div>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </section>

  <!-- Still have questions -->
  <section class="py-16 bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-white">
    <div class="max-w-2xl mx-auto px-4 text-center">
      <h2 class="font-heading text-3xl sm:text-4xl font-bold mb-4">Still have questions?</h2>
      <p class="text-white/80 mb-8 text-lg">Our team is here to help. Reach out and we'll get back to you within 24 hours.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="contact.php" class="btn btn-primary justify-center">Contact Us</a>
        <a href="mailto:kesarkosmetics@gmail.com" class="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full transition-all">kesarkosmetics@gmail.com</a>
      </div>
    </div>
  </section>

</div>

<?php include 'includes/footer.php'; ?>

<script>
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const chevron = btn.querySelector('.faq-chevron');
  const isOpen = !answer.classList.contains('hidden');
  // Close all
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
  document.querySelectorAll('.faq-chevron').forEach(c => { c.style.transform = ''; });
  document.querySelectorAll('.faq-item').forEach(i => { i.style.borderColor = '#E0D8C8'; });
  if (!isOpen) {
    answer.classList.remove('hidden');
    chevron.style.transform = 'rotate(180deg)';
    item.style.borderColor = '#D97736';
  }
}
</script>

<?php include 'includes/scripts.php'; ?>
</body>
</html>
