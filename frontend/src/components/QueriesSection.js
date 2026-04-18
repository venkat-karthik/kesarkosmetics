import React, { useState } from "react";
import { ChevronDown, Mail, MessageCircleQuestion } from "lucide-react";
import { Button } from "./ui/button";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseClient";
import { toast } from "sonner";

const questions = [
	{
		question: "What makes Nei Native’s A2 Desi Bilona Cow Ghee special?",
		answer:
			"Our A2 Bilona ghee is made using traditional churned butter from desi cow milk, which helps preserve rich taste, aroma, and natural nutrition.",
	},
	{
		question: "Are Nei Native’s products healthy?",
		answer:
			"Yes, our products are crafted with natural ingredients and minimal processing to support everyday wellness and better food choices.",
	},
	{
		question: "How can I contact customer support?",
		answer:
			"You can reach us through the Contact page, email, or the support options listed in our footer. We usually respond quickly.",
	},
	{
		question: "Can I use Nei Native’s ghee for cooking and skincare?",
		answer:
			"Yes, our ghee can be used for traditional cooking and also in simple skincare routines where natural nourishment is preferred.",
	},
];

const QueriesSection = () => {
	const [openIndex, setOpenIndex] = useState(0);
	const [email, setEmail] = useState("");

	const handleSubscribe = async (event) => {
		event.preventDefault();
		if (!email.trim()) return;
		try {
			const existing = await getDocs(query(collection(db, "subscribers"), where("email", "==", email.trim().toLowerCase())));
			if (!existing.empty) {
				toast.success("You're already subscribed!");
				setEmail("");
				return;
			}
			await addDoc(collection(db, "subscribers"), {
				email: email.trim().toLowerCase(),
				subscribedAt: serverTimestamp(),
				source: "homepage",
			});
			toast.success("Subscribed! Welcome to the Kesar family 🌸");
			setEmail("");
		} catch {
			toast.error("Could not subscribe. Please try again.");
		}
	};

	return (
		<section className="py-16 sm:py-20 lg:py-24 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-center font-heading text-3xl sm:text-4xl font-semibold text-[#8B2C6D] mb-10 sm:mb-12">
					Queries
				</h2>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
					<div className="bg-[#E6E1CF] rounded-2xl p-8 sm:p-10 lg:p-12 min-h-[320px] flex flex-col justify-center text-center lg:text-left">
						<div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
							<div className="flex-shrink-0">
								<div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/55 flex items-center justify-center shadow-sm">
									<MessageCircleQuestion className="w-16 h-16 sm:w-20 sm:h-20 text-[#8B2C6D]" />
								</div>
							</div>
							<div className="space-y-4">
								<h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#8B2C6D] leading-tight">
									Still Curious? Let’s Chat
								</h3>
								<p className="text-[#3E2723] text-base sm:text-lg">
									We’re always happy to help you out!
								</p>
								<div className="pt-2">
									<Button className="bg-[#8B2C6D] hover:bg-[#742459] text-white rounded-xl px-8 py-3 text-base shadow-sm">
										Ask Anything
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						{questions.map((item, index) => {
							const isOpen = openIndex === index;
							return (
								<div key={item.question} className="rounded-2xl bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-[#F0E9DD] overflow-hidden">
									<button
										type="button"
										onClick={() => setOpenIndex(isOpen ? -1 : index)}
										className="w-full px-5 sm:px-6 py-5 flex items-center justify-between gap-4 text-left"
									>
										<span className="text-[#111111] font-medium text-base sm:text-lg leading-snug">{item.question}</span>
										<ChevronDown className={`w-5 h-5 text-[#9A9A9A] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
									</button>
									{isOpen && (
										<div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-[#5D4037] leading-relaxed">
											{item.answer}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				<div className="mt-16 sm:mt-20 rounded-3xl overflow-hidden bg-[linear-gradient(90deg,_#8B2C6D_0%,_#9B2A77_50%,_#A4367F_100%)]">
					<div className="px-6 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-14 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.06),_transparent_28%)]">
						<div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8 items-center">
							<div>
								<h3 className="text-white font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight max-w-xl">
									Stay upto date about our Latest Offers
								</h3>
							</div>
							<form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full lg:justify-end">
								<label className="sr-only" htmlFor="newsletter-email">
									Enter your email
								</label>
								<div className="relative flex-1">
									<Mail className="w-5 h-5 text-[#9A9A9A] absolute left-4 top-1/2 -translate-y-1/2" />
									<input
										id="newsletter-email"
										type="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										placeholder="Enter your email"
										className="w-full h-12 sm:h-14 rounded-lg pl-12 pr-4 text-[#3E2723] border-0 outline-none bg-white shadow-sm placeholder:text-[#7D7D7D]"
									/>
								</div>
								<Button type="submit" className="h-12 sm:h-14 min-w-40 rounded-lg bg-white text-[#8B2C6D] hover:bg-[#FFF7FB] font-medium px-8">
									Subscribe
								</Button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default QueriesSection;