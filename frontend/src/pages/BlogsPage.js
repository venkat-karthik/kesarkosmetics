import React, { useState, useEffect } from "react";
import { Calendar, User, ArrowRight, X, Clock } from "lucide-react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import { collection, getDocs, query, orderBy, addDoc, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseClient";

const blogPosts = [
	{
		id: 1,
		title: "The Power of A2 Ghee: Ancient Wisdom Meets Modern Health",
		excerpt: "Discover how A2 ghee from desi cows provides superior nutrition and health benefits compared to regular ghee.",
		date: "March 15, 2025",
		author: "NEI Native Team",
		category: "Health",
		readTime: "5 min read",
		emoji: "🫙",
		content: [
			{ type: "p", text: "A2 ghee has been a cornerstone of Indian kitchens and Ayurvedic medicine for thousands of years. Unlike regular ghee made from hybrid cows, A2 ghee comes exclusively from indigenous desi breeds whose milk contains only the A2 beta-casein protein — making it far easier to digest and richer in nutrients." },
			{ type: "h3", text: "What Makes A2 Different?" },
			{ type: "p", text: "The key difference lies in the protein structure. A1 milk (from most commercial dairy breeds) contains a protein that breaks down into BCM-7, a peptide linked to digestive discomfort. A2 milk does not produce BCM-7, making it gentler on the gut and suitable even for those who are lactose-sensitive." },
			{ type: "h3", text: "Health Benefits" },
			{ type: "list", items: ["Rich in fat-soluble vitamins A, D, E, and K2", "Contains butyric acid that supports gut health and reduces inflammation", "High smoke point makes it ideal for high-heat cooking", "Supports brain function and hormonal balance", "Boosts immunity with antioxidant properties"] },
			{ type: "h3", text: "How to Use A2 Ghee Daily" },
			{ type: "p", text: "Start your morning with a teaspoon of A2 ghee in warm water or add it to your dal, roti, or rice. Use it for sautéing vegetables or as a finishing drizzle over khichdi. Its rich, nutty aroma elevates every dish it touches." },
			{ type: "p", text: "At NEI Native, our A2 ghee is made using the traditional Bilona method — slow-churned from curd, not cream — preserving all the natural goodness that modern processing strips away." },
		],
	},
	{
		id: 2,
		title: "Saffron Cream: A Natural Secret to Radiant, Glowing Skin",
		excerpt: "For centuries, saffron — often called 'red gold' — has been treasured in skincare rituals. Discover how saffron cream can transform your daily routine.",
		date: "April 10, 2025",
		author: "NEI Native Team",
		category: "Beauty",
		readTime: "7 min read",
		emoji: "🌸",
		featured: true,
		content: [
			{ type: "p", text: "For centuries, saffron — often called 'red gold' — has been treasured not only in culinary traditions but also in skincare rituals. Derived from the delicate stigmas of the Crocus sativus flower, saffron is packed with skin-loving properties that promote a healthy, luminous complexion. Today, saffron cream has become a popular choice for those seeking a natural glow and daily skin nourishment." },
			{ type: "h3", text: "Why Saffron for Skin?" },
			{ type: "p", text: "Saffron is rich in antioxidants such as crocin and safranal, which help protect the skin from environmental stressors. Its natural compounds support brighter, more even-toned skin and may help reduce the appearance of dullness, pigmentation, and tired-looking skin." },
			{ type: "h3", text: "Regular Use of Saffron Cream Can:" },
			{ type: "list", items: ["Enhance skin radiance and glow", "Improve uneven skin tone", "Provide gentle hydration", "Support a smoother, softer texture", "Calm minor irritation and redness"] },
			{ type: "h3", text: "How Saffron Cream Promotes Glowing Skin" },
			{ type: "p", text: "Saffron works by improving blood circulation beneath the skin and helping to revitalize tired cells. This gives the skin a natural, healthy glow rather than an artificial shine. Its mild brightening effect helps reduce the appearance of dark spots over time, making the skin look fresher and more youthful." },
			{ type: "p", text: "Additionally, saffron's soothing properties make it suitable for daily use, helping calm minor irritation and leaving the skin feeling refreshed." },
			{ type: "h3", text: "Day Cream Use" },
			{ type: "p", text: "In the morning, apply a small amount of saffron cream to clean skin. Gently massage it in upward circular motions. As a day cream, it keeps the skin hydrated throughout the day, creates a smooth base for makeup, and adds a subtle glow without heaviness. For best results, follow with sunscreen to protect your skin from UV damage." },
			{ type: "h3", text: "Night Cream Use" },
			{ type: "p", text: "At night, saffron cream works as a nourishing treatment while your skin repairs itself. Apply it after cleansing and toning. During the night, it deeply hydrates and replenishes the skin, helps restore skin vitality, and supports natural repair processes." },
			{ type: "h3", text: "Tips for Best Results" },
			{ type: "list", items: ["Use consistently for visible improvements", "Apply on clean, slightly damp skin for better absorption", "Pair with a healthy skincare routine (cleansing, sun protection, hydration)", "Store in a cool, dry place to maintain its effectiveness", "Always do a patch test first if you have sensitive skin"] },
			{ type: "p", text: "Saffron cream blends traditional beauty wisdom with modern skincare needs. With regular use, it can help reveal naturally glowing, soft, and healthy-looking skin. Whether used as a day cream for protection or a night cream for repair, saffron cream offers a simple yet effective way to elevate your daily skincare routine." },
		],
	},
	{
		id: 3,
		title: "Turmeric: Nature's Golden Healer",
		excerpt: "Explore the scientifically-backed benefits of turmeric and how our pure turmeric products can enhance your wellness routine.",
		date: "March 5, 2025",
		author: "NEI Native Team",
		category: "Wellness",
		readTime: "4 min read",
		emoji: "🌿",
		content: [
			{ type: "p", text: "Turmeric has been used in Indian households for over 4,000 years — as a spice, a medicine, and a beauty ingredient. The active compound curcumin gives turmeric its vibrant golden colour and is responsible for most of its health benefits." },
			{ type: "h3", text: "Key Benefits of Turmeric" },
			{ type: "list", items: ["Powerful anti-inflammatory properties", "Strong antioxidant that neutralises free radicals", "Supports joint health and mobility", "Boosts brain function and may lower risk of brain diseases", "Supports heart health by improving endothelial function"] },
			{ type: "h3", text: "How to Use It Daily" },
			{ type: "p", text: "Add a pinch to warm milk for the classic 'golden milk', stir into soups and curries, or mix with honey as a face mask. At NEI Native, our turmeric is sourced from trusted farms and stone-ground to preserve its natural potency." },
		],
	},
	{
		id: 4,
		title: "The Art of Handcrafted Natural Products",
		excerpt: "Behind every NEI Native product is a story of dedication and traditional craftsmanship that ensures uncompromising quality.",
		date: "February 28, 2025",
		author: "NEI Native Team",
		category: "Craftsmanship",
		readTime: "3 min read",
		emoji: "✨",
		content: [
			{ type: "p", text: "In a world of mass production, handcrafted products stand apart. At NEI Native, every product is made in small batches with careful attention to each step of the process — from sourcing raw ingredients to the final packaging." },
			{ type: "h3", text: "Why Handcrafted Matters" },
			{ type: "p", text: "When products are made by hand, quality is personal. There are no shortcuts, no compromises. Each batch is checked, tested, and approved before it reaches you. This is the NEI Native promise." },
			{ type: "h3", text: "Our Process" },
			{ type: "list", items: ["Ingredients sourced directly from trusted farmers", "No artificial preservatives or synthetic additives", "Small-batch production for freshness", "Traditional methods combined with modern hygiene standards", "Every product tested before dispatch"] },
		],
	},
	{
		id: 5,
		title: "Jaggery vs Sugar: Why Your Body Prefers the Natural Choice",
		excerpt: "Unrefined jaggery has been sweetening Indian homes for centuries. Here's why it's far superior to refined white sugar for your health.",
		date: "April 5, 2025",
		author: "NEI Native Team",
		category: "Nutrition",
		readTime: "5 min read",
		emoji: "🍯",
		content: [
			{ type: "p", text: "Jaggery — known as 'gur' in Hindi — is one of India's oldest natural sweeteners. Unlike refined white sugar, jaggery retains its natural minerals and nutrients because it undergoes minimal processing." },
			{ type: "h3", text: "Nutritional Advantage" },
			{ type: "p", text: "Jaggery contains iron, magnesium, potassium, and small amounts of B vitamins. Refined sugar, by contrast, is stripped of all nutrients during processing, leaving only empty calories." },
			{ type: "h3", text: "Health Benefits of Jaggery" },
			{ type: "list", items: ["Aids digestion and cleanses the liver", "Rich in iron — helps prevent anaemia", "Boosts immunity with antioxidant properties", "Provides sustained energy without sharp blood sugar spikes", "Supports respiratory health — traditional remedy for coughs"] },
			{ type: "h3", text: "How to Use It" },
			{ type: "p", text: "Replace sugar in your morning tea or coffee with a small piece of jaggery. Use it in traditional sweets like ladoos, payasam, or pongal. At NEI Native, our jaggery is sourced from traditional sugarcane farms and processed without chemicals." },
		],
	},
	{
		id: 6,
		title: "Wood Pressed Oils: The Cold-Pressed Difference",
		excerpt: "Most cooking oils are extracted using heat and chemicals. Wood pressed oils preserve nutrients, flavour, and natural goodness the traditional way.",
		date: "March 25, 2025",
		author: "NEI Native Team",
		category: "Cooking",
		readTime: "4 min read",
		emoji: "🫒",
		content: [
			{ type: "p", text: "Wood pressed oils — also called cold-pressed or chekku oils — are extracted using a traditional wooden press (ghani) that rotates slowly without generating heat. This preserves the oil's natural nutrients, flavour, and aroma." },
			{ type: "h3", text: "Why Conventional Oils Fall Short" },
			{ type: "p", text: "Commercial oils are extracted using high heat and chemical solvents like hexane. This process destroys natural antioxidants, vitamins, and the oil's characteristic flavour. The result is a bland, nutritionally depleted product." },
			{ type: "h3", text: "Benefits of Wood Pressed Oils" },
			{ type: "list", items: ["Retains natural antioxidants and vitamins E & K", "Rich, authentic flavour that enhances every dish", "No chemical residues or additives", "Higher smoke point than refined oils", "Supports heart health with natural fatty acid profiles"] },
			{ type: "h3", text: "Best Uses" },
			{ type: "p", text: "Use groundnut oil for deep frying, sesame oil for tempering and dressings, and coconut oil for baking and sautéing. NEI Native's wood pressed oils are stone-ground in small batches to ensure maximum freshness." },
		],
	},
	{
		id: 7,
		title: "Peanut Butter the Natural Way: No Additives, Pure Goodness",
		excerpt: "Most commercial peanut butters are loaded with sugar, palm oil, and preservatives. Here's why natural peanut butter is the smarter choice.",
		date: "March 18, 2025",
		author: "NEI Native Team",
		category: "Nutrition",
		readTime: "3 min read",
		emoji: "🥜",
		content: [
			{ type: "p", text: "Natural peanut butter contains just one ingredient: peanuts. No added sugar, no hydrogenated oils, no preservatives. Yet most supermarket brands are far from this simple ideal." },
			{ type: "h3", text: "What to Avoid" },
			{ type: "list", items: ["Hydrogenated or partially hydrogenated oils (trans fats)", "Added sugar or high-fructose corn syrup", "Artificial flavours and preservatives", "Palm oil (linked to environmental concerns)"] },
			{ type: "h3", text: "Why Natural Peanut Butter Wins" },
			{ type: "p", text: "Natural peanut butter is rich in protein, healthy monounsaturated fats, vitamin E, magnesium, and niacin. It keeps you full longer, supports muscle recovery, and provides sustained energy without the sugar crash." },
			{ type: "h3", text: "How to Enjoy It" },
			{ type: "p", text: "Spread on whole grain toast, blend into smoothies, stir into oatmeal, or eat straight from the jar. NEI Native's peanut butter is stone-ground from roasted peanuts with nothing added — just pure, honest goodness." },
		],
	},
];

