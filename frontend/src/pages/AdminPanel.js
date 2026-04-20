import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Edit2, LogOut, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "../utils/helpers";
import { useAuth, ADMIN_EMAILS } from "../contexts/AuthContext";

const DEFAULT_NEW_PRODUCT = {
  name: "", description: "", price: "", category: "Serums", images: [], video: null,
};

const DEFAULT_EDIT_FORM = {
  name: "", description: "", price: "", category: "Serums",
  existingImages: [], images: [], existingVideo: null, video: null,
};

const ADMIN_TABS = ["new-product", "products"];

const CATEGORIES = [
  "Skin Care","Serums","Moisturizers","Cleansers","Night Care","Toners","Masks",
  "Ghee","Oils","Flours","Jaggery","Coffee","Turmeric","Peanut Butter","Gift Hampers","General",
];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("new-product");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState(DEFAULT_NEW_PRODUCT);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM);
  const [addingProduct, setAddingProduct] = useState(false);
  const swipeStartRef = useRef({ x: 0, y: 0, blocked: false, active: false });
  const tabButtonRefs = useRef({});

  useEffect(() => {
    if (authLoading) return;
    const isAdmin = ADMIN_EMAILS.map(e => e.toLowerCase()).includes((user?.email || "").toLowerCase());
    if (!user || !isAdmin) { toast.error("Admin access only."); navigate("/"); }
  }, [user, authLoading, navigate]);

  const fetchProducts = async () => {
    try {
      const { getAllProducts } = await import("../utils/productsDb");
      setProducts(await getAllProducts());
    } catch { toast.error("Failed to load products"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const btn = tabButtonRefs.current[activeTab];
    if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab]);

  // ── Add product ──────────────────────────────────────────────────────────
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.description.trim()) {
      toast.error("Please fill in all required fields"); return;
    }
    if (!Number.isFinite(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
      toast.error("Please enter a valid price"); return;
    }
    if (newProduct.images.length === 0) {
      toast.error("Please add at least one product image"); return;
    }
    setAddingProduct(true);
    try {
      const imageDataUrls = await Promise.all(newProduct.images.map(fileToDataUrl));
      const videoDataUrl = newProduct.video ? await fileToDataUrl(newProduct.video) : null;
      const { createProduct } = await import("../utils/productsDb");
      await createProduct({
        name: newProduct.name.trim(), description: newProduct.description.trim(),
        price: parseFloat(newProduct.price), category: newProduct.category,
        images: imageDataUrls.filter(Boolean), video: videoDataUrl,
      });
      toast.success("Product added successfully!");
      setNewProduct(DEFAULT_NEW_PRODUCT);
      fetchProducts();
    } catch (err) {
      toast.error(`Failed to add product: ${err?.message || "Unknown error"}`);
    } finally { setAddingProduct(false); }
  };

  // ── Update product ────────────────────────────────────────────────────────
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.price || !editForm.description.trim()) {
      toast.error("Please fill in all required fields"); return;
    }
    try {
      const imageDataUrls = editForm.images.length > 0
        ? await Promise.all(editForm.images.map(fileToDataUrl)) : [];
      const videoDataUrl = editForm.video ? await fileToDataUrl(editForm.video) : null;
      const productId = editingProduct?.id || editingProduct?._id;
      if (!productId) { toast.error("Product ID missing"); return; }
      const mergedImages = [...(editForm.existingImages || []), ...imageDataUrls].filter(Boolean);
      if (mergedImages.length === 0) { toast.error("Please keep at least one image"); return; }
      const { updateProduct } = await import("../utils/productsDb");
      await updateProduct(productId, {
        name: editForm.name.trim(), description: editForm.description.trim(),
        price: parseFloat(editForm.price), category: editForm.category,
        images: mergedImages,
        video: videoDataUrl || (editForm.existingVideo === null ? null : editingProduct?.video),
      });
      toast.success("Product updated");
      setEditingProduct(null);
      setEditForm(DEFAULT_EDIT_FORM);
      fetchProducts();
    } catch { toast.error("Failed to update product"); }
  };

  // ── Delete product ────────────────────────────────────────────────────────
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const { deleteProduct } = await import("../utils/productsDb");
      await deleteProduct(productId);
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Failed to delete product"); }
  };

  // ── Swipe between tabs on mobile ──────────────────────────────────────────
  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  const handleTouchStart = (e) => {
    if (!isMobile()) return;
    const blocked = Boolean(e.target.closest("input,textarea,select,button,a,video"));
    const t = e.touches?.[0];
    if (!t) return;
    swipeStartRef.current = { x: t.clientX, y: t.clientY, blocked, active: true };
  };

  const handleTouchEnd = (e) => {
    const s = swipeStartRef.current;
    if (!s.active || s.blocked || !isMobile()) return;
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) >= 56 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      const idx = ADMIN_TABS.indexOf(activeTab);
      if (dx < 0 && idx < ADMIN_TABS.length - 1) setActiveTab(ADMIN_TABS[idx + 1]);
      if (dx > 0 && idx > 0) setActiveTab(ADMIN_TABS[idx - 1]);
    }
    swipeStartRef.current.active = false;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#E0D8C8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-[#3E2723]">Manage Products</h1>
            <p className="text-sm text-[#5D4037] break-all">{user?.email || "Admin"}</p>
          </div>
          <Button onClick={() => navigate("/admin/dashboard")} className="bg-[#D97736] hover:bg-[#C96626] text-white rounded-full flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E0D8C8] sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: "new-product", label: "New Product" },
              { id: "products",    label: "Current Products" },
            ].map(tab => (
              <button
                key={tab.id}
                ref={el => { if (el) tabButtonRefs.current[tab.id] = el; }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? "text-[#D97736] border-[#D97736]"
                    : "text-[#5D4037] border-transparent hover:text-[#D97736]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {/* ── New Product ─────────────────────────────────────────────────── */}
        {activeTab === "new-product" && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#E0D8C8]">
            <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Product Name *</label>
                <Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name" className="rounded-full border-[#E0D8C8]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Price (₹) *</label>
                <Input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Enter price" className="rounded-full border-[#E0D8C8]" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-full border border-[#E0D8C8] focus:ring-2 focus:ring-[#D97736] focus:outline-none">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Product Images * (multiple allowed)</label>
                <input type="file" multiple accept="image/*"
                  onChange={e => setNewProduct({ ...newProduct, images: [...newProduct.images, ...Array.from(e.target.files || [])] })}
                  className="w-full px-4 py-2 rounded-full border border-[#E0D8C8]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Product Video (optional)</label>
                <input type="file" accept="video/*"
                  onChange={e => setNewProduct({ ...newProduct, video: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 rounded-full border border-[#E0D8C8]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#3E2723] mb-2">Description *</label>
                <textarea value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description" rows="4"
                  className="w-full px-4 py-3 rounded-2xl border border-[#E0D8C8] focus:ring-2 focus:ring-[#D97736] focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={addingProduct}
                  className="w-full bg-gradient-to-r from-[#D97736] to-[#F5A962] hover:from-[#C96626] hover:to-[#E59650] text-white rounded-full h-12 font-medium disabled:opacity-60">
                  <Plus className="w-4 h-4 mr-2" />{addingProduct ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Current Products ─────────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-[#E0D8C8]">
            <h2 className="font-heading text-2xl font-semibold text-[#3E2723] mb-6">Current Products</h2>

            {/* Edit form */}
            {editingProduct && (
              <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-[#E0D8C8]">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Current Images</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(editForm.existingImages || []).map((url, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border border-[#E0D8C8]">
                        <img src={url} alt={`img-${idx}`} className="h-28 w-full object-cover" />
                        <button type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== idx) }))}
                          className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Product Name</label>
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="rounded-full border-[#E0D8C8]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Price (₹)</label>
                  <Input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="rounded-full border-[#E0D8C8]" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-full border border-[#E0D8C8] focus:ring-2 focus:ring-[#D97736] focus:outline-none">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Add More Images</label>
                  <input type="file" multiple accept="image/*"
                    onChange={e => setEditForm({ ...editForm, images: [...editForm.images, ...Array.from(e.target.files || [])] })}
                    className="w-full px-4 py-2 rounded-full border border-[#E0D8C8]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Current Video</label>
                  {editForm.existingVideo ? (
                    <div className="rounded-2xl border border-[#E0D8C8] p-3 space-y-3">
                      <video controls className="w-full max-h-56 rounded-xl bg-black">
                        <source src={editForm.existingVideo} />
                      </video>
                      <Button type="button" onClick={() => setEditForm(prev => ({ ...prev, existingVideo: null }))}
                        className="rounded-full bg-red-500 hover:bg-red-600 text-white">Remove Video</Button>
                    </div>
                  ) : <p className="text-sm text-[#5D4037]">No current video.</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Replace Video</label>
                  <input type="file" accept="video/*"
                    onChange={e => setEditForm({ ...editForm, video: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 rounded-full border border-[#E0D8C8]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#3E2723] mb-2">Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    rows="4" className="w-full px-4 py-3 rounded-2xl border border-[#E0D8C8] focus:ring-2 focus:ring-[#D97736] focus:outline-none" />
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-[#D97736] to-[#F5A962] hover:from-[#C96626] hover:to-[#E59650] text-white rounded-full h-12">Save Changes</Button>
                  <Button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#3E2723] rounded-full h-12">Cancel</Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter(p => !editingProduct || (p.id || p._id) !== (editingProduct.id || editingProduct._id))
                .map(product => {
                  const productId = product.id || product._id;
                  return (
                    <div key={productId} className="border border-[#E0D8C8] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover" />}
                        {product.images?.length > 1 && (
                          <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">{product.images.length} photos</span>
                        )}
                        {product.video && (
                          <span className="absolute top-2 right-2 bg-[#8B2C6D] text-white text-xs px-2 py-1 rounded-full">Video</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#3E2723] mb-1">{product.name}</h3>
                        <p className="text-sm text-[#5D4037] mb-1 line-clamp-2">{product.description}</p>
                        <p className="text-xs text-[#8A7768] mb-2">{product.reviews?.length || 0} review{product.reviews?.length !== 1 ? "s" : ""}</p>
                        <p className="text-lg font-bold text-[#D97736] mb-4">{formatPrice(product.price)}</p>
                        <div className="flex gap-2">
                          <Button onClick={() => {
                            setEditingProduct(product);
                            setEditForm({
                              name: product.name || "", description: product.description || "",
                              price: product.price ?? "", category: product.category || "Serums",
                              existingImages: Array.isArray(product.images) ? product.images : product.image ? [product.image] : [],
                              images: [], existingVideo: product.video || null, video: null,
                            });
                          }} className="flex-1 bg-[#D97736] hover:bg-[#C96626] text-white rounded-full text-sm">
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

      </div>
    </div>
  );
};

export default AdminPanel;
