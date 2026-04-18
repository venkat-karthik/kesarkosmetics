import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ChevronDown, ChevronUp, Edit2, LogOut, Plus, Trash2, TrendingUp } from "lucide-react";
import { formatPrice } from "../utils/helpers";
import { useAuth, ADMIN_EMAILS } from "../contexts/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Order Placed" },
  { value: "shipped", label: "Shipped" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const DEFAULT_NEW_PRODUCT = {
  name: "",
  description: "",
  price: "",
  category: "Serums",
  images: [],
  video: null,
};

const DEFAULT_EDIT_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Serums",
  existingImages: [],
  images: [],
  existingVideo: null,
  video: null,
};

const ADMIN_TABS = ["overview", "new-product", "products", "orders", "revenue"];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("new-product");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
  const [newProduct, setNewProduct] = useState(DEFAULT_NEW_PRODUCT);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM);
  const swipeStartRef = useRef({ x: 0, y: 0, blocked: false, active: false });
  const tabsScrollRef = useRef(null);
  const tabButtonRefs = useRef({});

  // Firebase auth guard
  useEffect(() => {
    if (authLoading) return;
    const isAdmin = ADMIN_EMAILS.map(e => e.toLowerCase()).includes((user?.email || "").toLowerCase());
    if (!user || !isAdmin) {
      toast.error("Admin access only.");
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const fetchProducts = async () => {
    try {
      const { getAllProducts } = await import("../utils/productsDb");
      setProducts(await getAllProducts());
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/orders`, { withCredentials: true });
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to load orders");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!isMobileViewport()) return;
    const activeTabButton = tabButtonRefs.current[activeTab];
    if (!activeTabButton) return;

    activeTabButton.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);

  const revenue = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.reduce(
      (accumulator, order) => {
        const orderDate = new Date(order.created_at || order.createdAt || Date.now());
        const total = Number(order.total || 0);

        if (orderDate >= startOfDay) accumulator.day += total;
        if (orderDate >= startOfWeek) accumulator.week += total;
        if (orderDate >= startOfMonth) accumulator.month += total;
        return accumulator;
      },
      { day: 0, week: 0, month: 0 }
    );
  }, [orders]);

  const totals = useMemo(
    () => ({
      products: products.length,
      orders: orders.length,
    }),
    [products.length, orders.length]
  );

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name.trim() || !newProduct.price || !newProduct.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!Number.isFinite(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (newProduct.images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    try {
      const imageDataUrls = await Promise.all(newProduct.images.map((file) => fileToDataUrl(file)));
      const videoDataUrl = newProduct.video ? await fileToDataUrl(newProduct.video) : null;

      const { createProduct } = await import("../utils/productsDb");
      await createProduct({
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        images: imageDataUrls.filter(Boolean),
        video: videoDataUrl,
      });

      toast.success("Product added successfully");
      setNewProduct(DEFAULT_NEW_PRODUCT);
      fetchProducts();
    } catch (err) {
      toast.error("Failed to add product");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim() || !editForm.price || !editForm.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const imageDataUrls =
        editForm.images.length > 0 ? await Promise.all(editForm.images.map((file) => fileToDataUrl(file))) : [];
      const videoDataUrl = editForm.video ? await fileToDataUrl(editForm.video) : null;
      const productId = editingProduct?.id || editingProduct?._id;

      if (!productId) {
        toast.error("Product ID is missing. Please reopen edit form.");
        return;
      }

      const mergedImages = [...(editForm.existingImages || []), ...imageDataUrls].filter(Boolean);

      if (mergedImages.length === 0) {
        toast.error("Please keep at least one product image");
        return;
      }

      const { updateProduct } = await import("../utils/productsDb");
      await updateProduct(productId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: parseFloat(editForm.price),
        category: editForm.category,
        images: mergedImages,
        video: videoDataUrl || (editForm.existingVideo === null ? null : editingProduct?.video),
      });

      toast.success("Product updated successfully");
      setEditingProduct(null);
      setEditForm(DEFAULT_EDIT_FORM);
      fetchProducts();
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const { deleteProduct } = await import("../utils/productsDb");
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const updateOrderStatus = async (orderId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/orders/${orderId}/status`, {
        status: orderStatusDrafts[orderId] || "pending",
      });
      toast.success("Order status updated");
      fetchOrders();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update order status");
    }
  };

  const handleLogout = () => {
    navigate("/admin/dashboard");
  };

  const isMobileViewport = () => window.matchMedia("(max-width: 767px)").matches;

  const handleContentTouchStart = (event) => {
    if (!isMobileViewport()) return;

    const target = event.target;
    const blocked = Boolean(target.closest("input, textarea, select, button, a, video, [data-no-tab-swipe='true']"));
    const touch = event.touches?.[0];
    if (!touch) return;

    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      blocked,
      active: true,
    };
  };

  const handleContentTouchEnd = (event) => {
    const swipeState = swipeStartRef.current;
    if (!swipeState.active || swipeState.blocked || !isMobileViewport()) return;

    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const dx = touch.clientX - swipeState.x;
    const dy = touch.clientY - swipeState.y;
    const horizontalEnough = Math.abs(dx) >= 56;
    const mostlyHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;

    if (!(horizontalEnough && mostlyHorizontal)) {
      swipeStartRef.current.active = false;
      return;
    }

    const currentIndex = ADMIN_TABS.indexOf(activeTab);
    if (currentIndex === -1) {
      swipeStartRef.current.active = false;
      return;
    }

    if (dx < 0 && currentIndex < ADMIN_TABS.length - 1) {
      setActiveTab(ADMIN_TABS[currentIndex + 1]);
    }

    if (dx > 0 && currentIndex > 0) {
      setActiveTab(ADMIN_TABS[currentIndex - 1]);
    }

    swipeStartRef.current.active = false;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-white border-b border-[#E0D8C8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-[#3E2723]">Admin Dashboard</h1>
            <p className="text-sm text-[#5D4037] break-all">{user?.email || "Admin"}</p>
          </div>
          <Button onClick={handleLogout} className="bg-[#D97736] hover:bg-[#C96626] text-white rounded-full flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="bg-white border-b border-[#E0D8C8] sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div ref={tabsScrollRef} className="flex gap-2 overflow-x-auto whitespace-nowrap touch-pan-x snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: "overview", label: "Overview" },
              { id: "new-product", label: "New Product" },
              { id: "products", label: "Current Products" },
              { id: "orders", label: "Orders" },
              { id: "revenue", label: "Revenue" },
            ].map((tab) => (
              <button
                key={tab.id}
                ref={(element) => {
                  if (element) tabButtonRefs.current[tab.id] = element;
                }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap shrink-0 snap-start ${
                  activeTab === tab.id ? "text-[#D97736] border-[#D97736]" : "text-[#5D4037] border-transparent hover:text-[#D97736]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8" onTouchStart={handleContentTouchStart} onTouchEnd={handleContentTouchEnd}>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8] shadow-sm">
              <p className="text-[#5D4037] text-sm font-semibold mb-2">Total Products</p>
              <p className="font-heading text-4xl font-semibold text-[#D97736]">{totals.products}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8] shadow-sm">
              <p className="text-[#5D4037] text-sm font-semibold mb-2">Total Orders</p>
              <p className="font-heading text-4xl font-semibold text-[#D97736]">{totals.orders}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8] shadow-sm">
              <p className="text-[#5D4037] text-sm font-semibold mb-2">Monthly Revenue</p>
              <p className="font-heading text-4xl font-semibold text-[#D97736]">{formatPrice(revenue.month)}</p>
            </div>
          </div>
        )}

        {activeTab === "new-product" && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#E0D8C8]">
            <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Product Name *</label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                  className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Price (₹) *</label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Enter price"
                  className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-full border border-[#E0D8C8] focus:ring-2 focus:ring-[#D97736] focus:outline-none"
                >
                  <option>Serums</option>
                  <option>Moisturizers</option>
                  <option>Cleansers</option>
                  <option>Night Care</option>
                  <option>Toners</option>
                  <option>Masks</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Product Images * (Add Multiple)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setNewProduct({ ...newProduct, images: [...newProduct.images, ...Array.from(e.target.files || [])] })}
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-full border border-[#E0D8C8]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Product Video (Optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setNewProduct({ ...newProduct, video: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 rounded-full border border-[#E0D8C8]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Description *</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                  className="w-full px-4 py-3 rounded-2xl border border-[#E0D8C8] focus:ring-2 focus:ring-[#D97736] focus:outline-none"
                  rows="4"
                />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-[#D97736] to-[#F5A962] hover:from-[#C96626] hover:to-[#E59650] text-white rounded-full h-12 font-medium">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#E0D8C8]">
            <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-6">Current Products</h2>

            {editingProduct ? (
              <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-[#E0D8C8]">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Current Images</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(editForm.existingImages || []).map((imageUrl, index) => (
                      <div key={`${imageUrl}-${index}`} className="relative rounded-2xl overflow-hidden border border-[#E0D8C8]">
                        <img src={imageUrl} alt={`Existing ${index + 1}`} className="h-28 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({
                            ...prev,
                            existingImages: prev.existingImages.filter((_, imageIndex) => imageIndex !== index),
                          }))}
                          className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Product Name</label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Price (₹)</label>
                  <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="rounded-full border-[#E0D8C8] focus:ring-[#D97736]" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Category</label>
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-4 py-2 rounded-full border border-[#E0D8C8] focus:ring-2 focus:ring-[#D97736] focus:outline-none">
                    <option>Serums</option>
                    <option>Moisturizers</option>
                    <option>Cleansers</option>
                    <option>Night Care</option>
                    <option>Toners</option>
                    <option>Masks</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Add More Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setEditForm({ ...editForm, images: [...editForm.images, ...Array.from(e.target.files || [])] })}
                    className="w-full px-4 py-2 rounded-full border border-[#E0D8C8]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Current Video</label>
                  {editForm.existingVideo ? (
                    <div className="rounded-2xl border border-[#E0D8C8] p-3 space-y-3">
                      <video controls className="w-full max-h-56 rounded-xl bg-black">
                        <source src={editForm.existingVideo} />
                      </video>
                      <Button
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, existingVideo: null }))}
                        className="rounded-full bg-red-500 hover:bg-red-600 text-white"
                      >
                        Remove Current Video
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-[#5D4037]">No current video.</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Replace Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setEditForm({ ...editForm, video: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 rounded-full border border-[#E0D8C8]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-[#E0D8C8] focus:ring-2 focus:ring-[#D97736] focus:outline-none" rows="4" />
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-[#D97736] to-[#F5A962] hover:from-[#C96626] hover:to-[#E59650] text-white rounded-full h-12 font-medium">Save Changes</Button>
                  <Button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#3E2723] rounded-full h-12 font-medium">Cancel</Button>
                </div>
              </form>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
              .filter((product) => {
                if (!editingProduct) return true;
                const productId = product.id || product._id;
                const editingProductId = editingProduct.id || editingProduct._id;
                return productId !== editingProductId;
              })
              .map((product) => {
                const imageToDisplay = product.images?.[0] || product.image;
                const productId = product.id || product._id;
                return (
                  <div key={productId} className="border border-[#E0D8C8] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {imageToDisplay && <img src={imageToDisplay} alt={product.name} className="w-full h-48 object-cover" />}
                      {Array.isArray(product.images) && product.images.length > 1 && (
                        <div className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
                          {product.images.length} photos
                        </div>
                      )}
                      {product.video && (
                        <div className="absolute top-2 right-2 rounded-full bg-[#8B2C6D] px-2 py-1 text-xs font-medium text-white">
                          Video
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#3E2723] mb-1">{product.name}</h3>
                      <p className="text-sm text-[#5D4037] mb-2 line-clamp-2">{product.description}</p>
                      <p className="text-lg font-bold text-[#D97736] mb-4">{formatPrice(product.price)}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditingProduct(product);
                            setEditForm({
                              name: product.name || "",
                              description: product.description || "",
                              price: product.price ?? "",
                              category: product.category || "Serums",
                              existingImages: Array.isArray(product.images) ? product.images : product.image ? [product.image] : [],
                              images: [],
                              existingVideo: product.video || null,
                              video: null,
                            });
                          }}
                          className="flex-1 bg-[#D97736] hover:bg-[#C96626] text-white rounded-full text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteProduct(productId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#E0D8C8]">
            <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-6">Orders</h2>
            {orders.length === 0 ? (
              <p className="text-[#5D4037] text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const items = Array.isArray(order.items) ? order.items : [];

                  return (
                    <div key={order.id} className="rounded-2xl border border-[#E0D8C8] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-left px-4 py-4 bg-[#FAF7F2] hover:bg-[#F5EEE6] transition-colors"
                      >
                        <div>
                          <p className="font-mono text-sm text-[#3E2723] break-all">{order.id}</p>
                          <p className="text-xs text-[#5D4037] mt-1">
                            {order.shipping_address?.name || "N/A"} | {new Date(order.created_at || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#D97736] font-semibold">{formatPrice(order.total)}</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                            {order.status?.replace("_", " ") || "pending"}
                          </span>
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-[#5D4037]" /> : <ChevronDown className="h-5 w-5 text-[#5D4037]" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 sm:p-5 bg-white border-t border-[#E0D8C8] space-y-5">
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7768] mb-2">Customer</p>
                              <p className="text-[#3E2723] font-medium">{order.shipping_address?.name || "N/A"}</p>
                              <p className="text-sm text-[#5D4037]">{order.contact_phone || order.shipping_address?.phone || ""}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7768] mb-2">Tracking Status</p>
                              <select
                                value={orderStatusDrafts[order.id] || order.status || "pending"}
                                onChange={(e) => setOrderStatusDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                className="w-full rounded-xl border border-[#D8D0C2] px-3 py-2 bg-white outline-none focus:border-[#D97736]"
                              >
                                {ORDER_STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-end">
                              <Button onClick={() => updateOrderStatus(order.id)} className="w-full rounded-xl bg-[#D97736] text-white hover:bg-[#C96626]">
                                Update Tracking
                              </Button>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#8A7768] mb-3">Order Items</p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {items.map((item, index) => (
                                <div key={`${order.id}-${item.product_id || index}`} className="rounded-2xl border border-[#E9E0D2] bg-[#FCFAF7] p-3 flex gap-3">
                                  <img src={item.image || item.product?.images?.[0] || "/logo.png"} alt={item.product_name || item.product?.name || "Product"} className="h-16 w-16 rounded-xl object-cover" />
                                  <div className="min-w-0">
                                    <p className="font-medium text-[#3E2723] line-clamp-2">{item.product_name || item.product?.name || "Product"}</p>
                                    <p className="text-sm text-[#5D4037]">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "revenue" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-[#E0D8C8]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[#5D4037] text-sm font-semibold mb-2">Today Revenue</p>
                  <p className="font-heading text-4xl font-semibold text-[#D97736]">{formatPrice(revenue.day)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-[#D97736] opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-[#E0D8C8]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[#5D4037] text-sm font-semibold mb-2">This Week</p>
                  <p className="font-heading text-4xl font-semibold text-[#D97736]">{formatPrice(revenue.week)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-[#D97736] opacity-20" />
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-[#E0D8C8]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[#5D4037] text-sm font-semibold mb-2">This Month</p>
                  <p className="font-heading text-4xl font-semibold text-[#D97736]">{formatPrice(revenue.month)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-[#D97736] opacity-20" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
