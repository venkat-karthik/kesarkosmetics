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
