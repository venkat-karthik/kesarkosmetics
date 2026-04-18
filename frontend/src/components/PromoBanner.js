import React from "react";
import { Truck } from "lucide-react";

const PromoBanner = () => {
	return (
		<>
			<div className="bg-gradient-to-r from-[#C8380A] via-[#E8620A] to-[#C8380A] text-[#FFF8EC] text-xs sm:text-sm py-2 overflow-hidden">
				<div className="promo-marquee whitespace-nowrap">
					<span className="inline-flex items-center gap-2 mr-10"><Truck className="w-3.5 h-3.5" />Free shipping on orders above <span className="font-heading tabular-nums">₹2000</span> | Use code KESARIO for 10% off</span>
					<span className="inline-flex items-center gap-2 mr-10"><Truck className="w-3.5 h-3.5" />Free shipping on orders above <span className="font-heading tabular-nums">₹2000</span> | Use code KESARIO for 10% off</span>
					<span className="inline-flex items-center gap-2 mr-10"><Truck className="w-3.5 h-3.5" />Free shipping on orders above <span className="font-heading tabular-nums">₹2000</span> | Use code KESARIO for 10% off</span>
					<span className="inline-flex items-center gap-2 mr-10"><Truck className="w-3.5 h-3.5" />Free shipping on orders above <span className="font-heading tabular-nums">₹2000</span> | Use code KESARIO for 10% off</span>
				</div>
			</div>

			<style>{`
				@keyframes promoScroll {
					0% { transform: translateX(0); }
					100% { transform: translateX(-50%); }
				}

				.promo-marquee {
					display: inline-block;
					min-width: 200%;
					animation: promoScroll 18s linear infinite;
				}
			`}</style>
		</>
	);
};

export default PromoBanner;