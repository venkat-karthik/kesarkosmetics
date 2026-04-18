import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
ArrowLeft,
ChevronLeft,
ChevronRight,
ChevronDown,
Minus,
Plus,
Check,
Truck,
ShieldCheck,
Sparkles,
Star,
Coffee,
Bean,
Heart,
Sun,
Moon,
Droplets,
} from "lucide-react";
import axios from "axios";
import { formatPrice } from "../utils/helpers";
import useSupabaseUser from "../hooks/useSupabaseUser";
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/button";
import ReviewModal from "../components/ReviewModal";
import CartSuccessModal from "../components/CartSuccessModal";
import CartOptionsModal from "../components/CartOptionsModal";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

// Falling saffron threads animation
const SaffronFalling = () => {
	const threads = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
		id: i,
		left: `${4 + (i * 6.8) % 90}%`,
		delay: `${-(i * 1.4) % 14}s`,
		duration: `${12 + (i * 1.1) % 6}s`,
		size: `${8 + (i * 0.7) % 8}px`,
		swayPx: (i % 2 === 0 ? 1 : -1) * (18 + (i * 2.3) % 22),
		opacity: 0.13 + (i * 0.011) % 0.15,
	})), []);

	return (
		<div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
			<style>{`
				@keyframes saffronFall {
					0%   { transform: translateY(-80px) translateX(0px) rotate(0deg); opacity: 0; }
					5%   { opacity: 1; }
					20%  { transform: translateY(18vh) translateX(var(--s1)) rotate(40deg); }
					40%  { transform: translateY(38vh) translateX(0px) rotate(90deg); }
					60%  { transform: translateY(58vh) translateX(var(--s2)) rotate(145deg); }
					80%  { transform: translateY(78vh) translateX(0px) rotate(195deg); }
					95%  { opacity: 0.8; }
					100% { transform: translateY(110vh) translateX(var(--s1)) rotate(240deg); opacity: 0; }
				}
			`}</style>
			{threads.map((t) => (
				<div
					key={t.id}
					style={{
						position: "absolute",
						left: t.left,
						top: 0,
						width: t.size,
						height: `calc(${t.size} * 4)`,
						animation: `saffronFall ${t.duration} ${t.delay} linear infinite`,
						"--s1": `${t.swayPx}px`,
						"--s2": `${-t.swayPx * 0.6}px`,
						opacity: t.opacity,
						willChange: "transform",
					}}
				>
					<svg viewBox="0 0 10 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
						<line x1="5" y1="0" x2="5" y2="28" stroke="#E8620A" strokeWidth="1.2" strokeLinecap="round" />
						<ellipse cx="5" cy="32" rx="2.8" ry="4.5" fill="#C8380A" />
						<ellipse cx="5" cy="30" rx="1.5" ry="2" fill="#F5A800" />
						<line x1="5" y1="27" x2="2" y2="22" stroke="#E8620A" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
						<line x1="5" y1="27" x2="8" y2="22" stroke="#E8620A" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
					</svg>
				</div>
			))}
		</div>
	);
};

const SAFFRON_PRODUCT_IDS = ["prod-001"];
const isSaffronProduct = (productId) => SAFFRON_PRODUCT_IDS.includes(productId);

const saffronKeyNotes = [
	{ icon: Sparkles, label: "Radiance Boost", desc: "Crocin & safranal antioxidants brighten skin naturally" },
	{ icon: Droplets, label: "Deep Hydration", desc: "Locks in moisture for soft, supple skin all day" },
	{ icon: Sun, label: "Day Cream", desc: "Smooth base for makeup, subtle glow without heaviness" },
	{ icon: Moon, label: "Night Repair", desc: "Nourishes and restores skin vitality while you sleep" },
	{ icon: Heart, label: "Gentle & Safe", desc: "Suitable for daily use on most skin types" },
	{ icon: ShieldCheck, label: "Even Skin Tone", desc: "Reduces dark spots and pigmentation over time" },
];

