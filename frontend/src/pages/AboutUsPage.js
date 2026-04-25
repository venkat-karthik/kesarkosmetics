import React from "react";
import { Link } from "react-router-dom";
import { Heart, Leaf, Award, MapPin, Sparkles, ShieldCheck, FlaskConical, Users } from "lucide-react";
import Footer from "../components/Footer";

const AboutUsPage = () => {
	return (
		<div className="min-h-screen bg-[#FAF7F2]">

			{/* ── Hero ─────────────────────────────────────── */}
			<section className="relative overflow-hidden bg-gradient-to-br from-[#2D0F00] via-[#4A1A00] to-[#3E2723] text-white">
				{/* Decorative saffron glow */}
				<div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#F5A800]/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-[#E8620A]/10 blur-3xl pointer-events-none" />

				<div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36 text-center">
					<p className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-[#F5A800] bg-[#F5A800]/10 border border-[#F5A800]/25 rounded-full px-5 py-2 mb-6">
						Our Story
					</p>
					<h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
						Born in the Saffron Fields<br />
						<span className="text-[#F5A800]">of Kashmir</span>
					</h1>
					<p className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
						Kesar Kosmetics brings you the purest Kashmiri saffron and handcrafted beauty rituals — rooted in centuries of tradition, refined for the modern world.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							to="/products"
							className="inline-flex items-center gap-2 bg-[#E8620A] hover:bg-[#C8380A] text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
						>
							Explore Our Collection
						</Link>
						<Link
							to="/contact-us"
							className="inline-flex items-center gap-2 border border-white/30 hover:border-[#F5A800] text-white/80 hover:text-[#F5A800] font-semibold px-8 py-3.5 rounded-full transition-all"
						>
							Get in Touch
						</Link>
					</div>
				</div>
			</section>

			{/* ── Origin Story ─────────────────────────────── */}
			<section className="py-16 sm:py-24">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
						{/* Text */}
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D97736] mb-4">Where It All Began</p>
							<h2 className="font-heading text-3xl sm:text-4xl text-[#3E2723] leading-snug mb-6">
								From the Heart of Pampore to Your Doorstep
							</h2>
							<div className="space-y-5 text-[#5D4037] text-base leading-relaxed">
								<p>
									Nestled in the Karewa fields of Pampore, Jammu & Kashmir — the saffron capital of India — Kesar Kosmetics was born from a deep reverence for nature's most precious spice. At 2,200 metres above sea level, our saffron is hand-harvested at dawn, petal by petal, just as it has been for over 3,000 years.
								</p>
								<p>
									We started with a single belief: that the finest ingredients, handled with care and honesty, create products that truly work. No shortcuts. No synthetics. Just the real thing — the <em>Red Gold of India</em>.
								</p>
								<p>
									Today, Kesar Kosmetics offers a curated range of saffron-infused skincare, wellness products, and beauty rituals — each one crafted in small batches to preserve potency, freshness, and the soul of Kashmir.
								</p>
							</div>
							<div className="mt-8 flex items-center gap-3 text-sm text-[#8A7768]">
								<MapPin className="w-4 h-4 text-[#D97736] shrink-0" />
								<span>Befina Pampore, Near Govt Middle School, Pampore – 192121, J&K, India</span>
							</div>
						</div>

						{/* Stats card */}
						<div className="grid grid-cols-2 gap-4">
							{[
								{ value: "3,000+", label: "Years of Saffron Heritage", icon: "🌸" },
								{ value: "75,000", label: "Flowers per Pound of Saffron", icon: "🌺" },
								{ value: "100%", label: "Natural & Chemical-Free", icon: "🌿" },
								{ value: "2,200m", label: "Altitude — Pampore, Kashmir", icon: "🏔️" },
							].map((stat) => (
								<div
									key={stat.label}
									className="bg-white rounded-2xl border border-[#E9E0D2] p-6 text-center shadow-sm hover:shadow-md transition-shadow"
								>
									<div className="text-3xl mb-2">{stat.icon}</div>
									<p className="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723]">{stat.value}</p>
									<p className="mt-1 text-xs text-[#8A7768] leading-snug">{stat.label}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── What Makes Us Different ───────────────────── */}
			<section className="py-16 sm:py-24 bg-white">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-14">
						<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D97736] mb-3">Our Difference</p>
						<h2 className="font-heading text-3xl sm:text-4xl text-[#3E2723]">Crafted with Intention, Not Compromise</h2>
						<p className="mt-4 text-[#6B5B52] max-w-xl mx-auto text-base leading-relaxed">
							Every product we make starts with a question: would we use this ourselves? If the answer isn't an immediate yes, it doesn't leave our workshop.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{[
							{
								icon: Leaf,
								title: "100% Natural Ingredients",
								desc: "No parabens, no sulfates, no synthetic fragrances. Every ingredient is chosen for its purity and efficacy — nothing more, nothing less.",
							},
							{
								icon: FlaskConical,
								title: "Small-Batch Crafted",
								desc: "We produce in small batches to ensure maximum freshness and potency. Each jar is made to order, not sitting in a warehouse for months.",
							},
							{
								icon: ShieldCheck,
								title: "Dermatologist Tested",
								desc: "Our formulations are tested and verified for safety. GMP-certified manufacturing ensures every product meets the highest quality standards.",
							},
							{
								icon: Heart,
								title: "Cruelty-Free & Vegan",
								desc: "We never test on animals and use no animal-derived ingredients. Beauty should never come at the cost of another living being.",
							},
							{
								icon: Sparkles,
								title: "Saffron at the Core",
								desc: "Kashmiri saffron is rich in crocin, safranal, and picrocrocin — powerful antioxidants that brighten, protect, and rejuvenate skin naturally.",
							},
							{
								icon: Award,
								title: "Ethically Sourced",
								desc: "We work directly with saffron farmers in Pampore, ensuring fair wages and sustainable harvesting practices that protect the land for generations.",
							},
						].map(({ icon: Icon, title, desc }) => (
							<div
								key={title}
								className="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 hover:shadow-md transition-shadow"
							>
								<div className="w-11 h-11 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-5">
									<Icon className="w-5 h-5 text-[#D97736]" />
								</div>
								<h3 className="font-semibold text-[#3E2723] text-lg mb-2">{title}</h3>
								<p className="text-[#6B5B52] text-sm leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── The Saffron Journey ───────────────────────── */}
			<section className="py-16 sm:py-24 bg-gradient-to-b from-[#FAF7F2] to-[#FFF3E0]">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-14">
						<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D97736] mb-3">From Field to Skin</p>
						<h2 className="font-heading text-3xl sm:text-4xl text-[#3E2723]">The Journey of Kashmiri Saffron</h2>
					</div>

					<div className="relative">
						{/* Connecting line */}
						<div className="hidden sm:block absolute top-8 left-[calc(10%+1rem)] right-[calc(10%+1rem)] h-0.5 bg-gradient-to-r from-[#E9E0D2] via-[#D97736] to-[#E9E0D2]" />

						<div className="grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-4">
							{[
								{ step: "01", emoji: "🌸", title: "Harvest at Dawn", desc: "Crocus sativus flowers bloom for just one week a year. Farmers hand-pick each flower before sunrise to preserve the delicate stigmas." },
								{ step: "02", emoji: "✋", title: "Hand-Separated", desc: "Each flower yields only three crimson stigmas. Skilled hands separate them with care — 75,000 flowers for a single pound of saffron." },
								{ step: "03", emoji: "🔥", title: "Gently Dried", desc: "Stigmas are dried over low heat to lock in crocin, safranal, and picrocrocin — the compounds responsible for colour, aroma, and potency." },
								{ step: "04", emoji: "✨", title: "Into Your Ritual", desc: "Pure saffron is blended into our formulations in precise concentrations to deliver visible brightening and anti-ageing benefits." },
							].map(({ step, emoji, title, desc }) => (
								<div key={step} className="flex flex-col items-center text-center">
									<div className="relative z-10 w-16 h-16 rounded-full bg-white border-2 border-[#D97736] flex items-center justify-center text-2xl shadow-sm mb-5">
										{emoji}
									</div>
									<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D97736] mb-1">{step}</p>
									<h4 className="font-semibold text-[#3E2723] mb-2">{title}</h4>
									<p className="text-xs text-[#6B5B52] leading-relaxed">{desc}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── Our Mission ──────────────────────────────── */}
			<section className="py-16 sm:py-24 bg-[#3E2723] text-white relative overflow-hidden">
				<div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('/background1.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }} />
				<div className="absolute inset-0 bg-gradient-to-br from-[#3E2723]/90 to-[#2D0F00]/95 pointer-events-none" />
				<div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F5A800] mb-4">Our Mission</p>
					<h2 className="font-heading text-3xl sm:text-4xl md:text-5xl leading-snug mb-8">
						To make the world's most precious spice<br />
						<span className="text-[#F5A800]">accessible to every home</span>
					</h2>
					<p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
						We believe luxury shouldn't be a privilege. Kashmiri saffron — once reserved for royalty — deserves a place in every skincare routine, every kitchen, every wellness ritual. We're here to make that happen, honestly and affordably.
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
						{[
							{ icon: "🌱", title: "Sustainability", desc: "We support regenerative farming practices that protect Kashmir's saffron fields for future generations." },
							{ icon: "🤝", title: "Fair Trade", desc: "Direct partnerships with Pampore farmers ensure fair compensation and community development." },
							{ icon: "💛", title: "Transparency", desc: "We share exactly what goes into every product — no hidden ingredients, no greenwashing." },
						].map(({ icon, title, desc }) => (
							<div key={title} className="bg-white/8 border border-white/12 rounded-2xl p-6">
								<div className="text-2xl mb-3">{icon}</div>
								<h4 className="font-semibold text-white mb-2">{title}</h4>
								<p className="text-white/60 text-sm leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Team / Founders ──────────────────────────── */}
			<section className="py-16 sm:py-24 bg-white">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-14">
						<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D97736] mb-3">The People Behind It</p>
						<h2 className="font-heading text-3xl sm:text-4xl text-[#3E2723]">Built by People Who Care</h2>
						<p className="mt-4 text-[#6B5B52] max-w-xl mx-auto text-base leading-relaxed">
							Kesar Kosmetics is a family-rooted brand. We are farmers, formulators, and beauty enthusiasts united by a love for Kashmir and a commitment to honest products.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
						{[
							{
								emoji: "🌸",
								role: "Sourcing & Farming",
								desc: "Our roots are in Pampore. We work hand-in-hand with local saffron farmers who have cultivated these fields for generations, ensuring every harvest is authentic and traceable.",
							},
							{
								emoji: "🧪",
								role: "Formulation & Quality",
								desc: "Our in-house team of formulators blends traditional Ayurvedic wisdom with modern cosmetic science to create products that are both effective and safe for all skin types.",
							},
							{
								emoji: "📦",
								role: "Packaging & Delivery",
								desc: "We believe the unboxing experience matters. Every order is packed with care, using eco-conscious materials, and shipped directly to your door across India.",
							},
						].map(({ emoji, role, desc }) => (
							<div key={role} className="bg-[#FAF7F2] rounded-2xl border border-[#E9E0D2] p-7 text-center">
								<div className="w-16 h-16 rounded-full bg-[#FFF3E0] border-2 border-[#E9E0D2] flex items-center justify-center text-3xl mx-auto mb-5">
									{emoji}
								</div>
								<h4 className="font-semibold text-[#3E2723] text-base mb-3">{role}</h4>
								<p className="text-[#6B5B52] text-sm leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Certifications / Trust ───────────────────── */}
			<section className="py-12 bg-[#FAF7F2] border-y border-[#E9E0D2]">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-[#8A7768] mb-8">Our Commitments</p>
					<div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
						{[
							"🌿 100% Natural",
							"🐰 Cruelty-Free",
							"🌱 Vegan",
							"🏆 GMP Certified",
							"🔬 Dermatologist Tested",
							"📦 Eco-Conscious Packaging",
							"🤝 Fair Trade Sourced",
						].map((badge) => (
							<span
								key={badge}
								className="text-sm font-semibold text-[#5D4037] bg-white border border-[#E9E0D2] rounded-full px-5 py-2 shadow-sm"
							>
								{badge}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ──────────────────────────────────────── */}
			<section className="py-20 sm:py-28 bg-gradient-to-br from-[#E8620A] to-[#D97736] text-white text-center relative overflow-hidden">
				<div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
				<div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70 mb-4">Ready to Experience It?</p>
					<h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-snug">
						Discover the Power of<br />Kashmiri Saffron
					</h2>
					<p className="text-white/80 text-base sm:text-lg mb-10 leading-relaxed">
						From brightening serums to nourishing creams — every product is a piece of Kashmir, made for you.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							to="/products"
							className="inline-flex items-center gap-2 bg-white text-[#D97736] font-bold px-8 py-3.5 rounded-full hover:bg-[#FFF8EC] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
						>
							Shop the Collection
						</Link>
						<Link
							to="/contact-us"
							className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-semibold px-8 py-3.5 rounded-full transition-all"
						>
							Talk to Us
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default AboutUsPage;
