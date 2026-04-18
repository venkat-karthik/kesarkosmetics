import React, { useEffect, useState } from "react";
import { X, Minus, Plus, ShoppingBag, Truck, Sparkles, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/helpers";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const CartDrawer = ({ isOpen, onClose }) => {
	const [scrollIndex, setScrollIndex] = useState(0);
	const navigate = useNavigate();
	const { user } = useAuth();
	const { cart, updateQuantity, removeFromCart } = useCart();
	const isAuthenticated = Boolean(user && user._id);

	const FREE_SHIPPING_THRESHOLD = 2000;

	// Auto-scroll animation for cart items
	useEffect(() => {
		if (!isOpen || cart.items.length === 0) return;
		const interval = setInterval(() => {
			setScrollIndex((prev) => (prev + 1) % cart.items.length);
		}, 4000);
		return () => clearInterval(interval);
	}, [isOpen, cart.items.length]);

	const handleUpdateQuantity = async (productId, newQuantity, variant) => {
		await updateQuantity(productId, newQuantity, variant);
	};

	const handleRemoveItem = async (productId, variant) => {
		await removeFromCart(productId, variant);
		toast.success("Item removed from cart");
	};

	const shippingProgress = Math.min((cart.total / FREE_SHIPPING_THRESHOLD) * 100, 100);
	const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - cart.total, 0);
	const currentItem = cart.items.length > 0 ? cart.items[scrollIndex % cart.items.length] : null;

	return (
		<>
			{isOpen && <div className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300" onClick={onClose} />}
			<div
				className={`fixed top-0 right-0 h-full w-full xs:w-80 sm:w-96 md:w-[420px] bg-gradient-to-b from-[#FAF7F2] to-[#F5EEE6] shadow-2xl z-50 transform transition-all duration-300 flex flex-col overflow-hidden ${
					isOpen ? "cart-drawer-enter translate-x-0" : "cart-drawer-exit translate-x-full"
				}`}
			>
				{/* Header */}
				<div className="px-4 xs:px-5 sm:px-6 py-4 border-b-2 border-[#E0D8C8] bg-white/50 backdrop-blur-sm">
					<div className="flex items-center justify-between mb-3 xs:mb-4">
						<h2 className="font-heading text-xl xs:text-2xl sm:text-3xl font-bold text-[#3E2723]">
							Shopping Cart
						</h2>
						<button 
							onClick={onClose} 
							className="p-2 hover:bg-[#E0D8C8] rounded-full transition-all hover:scale-110 active:scale-95"
						>
							<X className="w-5 xs:w-6 h-5 xs:h-6 text-[#3E2723]" />
						</button>
					</div>

					{/* Free Shipping Progress Bar */}
					{cart.total < FREE_SHIPPING_THRESHOLD ? (
						<div className="space-y-2">
							<p className="text-xs xs:text-sm text-[#5D4037] font-medium">
								{formatPrice(remainingForFreeShipping)} away from <span className="text-[#4CAF50] font-bold">FREE SHIPPING</span>
							</p>
							<div className="w-full bg-[#E0D8C8] rounded-full h-2.5">
								<div 
									className="bg-gradient-to-r from-[#D97736] to-[#F5A962] h-2.5 rounded-full transition-all duration-500" 
									style={{ width: `${shippingProgress}%` }} 
								/>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-2 text-[#4CAF50] font-bold text-xs xs:text-sm">
							<Truck className="w-4 h-4" />
							<span>✓ You've unlocked FREE SHIPPING!</span>
						</div>
					)}
				</div>

				{/* Main Content */}
				<div className="flex-1 overflow-y-auto">
					{!isAuthenticated ? (
						<div className="flex flex-col items-center justify-center h-full py-12 xs:py-16 px-4 text-center">
							<div className="bg-gradient-to-br from-[#F5EEE6] to-[#E0D8C8] rounded-full p-6 xs:p-8 mb-4">
								<LogIn className="w-12 xs:w-16 h-12 xs:h-16 text-[#D97736]" />
							</div>
							<p className="font-heading text-lg xs:text-xl font-semibold text-[#3E2723] mb-2">Login required</p>
							<p className="text-xs xs:text-sm text-[#5D4037] text-center mb-6 max-w-[220px]">
								Please login to view your cart and continue to checkout.
							</p>
							<Button
								onClick={() => {
									onClose();
									navigate("/login?redirect=/cart");
								}}
								className="bg-[#D97736] hover:bg-[#C96626] text-white px-6 py-2 rounded-full text-sm xs:text-base font-medium transition-all hover:shadow-lg hover:-translate-y-1"
							>
								Login now
							</Button>
						</div>
					) : cart.items.length === 0 ? (
						/* Empty Cart State */
						<div className="flex flex-col items-center justify-center h-full py-12 xs:py-16 px-4">
							<div className="bg-gradient-to-br from-[#F5EEE6] to-[#E0D8C8] rounded-full p-6 xs:p-8 mb-4">
								<ShoppingBag className="w-12 xs:w-16 h-12 xs:h-16 text-[#D97736]" />
							</div>
							<p className="font-heading text-lg xs:text-xl font-semibold text-[#3E2723] mb-2">Cart is Empty</p>
							<p className="text-xs xs:text-sm text-[#5D4037] text-center mb-6">
								Add some lovely products to get started!
							</p>
							<Button 
								onClick={() => { onClose(); navigate("/"); }}
								className="bg-[#D97736] hover:bg-[#C96626] text-white px-6 py-2 rounded-full text-sm xs:text-base font-medium transition-all hover:shadow-lg hover:-translate-y-1"
							>
								Continue Shopping
							</Button>
						</div>
					) : (
						<div className="p-4 xs:p-5 sm:p-6 space-y-4 xs:space-y-5">
							<p className="text-xs font-bold text-[#5D4037] uppercase tracking-wider pl-1">All Items ({cart.items.length})</p>
							{/* Featured Item Carousel */}
							{currentItem && (
								<div className="bg-white rounded-2xl xs:rounded-3xl p-4 xs:p-5 border-2 border-[#E0D8C8] shadow-md hover:shadow-lg transition-shadow">
									<p className="text-xs font-bold text-[#D97736] uppercase tracking-wider mb-3">Product</p>
									<div className="relative group">
										<img 
											src={currentItem.product.images[0]} 
											alt={currentItem.product.name}
											className="w-full h-56 xs:h-64 sm:h-72 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
										/>
										<div className="absolute top-3 right-3 bg-[#D97736] text-white px-3 py-1 rounded-full text-xs font-bold">
											Qty: {currentItem.quantity}
										</div>
									</div>
									<h3 className="font-heading text-base xs:text-lg font-bold text-[#3E2723] mt-4 line-clamp-2">{currentItem.product.name}</h3>
									<p className="text-sm xs:text-base font-bold text-[#D97736] mt-2">{formatPrice(currentItem.product.price * currentItem.quantity)}</p>
									<div className="mt-3 flex items-center justify-between gap-3">
										<div className="flex items-center gap-2 bg-gradient-to-r from-[#FAF7F2] to-[#F5EEE6] rounded-full border border-[#E0D8C8] px-3 py-1.5">
											<button
												onClick={() => currentItem.quantity > 1 && handleUpdateQuantity(currentItem.product.id, currentItem.quantity - 1, currentItem.variant)}
												className="text-[#D97736] hover:text-[#C96626] p-0.5"
												aria-label="Decrease quantity"
											>
												<Minus className="w-4 h-4" />
											</button>
											<span className="text-sm font-bold text-[#3E2723] w-6 text-center">{currentItem.quantity}</span>
											<button
												onClick={() => handleUpdateQuantity(currentItem.product.id, currentItem.quantity + 1, currentItem.variant)}
												className="text-[#D97736] hover:text-[#C96626] p-0.5"
												aria-label="Increase quantity"
											>
												<Plus className="w-4 h-4" />
											</button>
										</div>
										<button
											onClick={() => handleRemoveItem(currentItem.product.id, currentItem.variant)}
											className="text-xs font-bold text-[#E53935] hover:bg-red-50 px-2 py-1 rounded"
										>
											Delete
										</button>
									</div>
									<div className="flex gap-2 mt-3 text-xs text-[#5D4037]">
										{cart.items.map((_, idx) => (
											<button
												key={idx}
												onClick={() => setScrollIndex(idx)}
												className={`w-2 h-2 rounded-full transition-all ${idx === scrollIndex ? "bg-[#D97736] w-4" : "bg-[#D0C4B4]"}`}
											/>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

			{/* Footer - Checkout Section */}
			{cart.items.length > 0 && (
				<div className="p-4 xs:p-5 sm:p-6 border-t-2 border-[#E0D8C8] bg-white/60 backdrop-blur-sm space-y-3 xs:space-y-4">
					{/* Total */}
					<div className="flex items-center justify-between bg-gradient-to-r from-[#FAF7F2] to-[#F5EEE6] rounded-xl xs:rounded-2xl p-3 xs:p-4 border border-[#E0D8C8]">
						<span className="font-heading text-base xs:text-lg sm:text-xl font-bold text-[#3E2723]">
							Total Price
						</span>
						<span className="font-heading text-lg xs:text-2xl sm:text-3xl font-extrabold text-[#D97736]">
							{formatPrice(cart.total)}
						</span>
					</div>

					{/* Buttons */}
					<div className="space-y-2.5 xs:space-y-3">
						<Button
							onClick={() => {
								navigate(user && user._id ? "/checkout" : "/login");
								onClose();
							}}
							className="w-full bg-gradient-to-r from-[#D97736] to-[#F5A962] hover:from-[#C96626] hover:to-[#E59650] text-white rounded-full py-3 xs:py-4 text-sm xs:text-base font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
						>
							<Sparkles className="w-4 xs:w-5 h-4 xs:h-5" />
							Proceed to Pay
						</Button>
						<Button
							onClick={onClose}
							className="w-full bg-gradient-to-r from-[#D97736] to-[#F5A962] hover:from-[#C96626] hover:to-[#E59650] text-white rounded-full py-3 xs:py-4 text-sm xs:text-base font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
						>
							Continue Shopping
						</Button>
					</div>

					{/* Security Badge */}
					<div className="flex items-center justify-center gap-2 text-xs text-[#5D4037] pt-2 border-t border-[#E0D8C8]">
						<span>🔒 Secure Checkout</span>
					</div>
				</div>
			)}

			</div>
		</>
	);
};

export default CartDrawer;
