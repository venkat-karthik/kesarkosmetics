import React from "react";

export function formatApiErrorDetail(detail) {
	if (detail == null) return "Something went wrong. Please try again.";
	if (typeof detail === "string") return detail;
	if (Array.isArray(detail)) {
		return detail
			.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
			.filter(Boolean)
			.join(" ");
	}
	if (detail && typeof detail.msg === "string") return detail.msg;
	return String(detail);
}

export function formatPrice(price) {
	const normalizedPrice = Number(price ?? 0);
	const formattedPrice = new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(normalizedPrice || 0);

	return <span className="font-mono tabular-nums leading-none text-inherit">{formattedPrice}</span>;
}

// Shared tracking step builder — mirrors backend buildTrackingSteps
export function buildTrackingSteps(status) {
	const s = String(status || "pending").toLowerCase();
	let normalized = s;
	if (s === "confirmed" || s === "processing") normalized = "pending";
	if (s === "out_for_delivery") normalized = "in_transit";
	if (s === "cancelled") normalized = "pending";
	const keys = ["pending", "shipped", "in_transit", "delivered"];
	const activeIndex = Math.max(keys.indexOf(normalized), 0);
	return [
		{ key: "pending",    label: "Order Placed", completed: activeIndex >= 0, active: activeIndex === 0 },
		{ key: "shipped",    label: "Shipped",       completed: activeIndex >= 1, active: activeIndex === 1 },
		{ key: "in_transit", label: "In Transit",    completed: activeIndex >= 2, active: activeIndex === 2 },
		{ key: "delivered",  label: "Delivered",     completed: activeIndex >= 3, active: activeIndex === 3 },
	];
}
