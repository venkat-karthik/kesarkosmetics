import React from "react";
import { Sparkles } from "lucide-react";

const PromoBanner = () => {
	return (
		<>
			<div className="bg-gradient-to-r from-[#3E2723] via-[#5D4037] to-[#3E2723] text-[#F5A800] text-xs sm:text-sm py-2.5 overflow-hidden border-b border-[#F5A800]/10">
				<div className="promo-marquee whitespace-nowrap">
					{[0,1,2,3].map(i => (
						<span key={i} className="inline-flex items-center gap-2 mr-12">
							<Sparkles className="w-3 h-3 text-[#F5A800]" />
							<span className="text-white/90">Free shipping on orders above</span>
							<span className="font-heading tabular-nums text-[#F5A800] font-semibold">₹2000</span>
							<span className="text-white/50 mx-1">·</span>
							<span className="text-white/90">Use code</span>
							<span className="font-semibold text-[#F5A800] tracking-wider">KESAR10</span>
							<span className="text-white/90">for 10% off</span>
						</span>
					))}
				</div>
			</div>
		</>
	);
};

export default PromoBanner;