const ProductDetailPage = () => {
const { id } = useParams();
const navigate = useNavigate();
const { user, loading: userLoading } = useSupabaseUser();
const { addToCart: addToCartCtx } = useCart();

const [product, setProduct] = useState(null);
const [allProducts, setAllProducts] = useState([]);
const [selectedImage, setSelectedImage] = useState(0);
const [selectedVariant, setSelectedVariant] = useState(null);
const [quantity, setQuantity] = useState(1);
const [loading, setLoading] = useState(true);
const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [successProduct, setSuccessProduct] = useState(null);
const [showCartOptionsModal, setShowCartOptionsModal] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const { getProduct, getAllProducts } = await import("../utils/productsDb");
				const [productData, allProductsData] = await Promise.all([
					getProduct(id),
					getAllProducts(),
				]);

				if (!productData) { toast.error("Product not found"); navigate("/"); return; }
				setProduct(productData);
				setAllProducts(allProductsData);
				setSelectedImage(0);
				if (productData?.variants?.length > 0) {
					setSelectedVariant(productData.variants[0].name);
				} else {
					setSelectedVariant(productData?.size || null);
				}
			} catch {
				toast.error("Product not found");
				navigate("/");
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();

		// Set up periodic refresh every 10 seconds for admin changes
		const interval = setInterval(fetchProduct, 10000);

		// Refetch when page becomes visible (when switching tabs/windows)
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				fetchProduct();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [id, navigate]);

const images = product?.images?.length ? product.images : [product?.image].filter(Boolean);
const handlePrevImage = () => {
if (images.length < 2) return;
setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
};

const handleNextImage = () => {
if (images.length < 2) return;
setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
};

const variants = useMemo(() => {
if (!product) return [];
if (Array.isArray(product.variants) && product.variants.length > 0) {
return product.variants;
}
return [{ name: product.size || "Select", price: product.price }];
}, [product]);

const relatedProducts = useMemo(() => {
	if (!product || allProducts.length === 0) return [];
	// Show all other products (not the current one), up to 4
	const others = allProducts.filter((item) => (item.id || item._id) !== (product.id || product._id));
	return others.slice(0, 4);
}, [allProducts, product]);

const averageRating = Number(product?.rating || 4.5);
const reviewBars = [5, 4, 3, 2, 1].map((rating) => ({
rating,
count: rating === 5 ? 11 : rating === 4 ? 11 : 0,
}));

const addToCart = async () => {
if (!product) return false;
try {
await addToCartCtx(product, quantity, selectedVariant);
setSuccessProduct({ ...product, size: selectedVariant || product?.size || null });
setShowSuccessModal(true);
return true;
} catch {
toast.error("Failed to add to cart");
return false;
}
};

const buyNow = async () => {
const added = await addToCart();
if (added && user && user._id) {
navigate("/checkout");
}
};

const handleViewCart = () => {
setShowSuccessModal(false);
setShowCartOptionsModal(true);
};

const handleContinueShopping = () => {
setShowSuccessModal(false);
setShowCartOptionsModal(false);
};

const handleProceedToBuy = () => {
setShowCartOptionsModal(false);
if (!user || !user._id) {
setShowLoginModal(true);
return;
}
navigate("/checkout");
};

const handleReviewSubmit = async ({ rating, comment, image }) => {
	if (!user || !user._id) {
		toast.error("Please login to submit a review");
		return;
	}
	try {
		const { addReview } = await import("../utils/productsDb");
		const updatedProduct = await addReview(product.id, {
			rating,
			comment,
			image: image || null,
			user_name: user.name || user.email || "Anonymous",
			user_uid: user._id,
			created_at: new Date().toISOString(),
		});
		setProduct(updatedProduct);
		window.dispatchEvent(new Event("reviews:updated"));
		toast.success("Review submitted successfully!");
	} catch (err) {
		console.error("Review submit error:", err?.response?.data || err.message);
		toast.error(err?.response?.data?.detail || "Failed to submit review. Please try again.");
	}
};

if (loading) {
return (
<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-[#5D4037]">
Loading...
</div>
);
}

if (!product) return null;

return (
<div className="min-h-screen bg-[#FFF8EC] pb-28 md:pb-0">
{isSaffronProduct(product?.id) && <SaffronFalling />}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
<button onClick={() => navigate(-1)} className="mb-5 hidden md:flex items-center gap-2 text-[#7A3B00] transition-colors hover:text-[#E8620A]">
<ArrowLeft className="h-4 w-4" />
<span className="text-sm font-medium">Back</span>
</button>

<div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr]">

{/* Images */}
<section className="space-y-3">
<div className="overflow-hidden rounded-2xl md:rounded-3xl bg-white shadow-sm ring-1 ring-[#F5A800]/20">
<img src={images[selectedImage]} alt={product.name} className="h-[280px] w-full object-cover sm:h-[400px] md:h-[520px]" />
</div>
{product.video && (
<div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#F5A800]/20">
<video controls className="h-[220px] w-full sm:h-[300px] bg-black"><source src={product.video} /></video>
</div>
)}
{images.length > 1 && (
<div className="flex items-center gap-2">
<button onClick={handlePrevImage} className="md:hidden h-8 w-8 shrink-0 rounded-full border border-[#F5A800]/30 text-[#E8620A] flex items-center justify-center" aria-label="Previous image"><ChevronLeft className="h-4 w-4" /></button>
<div className="flex gap-2 overflow-x-auto pb-1 flex-1">
{images.map((image, index) => (
<button key={image + index} onClick={() => setSelectedImage(index)} className={`shrink-0 overflow-hidden rounded-xl border-2 transition-all ${selectedImage === index ? "border-[#E8620A]" : "border-transparent opacity-60 hover:opacity-100"}`}>
<img src={image} alt={`${product.name} ${index + 1}`} className="h-20 w-20 object-cover" />
</button>
))}
</div>
<button onClick={handleNextImage} className="md:hidden h-8 w-8 shrink-0 rounded-full border border-[#F5A800]/30 text-[#E8620A] flex items-center justify-center" aria-label="Next image"><ChevronRight className="h-4 w-4" /></button>
</div>
)}
<div className="hidden md:block">
<div className="rounded-2xl border border-[#F5A800]/25 bg-[#FFF3D6] p-4">
<div className="grid grid-cols-[130px_1fr_1fr] items-center gap-3">
<div className="flex h-12 items-center justify-between rounded-xl border-2 border-[#E8620A] px-3 text-[#4A1A00]">
<button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
<span className="font-bold text-base">{quantity}</span>
<button onClick={() => setQuantity(quantity + 1)} aria-label="Increase"><Plus className="h-4 w-4" /></button>
</div>
<Button onClick={addToCart} className="h-12 rounded-xl bg-[#4A1A00] hover:bg-[#2A0A00] text-[#FFF8EC] text-sm font-bold">ADD TO CART</Button>
<Button onClick={buyNow} className="h-12 rounded-xl bg-[#E8620A] hover:bg-[#C8380A] text-white text-sm font-bold">BUY IT NOW</Button>
</div>
</div>
</div>
</section>

{/* Info */}
<section className="space-y-4">
<div className="rounded-2xl md:rounded-3xl border border-[#F5A800]/25 bg-white p-5 sm:p-6 shadow-sm">
<span className="inline-block text-[10px] font-bold rounded-full px-3 py-1 bg-[#E8620A]/10 text-[#E8620A] uppercase tracking-widest border border-[#E8620A]/20">New Launch</span>
<h1 className="mt-3 font-heading text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#4A1A00]">{product.name}</h1>
<div className="mt-2 flex items-center gap-2">
<div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F5A800] text-[#F5A800]" />)}</div>
<span className="text-sm font-semibold text-[#7A3B00]">{averageRating.toFixed(1)}</span>
<span className="text-[#C8A060]">·</span>
<span className="text-sm text-[#8B5E1A]">{Array.isArray(product?.reviews) ? product.reviews.length : 0} reviews</span>
</div>
<p className="mt-3 text-[10px] font-bold text-[#E8620A] uppercase tracking-widest">{isSaffronProduct(product?.id) ? "Your Daily Radiance Ritual" : "Your Everyday Essential"}</p>
<p className="mt-2 text-sm leading-relaxed text-[#7A3B00]">{product.description || "Authentic product crafted with traditional care."}</p>
<div className="mt-4 flex items-baseline gap-3">
<p className="text-2xl sm:text-3xl font-bold text-[#4A1A00]">{formatPrice(product.price)}</p>
<p className="text-base font-medium text-[#B0906A] line-through">₹ 1,000</p>
<span className="rounded-full bg-[#E8620A] px-2.5 py-0.5 text-xs font-bold text-white">17% OFF</span>
</div>
<p className="mt-1 text-xs text-[#8B5E1A]">MRP inclusive of all taxes</p>
<div className="mt-4">
<p className="text-sm font-bold text-[#4A1A00] mb-2">Size</p>
<div className="grid grid-cols-2 gap-2 sm:max-w-xs">
{variants.map((variant) => (
<button key={variant.name} onClick={() => setSelectedVariant(variant.name)}
className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${selectedVariant === variant.name ? "border-[#E8620A] bg-[#E8620A] text-white" : "border-[#F5A800]/30 bg-[#FFF3D6] text-[#4A1A00] hover:border-[#E8620A]"}`}>
<div className="font-bold text-sm">{variant.name}</div>
<div className="text-xs mt-0.5 opacity-80">{formatPrice(variant.price || product.price)}</div>
</button>
))}
</div>
</div>
<div className="mt-4 rounded-xl bg-[#E8F5E9] p-3 flex items-center gap-2">
<Check className="h-4 w-4 text-[#2E7D32] shrink-0" />
<p className="text-xs font-medium text-[#1B5E20]">100% Secure Payment · GPay · VISA · PayPal · Mastercard</p>
</div>
<div className="mt-4 grid grid-cols-3 gap-2 text-center">
{[
{ icon: Truck, text: "Free Shipping above ₹500" },
{ icon: Heart, text: isSaffronProduct(product?.id) ? "Pure Saffron Formula" : "Traditional Method" },
{ icon: ShieldCheck, text: isSaffronProduct(product?.id) ? "Dermatologist Tested" : "20+ Quality Checks" },
].map(({ icon: Icon, text }) => (
<div key={text} className="rounded-xl bg-[#FFF3D6] border border-[#F5A800]/20 p-2.5">
<Icon className="h-5 w-5 text-[#E8620A] mx-auto" />
<p className="mt-1.5 text-[10px] font-medium text-[#7A3B00] leading-tight">{text}</p>
</div>
))}
</div>
</div>
</section>
</div>

{/* Below fold */}
<div className="mt-6 space-y-5">

{/* Product Story */}
<div className="rounded-2xl md:rounded-3xl border border-[#F5A800]/25 bg-white p-5 sm:p-6 shadow-sm">
<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8620A] mb-1">Product Story</p>
<h2 className="font-heading text-xl sm:text-2xl text-[#4A1A00] mb-3">Why people keep coming back</h2>
<p className="text-sm leading-relaxed text-[#7A3B00]">{product.description || `NEI Native's ${product.name} is designed to bring a warm, reliable experience into your everyday routine.`}</p>
<div className="mt-4 grid gap-2 sm:grid-cols-3">
{[{ label: "Aromatic", icon: Coffee }, { label: "Smooth", icon: Bean }, { label: "Trusted", icon: Heart }].map(({ label, icon: Icon }) => (
<div key={label} className="flex items-center gap-2 rounded-xl bg-[#FFF3D6] border border-[#F5A800]/20 px-3 py-2.5 text-[#7A3B00]">
<Icon className="h-4 w-4 text-[#E8620A] shrink-0" />
<span className="text-sm font-medium">{label}</span>
</div>
))}
</div>
</div>

{/* Saffron Key Notes */}
{isSaffronProduct(product?.id) && (
<div className="rounded-2xl md:rounded-3xl border border-[#F5A800]/40 bg-gradient-to-br from-[#FFF8EC] to-[#FFF3D6] p-5 sm:p-6 shadow-sm">
<div className="flex items-center gap-2 mb-4">
<span className="text-xl">🌸</span>
<div>
<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8620A]">Saffron Secrets</p>
<h2 className="font-heading text-lg sm:text-xl text-[#4A1A00]">Key Benefits at a Glance</h2>
</div>
</div>
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
{saffronKeyNotes.map(({ icon: Icon, label, desc }) => (
<div key={label} className="rounded-xl bg-white border border-[#F5A800]/25 p-3 flex flex-col gap-1.5 hover:shadow-md hover:border-[#E8620A]/40 transition-all">
<Icon className="h-4 w-4 text-[#E8620A]" />
<p className="font-bold text-xs text-[#4A1A00]">{label}</p>
<p className="text-[11px] text-[#8B5E1A] leading-relaxed">{desc}</p>
</div>
))}
</div>
<div className="mt-4 rounded-xl bg-[#FFF3D6] border border-[#F5A800]/30 p-3">
<p className="text-xs font-bold text-[#4A1A00] mb-1">💡 Pro Tip</p>
<p className="text-xs text-[#7A3B00] leading-relaxed">Apply on clean, slightly damp skin for better absorption. Use morning and night consistently for visible results within 4–6 weeks.</p>
</div>
</div>
)}

{/* Customer Reviews */}
<div className="rounded-2xl md:rounded-3xl border border-[#F5A800]/25 bg-white p-5 sm:p-6 shadow-sm">
<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8620A] mb-1">Customer Reviews</p>
<h2 className="font-heading text-xl sm:text-2xl text-[#4A1A00] mb-4">What people are saying</h2>
<div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-[#F5A800]/15">
<div className="flex items-center gap-3">
<span className="text-4xl font-bold text-[#4A1A00]">{averageRating.toFixed(1)}</span>
<div>
<div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#F5A800] text-[#F5A800]" />)}</div>
<p className="text-xs text-[#8B5E1A] mt-1">{Array.isArray(product?.reviews) ? product.reviews.length : 0} verified reviews</p>
</div>
</div>
<div className="flex-1 space-y-1.5">
{reviewBars.map((row) => (
<div key={row.rating} className="flex items-center gap-2 text-xs text-[#8B5E1A]">
<span className="w-5 shrink-0">{row.rating}★</span>
<div className="h-1.5 flex-1 rounded-full bg-[#FFF3D6] overflow-hidden">
<div className="h-full rounded-full bg-gradient-to-r from-[#E8620A] to-[#F5A800] transition-all duration-700" style={{ width: `${row.count === 0 ? 0 : 100}%` }} />
</div>
<span className="w-5 text-right shrink-0">{row.count}</span>
</div>
))}
</div>
</div>
{user ? (
<div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#FFF3D6] border border-[#F5A800]/25 p-4">
<div>
<p className="text-sm font-semibold text-[#4A1A00]">Share your experience</p>
<p className="text-xs text-[#8B5E1A] mt-0.5">Help other shoppers make confident choices.</p>
</div>
<button onClick={() => setIsReviewModalOpen(true)} className="shrink-0 rounded-xl bg-[#E8620A] hover:bg-[#C8380A] px-4 py-2 text-sm font-bold text-white transition-all hover:shadow-md">Write a Review</button>
</div>
) : (
<div className="mt-4 rounded-xl bg-[#FFF3D6] border border-[#F5A800]/25 p-4 text-sm text-[#7A3B00]">
<a href="/login" className="font-bold text-[#E8620A] hover:underline">Login</a> to write a review and help other shoppers.
</div>
)}
{Array.isArray(product?.reviews) && product.reviews.length > 0 && (
<div className="mt-5 space-y-3">
<h3 className="text-sm font-bold text-[#4A1A00]">Customer Feedback</h3>
{product.reviews.map((review, idx) => (
<div key={idx} className="rounded-xl border border-[#F5A800]/20 bg-[#FFF8EC] p-4 hover:border-[#E8620A]/30 transition-all">
<div className="flex items-start justify-between gap-2 mb-2">
<div className="flex items-center gap-2">
<span className="text-sm font-bold text-[#4A1A00]">{review.user_name || "Anonymous"}</span>
<span className="inline-flex items-center rounded-full bg-[#E8620A]/10 px-2 py-0.5 text-[10px] font-bold text-[#E8620A]">✓ Verified</span>
</div>
<div className="flex gap-0.5 shrink-0">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-[#F5A800] text-[#F5A800]" : "text-[#E8D5A0]"}`} />)}</div>
</div>
<p className="text-sm text-[#7A3B00] leading-relaxed">{review.comment}</p>
{review.image && <img src={review.image} alt="Review" className="mt-3 max-h-32 rounded-xl border border-[#F5A800]/20 object-cover" />}
</div>
))}
</div>
)}
</div>

{/* You May Also Like */}
<div className="rounded-2xl md:rounded-3xl border border-[#F5A800]/25 bg-white p-5 sm:p-6 shadow-sm">
<div className="flex items-center justify-between mb-4">
<div>
<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E8620A] mb-1">You May Also Like</p>
<h2 className="font-heading text-xl sm:text-2xl text-[#4A1A00]">More from the collection</h2>
</div>
<Sparkles className="h-5 w-5 text-[#F5A800]" />
</div>
<div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
{relatedProducts.length > 0 ? relatedProducts.map((item) => {
const itemId = item.id || item._id;
return (
<Link key={itemId} to={`/product/${itemId}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
className="group rounded-xl border border-[#F5A800]/20 bg-[#FFF8EC] p-2.5 transition-all hover:border-[#E8620A]/40 hover:shadow-md hover:-translate-y-0.5">
<div className="overflow-hidden rounded-lg">
<img src={item.images?.[0] || item.image} alt={item.name} className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
</div>
<h3 className="mt-2 text-xs font-bold text-[#4A1A00] line-clamp-2 group-hover:text-[#E8620A] transition-colors leading-snug">{item.name}</h3>
<p className="mt-1 text-xs font-bold text-[#E8620A]">{formatPrice(item.price)}</p>
<p className="mt-1 text-[10px] text-[#8B5E1A] font-medium">View →</p>
</Link>
);
}) : (
<div className="col-span-full rounded-xl border border-dashed border-[#F5A800]/30 p-6 text-sm text-center text-[#8B5E1A]">No additional products found.</div>
)}
</div>
</div>

</div>
</div>

{/* Mobile sticky bar */}
<div className="fixed bottom-0 inset-x-0 z-30 md:hidden border-t border-[#F5A800]/20 bg-[#FFF8EC]/95 p-3 backdrop-blur-sm">
<div className="grid grid-cols-[100px_1fr_1fr] gap-2">
<div className="flex h-11 items-center justify-between rounded-xl border-2 border-[#E8620A] px-3 text-[#4A1A00]">
<button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
<span className="font-bold text-sm">{quantity}</span>
<button onClick={() => setQuantity(quantity + 1)} aria-label="Increase"><Plus className="h-4 w-4" /></button>
</div>
<Button onClick={addToCart} className="h-11 rounded-xl bg-[#4A1A00] text-[#FFF8EC] text-sm font-bold hover:bg-[#2A0A00]">ADD TO CART</Button>
<Button onClick={buyNow} className="h-11 rounded-xl bg-[#E8620A] text-white text-sm font-bold hover:bg-[#C8380A]">BUY NOW</Button>
</div>
</div>

<ReviewModal
isOpen={isReviewModalOpen}
onClose={() => setIsReviewModalOpen(false)}
productId={product?.id}
onReviewSubmit={handleReviewSubmit}
/>
<CartSuccessModal
isOpen={showSuccessModal}
product={successProduct}
onClose={() => setShowSuccessModal(false)}
onViewCart={handleViewCart}
onContinueShopping={handleContinueShopping}
/>
<CartOptionsModal
isOpen={showCartOptionsModal}
product={successProduct}
onClose={() => setShowCartOptionsModal(false)}
onProceedToBuy={handleProceedToBuy}
onContinueShopping={handleContinueShopping}
/>
<LoginRequiredModal
isOpen={showLoginModal}
product={product}
onClose={() => setShowLoginModal(false)}
onLogin={() => { setShowLoginModal(false); navigate("/login"); }}
onContinueShopping={() => setShowLoginModal(false)}
/>
</div>
);
};

export default ProductDetailPage;
