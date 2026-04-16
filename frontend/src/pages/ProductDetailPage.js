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
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCartDrawer } from "../contexts/CartDrawerContext";
import { Button } from "../components/ui/button";
import ReviewModal from "../components/ReviewModal";
import CartSuccessModal from "../components/CartSuccessModal";
import CartOptionsModal from "../components/CartOptionsModal";
import LoginRequiredModal from "../components/LoginRequiredModal";
import FlyingToWishlist from "../components/FlyingToWishlist";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const GUEST_CART_STORAGE_KEY = "guestCartItems";

const ProductDetailPage = () => {
const { id } = useParams();
const navigate = useNavigate();
const { user } = useAuth();
const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
	const { setIsCartOpen } = useCartDrawer();

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
const [flyingWishlist, setFlyingWishlist] = useState({ active: false, start: null, end: null });

const getProductId = (item) => item?.id || item?._id;

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
const sameCategoryProducts = allProducts
.filter((item) => item.id !== product.id)
.filter((item) => item.category === product.category)
.slice(0, 4);
	if (sameCategoryProducts.length > 0) return sameCategoryProducts;

	return allProducts
		.filter((item) => item.id !== product.id)
		.slice(0, 4);
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
				window.dispatchEvent(new Event("cart:updated"));
			} else {
				const guestCartItem = {
					product: {
						...product,
						variant: selectedVariant || product?.size || null,
					},
					quantity,
					variant: selectedVariant || null,
				};
				const rawGuestCart = localStorage.getItem(GUEST_CART_STORAGE_KEY);
				const guestCart = rawGuestCart ? JSON.parse(rawGuestCart) : [];
				const existingIndex = guestCart.findIndex(
					(item) => item.product?.id === product.id && (item.variant || null) === (selectedVariant || null)
				);
				if (existingIndex >= 0) {
					guestCart[existingIndex].quantity += quantity;
				} else {
					guestCart.push(guestCartItem);
				}
				localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(guestCart));
				window.dispatchEvent(new Event("cart:updated"));
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

const toggleWishlistFromDetail = (event) => {
if (!product) return;

const productId = getProductId(product);
if (!productId) return;

const alreadyWishlisted = isWishlisted(productId);
if (alreadyWishlisted) {
removeFromWishlist(productId);
toast.success("Removed from wishlist");
return;
}

const added = addToWishlist(product);
if (!added) return;

const sourceRect = event.currentTarget.getBoundingClientRect();
const targetElement = document.getElementById("wishlist-target-icon");
if (targetElement) {
const targetRect = targetElement.getBoundingClientRect();
setFlyingWishlist({
active: true,
start: {
x: sourceRect.left + sourceRect.width / 2,
y: sourceRect.top + sourceRect.height / 2,
},
end: {
x: targetRect.left + targetRect.width / 2,
y: targetRect.top + targetRect.height / 2,
},
});
setTimeout(() => {
setFlyingWishlist({ active: false, start: null, end: null });
}, 700);
}

toast.success("Added to wishlist");
};

