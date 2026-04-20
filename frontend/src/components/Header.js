import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, ShoppingCart, Heart, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";

const LINKS = [
	{ label: "Home",        to: "/" },
	{ label: "Products",    to: "/products" },
	{ label: "Track Order", to: "/track-order" },
	{ label: "About Us",    to: "/about-us" },
	{ label: "Blogs",       to: "/blogs" },
	{ label: "Contact",     to: "/contact-us" },
];

export default function Header({ onMenuClick, onSearchClick, onCartClick, shakeCart, triggerCartRefresh }) {
	const { user, logout } = useAuth();
	const { wishlistCount } = useWishlist();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { cartCount } = useCart();
	const [userMenu, setUserMenu] = React.useState(false);
	const [shakeWish, setShakeWish] = React.useState(false);

	React.useEffect(() => {
		const onWish = () => { setShakeWish(true); setTimeout(() => setShakeWish(false), 550); };
		window.addEventListener('wishlist:updated', onWish);
		return () => window.removeEventListener('wishlist:updated', onWish);
	}, []);

	const count = cartCount;

	// Determine active link — exact match only
	const isActive = (to) => {
		if (to === "/" ) return pathname === "/";
		const base = to.split("#")[0];
		return base !== "/" && pathname === base;
	};

	return (
		<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.06)] border-b border-[#F0E8DC]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-[72px] flex items-center justify-between gap-4">

				{/* Logo */}
				<div className="flex items-center gap-2 shrink-0">
					<button onClick={onMenuClick} className="md:hidden p-2 rounded-2xl hover:bg-[#FFF3E0] transition-colors" aria-label="Menu">
						<Menu className="w-5 h-5 text-[#5D4037]" />
					</button>
					<Link to="/" className="flex items-center">
						<img src="/logo.png" alt="Kesar Kosmetics" className="h-9 sm:h-10 md:h-12 w-auto object-contain" />
					</Link>
				</div>

				{/* Nav — desktop */}
				<nav className="hidden md:flex items-center gap-6 lg:gap-8">
					{LINKS.map(({ label, to }) => {
						const active = isActive(to);
						return (
							<Link
								key={label}
								to={to}
								style={{ textDecoration: "none" }}
								className={[
									"text-[14px] lg:text-[15px] font-medium whitespace-nowrap transition-colors duration-150 relative",
									active
										? "text-[#D97736] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[#D97736] after:rounded-full"
										: "text-[#5D4037] hover:text-[#D97736]",
								].join(" ")}
							>
								{label}
							</Link>
						);
					})}
				</nav>

				{/* Icons */}
				<div className="flex items-center gap-0.5 shrink-0">
					<button onClick={onSearchClick} className="p-2.5 rounded-2xl hover:bg-[#FFF3E0] transition-colors" aria-label="Search">
						<Search className="w-[18px] h-[18px] text-[#5D4037]" />
					</button>

					<button
						onClick={onCartClick}
						className={`p-2.5 rounded-2xl hover:bg-[#FFF3E0] transition-colors relative ${shakeCart ? "animate-[cartShake_0.5s_ease-in-out]" : ""}`}
						aria-label="Cart"
					>
						<ShoppingCart className="w-[18px] h-[18px] text-[#5D4037]" />
						{count > 0 && (
							<span className="absolute -top-0.5 -right-0.5 bg-[#D97736] text-white text-[9px] w-[17px] h-[17px] rounded-full flex items-center justify-center font-bold shadow-sm">
								{count}
							</span>
						)}
					</button>

					<button
						id="wishlist-target-icon"
						onClick={() => navigate("/wishlist")}
						className={`p-2.5 rounded-2xl hover:bg-[#FFF3E0] transition-colors relative ${shakeWish ? "animate-pulse" : ""}`}
						aria-label="Wishlist"
					>
						<Heart className="w-[18px] h-[18px] text-[#5D4037]" />
						{wishlistCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 bg-[#D97736] text-white text-[9px] w-[17px] h-[17px] rounded-full flex items-center justify-center font-bold shadow-sm">
								{wishlistCount}
							</span>
						)}
					</button>

					{user?._id ? (
						<div className="relative">
							<button onClick={() => setUserMenu(v => !v)} className="p-2.5 rounded-2xl hover:bg-[#FFF3E0] transition-colors" aria-label="Account">
								<User className="w-[18px] h-[18px] text-[#5D4037]" />
							</button>
							{userMenu && (
								<div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-[#F0E8DC] py-2 z-50">
									<div className="px-4 py-3 border-b border-[#F5EEE6]">
										<p className="text-sm font-semibold text-[#3E2723] truncate">{user.name}</p>
										<p className="text-xs text-[#8A7768] truncate mt-0.5">{user.email}</p>
									</div>
									<button
										onClick={async () => { await logout(); navigate("/"); setUserMenu(false); }}
										className="w-full px-4 py-2.5 text-left text-sm text-[#5D4037] hover:bg-[#FFF3E0] flex items-center gap-2 transition-colors"
									>
										<LogOut className="w-4 h-4 text-[#D97736]" /> Logout
									</button>
								</div>
							)}
						</div>
					) : (
						<Link to="/login" className="hidden sm:block ml-2">
							<span className="inline-block bg-gradient-to-r from-[#D97736] to-[#E8620A] hover:from-[#C96626] hover:to-[#D97736] text-white rounded-2xl px-5 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer">
								Login
							</span>
						</Link>
					)}
				</div>

			</div>
		</header>
	);
}
