import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { CartDrawerProvider, useCartDrawer } from "./contexts/CartDrawerContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import MenuDrawer from "./components/MenuDrawer";
import PromoBanner from "./components/PromoBanner";
import SearchOverlay from "./components/SearchOverlay";
import CartDrawer from "./components/CartDrawer";
import LoginRequiredModal from "./components/LoginRequiredModal";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanel from "./pages/AdminPanel";
import AboutUsPage from "./pages/AboutUsPage";
import BlogsPage from "./pages/BlogsPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import TrackOrderResultsPage from "./pages/TrackOrderResultsPage";
import TrackOrderStatusPage from "./pages/TrackOrderStatusPage";
import WishlistPage from "./pages/WishlistPage";
import "./App.css";

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [shakeCart, setShakeCart] = useState(false);
  const [triggerCartRefresh, setTriggerCartRefresh] = useState(0);
  const [showCartLoginModal, setShowCartLoginModal] = useState(false);
  const { isCartOpen, setIsCartOpen } = useCartDrawer();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleCartClick = () => {
    if (loading) return;

    if (user && user._id) {
      setIsCartOpen(true);
      return;
    }

    setShowCartLoginModal(true);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        onCartClick={handleCartClick}
        shakeCart={shakeCart}
        triggerCartRefresh={triggerCartRefresh}
      />
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginRequiredModal
        isOpen={showCartLoginModal}
        onClose={() => setShowCartLoginModal(false)}
        onLogin={() => {
          setShowCartLoginModal(false);
          navigate("/login?redirect=/cart");
        }}
        onContinueShopping={() => setShowCartLoginModal(false)}
      />
      <Routes>
        <Route path="/" element={<HomePage setShakeCart={setShakeCart} setTriggerCartRefresh={setTriggerCartRefresh} />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/track-order/results" element={<TrackOrderResultsPage />} />
        <Route path="/track-order/status/:orderId" element={<TrackOrderStatusPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
        <CartDrawerProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
        </CartDrawerProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
