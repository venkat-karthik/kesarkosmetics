import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Facebook, Instagram, Youtube, ChevronDown, X } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseClient";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ADMIN_EMAILS } from "../contexts/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const policies = {
	"refund-policy": {
		title: "Refund & Return Policy",
		content: [
			{ heading: "Overview", text: "We want you to be completely satisfied with your purchase. If you are not satisfied for any reason, we offer a straightforward return and refund process." },
			{ heading: "Eligibility", text: "Items must be returned within 7 days of delivery. Products must be unused, in original packaging, and in the same condition as received. Perishable goods (opened food items) are not eligible for return unless damaged or defective." },
			{ heading: "How to Initiate a Return", text: "Contact our support team at kesarkosmetics@gmail.com with your order number and reason for return. We will provide a return shipping label within 24 hours." },
			{ heading: "Refund Processing", text: "Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund. Approved refunds are processed within 5–7 business days to your original payment method." },
			{ heading: "Damaged or Defective Items", text: "If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund at no additional cost." },
			{ heading: "Non-Returnable Items", text: "Gift cards, downloadable products, and opened consumable goods cannot be returned unless defective." },
		],
	},
	"privacy-policy": {
		title: "Privacy Policy",
		content: [
			{ heading: "Information We Collect", text: "We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you make a purchase or create an account." },
			{ heading: "How We Use Your Information", text: "We use the information we collect to process transactions, send order confirmations and updates, respond to your comments and questions, and send promotional communications (with your consent)." },
			{ heading: "Information Sharing", text: "We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to trusted third parties who assist us in operating our website." },
			{ heading: "Data Security", text: "We implement a variety of security measures to maintain the safety of your personal information. All transactions are processed through a secure gateway provider." },
			{ heading: "Cookies", text: "We use cookies to enhance your experience, gather general visitor information, and track visits to our website. You can choose to disable cookies through your browser settings." },
			{ heading: "Your Rights", text: "You have the right to access, correct, or delete your personal data at any time. Contact us at kesarkosmetics@gmail.com to exercise these rights." },
		],
	},
	"terms-of-service": {
		title: "Terms of Service",
		content: [
			{ heading: "Acceptance of Terms", text: "By accessing and using the NEI Native website, you accept and agree to be bound by the terms and provisions of this agreement." },
			{ heading: "Use of the Website", text: "You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of others." },
			{ heading: "Product Information", text: "We strive to display product information as accurately as possible. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free." },
			{ heading: "Pricing", text: "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice." },
			{ heading: "Intellectual Property", text: "All content on this website, including text, graphics, logos, and images, is the property of NEI Native and is protected by applicable intellectual property laws." },
			{ heading: "Governing Law", text: "These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu." },
		],
	},
	"shipping-policy": {
		title: "Shipping Policy",
		content: [
			{ heading: "Processing Time", text: "Orders are processed within 1–2 business days after payment confirmation. Orders placed on weekends or public holidays will be processed on the next business day." },
			{ heading: "Delivery Time", text: "Standard delivery takes 4–7 business days across India. Express delivery (2–3 business days) is available at an additional charge during checkout." },
			{ heading: "Free Shipping", text: "We offer free standard shipping on all orders above ₹500. Orders below ₹500 are subject to a flat shipping fee of ₹60." },
			{ heading: "Tracking", text: "Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order on our Track Order page." },
			{ heading: "Delivery Issues", text: "If your order has not arrived within the estimated delivery window, please contact us at kesarkosmetics@gmail.com with your order number." },
		],
	},
};

// Admin credentials — change these to whatever you want
const ADMIN_CREDS = [
  { email: "gsrinadh55@gmail.com",      password: "Admin@1234" },
  { email: "kesarkosmetics@gmail.com",  password: "Admin@1234" },
];

