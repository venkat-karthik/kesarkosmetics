import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, PackageSearch } from "lucide-react";
import axios from "axios";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseClient";
import { formatPrice, buildTrackingSteps } from "../utils/helpers";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

// Normalize a Firestore order doc into the same shape as backend orders
function normalizeFirestoreOrder(doc) {
	const o = doc;
	return {
		id: o.orderId || doc._docId || "",
		_docId: doc._docId,
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
		contact_email: o.userEmail || "",
		contact_phone: o.shippingAddress?.phone || "",
		created_at: o.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
		tracking_steps: buildTrackingSteps(o.status || "pending"),
	};
}

const TrackOrderResultsPage = () => {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const searchQuery = (params.get("query") || "").trim();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!searchQuery) { navigate("/track-order"); return; }

		const fetchOrders = async () => {
			const q = searchQuery.toLowerCase();
			const results = [];
			const seenIds = new Set();

			// 1. Search Firestore — match by orderId, userEmail, or phone
			try {
				const snap = await getDocs(collection(db, "orders"));
				snap.docs.forEach(d => {
					const data = { _docId: d.id, ...d.data() };
					const orderId = (data.orderId || "").toLowerCase();
					const email = (data.userEmail || "").toLowerCase();
					const phone = String(data.shippingAddress?.phone || "").replace(/\D/g, "");
					const qPhone = q.replace(/\D/g, "");

					if (
						orderId === q ||
						orderId.startsWith(q) ||
						email === q ||
						(qPhone.length >= 6 && phone.includes(qPhone))
					) {
						const normalized = normalizeFirestoreOrder(data);
						if (normalized.id && !seenIds.has(normalized.id)) {
							seenIds.add(normalized.id);
							results.push(normalized);
						}
					}
				});
			} catch (err) {
				console.error("Firestore search error:", err);
			}

			// 2. Also search backend (catches orders not yet in Firestore)
			try {
				const { data } = await axios.get(`${BACKEND_URL}/api/orders/track/search`, { params: { query: searchQuery } });
				if (Array.isArray(data)) {
					data.forEach(o => {
						if (!seenIds.has(o.id)) {
							seenIds.add(o.id);
							results.push(o);
						}
					});
				}
			} catch {
				// backend may be down, Firestore results are enough
			}

			results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
			setOrders(results);
			setLoading(false);
		};

		fetchOrders();
	}, [searchQuery, navigate]);

	if (loading) {
		return <div className="min-h-screen bg-[#F6F5F2] flex items-center justify-center text-[#5D4037]">Searching...</div>;
	}

	return (
		<div className="min-h-screen bg-[#F6F5F2]">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
				<div className="mb-6">
					<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Tracking Results</p>
					<h1 className="font-heading text-3xl sm:text-4xl text-[#3E2723]">Matching orders</h1>
					<p className="mt-2 text-[#6B5B52] text-sm sm:text-base">
						Results for: <span className="font-semibold text-[#3E2723]">{searchQuery}</span>
					</p>
				</div>

				{orders.length === 0 ? (
					<div className="rounded-[2rem] border border-dashed border-[#E0D8C8] bg-white p-10 text-center">
						<PackageSearch className="mx-auto h-12 w-12 text-[#D97736]" />
						<p className="mt-4 text-[#5D4037]">No orders found.</p>
						<p className="mt-1 text-sm text-[#8A7768]">Try searching with your email, phone, or the full order ID.</p>
						<Link to="/track-order" className="mt-4 inline-block text-[#D97736] font-semibold hover:underline">Try another search</Link>
					</div>
				) : (
					<div className="space-y-5">
						{orders.map((order) => {
							const contact = order.contact_email || order.contact_phone || searchQuery;
							return (
								<div key={order.id || order._docId} className="rounded-3xl border-2 border-[#E6DCCB] bg-white p-4 sm:p-6 shadow-sm">
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
										<div>
											<p className="text-xs uppercase tracking-[0.18em] text-[#8A7768]">Order ID</p>
											<p className="font-semibold text-[#3E2723] break-all text-sm">{order.id}</p>
										</div>
										<div className="flex items-center gap-3 flex-wrap">
											<span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
												order.status === "delivered" ? "bg-green-100 text-green-700" :
												order.status === "shipped" ? "bg-blue-100 text-blue-700" :
												order.status === "cancelled" ? "bg-red-100 text-red-700" :
												"bg-yellow-100 text-yellow-700"
											}`}>
												{(order.status || "pending").replace(/_/g, " ")}
											</span>
											<span className="text-sm text-[#6B5B52]">{new Date(order.created_at).toLocaleDateString()}</span>
											<span className="text-sm font-semibold text-[#D97736]">{formatPrice(order.total)}</span>
										</div>
									</div>

									{/* Items */}
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
										{(order.items || []).map((item, idx) => {
											return (
												<div key={idx} className="rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3">
													<img src={item.image || "/logo.png"} alt={item.product_name} className="w-full h-28 object-cover rounded-xl" />
													<p className="mt-2 font-medium text-[#3E2723] text-sm line-clamp-2">{item.product_name}</p>
													<div className="flex justify-between mt-1 text-xs text-[#6B5B52]">
														<span>Qty: {item.quantity}</span>
														<span className="font-semibold text-[#3E2723]">{formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}</span>
													</div>
												</div>
											);
										})}
									</div>

									{/* Track button */}
									<button
										type="button"
										onClick={() => navigate(`/track-order/status/${order.id}?contact=${encodeURIComponent(contact)}`)}
										className="inline-flex items-center gap-2 bg-[#D97736] hover:bg-[#C96626] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
									>
										Track this order
										<ChevronRight className="h-4 w-4" />
									</button>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default TrackOrderResultsPage;
