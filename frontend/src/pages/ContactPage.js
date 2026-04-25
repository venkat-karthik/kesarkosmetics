import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle, Instagram, Facebook, Youtube } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Footer from "../components/Footer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const ContactPage = () => {
	const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await axios.post(`${BACKEND_URL}/api/contact`, {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				subject: formData.subject,
				message: formData.message,
			});
			toast.success("Message sent! We'll get back to you soon.");
			setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
			setSubmitted(true);
			setTimeout(() => setSubmitted(false), 5000);
		} catch {
			const subject = encodeURIComponent(formData.subject || "Contact Form Enquiry");
			const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "N/A"}\n\nMessage:\n${formData.message}`);
			window.location.href = `mailto:kesarkosmetics@gmail.com?subject=${subject}&body=${body}`;
			toast.success("Your email client has been opened.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#FAF7F2]">

			{/* ── Hero ─────────────────────────────────────── */}
			<section className="relative overflow-hidden bg-gradient-to-br from-[#2D0F00] via-[#4A1A00] to-[#3E2723] text-white">
				<div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#F5A800]/10 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-[#E8620A]/10 blur-3xl pointer-events-none" />
				<div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
					<p className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-[#F5A800] bg-[#F5A800]/10 border border-[#F5A800]/25 rounded-full px-5 py-2 mb-6">
						We're Here for You
					</p>
					<h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
						Get in <span className="text-[#F5A800]">Touch</span>
					</h1>
					<p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl mx-auto">
						Questions about an order, a product, or just want to say hello? We'd love to hear from you.
					</p>
				</div>
			</section>

			{/* ── Quick contact cards ───────────────────────── */}
			<section className="py-14 sm:py-20">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
						{[
							{
								icon: Mail,
								label: "Email Us",
								value: "kesarkosmetics@gmail.com",
								sub: "We reply within 24 hours",
								href: "mailto:kesarkosmetics@gmail.com",
							},
							{
								icon: Phone,
								label: "Call Us",
								value: "+91 98415 24064",
								sub: "Mon–Sat, 9 AM – 6 PM IST",
								href: "tel:+919841524064",
							},
							{
								icon: MapPin,
								label: "Head Office",
								value: "Pampore, J&K",
								sub: "Befina Pampore – 192121",
								href: null,
							},
							{
								icon: Clock,
								label: "Business Hours",
								value: "Mon–Fri: 9 AM – 6 PM",
								sub: "Sat: 10 AM – 4 PM · Sun: Online only",
								href: null,
							},
						].map(({ icon: Icon, label, value, sub, href }) => (
							<div key={label} className="bg-white rounded-2xl border border-[#E9E0D2] p-6 shadow-sm hover:shadow-md transition-shadow">
								<div className="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center mb-4">
									<Icon className="w-5 h-5 text-[#D97736]" />
								</div>
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A7768] mb-1">{label}</p>
								{href ? (
									<a href={href} className="font-semibold text-[#3E2723] hover:text-[#D97736] transition-colors text-sm leading-snug block">
										{value}
									</a>
								) : (
									<p className="font-semibold text-[#3E2723] text-sm leading-snug">{value}</p>
								)}
								<p className="mt-1 text-xs text-[#8A7768] leading-snug">{sub}</p>
							</div>
						))}
					</div>

					{/* ── Main grid: form + info ────────────────── */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

						{/* Contact form */}
						<div className="bg-white rounded-3xl border-2 border-[#E9E0D2] p-7 sm:p-10 shadow-sm">
							<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D97736] mb-2">Send a Message</p>
							<h2 className="font-heading text-3xl text-[#3E2723] mb-7">How can we help?</h2>

							{submitted ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<CheckCircle className="w-16 h-16 text-green-500 mb-4" />
									<h3 className="font-heading text-2xl text-[#3E2723] mb-2">Message Sent!</h3>
									<p className="text-[#6B5B52]">Thank you for reaching out. We'll get back to you within 24 hours.</p>
								</div>
							) : (
								<form onSubmit={handleSubmit} className="space-y-5">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
										<div>
											<label className="block text-sm font-semibold text-[#3E2723] mb-1.5">Full Name *</label>
											<input
												type="text" name="name" value={formData.name}
												onChange={handleInputChange} required
												placeholder="Your name"
												className="w-full px-4 py-3 border border-[#E9E0D2] rounded-xl focus:outline-none focus:border-[#D97736] transition-colors text-sm"
											/>
										</div>
										<div>
											<label className="block text-sm font-semibold text-[#3E2723] mb-1.5">Email Address *</label>
											<input
												type="email" name="email" value={formData.email}
												onChange={handleInputChange} required
												placeholder="your@email.com"
												className="w-full px-4 py-3 border border-[#E9E0D2] rounded-xl focus:outline-none focus:border-[#D97736] transition-colors text-sm"
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
										<div>
											<label className="block text-sm font-semibold text-[#3E2723] mb-1.5">Phone Number</label>
											<input
												type="tel" name="phone" value={formData.phone}
												onChange={handleInputChange}
												placeholder="+91 98765 43210"
												className="w-full px-4 py-3 border border-[#E9E0D2] rounded-xl focus:outline-none focus:border-[#D97736] transition-colors text-sm"
											/>
										</div>
										<div>
											<label className="block text-sm font-semibold text-[#3E2723] mb-1.5">Subject *</label>
											<input
												type="text" name="subject" value={formData.subject}
												onChange={handleInputChange} required
												placeholder="What's this about?"
												className="w-full px-4 py-3 border border-[#E9E0D2] rounded-xl focus:outline-none focus:border-[#D97736] transition-colors text-sm"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-semibold text-[#3E2723] mb-1.5">Message *</label>
										<textarea
											name="message" value={formData.message}
											onChange={handleInputChange} required rows={6}
											placeholder="Tell us how we can help you…"
											className="w-full px-4 py-3 border border-[#E9E0D2] rounded-xl focus:outline-none focus:border-[#D97736] transition-colors resize-none text-sm"
										/>
									</div>

									<button
										type="submit" disabled={isSubmitting}
										className="w-full inline-flex items-center justify-center gap-2 bg-[#D97736] hover:bg-[#C96626] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
									>
										<Send className="w-4 h-4" />
										{isSubmitting ? "Sending…" : "Send Message"}
									</button>
								</form>
							)}
						</div>

						{/* Right info column */}
						<div className="space-y-5">

							{/* Offices */}
							<div className="bg-white rounded-2xl border border-[#E9E0D2] p-6 shadow-sm">
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97736] mb-4">Our Offices</p>
								<div className="space-y-5">
									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0 mt-0.5">
											<MapPin className="w-4 h-4 text-[#D97736]" />
										</div>
										<div>
											<p className="font-semibold text-[#3E2723] text-sm">Head Office — Kashmir</p>
											<p className="text-xs text-[#6B5B52] mt-0.5 leading-relaxed">
												Befina Pampore, Near Govt Middle School<br />
												Pampore – 192121, J&K, India
											</p>
										</div>
									</div>
									<div className="border-t border-[#F0E7DA]" />
									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0 mt-0.5">
											<MapPin className="w-4 h-4 text-[#D97736]" />
										</div>
										<div>
											<p className="font-semibold text-[#3E2723] text-sm">Branch Office — Chennai</p>
											<p className="text-xs text-[#6B5B52] mt-0.5 leading-relaxed">
												19, Valliammal Road, Vepery<br />
												Chennai – 600007, Tamil Nadu, India
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Business hours */}
							<div className="bg-white rounded-2xl border border-[#E9E0D2] p-6 shadow-sm">
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97736] mb-4">Business Hours</p>
								<div className="space-y-2 text-sm">
									{[
										{ day: "Monday – Friday", hours: "9:00 AM – 6:00 PM IST" },
										{ day: "Saturday",        hours: "10:00 AM – 4:00 PM IST" },
										{ day: "Sunday",          hours: "Online support only" },
									].map(({ day, hours }) => (
										<div key={day} className="flex items-center justify-between">
											<span className="text-[#6B5B52]">{day}</span>
											<span className="font-medium text-[#3E2723] text-xs">{hours}</span>
										</div>
									))}
								</div>
							</div>

							{/* Quick topics */}
							<div className="bg-white rounded-2xl border border-[#E9E0D2] p-6 shadow-sm">
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97736] mb-4">Common Topics</p>
								<div className="flex flex-wrap gap-2">
									{["Order tracking", "Returns & refunds", "Product enquiry", "Bulk orders", "Wholesale", "Skincare advice", "Gifting", "Careers"].map(t => (
										<span key={t} className="text-xs bg-[#FAF7F2] border border-[#E9E0D2] text-[#5D4037] px-3 py-1.5 rounded-full">{t}</span>
									))}
								</div>
							</div>

							{/* Social */}
							<div className="bg-gradient-to-br from-[#2D0F00] to-[#4A1A00] rounded-2xl p-6 text-white">
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5A800] mb-3">Follow Us</p>
								<p className="text-sm text-white/70 mb-4 leading-relaxed">
									Stay connected for new products, saffron stories, and wellness tips.
								</p>
								<div className="flex items-center gap-3">
									{[
										{ icon: Instagram, href: "https://instagram.com/kesarkosmetics", label: "Instagram" },
										{ icon: Facebook,  href: "https://facebook.com/kesarkosmetics",  label: "Facebook" },
										{ icon: Youtube,   href: "https://youtube.com/@kesarkosmetics",  label: "YouTube" },
									].map(({ icon: Icon, href, label }) => (
										<a
											key={label}
											href={href}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={label}
											className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F5A800] flex items-center justify-center transition-colors"
										>
											<Icon className="w-4 h-4" />
										</a>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── FAQ teaser ────────────────────────────────── */}
			<section className="py-14 bg-white border-t border-[#E9E0D2]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D97736] mb-3">Before You Write</p>
					<h2 className="font-heading text-3xl text-[#3E2723] mb-4">Check our FAQ first</h2>
					<p className="text-[#6B5B52] text-base mb-8 max-w-xl mx-auto leading-relaxed">
						Many common questions about orders, shipping, returns, and products are already answered in our FAQ page.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<a
							href="/faq"
							className="inline-flex items-center gap-2 bg-[#D97736] hover:bg-[#C96626] text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
						>
							<MessageCircle className="w-4 h-4" />
							Visit FAQ Page
						</a>
						<a
							href="mailto:kesarkosmetics@gmail.com"
							className="inline-flex items-center gap-2 border-2 border-[#E9E0D2] hover:border-[#D97736] text-[#5D4037] hover:text-[#D97736] font-semibold px-8 py-3.5 rounded-full transition-all"
						>
							<Mail className="w-4 h-4" />
							Email Directly
						</a>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default ContactPage;