// Admin login modal — uses Firebase auth
const AdminLoginModal = ({ onClose }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		const normalizedEmail = email.trim().toLowerCase();
		if (!ADMIN_EMAILS.map(e => e.toLowerCase()).includes(normalizedEmail)) {
			setError("Not an admin email.");
			return;
		}
		setLoading(true);
		try {
			const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
			// Ensure Firestore profile exists
			const ref = doc(db, "users", cred.user.uid);
			const snap = await getDoc(ref);
			if (!snap.exists()) {
				await setDoc(ref, {
					uid: cred.user.uid,
					name: cred.user.displayName || "Admin",
					email: normalizedEmail,
					phone: "",
					role: "admin",
					provider: "email",
					createdAt: serverTimestamp(),
				});
			}
			onClose();
			navigate("/admin/dashboard");
		} catch (err) {
			const msg = err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
				? "Invalid email or password."
				: err.code === "auth/user-not-found"
				? "No account found. Create it in Firebase Console."
				: err.message || "Login failed.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
					<div className="flex items-center justify-between mb-6">
						<h2 className="font-heading text-xl font-bold text-[#3E2723]">Admin Access</h2>
						<button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
					{error && <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-[#3E2723] mb-1">Email</label>
							<input
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder="admin@example.com"
								required
								className="w-full px-4 py-2.5 border-2 border-[#E0D8C8] rounded-xl text-sm focus:border-[#D97736] focus:outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-[#3E2723] mb-1">Password</label>
							<input
								type="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								className="w-full px-4 py-2.5 border-2 border-[#E0D8C8] rounded-xl text-sm focus:border-[#D97736] focus:outline-none"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[#D97736] hover:bg-[#C96626] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
						>
							{loading ? "Signing in..." : "Login"}
						</button>
					</form>
				</div>
			</div>
		</>
	);
};

// Policy modal — white background, dark readable text
const PolicyModal = ({ policyKey, onClose }) => {
	const policy = policies[policyKey];
	if (!policy) return null;
	return (
		<>
			<div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
					{/* Modal header */}
					<div className="sticky top-0 bg-white flex items-center justify-between px-6 py-5 border-b border-gray-100 rounded-t-3xl">
						<h2 className="font-heading text-xl font-bold text-gray-900">{policy.title}</h2>
						<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
							<X className="w-5 h-5 text-gray-600" />
						</button>
					</div>
					{/* Modal body */}
					<div className="px-6 py-6 space-y-6">
						{policy.content.map((section) => (
							<div key={section.heading}>
								<h3 className="font-semibold text-sm text-gray-900 mb-1.5">{section.heading}</h3>
								<p className="text-sm text-gray-600 leading-relaxed">{section.text}</p>
							</div>
						))}
					</div>
					{/* Modal footer */}
					<div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
						<p className="text-xs text-gray-400 text-center">Last updated: January 2025 · NEI Native</p>
					</div>
				</div>
			</div>
		</>
	);
};

const Footer = () => {
	const [products, setProducts] = useState([]);
	const [openSection, setOpenSection] = useState("best-sellers");
	const [openPolicy, setOpenPolicy] = useState(null);
	const [showAdminLogin, setShowAdminLogin] = useState(false);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const { getAllProducts } = await import("../utils/productsDb");
				setProducts(await getAllProducts());
			} catch {
				setProducts([]);
			}
		};
		fetchProducts();
	}, []);

	const toggleSection = (section) => {
		setOpenSection((current) => (current === section ? "" : section));
	};

	const bestSellersLinks = [
		{ to: "/?category=Ghee", label: "A2 Desi Ghee" },
		{ to: "/?category=Flours", label: "Attas & Millet Flours" },
		{ to: "/?category=Oils", label: "Wood Pressed Oils" },
		{ to: "/?category=Coffee", label: "Coffee Powder" },
		{ to: "/?category=Turmeric", label: "Turmeric Powder" },
	];

	const shopLinks = [
		{ to: "/?category=Jaggery", label: "Jaggery" },
		{ to: "/?category=Skin Care", label: "Skin Care" },
		{ to: "/?category=Peanut Butter", label: "Peanut Butter" },
		{ to: "/?category=Gift Hampers", label: "Gift Hampers" },
	];

	const policyLinks = [
		{ key: "refund-policy",   label: "Refund & Return Policy" },
		{ key: "privacy-policy",  label: "Privacy Policy" },
		{ key: "terms-of-service", label: "Terms of Service" },
		{ key: "shipping-policy", label: "Shipping Policy" },
	];

	const companyLinks = [
		{ to: "/about-us",    label: "About Us" },
		{ to: "/contact-us",  label: "Contact Us" },
		{ to: "/blogs",       label: "Blogs" },
		{ to: "/track-order", label: "Track Order" },
	];

	const productLinks = useMemo(
		() =>
			products
				.map((p) => {
					const id = p.id || p._id;
					return id ? { to: `/product/${id}`, label: p.name || "Product" } : null;
				})
				.filter(Boolean),
		[products]
	);

	const mobileBestSellerLinks = productLinks.length > 0 ? productLinks.slice(0, 5) : bestSellersLinks;
	const mobileShopLinks       = productLinks.length > 5 ? productLinks.slice(5, 10) : productLinks.slice(0, 4);
	const desktopBestSellerLinks = productLinks.length > 0 ? productLinks.slice(0, 5) : bestSellersLinks;
	const desktopShopLinks       = productLinks.length > 5 ? productLinks.slice(5, 10) : productLinks.length > 0 ? productLinks.slice(0, 5) : shopLinks;

	// Shared link style — bright enough to read on dark bg
	const linkCls = "text-sm text-white/70 hover:text-[#F5A800] transition-colors duration-150";
	const headingCls = "font-bold text-white text-sm mb-5 uppercase tracking-wider";

	return (
		<>
			{openPolicy && <PolicyModal policyKey={openPolicy} onClose={() => setOpenPolicy(null)} />}
			{showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} />}

			<footer className="bg-gradient-to-b from-[#3A1200] to-[#1A0800]">
				{/* Top gold line */}
				<div className="h-px bg-gradient-to-r from-transparent via-[#F5A800]/50 to-transparent" />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

					{/* ── Mobile ── */}
					<div className="md:hidden space-y-1">
						{/* Brand */}
						<div className="text-center pb-8">
							<div className="mx-auto w-28 h-28 mb-4">
								<img src="/logo.png" alt="NEI Native" className="w-full h-full object-contain" />
							</div>
							<p className="text-sm text-white/60 leading-relaxed max-w-xs mx-auto mb-5">
								Authentic, handcrafted essentials for a healthier, sustainable life.
							</p>
							<div className="flex justify-center gap-3">
								{[
									{ href: "https://facebook.com", Icon: Facebook, label: "Facebook" },
									{ href: "https://instagram.com", Icon: Instagram, label: "Instagram" },
									{ href: "https://youtube.com", Icon: Youtube, label: "YouTube" },
								].map(({ href, Icon, label }) => (
									<a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
										className="w-9 h-9 rounded-full border border-[#F5A800]/40 text-[#F5A800] flex items-center justify-center hover:bg-[#E8620A] hover:border-[#E8620A] hover:text-white transition-all">
										<Icon className="w-4 h-4" />
									</a>
								))}
							</div>
						</div>

						{/* Accordion sections */}
						{[
							{ id: "best-sellers", title: "Best Sellers", items: mobileBestSellerLinks, type: "link" },
							{ id: "shop",         title: "Shop",         items: mobileShopLinks.length > 0 ? mobileShopLinks : shopLinks, type: "link" },
							{ id: "company",      title: "Company",      items: companyLinks, type: "link" },
						].map((section) => (
							<div key={section.id} className="border-t border-white/10">
								<button
									type="button"
									onClick={() => toggleSection(section.id)}
									className="w-full flex items-center justify-between py-4 text-left"
								>
									<span className="font-semibold text-white text-sm">{section.title}</span>
									<ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${openSection === section.id ? "rotate-180" : ""}`} />
								</button>
								{openSection === section.id && (
									<ul className="pb-4 space-y-3">
										{section.items.map((item) => (
											<li key={item.label}>
												<Link to={item.to} className={linkCls}>{item.label}</Link>
											</li>
										))}
									</ul>
								)}
							</div>
						))}

						{/* Policies accordion */}
						<div className="border-t border-white/10">
							<button
								type="button"
								onClick={() => toggleSection("policies")}
								className="w-full flex items-center justify-between py-4 text-left"
							>
								<span className="font-semibold text-white text-sm">Policies</span>
								<ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${openSection === "policies" ? "rotate-180" : ""}`} />
							</button>
							{openSection === "policies" && (
								<ul className="pb-4 space-y-3">
									{policyLinks.map((item) => (
										<li key={item.key}>
											<button onClick={() => setOpenPolicy(item.key)} className={`${linkCls} text-left`}>
												{item.label}
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* ── Desktop ── */}
					<div className="hidden md:grid grid-cols-6 gap-8 mb-12 items-start">
						{/* Brand col */}
						<div className="col-span-2">
							<div className="w-32 h-32 lg:w-36 lg:h-36 mb-5">
								<img src="/logo.png" alt="NEI Native" className="w-full h-full object-contain" />
							</div>
							<p className="text-sm text-white/60 leading-relaxed mb-3 max-w-xs">
								Authentic, handcrafted essentials for a healthier, sustainable life.
							</p>
							<p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
								Explore our curated products and stay connected with new launches.
							</p>
							<div className="flex gap-3">
								{[
									{ href: "https://facebook.com", Icon: Facebook, label: "Facebook" },
									{ href: "https://instagram.com", Icon: Instagram, label: "Instagram" },
									{ href: "https://youtube.com", Icon: Youtube, label: "YouTube" },
								].map(({ href, Icon, label }) => (
									<a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
										className="w-9 h-9 rounded-full border border-[#F5A800]/40 text-[#F5A800] flex items-center justify-center hover:bg-[#E8620A] hover:border-[#E8620A] hover:text-white transition-all">
										<Icon className="w-4 h-4" />
									</a>
								))}
							</div>
						</div>

						{/* Products */}
						<div>
							<h4 className={headingCls}>Products</h4>
							<ul className="space-y-3">
								{desktopBestSellerLinks.map((item) => (
									<li key={item.label}>
										<Link to={item.to} className={linkCls}>{item.label}</Link>
									</li>
								))}
							</ul>
						</div>

						{/* More Products */}
						<div>
							<h4 className={headingCls}>More Products</h4>
							<ul className="space-y-3">
								{desktopShopLinks.map((item) => (
									<li key={item.label}>
										<Link to={item.to} className={linkCls}>{item.label}</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Company */}
						<div>
							<h4 className={headingCls}>Company</h4>
							<ul className="space-y-3">
								{companyLinks.map((item) => (
									<li key={item.label}>
										<Link to={item.to} className={linkCls}>{item.label}</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Policies */}
						<div>
							<h4 className={headingCls}>Policies</h4>
							<ul className="space-y-3">
								{policyLinks.map((item) => (
									<li key={item.key}>
										<button onClick={() => setOpenPolicy(item.key)} className={`${linkCls} text-left`}>
											{item.label}
										</button>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Bottom bar */}
					<div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
						<p className="text-xs text-white/40">&copy; 2025 NEI NATIVE. All rights reserved.</p>
						<div className="flex flex-wrap justify-center gap-4">
							{policyLinks.map((item) => (
								<button key={item.key} onClick={() => setOpenPolicy(item.key)}
									className="text-xs text-white/40 hover:text-[#F5A800] transition-colors">
									{item.label}
								</button>
							))}
						</div>
						<p className="text-xs text-white/40">Made with ❤️ for a sustainable future</p>
					<button
						onClick={() => setShowAdminLogin(true)}
						className="text-xs text-white/10 hover:text-white/30 transition-colors"
						aria-label="Admin"
					>
						Admin
					</button>
					</div>
				</div>
			</footer>
		</>
	);
};

export default Footer;
