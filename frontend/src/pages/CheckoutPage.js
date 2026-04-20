import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { formatPrice } from "../utils/helpers";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Truck, Lock, CreditCard, Wallet, Banknote, ReceiptText, Minus, Plus, Trash2, ChevronDown, Home, Building2, Package } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseClient";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const COUNTRY_OPTIONS = [
	"India",
	"United States",
	"United Kingdom",
	"Canada",
	"Australia",
	"United Arab Emirates",
	"Singapore",
	"Malaysia",
	"Saudi Arabia",
	"Qatar",
];

const INDIA_STATES = [
	"Andhra Pradesh",
	"Arunachal Pradesh",
	"Assam",
	"Bihar",
	"Chhattisgarh",
	"Goa",
	"Gujarat",
	"Haryana",
	"Himachal Pradesh",
	"Jharkhand",
	"Karnataka",
	"Kerala",
	"Madhya Pradesh",
	"Maharashtra",
	"Manipur",
	"Meghalaya",
	"Mizoram",
	"Nagaland",
	"Odisha",
	"Punjab",
	"Rajasthan",
	"Sikkim",
	"Tamil Nadu",
	"Telangana",
	"Tripura",
	"Uttar Pradesh",
	"Uttarakhand",
	"West Bengal",
	"Delhi",
	"Jammu and Kashmir",
	"Ladakh",
];

const CheckoutPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
	const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", country: "India", state: "", pincode: "", addressType: "" });
	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [loading, setLoading] = useState(false);
	const [couponCode, setCouponCode] = useState("");
	const [discountApplied, setDiscountApplied] = useState(0);
	const [orderStep, setOrderStep] = useState("details");

	useEffect(() => {
		if (!user || !user._id) { navigate("/login"); return; }
		if (cart.items.length === 0) { toast.error("Your cart is empty"); navigate("/cart"); return; }
		setForm((prev) => ({ ...prev, name: user.name || "", phone: user.phone || "", country: prev.country || "India", state: prev.country === "India" ? prev.state : "", addressType: prev.addressType || "" }));
	}, [user, navigate, cart.items.length]);

	const handleUpdateQuantity = async (productId, quantity) => {
		await updateQuantity(productId, quantity);
	};

	const handleRemoveItem = async (productId) => {
		await removeFromCart(productId);
		toast.success("Item removed");
	};

	const handleApplyCoupon = () => {
		const validCoupons = { "KESAR10": 0.10, "SAVE20": 0.20, "SUMMER5": 0.05 };
		if (!couponCode.trim()) {
			toast.error("Enter a coupon code");
			return;
		}
		if (validCoupons[couponCode.toUpperCase()]) {
			const discount = cart.total * validCoupons[couponCode.toUpperCase()];
			setDiscountApplied(discount);
			toast.success(`${(validCoupons[couponCode.toUpperCase()] * 100).toFixed(0)}% discount applied!`);
		} else {
			toast.error("Invalid coupon code");
			setDiscountApplied(0);
		}
		setCouponCode("");
	};

	const isShippingFormValid = () => {
		return [form.name, form.phone, form.address, form.city, form.country, form.state, form.pincode, form.addressType]
			.every((value) => String(value || "").trim().length > 0);
	};

	const goToReviewStep = () => {
		if (!isShippingFormValid()) {
			toast.error("Please fill all shipping details");
			return;
		}
		setOrderStep("review");
	};

	const goToPaymentStep = () => {
		if (!isShippingFormValid()) {
			toast.error("Please complete shipping details first");
			setOrderStep("details");
			return;
		}
		setOrderStep("payment");
	};

	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const shippingCost = (cart.total - discountApplied) >= 2000 ? 0 : 100;
		const TAX = cart.total * 0.12;
		const grandTotal = cart.total - discountApplied + shippingCost + TAX;
		const payload = {
			items: cart.items.map((i) => ({
				product_id: i.product.id,
				product_name: i.product.name,
				quantity: i.quantity,
				price: i.product.price,
				variant: i.variant || null,
			})),
			shipping_address: form,
			payment_method: paymentMethod,
			total: grandTotal,
			discount: discountApplied,
			user_id: user._id,
			user_email: user.email,
			user_name: user.name,
			user_phone: user.phone || form.phone,
		};

		// Save order to Firestore for persistent tracking
		const saveOrderToFirestore = async (orderId, status = "confirmed") => {
			try {
				await addDoc(collection(db, "orders"), {
					orderId,
					userId: user._id,
					userEmail: user.email,
					userName: user.name,
					items: payload.items,
					shippingAddress: form,
					paymentMethod,
					subtotal: cart.total,
					discount: discountApplied,
					shipping: shippingCost,
					tax: TAX,
					total: grandTotal,
					status,
					createdAt: serverTimestamp(),
				});
			} catch (err) {
				console.error("Failed to save order to Firestore:", err);
			}
		};

		// Razorpay checkout for online/upi/bank methods
		const openRazorpay = async () => {
			const { data } = await axios.post(`${BACKEND_URL}/api/payments/razorpay/create-order`, payload, { withCredentials: true });

			// Demo mode — no real Razorpay keys, simulate success
			if (data?.demo) {
				toast.success("Demo payment successful!");
				await saveOrderToFirestore(data.order.id, "paid");
				await clearCart();
				navigate(`/order-success?orderId=${data.order.id}`);
				return;
			}

			const checkoutKey = data?.razorpay?.key_id;
			if (!checkoutKey || !window.Razorpay) {
				throw new Error("Razorpay checkout is not available");
			}

			// Map payment method to Razorpay method hint
			const methodMap = { online: "card", upi: "upi", bank: "netbanking" };

			await new Promise((resolve, reject) => {
				const options = {
					key: checkoutKey,
					amount: data.razorpay.amount,
					currency: data.razorpay.currency,
					name: "Kesar Kosmetics",
					description: "Order payment",
					order_id: data.razorpay.order_id,
					prefill: {
						name: form.name,
						email: user?.email || "",
						contact: form.phone,
					},
					notes: { app_order_id: data.order.id },
					theme: { color: "#D97736" },
					handler: async (response) => {
						try {
							const verify = await axios.post(
								`${BACKEND_URL}/api/payments/razorpay/verify`,
								{
									razorpay_order_id: response.razorpay_order_id,
									razorpay_payment_id: response.razorpay_payment_id,
									razorpay_signature: response.razorpay_signature,
									user_id: user._id,
									user_email: user.email,
								},
								{ withCredentials: true }
							);
							toast.success("Payment verified successfully!");
							const finalOrderId = verify.data.id || data.order.id;
							await saveOrderToFirestore(finalOrderId, "paid");
							await clearCart();
							navigate(`/order-success?orderId=${finalOrderId}`);
							resolve();
						} catch (verifyError) {
							toast.error("Payment verification failed");
							reject(verifyError);
						}
					},
					modal: {
						ondismiss: () => {
							toast.error("Payment cancelled");
							reject(new Error("Payment cancelled"));
						},
					},
				};

				const razorpayInstance = new window.Razorpay(options);
				razorpayInstance.on("payment.failed", (response) => {
					toast.error(response?.error?.description || "Payment failed");
					reject(new Error(response?.error?.description || "Payment failed"));
				});
				razorpayInstance.open();
			});
		};

		try {
			if (paymentMethod === "cod") {
				// COD: create order on backend, save to Firestore
				const { data } = await axios.post(`${BACKEND_URL}/api/orders`, payload, { withCredentials: true });
				await saveOrderToFirestore(data.id, "confirmed");
				await clearCart();
				toast.success("Order placed successfully!");
				navigate(`/order-success?orderId=${data.id}`);
			} else {
				// All other methods (online/upi/bank) go through Razorpay
				await openRazorpay();
			}
		} catch (err) {
			console.error("Order error:", err?.response?.data || err?.message || err);
			toast.error(err?.response?.data?.detail || "Could not place order.");
		} finally {
			setLoading(false);
		}
	};

	const TAX_RATE = 0.12; // 12% GST
	const shippingCost = (cart.total - discountApplied) >= 2000 ? 0 : 100;
	const subtotal = cart.total - discountApplied;
	const tax = subtotal * TAX_RATE;
	const grandTotal = subtotal + shippingCost + tax;
	const isIndia = form.country === "India";
	const addressTypes = [
		{ value: "home", label: "Home", icon: Home },
		{ value: "office", label: "Office", icon: Building2 },
		{ value: "others", label: "Others", icon: Package },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#F5EEE6] py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Breadcrumb Steps */}
				<div className="flex justify-between items-center mb-12">
					{["Shipping", "Review", "Payment"].map((step, idx) => (
						<div key={step} className="flex items-center gap-4">
							<div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
								idx <= ["details", "review", "payment"].indexOf(orderStep) 
									? "bg-[#D97736]" 
									: "bg-[#D0C4B4]"
							}`}>
								{idx + 1}
							</div>
							<span className={`font-medium hidden sm:inline ${
								idx <= ["details", "review", "payment"].indexOf(orderStep) 
									? "text-[#3E2723]" 
									: "text-[#999]"
							}`}>
								{step}
							</span>
							{idx < 2 && <div className={`w-12 h-1 hidden md:block ${
								idx < ["details", "review", "payment"].indexOf(orderStep) 
									? "bg-[#D97736]" 
									: "bg-[#D0C4B4]"
							}`}></div>}
						</div>
					))}
				</div>

				<div className="flex flex-col gap-8">
					<div className="w-full">
						{/* Shipping Details */}
						{orderStep === "details" && (
							<form onSubmit={(e) => { e.preventDefault(); goToReviewStep(); }} className="bg-white p-8 rounded-3xl border-2 border-[#E0D8C8] shadow-lg">
								<h2 className="font-heading text-3xl font-bold text-[#3E2723] mb-8 flex items-center gap-3">
									<Truck className="w-8 h-8 text-[#D97736]" />
									Shipping Address
								</h2>

								<div className="grid sm:grid-cols-2 gap-6 mb-6">
									<Input type="text" placeholder="Full Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl border-2 border-[#E0D8C8] h-12 text-base" />
									<Input type="tel" placeholder="Phone Number" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="rounded-xl border-2 border-[#E0D8C8] h-12 text-base" />
								</div>

								<div className="mb-6">
									<Input type="text" placeholder="Street Address" name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className="rounded-xl border-2 border-[#E0D8C8] h-12 text-base" />
								</div>

								<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
									<Input type="text" placeholder="City" name="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="rounded-xl border-2 border-[#E0D8C8] h-12 text-base" />
									<div className="relative">
										<select
											name="country"
											value={form.country}
											onChange={(e) => setForm({ ...form, country: e.target.value, state: e.target.value === "India" ? "" : form.state })}
											className="w-full appearance-none rounded-xl border-2 border-[#E0D8C8] h-12 text-base bg-white px-3 pr-10 outline-none focus:border-[#D97736]"
											required
										>
											<option value="" disabled>Select country</option>
											{COUNTRY_OPTIONS.map((country) => (
												<option key={country} value={country}>{country}</option>
											))}
										</select>
										<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7768]" />
									</div>
									{isIndia ? (
										<div className="relative">
											<select
												name="state"
												value={form.state}
												onChange={(e) => setForm({ ...form, state: e.target.value })}
												className="w-full appearance-none rounded-xl border-2 border-[#E0D8C8] h-12 text-base bg-white px-3 pr-10 outline-none focus:border-[#D97736]"
												required
											>
												<option value="" disabled>Select state</option>
												{INDIA_STATES.map((stateName) => (
													<option key={stateName} value={stateName}>{stateName}</option>
												))}
											</select>
											<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7768]" />
										</div>
									) : (
										<Input type="text" placeholder="State / Region" name="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required className="rounded-xl border-2 border-[#E0D8C8] h-12 text-base" />
									)}
									<Input type="text" placeholder="Pincode" name="pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required className="rounded-xl border-2 border-[#E0D8C8] h-12 text-base" />
								</div>

								<div className="mb-8">
									<p className="mb-3 text-sm font-semibold text-[#3E2723]">Select address type</p>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										{addressTypes.map(({ value, label, icon: Icon }) => {
											const isSelected = form.addressType === value;
											return (
												<button
													type="button"
													key={value}
													onClick={() => setForm({ ...form, addressType: value })}
													className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all ${
														isSelected
															? "border-[#D97736] bg-[#FFF4E8] shadow-sm"
															: "border-[#E0D8C8] bg-white hover:border-[#D97736]"
													}`}
													aria-pressed={isSelected}
												>
													<span className={`flex h-10 w-10 items-center justify-center rounded-full ${isSelected ? "bg-[#D97736] text-white" : "bg-[#F5EEE6] text-[#3E2723]"}`}>
														<Icon className="h-5 w-5" />
													</span>
													<div>
														<p className="font-semibold text-[#1E1E1D]">{label}</p>
														<p className="text-xs text-[#6B5B52]">{value === "home" ? "Residential address" : value === "office" ? "Work location" : "Any other address"}</p>
													</div>
												</button>
											);
										})}
									</div>
									{!form.addressType && (
										<p className="mt-2 text-xs font-medium text-[#B2443E]">Please select one address type to continue.</p>
									)}
								</div>

								<div className="flex flex-col sm:flex-row gap-4">
									<Button
										type="button"
										onClick={() => navigate("/cart")}
										className="w-full sm:w-1/2 bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-14 text-lg font-bold transition-all hover:shadow-xl hover:-translate-y-1"
									>
										← Back
									</Button>
									<Button type="submit" className="w-full sm:w-1/2 bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-14 text-lg font-bold transition-all hover:shadow-xl hover:-translate-y-1">
										Continue to Review →
									</Button>
								</div>
							</form>
						)}

						{/* Order Review */}
						{orderStep === "review" && (
							<div className="space-y-6">
								{/* Shipping Review */}
								<div className="bg-white p-8 rounded-3xl border-2 border-[#E0D8C8] shadow-lg">
									<div className="flex justify-between items-center mb-6">
										<h3 className="font-heading text-2xl font-bold text-[#3E2723]">Shipping Address</h3>
										<button onClick={() => setOrderStep("details")} className="text-[#D97736] hover:text-[#C96626] font-medium transition">
											Edit
										</button>
									</div>
									<div className="grid sm:grid-cols-2 gap-4 text-[#5D4037]">
										<p><span className="font-medium">Name:</span> {form.name}</p>
										<p><span className="font-medium">Phone:</span> {form.phone}</p>
										<p><span className="font-medium">Address:</span> {form.address}</p>
										<p><span className="font-medium">City:</span> {form.city}</p>
										<p><span className="font-medium">Country:</span> {form.country}</p>
										<p><span className="font-medium">State:</span> {form.state}</p>
										<p><span className="font-medium">Address Type:</span> {form.addressType}</p>
										<p><span className="font-medium">Pincode:</span> {form.pincode}</p>
									</div>
								</div>


							</div>
						)}

						{/* Payment Section */}
						{orderStep === "payment" && (
							<form onSubmit={submit} className="bg-white p-8 rounded-3xl border-2 border-[#E0D8C8] shadow-lg">
								<h2 className="font-heading text-3xl font-bold text-[#3E2723] mb-8 flex items-center gap-3">
									<CreditCard className="w-8 h-8 text-[#D97736]" />
									Choose Payment Method
								</h2>

								<div className="grid sm:grid-cols-2 gap-4 mb-8">
									{[
										{ id: "cod", name: "Cash on Delivery", desc: "Pay at doorstep", icon: Banknote, color: "from-orange-50 to-amber-50" },
										{ id: "online", name: "Debit/Credit Card", desc: "Powered by Razorpay", icon: CreditCard, color: "from-blue-50 to-cyan-50" },
										{ id: "upi", name: "UPI / Google Pay / PhonePe", desc: "Powered by Razorpay", icon: Wallet, color: "from-green-50 to-emerald-50" },
										{ id: "bank", name: "Net Banking", desc: "Powered by Razorpay", icon: Banknote, color: "from-purple-50 to-pink-50" },
									].map((method) => {
										const Icon = method.icon;
										return (
											<label key={method.id} className={`relative cursor-pointer transition-all ${paymentMethod === method.id ? "ring-2 ring-[#D97736] shadow-lg" : ""}`}>
												<input type="radio" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="sr-only" />
												<div className={`p-6 rounded-2xl border-2 transition-all ${
													paymentMethod === method.id 
														? "border-[#D97736] bg-gradient-to-br " + method.color
														: "border-[#E0D8C8] hover:border-[#D97736]"
												}`}>
													<Icon className={`w-8 h-8 mb-3 ${paymentMethod === method.id ? "text-[#D97736]" : "text-[#999]"}`} />
													<p className="font-bold text-[#3E2723] text-sm">{method.name}</p>
													<p className="text-xs text-[#5D4037] mt-1">{method.desc}</p>
												</div>
											</label>
										);
									})}
								</div>

								{paymentMethod === "online" && (
									<div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl mb-8">
										<p className="text-blue-900 text-sm"><strong>Demo Mode:</strong> This is a demonstration. No actual payment will be processed.</p>
									</div>
								)}

								<div className="flex flex-col gap-3 mb-8">
									<Button type="submit" disabled={loading} className="w-full bg-[#D97736] hover:bg-[#C96626] disabled:opacity-50 text-white rounded-full h-12 py-3 text-base font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
										{loading ? "Processing..." : "Buy Now"}
									</Button>
									<Button onClick={() => setOrderStep("review")} type="button" className="w-full bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-12 py-3 text-base font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
										← Back to Review
									</Button>
								</div>

								<div className="flex items-center justify-center gap-3 text-sm text-[#5D4037]">
									<Lock className="w-4 h-4 text-[#D97736]" />
									<span>Your payment information is 100% secure</span>
								</div>
							</form>
						)}
					</div>

					{/* Price Summary */}
					{orderStep !== "payment" && (
					<div className="w-full">
						<div className="bg-white p-8 rounded-3xl border-2 border-[#E0D8C8] shadow-lg">
							<h2 className="font-heading text-2xl font-bold text-[#3E2723] mb-8">Price Summary</h2>
							<p className="text-sm font-medium text-[#5D4037] -mt-5 mb-6">Order Item</p>
							
							<div className="space-y-4 mb-6 pb-6 border-b-2 border-[#E0D8C8]">
								{cart.items.map((item) => (
									<div key={item.product.id} className="rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3 sm:p-4">
										<div className="grid grid-cols-[88px_1fr] gap-3 sm:grid-cols-[100px_1fr] lg:grid-cols-[100px_1fr_180px_140px] sm:items-center">
											<img src={item.product.images[0]} alt={item.product.name} className="w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] object-cover rounded-xl" />
											<div className="min-w-0">
												<p className="font-heading text-xl sm:text-2xl font-bold leading-[1.08] text-[#1E1E1E] line-clamp-2">{item.product.name}</p>
												<p className="text-sm sm:text-base text-[#3E2723] mt-1">{formatPrice(item.product.price)}</p>
												<p className="text-sm sm:text-base text-[#5D4037] mt-1">Sizes: {item.variant || "Standard"}</p>
											</div>

											<div className="hidden lg:flex items-center justify-center gap-3">
												<div className="flex items-center gap-3 rounded-xl border border-[#7A7A7A] px-2.5 py-1.5">
													<button onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)} className="p-1 text-[#1E1E1E]" aria-label="Decrease quantity">
														<Minus className="h-4 w-4" />
													</button>
													<span className="w-6 text-center text-xl text-[#1E1E1E]">{item.quantity}</span>
													<button onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)} className="p-1 text-[#1E1E1E]" aria-label="Increase quantity">
														<Plus className="h-4 w-4" />
													</button>
												</div>
												<button onClick={() => handleRemoveItem(item.product.id)} className="p-2 text-[#4B4B4B] hover:text-[#B2443E]" aria-label="Remove item">
													<Trash2 className="h-4 w-4" />
												</button>
											</div>

											<div className="hidden lg:block text-right">
												<p className="text-3xl font-medium text-[#111111]">{formatPrice(item.quantity * item.product.price)}</p>
												<p className="text-sm text-[#5D4037] mt-1">{formatPrice(item.product.price)} / item</p>
											</div>
										</div>

										<div className="lg:hidden mt-3 space-y-2 border-t border-[#E8DECF] pt-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3 rounded-xl border border-[#7A7A7A] px-2.5 py-1.5">
													<button onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)} className="p-1 text-[#1E1E1E]" aria-label="Decrease quantity">
														<Minus className="h-4 w-4" />
													</button>
													<span className="w-6 text-center text-lg text-[#1E1E1E]">{item.quantity}</span>
													<button onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)} className="p-1 text-[#1E1E1E]" aria-label="Increase quantity">
														<Plus className="h-4 w-4" />
													</button>
												</div>
												<button onClick={() => handleRemoveItem(item.product.id)} className="p-2 text-[#4B4B4B] hover:text-[#B2443E]" aria-label="Remove item">
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
											<div className="flex items-center justify-between">
												<p className="text-sm text-[#5D4037]">{formatPrice(item.product.price)} / item</p>
												<p className="text-xl font-semibold text-[#111111]">{formatPrice(item.quantity * item.product.price)}</p>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Coupon Input */}
							<div className="mb-6 pb-6 border-b-2 border-[#E0D8C8]">
								<div className="flex gap-2">
									<Input 
										type="text" 
										placeholder="Promo code" 
										value={couponCode} 
										onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
										className="rounded-lg border-2 border-[#E0D8C8] h-10 text-sm"
									/>
									<Button 
										type="button" 
										onClick={handleApplyCoupon}
										className="bg-[#D97736] hover:bg-[#C96626] text-white px-4 rounded-lg text-sm font-medium transition"
									>
										Apply
									</Button>
								</div>
								<p className="text-xs text-[#5D4037] mt-2">Try: KESAR10, SAVE20, SUMMER5</p>
							</div>

							{/* Price Breakdown */}
							<div className="space-y-4 text-[#5D4037]">
								<div className="flex items-center justify-between text-base">
									<span>Subtotal</span>
									<span className="font-medium">{formatPrice(cart.total)}</span>
								</div>
								{discountApplied > 0 && (
									<div className="flex items-center justify-between text-base text-green-600">
										<span>Discount</span>
										<span className="font-medium">-{formatPrice(discountApplied)}</span>
									</div>
								)}
								<div className="flex items-center justify-between text-base">
									<span>Subtotal After Discount</span>
									<span className="font-medium">{formatPrice(subtotal)}</span>
								</div>
								<div className="flex items-center justify-between text-base">
									<span>Tax (12% GST)</span>
									<span className="font-medium">{formatPrice(tax)}</span>
								</div>
								<div className="flex items-center justify-between text-base">
									<span>Shipping</span>
									<span className="font-medium">{shippingCost === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shippingCost)}</span>
								</div>
							</div>

							{shippingCost === 0 && (
								<div className="bg-green-50 border border-green-200 p-3 rounded-lg mt-4 text-xs text-green-700 font-medium">
									✓ Free shipping on orders above <span className="font-heading tabular-nums">₹2000</span>
								</div>
							)}

							<div className="mt-6 pt-6 border-t-2 border-[#D97736] flex items-center justify-between">
								<span className="font-heading text-xl font-bold text-[#3E2723]">Total</span>
								<span className="font-heading text-3xl font-bold text-[#D97736]">{formatPrice(grandTotal)}</span>
							</div>

								<Button type="button" onClick={goToPaymentStep} className="w-full mt-6 bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-12 py-3 text-base font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
									Buy Now
								</Button>
								<Button type="button" onClick={() => navigate("/products")} className="w-full mt-3 bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-12 py-3 text-base font-bold transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
									Continue Shopping
								</Button>
						</div>
					</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CheckoutPage;
