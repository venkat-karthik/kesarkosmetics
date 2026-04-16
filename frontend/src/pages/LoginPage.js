import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { formatApiErrorDetail } from "../utils/helpers";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isForgotMode, setIsForgotMode] = useState(false);
	const [forgotStep, setForgotStep] = useState("email");
	const [forgotEmail, setForgotEmail] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSendingCode, setIsSendingCode] = useState(false);
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const redirectPath = searchParams.get("redirect") || "/";

	const submit = async (e) => {
		e.preventDefault();
		setError("");
		
		// Check for admin credentials
		const ADMIN_EMAIL = "gsrinadh55@gmail.com";
		const ADMIN_PASSWORD = "123456";
		
		if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
			// Admin login
			localStorage.setItem("adminToken", "admin_" + Date.now());
			localStorage.setItem("adminEmail", email);
			toast.success("Admin login successful!");
			navigate("/admin/dashboard", { replace: true });
			return;
		}
		
		try {
			await login(email, password);
			toast.success("Login successful!");
			navigate(redirectPath, { replace: true });
		} catch (err) {
			setError(formatApiErrorDetail(err?.response?.data?.detail || err.message));
			toast.error(formatApiErrorDetail(err?.response?.data?.detail || err.message));
		}
	};

	const handleSendCode = async (e) => {
		e.preventDefault();
		if (!forgotEmail.trim()) {
			toast.error("Please enter your registered email");
			return;
		}

		setIsSendingCode(true);
		try {
			await axios.post(`${BACKEND_URL}/api/auth/forgot-password/send-code`, {
				email: forgotEmail.trim().toLowerCase(),
			});
			toast.success("Verification code sent to your email");
			setForgotStep("reset");
		} catch (err) {
			toast.error(formatApiErrorDetail(err?.response?.data?.detail || err.message));
		} finally {
			setIsSendingCode(false);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		if (!verificationCode.trim() || !newPassword || !confirmPassword) {
			toast.error("Please fill all fields");
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("New password and confirm password do not match");
			return;
		}

		setIsResettingPassword(true);
		try {
			await axios.post(`${BACKEND_URL}/api/auth/forgot-password/reset`, {
				email: forgotEmail.trim().toLowerCase(),
				code: verificationCode.trim(),
				new_password: newPassword,
				confirm_password: confirmPassword,
			});
			toast.success("Password reset successful. Please login.");
			setEmail(forgotEmail.trim().toLowerCase());
			setIsForgotMode(false);
			setForgotStep("email");
			setVerificationCode("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			toast.error(formatApiErrorDetail(err?.response?.data?.detail || err.message));
		} finally {
			setIsResettingPassword(false);
		}
	};

	const switchToLogin = () => {
		setIsForgotMode(false);
		setForgotStep("email");
		setVerificationCode("");
		setNewPassword("");
		setConfirmPassword("");
	};

	const switchToForgotPassword = () => {
		setError("");
		setIsForgotMode(true);
		setForgotStep("email");
		setForgotEmail(email || "");
	};

	return (
		<div className="min-h-screen bg-[#FAF7F2] flex items-start sm:items-center justify-center px-4 py-6 sm:py-10 overflow-y-auto">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<Link to="/">
						<h1 className="font-heading text-4xl font-semibold text-[#3E2723] mb-2">Kesar Kosmetics</h1>
					</Link>
					<p className="text-[#5D4037]">Welcome back! Please login to your account.</p>
				</div>

				<div className="bg-white p-8 rounded-3xl shadow-lg border border-[#E0D8C8]">
					{!isForgotMode ? (
						<>
							<div className="flex items-center gap-3 mb-6">
								<button
									type="button"
									onClick={() => navigate("/")}
									className="text-[#D97736] hover:text-[#C96626] transition-colors"
									title="Go back"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<h2 className="font-heading text-2xl font-semibold text-[#3E2723]">Login</h2>
							</div>
							{error && <p className="text-red-600 mb-4">{error}</p>}
							<form onSubmit={submit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-[#3E2723] mb-2">Email</label>
									<Input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Enter your email"
										autoComplete="username"
										autoCapitalize="none"
										autoCorrect="off"
										spellCheck={false}
										inputMode="email"
										required
										className="rounded-xl border-[#E0D8C8] focus:ring-[#D97736]"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-[#3E2723] mb-2">Password</label>
									<Input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter your password"
										autoComplete="current-password"
										autoCapitalize="none"
										autoCorrect="off"
										spellCheck={false}
										required
										className="rounded-xl border-[#E0D8C8] focus:ring-[#D97736]"
									/>
								</div>
								<Button type="submit" className="w-full bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-12 text-lg font-medium transition-transform hover:-translate-y-1">Login</Button>
							</form>
							<div className="mt-6 text-center">
								<p className="text-sm mb-2">
									<button type="button" onClick={switchToForgotPassword} className="text-[#D97736] font-medium hover:underline">Forgot password?</button>
								</p>
								<p className="text-sm text-[#5D4037]">
									Don&apos;t have an account? <Link to="/register" className="text-[#D97736] font-medium hover:underline">Register here</Link>
								</p>
							</div>
						</>
					) : (
						<>
							<div className="flex items-center gap-3 mb-2">
								<button
									type="button"
									onClick={switchToLogin}
									className="text-[#D97736] hover:text-[#C96626] transition-colors"
									title="Go back"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<h2 className="font-heading text-2xl font-semibold text-[#3E2723]">Forgot Password</h2>
							</div>
							<p className="text-sm text-[#5D4037] mb-6">
								{forgotStep === "email"
									? "Enter your registered email and we will send a verification code."
									: "Enter the code from your email and set a new password."}
							</p>

							{forgotStep === "email" ? (
								<form onSubmit={handleSendCode} className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-[#3E2723] mb-2">Registered Email</label>
										<Input
											type="email"
											value={forgotEmail}
											onChange={(e) => setForgotEmail(e.target.value)}
											placeholder="Enter your registered email"
											autoComplete="email"
											autoCapitalize="none"
											autoCorrect="off"
											spellCheck={false}
											required
											className="rounded-xl border-[#E0D8C8] focus:ring-[#D97736]"
										/>
									</div>
									<Button
										type="submit"
										disabled={isSendingCode}
										className="w-full bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-12 text-lg font-medium transition-transform hover:-translate-y-1"
									>
										{isSendingCode ? "Sending..." : "Send Verification Code"}
									</Button>
								</form>
							) : (
								<form onSubmit={handleResetPassword} className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-[#3E2723] mb-2">Verification Code</label>
										<Input
											type="text"
											value={verificationCode}
											onChange={(e) => setVerificationCode(e.target.value)}
											placeholder="Enter 6-digit code"
											inputMode="numeric"
											autoComplete="one-time-code"
											required
											className="rounded-xl border-[#E0D8C8] focus:ring-[#D97736]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-[#3E2723] mb-2">New Password</label>
										<Input
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											placeholder="Enter new password"
											autoComplete="new-password"
											required
											className="rounded-xl border-[#E0D8C8] focus:ring-[#D97736]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-[#3E2723] mb-2">Confirm Password</label>
										<Input
											type="password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											placeholder="Confirm new password"
											autoComplete="new-password"
											required
											className="rounded-xl border-[#E0D8C8] focus:ring-[#D97736]"
										/>
									</div>
									<Button
										type="submit"
										disabled={isResettingPassword}
										className="w-full bg-[#D97736] hover:bg-[#C96626] text-white rounded-full h-12 text-lg font-medium transition-transform hover:-translate-y-1"
									>
										{isResettingPassword ? "Resetting..." : "Reset Password"}
									</Button>
									<button
										type="button"
										onClick={handleSendCode}
										disabled={isSendingCode}
										className="w-full text-sm text-[#D97736] font-medium hover:underline"
									>
										{isSendingCode ? "Resending..." : "Resend code"}
									</button>
								</form>
							)}

							<div className="mt-6 text-center">
								<p className="text-sm text-[#5D4037]">
									Remembered your password? <button type="button" onClick={switchToLogin} className="text-[#D97736] font-medium hover:underline">Login</button>
								</p>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
