import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package } from "lucide-react";
import { Button } from "../components/ui/button";

const OrderSuccessPage = () => {
	const [params] = useSearchParams();
	const orderId = params.get("orderId");

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F0E8DC] flex items-center justify-center px-4 py-16">
			<div className="max-w-lg w-full bg-white rounded-3xl border border-[#EDE4D8] shadow-[0_8px_40px_rgba(62,39,35,0.1)] p-10 text-center">
				{/* Animated icon */}
				<div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center mb-6 shadow-inner animate-[pulse_2s_ease-in-out_3]">
					<CheckCircle className="w-12 h-12 text-[#D97736]" />
				</div>

				{/* Decorative line */}
				<div className="h-0.5 w-16 bg-gradient-to-r from-[#D97736] to-[#F5A800] rounded-full mx-auto mb-6" />

				<h1 className="font-heading text-4xl font-semibold text-[#3E2723] mb-2">Order Confirmed! 🎉</h1>
				<p className="text-[#8A7768] text-sm leading-relaxed">Thank you for your purchase. We're carefully preparing your order.</p>

				{orderId && (
					<div className="mt-5 mb-6 bg-[#FAF7F2] rounded-2xl px-5 py-4 border border-[#EDE4D8] w-full">
						<p className="text-xs text-[#8A7768] uppercase tracking-widest mb-1">Order ID</p>
						<p className="font-mono text-sm font-semibold text-[#3E2723] break-all">{orderId}</p>
					</div>
				)}

				{/* What's next */}
				<div className="mb-6 grid grid-cols-3 gap-3 text-center">
					{[
						{ emoji: "📦", label: "Packed", sub: "Within 24h" },
						{ emoji: "🚚", label: "Shipped", sub: "1–2 days" },
						{ emoji: "🏠", label: "Delivered", sub: "4–7 days" },
					].map(({ emoji, label, sub }) => (
						<div key={label} className="bg-[#FAF7F2] rounded-xl border border-[#EDE4D8] p-3">
							<div className="text-2xl mb-1">{emoji}</div>
							<p className="text-xs font-bold text-[#3E2723]">{label}</p>
							<p className="text-[10px] text-[#8A7768]">{sub}</p>
						</div>
					))}
				</div>

				<div className="flex flex-col sm:flex-row gap-3">
					<Link to="/track-order" className="flex-1">
						<Button className="w-full bg-[#3E2723] hover:bg-[#5D4037] text-white rounded-2xl h-12 font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2">
							<Package className="w-4 h-4" /> Track Order
						</Button>
					</Link>
					<Link to="/products" className="flex-1">
						<Button className="w-full bg-gradient-to-r from-[#D97736] to-[#E8620A] hover:from-[#C96626] hover:to-[#D97736] text-white rounded-2xl h-12 font-semibold transition-all hover:shadow-lg">
							Continue Shopping
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default OrderSuccessPage;
