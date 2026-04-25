import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { formatPrice } from "../utils/helpers";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCartDrawer } from "../contexts/CartDrawerContext";
import { useCart } from "../contexts/CartContext";
import Footer from "../components/Footer";
import CartSuccessModal from "../components/CartSuccessModal";
import CartOptionsModal from "../components/CartOptionsModal";
import FlyingToCart from "../components/FlyingToCart";
import FlyingToWishlist from "../components/FlyingToWishlist";
import LoginRequiredModal from "../components/LoginRequiredModal";

const HERO_HEIGHT_CLASSES = "h-[420px] sm:h-[520px] lg:h-[620px] xl:h-[700px]";

const HomePage = ({ setShakeCart, setTriggerCartRefresh }) => {
	const [products, setProducts] = useState([]);
	const [productsLoading, setProductsLoading] = useState(true);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
	const { setIsCartOpen } = useCartDrawer();
	const { addToCart: addToCartCtx } = useCart();
	const [error, setError] = useState("");
	const [addingToCart, setAddingToCart] = useState(null);
	const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successProduct, setSuccessProduct] = useState(null);
	const [showCartOptionsModal, setShowCartOptionsModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [loginModalProduct, setLoginModalProduct] = useState(null);
	const [hoveredImageIndices, setHoveredImageIndices] = useState({});
	const [flyingCart, setFlyingCart] = useState({ active: false, position: null });
	const [flyingWishlist, setFlyingWishlist] = useState({ active: false, start: null, end: null });
	const [isAutoScrolling, setIsAutoScrolling] = useState(true);
	const [reviewStartIndex, setReviewStartIndex] = useState(0);
	const [reviewFading, setReviewFading] = useState(false);
	const reviewAutoPlayRef = useRef(null);
	const autoScrollTimeoutRef = useRef(null);
	const reviewSectionRef = useRef(null);
	const reviewSectionObserverRef = useRef(null);
	const addToCartButtonRefs = useRef({});
	const hoverIntervalsRef = useRef({});

	const getProductId = (product) => product.id || product._id;

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const category = searchParams.get("category");
				const { getAllProducts } = await import("../utils/productsDb");
				const productArray = await getAllProducts(category || null);
				setProducts(productArray);
				setError("");
			} catch (err) {
				console.error("Product fetch error:", err);
				setError("Could not load products.");
				setProducts([]);
			} finally {
				setProductsLoading(false);
			}
		};

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

	const addToCart = async (product, quantity = 1) => {
		if (!user || !user._id) {
			setLoginModalProduct(product);
			setShowLoginModal(true);
			return;
		}
		// Get button position for flying animation
		const buttonElement = addToCartButtonRefs.current[product.id];
		if (buttonElement) {
			const rect = buttonElement.getBoundingClientRect();
			setFlyingCart({ active: true, position: { x: rect.left, y: rect.top } });
		}
		setAddingToCart(product.id);
		try {
			await addToCartCtx(product, quantity);
			window.dispatchEvent(new Event("cart:updated"));
			setTimeout(() => {
				if (setShakeCart) { setShakeCart(true); setTimeout(() => setShakeCart(false), 600); }
				if (setTriggerCartRefresh) setTriggerCartRefresh((prev) => prev + 1);
			}, 800);
			setTimeout(() => { setSuccessProduct(product); setShowSuccessModal(true); }, 1000);
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

	const staticFallbackReviews = [
		{
			id: "static-1",
			productId: null,
			productName: "NEI Native Products",
			rating: 5,
			comment: "Absolutely love the quality! The A2 Ghee has transformed my cooking — rich aroma, pure taste. Will never go back to store-bought.",
			userName: "Ananya S.",
		},
		{
			id: "static-2",
			productId: null,
			productName: "Wood Pressed Oils",
			rating: 5,
			comment: "The wood pressed oil is exceptional. You can taste the difference immediately — clean, natural, and so much healthier for the family.",
			userName: "Rajesh M.",
		},
		{
			id: "static-3",
			productId: null,
			productName: "Millet Flour",
			rating: 5,
			comment: "Switched to NEI Native's millet flour for our rotis and the whole family noticed the difference. Authentic, wholesome, and delicious.",
			userName: "Preethi K.",
		},
		{
			id: "static-4",
			productId: null,
			productName: "Turmeric Powder",
			rating: 5,
			comment: "The turmeric is so vibrant and fragrant — nothing like the supermarket stuff. Fast delivery and beautifully packaged too.",
			userName: "Vikram N.",
		},
	];

	const featuredReviews = useMemo(() => {
		const fromProducts = products
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
			.filter((review) => (review.rating >= 3 && review.rating <= 5) && review.comment)
			.slice(0, 12);
		return fromProducts.length > 0 ? fromProducts : staticFallbackReviews;
	}, [products]);

	// reviewWindow kept for compatibility but not used in new single-card slideshow

	const handleReviewPrev = () => {
		setReviewFading(true);
		setTimeout(() => {
			setReviewStartIndex((prev) => {
				if (featuredReviews.length === 0) return 0;
				return (prev - 1 + featuredReviews.length) % featuredReviews.length;
			});
			setReviewFading(false);
		}, 400);
	};

	const handleReviewNext = () => {
		setReviewFading(true);
		setTimeout(() => {
			setReviewStartIndex((prev) => {
				if (featuredReviews.length === 0) return 0;
				return (prev + 1) % featuredReviews.length;
			});
			setReviewFading(false);
		}, 400);
	};

	useEffect(() => {
		if (!reviewSectionRef.current) return undefined;

		reviewSectionObserverRef.current?.disconnect?.();
		reviewSectionObserverRef.current = new IntersectionObserver(
			() => {},
			{ threshold: 0.22 }
		);

		reviewSectionObserverRef.current.observe(reviewSectionRef.current);

		return () => {
			reviewSectionObserverRef.current?.disconnect?.();
		};
	}, [featuredReviews.length]);

	useEffect(() => {
		if (featuredReviews.length <= 1) return;
		reviewAutoPlayRef.current = setInterval(() => {
			setReviewFading(true);
			setTimeout(() => {
				setReviewStartIndex((prev) => (prev + 1) % featuredReviews.length);
				setReviewFading(false);
			}, 400);
		}, 5000);
		return () => clearInterval(reviewAutoPlayRef.current);
	}, [featuredReviews.length]);

	return (
		<div className="min-h-screen bg-[#FFF8EC]">
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

			{/* ── Hero Carousel ─────────────────────────────── */}
			<section className="relative w-full overflow-hidden bg-[#1A0800]">
				{products.length > 0 && (
					<div className={`relative w-full ${HERO_HEIGHT_CLASSES} overflow-hidden`}>
						{/* Image with crossfade */}
						<div className="absolute inset-0">
							<img
								key={currentCarouselIndex}
								src={products[currentCarouselIndex].images?.[0] || "/logo.png"}
								alt={products[currentCarouselIndex].name}
								className="w-full h-full object-cover object-center animate-fade-in"
								style={{ animationDuration: "0.8s" }}
							/>
							{/* Gradient: dark at bottom only, light at top */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
						</div>

						{/* Text — pinned to bottom, never overlapping product face */}
						<div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 lg:px-12 pb-16 sm:pb-20">
							<div className="max-w-2xl">
								<p
									key={`badge-${currentCarouselIndex}`}
									className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#F5A800] bg-[#F5A800]/15 border border-[#F5A800]/30 rounded-full px-4 py-1.5 mb-3 animate-fade-in"
									style={{ animationDuration: "0.6s" }}
								>
									{products[currentCarouselIndex].badge || "Featured"}
								</p>
								<h2
									key={`title-${currentCarouselIndex}`}
									className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 animate-fade-in"
									style={{ animationDuration: "0.7s", animationDelay: "0.05s" }}
								>
									{products[currentCarouselIndex].name}
								</h2>
								<p
									key={`desc-${currentCarouselIndex}`}
									className="text-sm sm:text-base text-white/75 mb-6 leading-relaxed max-w-lg line-clamp-2 animate-fade-in"
									style={{ animationDuration: "0.7s", animationDelay: "0.1s" }}
								>
									{products[currentCarouselIndex].description || "Handcrafted with devotion for your everyday ritual."}
								</p>
								<div className="flex items-center gap-3 animate-fade-in" style={{ animationDuration: "0.7s", animationDelay: "0.15s" }}>
									<Link to="/products">
										<Button
											className="bg-[#E8620A] hover:bg-[#C8380A] text-white rounded-full px-7 h-12 text-sm font-bold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
										>
											Shop Now
										</Button>
									</Link>
									<Link
										to={`/product/${products[currentCarouselIndex].id}`}
										className="text-white/80 hover:text-white text-sm font-medium underline-offset-4 hover:underline transition-colors"
									>
										View Details →
									</Link>
								</div>
							</div>
						</div>

						{/* Side arrows */}
						<button
							onClick={handleCarouselPrev}
							className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-full flex items-center justify-center transition-all hover:scale-105"
							aria-label="Previous"
						>
							<ChevronLeft className="w-5 h-5" />
						</button>
						<button
							onClick={handleCarouselNext}
							className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white rounded-full flex items-center justify-center transition-all hover:scale-105"
							aria-label="Next"
						>
							<ChevronRight className="w-5 h-5" />
						</button>

						{/* Dots */}
						<div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
							{products.slice(0, 6).map((_, idx) => (
								<button
									key={idx}
									onClick={() => handleCarouselDotClick(idx)}
									className={`rounded-full transition-all duration-400 ${idx === currentCarouselIndex ? "w-7 h-2 bg-[#F5A800]" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
									aria-label={`Slide ${idx + 1}`}
								/>
							))}
						</div>
					</div>
				)}
			</section>

			<section className="bg-gradient-to-r from-[#3E1A00] via-[#5D2A00] to-[#3E1A00] py-4 overflow-hidden border-y border-[#F5A800]/20">
				{/* Marquee ticker — saffron facts & brand story */}
				{(() => {
					const tags = [
						"🌸 Hand-harvested Kashmiri Saffron",
						"✦ 100% Natural Ingredients",
						"🌿 Cruelty-Free & Vegan",
						"✦ Each strand picked at dawn",
						"🏔️ Grown at 2,200m altitude in Pampore, Kashmir",
						"✦ Rich in Crocin & Safranal antioxidants",
						"🌙 Saffron takes 75,000 flowers for 1 pound",
						"✦ GMP Certified Manufacturing",
						"🌸 Brightens skin in 2–4 weeks",
						"✦ Free shipping above ₹2,000",
						"🌿 No Parabens · No Sulfates · No Synthetics",
						"✦ Dermatologist Tested",
						"🏆 Premium Kashmiri Kesar — Red Gold of India",
						"✦ Small-batch crafted for freshness",
					];
					const doubled = [...tags, ...tags];
					return (
						<div className="flex whitespace-nowrap animate-marquee gap-0">
							{doubled.map((tag, i) => (
								<span key={i} className="inline-flex items-center gap-3 px-6 text-sm font-medium text-[#F5A800]/90 shrink-0">
									{tag}
									<span className="text-[#F5A800]/30 text-lg">|</span>
								</span>
							))}
						</div>
					);
				})()}
			</section>

			<section
				id="products"
				className="relative py-16 md:py-24 mt-0 overflow-hidden bg-[#FFF8EC]"
			>
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-10 sm:mb-14">
						<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8620A] mb-2">Our Collection</p>
						<h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[#4A1A00]">
							{searchParams.get("category") || "Our Products"}
						</h2>
						<div className="mt-3 mx-auto w-16 h-0.5 bg-gradient-to-r from-[#E8620A] to-[#F5A800] rounded-full" />
					</div>
					{error && <p className="text-red-600 text-center mb-6">{error}</p>}

					{productsLoading ? (
						<div className="text-center text-[#7A3B00] py-12">
							<p>Loading products...</p>
						</div>
					) : products.length === 0 ? (
						<div className="text-center text-[#7A3B00] py-12">
							<p>No products yet. Check back soon!</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
							{products.map((product, i) => {
								const productId = getProductId(product);
								const wishlisted = isWishlisted(productId);

								return (
								<div
									key={productId}
									className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
									style={{ animationDelay: `${i * 60}ms` }}
									onMouseEnter={() => startProductHoverScroll(productId, product.images?.length || 0)}
									onMouseLeave={() => stopProductHoverScroll(productId)}
								>
									<div className="relative">
										<button
											type="button"
											onClick={(event) => toggleWishlistFromCard(event, product)}
											className={`absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
												wishlisted
													? "bg-[#E8620A] border-[#E8620A] text-white scale-110"
													: "bg-white/90 border-white/50 text-[#7A3B00] hover:bg-[#FFF3D6] hover:border-[#F5A800] hover:scale-110"
											}`}
											aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
										>
											<Heart className={`w-4 h-4 transition-transform duration-200 ${wishlisted ? "fill-current scale-110" : ""}`} />
										</button>
										<Link to={`/product/${productId}`}>
											<div className="relative overflow-hidden aspect-square">
												{product.badge && (
													<span className="absolute top-3 left-3 bg-[#E8620A] text-white text-[11px] font-bold px-3 py-1 rounded-full z-10 shadow-sm">
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
															className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
														/>
													);
												})()}
											</div>
										</Link>
									</div>

									<div className="flex flex-col flex-1 p-4 text-center">
										<Link to={`/product/${productId}`}>
											<h3 className="font-heading text-lg sm:text-xl font-bold text-[#4A1A00] mb-2 line-clamp-2 hover:text-[#E8620A] transition-colors duration-200">
												{product.name}
											</h3>
										</Link>

										<div className="flex items-center justify-center gap-1 mb-2">
											{[1,2,3,4,5].map(s => (
												<svg key={s} viewBox="0 0 20 20" className={`w-3.5 h-3.5 ${s <= Math.round(product.rating || 4.8) ? "fill-[#F5A800]" : "fill-gray-200"}`}>
													<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
												</svg>
											))}
											<span className="text-xs text-[#7A3B00] ml-1 font-medium">{product.rating || 4.8}</span>
										</div>

										<div className="flex items-center justify-center gap-2 mb-4">
											<span className="text-xl font-bold text-[#4A1A00]">{formatPrice(product.price)}</span>
											{product.oldPrice && (
												<span className="text-sm text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
											)}
										</div>

										<Button
											ref={(el) => { if (el) addToCartButtonRefs.current[productId] = el; }}
											onClick={() => addToCart(product)}
											disabled={addingToCart === productId}
											className={`mt-auto w-full bg-gradient-to-r from-[#E8620A] to-[#F5A800] hover:from-[#C8380A] hover:to-[#E8620A] text-white rounded-full font-bold text-sm shadow-md transition-all duration-200 ${
												addingToCart === productId
													? "scale-95 opacity-75"
													: "hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
											}`}
										>
											{addingToCart === productId ? (
												<><ShoppingCart className="w-4 h-4 mr-2 animate-bounce" />Adding...</>
											) : "Add to Cart"}
										</Button>
									</div>
								</div>
								);
							})}
						</div>
					)}
				</div>
			</section>

			<section ref={reviewSectionRef} id="customer-reviews" className="relative py-20 sm:py-28 overflow-hidden" style={{ background: "linear-gradient(135deg,#1A0800 0%,#2D0F00 45%,#1A0800 100%)" }}>
				<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F5A800]/50 to-transparent" />
				<div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F5A800]/50 to-transparent" />
				<div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-14">
						<div className="inline-flex items-center gap-3 mb-5">
							<div className="h-px w-10 bg-gradient-to-r from-transparent to-[#F5A800]/60" />
							<span className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#F5A800]">Customer Reviews</span>
							<div className="h-px w-10 bg-gradient-to-l from-transparent to-[#F5A800]/60" />
						</div>
						<h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white font-light">
							What They&apos;re <em className="text-[#F5A800] not-italic">Saying</em>
						</h2>
					</div>
					{featuredReviews.length === 0 ? (
						<p className="text-center text-white/30 text-sm">No reviews yet.</p>
					) : (
						<div>
							<div className={`transition-all duration-500 ${reviewFading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}>
								<div className="relative rounded-2xl overflow-hidden text-center px-8 sm:px-16 py-12 sm:py-16" style={{ background: "rgba(245,168,0,0.06)", border: "1px solid rgba(245,168,0,0.18)" }}>
									<div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5A800] to-transparent" />
									<div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5A800] to-transparent" />
									<div className="absolute top-0 left-4 font-serif leading-none select-none pointer-events-none text-[#F5A800]/8" style={{ fontSize: "150px" }}>&ldquo;</div>
									<div className="flex justify-center gap-1.5 mb-8">
										{Array.from({ length: 5 }).map((_, i) => (
											<svg key={i} viewBox="0 0 20 20" className={`w-5 h-5 ${i < (featuredReviews[reviewStartIndex]?.rating || 5) ? "fill-[#F5A800]" : "fill-white/10"}`}>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
											</svg>
										))}
									</div>
									<p className="relative z-10 text-xl sm:text-2xl lg:text-3xl text-white/90 font-light italic leading-relaxed max-w-2xl mx-auto mb-10">
										&ldquo;{featuredReviews[reviewStartIndex]?.comment}&rdquo;
									</p>
									<div className="flex items-center justify-center gap-4 mb-6">
										<div className="h-px w-16 bg-gradient-to-r from-transparent to-[#F5A800]/50" />
										<svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#F5A800]"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
										<div className="h-px w-16 bg-gradient-to-l from-transparent to-[#F5A800]/50" />
									</div>
									<p className="text-white font-semibold text-sm tracking-[0.2em] uppercase mb-1">{featuredReviews[reviewStartIndex]?.userName}</p>
									{featuredReviews[reviewStartIndex]?.productId ? (
										<Link to={`/product/${featuredReviews[reviewStartIndex].productId}`} className="text-[#F5A800]/60 hover:text-[#F5A800] text-xs tracking-[0.18em] uppercase transition-colors">
											{featuredReviews[reviewStartIndex]?.productName}
										</Link>
									) : (
										<p className="text-[#F5A800]/60 text-xs tracking-[0.18em] uppercase">{featuredReviews[reviewStartIndex]?.productName}</p>
									)}
									<div className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: "rgba(245,168,0,0.1)", border: "1px solid rgba(245,168,0,0.25)" }}>
										<svg viewBox="0 0 20 20" className="w-3 h-3 fill-[#F5A800]"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
										<span className="text-[#F5A800] text-[10px] font-bold tracking-[0.25em] uppercase">Verified Purchase</span>
									</div>
								</div>
							</div>
							<div className="flex items-center justify-center gap-6 mt-10">
								<button onClick={handleReviewPrev} aria-label="Previous" className="w-11 h-11 rounded-full flex items-center justify-center text-[#F5A800] transition-all hover:scale-110" style={{ border: "1px solid rgba(245,168,0,0.3)" }}>
									<ChevronLeft className="w-5 h-5" />
								</button>
								<div className="flex gap-2 items-center">
									{featuredReviews.map((_, idx) => (
										<button key={idx} onClick={() => { setReviewFading(true); setTimeout(() => { setReviewStartIndex(idx); setReviewFading(false); }, 350); }} className={`rounded-full transition-all duration-300 ${idx === reviewStartIndex ? "w-8 h-2 bg-[#F5A800]" : "w-2 h-2 bg-white/20 hover:bg-[#F5A800]/50"}`} aria-label={`Review ${idx + 1}`} />
									))}
								</div>
								<button onClick={handleReviewNext} aria-label="Next" className="w-11 h-11 rounded-full flex items-center justify-center text-[#F5A800] transition-all hover:scale-110" style={{ border: "1px solid rgba(245,168,0,0.3)" }}>
									<ChevronRight className="w-5 h-5" />
								</button>
							</div>
							<p className="text-center text-white/25 text-[10px] tracking-[0.3em] uppercase mt-5">{reviewStartIndex + 1} of {featuredReviews.length}</p>
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
