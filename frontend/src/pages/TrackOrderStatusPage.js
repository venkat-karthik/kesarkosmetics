import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
	ArrowLeft, BadgeCheck, Box, CreditCard, MapPin,
	Package, ShoppingBag, Truck, User, CircleDashed, ChevronRight,
} from "lucide-react";
import axios from "axios";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseClient";
import { formatPrice, buildTrackingSteps, enrichOrderItemsWithImages } from "../utils/helpers";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const STEP_ICONS = {
	pending:    ShoppingBag,
	shipped:    Box,
	in_transit: Truck,
	delivered:  BadgeCheck,
};

// Status badge colours
function statusBadgeClass(status) {
	const s = String(status || "").toLowerCase();
	if (s === "delivered")                          return "bg-green-100 text-green-700";
	if (s === "shipped" || s === "in_transit")      return "bg-blue-100 text-blue-700";
	if (s === "out_for_delivery")                   return "bg-cyan-100 text-cyan-700";
	if (s === "cancelled" || s === "payment_failed") return "bg-red-100 text-red-700";
	return "bg-yellow-100 text-yellow-700";
}

const TrackOrderStatusPage = () => {
	const { orderId } = useParams();
	const [params] = useSearchParams();
	const contact = params.get("contact") || "";

	const [order, setOrder]   = useState(null);
	const [loading, setLoading] = useState(true);

	// ── Fetch order ──────────────────────────────────────────────────────────
	useEffect(() => {
		let intervalId;

		const fetchOrder = async () => {
			if (!orderId) { setLoading(false); return; }

			try {
				// 1. Try backend (has tracking_steps enrichment)
				const { data } = await axios.get(`${BACKEND_URL}/api/orders/track/${orderId}`, {
					params: { contact: contact || "bypass" },
				});
				if (data) {
					setOrder({
						...data,
						items: await enrichOrderItemsWithImages(data.items || []),
					});
				} else {
					setOrder(null);
				}
			} catch {
				// 2. Fallback: Firestore
				try {
					const snap = await getDocs(collection(db, "orders"));
					const match = snap.docs
						.map(d => ({ _docId: d.id, ...d.data() }))
						.find(o =>
							(o.orderId || "").toLowerCase() === orderId.toLowerCase() ||
							o._docId === orderId
						);

					if (match) {
						const status = match.status || "pending";
						setOrder({
							id: match.orderId || match._docId,
							items: await enrichOrderItemsWithImages(match.items || []),
							shipping_address: match.shippingAddress || {},
							payment_method:   match.paymentMethod  || "cod",
							total:            match.total          || 0,
							status,
							contact_email:    match.userEmail                        || "",
							contact_phone:    match.shippingAddress?.phone           || "",
							created_at:       match.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
							tracking_steps:   buildTrackingSteps(status),
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
		// Poll every 5 s so status updates appear automatically
		intervalId = setInterval(fetchOrder, 5000);
		const onVisible = () => { if (document.visibilityState === "visible") fetchOrder(); };
		document.addEventListener("visibilitychange", onVisible);
		return () => { clearInterval(intervalId); document.removeEventListener("visibilitychange", onVisible); };
	}, [orderId, contact]);

	// ── Derived values ───────────────────────────────────────────────────────
	const trackingSteps  = Array.isArray(order?.tracking_steps) && order.tracking_steps.length > 0
		? order.tracking_steps
		: buildTrackingSteps(order?.status || "pending");
	const orderStatus    = String(order?.status || "pending").replace(/_/g, " ");
	const activeStepKey  = trackingSteps.find(s => s.active)?.key || "pending";
	const customerName   = order?.shipping_address?.name  || "N/A";
	const customerPhone  = order?.contact_phone || order?.shipping_address?.phone || "N/A";
	const paymentMethod  = order?.payment_method ? String(order.payment_method).replace(/_/g, " ") : "cod";
	const orderDate      = order?.created_at ? new Date(order.created_at).toLocaleString() : "N/A";
	const shippingAddress = order?.shipping_address
		? [order.shipping_address.address, order.shipping_address.city,
		   order.shipping_address.state,   order.shipping_address.pincode]
			.filter(Boolean).join(", ")
		: "N/A";
	const items = Array.isArray(order?.items) ? order.items : [];

	// ── Loading / not-found states ───────────────────────────────────────────
	if (loading) {
		return (
			<div className="min-h-screen bg-[#F6F5F2] flex items-center justify-center text-[#5D4037]">
				Loading…
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen bg-[#F6F5F2] flex items-center justify-center px-4">
				<div className="rounded-3xl border border-[#E6DCCB] bg-white p-8 text-center max-w-lg w-full">
					<p className="text-[#5D4037]">Order not found or contact does not match.</p>
					<Link to="/track-order" className="inline-block mt-4 text-[#D97736] font-semibold hover:underline">
						Back to tracking
					</Link>
				</div>
			</div>
		);
	}

	// ── Render ───────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-[#F6F5F2]">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

				{/* Back link — mobile */}
				<div className="mb-4 sm:hidden">
					<Link
						to="/track-order"
						className="inline-flex items-center gap-2 rounded-full border border-[#E6DCCB] bg-white px-4 py-2 text-sm font-semibold text-[#5D4037]"
					>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Link>
				</div>

				{/* ── Main card ─────────────────────────────────────────────── */}
				<div className="rounded-3xl border-2 border-[#E6DCCB] bg-white p-5 sm:p-8 shadow-sm">

					{/* Header */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736]">Live Tracking</p>
							<h1 className="mt-1 font-heading text-3xl sm:text-4xl text-[#111111]">Track Your Order</h1>
							<p className="mt-1 text-sm text-[#6B5B52] break-all">Order ID: {order.id}</p>
						</div>
						<span className={`self-start sm:self-auto rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${statusBadgeClass(order.status)}`}>
							{orderStatus}
						</span>
					</div>

					<div className="flex flex-col lg:flex-row lg:items-start gap-8">

						{/* ── Left column ─────────────────────────────────── */}
						<div className="flex-1 min-w-0">

							{/* Tracking steps */}
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-4">
								{trackingSteps.map((step, index) => {
									const Icon = STEP_ICONS[step.key] || ShoppingBag;
									return (
										<div key={step.key} className="relative text-center">
											{index < trackingSteps.length - 1 && (
												<div className={`hidden sm:block absolute left-[52%] top-8 h-1 w-full ${step.completed ? "bg-[#9CCCED]" : "bg-[#DDEAF2]"}`} />
											)}
											<div className={`mx-auto relative z-10 h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 flex items-center justify-center
												${step.completed ? "bg-[#CFEAFB] border-[#9CCCED] text-[#4E7F9B]"
												: step.active   ? "bg-[#EEF7FD] border-[#9CCCED] text-[#4E7F9B]"
												:                  "bg-white border-[#DDEAF2] text-[#9BB4C2]"}`}
											>
												<Icon className="h-7 w-7 sm:h-8 sm:w-8" />
											</div>
											<p className="mt-3 text-sm sm:text-base font-semibold text-[#111111] leading-tight">{step.label}</p>
										</div>
									);
								})}
							</div>

							{/* Step chips */}
							<div className="mt-5 grid gap-3 sm:grid-cols-4">
								{trackingSteps.map((step) => (
									<div
										key={`chip-${step.key}`}
										className={`rounded-2xl border px-4 py-3 text-sm font-semibold
											${step.active    ? "border-[#9CCCED] bg-[#EEF7FD] text-[#4E7F9B]"
											: step.completed ? "border-[#CFEAFB] bg-[#F4FBFF] text-[#4E7F9B]"
											:                  "border-[#E9E0D2] bg-[#FCFAF7] text-[#8A7768]"}`}
									>
										<div className="flex items-center gap-2">
											{step.completed ? <BadgeCheck className="h-4 w-4" />
											: step.active   ? <CircleDashed className="h-4 w-4" />
											:                  <Package className="h-4 w-4" />}
											<span>{step.label}</span>
										</div>
									</div>
								))}
							</div>

							{/* ── All items in this order ──────────────────── */}
							{items.length > 0 && (
								<div className="mt-8">
									<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8A7768] mb-4">
										<Package className="h-4 w-4" />
										Items in this order ({items.length})
									</div>

									<div className="space-y-3">
										{items.map((item, idx) => {
											const pid = item.product_id || item.product?._id || item.product?.id || null;
											const inner = (
												<div className="flex items-center gap-4">
													<img
														src={item.image || "/logo.png"}
														alt={item.product_name}
														className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shrink-0"
													/>
													<div className="flex-1 min-w-0">
														<p className="font-semibold text-[#3E2723] text-base leading-snug line-clamp-2">
															{item.product_name}
														</p>
														<p className="mt-1 text-sm text-[#6B5B52]">Qty: {item.quantity}</p>
														<p className="mt-0.5 font-semibold text-[#3E2723]">
															{formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
														</p>
													</div>
													{pid && (
														<ChevronRight className="h-4 w-4 text-[#D97736] shrink-0" />
													)}
												</div>
											);

											return (
												<div
													key={`${item.product_id || idx}`}
													className="rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3 sm:p-4 hover:border-[#D97736] transition-colors"
												>
													{pid ? (
														<Link to={`/product/${pid}`} className="block group">
															{inner}
															<p className="mt-2 ml-[calc(5rem+1rem)] sm:ml-[calc(6rem+1rem)] text-xs font-semibold text-[#D97736] group-hover:underline">
																View product →
															</p>
														</Link>
													) : inner}
												</div>
											);
										})}
									</div>
								</div>
							)}

							<p className="mt-6 text-xs text-[#8A7768]">
								This page refreshes automatically when the admin updates the order status.
							</p>
						</div>

						{/* ── Right column — order details ─────────────────── */}
						<div className="w-full lg:w-[340px] shrink-0">
							<div className="rounded-3xl border border-[#E9E0D2] bg-[#FCFAF7] p-5 shadow-sm">
								<p className="text-xs font-bold uppercase tracking-[0.24em] text-[#D97736] mb-4">Order Details</p>

								<div className="space-y-4 text-sm text-[#5D4037]">
									<div className="flex items-start gap-3">
										<User className="mt-0.5 h-4 w-4 text-[#8B2C6D] shrink-0" />
										<div>
											<p className="font-semibold text-[#3E2723]">{customerName}</p>
											<p>{customerPhone}</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MapPin className="mt-0.5 h-4 w-4 text-[#8B2C6D] shrink-0" />
										<div>
											<p className="font-semibold text-[#3E2723]">Shipping Address</p>
											<p className="leading-6">{shippingAddress}</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<CreditCard className="mt-0.5 h-4 w-4 text-[#8B2C6D] shrink-0" />
										<div>
											<p className="font-semibold text-[#3E2723]">Payment</p>
											<p className="capitalize">{paymentMethod}</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<ShoppingBag className="mt-0.5 h-4 w-4 text-[#8B2C6D] shrink-0" />
										<div>
											<p className="font-semibold text-[#3E2723]">Status</p>
											<p className="capitalize">{orderStatus}</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Truck className="mt-0.5 h-4 w-4 text-[#8B2C6D] shrink-0" />
										<div>
											<p className="font-semibold text-[#3E2723]">Placed On</p>
											<p>{orderDate}</p>
										</div>
									</div>

									<div className="rounded-2xl bg-white p-4 border border-[#E9E0D2]">
										<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A7768] mb-1">
											Total Amount
										</p>
										<p className="text-2xl font-semibold text-[#3E2723]">
											{formatPrice(Number(order.total || 0))}
										</p>
									</div>

									<div className="rounded-2xl border border-dashed border-[#E0D8C8] bg-white p-4 text-sm text-[#5D4037]">
										<p className="font-semibold text-[#3E2723]">Live updates</p>
										<p className="mt-1">
											Current progress is{" "}
											<span className="font-medium capitalize">{activeStepKey.replace(/_/g, " ")}</span>
											{" "}and will move forward when the admin updates the order.
										</p>
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
