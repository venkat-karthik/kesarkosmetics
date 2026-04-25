import React, { useState, useEffect } from "react";
import { Calendar, User, ArrowRight, X, Clock, BookOpen, Sparkles, Leaf } from "lucide-react";
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

const CATEGORY_COLOURS = {
	Health:        "bg-emerald-100 text-emerald-700",
	Beauty:        "bg-pink-100 text-pink-700",
	Wellness:      "bg-amber-100 text-amber-700",
	Craftsmanship: "bg-purple-100 text-purple-700",
	Nutrition:     "bg-orange-100 text-orange-700",
	Cooking:       "bg-yellow-100 text-yellow-700",
};
const catClass = (cat) => CATEGORY_COLOURS[cat] || "bg-[#F7F1E8] text-[#8B2C6D]";

const BlogModal = ({ post, onClose }) => {
	if (!post) return null;
	return (
		<>
			<div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
					<div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#E9E0D2] rounded-t-3xl z-10">
						<span className={`text-xs font-bold px-3 py-1 rounded-full ${catClass(post.category)}`}>{post.category}</span>
						<button onClick={onClose} className="p-2 hover:bg-[#F5EEE6] rounded-full transition-colors" aria-label="Close">
							<X className="w-5 h-5 text-[#3E2723]" />
						</button>
					</div>
					<div className="p-6 sm:p-8">
						<div className="w-full h-32 rounded-2xl bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center text-7xl mb-6">
							{post.emoji}
						</div>
						<h2 className="font-heading text-2xl sm:text-3xl text-[#3E2723] mb-3 leading-snug">{post.title}</h2>
						<div className="flex flex-wrap items-center gap-4 text-xs text-[#8A7768] mb-6 pb-5 border-b border-[#E9E0D2]">
							<span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author}</span>
							<span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
							<span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
						</div>
						<div className="space-y-4 text-[#5D4037]">
							{post.content.map((block, i) => {
								if (block.type === "h3") return (
									<h3 key={i} className="font-heading text-xl font-semibold text-[#3E2723] mt-7 mb-2 flex items-center gap-2">
										<span className="w-1 h-5 rounded-full bg-[#D97736] shrink-0" />{block.text}
									</h3>
								);
								if (block.type === "list") return (
									<ul key={i} className="space-y-2.5 pl-1">
										{block.items.map((item, j) => (
											<li key={j} className="flex items-start gap-3 text-sm leading-relaxed">
												<span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D97736] shrink-0" />{item}
											</li>
										))}
									</ul>
								);
								return <p key={i} className="text-sm sm:text-base leading-relaxed">{block.text}</p>;
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
	const [activeCategory, setActiveCategory] = useState("All");
	const [dynamicPosts, setDynamicPosts] = useState([]);
	const [subEmail, setSubEmail] = useState("");
	const [subLoading, setSubLoading] = useState(false);

	const handleSubscribe = async (e) => {
		e.preventDefault();
		if (!subEmail.trim()) return;
		setSubLoading(true);
		try {
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
		} catch {
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
	const categories = ["All", ...Array.from(new Set(allPosts.map(p => p.category)))];
	const filteredPosts = activeCategory === "All" ? allPosts : allPosts.filter(p => p.category === activeCategory);
	const featuredPost = allPosts.find(p => p.featured);

	return (
		<div className="min-h-screen bg-[#FAF7F2]">
			{openPost && <BlogModal post={openPost} onClose={() => setOpenPost(null)} />}

			{/* ── Hero ─────────────────────────────────────── */}
			<section className="relative overflow-hidden bg-gradient-to-br from-[#2D0F00] via-[#4A1A00] to-[#3E2723] text-white">
				<div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#F5A800]/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-[#E8620A]/10 blur-3xl pointer-events-none" />
				<div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
					<p className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-[#F5A800] bg-[#F5A800]/10 border border-[#F5A800]/25 rounded-full px-5 py-2 mb-6">
						Knowledge & Wellness
					</p>
					<h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
						Kesar Kosmetics <span className="text-[#F5A800]">Journal</span>
					</h1>
					<p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
						Insights, rituals, and stories about natural beauty, Kashmiri saffron, and the art of living well.
					</p>
					<div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/60">
						<span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-[#F5A800]" />{allPosts.length} articles</span>
						<span className="w-1 h-1 rounded-full bg-white/30" />
						<span className="flex items-center gap-1.5"><Leaf className="w-4 h-4 text-[#F5A800]" />Natural living</span>
						<span className="w-1 h-1 rounded-full bg-white/30" />
						<span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#F5A800]" />Beauty & wellness</span>
					</div>
				</div>
			</section>

			{/* ── Featured Post ─────────────────────────────── */}
			{featuredPost && (
				<section className="py-12 sm:py-16 bg-white border-b border-[#E9E0D2]">
					<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
						<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D97736] mb-5">Featured Article</p>
						<div
							className="group cursor-pointer rounded-3xl border-2 border-[#E6DCCB] bg-gradient-to-br from-[#FFF8F0] to-[#FAF0E6] overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
							onClick={() => setOpenPost(featuredPost)}
						>
							<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
								<div className="h-48 lg:h-auto bg-gradient-to-br from-[#FFE0B2] to-[#FFCC80] flex items-center justify-center text-8xl">
									{featuredPost.emoji}
								</div>
								<div className="p-7 sm:p-10 flex flex-col justify-center">
									<div className="flex flex-wrap items-center gap-3 mb-4">
										<span className={`text-xs font-bold px-3 py-1 rounded-full ${catClass(featuredPost.category)}`}>{featuredPost.category}</span>
										<span className="text-xs text-[#8A7768] flex items-center gap-1"><Clock className="w-3 h-3" />{featuredPost.readTime}</span>
									</div>
									<h2 className="font-heading text-2xl sm:text-3xl text-[#3E2723] leading-snug mb-3 group-hover:text-[#D97736] transition-colors">
										{featuredPost.title}
									</h2>
									<p className="text-[#6B5B52] text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">{featuredPost.excerpt}</p>
									<div className="flex items-center justify-between flex-wrap gap-4">
										<div className="flex items-center gap-3 text-xs text-[#8A7768]">
											<span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{featuredPost.author}</span>
											<span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{featuredPost.date}</span>
										</div>
										<span className="inline-flex items-center gap-2 bg-[#D97736] hover:bg-[#C96626] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
											Read Article <ArrowRight className="w-4 h-4" />
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* ── Category Filter + Grid ────────────────────── */}
			<section className="py-14 sm:py-20">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-10">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D97736] mb-1">All Articles</p>
							<h2 className="font-heading text-3xl text-[#3E2723]">
								{activeCategory === "All" ? "Everything we've written" : activeCategory}
							</h2>
						</div>
						<div className="flex flex-wrap gap-2">
							{categories.map(cat => (
								<button
									key={cat}
									onClick={() => setActiveCategory(cat)}
									className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
										activeCategory === cat
											? "bg-[#D97736] border-[#D97736] text-white shadow-sm"
											: "bg-white border-[#E9E0D2] text-[#6B5B52] hover:border-[#D97736] hover:text-[#D97736]"
									}`}
								>
									{cat}
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
						{filteredPosts.map((post) => (
							<div
								key={post.id}
								className="group bg-white rounded-2xl overflow-hidden border border-[#E9E0D2] hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col"
								onClick={() => setOpenPost(post)}
							>
								<div className="w-full h-36 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center text-6xl shrink-0">
									{post.emoji}
								</div>
								<div className="p-5 flex flex-col flex-1">
									<div className="flex items-center justify-between mb-3">
										<span className={`text-xs font-bold px-3 py-1 rounded-full ${catClass(post.category)}`}>{post.category}</span>
										<span className="text-xs text-[#8A7768] flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
									</div>
									<h3 className="font-heading text-lg text-[#3E2723] leading-snug mb-2 group-hover:text-[#D97736] transition-colors line-clamp-2">
										{post.title}
									</h3>
									<p className="text-[#6B5B52] text-sm leading-relaxed line-clamp-2 flex-1 mb-4">{post.excerpt}</p>
									<div className="flex items-center justify-between pt-4 border-t border-[#F0E7DA]">
										<span className="text-xs text-[#8A7768]">{post.date}</span>
										<span className="text-[#D97736] text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
											Read more <ArrowRight className="w-3.5 h-3.5" />
										</span>
									</div>
								</div>
							</div>
						))}
					</div>

					{filteredPosts.length === 0 && (
						<div className="text-center py-16 text-[#8A7768]">
							<p className="text-4xl mb-4">📭</p>
							<p className="font-semibold text-[#3E2723]">No articles in this category yet.</p>
						</div>
					)}
				</div>
			</section>

			{/* ── Topics strip ─────────────────────────────── */}
			<section className="py-12 bg-white border-y border-[#E9E0D2]">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-[#8A7768] mb-8">Topics We Cover</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						{[
							{ emoji: "🌸", label: "Kashmiri Saffron" },
							{ emoji: "🫙", label: "A2 Ghee & Dairy" },
							{ emoji: "🌿", label: "Ayurvedic Wellness" },
							{ emoji: "✨", label: "Natural Skincare" },
							{ emoji: "🍯", label: "Traditional Nutrition" },
							{ emoji: "🫒", label: "Wood Pressed Oils" },
							{ emoji: "🥜", label: "Clean Eating" },
							{ emoji: "🏔️", label: "Kashmir Heritage" },
						].map(({ emoji, label }) => (
							<span key={label} className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E9E0D2] rounded-full px-4 py-2 text-sm font-medium text-[#5D4037]">
								{emoji} {label}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ── Newsletter ────────────────────────────────── */}
			<section className="py-20 sm:py-28 bg-gradient-to-br from-[#2D0F00] via-[#4A1A00] to-[#3E2723] text-white relative overflow-hidden">
				<div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#F5A800]/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#E8620A]/10 blur-3xl pointer-events-none" />
				<div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F5A800] mb-4">Stay in the Loop</p>
					<h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">Get wellness tips in your inbox</h2>
					<p className="text-white/70 text-base mb-8 leading-relaxed">
						Subscribe for new articles, product launches, seasonal rituals, and exclusive offers — delivered straight to you.
					</p>
					<form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
						<input
							type="email"
							value={subEmail}
							onChange={e => setSubEmail(e.target.value)}
							placeholder="your@email.com"
							required
							className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5A800] transition-colors"
						/>
						<button
							type="submit"
							disabled={subLoading}
							className="bg-[#F5A800] hover:bg-[#E8620A] disabled:opacity-60 text-[#2D0F00] font-bold px-7 py-3 rounded-full transition-colors shrink-0"
						>
							{subLoading ? "Subscribing…" : "Subscribe"}
						</button>
					</form>
					<p className="mt-4 text-xs text-white/40">No spam, ever. Unsubscribe anytime.</p>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default BlogsPage;
