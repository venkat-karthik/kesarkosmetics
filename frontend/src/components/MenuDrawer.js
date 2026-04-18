import React from "react";
import { X, Search, ShoppingCart, Heart, CircleUserRound, Facebook, Instagram, Youtube } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";

const MenuDrawer = ({ isOpen, onClose }) => {
	const { user } = useAuth();
	const { wishlistCount } = useWishlist();
	const navigate = useNavigate();
	const isLoggedIn = Boolean(user && user._id);

	const navigationLinks = [
		{ label: "Home", path: "/" },
		{ label: "Products", path: "/#products" },
		{ label: "Track Order", path: "/track-order" },
		{ label: "About Us", path: "/about-us" },
		{ label: "Blogs", path: "/blogs" },
		{ label: "Contact", path: "/contact-us" },
	];

	return (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
					onClick={onClose}
				/>
			)}
			<div
				className={`fixed top-0 left-0 h-full w-[88vw] max-w-[380px] z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				style={{
					background: "linear-gradient(160deg, #4A1A00 0%, #7A3B00 60%, #4A1A00 100%)",
					visibility: isOpen ? "visible" : "hidden",
				}}
			>
				{/* Header */}
				<div className="px-4 py-4 border-b border-[#C8380A]/40">
					<div className="flex items-center justify-between">
						<button onClick={onClose} className="p-2 hover:bg-[#C8380A]/30 rounded-full transition-colors" aria-label="Close menu">
							<X className="w-6 h-6 text-[#FFF8EC]" />
						</button>
						<Link to="/" onClick={onClose} className="flex items-center">
							<img src="/logo.png" alt="NEI Native" className="h-12 w-auto object-contain" />
						</Link>
						<div className="flex items-center gap-1">
							<button className="p-2 hover:bg-[#C8380A]/30 rounded-full transition-colors" aria-label="Search">
								<Search className="w-5 h-5 text-[#FFF8EC]" />
							</button>
							<button className="p-2 hover:bg-[#C8380A]/30 rounded-full transition-colors" aria-label="Cart">
								<ShoppingCart className="w-5 h-5 text-[#FFF8EC]" />
							</button>
							<button
								onClick={() => { navigate("/wishlist"); onClose(); }}
								className="p-2 hover:bg-[#C8380A]/30 rounded-full relative transition-colors"
								aria-label="Wishlist"
							>
								<Heart className="w-5 h-5 text-[#FFF8EC]" />
								{wishlistCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-[#F5A800] text-[#4A1A00] text-[10px] h-[18px] min-w-[18px] rounded-full flex items-center justify-center font-bold leading-none px-1">
										{wishlistCount}
									</span>
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Nav links */}
				<div className="px-4 pt-5 pb-4">
					<nav className="space-y-1">
						{navigationLinks.map((link, i) => (
							<Link
								key={link.label}
								to={link.path}
								onClick={onClose}
								className="flex items-center px-4 py-3 text-lg font-medium text-[#FFF8EC] rounded-xl hover:bg-[#C8380A]/30 transition-all duration-200 border border-transparent hover:border-[#F5A800]/30"
								style={{ animationDelay: `${i * 50}ms` }}
							>
								{link.label}
							</Link>
						))}
						{!isLoggedIn && (
							<Link
								to="/login"
								onClick={onClose}
								className="flex items-center justify-center px-4 py-3 mt-3 text-lg font-bold text-[#4A1A00] bg-gradient-to-r from-[#F5A800] to-[#E8620A] rounded-xl hover:from-[#E8620A] hover:to-[#C8380A] transition-all duration-200 shadow-lg"
							>
								Login
							</Link>
						)}
					</nav>

					{/* Account + Social */}
					<div className="mt-6 pt-5 border-t border-[#C8380A]/30">
						{isLoggedIn && (
							<Link
								to="/login"
								onClick={onClose}
								className="flex items-center gap-3 px-4 py-3 text-[#FFF8EC] rounded-xl hover:bg-[#C8380A]/30 transition-colors mb-4"
							>
								<CircleUserRound className="w-5 h-5 text-[#F5A800]" />
								<span className="font-medium">My Account</span>
							</Link>
						)}

						<div className="flex items-center justify-center gap-3 pt-2">
							{[
								{ href: "https://facebook.com", Icon: Facebook, label: "Facebook" },
								{ href: "https://instagram.com", Icon: Instagram, label: "Instagram" },
								{ href: "https://youtube.com", Icon: Youtube, label: "YouTube" },
							].map(({ href, Icon, label }) => (
								<a
									key={label}
									href={href}
									target="_blank"
									rel="noreferrer"
									aria-label={label}
									className="w-10 h-10 rounded-full border border-[#F5A800]/50 text-[#F5A800] flex items-center justify-center hover:bg-[#F5A800] hover:text-[#4A1A00] transition-all duration-200"
								>
									<Icon className="w-5 h-5" />
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default MenuDrawer;
