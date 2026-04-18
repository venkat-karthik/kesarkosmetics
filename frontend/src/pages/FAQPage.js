import React, { useState, useRef } from "react";
import { ChevronDown, Sparkles, ShieldCheck, Truck, RefreshCw, CreditCard, Leaf } from "lucide-react";
import Footer from "../components/Footer";

const FAQS = [
  {
    category: "Products & Ingredients",
    icon: Leaf,
    color: "from-green-50 to-emerald-50 border-green-200",
    iconColor: "text-green-600",
    items: [
      {
        q: "Are your products 100% natural and free from harmful chemicals?",
        a: "Yes. All Kesar Kosmetics products are formulated with natural, plant-based ingredients. We never use parabens, sulfates, artificial fragrances, or synthetic preservatives. Every ingredient is carefully selected for safety and efficacy.",
      },
      {
        q: "Are your products dermatologist tested?",
        a: "Our formulations are developed with dermatological guidance and tested for skin compatibility. They are suitable for all skin types including sensitive skin. We always recommend a patch test before first use.",
      },
      {
        q: "Do your products contain saffron?",
        a: "Yes — saffron is our hero ingredient. We source premium Kashmiri saffron (Crocus sativus) known for its high crocin content, which delivers brightening, antioxidant, and anti-inflammatory benefits to the skin.",
      },
      {
        q: "Are your products vegan and cruelty-free?",
        a: "Absolutely. We do not test on animals at any stage of production, and our products contain no animal-derived ingredients. We are committed to ethical, cruelty-free beauty.",
      },
      {
        q: "What is the shelf life of your products?",
        a: "Most of our products have a shelf life of 12–24 months from the date of manufacture. The best-before date is printed on each product. Once opened, we recommend using within 6–12 months for best results.",
      },
    ],
  },
  {
    category: "Skincare & Usage",
    icon: Sparkles,
    color: "from-orange-50 to-amber-50 border-orange-200",
    iconColor: "text-[#D97736]",
    items: [
      {
        q: "How long does it take to see results?",
        a: "Visible results typically appear within 2–4 weeks of consistent daily use. Skin brightening and hydration improvements are often noticed within the first week. For concerns like pigmentation or uneven tone, allow 4–8 weeks for significant improvement.",
      },
      {
        q: "Can I use your products during pregnancy?",
        a: "While our products use natural ingredients, we recommend consulting your dermatologist or OB-GYN before introducing any new skincare product during pregnancy or breastfeeding, as individual sensitivities can vary.",
      },
      {
        q: "How should I store my skincare products?",
        a: "Store products in a cool, dry place away from direct sunlight and heat. Avoid keeping them in humid environments like bathrooms. Proper storage ensures the active ingredients remain potent throughout the product's shelf life.",
      },
      {
        q: "Can I use multiple Kesar Kosmetics products together?",
        a: "Yes, our products are designed to complement each other. A typical routine would be: cleanser → toner → serum → moisturiser → SPF (morning). All products are formulated to work synergistically without causing irritation.",
      },
      {
        q: "Is the saffron cream suitable for oily skin?",
        a: "Yes. Our saffron cream has a lightweight, non-greasy formula that absorbs quickly. It provides hydration without clogging pores, making it suitable for oily and combination skin types as well.",
      },
    ],
  },
  {
    category: "Orders & Shipping",
    icon: Truck,
    color: "from-blue-50 to-cyan-50 border-blue-200",
    iconColor: "text-blue-600",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery across India takes 4–7 business days. Express delivery (2–3 business days) is available at checkout for an additional charge. International orders typically take 10–15 business days.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free standard shipping on all orders above ₹2,000. Orders below this amount are subject to a flat shipping fee of ₹100.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely. Once your order is shipped, you'll receive a tracking ID via email. You can also track your order anytime on our Track Order page using your order ID, email, or phone number.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship to select international destinations including the UAE, USA, UK, Canada, Singapore, Malaysia, and Saudi Arabia. International shipping charges and delivery times vary by location.",
      },
      {
        q: "What happens if my order is delayed?",
        a: "If your order hasn't arrived within the estimated delivery window, please contact us at kesarkosmetics@gmail.com with your order ID. We'll investigate immediately and ensure resolution within 48 hours.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    icon: RefreshCw,
    color: "from-purple-50 to-pink-50 border-purple-200",
    iconColor: "text-purple-600",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for unused, unopened products in their original packaging. If you received a damaged or defective product, contact us within 48 hours with photos and we'll arrange a replacement or full refund.",
      },
      {
        q: "How do I initiate a return?",
        a: "Email us at kesarkosmetics@gmail.com with your order number and reason for return. We'll respond within 24 hours with a return shipping label and instructions. Once we receive and inspect the item, your refund will be processed within 5–7 business days.",
      },
      {
        q: "Can I exchange a product?",
        a: "Yes, exchanges are available for unopened products within 7 days of delivery. Contact our support team to initiate an exchange. Please note that shipping charges for exchanges are borne by the customer unless the product was defective.",
      },
      {
        q: "When will I receive my refund?",
        a: "Approved refunds are processed within 5–7 business days to your original payment method. For UPI and card payments, the amount typically reflects within 3–5 working days after processing. COD refunds are issued via bank transfer.",
      },
    ],
  },
  {
    category: "Payments & Security",
    icon: CreditCard,
    color: "from-yellow-50 to-orange-50 border-yellow-200",
    iconColor: "text-yellow-600",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major payment methods: Credit/Debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery for eligible pin codes.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All online payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details on our servers. All transactions are encrypted with 256-bit SSL security.",
      },
      {
        q: "Can I use a coupon code?",
        a: "Yes! Enter your coupon code at checkout in the promo code field. Current active codes include KESAR10 (10% off), SAVE20 (20% off), and SUMMER5 (5% off). Codes cannot be combined and are subject to terms.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes, COD is available for most pin codes across India. COD orders are confirmed immediately and dispatched within 1–2 business days. Please ensure someone is available at the delivery address to receive and pay for the order.",
      },
    ],
  },
  {
    category: "Brand & Authenticity",
    icon: ShieldCheck,
    color: "from-teal-50 to-green-50 border-teal-200",
    iconColor: "text-teal-600",
    items: [
      {
        q: "How do I know your saffron is authentic?",
        a: "We source our saffron directly from certified farms in Kashmir, India — the world's finest saffron-growing region. Each batch is tested for purity, crocin content, and aroma. We provide full traceability from farm to product.",
      },
      {
        q: "Where are your products manufactured?",
        a: "All Kesar Kosmetics products are manufactured in India in GMP-certified facilities. We follow strict quality control protocols at every stage — from raw material sourcing to final packaging.",
      },
      {
        q: "Are your products approved by regulatory authorities?",
        a: "Yes. Our products comply with all applicable Indian cosmetic regulations under the Drugs and Cosmetics Act. They are registered with the relevant authorities and meet all safety and labelling requirements.",
      },
      {
        q: "How can I verify I'm buying an authentic Kesar Kosmetics product?",
        a: "Purchase only from our official website (kesarkosmetics.com) or authorised retail partners. Each product has a unique batch code and holographic seal. If you suspect a counterfeit, contact us immediately at kesarkosmetics@gmail.com.",
      },
    ],
  },
];