const BlogModal = ({ post, onClose }) => {
	if (!post) return null;
	return (
		<>
			<div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
					<div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-[#E0D8C8] rounded-t-3xl z-10">
						<span className="inline-block bg-[#D97736] text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
						<button onClick={onClose} className="p-2 hover:bg-[#EFE9DF] rounded-full transition-colors">
							<X className="w-5 h-5 text-[#3E2723]" />
						</button>
					</div>

					<div className="p-6 sm:p-8">
						<div className="text-5xl mb-4 text-center">{post.emoji}</div>
						<h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723] mb-3 leading-snug">{post.title}</h2>
						<div className="flex items-center gap-4 text-xs text-[#6B5B52] mb-6 pb-4 border-b border-[#E0D8C8]">
							<span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{post.author}</span>
							<span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
							<span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
						</div>

						<div className="space-y-4 text-[#5D4037]">
							{post.content.map((block, i) => {
								if (block.type === "h3") return <h3 key={i} className="font-bold text-[#3E2723] text-lg mt-6 mb-2">{block.text}</h3>;
								if (block.type === "list") return (
									<ul key={i} className="space-y-2 pl-2">
										{block.items.map((item, j) => (
											<li key={j} className="flex items-start gap-2 text-sm leading-relaxed">
												<span className="text-[#D97736] mt-1 shrink-0">✦</span>{item}
											</li>
										))}
									</ul>
								);
								return <p key={i} className="text-sm leading-relaxed">{block.text}</p>;
							})}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

const BlogsPage = () => {
	const [openPost, setOpenPost] = useState(null);
	const [dynamicPosts, setDynamicPosts] = useState([]);
	const [subEmail, setSubEmail] = useState("");
	const [subLoading, setSubLoading] = useState(false);

	const handleSubscribe = async (e) => {
		e.preventDefault();
		if (!subEmail.trim()) return;
		setSubLoading(true);
		try {
			// Check if already subscribed
			const existing = await getDocs(query(collection(db, "subscribers"), where("email", "==", subEmail.trim().toLowerCase())));
			if (!existing.empty) {
				toast.success("You're already subscribed!");
				setSubEmail("");
				return;
			}
			await addDoc(collection(db, "subscribers"), {
				email: subEmail.trim().toLowerCase(),
				subscribedAt: serverTimestamp(),
				source: "blog",
			});
			toast.success("Subscribed! Welcome to the Kesar family 🌸");
			setSubEmail("");
		} catch (err) {
			toast.error("Could not subscribe. Please try again.");
		} finally {
			setSubLoading(false);
		}
	};

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				const snap = await getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc")));
				setDynamicPosts(snap.docs.map(d => ({
					id: `fs-${d.id}`,
					_docId: d.id,
					title: d.data().title,
					excerpt: d.data().excerpt || "",
					date: d.data().date || new Date().toLocaleDateString(),
					author: d.data().author || "Kesar Kosmetics Team",
					category: d.data().category || "Beauty",
					readTime: d.data().readTime || "3 min read",
					emoji: d.data().emoji || "✨",
					content: [{ type: "p", text: d.data().content || "" }],
				})));
			} catch {}
		};
		fetchBlogs();
	}, []);

	const allPosts = [...dynamicPosts, ...blogPosts];

	return (
		<div className="min-h-screen bg-[#FAF7F2]">
			{openPost && <BlogModal post={openPost} onClose={() => setOpenPost(null)} />}

			{/* Hero */}
			<section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-[#3E2723] to-[#5D4037] text-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Kesar Kosmetics Blog</h1>
					<p className="text-lg sm:text-xl text-gray-200 leading-relaxed">
						Insights, tips, and stories about natural beauty, wellness, and handcrafted excellence
					</p>
				</div>
			</section>

			{/* Featured Post */}
			{allPosts.filter(p => p.featured).map(post => (
				<section key={post.id} className="py-12 sm:py-16 bg-white border-b border-[#E0D8C8]">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
						<p className="text-xs font-bold uppercase tracking-widest text-[#D97736] mb-4">Featured Article</p>
						<div className="bg-gradient-to-br from-[#FFF8F0] to-[#FAF0E6] rounded-3xl border border-[#E6DCCB] p-8 sm:p-10 shadow-sm">
							<div className="text-6xl mb-5 text-center">{post.emoji}</div>
							<span className="inline-block bg-[#D97736] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">{post.category}</span>
							<h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723] mb-3 leading-snug">{post.title}</h2>
							<p className="text-[#5D4037] mb-6 leading-relaxed">{post.excerpt}</p>
							<div className="flex items-center justify-between flex-wrap gap-4">
								<div className="flex items-center gap-4 text-xs text-[#6B5B52]">
									<span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
									<span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
								</div>
								<button
									onClick={() => setOpenPost(post)}
									className="bg-[#D97736] hover:bg-[#C96626] text-white font-semibold px-6 py-2.5 rounded-full transition-all flex items-center gap-2 text-sm"
								>
									Read Full Article <ArrowRight className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</section>
			))}

			{/* Blog Grid */}
			<section className="py-16 sm:py-20 md:py-24">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723] mb-10">All Articles</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
						{allPosts.map((post) => (
							<div
								key={post.id}
								className="bg-white rounded-2xl overflow-hidden border border-[#E0D8C8] hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
								onClick={() => setOpenPost(post)}
							>
								<div className="w-full h-40 sm:h-48 bg-gradient-to-br from-[#F5E6D3] to-[#EDD5B3] flex items-center justify-center text-7xl">
									{post.emoji}
								</div>
								<div className="p-6 sm:p-8">
									<div className="flex items-center justify-between mb-3">
										<span className="inline-block bg-[#D97736] text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
										<span className="text-xs text-[#5D4037] flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
									</div>
									<h3 className="font-heading text-lg sm:text-xl font-bold text-[#3E2723] mb-3 leading-snug">{post.title}</h3>
									<p className="text-[#5D4037] text-sm sm:text-base mb-4 line-clamp-2">{post.excerpt}</p>
									<div className="flex items-center justify-between pt-4 border-t border-[#E0D8C8]">
										<div className="flex items-center gap-2 text-xs text-[#5D4037]">
											<User className="w-4 h-4" />
											<span>{post.author}</span>
											<span className="text-[#B0A090]">·</span>
											<span>{post.date}</span>
										</div>
										<span className="text-[#D97736] hover:text-[#C96626] font-semibold flex items-center gap-1 text-sm transition-colors">
											Read More <ArrowRight className="w-4 h-4" />
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Newsletter */}
			<section className="py-16 sm:py-20 bg-white border-t border-[#E0D8C8]">
				<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3E2723] mb-4">Stay Updated</h2>
					<p className="text-[#5D4037] mb-8 text-lg">Subscribe for wellness tips, product launches, and exclusive offers</p>
					<form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
						<input
							type="email"
							value={subEmail}
							onChange={e => setSubEmail(e.target.value)}
							placeholder="Enter your email"
							required
							className="flex-1 px-4 py-3 border border-[#E0D8C8] rounded-full focus:outline-none focus:ring-2 focus:ring-[#D97736]"
						/>
						<button type="submit" disabled={subLoading} className="bg-[#D97736] hover:bg-[#C96626] disabled:opacity-60 text-white font-bold px-8 py-3 rounded-full transition-colors">
							{subLoading ? "Subscribing..." : "Subscribe"}
						</button>
					</form>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default BlogsPage;
