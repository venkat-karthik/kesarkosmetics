import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Footer from "../components/Footer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		message: ""
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

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
		} catch (err) {
			// Fallback to mailto if backend fails
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
			{/* Hero Section */}
			<section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-[#3E2723] to-[#5D4037] text-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
					<p className="text-lg sm:text-xl text-gray-200 leading-relaxed">
						We'd love to hear from you. Reach out with any questions or feedback.
					</p>
				</div>
			</section>

			{/* Contact Section */}
			<section className="py-16 sm:py-20 md:py-24">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
						{/* Contact Info Cards */}
						<div className="bg-white rounded-2xl p-8 border border-[#E0D8C8] shadow-lg hover:shadow-xl transition-shadow">
							<Mail className="w-8 h-8 text-[#D97736] mb-4" />
							<h3 className="font-bold text-[#3E2723] mb-2">Email</h3>
							<p className="text-[#5D4037]">kesarkosmetics@gmail.com</p>
						</div>

						<div className="bg-white rounded-2xl p-8 border border-[#E0D8C8] shadow-lg hover:shadow-xl transition-shadow">
							<Phone className="w-8 h-8 text-[#D97736] mb-4" />
							<h3 className="font-bold text-[#3E2723] mb-2">Phone</h3>
							<p className="text-[#5D4037]">+91 98415 24064</p>
						</div>

						<div className="bg-white rounded-2xl p-8 border border-[#E0D8C8] shadow-lg hover:shadow-xl transition-shadow">
							<MapPin className="w-8 h-8 text-[#D97736] mb-4" />
							<h3 className="font-bold text-[#3E2723] mb-2">Head Office</h3>
							<p className="text-[#5D4037]">Befina Pampore, Near Govt Middle School</p>
							<p className="text-[#5D4037]">Pampore – 192121</p>
						</div>
					</div>

					{/* Branch Office */}
					<div className="bg-white rounded-2xl p-6 border border-[#E0D8C8] shadow-sm mb-8 flex items-start gap-4">
						<MapPin className="w-6 h-6 text-[#D97736] mt-1 shrink-0" />
						<div>
							<h3 className="font-bold text-[#3E2723] mb-1">Branch Office</h3>
							<p className="text-[#5D4037] text-sm">19, Valliammal Road, Vepery</p>
							<p className="text-[#5D4037] text-sm">Chennai – 600007</p>
						</div>
					</div>

					{/* Operating Hours */}
					<div className="bg-[#FAF7F2] rounded-2xl p-8 mb-12 border border-[#E0D8C8] text-center">
						<Clock className="w-8 h-8 text-[#D97736] mx-auto mb-4" />
						<h3 className="font-bold text-[#3E2723] mb-3 text-lg">Business Hours</h3>
						<p className="text-[#5D4037]">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
						<p className="text-[#5D4037]">Saturday: 10:00 AM - 4:00 PM IST</p>
						<p className="text-[#5D4037]">Sunday: Closed (Online Support Available)</p>
					</div>

					{/* Contact Form */}
					<div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 sm:p-10 border border-[#E0D8C8] shadow-lg">
						<h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3E2723] mb-8 text-center">Send us a Message</h2>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-bold text-[#3E2723] mb-2">Name</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 border border-[#E0D8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97736] transition-all"
										placeholder="Your name"
									/>
								</div>
								<div>
									<label className="block text-sm font-bold text-[#3E2723] mb-2">Email</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										required
										className="w-full px-4 py-3 border border-[#E0D8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97736] transition-all"
										placeholder="your@email.com"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-bold text-[#3E2723] mb-2">Phone</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleInputChange}
									className="w-full px-4 py-3 border border-[#E0D8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97736] transition-all"
									placeholder="+91 98765 43210"
								/>
							</div>

							<div>
								<label className="block text-sm font-bold text-[#3E2723] mb-2">Subject</label>
								<input
									type="text"
									name="subject"
									value={formData.subject}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-3 border border-[#E0D8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97736] transition-all"
									placeholder="Message subject"
								/>
							</div>

							<div>
								<label className="block text-sm font-bold text-[#3E2723] mb-2">Message</label>
								<textarea
									name="message"
									value={formData.message}
									onChange={handleInputChange}
									required
									rows="6"
									className="w-full px-4 py-3 border border-[#E0D8C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97736] transition-all resize-none"
									placeholder="Your message here..."
								/>
							</div>

							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full bg-[#D97736] hover:bg-[#C96626] text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75"
							>
								<Send className="w-5 h-5" />
								{isSubmitting ? "Sending..." : "Send Message"}
							</button>
						</form>
					</div>
				</div>
			</section>

			{/* Map Placeholder */}
			<section className="py-0 bg-white border-t border-[#E0D8C8]">
				<div className="w-full bg-[#FAF7F2] py-10 px-4">
					<div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
						<div className="bg-white rounded-2xl p-6 border border-[#E0D8C8] shadow-sm">
							<h4 className="font-bold text-[#3E2723] mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D97736]" /> Head Office</h4>
							<p className="text-sm text-[#5D4037]">Befina Pampore, Near Govt Middle School</p>
							<p className="text-sm text-[#5D4037]">Pampore – 192121, J&K, India</p>
						</div>
						<div className="bg-white rounded-2xl p-6 border border-[#E0D8C8] shadow-sm">
							<h4 className="font-bold text-[#3E2723] mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D97736]" /> Branch Office</h4>
							<p className="text-sm text-[#5D4037]">19, Valliammal Road, Vepery</p>
							<p className="text-sm text-[#5D4037]">Chennai – 600007, Tamil Nadu, India</p>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
};

export default ContactPage;
