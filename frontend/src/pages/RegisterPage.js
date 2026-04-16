import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

const RegisterPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [isVerificationStep, setIsVerificationStep] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [error, setError] = useState("");
	const { register, verifyRegistration, resendRegistrationCode } = useAuth();
	const navigate = useNavigate();

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			toast.error("Password must be at least 6 characters");
			return;
		}

		setIsSubmitting(true);
		try {
			const safeEmail = email.trim().toLowerCase();
			const result = await register(name, safeEmail, phone, password);

			if (result && result.requires_verification === false) {
				toast.success(result.message || "Account created successfully");
				navigate("/");
				return;
			}

			setRegisteredEmail(safeEmail);
			setIsVerificationStep(true);
			toast.success("Verification code sent to your email");
		} catch (err) {
			const errorMessage = err?.response?.data?.detail || err.message;
			const isAlreadyVerified = err?.response?.data?.alreadyVerified;
			const isResend = err?.response?.data?.isResend;
			
			setError(errorMessage);
			
			if (isAlreadyVerified) {
				toast.error(errorMessage);
			} else if (isResend) {
				// Email exists but not verified - show OTP form
				const safeEmail = email.trim().toLowerCase();
				setRegisteredEmail(safeEmail);
				setIsVerificationStep(true);
				setError("");
				toast.success("A new verification code has been sent to your email");
			} else {
				toast.error(errorMessage);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const verifyCode = async (e) => {
		e.preventDefault();
		if (!verificationCode.trim()) {
			toast.error("Enter the verification code");
			return;
		}

		setIsVerifying(true);
		setError("");
		try {
			await verifyRegistration(registeredEmail, verificationCode.trim());
			toast.success("Email verified successfully!");
			navigate("/");
		} catch (err) {
			setError(err?.response?.data?.detail || err.message);
			toast.error(err?.response?.data?.detail || err.message);
		} finally {
			setIsVerifying(false);
		}
	};

	const resendCode = async () => {
		if (!registeredEmail) return;
		setIsResending(true);
		try {
			await resendRegistrationCode(registeredEmail);
			toast.success("Verification code resent");
		} catch (err) {
			toast.error(err?.response?.data?.detail || err.message);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-12">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<Link to="/">
						<h1 className="font-heading text-4xl font-semibold text-[#3E2723] mb-2">Kesar Kosmetics</h1>
					</Link>
					<p className="text-[#5D4037]">Create your account to start shopping</p>
				</div>

				<div className="bg-white p-8 rounded-3xl shadow-lg border border-[#E0D8C8]">
					<h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-6">
						{isVerificationStep ? "Verify Email" : "Register"}
					</h2>
					{error && <p className="text-red-600 mb-4">{error}</p>}
					{!isVerificationStep ? (
						<form onSubmit={submit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-[#3E2723] mb-2">Full Name</label>
								<Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]" />
							</div>
							<div>
								<label className="block text-sm font-medium text-[#3E2723] mb-2">Email</label>
								<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]" />
							</div>
							<div>
								<label className="block text-sm font-medium text-[#3E2723] mb-2">Phone Number</label>
								<Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" required className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]" />
							</div>
							<div>
								<label className="block text-sm font-medium text-[#3E2723] mb-2">Password</label>
								<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]" />
							</div>
							<Button type="submit" disabled={isSubmitting} className="w-full bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-12 text-lg font-medium transition-transform hover:-translate-y-1 disabled:opacity-60">
								{isSubmitting ? "Sending Code..." : "Create Account"}
							</Button>
						</form>
					) : (
						<form onSubmit={verifyCode} className="space-y-4">
							<div className="rounded-2xl border border-[#E0D8C8] bg-[#FAF7F2] p-4 text-sm text-[#5D4037]">
								We sent a verification code to <span className="font-semibold">{registeredEmail}</span>. Enter it below to activate your account.
							</div>
							<div>
								<label className="block text-sm font-medium text-[#3E2723] mb-2">Verification Code</label>
								<Input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Enter 6-digit code" inputMode="numeric" autoComplete="one-time-code" required className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]" />
							</div>
							<Button type="submit" disabled={isVerifying} className="w-full bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-12 text-lg font-medium transition-transform hover:-translate-y-1 disabled:opacity-60">
								{isVerifying ? "Verifying..." : "Verify Email"}
							</Button>
							<button type="button" onClick={resendCode} disabled={isResending} className="w-full text-sm text-[#D97736] font-medium hover:underline disabled:opacity-60">
								{isResending ? "Resending..." : "Resend code"}
							</button>
							<button type="button" onClick={() => setIsVerificationStep(false)} className="w-full text-sm text-[#5D4037] hover:underline">
								Back to registration
							</button>
						</form>
					)}
					<div className="mt-6 text-center">
						<p className="text-sm text-[#5D4037]">Already have an account? <Link to="/login" className="text-[#D97736] font-medium hover:underline">Login here</Link></p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
