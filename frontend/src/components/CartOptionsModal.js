import React, { useEffect, useState } from "react";
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { formatPrice } from "../utils/helpers";

const CartOptionsModal = ({ isOpen, product, onClose, onProceedToBuy, onContinueShopping }) => {
	const [quantity, setQuantity] = useState(1);
	const [isRemoved, setIsRemoved] = useState(false);
	const unitPrice = Number(product?.price || 0);
	const estimatedTotal = isRemoved ? 0 : unitPrice * quantity;

	useEffect(() => {
		if (isOpen) {
			setQuantity(Math.max(1, Number(product?.quantity || 1)));
			setIsRemoved(false);
		}
	}, [isOpen, product]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-3xl max-w-md w-full p-8 relative animation-scale-in">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 hover:bg-[#EFE9DF] rounded-full transition-colors"
					aria-label="Close cart options popup"
				>
					<X className="w-6 h-6 text-[#3E2723]" />
				</button>

				<div className="flex justify-center mb-4">
					<div className="bg-[#F5EEE6] rounded-full p-4">
						<ShoppingCart className="w-8 h-8 text-[#D97736]" />
					</div>
				</div>

				<h2 className="text-center text-3xl font-heading text-[#3E2723] mb-4">Your cart</h2>
				<div className="mb-6 rounded-xl border border-[#E0D8C8] bg-[#FAF7F2] p-3 text-center">
					<p className="text-sm font-semibold text-[#D97736]">You got Free Shipping!</p>
				</div>

				{product && !isRemoved && (
					<div className="border border-[#E0D8C8] rounded-2xl p-4 mb-8">
						<div className="flex gap-4 items-center">
							<img
								src={product.images?.[0]}
								alt={product.name}
								className="w-16 h-16 object-cover rounded-lg"
							/>
							<div className="flex-1 min-w-0">
								<h3 className="font-heading text-lg sm:text-xl font-bold leading-[1.08] text-[#3E2723] mb-1 line-clamp-2">{product.name}</h3>
								{product.size && <p className="text-xs text-[#5D4037]">Size: {product.size}</p>}
								<div className="mt-2 flex items-center gap-2">
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
										onClick={() => setIsRemoved(true)}
										className="inline-flex items-center gap-1 text-xs font-bold text-[#E53935] hover:bg-red-50 px-2 py-1 rounded"
									>
										<Trash2 className="w-3.5 h-3.5" /> Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{isRemoved && (
					<div className="border border-[#E0D8C8] rounded-2xl p-4 mb-6 text-center text-sm text-[#5D4037] bg-[#FAF7F2]">
						Item removed from this popup selection.
					</div>
				)}

				<div className="mb-5 border-t border-[#E0D8C8] pt-4">
					<div className="flex items-center justify-between text-[#3E2723]">
						<span className="text-lg">Estimated total</span>
						<span className="text-2xl font-semibold">{formatPrice(estimatedTotal)}</span>
					</div>
					<p className="mt-2 text-right text-xs text-[#6B5B52]">Taxes included. Discounts and shipping calculated at checkout.</p>
				</div>

				<div className="space-y-3">
					<Button
						onClick={onProceedToBuy}
						disabled={isRemoved}
						className="w-full bg-gradient-to-r from-[#8B1538] to-[#A91D5F] hover:from-[#7A1231] hover:to-[#941859] text-white rounded-full py-3 font-bold transition-all hover:shadow-lg"
					>
						Check out
					</Button>
					<button
						onClick={onContinueShopping}
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

export default CartOptionsModal;
