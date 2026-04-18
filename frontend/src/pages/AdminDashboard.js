import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Package, TrendingUp, Users, RefreshCw, ChevronDown, ChevronUp, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { formatPrice } from "../utils/helpers";
import { useAuth, ADMIN_EMAILS } from "../contexts/AuthContext";
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseClient";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const STATUS_OPTIONS = [
  { value: "pending",          label: "Order Placed" },
  { value: "confirmed",        label: "Confirmed" },
  { value: "processing",       label: "Processing" },
  { value: "shipped",          label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered",        label: "Delivered" },
  { value: "cancelled",        label: "Cancelled" },
];

const STATUS_COLORS = {
  pending:          "bg-yellow-100 text-yellow-800",
  confirmed:        "bg-blue-100 text-blue-800",
  processing:       "bg-purple-100 text-purple-800",
  shipped:          "bg-indigo-100 text-indigo-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered:        "bg-green-100 text-green-800",
  cancelled:        "bg-red-100 text-red-800",
  paid:             "bg-green-100 text-green-800",
};

const isAdminUser = (email) =>
  ADMIN_EMAILS.map(e => e.toLowerCase()).includes((email || "").toLowerCase());

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [blogForm, setBlogForm] = useState({ title: "", excerpt: "", category: "Beauty", content: "", emoji: "✨" });
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdminUser(user.email)) {
      toast.error("Admin access only.");
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const ordersSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
      setOrders(ordersSnap.docs.map(d => ({ _docId: d.id, ...d.data() })));
      const usersSnap = await getDocs(collection(db, "users"));
      setUsers(usersSnap.docs.map(d => d.data()));
      const { data } = await axios.get(`${BACKEND_URL}/api/products`);
      setProducts(Array.isArray(data) ? data : []);
      // Fetch blogs from Firestore
      const blogsSnap = await getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc")));
      setBlogs(blogsSnap.docs.map(d => ({ _docId: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdminUser(user.email)) fetchAll();
  }, [user]);

  const revenue = useMemo(() => {
    const now = new Date();
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek  = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.reduce((acc, o) => {
      const t = Number(o.total || 0);
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);
      if (d >= startOfDay)   acc.day   += t;
      if (d >= startOfWeek)  acc.week  += t;
      if (d >= startOfMonth) acc.month += t;
      acc.total += t;
      return acc;
    }, { day: 0, week: 0, month: 0, total: 0 });
  }, [orders]);

  const statusCounts = useMemo(() =>
    orders.reduce((acc, o) => {
      const s = o.status || "pending";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {}),
  [orders]);

  const handleUpdateStatus = async (order, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", order._docId), { status: newStatus });
      if (order.orderId) {
        await axios.put(`${BACKEND_URL}/api/admin/orders/${order.orderId}/status`, { status: newStatus }).catch(() => {});
      }
      setOrders(prev => prev.map(o => o._docId === order._docId ? { ...o, status: newStatus } : o));
      setStatusDrafts(prev => { const n = { ...prev }; delete n[order._docId]; return n; });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim()) { toast.error("Title and content required"); return; }
    try {
      const payload = {
        ...blogForm,
        author: "Kesar Kosmetics Team",
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
        readTime: `${Math.max(1, Math.ceil(blogForm.content.split(" ").length / 200))} min read`,
        createdAt: serverTimestamp(),
      };
      if (editingBlog) {
        await updateDoc(doc(db, "blogs", editingBlog._docId), { ...payload });
        toast.success("Blog updated");
        setEditingBlog(null);
      } else {
        await addDoc(collection(db, "blogs"), payload);
        toast.success("Blog published");
      }
      setBlogForm({ title: "", excerpt: "", category: "Beauty", content: "", emoji: "✨" });
      fetchAll();
    } catch (err) { toast.error("Failed to save blog"); }
  };

  const handleDeleteBlog = async (docId) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await deleteDoc(doc(db, "blogs", docId));
      setBlogs(prev => prev.filter(b => b._docId !== docId));
      toast.success("Blog deleted");
    } catch { toast.error("Failed to delete blog"); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <p className="text-[#5D4037]">Loading...</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders",   label: "Orders" },
    { id: "revenue",  label: "Revenue" },
    { id: "users",    label: "Users" },
    { id: "products", label: "Products" },
    { id: "blogs",    label: "Blogs" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-[#D97736] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Kesar" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="font-heading text-xl font-semibold leading-tight">Admin Dashboard</h1>
              <p className="text-white/70 text-xs">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-[#E0D8C8] sticky top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                activeTab === tab.id ? "border-[#D97736] text-[#D97736]" : "border-transparent text-[#5D4037] hover:text-[#D97736]"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Orders",     value: orders.length,              color: "text-[#D97736]" },
                { label: "Total Revenue",    value: formatPrice(revenue.total), color: "text-green-600" },
                { label: "Total Products",   value: products.length,            color: "text-blue-600" },
                { label: "Registered Users", value: users.length,               color: "text-purple-600" },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl p-6 border border-[#E0D8C8] shadow-sm">
                  <p className="text-[#5D4037] text-xs font-semibold uppercase tracking-wide mb-2">{card.label}</p>
                  <p className={`font-heading text-3xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8]">
              <h3 className="font-semibold text-[#3E2723] mb-4">Orders by Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATUS_OPTIONS.map(s => (
                  <div key={s.value} className="rounded-xl border border-[#E0D8C8] p-3 text-center">
                    <p className="text-2xl font-bold text-[#D97736]">{statusCounts[s.value] || 0}</p>
                    <p className="text-xs text-[#5D4037] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8]">
              <h3 className="font-semibold text-[#3E2723] mb-4">Recent Orders</h3>
              {loading ? <p className="text-[#5D4037] text-sm">Loading...</p> : orders.slice(0, 5).map(o => (
                <div key={o._docId} className="flex items-center justify-between py-3 border-b border-[#F0E7DA] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#3E2723]">{o.userName || o.userEmail || "Customer"}</p>
                    <p className="text-xs text-[#5D4037]">{o.createdAt?.toDate?.()?.toLocaleDateString() || "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#D97736]">{formatPrice(o.total)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-700"}`}>
                      {(o.status || "pending").replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold text-[#3E2723]">All Orders ({orders.length})</h2>
            {loading ? <p className="text-[#5D4037]">Loading...</p> : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-[#E0D8C8]">
                <Package className="mx-auto h-12 w-12 text-[#D97736] mb-3" />
                <p className="text-[#5D4037]">No orders yet</p>
              </div>
            ) : orders.map(order => {
              const isExp = expandedOrder === order._docId;
              const items = Array.isArray(order.items) ? order.items : [];
              const addr = order.shippingAddress || {};
              return (
                <div key={order._docId} className="bg-white rounded-2xl border border-[#E0D8C8] overflow-hidden">
                  <button type="button" onClick={() => setExpandedOrder(isExp ? null : order._docId)}
                    className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 bg-[#FAF7F2] hover:bg-[#F5EEE6] transition-colors text-left">
                    <div>
                      <p className="font-mono text-xs text-[#5D4037] break-all">{order.orderId || order._docId}</p>
                      <p className="text-sm font-medium text-[#3E2723] mt-0.5">{order.userName || order.userEmail || "Customer"}</p>
                      <p className="text-xs text-[#8A7768]">{order.createdAt?.toDate?.()?.toLocaleString() || "—"}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-[#D97736]">{formatPrice(order.total)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {(order.status || "pending").replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-[#5D4037] capitalize">{order.paymentMethod || "cod"}</span>
                      {isExp ? <ChevronUp className="h-4 w-4 text-[#5D4037]" /> : <ChevronDown className="h-4 w-4 text-[#5D4037]" />}
                    </div>
                  </button>

                  {isExp && (
                    <div className="p-5 border-t border-[#E0D8C8] space-y-5">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#8A7768] mb-1">Customer</p>
                          <p className="font-medium text-[#3E2723]">{addr.name || order.userName || "—"}</p>
                          <p className="text-[#5D4037]">{order.userEmail}</p>
                          <p className="text-[#5D4037]">{addr.phone || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#8A7768] mb-1">Shipping Address</p>
                          <p className="text-[#3E2723]">{[addr.address, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean).join(", ") || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#8A7768] mb-1">Summary</p>
                          <p className="text-[#3E2723]">Items: {items.length}</p>
                          <p className="text-[#3E2723]">Total: <span className="font-semibold text-[#D97736]">{formatPrice(order.total)}</span></p>
                          <p className="text-[#3E2723] capitalize">Payment: {order.paymentMethod || "cod"}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-[#8A7768] mb-2">Items</p>
                        <div className="space-y-2">
                          {items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl bg-[#FAF7F2] px-4 py-2 text-sm">
                              <span className="text-[#3E2723] font-medium">{item.product_name || "Product"}</span>
                              <span className="text-[#5D4037]">x{item.quantity}</span>
                              <span className="text-[#D97736] font-semibold">{formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <select
                          value={statusDrafts[order._docId] ?? order.status ?? "pending"}
                          onChange={e => setStatusDrafts(prev => ({ ...prev, [order._docId]: e.target.value }))}
                          className="rounded-xl border border-[#D8D0C2] px-3 py-2 text-sm bg-white outline-none focus:border-[#D97736]"
                        >
                          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <button
                          onClick={() => handleUpdateStatus(order, statusDrafts[order._docId] ?? order.status ?? "pending")}
                          className="bg-[#D97736] hover:bg-[#C96626] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* REVENUE */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today",      value: revenue.day },
                { label: "This Week",  value: revenue.week },
                { label: "This Month", value: revenue.month },
                { label: "All Time",   value: revenue.total },
              ].map(r => (
                <div key={r.label} className="bg-white rounded-2xl p-6 border border-[#E0D8C8] shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5D4037] mb-1">{r.label}</p>
                    <p className="font-heading text-3xl font-bold text-[#D97736]">{formatPrice(r.value)}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-[#D97736] opacity-20" />
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8]">
              <h3 className="font-semibold text-[#3E2723] mb-4">Revenue by Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(orders.reduce((acc, o) => {
                  const m = o.paymentMethod || "cod";
                  acc[m] = (acc[m] || 0) + Number(o.total || 0);
                  return acc;
                }, {})).map(([method, total]) => (
                  <div key={method} className="rounded-xl border border-[#E0D8C8] p-4 text-center">
                    <p className="text-lg font-bold text-[#D97736]">{formatPrice(total)}</p>
                    <p className="text-xs text-[#5D4037] mt-1 capitalize">{method}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8] overflow-x-auto">
              <h3 className="font-semibold text-[#3E2723] mb-4">All Orders</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#E0D8C8]">
                    <th className="text-left py-2 px-3 text-[#3E2723]">Customer</th>
                    <th className="text-left py-2 px-3 text-[#3E2723]">Date</th>
                    <th className="text-left py-2 px-3 text-[#3E2723]">Payment</th>
                    <th className="text-left py-2 px-3 text-[#3E2723]">Status</th>
                    <th className="text-right py-2 px-3 text-[#3E2723]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._docId} className="border-b border-[#F0E7DA] hover:bg-[#FAF7F2]">
                      <td className="py-2 px-3 text-[#3E2723]">{o.userName || o.userEmail || "—"}</td>
                      <td className="py-2 px-3 text-[#5D4037]">{o.createdAt?.toDate?.()?.toLocaleDateString() || "—"}</td>
                      <td className="py-2 px-3 text-[#5D4037] capitalize">{o.paymentMethod || "cod"}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-700"}`}>
                          {(o.status || "pending").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-[#D97736]">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8]">
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-5 h-5 text-[#D97736]" />
              <h2 className="font-heading text-xl font-semibold text-[#3E2723]">Registered Users ({users.length})</h2>
            </div>
            {users.length === 0 ? (
              <p className="text-[#5D4037] text-center py-8">No users registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#E0D8C8]">
                      <th className="text-left py-2 px-3 text-[#3E2723]">Name</th>
                      <th className="text-left py-2 px-3 text-[#3E2723]">Email</th>
                      <th className="text-left py-2 px-3 text-[#3E2723]">Phone</th>
                      <th className="text-left py-2 px-3 text-[#3E2723]">Role</th>
                      <th className="text-left py-2 px-3 text-[#3E2723]">Provider</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} className="border-b border-[#F0E7DA] hover:bg-[#FAF7F2]">
                        <td className="py-2 px-3 font-medium text-[#3E2723]">{u.name || "—"}</td>
                        <td className="py-2 px-3 text-[#5D4037]">{u.email}</td>
                        <td className="py-2 px-3 text-[#5D4037]">{u.phone || "—"}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {u.role || "customer"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[#5D4037] capitalize">{u.provider || "email"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8]">
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-5 h-5 text-[#D97736]" />
              <h2 className="font-heading text-xl font-semibold text-[#3E2723]">Products ({products.length})</h2>
              <button onClick={() => navigate("/admin/panel")}
                className="ml-auto bg-[#D97736] hover:bg-[#C96626] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                Manage Products
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} className="rounded-xl border border-[#E0D8C8] overflow-hidden">
                  <img src={p.images?.[0]} alt={p.name} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#3E2723] line-clamp-1">{p.name}</p>
                    <p className="text-sm text-[#D97736] font-bold mt-1">{formatPrice(p.price)}</p>
                    <p className="text-xs text-[#5D4037]">{p.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOGS */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8]">
              <h2 className="font-heading text-xl font-semibold text-[#3E2723] mb-5">
                {editingBlog ? "Edit Blog" : "Add New Blog"}
              </h2>
              <form onSubmit={handleSaveBlog} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3E2723] mb-1">Title *</label>
                    <input value={blogForm.title} onChange={e => setBlogForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Blog title" required
                      className="w-full px-4 py-2.5 border-2 border-[#E0D8C8] rounded-xl text-sm focus:border-[#D97736] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3E2723] mb-1">Category</label>
                    <select value={blogForm.category} onChange={e => setBlogForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-[#E0D8C8] rounded-xl text-sm focus:border-[#D97736] focus:outline-none bg-white">
                      {["Beauty", "Skincare", "Wellness", "Health", "Nutrition", "Craftsmanship", "Cooking"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3E2723] mb-1">Emoji</label>
                    <input value={blogForm.emoji} onChange={e => setBlogForm(p => ({ ...p, emoji: e.target.value }))}
                      placeholder="✨" maxLength={2}
                      className="w-full px-4 py-2.5 border-2 border-[#E0D8C8] rounded-xl text-sm focus:border-[#D97736] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3E2723] mb-1">Short Excerpt</label>
                    <input value={blogForm.excerpt} onChange={e => setBlogForm(p => ({ ...p, excerpt: e.target.value }))}
                      placeholder="Brief description shown on card"
                      className="w-full px-4 py-2.5 border-2 border-[#E0D8C8] rounded-xl text-sm focus:border-[#D97736] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3E2723] mb-1">Content *</label>
                  <textarea value={blogForm.content} onChange={e => setBlogForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Write the full blog content here..." rows={8} required
                    className="w-full px-4 py-3 border-2 border-[#E0D8C8] rounded-xl text-sm focus:border-[#D97736] focus:outline-none resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="submit"
                    className="bg-[#D97736] hover:bg-[#C96626] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {editingBlog ? "Update Blog" : "Publish Blog"}
                  </button>
                  {editingBlog && (
                    <button type="button" onClick={() => { setEditingBlog(null); setBlogForm({ title: "", excerpt: "", category: "Beauty", content: "", emoji: "✨" }); }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E0D8C8]">
              <h3 className="font-semibold text-[#3E2723] mb-4">Published Blogs ({blogs.length})</h3>
              {blogs.length === 0 ? (
                <p className="text-[#5D4037] text-sm text-center py-6">No blogs yet. Add one above.</p>
              ) : (
                <div className="space-y-3">
                  {blogs.map(blog => (
                    <div key={blog._docId} className="flex items-start justify-between gap-4 rounded-xl border border-[#E0D8C8] p-4 hover:bg-[#FAF7F2]">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl shrink-0">{blog.emoji || "✨"}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#3E2723] text-sm line-clamp-1">{blog.title}</p>
                          <p className="text-xs text-[#5D4037] mt-0.5">{blog.category} · {blog.date} · {blog.readTime}</p>
                          <p className="text-xs text-[#8A7768] mt-1 line-clamp-1">{blog.excerpt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setEditingBlog(blog); setBlogForm({ title: blog.title, excerpt: blog.excerpt || "", category: blog.category, content: blog.content, emoji: blog.emoji || "✨" }); }}
                          className="p-2 bg-[#EFE9DF] text-[#D97736] rounded-lg hover:bg-[#D97736] hover:text-white transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBlog(blog._docId)}
                          className="p-2 bg-[#EFE9DF] text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
