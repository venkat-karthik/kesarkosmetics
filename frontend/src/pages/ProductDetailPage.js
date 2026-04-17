import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import axios from "axios";
import { formatPrice } from "../utils/helpers";
import useSupabaseUser from "../hooks/useSupabaseUser";
import { Button } from "../components/ui/button";
import ReviewModal from "../components/ReviewModal";
import CartSuccessModal from "../components/CartSuccessModal";
import CartOptionsModal from "../components/CartOptionsModal";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const ProductDetailPage = () => {
const { id } = useParams();
const navigate = useNavigate();
const { user, loading: userLoading } = useSupabaseUser();

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
				const [productResponse, productsResponse] = await Promise.all([
					axios.get(`${BACKEND_URL}/api/products/${id}`),
					axios.get(`${BACKEND_URL}/api/products`),
				]);

				setProduct(productResponse.data);
				setAllProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
				setSelectedImage(0);
				if (productResponse.data?.variants?.length > 0) {
					setSelectedVariant(productResponse.data.variants[0].name);
				} else {
					setSelectedVariant(productResponse.data?.size || null);
				}
			} catch {
				toast.error("Product not found");
				navigate("/");
			} finally {
				setLoading(false);
			}
		};

		// Fetch immediately on load
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
	if (!product) return [];
	const sameCategory = allProducts.filter((item) => item.category === product.category);
	// If there are exactly two products in the category, show only the other one
	if (sameCategory.length === 2) {
		return sameCategory.filter((item) => item.id !== product.id);
	}
	// Otherwise, show up to 4 other products (excluding the current one)
	return sameCategory.filter((item) => item.id !== product.id).slice(0, 4);
}, [allProducts, product]);

const averageRating = Number(product?.rating || 4.5);
const reviewBars = [5, 4, 3, 2, 1].map((rating) => ({
rating,
count: rating === 5 ? 11 : rating === 4 ? 11 : 0,
}));

const addToCart = async () => {
if (!product) return false;
try {
if (user && user._id) {
await axios.post(
`${BACKEND_URL}/api/cart/add`,
{ product_id: product.id, quantity, variant: selectedVariant },
{ withCredentials: true }
);
}
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
	// Add the new review to the product state immediately
	const newReview = {
		rating,
		comment,
		user_name: user.name || user.email || "Anonymous",
		image,
	};
	setProduct((prev) => ({
		...prev,
		reviews: Array.isArray(prev.reviews) ? [newReview, ...prev.reviews] : [newReview],
	}));
	toast.success("Review submitted successfully!");
	// Optionally, send to backend here
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
<div className="min-h-screen bg-[#F6F5F2] pb-28 md:pb-0">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
<button onClick={() => navigate(-1)} className="mb-6 hidden md:flex items-center gap-2 text-[#5D4037] transition-colors hover:text-[#D97736]">
<ArrowLeft className="h-5 w-5" />
Back
</button>

<div className="grid gap-6 md:gap-6 lg:gap-5 lg:grid-cols-[1.08fr_0.92fr]">
<section className="space-y-4 lg:space-y-3">
<div className="overflow-hidden rounded-2xl md:rounded-[2rem] bg-white shadow-sm ring-1 ring-[#E8DFD2]">
<img
src={images[selectedImage]}
alt={product.name}
className="h-[290px] w-full object-cover sm:h-[420px] md:h-[540px]"
/>
</div>
{product.video ? (
<div className="overflow-hidden rounded-2xl md:rounded-[2rem] bg-white shadow-sm ring-1 ring-[#E8DFD2]">
<video controls className="h-[240px] w-full object-cover sm:h-[320px] md:h-[360px] bg-black">
<source src={product.video} />
Your browser does not support the video tag.
</video>
</div>
) : null}
{images.length > 1 ? (
<div className="flex items-center gap-2">
<button
onClick={handlePrevImage}
className="md:hidden h-8 w-8 shrink-0 rounded-full border border-[#E2DACA] text-[#8B2C6D] flex items-center justify-center"
aria-label="Previous image"
>
<ChevronLeft className="h-4 w-4" />
</button>
<div className="flex gap-3 overflow-x-auto pb-1 flex-1">
{images.map((image, index) => (
<button key={image + index} onClick={() => setSelectedImage(index)} className={`shrink-0 overflow-hidden rounded-2xl border-2 transition ${selectedImage === index ? "border-[#D97736]" : "border-transparent"}`}>
<img src={image} alt={`${product.name} ${index + 1}`} className="h-24 w-24 object-cover" />
</button>
))}
</div>
<button
onClick={handleNextImage}
className="md:hidden h-8 w-8 shrink-0 rounded-full border border-[#E2DACA] text-[#8B2C6D] flex items-center justify-center"
aria-label="Next image"
>
<ChevronRight className="h-4 w-4" />
</button>
</div>
) : null}

<div className="mt-5 hidden md:block lg:mt-6">
<div className="rounded-2xl border border-[#E3DBCE] bg-[#FCFAF7] p-5 lg:p-6">
<div className="grid grid-cols-[150px_1fr_1fr] items-center gap-4">
<div className="flex h-14 items-center justify-between rounded-xl border-2 border-[#8B2C6D] px-4 text-[#5D5D5D]">
<button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
<Minus className="h-5 w-5" />
</button>
<span className="text-lg font-semibold">{quantity}</span>
<button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
<Plus className="h-5 w-5" />
</button>
</div>
<Button onClick={addToCart} className="h-14 rounded-xl bg-[#111111] text-base font-semibold text-white hover:bg-[#2A2A2A]">
ADD TO CART
</Button>
<Button onClick={buyNow} className="h-14 rounded-xl bg-[#D97736] text-base font-semibold text-white hover:bg-[#C96626]">
BUY IT NOW
</Button>
</div>
</div>
</div>
</section>

<section className="space-y-6 lg:space-y-4">
<div className="rounded-[2rem] md:border-2 md:border-[#E6DCCB] md:bg-white p-0 md:p-6 lg:p-6 md:shadow-sm">
<p className="inline-block text-sm font-bold rounded-lg px-3 py-1 bg-[#E8E8E8] text-[#111111]">New Launch</p>
<h1 className="mt-3 font-heading text-[48px] font-bold leading-[1.02] md:text-5xl text-[#1E1E1D]">{product.name}</h1>
<div className="mt-2 flex items-center gap-2 text-sm text-[#6B5B52]">
<div className="flex items-center gap-1 text-[#111111]">
{Array.from({ length: 5 }).map((_, index) => (
<Star key={index} className="h-4 w-4 fill-current" />
))}
</div>
<span>{averageRating.toFixed(1)}</span>
</div>
<p className="mt-4 text-2xl font-semibold text-[#3E2723]">Your Everyday A2 Cow Ghee</p>
<p className="mt-3 text-lg font-medium leading-8 text-[#2D2D2C]">{product.description || "Authentic A2 ghee crafted with traditional care for your everyday cooking."}</p>

<div className="mt-5 flex items-center gap-3">
<p className="text-5xl font-bold text-[#1E1E1D]">{formatPrice(product.price)}</p>
<p className="text-3xl font-medium text-[#7F7F7E] line-through">₹ 1,000</p>
<span className="rounded-xl bg-[#111111] px-3 py-1 text-lg font-bold text-white">17% OFF</span>
</div>
<p className="mt-2 text-base font-medium text-[#4B4B4A]">( ₹ 1,000 MRP is inclusive of all taxes. )</p>

<div className="mt-6">
<p className="text-4xl font-bold text-[#111111]">Size</p>
<div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-[420px]">
{variants.map((variant) => (
<button
key={variant.name}
onClick={() => setSelectedVariant(variant.name)}
className={`rounded-2xl border-2 px-4 py-3 text-left transition ${selectedVariant === variant.name ? "border-[#111111] bg-[#111111] text-white" : "border-[#D0D0D0] bg-white"}`}
>
<div className="font-bold text-[2rem] leading-none">{variant.name}</div>
<div className="mt-2 text-2xl font-semibold leading-none">{formatPrice(variant.price || product.price)}</div>
</button>
))}
</div>
</div>

<div className="mt-6 rounded-xl bg-[#CEE7CB] p-3">
<div className="flex items-center gap-3 text-[#1E1E1D]">
<Check className="h-5 w-5 text-[#1D8B3A]" />
<p className="text-sm font-medium">100 % Secure Payment Guarantee</p>
</div>
<div className="mt-2 flex items-center gap-2 overflow-x-auto">
<div className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-[#6B5B52]">GPay</div>
<div className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-[#1B5FC9]">VISA</div>
<div className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-[#1B5FC9]">PayPal</div>
<div className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-[#C1483F]">Mastercard</div>
<div className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-[#111111]">Apple Pay</div>
</div>
</div>

<div className="mt-6 grid grid-cols-3 gap-3 text-center">
<div className="rounded-xl bg-[#F7F4EF] p-3">
<Truck className="h-6 w-6 text-[#8B2C6D] mx-auto" />
<p className="mt-2 text-sm font-medium text-[#1E1E1D]">Free Shipping on Order Above ₹ 500</p>
</div>
<div className="rounded-xl bg-[#F7F4EF] p-3">
<Heart className="h-6 w-6 text-[#8B2C6D] mx-auto" />
<p className="mt-2 text-sm font-medium text-[#1E1E1D]">Made with Traditional Bilona Method</p>
</div>
<div className="rounded-xl bg-[#F7F4EF] p-3">
<ShieldCheck className="h-6 w-6 text-[#8B2C6D] mx-auto" />
<p className="mt-2 text-sm font-medium text-[#1E1E1D]">20+ Quality Check Pass</p>
</div>
</div>

</div>

</section>
</div>

<div className="mt-6 space-y-6 lg:mt-6 lg:space-y-5">
<div className="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-5 sm:p-7 shadow-sm">
<div className="flex items-center justify-between gap-4">
<div>
<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Product Story</p>
<h2 className="mt-1 font-heading text-2xl text-[#3E2723]">Why people keep coming back</h2>
</div>
<ChevronDown className="h-5 w-5 text-[#D97736]" />
</div>
<p className="mt-4 leading-7 text-[#6B5B52]">
{product.description || `Nei Native's ${product.name} is designed to bring a warm, reliable experience into your everyday routine.`}
</p>
<div className="mt-5 grid gap-3 sm:grid-cols-3">
{[
{ label: "Aromatic", icon: Coffee },
{ label: "Smooth", icon: Bean },
{ label: "Trusted", icon: Heart },
].map(({ label, icon: Icon }) => (
<div key={label} className="flex items-center gap-3 rounded-2xl bg-[#FAF7F2] px-4 py-3 text-[#5D4037]">
<Icon className="h-5 w-5 text-[#D97736]" />
{label}
</div>
))}
</div>
</div>




<div className="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-5 sm:p-7 shadow-sm mb-8">
	<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Customer Reviews</p>
	<div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
		<div className="flex items-center gap-4">
			<div className="text-5xl font-bold text-[#3E2723]">{averageRating.toFixed(1)}</div>
			<div>
				<div className="flex items-center gap-1 text-[#D97736]">
					{Array.from({ length: 5 }).map((_, index) => (
						<Star key={index} className="h-4 w-4 fill-current" />
					))}
				</div>
				<p className="mt-2 text-sm text-[#6B5B52]">11 verified reviews</p>
			</div>
		</div>
		<div className="flex-1 space-y-2">
			{reviewBars.map((row) => (
				<div key={row.rating} className="flex items-center gap-3 text-sm text-[#6B5B52]">
					<span className="w-6">{row.rating}</span>
					<div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EEE5D7]">
						<div className="h-full rounded-full bg-[#D97736]" style={{ width: `${row.count === 0 ? 0 : 100}%` }} />
					</div>
					<span className="w-8 text-right">{row.count}</span>
				</div>
			))}
		</div>
	</div>
		{/* Only show Write a review button if user is logged in */}
		{user && (
			<div className="mt-6 rounded-2xl bg-[#FAF7F2] p-4 text-sm text-[#6B5B52]">
				<button onClick={() => setIsReviewModalOpen(true)} className="font-semibold text-[#D97736] hover:underline">
					Write a review
				</button>
				<span> and help other shoppers choose confidently.</span>
			</div>
		)}
	{/* User Reviews List */}
	{Array.isArray(product?.reviews) && product.reviews.length > 0 && (
		<div className="mt-8">
			<h3 className="font-heading text-xl font-bold mb-4 text-[#3E2723]">What users are saying</h3>
			<div className="space-y-4">
				 {product.reviews.map((review, idx) => (
					 <div key={idx} className="rounded-xl border border-[#E9E0D2] bg-[#FCFAF7] p-4">
						 <div className="flex items-center gap-2 mb-1">
							 <span className="font-semibold text-[#D97736]">{review.user_name || 'Anonymous'}</span>
							 <span className="text-xs text-[#6B5B52]">{review.rating}★</span>
						 </div>
						 <div className="text-[#3E2723]">{review.comment}</div>
						 {review.image && (
							 <div className="mt-3">
								 <img src={review.image} alt="Review" className="max-h-40 rounded-lg border border-[#E9E0D2]" />
							 </div>
						 )}
					 </div>
				 ))}
			</div>
		</div>
	)}
</div>

<section className="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-5 sm:p-7 shadow-sm">
<div className="flex items-center justify-between gap-4">
<div>
<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">You May Also Like</p>
<h2 className="mt-1 font-heading text-2xl text-[#3E2723]">More from the collection</h2>
</div>
<Sparkles className="h-5 w-5 text-[#D97736]" />
</div>
<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
{relatedProducts.length > 0 ? (
relatedProducts.map((item) => (
<Link key={item.id} to={`/product/${item.id}`} className="group rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3 transition hover:border-[#D97736]">
<img src={item.images?.[0]} alt={item.name} className="h-40 w-full rounded-xl object-cover" />
<h3 className="mt-3 line-clamp-2 font-heading text-xl sm:text-2xl font-bold leading-[1.08] text-[#3E2723] group-hover:text-[#D97736]">{item.name}</h3>
<p className="mt-1 text-sm text-[#6B5B52]">{formatPrice(item.price)}</p>
</Link>
))
) : (
<div className="rounded-2xl border border-dashed border-[#E0D8C8] bg-[#FAF7F2] p-6 text-sm text-[#6B5B52]">No additional products found.</div>
)}
</div>
</section>
</div>
</div>

<div className="fixed bottom-0 inset-x-0 z-30 md:hidden border-t border-[#E2E2E2] bg-white/95 p-3 backdrop-blur-sm">
<div className="grid grid-cols-[106px_1fr_1fr] gap-2">
<div className="flex h-12 items-center justify-between rounded-xl border-2 border-[#8B2C6D] px-3 text-[#5D5D5D]">
<button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
<Minus className="h-4 w-4" />
</button>
<span className="font-semibold">{quantity}</span>
<button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
<Plus className="h-4 w-4" />
</button>
</div>
<Button onClick={addToCart} className="h-12 rounded-xl bg-[#D97736] font-semibold text-white hover:bg-[#C96626]">
ADD TO CART
</Button>
<Button onClick={buyNow} className="h-12 rounded-xl bg-[#D97736] font-semibold text-white hover:bg-[#C96626]">
BUY IT NOW
</Button>
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
onLogin={() => {
setShowLoginModal(false);
navigate("/login");
}}
onContinueShopping={() => setShowLoginModal(false)}
/>
</div>
);
};

export default ProductDetailPage;
