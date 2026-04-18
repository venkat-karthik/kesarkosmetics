import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useAuth, ADMIN_EMAILS } from "../contexts/AuthContext";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  // Already logged in as admin — redirect
  useEffect(() => {
    if (authLoading) return;
    if (user && ADMIN_EMAILS.includes(user.email)) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ADMIN_EMAILS.includes(email.trim().toLowerCase())) {
      toast.error("Not an admin email.");
      return;
    }
    setIsLoading(true);
    try {
      const loggedIn = await login(email.trim().toLowerCase(), password);
      if (ADMIN_EMAILS.includes(loggedIn.email)) {
        localStorage.setItem("adminToken", "admin_" + Date.now());
        localStorage.setItem("adminEmail", loggedIn.email);
        toast.success("Welcome, Admin!");
        navigate("/admin/dashboard", { replace: true });
      } else {
        toast.error("Not an admin account.");
      }
    } catch (err) {
      const msg =
        err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
          ? "Invalid email or password."
          : err.code === "auth/user-not-found"
          ? "No account found."
          : err.message || "Login failed.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] to-[#EFE9DF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8">
          <div className="text-center space-y-2">
            <Link to="/"><img src="/logo.png" alt="Kesar Kosmetics" className="h-14 mx-auto object-contain" /></Link>
            <h1 className="font-heading text-3xl font-semibold text-[#3E2723]">Admin Portal</h1>
            <p className="text-[#5D4037] text-sm">Restricted access — admins only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-[#3E2723]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kesarkosmetics.com"
                required
                className="w-full px-4 py-3 border-2 border-[#E0D8C8] rounded-xl focus:border-[#D97736] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-[#3E2723]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border-2 border-[#E0D8C8] rounded-xl focus:border-[#D97736] focus:outline-none transition-colors"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#D97736] hover:bg-[#C96626] text-white rounded-xl h-12 font-semibold transition-transform hover:-translate-y-1 disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Login as Admin"}
            </Button>
          </form>

          <div className="text-center text-sm text-[#5D4037]">
            Not an admin?{" "}
            <Link to="/" className="text-[#D97736] hover:underline font-semibold">Back to Store</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
