import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, ADMIN_EMAILS } from "../contexts/AuthContext";
import { toast } from "sonner";
import { X } from "lucide-react";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  // Already logged in — redirect
  useEffect(() => {
    if (user) {
      if (ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const loggedIn = await loginWithGoogle();
      toast.success(`Welcome, ${loggedIn.name}!`);
      if (ADMIN_EMAILS.includes(loggedIn.email?.toLowerCase())) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        toast.error("Sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#F5EEE6] to-[#EDE4D8] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F5A800]/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#E8620A]/8 blur-3xl pointer-events-none" />
      {/* Close button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 right-5 p-2.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:bg-white transition-all z-50 border border-[#EDE4D8]"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-[#5D4037]" />
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/"><img src="/logo.png" alt="Kesar Kosmetics" className="h-20 mx-auto object-contain drop-shadow-sm" /></Link>
          <h1 className="font-heading text-3xl font-semibold text-[#3E2723] mt-5">Welcome back</h1>
          <p className="text-[#8A7768] mt-1.5 text-sm">Sign in to continue your journey</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(62,39,35,0.1)] border border-[#EDE4D8] p-8">
          {/* Decorative top line */}
          <div className="h-0.5 w-16 bg-gradient-to-r from-[#D97736] to-[#F5A800] rounded-full mx-auto mb-8" />

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-[#EDE4D8] hover:border-[#D97736] rounded-2xl py-3.5 text-sm font-semibold text-[#3E2723] hover:bg-[#FFF8F0] transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="mt-6 text-center text-xs text-[#B0A090] leading-relaxed">
            New here? Clicking above creates your account automatically.
          </p>
        </div>

        <p className="text-center text-xs text-[#B0A090] mt-6">
          Protected by Firebase Authentication
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
