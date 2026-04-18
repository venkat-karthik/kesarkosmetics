import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Box, CreditCard, MapPin, Package, ShoppingBag, Truck, User, CircleDashed } from "lucide-react";
import axios from "axios";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseClient";
import { formatPrice, buildTrackingSteps } from "../utils/helpers";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const STEP_ICONS = {
	pending: ShoppingBag,
	shipped: Box,
	in_transit: Truck,
	delivered: BadgeCheck,
};

const TrackOrderStatusPage = () => {
	const { orderId } = useParams();
	const [params] = useSearchParams();
	const contact = params.get("contact") || "";
	const selectedProductId = params.get("product") || "";

	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let intervalId;
		const fetchOrder = async () => {
			if (!orderId) { setLoading(false); return; }
			try {
				// Try backend first (has tracking_steps enrichment)
				const { data } = await axios.get(`${BACKEND_URL}/api/orders/track/${orderId}`, {
					params: { contact: contact || "bypass" },
				});
				setOrder(data || null);
			} catch {
				// Fallback: search Firestore by orderId
				try {
					const snap = await getDocs(collection(db, "orders"));
					const match = snap.docs
						.map(d => ({ _docId: d.id, ...d.data() }))
						.find(o => (o.orderId || "").toLowerCase() === orderId.toLowerCase() || o._docId === orderId);

					if (match) {
						const status = match.status || "pending";
						const tracking_steps = buildTrackingSteps(status);
						setOrder({
							id: match.orderId || match._docId,
							items: match.items || [],
							shipping_address: match.shippingAddress || {},
							payment_method: match.paymentMethod || "cod",
							total: match.total || 0,
							status,
							contact_email: match.userEmail || "",
							contact_phone: match.shippingAddress?.phone || "",
							created_at: match.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
							tracking_steps,
						});
					} else {
						setOrder(null);
					}
				} catch (fsErr) {
					console.error("Firestore fallback error:", fsErr);
					setOrder(null);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchOrder();
		intervalId = setInterval(fetchOrder, 5000);
		const handleVisibilityChange = () => { if (document.visibilityState === "visible") fetchOrder(); };
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => { clearInterval(intervalId); document.removeEventListener("visibilitychange", handleVisibilityChange); };
	}, [orderId, contact]);

	const selectedItem = useMemo(() => {
		if (!order || !Array.isArray(order.items)) return null;
		if (!selectedProductId) return order.items[0] || null;
		return order.items.find((item) => item.product_id === selectedProductId) || order.items[0] || null;
	}, [order, selectedProductId]);
	const selectedItemProductId = selectedItem?.product_id || selectedItem?.product?._id || selectedItem?.product?.id || null;

	const trackingSteps = Array.isArray(order?.tracking_steps) && order.tracking_steps.length > 0 ? order.tracking_steps : [];
	const orderStatus = String(order?.status || "pending").replace(/_/g, " ");
	const activeStepKey = trackingSteps.find((step) => step.active)?.key || "pending";
	const customerName = order?.shipping_address?.name || "N/A";
	const customerPhone = order?.contact_phone || order?.shipping_address?.phone || "N/A";
	const paymentMethod = order?.payment_method ? String(order.payment_method).replace(/_/g, " ") : "cod";
	const orderDate = order?.created_at ? new Date(order.created_at).toLocaleString() : "N/A";
	const shippingAddress = order?.shipping_address
		? [order.shipping_address.address, order.shipping_address.city, order.shipping_address.state, order.shipping_address.pincode]
			.filter(Boolean)
			.join(", ")
		: "N/A";

	if (loading) {
		return <div className="min-h-screen bg-[#F6F5F2] flex items-center justify-center text-[#5D4037]">Loading...</div>;
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-[#F6F5F2] flex items-center justify-center px-4">
				<div className="rounded-3xl border border-[#E6DCCB] bg-white p-8 text-center max-w-lg w-full">
					<p className="text-[#5D4037]">Order not found or contact does not match.</p>
					<Link to="/track-order" className="inline-block mt-4 text-[#D97736] font-semibold hover:underline">Back to tracking</Link>
				</div>
			</div>
		);
	}

	const steps = Array.isArray(order.tracking_steps) ? order.tracking_steps : [];

	return (
		<div className="min-h-screen bg-[#F6F5F2]">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
				<div className="rounded-3xl border-2 border-[#E6DCCB] bg-white p-5 sm:p-8 shadow-sm">
					<div className="mb-4 sm:hidden">
						<Link to="/track-order" className="inline-flex items-center gap-2 rounded-full border border-[#E6DCCB] bg-[#FCFAF7] px-4 py-2 text-sm font-semibold text-[#5D4037]">
							<ArrowLeft className="h-4 w-4" />
							Back
						</Link>
					</div>

					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
						<div className="flex-1">
							<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736] text-center lg:text-left">Live Tracking</p>
							<h1 className="mt-2 text-center lg:text-left font-heading text-3xl sm:text-5xl text-[#111111]">Track Your Order</h1>
							<p className="mt-3 text-center lg:text-left text-sm text-[#6B5B52] break-all">Order ID: {order.id}</p>
							<p className="mt-2 text-center lg:text-left text-sm font-medium text-[#8A7768] leading-6">This screen refreshes automatically when the admin changes the order status.</p>

							<div className="mt-6 grid grid-cols-2 gap-4 sm:mt-8 sm:grid-cols-4 sm:gap-4">
								{trackingSteps.map((step, index) => {
									const Icon = STEP_ICONS[step.key] || ShoppingBag;
									return (
										<div key={step.key} className="relative text-center">
											{index < trackingSteps.length - 1 && (
												<div className={`hidden sm:block absolute left-[52%] top-8 h-1 w-full ${step.completed ? "bg-[#9CCCED]" : "bg-[#DDEAF2]"}`} />
											)}
											<div className={`mx-auto relative z-10 h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 flex items-center justify-center ${step.completed ? "bg-[#CFEAFB] border-[#9CCCED] text-[#4E7F9B]" : step.active ? "bg-[#EEF7FD] border-[#9CCCED] text-[#4E7F9B]" : "bg-white border-[#DDEAF2] text-[#9BB4C2]"}`}>
												<Icon className="h-7 w-7 sm:h-8 sm:w-8" />
											</div>
											<p className="mt-3 text-sm sm:text-xl font-semibold text-[#111111] leading-tight">{step.label}</p>
										</div>
									);
								})}
							</div>

							<div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-4">
								{trackingSteps.map((step) => (
									<div key={`chip-${step.key}`} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${step.active ? "border-[#9CCCED] bg-[#EEF7FD] text-[#4E7F9B]" : step.completed ? "border-[#CFEAFB] bg-[#F4FBFF] text-[#4E7F9B]" : "border-[#E9E0D2] bg-[#FCFAF7] text-[#8A7768]"}`}>
									<div className="flex items-center gap-2">
										{step.completed ? <BadgeCheck className="h-4 w-4" /> : step.active ? <CircleDashed className="h-4 w-4" /> : <Package className="h-4 w-4" />}
										<span>{step.label}</span>
									</div>
								</div>
							))}
							</div>

							{selectedItem && (
								<div className="mt-8 rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-4 sm:p-5">
									<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8A7768] mb-3">
										<Package className="h-4 w-4" />
										Selected Item
									</div>
									{selectedItemProductId ? (
										<Link to={`/product/${selectedItemProductId}`} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 items-center group">
											<img src={selectedItem.image || "/logo.png"} alt={selectedItem.product_name} className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] object-cover rounded-xl transition group-hover:scale-[1.01]" />
											<div>
												<p className="font-semibold text-xl text-[#3E2723] group-hover:text-[#D97736]">{selectedItem.product_name}</p>
												<p className="mt-1 text-[#6B5B52]">Qty: {selectedItem.quantity}</p>
												<p className="mt-1 font-semibold text-[#3E2723]">{formatPrice(Number(selectedItem.price || 0) * Number(selectedItem.quantity || 0))}</p>
												<p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#D97736] group-hover:underline">
													View product details
												</p>
											</div>
										</Link>
									) : (
										<div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-4 items-center">
											<img src={selectedItem.image || "/logo.png"} alt={selectedItem.product_name} className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] object-cover rounded-xl" />
											<div>
												<p className="font-semibold text-xl text-[#3E2723]">{selectedItem.product_name}</p>
												<p className="mt-1 text-[#6B5B52]">Qty: {selectedItem.quantity}</p>
												<p className="mt-1 font-semibold text-[#3E2723]">{formatPrice(Number(selectedItem.price || 0) * Number(selectedItem.quantity || 0))}</p>
											</div>
										</div>
									)}
								</div>
							)}
						</div>

							<div className="w-full lg:w-[360px] shrink-0 mt-6 lg:mt-0">
								<div className="rounded-3xl border border-[#E9E0D2] bg-[#FCFAF7] p-4 sm:p-5 shadow-sm">
								<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Order Details</p>
								<div className="mt-4 space-y-4 text-sm text-[#5D4037]">
									<div className="flex items-start gap-3">
										<User className="mt-0.5 h-4 w-4 text-[#8B2C6D]" />
										<div>
											<p className="font-semibold text-[#3E2723]">{customerName}</p>
											<p>{customerPhone}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<MapPin className="mt-0.5 h-4 w-4 text-[#8B2C6D]" />
										<div>
											<p className="font-semibold text-[#3E2723]">Shipping Address</p>
											<p className="leading-6">{shippingAddress}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<CreditCard className="mt-0.5 h-4 w-4 text-[#8B2C6D]" />
										<div>
											<p className="font-semibold text-[#3E2723]">Payment Method</p>
											<p className="capitalize">{paymentMethod}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<ShoppingBag className="mt-0.5 h-4 w-4 text-[#8B2C6D]" />
										<div>
											<p className="font-semibold text-[#3E2723]">Current Status</p>
											<p className="capitalize">{orderStatus}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Truck className="mt-0.5 h-4 w-4 text-[#8B2C6D]" />
										<div>
											<p className="font-semibold text-[#3E2723]">Placed On</p>
											<p>{orderDate}</p>
										</div>
									</div>
									<div className="rounded-2xl bg-white p-4 border border-[#E9E0D2]">
										<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A7768] mb-1">Total Amount</p>
										<p className="text-2xl font-semibold text-[#3E2723]">{formatPrice(Number(order.total || 0))}</p>
									</div>
									<div className="rounded-2xl border border-dashed border-[#E0D8C8] bg-white p-4 text-sm text-[#5D4037]">
										<p className="font-semibold text-[#3E2723]">Live updates</p>
										<p className="mt-1">Current progress is {activeStepKey.replace(/_/g, " ")} and will move forward when the admin updates the order.</p>
									</div>
								</div>
							</div>
						</div>
				</div>
			</div>
		</div>
		</div>
	);
};

export default TrackOrderStatusPage;
