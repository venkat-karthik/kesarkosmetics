import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import MenuDrawer from './components/MenuDrawer';
import SearchOverlay from './components/SearchOverlay';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import './App.css';

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  const handleCartUpdate = () => {
    setCartUpdateTrigger(prev => prev + 1);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/*"
          element={
            (
              <>
                <Header
                  onMenuClick={() => setIsMenuOpen(true)}
                  onSearchClick={() => setIsSearchOpen(true)}
                  onCartClick={() => setIsCartOpen(true)}
                />
                <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
                <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                <CartDrawer
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                  onUpdate={handleCartUpdate}
                />
                
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
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
            )
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
