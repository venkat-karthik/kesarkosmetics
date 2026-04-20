import React from "react";
import { Link } from "react-router-dom";
import { Heart, Leaf, Award } from "lucide-react";
import Footer from "../components/Footer";

const AboutUsPage = () => {
	return (
		<div className="min-h-screen bg-[#FAF7F2]">
			{/* Hero Section */}
			<section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-[#3E2723] to-[#5D4037] text-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6">About NEI Native</h1>
					<p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-8">
						Crafting authentic, handmade natural products with devotion and purity
					</p>
				</div>
			</section>

			{/* Our Story Section */}
			<section className="py-16 sm:py-20 md:py-24">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3E2723] mb-8 text-center">Our Story</h2>
					<div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-[#E0D8C8]">
						<p className="text-[#5D4037] text-lg leading-relaxed mb-6">
							NEI Native was founded with a simple mission: to bring the power of ancient botanicals and natural ingredients to modern skincare and wellness. We believe in the purity of nature and the dedication required to craft truly authentic products.
						</p>
						<p className="text-[#5D4037] text-lg leading-relaxed mb-6">
							Each product in our collection is handcrafted with devotion, using only the finest natural ingredients sourced responsibly from trusted suppliers. We honour traditional wisdom while embracing modern quality standards.
						</p>
						<p className="text-[#5D4037] text-lg leading-relaxed">
							From our premium A2 cow ghee to our signature saffron-infused skincare, every item reflects our commitment to excellence, sustainability, and your well-being.
						</p>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className="py-16 sm:py-20 md:py-24 bg-white">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3E2723] mb-12 text-center">Our Values</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Purity */}
						<div className="bg-[#FAF7F2] rounded-2xl p-8 border border-[#E0D8C8] text-center">
							<Leaf className="w-12 h-12 text-[#D97736] mx-auto mb-4" />
							<h3 className="text-xl font-bold text-[#3E2723] mb-3">Purity</h3>
							<p className="text-[#5D4037] leading-relaxed">
								We use only natural, chemical-free ingredients. No artificial additives, no compromise on quality.
							</p>
						</div>

						{/* Dedication */}
						<div className="bg-[#FAF7F2] rounded-2xl p-8 border border-[#E0D8C8] text-center">
							<Heart className="w-12 h-12 text-[#D97736] mx-auto mb-4" />
							<h3 className="text-xl font-bold text-[#3E2723] mb-3">Devotion</h3>
							<p className="text-[#5D4037] leading-relaxed">
								Crafted with devotion in every drop. We put our heart into every product we create for you.
							</p>
						</div>

						{/* Quality */}
						<div className="bg-[#FAF7F2] rounded-2xl p-8 border border-[#E0D8C8] text-center">
							<Award className="w-12 h-12 text-[#D97736] mx-auto mb-4" />
							<h3 className="text-xl font-bold text-[#3E2723] mb-3">Quality</h3>
							<p className="text-[#5D4037] leading-relaxed">
								Traditional methods meet modern standards. Every batch is carefully tested and verified.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 sm:py-20 bg-[#D97736] text-white text-center">
				<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="font-heading text-3xl sm:text-4xl font-bold mb-6">Discover Our Collection</h2>
					<p className="text-lg mb-8 opacity-90">Experience the purity and devotion in every product</p>
					<Link to="/products" className="inline-block bg-white text-[#D97736] font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-colors">
						Shop Now
					</Link>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default AboutUsPage;