const FAQItem = ({ item, isOpen, onToggle }) => {
  const contentRef = useRef(null);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? "border-[#D97736] shadow-md" : "border-[#E0D8C8]"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-[#FAF7F2] transition-colors"
      >
        <span className={`font-semibold text-sm sm:text-base leading-snug transition-colors ${isOpen ? "text-[#D97736]" : "text-[#3E2723]"}`}>
          {item.q}
        </span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#D97736]" : "text-[#8A7768]"}`} />
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: isOpen ? contentRef.current?.scrollHeight + "px" : "0px" }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="px-6 pb-5 pt-1 text-sm text-[#5D4037] leading-relaxed bg-white border-t border-[#F0E7DA]">
          {item.a}
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const [openItem, setOpenItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const toggle = (key) => setOpenItem(prev => prev === key ? null : key);

  const filtered = activeCategory ? FAQS.filter(f => f.category === activeCategory) : FAQS;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 md:py-36 bg-gradient-to-br from-[#3E2723] via-[#5D4037] to-[#8B4513] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-[#D97736]"
              style={{ width: Math.random() * 80 + 20, height: Math.random() * 80 + 20, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 + 0.1 }} />
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-[#F5A800]" />
            Frequently Asked Questions
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Everything You Need to Know
          </h1>
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            Find answers to the most common questions about our products, orders, and brand.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-0 z-20 bg-white border-b border-[#E0D8C8] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${!activeCategory ? "bg-[#D97736] text-white" : "bg-[#F5EEE6] text-[#5D4037] hover:bg-[#EFE9DF]"}`}
          >
            All Topics
          </button>
          {FAQS.map(f => {
            const Icon = f.icon;
            return (
              <button key={f.category} onClick={() => setActiveCategory(f.category === activeCategory ? null : f.category)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === f.category ? "bg-[#D97736] text-white" : "bg-[#F5EEE6] text-[#5D4037] hover:bg-[#EFE9DF]"}`}>
                <Icon className="w-3.5 h-3.5" />
                {f.category}
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {filtered.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.category}
                className="animate-[fadeInUp_0.4s_ease-out]"
              >
                <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${section.color} border rounded-2xl px-5 py-3 mb-6`}>
                  <Icon className={`w-5 h-5 ${section.iconColor}`} />
                  <h2 className="font-heading text-lg font-bold text-[#3E2723]">{section.category}</h2>
                  <span className="text-xs font-semibold text-[#8A7768] bg-white/60 px-2 py-0.5 rounded-full">{section.items.length}</span>
                </div>
                <div className="space-y-3">
                  {section.items.map((item, i) => {
                    const key = `${section.category}-${i}`;
                    return (
                      <FAQItem key={key} item={item} isOpen={openItem === key} onToggle={() => toggle(key)} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">Still have questions?</h2>
          <p className="text-white/80 mb-8 text-lg">Our team is here to help. Reach out and we'll get back to you within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact-us"
              className="inline-flex items-center justify-center gap-2 bg-[#D97736] hover:bg-[#C96626] text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
              Contact Us
            </a>
            <a href="mailto:kesarkosmetics@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full transition-all">
              kesarkosmetics@gmail.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