const handleViewCart = () => {
setShowSuccessModal(false);
	setIsCartOpen(true);
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

const handleReviewSubmit = async ({ rating, comment }) => {
if (!user || !user._id) {
toast.error("Please login to submit a review");
return;
}

try {
	const { data } = await axios.post(
		`${BACKEND_URL}/api/products/${id}/reviews`,
		{ rating, comment },
		{ withCredentials: true }
	);

	if (data?.product) {
		setProduct(data.product);
		setAllProducts((prev) => prev.map((item) => (getProductId(item) === getProductId(data.product) ? data.product : item)));
	}

	window.dispatchEvent(new Event("reviews:updated"));
	toast.success("Review submitted successfully!");
} catch (error) {
	toast.error(error?.response?.data?.detail || "Failed to submit review");
	throw error;
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

const isCurrentProductWishlisted = isWishlisted(getProductId(product));

return (
<div className="min-h-screen bg-[#F6F5F2] pb-56 md:pb-0">
<FlyingToWishlist
isActive={flyingWishlist.active}
startPosition={flyingWishlist.start}
endPosition={flyingWishlist.end}
/>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
<button onClick={() => navigate(-1)} className="mb-6 hidden md:flex items-center gap-2 text-[#5D4037] transition-colors hover:text-[#D97736]">
<ArrowLeft className="h-5 w-5" />
Back
</button>

<div className="grid gap-6 md:gap-8 lg:gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
<section className="space-y-4 lg:space-y-4 lg:h-full lg:rounded-[2rem] lg:border lg:border-[#E6DCCB] lg:bg-white lg:p-5 lg:shadow-sm">
<div className="overflow-hidden rounded-2xl md:rounded-[2rem] bg-white shadow-sm ring-1 ring-[#E8DFD2] lg:shadow-none lg:ring-0">
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
</section>

<section className="space-y-6 lg:space-y-5">
<div className="rounded-[2rem] md:border-2 md:border-[#E6DCCB] md:bg-white p-0 md:p-6 lg:p-5 md:shadow-sm">
<div className="flex items-start justify-between gap-3">
<p className="inline-block text-xs font-bold rounded-lg px-3 py-1 bg-[#E8E8E8] text-[#111111]">New Launch</p>
<button
onClick={toggleWishlistFromDetail}
className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${isCurrentProductWishlisted ? "border-[#8B2C6D] bg-[#8B2C6D] text-white" : "border-[#E4DBCF] bg-white text-[#8B2C6D] hover:border-[#8B2C6D]"}`}
aria-label={isCurrentProductWishlisted ? "Remove from wishlist" : "Add to wishlist"}
>
<Heart className={`h-5 w-5 ${isCurrentProductWishlisted ? "fill-current" : ""}`} />
</button>
</div>
<h1 className="mt-3 font-heading text-[42px] font-bold leading-[1.05] md:text-4xl lg:text-[30px] text-[#1E1E1D]">{product.name}</h1>
<div className="mt-2 flex items-center gap-2 text-sm text-[#6B5B52]">
<div className="flex items-center gap-1 text-[#111111]">
{Array.from({ length: 5 }).map((_, index) => (
<Star key={index} className="h-4 w-4 fill-current" />
))}
</div>
<span>{averageRating.toFixed(1)}</span>
</div>
<p className="mt-4 text-xl lg:text-[17px] text-[#3E2723]">Your Everyday A2 Cow Ghee</p>
<p className="mt-3 text-base leading-8 lg:text-[15px] lg:leading-7 text-[#2D2D2C]">{product.description || "Authentic A2 ghee crafted with traditional care for your everyday cooking."}</p>

<div className="mt-5 flex items-center gap-3">
<p className="text-4xl lg:text-[32px] font-semibold text-[#1E1E1D]">{formatPrice(product.price)}</p>
<p className="text-2xl lg:text-[18px] text-[#7F7F7E] line-through"><span className="font-heading tabular-nums">₹ 1,000</span></p>
<span className="rounded-xl bg-[#111111] px-3 py-1 text-base lg:text-sm font-semibold text-white">17% OFF</span>
</div>
<p className="mt-2 text-sm lg:text-xs text-[#4B4B4A]">( <span className="font-heading tabular-nums">₹ 1,000</span> MRP is inclusive of all taxes. )</p>

<div className="mt-6">
<p className="text-3xl lg:text-2xl font-semibold text-[#111111]">Size</p>
<div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-[420px]">
{variants.map((variant) => (
<button
key={variant.name}
onClick={() => setSelectedVariant(variant.name)}
className={`rounded-2xl border-2 px-4 py-3 text-left transition ${selectedVariant === variant.name ? "border-[#111111] bg-[#111111] text-white" : "border-[#D0D0D0] bg-white"}`}
>
<div className="font-semibold text-3xl lg:text-2xl leading-none">{variant.name}</div>
<div className="text-2xl lg:text-xl leading-none mt-2">{formatPrice(variant.price || product.price)}</div>
</button>
))}
</div>
</div>

<div className="mt-8 lg:mt-10 rounded-xl bg-[#CEE7CB] p-3">
<div className="flex items-center gap-3 text-[#1E1E1D]">
<Check className="h-5 w-5 text-[#1D8B3A]" />
<p className="text-sm lg:text-xs font-medium">100 % Secure Payment Guarantee</p>
</div>
<div className="mt-2 flex items-center gap-2 overflow-x-auto">
<div className="rounded-md bg-white px-2 py-1 text-sm lg:text-xs font-semibold text-[#6B5B52]">GPay</div>
<div className="rounded-md bg-white px-2 py-1 text-sm lg:text-xs font-semibold text-[#1B5FC9]">VISA</div>
<div className="rounded-md bg-white px-2 py-1 text-sm lg:text-xs font-semibold text-[#1B5FC9]">PayPal</div>
<div className="rounded-md bg-white px-2 py-1 text-sm lg:text-xs font-semibold text-[#C1483F]">Mastercard</div>
<div className="rounded-md bg-white px-2 py-1 text-sm lg:text-xs font-semibold text-[#111111]">Apple Pay</div>
</div>
</div>

<div className="mt-8 lg:mt-10 grid grid-cols-3 gap-3 text-center">
<div className="rounded-xl bg-[#F7F4EF] p-3 lg:p-2.5">
<Truck className="h-6 w-6 text-[#8B2C6D] mx-auto" />
<p className="mt-2 text-sm lg:text-xs font-medium text-[#1E1E1D]">Free Shipping on Order Above <span className="font-heading tabular-nums">₹ 500</span></p>
</div>
<div className="rounded-xl bg-[#F7F4EF] p-3 lg:p-2.5">
<Heart className="h-6 w-6 text-[#8B2C6D] mx-auto" />
<p className="mt-2 text-sm lg:text-xs font-medium text-[#1E1E1D]">Made with Traditional Bilona Method</p>
</div>
<div className="rounded-xl bg-[#F7F4EF] p-3 lg:p-2.5">
<ShieldCheck className="h-6 w-6 text-[#8B2C6D] mx-auto" />
<p className="mt-2 text-sm lg:text-xs font-medium text-[#1E1E1D]">20+ Quality Check Pass</p>
</div>
</div>

<div className="mt-8 lg:mt-10 hidden md:block">
<div className="rounded-2xl border border-[#E3DBCE] bg-[#FCFAF7] p-4 lg:p-5">
<div className="flex flex-col gap-4 lg:grid lg:grid-cols-[104px_minmax(0,1fr)] lg:items-center lg:gap-3">
<div className="flex h-12 w-full items-center justify-between rounded-xl border-2 border-[#8B2C6D] px-3 text-[#5D5D5D] lg:w-full">
<button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
<Minus className="h-4 w-4" />
</button>
<span className="font-semibold">{quantity}</span>
<button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
<Plus className="h-4 w-4" />
</button>
</div>
<div className="grid w-full grid-cols-2 gap-3 lg:flex-1">
<Button onClick={addToCart} className="h-12 rounded-xl bg-[#111111] font-semibold text-white hover:bg-[#2A2A2A] lg:text-xs">
ADD TO CART
</Button>
<Button onClick={buyNow} className="h-12 rounded-xl bg-[#D97736] font-semibold text-white hover:bg-[#C96626] lg:text-xs">
BUY IT NOW
</Button>
</div>
</div>
</div>
</div>

	<div className="mt-6 lg:mt-8 rounded-2xl border border-[#E9E0D2] bg-[#FAF7F2] p-4 lg:p-6">
	<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<p className="text-xs lg:text-[11px] font-bold uppercase tracking-[0.24em] text-[#D97736]">Order Support</p>
			<p className="mt-1 text-sm lg:text-xs text-[#5D4037]">Already ordered? Open the tracking page from here.</p>
		</div>
		<Link to="/track-order" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2A2A2A] lg:px-4 lg:py-2.5 lg:text-xs">
			View order
			<ChevronRight className="h-4 w-4" />
		</Link>
		</div>
	</div>

</div>

</section>
</div>

<div className="mt-3 space-y-6 lg:mt-6 lg:space-y-5">
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

<div className="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-5 sm:p-7 shadow-sm">
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
<div className="mt-6 rounded-2xl bg-[#FAF7F2] p-4 text-sm text-[#6B5B52]">
<button onClick={() => setIsReviewModalOpen(true)} className="font-semibold text-[#D97736] hover:underline">
Write a review
</button>
<span> and help other shoppers choose confidently.</span>
</div>
</div>

<section className="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-5 sm:p-7 shadow-sm">
<div className="flex items-center justify-between gap-4">
<div>
<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">You May Also Like</p>
							<h2 className="mt-1 font-heading text-2xl text-[#3E2723]">Recommended next</h2>
</div>
<Sparkles className="h-5 w-5 text-[#D97736]" />
</div>
<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{relatedProducts.length > 0 ? (
						relatedProducts.map((item) => {
							const relatedProductId = getProductId(item);
							if (!relatedProductId) return null;
							return (
								<Link key={relatedProductId} to={`/product/${relatedProductId}`} className="group rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3 transition hover:border-[#D97736]">
									<img src={item.images?.[0]} alt={item.name} className="h-40 w-full rounded-xl object-cover" />
									<h3 className="mt-3 line-clamp-2 font-heading text-lg font-bold text-[#3E2723] group-hover:text-[#D97736]">{item.name}</h3>
									<p className="mt-1 text-sm text-[#6B5B52]">{formatPrice(item.price)}</p>
								</Link>
							);
						})
) : (
						<div className="rounded-2xl border border-dashed border-[#E0D8C8] bg-[#FAF7F2] p-6 text-sm text-[#6B5B52]">More products will appear here soon.</div>
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
	<div className="mt-3 rounded-2xl border border-[#E9E0D2] bg-[#FAF7F2] p-3">
		<div className="flex items-center justify-between gap-3">
			<div>
				<p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D97736]">View order</p>
				<p className="text-sm text-[#5D4037]">Track placed orders from the support page.</p>
			</div>
			<Link to="/track-order" className="inline-flex items-center gap-1 rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white">
				Track
				<ChevronRight className="h-4 w-4" />
			</Link>
		</div>
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
