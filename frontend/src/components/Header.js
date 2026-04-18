import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, ShoppingCart, Heart, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";

const GUEST_KEY = "guestCartItems";
const API = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const guestTotal = () => {
	try {
		const d = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
		return Array.isArray(d) ? d.reduce((s, i) => s + Number(i?.quantity || 0), 0) : 0;
	} catch { return 0; }
};

const LINKS = [
	{ label: "Home",        to: "/" },
	{ label: "Products",    to: "/#products" },
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
		if (to === "/#products") return false; // never mark Products as active via path
		const base = to.split("#")[0];
		return base !== "/" && pathname === base;
	};

	return (
		<header className="sticky top-0 z-50 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-[70px] flex items-center justify-between gap-4">

				{/* Logo */}
				<div className="flex items-center gap-2 shrink-0">
					<button onClick={onMenuClick} className="md:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label="Menu">
						<Menu className="w-5 h-5 text-gray-700" />
					</button>
					<Link to="/" className="flex items-center">
						<img src="/logo.png" alt="Kesar Kosmetics" className="h-9 sm:h-10 md:h-12 w-auto object-contain" />
					</Link>
				</div>

				{/* Nav — desktop, truly centred */}
				<nav className="hidden md:flex items-center gap-6 lg:gap-8">
					{LINKS.map(({ label, to }) => {
						const active = isActive(to);
						const handleClick = (e) => {
							if (to === "/#products") {
								e.preventDefault();
								if (pathname === "/") {
									document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
								} else {
									navigate("/");
									setTimeout(() => {
										document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
									}, 400);
								}
								return;
							}
						};
						return (
							<Link
								key={label}
								to={to}
								onClick={handleClick}
								style={{ textDecoration: "none" }}
								className={[
									"text-[14px] lg:text-[15px] font-medium whitespace-nowrap transition-colors duration-150",
									active ? "text-[#E8620A]" : "text-gray-700 hover:text-[#E8620A]",
								].join(" ")}
							>
								{label}
							</Link>
						);
					})}
				</nav>

				{/* Icons */}
				<div className="flex items-center gap-1 shrink-0">
					<button onClick={onSearchClick} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Search">
						<Search className="w-[18px] h-[18px] text-gray-700" />
					</button>

					<button
						onClick={onCartClick}
						className={`p-2 rounded-full hover:bg-gray-100 transition-colors relative ${shakeCart ? "animate-[cartShake_0.5s_ease-in-out]" : ""}`}
						aria-label="Cart"
					>
						<ShoppingCart className="w-[18px] h-[18px] text-gray-700" />
						{count > 0 && (
							<span className="absolute -top-0.5 -right-0.5 bg-[#E8620A] text-white text-[9px] w-[17px] h-[17px] rounded-full flex items-center justify-center font-bold">
								{count}
							</span>
						)}
					</button>

					<button
						id="wishlist-target-icon"
						onClick={() => navigate("/wishlist")}
						className={`p-2 rounded-full hover:bg-gray-100 transition-colors relative ${shakeWish ? "animate-pulse" : ""}`}
						aria-label="Wishlist"
					>
						<Heart className="w-[18px] h-[18px] text-gray-700" />
						{wishlistCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 bg-[#E8620A] text-white text-[9px] w-[17px] h-[17px] rounded-full flex items-center justify-center font-bold">
								{wishlistCount}
							</span>
						)}
					</button>

					{user?._id ? (
						<div className="relative">
							<button onClick={() => setUserMenu(v => !v)} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Account">
								<User className="w-[18px] h-[18px] text-gray-700" />
							</button>
							{userMenu && (
								<div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
									<div className="px-4 py-2 border-b border-gray-100">
										<p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
										<p className="text-xs text-gray-500 truncate">{user.email}</p>
									</div>
									<button
										onClick={async () => { await logout(); navigate("/"); setUserMenu(false); }}
										className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
									>
										<LogOut className="w-4 h-4" /> Logout
									</button>
								</div>
							)}
						</div>
					) : (
						<Link to="/login" className="hidden sm:block ml-1">
							<span className="inline-block bg-[#E8620A] hover:bg-[#C8380A] text-white rounded-full px-5 py-2 text-sm font-semibold transition-colors cursor-pointer">
								Login
							</span>
						</Link>
					)}
				</div>

			</div>
		</header>
	);
}
