import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { formatPrice } from "../utils/helpers";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCartDrawer } from "../contexts/CartDrawerContext";
import Footer from "../components/Footer";
import CartSuccessModal from "../components/CartSuccessModal";
import CartOptionsModal from "../components/CartOptionsModal";
import FlyingToCart from "../components/FlyingToCart";
import FlyingToWishlist from "../components/FlyingToWishlist";
import LoginRequiredModal from "../components/LoginRequiredModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const GUEST_CART_STORAGE_KEY = "guestCartItems";
const HERO_HEIGHT_CLASSES = "h-[420px] sm:h-[520px] lg:h-[620px] xl:h-[700px]";
const HERO_IMAGE_FIT_CLASSES = "object-cover lg:object-contain";
const HOME_HERO_BACKGROUND_IMAGE = "/background1.jpeg";
const PRODUCTS_SECTION_BACKGROUND_IMAGE = "/background2.jpeg";

const HomePage = ({ setShakeCart, setTriggerCartRefresh }) => {
	const [products, setProducts] = useState([]);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
	const { setIsCartOpen } = useCartDrawer();
	const [error, setError] = useState("");
	const [addingToCart, setAddingToCart] = useState(null);
	const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successProduct, setSuccessProduct] = useState(null);
	const [showCartOptionsModal, setShowCartOptionsModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [loginModalProduct, setLoginModalProduct] = useState(null);
	const [hoveredImageIndices, setHoveredImageIndices] = useState({});
	const [categoryHoverIndices, setCategoryHoverIndices] = useState({});
	const [flyingCart, setFlyingCart] = useState({ active: false, position: null });
	const [flyingWishlist, setFlyingWishlist] = useState({ active: false, start: null, end: null });
	const [isAutoScrolling, setIsAutoScrolling] = useState(true);
	const [selectedCircleProductId, setSelectedCircleProductId] = useState(null);
	const [reviewStartIndex, setReviewStartIndex] = useState(0);
	const [isReviewSectionVisible, setIsReviewSectionVisible] = useState(false);
	const autoScrollTimeoutRef = useRef(null);
	const reviewSectionRef = useRef(null);
	const reviewSectionObserverRef = useRef(null);
	const addToCartButtonRefs = useRef({});
	const hoverIntervalsRef = useRef({});
	const categoryHoverIntervalsRef = useRef({});

	const getProductId = (product) => product.id || product._id;

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const category = searchParams.get("category");
				const url = category ? `${BACKEND_URL}/api/products?category=${category}` : `${BACKEND_URL}/api/products`;
				const { data } = await axios.get(url);
				console.log("Fetched products:", data);
				const productArray = Array.isArray(data) ? data : [];
				setProducts(productArray);
				setError("");
			} catch (err) {
				console.error("Product fetch error:", err);
				setError("Could not load products. Please check backend server.");
				setProducts([]);
			}
		};

		// Fetch immediately on load
		fetchProducts();

		// Set up periodic refresh every 10 seconds for admin changes
		const interval = setInterval(fetchProducts, 10000);

		// Refetch when page becomes visible (when switching tabs/windows)
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				fetchProducts();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("reviews:updated", fetchProducts);

		return () => {
			clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("reviews:updated", fetchProducts);
		};
	}, [searchParams]);

	// Auto-scroll carousel
	useEffect(() => {
		if (products.length === 0 || !isAutoScrolling) return;
		
		const interval = setInterval(() => {
			setCurrentCarouselIndex((prev) => (prev + 1) % products.length);
		}, 5000); // Change image every 5 seconds
		
		return () => clearInterval(interval);
	}, [products.length, isAutoScrolling]);

	useEffect(() => {
		return () => {
			Object.values(hoverIntervalsRef.current).forEach((intervalId) => clearInterval(intervalId));
			Object.values(categoryHoverIntervalsRef.current).forEach((intervalId) => clearInterval(intervalId));
		};
	}, []);

	const startProductHoverScroll = (productId, imageCount) => {
		if (imageCount <= 1) return;

		setHoveredImageIndices((prev) => ({
			...prev,
			[productId]: 0,
		}));

		if (hoverIntervalsRef.current[productId]) {
			clearInterval(hoverIntervalsRef.current[productId]);
		}

		hoverIntervalsRef.current[productId] = setInterval(() => {
			setHoveredImageIndices((prev) => {
				const currentIndex = prev[productId] ?? 0;
				const nextIndex = currentIndex + 1;

				if (nextIndex >= imageCount) {
					if (hoverIntervalsRef.current[productId]) {
						clearInterval(hoverIntervalsRef.current[productId]);
						delete hoverIntervalsRef.current[productId];
					}
					return prev;
				}

				return {
					...prev,
					[productId]: nextIndex,
				};
			});
		}, 900);
	};

	const stopProductHoverScroll = (productId) => {
		if (hoverIntervalsRef.current[productId]) {
			clearInterval(hoverIntervalsRef.current[productId]);
			delete hoverIntervalsRef.current[productId];
		}

		setHoveredImageIndices((prev) => ({
			...prev,
			[productId]: 0,
		}));
	};

	const startCategoryHoverScroll = (categoryKey, imageCount) => {
		if (imageCount <= 1) return;

		setCategoryHoverIndices((prev) => ({
			...prev,
			[categoryKey]: 0,
		}));

		if (categoryHoverIntervalsRef.current[categoryKey]) {
			clearInterval(categoryHoverIntervalsRef.current[categoryKey]);
		}

		categoryHoverIntervalsRef.current[categoryKey] = setInterval(() => {
			setCategoryHoverIndices((prev) => {
				const currentIndex = prev[categoryKey] ?? 0;
				const nextIndex = currentIndex + 1;

				if (nextIndex >= imageCount) {
					if (categoryHoverIntervalsRef.current[categoryKey]) {
						clearInterval(categoryHoverIntervalsRef.current[categoryKey]);
						delete categoryHoverIntervalsRef.current[categoryKey];
					}
					return prev;
				}

				return {
					...prev,
					[categoryKey]: nextIndex,
				};
			});
		}, 700);
	};

	const stopCategoryHoverScroll = (categoryKey) => {
		if (categoryHoverIntervalsRef.current[categoryKey]) {
			clearInterval(categoryHoverIntervalsRef.current[categoryKey]);
			delete categoryHoverIntervalsRef.current[categoryKey];
		}

		setCategoryHoverIndices((prev) => ({
			...prev,
			[categoryKey]: 0,
		}));
	};

	const addToCart = async (product, quantity = 1) => {
		// Get button position for flying animation
		const buttonElement = addToCartButtonRefs.current[product.id];
		if (buttonElement) {
			const rect = buttonElement.getBoundingClientRect();
			setFlyingCart({
				active: true,
				position: { x: rect.left, y: rect.top },
			});
		}
		
		setAddingToCart(product.id);
		try {
			if (user && user._id) {
				await axios.post(
					`${BACKEND_URL}/api/cart/add`,
					{ product_id: product.id, quantity },
					{ withCredentials: true }
				);
			} else {
				const guestCartItem = {
					product,
					quantity,
					variant: null,
				};
				const rawGuestCart = localStorage.getItem(GUEST_CART_STORAGE_KEY);
				const guestCart = rawGuestCart ? JSON.parse(rawGuestCart) : [];
				const existingIndex = guestCart.findIndex((item) => item.product?.id === product.id);
				if (existingIndex >= 0) {
					guestCart[existingIndex].quantity += quantity;
				} else {
					guestCart.push(guestCartItem);
				}
				localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(guestCart));
			}

			window.dispatchEvent(new Event("cart:updated"));
			
			// Trigger cart shake after flying animation completes
			setTimeout(() => {
				if (setShakeCart) {
					setShakeCart(true);
					setTimeout(() => setShakeCart(false), 600);
				}
				// Refresh cart count in header
				if (setTriggerCartRefresh) {
					setTriggerCartRefresh((prev) => prev + 1);
				}
			}, 800);
			
			// Show success modal after animations
			setTimeout(() => {
				setSuccessProduct(product);
				setShowSuccessModal(true);
			}, 1000);
			
		} catch (err) {
			toast.error("Failed to add to cart");
			console.error(err);
		} finally {
			setAddingToCart(null);
		}
	};

	const handleViewCart = () => {
		setShowSuccessModal(false);
		setShowCartOptionsModal(false);
		setIsCartOpen(true);
	};

	const handleContinueShopping = () => {
		setShowSuccessModal(false);
		setShowCartOptionsModal(false);
	};

	const handleProceedToBuy = () => {
		setShowCartOptionsModal(false);
		if (!user || !user._id) {
			setLoginModalProduct(successProduct);
			setShowLoginModal(true);
			return;
		}
		navigate("/checkout");
	};

	const handleLoginFromModal = () => {
		setShowLoginModal(false);
		navigate("/login");
	};

	const handleGuestContinueShopping = () => {
		setShowLoginModal(false);
	};

	const handleCarouselNext = () => {
		setIsAutoScrolling(false);
		setCurrentCarouselIndex((prev) => (prev + 1) % Math.max(products.length, 1));
		
		// Resume auto-scroll after 8 seconds
		if (autoScrollTimeoutRef.current) {
			clearTimeout(autoScrollTimeoutRef.current);
		}
		autoScrollTimeoutRef.current = setTimeout(() => {
			setIsAutoScrolling(true);
		}, 8000);
	};

	const handleCarouselPrev = () => {
		setIsAutoScrolling(false);
		setCurrentCarouselIndex((prev) => (prev - 1 + Math.max(products.length, 1)) % Math.max(products.length, 1));
		
		// Resume auto-scroll after 8 seconds
		if (autoScrollTimeoutRef.current) {
			clearTimeout(autoScrollTimeoutRef.current);
		}
		autoScrollTimeoutRef.current = setTimeout(() => {
			setIsAutoScrolling(true);
		}, 8000);
	};

	const handleCarouselDotClick = (index) => {
		setIsAutoScrolling(false);
		setCurrentCarouselIndex(index);
		
		// Resume auto-scroll after 8 seconds
		if (autoScrollTimeoutRef.current) {
			clearTimeout(autoScrollTimeoutRef.current);
		}
		autoScrollTimeoutRef.current = setTimeout(() => {
			setIsAutoScrolling(true);
		}, 8000);
	};

	const handleCircleProductClick = (productId) => {
		setSelectedCircleProductId(productId);
		navigate(`/product/${productId}`);
	};

	const toggleWishlistFromCard = (event, product) => {
		event.preventDefault();
		event.stopPropagation();

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

	const heroCircleProducts = products
		.map((product) => {
			const productId = product.id || product._id;
			const productImages = Array.isArray(product.images)
				? product.images
				: product.image
					? [product.image]
					: [];

			return {
				id: productId,
				label: product.name,
				images: productImages,
			};
		})
		.filter((item) => Boolean(item.id));

	const featuredReviews = useMemo(() => {
		return products
			.flatMap((product) => {
				const productId = product.id || product._id;
				const reviews = Array.isArray(product.reviews) ? product.reviews : [];

				return reviews.map((review, index) => ({
					id: `${productId}-${index}`,
					productId,
					productName: product.name,
					rating: Number(review.rating || 0),
					comment: String(review.comment || "").trim(),
					userName: review.user_name || "Anonymous",
				}));
			})
			.filter((review) => review.rating > 0 && review.comment)
			.slice(0, 12);
	}, [products]);

	const reviewWindow = useMemo(() => {
		if (featuredReviews.length === 0) return [];
		const visibleCount = Math.min(3, featuredReviews.length);
		return Array.from({ length: visibleCount }, (_, index) => featuredReviews[(reviewStartIndex + index) % featuredReviews.length]);
	}, [featuredReviews, reviewStartIndex]);

	const handleReviewPrev = () => {
		setReviewStartIndex((prev) => {
			if (featuredReviews.length === 0) return 0;
			return (prev - 1 + featuredReviews.length) % featuredReviews.length;
		});
	};

	const handleReviewNext = () => {
		setReviewStartIndex((prev) => {
			if (featuredReviews.length === 0) return 0;
			return (prev + 1) % featuredReviews.length;
		});
	};

	useEffect(() => {
		if (!reviewSectionRef.current) return undefined;

		reviewSectionObserverRef.current?.disconnect?.();
		reviewSectionObserverRef.current = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsReviewSectionVisible(true);
				}
			},
			{ threshold: 0.22 }
		);

		reviewSectionObserverRef.current.observe(reviewSectionRef.current);

		return () => {
			reviewSectionObserverRef.current?.disconnect?.();
		};
	}, [featuredReviews.length]);

	useEffect(() => {
		if (heroCircleProducts.length === 0) {
			setSelectedCircleProductId(null);
			return;
		}

		const selectedStillExists = heroCircleProducts.some((item) => item.id === selectedCircleProductId);
		if (!selectedStillExists) {
			setSelectedCircleProductId(heroCircleProducts[0].id);
		}
	}, [heroCircleProducts, selectedCircleProductId]);

	return (
		<div className="min-h-screen bg-[#F3F3F3]">
			{/* Flying Cart Animation */}
			<FlyingToCart
				isActive={flyingCart.active}
				startPosition={flyingCart.position}
				onComplete={() => setFlyingCart({ active: false, position: null })}
			/>
			<FlyingToWishlist
				isActive={flyingWishlist.active}
				startPosition={flyingWishlist.start}
				endPosition={flyingWishlist.end}
			/>

			<section className="relative w-full bg-[#532126] overflow-hidden">
				{products.length > 0 && (
					<div className={`relative w-full ${HERO_HEIGHT_CLASSES} overflow-hidden group`}>
						<div className="absolute inset-0">
							<Link to={`/product/${products[currentCarouselIndex].id}`}>
								<img
									src={products[currentCarouselIndex].images?.[0] || HOME_HERO_BACKGROUND_IMAGE}
									alt={products[currentCarouselIndex].name}
									className={`w-full h-full ${HERO_IMAGE_FIT_CLASSES} object-center opacity-75 sm:opacity-80 transition-all duration-1000`}
								/>
							</Link>
							<div className="absolute inset-0 bg-gradient-to-r from-[#3A120F]/58 via-[#3A120F]/38 to-[#3A120F]/62" />
						</div>

						<div className="absolute inset-0 flex items-center">
							<div className="w-full max-w-7xl mx-auto px-5 sm:px-7 lg:px-10">
								<div className="grid md:grid-cols-2 gap-10 items-center">
									<div className="hidden md:block">
										<p className="text-white/85 text-5xl lg:text-7xl font-heading leading-[0.9]">Crafted</p>
										<p className="text-white/85 text-5xl lg:text-7xl font-heading leading-[0.9]">with Devotion</p>
									</div>

									<div className="text-white md:justify-self-end max-w-xl">
										<h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium mb-3">{products[currentCarouselIndex].name}</h2>
										<p className="text-lg sm:text-xl text-[#F1EDE6] mb-7 leading-relaxed">
											{products[currentCarouselIndex].description || "A delightful, unique flavor to enhance your every meal."}
										</p>
										<Button
											ref={(el) => {
												if (el) addToCartButtonRefs.current[products[currentCarouselIndex].id] = el;
											}}
											onClick={() => addToCart(products[currentCarouselIndex])}
											disabled={addingToCart === products[currentCarouselIndex].id}
										className="bg-[#D97736] hover:bg-[#C96626] text-white rounded-full px-10 h-14 text-xl font-semibold"
										>
											{addingToCart === products[currentCarouselIndex].id ? "Adding..." : "Buy Now"}
										</Button>
									</div>
								</div>
							</div>
						</div>

						{/* Left Arrow */}
						<button
							onClick={handleCarouselPrev}
							className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#3E2723] p-3 rounded-full shadow-lg transition-all opacity-70 md:group-hover:opacity-100 hover:scale-110"
							title="Previous product"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						{/* Right Arrow */}
						<button
							onClick={handleCarouselNext}
							className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#3E2723] p-3 rounded-full shadow-lg transition-all opacity-70 md:group-hover:opacity-100 hover:scale-110"
							title="Next product"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>

						{/* Bottom Navigation Bar */}
						<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
							<div className="max-w-7xl mx-auto flex items-center justify-between">
								{/* Left Arrow - Mobile Visible */}
								<button
									onClick={handleCarouselPrev}
									className="md:hidden bg-white/90 hover:bg-white text-[#3E2723] p-2 rounded-full shadow-lg transition-all hover:scale-110"
									title="Previous"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>

								{/* Carousel Dots */}
								<div className="flex justify-center gap-2 flex-1">
									{products.slice(0, 5).map((_, idx) => (
										<button
											key={idx}
											onClick={() => handleCarouselDotClick(idx)}
											className={`transition-all rounded-full hover:bg-[#D97736]/70 ${
												idx === currentCarouselIndex 
													? "bg-white w-8 h-2" 
													: "bg-white/60 w-2.5 h-2.5 hover:bg-white/80"
											}`}
											title={`Go to product ${idx + 1}`}
										/>
									))}
								</div>

								{/* Right Arrow - Mobile Visible */}
								<button
									onClick={handleCarouselNext}
									className="md:hidden bg-white/90 hover:bg-white text-[#3E2723] p-2 rounded-full shadow-lg transition-all hover:scale-110"
									title="Next"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</div>
							
							{isAutoScrolling && <p className="text-white/75 text-xs text-center mt-3">Auto-scrolling</p>}
						</div>
					</div>
				)}
			</section>

			<section className="bg-white border-b border-[#E5E3DD] py-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mobile-circle-scroll flex items-start gap-5 sm:gap-8 lg:gap-10 overflow-x-auto pb-2 pl-1 pr-8 snap-x snap-mandatory sm:justify-center sm:pr-1">
						{heroCircleProducts.map((item) => {
							const activeCategoryImageIndex = categoryHoverIndices[item.id] ?? 0;
							const isSelected = selectedCircleProductId === item.id;

							return (
								<button
									key={item.id}
									type="button"
									onClick={() => handleCircleProductClick(item.id)}
									className="w-44 sm:w-auto text-center group flex-shrink-0 snap-start"
									onMouseEnter={() => startCategoryHoverScroll(item.id, item.images.length)}
									onMouseLeave={() => stopCategoryHoverScroll(item.id)}
									onFocus={() => startCategoryHoverScroll(item.id, item.images.length)}
									onBlur={() => stopCategoryHoverScroll(item.id)}
									onTouchStart={() => startCategoryHoverScroll(item.id, item.images.length)}
									onTouchEnd={() => stopCategoryHoverScroll(item.id)}
									onTouchCancel={() => stopCategoryHoverScroll(item.id)}
								>
									<div
										className={`mx-auto w-28 h-28 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all bg-[#F4F2EC] ${
											isSelected ? "border-[#D97736] ring-2 ring-[#F5D8BC]" : "border-[#EFEDE6]"
										}`}
									>
										<img
											src={item.images[activeCategoryImageIndex] || item.images[0] || "/logo.png"}
											alt={item.label}
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
									</div>
									<p className="mt-2 text-xs sm:text-base leading-tight text-[#1E1E1D] font-medium whitespace-normal line-clamp-2 min-h-[2.25rem] sm:min-h-0">{item.label}</p>
								</button>
							);
				})}
					</div>
				</div>
			</section>

			<section
				id="products"
				className="relative py-20 md:py-32 rounded-t-3xl mt-12 shadow-lg overflow-hidden"
				style={{
					backgroundImage: `url(${PRODUCTS_SECTION_BACKGROUND_IMAGE})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div className="absolute inset-0 bg-white/90 backdrop-blur-[1px]" />
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[#111111] mb-12 text-center">
						{searchParams.get("category") || "Our Products"}
					</h2>
					{error && <p className="text-red-600 text-center mb-6">{error}</p>}

					{products.length === 0 ? (
						<div className="text-center text-[#5D4037] py-12">
							<p>Loading products...</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
							{products.map((product) => {
								const productId = getProductId(product);
								const wishlisted = isWishlisted(productId);

								return (
								<div
									key={productId}
									className="group flex h-full flex-col"
									onMouseEnter={() => startProductHoverScroll(productId, product.images?.length || 0)}
									onMouseLeave={() => stopProductHoverScroll(productId)}
									onFocus={() => startProductHoverScroll(productId, product.images?.length || 0)}
									onBlur={() => stopProductHoverScroll(productId)}
								>
									<div className="relative mb-4">
										<button
											type="button"
											onClick={(event) => toggleWishlistFromCard(event, product)}
											className={`absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
												wishlisted
													? "bg-[#8B2C6D] border-[#8B2C6D] text-white"
													: "bg-white/95 border-[#E0D8C8] text-[#3E2723] hover:bg-[#F7F3EE]"
											}`}
											aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
										>
											<Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
										</button>
										<Link to={`/product/${productId}`}>
											<div className="relative overflow-hidden rounded-2xl">
											{product.badge && (
													<span className="absolute top-3 left-3 bg-[#D97736] text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm">
													{product.badge}
												</span>
											)}
											{(() => {
													const activeImageIndex = hoveredImageIndices[productId] ?? 0;
												return (
											<img
													key={`${productId}-${activeImageIndex}`}
													src={product.images?.[activeImageIndex] || product.images?.[0]}
												alt={product.name}
												className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
											/>
												);
											})()}
											</div>
										</Link>
									</div>

									<div className="flex h-full flex-col text-left">
										<Link to={`/product/${productId}`}>
											<h3 className="font-heading text-2xl sm:text-3xl lg:text-[2rem] font-bold leading-[1.08] text-[#111111] mb-2 min-h-[4.25rem] sm:min-h-[4.8rem] lg:min-h-[5.1rem] line-clamp-2 hover:text-[#111111] transition-colors">
												{product.name}
											</h3>
										</Link>

										<div className="flex items-center gap-2 mb-2 sm:mb-3 min-h-[1.5rem] sm:min-h-[1.75rem]">
											<div className="flex items-center gap-1.5">
												<Star className="w-[18px] h-[18px] sm:w-5 sm:h-5 fill-[#D97736] text-[#D97736]" />
												<span className="text-lg sm:text-xl font-bold text-[#5D4037]">{product.rating || 4.8}</span>
											</div>
										</div>

										<div className="flex items-center gap-2 mb-4 sm:mb-5 min-h-[2.2rem] sm:min-h-[2.6rem]">
											<span className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-[#111111] leading-none">
												{formatPrice(product.price)}
											</span>
											<span className={`text-lg sm:text-xl lg:text-2xl font-semibold text-[#5D4037] line-through leading-none ${product.oldPrice ? "" : "invisible"}`}>
												{formatPrice(product.oldPrice || product.price)}
											</span>
										</div>

										<Button
										ref={(el) => {
											if (el) addToCartButtonRefs.current[productId] = el;
										}}
										onClick={() => addToCart(product)}
										disabled={addingToCart === productId}
												className={`mt-auto w-full bg-gradient-to-r from-[#D97736] to-[#F5A962] hover:from-[#C96626] hover:to-[#E59650] text-white rounded-full transition-all font-bold shadow-lg text-sm sm:text-base ${
											addingToCart === productId
												? "scale-95 opacity-75 animate-magic-pulse"
												: "hover:-translate-y-1 hover:shadow-xl active:scale-95"
										}`}
									>
										{addingToCart === productId ? (
											<>
												<ShoppingCart className="w-4 h-4 mr-2 animate-bounce" />
												Adding...
											</>
										) : (
											<>✨ Add to Cart</>
										)}
										</Button>
									</div>
								</div>
								);
							})}
						</div>
					)}
				</div>
			</section>

			<section ref={reviewSectionRef} id="customer-reviews" className="bg-white py-16 sm:py-20 lg:py-24 border-t border-[#E5E3DD]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 lg:mb-10">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Customer Reviews</p>
							<h2 className="mt-1 font-heading text-3xl sm:text-4xl text-[#3E2723]">Voices of Trust</h2>
						</div>
						<div className="flex items-center gap-2 self-start sm:self-auto">
							<button
								type="button"
								onClick={handleReviewPrev}
								aria-label="Previous reviews"
								className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E0D8C8] bg-white text-[#8B2C6D] transition hover:border-[#D97736] hover:text-[#D97736]"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<button
								type="button"
								onClick={handleReviewNext}
								aria-label="Next reviews"
								className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E0D8C8] bg-white text-[#8B2C6D] transition hover:border-[#D97736] hover:text-[#D97736]"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						</div>
					</div>

					{featuredReviews.length === 0 ? (
						<div className="rounded-[2rem] border border-dashed border-[#E0D8C8] bg-[#FAF7F2] p-8 text-center text-[#6B5B52]">
							No customer reviews yet. Reviews will appear here as soon as shoppers submit them.
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
							{reviewWindow.map((review, index) => (
								<Link
									key={review.id}
									to={`/product/${review.productId}`}
									className={`group rounded-[2rem] border-2 border-[#E6DCCB] bg-[#FCFAF7] p-6 sm:p-7 shadow-sm transition-all duration-700 ${isReviewSectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
									style={{ transitionDelay: `${index * 140}ms` }}
								>
									<div className="flex items-center justify-between gap-3">
										<div>
											<div className="flex items-center gap-1 text-[#D97736]">
												{Array.from({ length: 5 }).map((_, starIndex) => (
													<Star key={starIndex} className={`h-4 w-4 ${starIndex < review.rating ? "fill-current" : "text-[#E3D8C7]"}`} />
												))}
											</div>
											<h3 className="mt-4 font-heading text-xl font-bold text-[#3E2723] group-hover:text-[#D97736]">
												{review.userName}
												<span className="ml-2 inline-flex items-center rounded-full bg-[#8B2C6D] px-2 py-0.5 text-xs font-medium text-white">Verified</span>
											</h3>
										</div>
									</div>
									<p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#D97736]">{review.productName}</p>
									<p className="mt-3 text-base leading-7 text-[#4B4038]">{review.comment}</p>
								</Link>
							))}
						</div>
					)}
				</div>
			</section>

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
				product={loginModalProduct}
				onClose={() => setShowLoginModal(false)}
				onLogin={handleLoginFromModal}
				onContinueShopping={handleGuestContinueShopping}
			/>

			<Footer />
		</div>
	);
};

export default HomePage;
