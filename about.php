<?php
$pageTitle = 'About Us — Kesar Kosmetics';
$cssPath = 'css/style.css';
$currentPage = 'about.php';
include 'includes/head.php';
include 'includes/header.php';
?>

<div class="min-h-screen bg-[#FAF7F2]">

  <!-- Hero -->
  <section class="relative overflow-hidden bg-gradient-to-br from-[#2D0F00] via-[#4A1A00] to-[#3E2723] text-white">
    <div class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#F5A800]/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-[#E8620A]/10 blur-3xl pointer-events-none"></div>
    <div class="container relative py-20 sm:py-28 md:py-36 text-center">
      <p class="badge badge-gold mb-6">Our Story</p>
      <h1 class="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
        Born in the Saffron Fields <span class="text-[#F5A800]">of Kashmir</span>
      </h1>
      <p class="text-sm sm:text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10">
        Kesar Kosmetics brings you the purest Kashmiri saffron and handcrafted beauty rituals — rooted in centuries of tradition, refined for the modern world.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <a href="products.php" class="btn btn-primary w-full sm:w-auto justify-center">Explore Our Collection</a>
        <a href="contact.php" class="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-[#F5A800] text-white/80 hover:text-[#F5A800] font-semibold px-8 py-3.5 rounded-full transition-all w-full sm:w-auto">Get in Touch</a>
      </div>
    </div>
  </section>

  <!-- Origin Story -->
  <section class="py-16 sm:py-24">
    <div class="container">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <p class="section-label mb-4">Where It All Began</p>
          <h2 class="font-heading text-3xl sm:text-4xl text-[#3E2723] leading-snug mb-6">From the Heart of Pampore to Your Doorstep</h2>
          <div class="space-y-5 text-[#5D4037] text-base leading-relaxed">
            <p>Nestled in the Karewa fields of Pampore, Jammu & Kashmir — the saffron capital of India — Kesar Kosmetics was born from a deep reverence for nature's most precious spice. At 2,200 metres above sea level, our saffron is hand-harvested at dawn, petal by petal, just as it has been for over 3,000 years.</p>
            <p>We started with a single belief: that the finest ingredients, handled with care and honesty, create products that truly work. No shortcuts. No synthetics. Just the real thing — the <em>Red Gold of India</em>.</p>
            <p>Today, Kesar Kosmetics offers a curated range of saffron-infused skincare, wellness products, and beauty rituals — each one crafted in small batches to preserve potency, freshness, and the soul of Kashmir.</p>
          </div>
          <div class="mt-8 flex items-center gap-3 text-sm text-[#8A7768]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-[#D97736] shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
            <span>Befina Pampore, Near Govt Middle School, Pampore – 192121, J&K, India</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <?php foreach ([['3,000+','Years of Saffron Heritage','🌸'],['75,000','Flowers per Pound of Saffron','🌺'],['100%','Natural & Chemical-Free','🌿'],['2,200m','Altitude — Pampore, Kashmir','🏔️']] as [$val,$label,$emoji]): ?>
          <div class="card p-6 text-center hover:shadow-md transition-shadow">
            <div class="text-3xl mb-2"><?= $emoji ?></div>
            <p class="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723]"><?= $val ?></p>
            <p class="mt-1 text-xs text-[#8A7768] leading-snug"><?= $label ?></p>
          </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </section>

  <!-- What Makes Us Different -->
  <section class="py-16 sm:py-24 bg-white">
    <div class="container">
      <div class="text-center mb-14">
        <p class="section-label mb-3">Our Difference</p>
        <h2 class="font-heading text-3xl sm:text-4xl text-[#3E2723]">Crafted with Intention, Not Compromise</h2>
        <p class="mt-4 text-[#6B5B52] max-w-xl mx-auto text-base leading-relaxed">Every product we make starts with a question: would we use this ourselves? If the answer isn't an immediate yes, it doesn't leave our workshop.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php
        $features = [
          ['100% Natural Ingredients','No parabens, no sulfates, no synthetic fragrances. Every ingredient is chosen for its purity and efficacy.'],
          ['Small-Batch Crafted','We produce in small batches to ensure maximum freshness and potency. Each jar is made to order.'],
          ['Dermatologist Tested','Our formulations are tested and verified for safety. GMP-certified manufacturing ensures quality.'],
          ['Cruelty-Free & Vegan','We never test on animals and use no animal-derived ingredients.'],
          ['Saffron at the Core','Kashmiri saffron is rich in crocin, safranal, and picrocrocin — powerful antioxidants.'],
          ['Ethically Sourced','We work directly with saffron farmers in Pampore, ensuring fair wages and sustainable harvesting.'],
        ];
        foreach ($features as [$title,$desc]): ?>
        <div class="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          </div>
          <h3 class="font-semibold text-[#3E2723] text-lg mb-2"><?= $title ?></h3>
          <p class="text-[#6B5B52] text-sm leading-relaxed"><?= $desc ?></p>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- Mission -->
  <section class="py-16 sm:py-24 bg-[#3E2723] text-white relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#3E2723]/90 to-[#2D0F00]/95 pointer-events-none"></div>
    <div class="container relative text-center">
      <p class="section-label text-[#F5A800] mb-4">Our Mission</p>
      <h2 class="font-heading text-3xl sm:text-4xl md:text-5xl leading-snug mb-8">
        To make the world's most precious spice <span class="text-[#F5A800]">accessible to every home</span>
      </h2>
      <p class="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
        We believe luxury shouldn't be a privilege. Kashmiri saffron — once reserved for royalty — deserves a place in every skincare routine, every kitchen, every wellness ritual.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
        <?php foreach ([['🌱','Sustainability','We support regenerative farming practices that protect Kashmir\'s saffron fields for future generations.'],['🤝','Fair Trade','Direct partnerships with Pampore farmers ensure fair compensation and community development.'],['💛','Transparency','We share exactly what goes into every product — no hidden ingredients, no greenwashing.']] as [$emoji,$title,$desc]): ?>
        <div class="bg-white/8 border border-white/12 rounded-2xl p-6">
          <div class="text-2xl mb-3"><?= $emoji ?></div>
          <h4 class="font-semibold text-white mb-2"><?= $title ?></h4>
          <p class="text-white/60 text-sm leading-relaxed"><?= $desc ?></p>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20 sm:py-28 bg-gradient-to-br from-[#E8620A] to-[#D97736] text-white text-center relative overflow-hidden">
    <div class="container relative">
      <p class="text-xs font-bold uppercase tracking-[.28em] text-white/70 mb-4">Ready to Experience It?</p>
      <h2 class="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-snug">Discover the Power of Kashmiri Saffron</h2>
      <p class="text-white/80 text-base sm:text-lg mb-10 leading-relaxed max-w-xl mx-auto">From brightening serums to nourishing creams — every product is a piece of Kashmir, made for you.</p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <a href="products.php" class="inline-flex items-center gap-2 bg-white text-[#D97736] font-bold px-8 py-3.5 rounded-full hover:bg-[#FFF8EC] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto justify-center">Shop the Collection</a>
        <a href="contact.php" class="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-3.5 rounded-full transition-all w-full sm:w-auto justify-center">Talk to Us</a>
      </div>
    </div>
  </section>

</div>

<?php include 'includes/footer.php'; ?>
<?php include 'includes/scripts.php'; ?>
</body>
</html>
