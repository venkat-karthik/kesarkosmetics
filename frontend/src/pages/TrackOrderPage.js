import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, PackageSearch, ChevronRight } from "lucide-react";
import axios from "axios";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseClient";
import { toast } from "sonner";
import { formatPrice } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const TrackOrderPage = () => {
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();
	const [searchValue, setSearchValue] = useState("");
	const [orders, setOrders] = useState([]);
	const [ordersLoading, setOrdersLoading] = useState(true);

	useEffect(() => {
		const fetchOrders = async () => {
			if (authLoading) return;
			if (!user || !user._id) {
				setOrders([]);
				setOrdersLoading(false);
				return;
			}

			try {
				// Fetch from Firestore (no orderBy to avoid composite index requirement)
				const q = query(
					collection(db, "orders"),
					where("userId", "==", user._id)
				);
				const snap = await getDocs(q);
				const firestoreOrders = snap.docs
					.map(d => ({ id: d.id, ...d.data() }))
					.sort((a, b) => {
						const ta = a.createdAt?.toDate?.()?.getTime() || 0;
						const tb = b.createdAt?.toDate?.()?.getTime() || 0;
						return tb - ta;
					});

				// Also fetch from backend (in-memory store, may have recent orders)
				let backendOrders = [];
				try {
					const { data } = await axios.get(`${BACKEND_URL}/api/orders`, {
						withCredentials: true,
						headers: { "x-user-id": user._id, "x-user-email": user.email },
					});
					backendOrders = Array.isArray(data) ? data : [];
				} catch {
					// backend may be unavailable, that's ok
				}

				// Normalize Firestore orders
				const normalizedFirestore = firestoreOrders.map(o => ({
					id: o.orderId || o.id,
					_firestoreId: o.id,
					user_id: o.userId,
					items: (o.items || []).map(i => ({
						product_id: i.product_id,
						product_name: i.product_name,
						quantity: i.quantity,
						price: i.price,
						image: null,
					})),
					shipping_address: o.shippingAddress || {},
					payment_method: o.paymentMethod || "cod",
					total: o.total || 0,
					status: o.status || "pending",
					contact_email: user.email,
					contact_phone: user.phone || "",
					created_at: o.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
				}));

				// Merge: prefer Firestore, add backend orders not already in Firestore
				const firestoreIds = new Set(normalizedFirestore.map(o => o.id));
				const mergedBackend = backendOrders.filter(o => !firestoreIds.has(o.id));
				const allOrders = [...normalizedFirestore, ...mergedBackend]
					.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

				setOrders(allOrders);
			} catch (err) {
				console.error("Failed to fetch orders:", err);
				setOrders([]);
			} finally {
				setOrdersLoading(false);
			}
		};

		fetchOrders();
	}, [authLoading, user]);

	const handleSubmit = (event) => {
		event.preventDefault();
		const value = searchValue.trim();
		if (!value) {
			toast.error("Please enter order ID, email, or phone number");
			return;
		}
		navigate(`/track-order/results?query=${encodeURIComponent(value)}`);
	};

	const getTrackLink = (order) => {
		const contact = order.contact_email || order.contact_phone || order.contact_registered_email || order.contact_registered_phone || user?.email || user?.phone || "";
		const productId = order.items?.[0]?.product_id || "";
		return `/track-order/status/${order.id}?contact=${encodeURIComponent(contact)}&product=${encodeURIComponent(productId)}`;
	};

	return (
		<div className="min-h-screen bg-[#F6F5F2]">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
				<div className="mb-8 rounded-[2rem] border border-[#E9E0D2] bg-white p-5 sm:p-7 shadow-sm">
					<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Track Orders</p>
					<h1 className="mt-2 font-heading text-3xl md:text-4xl text-[#3E2723]">Your recent orders</h1>
					<p className="mt-3 max-w-3xl text-sm sm:text-base text-[#5D4037] leading-7">
						If you are signed in, we will show the orders you already placed. You can also search by order ID, email, or phone.
					</p>
				</div>

				{user && user._id ? (
					<div className="mb-8">
						<div className="mb-4 flex items-center justify-between gap-3">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">My Orders</p>
								<h2 className="mt-1 font-heading text-2xl text-[#3E2723]">Placed by {user.name || "you"}</h2>
							</div>
							<p className="text-sm text-[#6B5B52]">{orders.length} order{orders.length === 1 ? "" : "s"}</p>
						</div>

						{ordersLoading ? (
							<div className="rounded-3xl border border-dashed border-[#E0D8C8] bg-white p-10 text-center text-[#5D4037]">Loading your orders...</div>
						) : orders.length === 0 ? (
							<div className="rounded-3xl border border-dashed border-[#E0D8C8] bg-white p-10 text-center">
								<PackageSearch className="mx-auto h-12 w-12 text-[#D97736]" />
								<p className="mt-4 text-[#5D4037]">No orders found yet.</p>
								<p className="mt-2 text-sm text-[#6B5B52]">Place an order first and it will appear here automatically.</p>
							</div>
						) : (
							<div className="space-y-4">
								{orders.map((order) => {
									const items = Array.isArray(order.items) ? order.items : [];
									const statusLabel = String(order.status || "pending").replace(/_/g, " ");
									return (
										<div key={order.id} className="rounded-3xl border-2 border-[#E6DCCB] bg-white p-4 sm:p-6 shadow-sm">
											<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
												<div>
													<p className="text-xs uppercase tracking-[0.18em] text-[#8A7768]">Order ID</p>
													<p className="font-semibold text-[#3E2723] break-all">{order.id}</p>
												</div>
												<div className="flex flex-wrap items-center gap-2">
													<span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#8B2C6D] capitalize">
														{statusLabel}
													</span>
													<span className="text-sm text-[#6B5B52]">{new Date(order.created_at).toLocaleString()}</span>
												</div>
											</div>

											<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
												{items.map((item, index) => (
													<div key={`${order.id}-${item.product_id || index}`} className="rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3">
														<img src={item.image || "/logo.png"} alt={item.product_name} className="h-36 w-full rounded-xl object-cover" />
														<p className="mt-3 font-medium text-[#3E2723] line-clamp-2">{item.product_name}</p>
														<div className="mt-2 flex items-center justify-between gap-3 text-sm text-[#6B5B52]">
															<span>Qty: {item.quantity}</span>
															<span className="font-semibold text-[#3E2723]">{formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}</span>
														</div>
													</div>
												))}
											</div>

											<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#F0E7DA] pt-4">
												<div className="text-sm text-[#6B5B52]">
													<p>Total amount</p>
													<p className="font-semibold text-[#3E2723]">{formatPrice(Number(order.total || 0))}</p>
												</div>
												<Link
													to={getTrackLink(order)}
													className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 py-3 font-semibold text-white transition hover:bg-[#2A2A2A]"
												>
													View order
													<ChevronRight className="h-4 w-4" />
												</Link>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				) : null}
				<div className="rounded-[2rem] border-2 border-[#E6DCCB] bg-white p-5 sm:p-8 shadow-sm">
					<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Order Support</p>
					<h1 className="mt-2 font-heading text-3xl md:text-4xl text-[#3E2723]">Track your order</h1>
					<p className="mt-3 text-sm sm:text-base text-[#5D4037] leading-7">
						Enter your order ID, phone number, or email to find your orders.
					</p>

					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div>
							<label htmlFor="track-input" className="block text-sm font-semibold text-[#3E2723] mb-2">
								Order ID / Email / Phone
							</label>
							<input
								id="track-input"
								type="text"
								value={searchValue}
								onChange={(event) => setSearchValue(event.target.value)}
								placeholder="Example: 6ae3... or user@email.com or +91 98xxxxxx"
								required
								className="h-12 w-full rounded-xl border border-[#D8D0C2] px-4 text-[#2D2D2C] placeholder:text-[#958A7D] outline-none focus:border-[#D97736]"
							/>
						</div>
						<button
							type="submit"
							className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 font-semibold text-white transition-colors hover:bg-[#2A2A2A] sm:w-auto"
						>
							<Search className="h-4 w-4" />
							Track Order
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default TrackOrderPage;
