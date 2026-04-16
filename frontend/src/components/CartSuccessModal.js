import React, { useState, useEffect } from "react";
import { X, Check, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { formatPrice } from "../utils/helpers";

const CartSuccessModal = ({ isOpen, product, onClose, onViewCart, onContinueShopping }) => {
	const [progress, setProgress] = useState(0);
	const [quantity, setQuantity] = useState(1);

	useEffect(() => {
		if (isOpen) {
			setProgress(0);
			const interval = setInterval(() => {
				setProgress((prev) => Math.min(prev + 8, 100));
			}, 100);
			return () => clearInterval(interval);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			setQuantity(Math.max(1, Number(product?.quantity || 1)));
		}
	}, [isOpen, product]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-3xl max-w-md w-full p-8 relative animation-scale-in">
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 hover:bg-[#EFE9DF] rounded-full transition-colors"
				>
					<X className="w-6 h-6 text-[#3E2723]" />
				</button>

				{/* Success Checkmark */}
				<div className="flex justify-center mb-6">
					<div className="bg-green-100 rounded-full p-3">
						<Check className="w-8 h-8 text-green-600" />
					</div>
				</div>

				{/* Success Message */}
				<h2 className="text-center text-xl font-bold text-[#3E2723] mb-6">Item added to your cart</h2>

				{/* Free Shipping Bar */}
				<div className="mb-8 bg-[#F5F1EA] p-4 rounded-xl">
					<div className="mb-3">
						<div className="w-full bg-[#E0D8C8] rounded-full h-3 overflow-hidden">
							<div
								className="bg-gradient-to-r from-[#D97736] to-[#F5A962] h-full rounded-full transition-all duration-300"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
					<p className="text-center font-semibold text-[#D97736] text-sm">You got Free Shipping!</p>
				</div>

				{/* Product Details */}
				{product && (
					<div className="border border-[#E0D8C8] rounded-2xl p-4 mb-8">
						<div className="flex gap-4">
							<img
								src={product.images?.[0]}
								alt={product.name}
								className="w-20 h-20 object-cover rounded-lg"
							/>
							<div className="flex-1 min-w-0">
								<h3 className="font-heading text-lg sm:text-xl font-bold leading-[1.08] text-[#3E2723] mb-1">{product.name}</h3>
								{product.size && (
									<p className="text-xs text-[#5D4037] mb-2">
										Size: <span className="font-semibold">{product.size}</span>
									</p>
								)}
								<p className="font-bold text-[#D97736]">{formatPrice(product.price)}</p>
								<div className="mt-3 flex items-center gap-2">
									<div className="flex items-center gap-2 bg-[#FAF7F2] rounded-full border border-[#E0D8C8] px-2.5 py-1">
										<button
											onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
											className="text-[#D97736] hover:text-[#C96626]"
											aria-label="Decrease quantity"
										>
											<Minus className="w-3.5 h-3.5" />
										</button>
										<span className="w-5 text-center text-sm font-bold text-[#3E2723]">{quantity}</span>
										<button
											onClick={() => setQuantity((prev) => prev + 1)}
											className="text-[#D97736] hover:text-[#C96626]"
											aria-label="Increase quantity"
										>
											<Plus className="w-3.5 h-3.5" />
										</button>
									</div>
									<button
										onClick={onClose}
										className="inline-flex items-center gap-1 text-xs font-bold text-[#E53935] hover:bg-red-50 px-2 py-1 rounded"
									>
										<Trash2 className="w-3.5 h-3.5" /> Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="space-y-3">
					<Button
						onClick={onViewCart}
						className="w-full bg-gradient-to-r from-[#8B1538] to-[#A91D5F] hover:from-[#7A1231] hover:to-[#941859] text-white rounded-full py-3 font-bold transition-all hover:shadow-lg"
					>
						View cart ({quantity})
					</Button>
					<button
						onClick={() => {
							window.dispatchEvent(
								new CustomEvent("cart:continue-shopping", {
									detail: { increment: quantity },
								})
							);
							onContinueShopping();
						}}
						className="w-full text-[#D97736] font-semibold hover:text-[#C96626] transition-colors py-2"
					>
						Continue shopping
					</button>
				</div>
			</div>

			<style>{`
				@keyframes scale-in {
					from {
						transform: scale(0.95);
						opacity: 0;
					}
					to {
						transform: scale(1);
						opacity: 1;
					}
				}
				.animation-scale-in {
					animation: scale-in 0.3s ease-out;
				}
			`}</style>
		</div>
	);
};

export default CartSuccessModal;
