import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import axios from "axios";
import { formatPrice } from "../utils/helpers";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const CartPage = () => {
	const [products, setProducts] = useState([]);
	const [reviewDrafts, setReviewDrafts] = useState({});
	const navigate = useNavigate();
	const { user } = useAuth();
	const { cart, cartCount, updateQuantity, removeFromCart, loading } = useCart();

	useEffect(() => {
		axios.get(`${BACKEND_URL}/api/products`)
			.then(r => setProducts(Array.isArray(r.data) ? r.data : []))
			.catch(() => {});
	}, []);

	const handleUpdateQuantity = (productId, quantity, variant = null) => {
		updateQuantity(productId, quantity, variant);
	};

	const handleRemoveItem = (productId, variant = null) => {
		removeFromCart(productId, variant);
		toast.success("Item removed from cart");
	};

	const setDraftRating = (productId, rating) => {
		setReviewDrafts(prev => ({ ...prev, [productId]: { ...(prev[productId] || { comment: "" }), rating } }));
	};

	const setDraftComment = (productId, comment) => {
		setReviewDrafts(prev => ({ ...prev, [productId]: { ...(prev[productId] || { rating: 0 }), comment } }));
	};

	const submitReview = async (productId) => {
		const draft = reviewDrafts[productId] || { rating: 0, comment: "" };
		if (!draft.rating || draft.rating < 1) { toast.error("Please select a rating first"); return; }
		try {
			await axios.post(`${BACKEND_URL}/api/products/${productId}/reviews`, {
				rating: draft.rating,
				comment: draft.comment || "",
				user_name: user?.name || "User",
				user_uid: user?._id || "",
			});
			setReviewDrafts(prev => ({ ...prev, [productId]: { rating: 0, comment: "" } }));
			toast.success("Thanks for your review!");
		} catch {
			toast.error("Could not submit review");
		}
	};

	const cartProductIds = useMemo(() => new Set(cart.items.map(i => i.product?.id)), [cart.items]);

	const youMayAlsoLike = useMemo(() => {
		const inCartCategories = new Set(cart.items.map(i => i.product?.category).filter(Boolean));
		const categoryMatches = products.filter(p => !cartProductIds.has(p.id) && inCartCategories.has(p.category));
		const fallback = products.filter(p => !cartProductIds.has(p.id));
		return (categoryMatches.length > 0 ? categoryMatches : fallback).slice(0, 4);
	}, [cart.items, cartProductIds, products]);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-[#5D4037]">
				Loading...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#FAF7F2]">
			<div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">
				<div className="flex flex-col gap-2 mb-8">
					<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Shopping Cart</p>
					<h1 className="font-heading text-3xl sm:text-4xl text-[#3E2723]">Your selected products</h1>
					<p className="text-sm sm:text-base text-[#6B5B52]">
						{cartCount > 0
							? `${cartCount} item${cartCount === 1 ? "" : "s"} in your cart`
							: "Your cart is empty right now."}
					</p>
				</div>

				{cart.items.length === 0 ? (
					<div className="rounded-[2rem] border-2 border-dashed border-[#E0D8C8] bg-white p-10 text-center shadow-sm">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EEE6] text-[#D97736]">
							<ShoppingBag className="h-10 w-10" />
						</div>
						<h2 className="font-heading text-2xl text-[#3E2723]">Cart is empty</h2>
						<p className="mx-auto mt-2 max-w-md text-sm text-[#6B5B52]">
							Explore the collection and add a few products to see them here.
						</p>
						<Button
							onClick={() => navigate("/")}
							className="mt-6 rounded-full bg-[#D97736] px-6 py-3 font-semibold text-white hover:bg-[#C96626]"
						>
							Continue Shopping
						</Button>
					</div>
				) : (
					<>
						<div className="grid gap-6 lg:grid-cols-[1.85fr_0.8fr]">
							<div className="space-y-4">
								{cart.items.map((item, index) => (
									<div
										key={`${item.product.id}-${item.variant}-${index}`}
										className="rounded-[1.75rem] border-2 border-[#E6DCCB] bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
									>
										<div className="grid grid-cols-1 gap-4 sm:grid-cols-[112px_1fr] lg:grid-cols-[132px_1fr_190px_120px_160px] lg:items-start">
											<Link to={`/product/${item.product.id}`} className="shrink-0">
												<img
													src={item.product.images?.[0]}
													alt={item.product.name}
													className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28 lg:h-32 lg:w-32"
												/>
											</Link>

											<div className="min-w-0">
												<Link
													to={`/product/${item.product.id}`}
													className="font-heading text-2xl font-bold text-[#3E2723] hover:text-[#D97736] transition-colors line-clamp-2"
												>
													{item.product.name}
												</Link>
												<p className="mt-1 text-2xl text-[#3E2723]">{formatPrice(item.product.price)}</p>
												<p className="mt-2 text-xl text-[#5D4037]">
													{item.variant ? `Size: ${item.variant}` : `Size: ${item.product.category || "Standard"}`}
												</p>
											</div>

											<div className="flex items-center gap-2 rounded-xl border border-[#7A7A7A] px-3 py-2 text-[#1E1E1E] justify-center">
												<button
													onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1, item.variant)}
													className="p-1"
													aria-label="Decrease quantity"
												>
													<Minus className="h-5 w-5" />
												</button>
												<span className="w-7 text-center text-3xl font-medium leading-none">{item.quantity}</span>
												<button
													onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1, item.variant)}
													className="p-1"
													aria-label="Increase quantity"
												>
													<Plus className="h-5 w-5" />
												</button>
											</div>

											<div className="text-left lg:text-right">
												<p className="text-4xl font-medium text-[#111111]">{formatPrice(item.product.price * item.quantity)}</p>
												<p className="mt-1 text-xl text-[#5D4037]">{formatPrice(item.product.price)} each</p>
											</div>

											<div className="flex items-center justify-center lg:justify-end">
												<button
													onClick={() => handleRemoveItem(item.product.id, item.variant)}
													className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#B2443E] hover:bg-[#A03935] transition-colors font-medium"
													aria-label="Remove item"
												>
													<Trash2 className="h-5 w-5" />
													<span className="hidden sm:inline">Delete</span>
												</button>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
								<div className="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-6 shadow-sm">
									<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Order Summary</p>
									<div className="mt-4 space-y-3 text-sm text-[#6B5B52]">
										<div className="flex items-center justify-between">
											<span>Subtotal</span>
											<span className="font-semibold text-[#3E2723]">{formatPrice(cart.total)}</span>
										</div>
										<div className="flex items-center justify-between">
											<span>Shipping</span>
											<span className="font-semibold text-[#3E2723]">Calculated at checkout</span>
										</div>
									</div>
									<Button
										onClick={() => navigate(user?._id ? "/checkout" : "/login")}
										className="mt-6 w-full rounded-full bg-[#D97736] px-6 py-3 font-semibold text-white hover:bg-[#C96626]"
									>
										Proceed to Checkout
									</Button>
								</div>
							</div>
						</div>

						<section className="mt-8 rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-5 sm:p-6 shadow-sm">
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">You May Also Like</p>
									<h2 className="mt-1 font-heading text-2xl text-[#3E2723]">Complete the cart</h2>
								</div>
								<Sparkles className="h-5 w-5 text-[#D97736]" />
							</div>
							<div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
								{youMayAlsoLike.length > 0 ? (
									youMayAlsoLike.map(product => (
										<Link
											key={product.id}
											to={`/product/${product.id}`}
											className="group flex gap-4 rounded-2xl border border-[#E9E0D2] p-3 transition hover:border-[#D97736] hover:bg-[#FCFAF7]"
										>
											<img src={product.images?.[0]} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />
											<div className="min-w-0 flex-1">
												<h3 className="font-heading text-xl sm:text-2xl font-bold leading-[1.08] text-[#3E2723] line-clamp-2 group-hover:text-[#D97736]">
													{product.name}
												</h3>
												<p className="mt-1 text-sm text-[#6B5B52] line-clamp-2">{product.description}</p>
												<div className="mt-2 flex items-center justify-between text-sm">
													<span className="font-semibold text-[#D97736]">{formatPrice(product.price)}</span>
													<span className="inline-flex items-center gap-1 text-[#8B6D59]">
														View <ArrowRight className="h-3.5 w-3.5" />
													</span>
												</div>
											</div>
										</Link>
									))
								) : (
									<div className="rounded-2xl border border-dashed border-[#E0D8C8] bg-[#FAF7F2] p-6 text-sm text-[#6B5B52]">
										No recommendations found yet.
									</div>
								)}
							</div>
						</section>

						<div className="hidden lg:block mt-10 rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-8 shadow-sm">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Customer Reviews</p>
									<h2 className="mt-1 font-heading text-3xl text-[#3E2723]">Reviews and Rate Products</h2>
								</div>
							</div>
							<div className="mt-6 space-y-6">
								{cart.items.map(item => {
									const draft = reviewDrafts[item.product.id] || { rating: 0, comment: "" };
									const productReviews = Array.isArray(item.product.reviews) ? item.product.reviews : [];
									return (
										<div key={`review-${item.product.id}`} className="rounded-2xl border border-[#E8DECF] p-5">
											<div className="flex items-start justify-between gap-4">
												<div>
													<h3 className="font-heading text-2xl font-bold text-[#3E2723]">{item.product.name}</h3>
													<p className="text-sm text-[#6B5B52] mt-1">Current rating: {item.product.rating || 0} / 5</p>
												</div>
											</div>
											<div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-6">
												<div className="rounded-xl bg-[#FCFAF7] border border-[#E8DECF] p-4">
													<p className="text-sm font-semibold text-[#3E2723] mb-3">User Reviews</p>
													<div className="space-y-3 max-h-52 overflow-y-auto pr-1">
														{productReviews.length > 0 ? (
															productReviews.slice(0, 6).map((review, i) => (
																<div key={i} className="rounded-lg border border-[#EEE3D4] bg-white p-3">
																	<div className="flex items-center justify-between">
																		<p className="text-sm font-semibold text-[#3E2723]">{review.user_name || "User"}</p>
																		<p className="text-sm text-[#D97736]">
																			{"★".repeat(Math.max(1, Math.min(5, Number(review.rating) || 0)))}
																		</p>
																	</div>
																	{review.comment && <p className="text-sm text-[#6B5B52] mt-1">{review.comment}</p>}
																</div>
															))
														) : (
															<p className="text-sm text-[#6B5B52]">No reviews yet.</p>
														)}
													</div>
												</div>
												<div className="rounded-xl bg-[#FCFAF7] border border-[#E8DECF] p-4">
													<p className="text-sm font-semibold text-[#3E2723] mb-3">Rate this product</p>
													<div className="flex items-center gap-2 mb-3">
														{[1, 2, 3, 4, 5].map(star => (
															<button
																key={star}
																type="button"
																onClick={() => setDraftRating(item.product.id, star)}
																className={`text-2xl ${draft.rating >= star ? "text-[#D97736]" : "text-[#CBBEAC]"}`}
																aria-label={`Rate ${star} stars`}
															>
																★
															</button>
														))}
													</div>
													<textarea
														value={draft.comment}
														onChange={e => setDraftComment(item.product.id, e.target.value)}
														placeholder="Write your review (optional)"
														className="w-full rounded-xl border border-[#E0D8C8] bg-white px-3 py-2 text-sm text-[#3E2723] focus:outline-none focus:ring-2 focus:ring-[#D97736]"
														rows={3}
													/>
													<Button
														type="button"
														onClick={() => submitReview(item.product.id)}
														className="mt-3 rounded-full bg-[#D97736] px-5 py-2 font-semibold text-white hover:bg-[#C96626]"
													>
														Submit Rating
													</Button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default CartPage;
