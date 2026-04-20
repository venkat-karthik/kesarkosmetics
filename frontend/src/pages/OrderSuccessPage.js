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
				{/* Icon */}
				<div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center mb-6 shadow-inner">
					<CheckCircle className="w-10 h-10 text-[#D97736]" />
				</div>

				{/* Decorative line */}
				<div className="h-0.5 w-12 bg-gradient-to-r from-[#D97736] to-[#F5A800] rounded-full mx-auto mb-6" />

				<h1 className="font-heading text-4xl font-semibold text-[#3E2723] mb-3">Order Confirmed</h1>
				<p className="text-[#8A7768] mb-2 text-sm">Thank you for your purchase. We're preparing your order.</p>

				{orderId && (
					<div className="mt-4 mb-8 bg-[#FAF7F2] rounded-2xl px-5 py-4 border border-[#EDE4D8] inline-block w-full">
						<p className="text-xs text-[#8A7768] uppercase tracking-widest mb-1">Order ID</p>
						<p className="font-mono text-sm font-semibold text-[#3E2723] break-all">{orderId}</p>
					</div>
				)}

				<div className="flex flex-col sm:flex-row gap-3 mt-2">
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
