import React from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";

const LoginRequiredModal = ({ isOpen, product, onClose, onLogin, onContinueShopping }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-3xl max-w-md w-full p-8 relative animation-scale-in">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 hover:bg-[#EFE9DF] rounded-full transition-colors"
					aria-label="Close login required popup"
				>
					<X className="w-6 h-6 text-[#3E2723]" />
				</button>

				<div className="flex justify-center mb-6">
					<div className="bg-[#FCE9E5] rounded-full p-3">
						<AlertCircle className="w-8 h-8 text-[#E4572E]" />
					</div>
				</div>

				<h2 className="text-center text-xl font-bold text-[#3E2723] mb-2">Login required</h2>
				<p className="text-center text-[#5D4037] mb-6">Please login to add items to your cart.</p>

				{product && (
					<div className="border border-[#E0D8C8] rounded-2xl p-4 mb-8">
						<div className="flex gap-4">
							<img
								src={product.images?.[0]}
								alt={product.name}
								className="w-16 h-16 object-cover rounded-lg"
							/>
							<div className="flex-1">
								<h3 className="font-heading text-lg sm:text-xl font-bold leading-[1.08] text-[#3E2723] mb-1">{product.name}</h3>
								{product.size && (
									<p className="text-xs text-[#5D4037]">Size: {product.size}</p>
								)}
							</div>
						</div>
					</div>
				)}

				<div className="space-y-3">
					<Button
						onClick={onLogin}
						className="w-full bg-gradient-to-r from-[#D97736] to-[#F5A962] hover:from-[#C96626] hover:to-[#E59650] text-white rounded-full py-3 font-bold transition-all hover:shadow-lg"
					>
						Login now
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

export default LoginRequiredModal;