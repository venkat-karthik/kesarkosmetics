import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { formatPrice } from "../utils/helpers";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import Footer from "../components/Footer";
import CartSuccessModal from "../components/CartSuccessModal";
import CartOptionsModal from "../components/CartOptionsModal";
import FlyingToCart from "../components/FlyingToCart";
import FlyingToWishlist from "../components/FlyingToWishlist";
import LoginRequiredModal from "../components/LoginRequiredModal";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart: addToCartCtx } = useCart();
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successProduct, setSuccessProduct] = useState(null);
  const [showCartOptionsModal, setShowCartOptionsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalProduct, setLoginModalProduct] = useState(null);
  const [hoveredImageIndices, setHoveredImageIndices] = useState({});
  const [flyingCart, setFlyingCart] = useState({ active: false, position: null });
  const [flyingWishlist, setFlyingWishlist] = useState({ active: false, start: null, end: null });
  const addToCartButtonRefs = React.useRef({});
  const hoverIntervalsRef = React.useRef({});

  const getProductId = (product) => product.id || product._id;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const category = searchParams.get("category");
        const { getAllProducts } = await import("../utils/productsDb");
        const productArray = await getAllProducts(category || null);
        setProducts(productArray);
        setError("");
      } catch (err) {
        console.error("Product fetch error:", err);
        setError("Could not load products.");
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();

    // Set up periodic refresh every 10 seconds for admin changes
    const interval = setInterval(fetchProducts, 10000);

    // Refetch when page becomes visible (when switching tabs/windows)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchProducts();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("reviews:updated", fetchProducts);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("reviews:updated", fetchProducts);
    };
  }, [searchParams]);

  useEffect(() => {
    return () => {
      Object.values(hoverIntervalsRef.current).forEach((intervalId) => clearInterval(intervalId));
    };
  }, []);

  const startProductHoverScroll = (productId, imageCount) => {
    if (imageCount <= 1) return;

    setHoveredImageIndices((prev) => ({
      ...prev,
      [productId]: 0,
    }));

    if (hoverIntervalsRef.current[productId]) {
      clearInterval(hoverIntervalsRef.current[productId]);
    }

    hoverIntervalsRef.current[productId] = setInterval(() => {
      setHoveredImageIndices((prev) => {
        const currentIndex = prev[productId] ?? 0;
        const nextIndex = currentIndex + 1;

        if (nextIndex >= imageCount) {
          if (hoverIntervalsRef.current[productId]) {
            clearInterval(hoverIntervalsRef.current[productId]);
            delete hoverIntervalsRef.current[productId];
          }
          return prev;
        }

        return {
          ...prev,
          [productId]: nextIndex,
        };
      });
    }, 900);
  };

  const stopProductHoverScroll = (productId) => {
    if (hoverIntervalsRef.current[productId]) {
      clearInterval(hoverIntervalsRef.current[productId]);
      delete hoverIntervalsRef.current[productId];
    }

    setHoveredImageIndices((prev) => ({
      ...prev,
      [productId]: 0,
    }));
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user || !user._id) {
      setLoginModalProduct(product);
      setShowLoginModal(true);
      return;
    }
    // Get button position for flying animation
    const buttonElement = addToCartButtonRefs.current[product.id];
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      setFlyingCart({ active: true, position: { x: rect.left, y: rect.top } });
    }
    setAddingToCart(product.id);
    try {
      await addToCartCtx(product, quantity);
      window.dispatchEvent(new Event("cart:updated"));
      setTimeout(() => {
        setSuccessProduct(product);
        setShowSuccessModal(true);
      }, 1000);
    } catch (err) {
      toast.error("Failed to add to cart");
      console.error(err);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleViewCart = () => {
    setShowSuccessModal(false);
    setShowCartOptionsModal(false);
  };

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
    setShowCartOptionsModal(false);
  };

  const handleProceedToBuy = () => {
    setShowCartOptionsModal(false);
    if (!user || !user._id) {
      setLoginModalProduct(successProduct);
      setShowLoginModal(true);
      return;
    }
  };

  const handleLoginFromModal = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleGuestContinueShopping = () => {
    setShowLoginModal(false);
  };

  const toggleWishlistFromCard = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    const productId = getProductId(product);
    if (!productId) return;

    const alreadyWishlisted = isWishlisted(productId);
    if (alreadyWishlisted) {
      removeFromWishlist(productId);
      toast.success("Removed from wishlist");
      return;
    }

    const added = addToWishlist(product);
    if (!added) return;

    const sourceRect = event.currentTarget.getBoundingClientRect();
    const targetElement = document.getElementById("wishlist-target-icon");
    if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect();
      setFlyingWishlist({
        active: true,
        start: {
          x: sourceRect.left + sourceRect.width / 2,
          y: sourceRect.top + sourceRect.height / 2,
        },
        end: {
          x: targetRect.left + targetRect.width / 2,
          y: targetRect.top + targetRect.height / 2,
        },
      });
      setTimeout(() => {
        setFlyingWishlist({ active: false, start: null, end: null });
      }, 700);
    }

    toast.success("Added to wishlist");
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#FFF8EC]">
      {/* Flying Cart Animation */}
      <FlyingToCart
        isActive={flyingCart.active}
        startPosition={flyingCart.position}
        onComplete={() => setFlyingCart({ active: false, position: null })}
      />
      <FlyingToWishlist
        isActive={flyingWishlist.active}
        startPosition={flyingWishlist.start}
        endPosition={flyingWishlist.end}
      />

      {/* Success Modal */}
      <CartSuccessModal
        isOpen={showSuccessModal}
        onClose={handleContinueShopping}
        onViewCart={handleViewCart}
        onProceedToBuy={handleProceedToBuy}
        product={successProduct}
      />

      {/* Cart Options Modal */}
      <CartOptionsModal
        isOpen={showCartOptionsModal}
        onClose={handleContinueShopping}
        onViewCart={handleViewCart}
        onProceedToBuy={handleProceedToBuy}
      />

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={handleGuestContinueShopping}
        onLogin={handleLoginFromModal}
        onContinueShopping={handleGuestContinueShopping}
      />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#3E1A00] via-[#5D2A00] to-[#3E1A00] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Our Products
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Discover our handcrafted collection of natural products, made with devotion and care.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="py-6 bg-white border-b border-[#E8DECF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                to="/products"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !searchParams.get("category")
                    ? "bg-[#D97736] text-white"
                    : "bg-[#F5EEE6] text-[#5D4037] hover:bg-[#E8DECF]"
                }`}
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    searchParams.get("category") === category
                      ? "bg-[#D97736] text-white"
                      : "bg-[#F5EEE6] text-[#5D4037] hover:bg-[#E8DECF]"
                  }`}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && <p className="text-red-600 text-center mb-6">{error}</p>}

          {productsLoading ? (
            <div className="text-center text-[#7A3B00] py-12">
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-[#7A3B00] py-12">
              <p>No products found. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product, i) => {
                const productId = getProductId(product);
                const wishlisted = isWishlisted(productId);

                return (
                  <div
                    key={productId}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onMouseEnter={() => startProductHoverScroll(productId, product.images?.length || 0)}
                    onMouseLeave={() => stopProductHoverScroll(productId)}
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => toggleWishlistFromCard(event, product)}
                        className={`absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                          wishlisted
                            ? "bg-[#E8620A] border-[#E8620A] text-white scale-110"
                            : "bg-white/90 border-white/50 text-[#7A3B00] hover:bg-[#FFF3D6] hover:border-[#F5A800] hover:scale-110"
                        }`}
                        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={`w-4 h-4 transition-transform duration-200 ${wishlisted ? "fill-current scale-110" : ""}`} />
                      </button>
                      <Link to={`/product/${productId}`}>
                        <div className="relative overflow-hidden aspect-square">
                          {product.badge && (
                            <span className="absolute top-3 left-3 bg-[#E8620A] text-white text-[11px] font-bold px-3 py-1 rounded-full z-10 shadow-sm">
                              {product.badge}
                            </span>
                          )}
                          {(() => {
                            const activeImageIndex = hoveredImageIndices[productId] ?? 0;
                            return (
                              <img
                                key={`${productId}-${activeImageIndex}`}
                                src={product.images?.[activeImageIndex] || product.images?.[0]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                style={{ transform: "scale(1)", transition: "transform 0.7s ease" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                              />
                            );
                          })()}
                        </div>
                      </Link>
                    </div>

                    <div className="flex flex-col flex-1 p-4 text-center">
                      <Link to={`/product/${productId}`}>
                        <h3 className="font-heading text-lg sm:text-xl font-bold text-[#4A1A00] mb-2 line-clamp-2 hover:text-[#E8620A] transition-colors duration-200">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} viewBox="0 0 20 20" className={`w-3.5 h-3.5 ${s <= Math.round(product.rating || 4.8) ? "fill-[#F5A800]" : "fill-gray-200"}`}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                        <span className="text-xs text-[#7A3B00] ml-1 font-medium">{product.rating || 4.8}</span>
                      </div>

                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-xl font-bold text-[#4A1A00]">{formatPrice(product.price)}</span>
                        {product.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
                        )}
                      </div>

                      <Button
                        ref={(el) => { if (el) addToCartButtonRefs.current[productId] = el; }}
                        onClick={() => addToCart(product)}
                        disabled={addingToCart === productId}
                        className={`mt-auto w-full bg-gradient-to-r from-[#E8620A] to-[#F5A800] hover:from-[#C8380A] hover:to-[#E8620A] text-white rounded-full font-bold text-sm shadow-md transition-all duration-200 ${
                          addingToCart === productId
                            ? "scale-95 opacity-75"
                            : "hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                        }`}
                      >
                        {addingToCart === productId ? (
                          <><ShoppingCart className="w-4 h-4 mr-2 animate-bounce" />Adding...</>
                        ) : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductsPage;