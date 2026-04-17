const express = require("express");
const nodemailer = require("nodemailer");
// --- EMAIL CONFIG ---
// Brevo (Sendinblue) SMTP config
const EMAIL_FROM = process.env.BREVO_EMAIL_FROM || process.env.EMAIL_FROM || "your@domain.com";
const EMAIL_USER = process.env.BREVO_EMAIL_USER || process.env.BREVO_SMTP_USER || process.env.EMAIL_USER || "your@domain.com";
const EMAIL_PASS = process.env.BREVO_EMAIL_PASS || process.env.BREVO_SMTP_PASS || process.env.EMAIL_PASS || "your-brevo-smtp-password";
const EMAIL_HOST = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
const EMAIL_PORT = parseInt(process.env.BREVO_SMTP_PORT, 10) || 587;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const emailVerifications = new Map(); // email -> { token, expires }
const passwordResets = new Map(); // email -> { token, expires }

function sendVerificationEmail(email, token) {
  const url = `http://localhost:8001/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  return transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: "Verify your email",
    html: `<p>Click <a href='${url}'>here</a> to verify your email.</p>`
  });
}

function sendPasswordResetEmail(email, token) {
  const url = `http://localhost:8001/api/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  return transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href='${url}'>here</a> to reset your password.</p>`
  });
}
const cors = require("cors");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8001;
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return (
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
  );
};

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error("Origin not allowed"));
    },
    credentials: true,
  })
);

const users = new Map();
const usersByEmail = new Map();
const sessions = new Map();
const carts = new Map();
const orders = new Map();

const products = [
  {
    id: "prod-001",
    name: "Kesar Radiance Serum",
    description: "A luxurious saffron-infused serum for natural glow.",
    price: 1299,
    oldPrice: 1599,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600",
    ],
    category: "Serums",
    rating: 4.8,
    reviews: [{ user_name: "Priya", rating: 5, comment: "Amazing glow" }],
    variants: [{ name: "30ml" }, { name: "50ml" }],
    badge: "BESTSELLER",
    video: null,
  },
  {
    id: "prod-002",
    name: "Rose & Sandalwood Face Cream",
    description: "Deeply moisturizing cream for soft, supple skin.",
    price: 899,
    oldPrice: 1099,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600",
    ],
    category: "Moisturizers",
    rating: 4.7,
    reviews: [],
    variants: [{ name: "50g" }, { name: "100g" }],
    badge: "NEW",
    video: null,
  },
];

async function seedAdmin() {
  const email = "admin@kesarkosmetics.com";
  if (usersByEmail.has(email)) return;
  const id = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  const admin = {
    _id: id,
    name: "Admin",
    email,
    phone: "+91 9999999999",
    password: hashedPassword,
    role: "admin",
  };
  users.set(id, admin);
  usersByEmail.set(email, id);
}

function isTokenExpired(token) {
  const session = sessions.get(token);
  if (!session) return true;
  const expiryTime = session.createdAt + 24 * 60 * 60 * 1000; // 24 hours
  return Date.now() > expiryTime;
}

async function authUser(req) {
  const token = req.cookies.access_token;
  if (!token || !sessions.has(token)) return null;
  if (isTokenExpired(token)) {
    sessions.delete(token);
    return null;
  }
  const userId = sessions.get(token).userId;
  return users.get(userId) || null;
}

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

function getProduct(productId) {
  return products.find((p) => p.id === productId || p._id === productId) || null;
}

function getProductIndex(productId) {
  return products.findIndex((p) => p.id === productId || p._id === productId);
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeMediaValue(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function buildTrackingSteps(status) {
  const activeStatus = String(status || "pending").toLowerCase();
  const stepKeys = ["pending", "shipped", "in_transit", "delivered"];
  const activeIndex = Math.max(stepKeys.indexOf(activeStatus), 0);
  return [
    { key: "pending", label: "Order Placed", completed: activeIndex >= 0, active: activeIndex === 0 },
    { key: "shipped", label: "Shipped", completed: activeIndex >= 1, active: activeIndex === 1 },
    { key: "in_transit", label: "In Transit", completed: activeIndex >= 2, active: activeIndex === 2 },
    { key: "delivered", label: "Delivered", completed: activeIndex >= 3, active: activeIndex === 3 },
  ];
}

function enrichOrderForTracking(order) {
  const items = Array.isArray(order.items)
    ? order.items.map((item) => {
        const product = getProduct(item.product_id);
        return {
          ...item,
          product_name: item.product_name || product?.name || "Product",
          image: product?.images?.[0] || null,
        };
      })
    : [];

  return {
    ...order,
    items,
    tracking_steps: buildTrackingSteps(order.status),
  };
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  const allowed = new Set(["pending", "shipped", "in_transit", "delivered"]);
  return allowed.has(value) ? value : "pending";
}

app.get("/api", (req, res) => {
  res.json({ message: "Backend running" });
});

app.get("/api/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, phone, password } = req.body || {};
  const safeEmail = String(email || "").toLowerCase();
  if (!name || !safeEmail || !phone || !password) {
    return res.status(400).json({ detail: "Missing required fields" });
  }
  if (usersByEmail.has(safeEmail)) {
    return res.status(400).json({ detail: "Email already registered" });
  }

  const id = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { _id: id, name, email: safeEmail, phone, password: hashedPassword, role: "customer", emailVerified: false };
  users.set(id, user);
  usersByEmail.set(safeEmail, id);

  // Generate verification token
  const verifyToken = crypto.randomBytes(32).toString("hex");
  emailVerifications.set(safeEmail, { token: verifyToken, expires: Date.now() + 60 * 60 * 1000 });
  await sendVerificationEmail(safeEmail, verifyToken);

  return res.json({ message: "Registration successful. Please check your email to verify your account." });
});

app.get("/api/auth/verify-email", (req, res) => {
  const { email, token } = req.query;
  const safeEmail = String(email || "").toLowerCase();
  const entry = emailVerifications.get(safeEmail);
  if (!entry || entry.token !== token || entry.expires < Date.now()) {
    return res.status(400).send("Invalid or expired verification link.");
  }
  const userId = usersByEmail.get(safeEmail);
  if (!userId) return res.status(400).send("User not found.");
  const user = users.get(userId);
  if (!user) return res.status(400).send("User not found.");
  user.emailVerified = true;
  users.set(userId, user);
  emailVerifications.delete(safeEmail);
  return res.send("Email verified! You can now log in.");
});

app.post("/api/auth/request-password-reset", (req, res) => {
  const safeEmail = String(req.body?.email || "").toLowerCase();
  const userId = usersByEmail.get(safeEmail);
  if (!userId) return res.status(400).json({ detail: "Email not found" });
  const resetToken = crypto.randomBytes(32).toString("hex");
  passwordResets.set(safeEmail, { token: resetToken, expires: Date.now() + 60 * 60 * 1000 });
  sendPasswordResetEmail(safeEmail, resetToken)
    .then(() => res.json({ message: "Password reset email sent." }))
    .catch(() => res.status(500).json({ detail: "Failed to send email" }));
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body || {};
  const safeEmail = String(email || "").toLowerCase();
  const entry = passwordResets.get(safeEmail);
  if (!entry || entry.token !== token || entry.expires < Date.now()) {
    return res.status(400).json({ detail: "Invalid or expired reset link" });
  }
  const userId = usersByEmail.get(safeEmail);
  if (!userId) return res.status(400).json({ detail: "User not found" });
  const user = users.get(userId);
  if (!user) return res.status(400).json({ detail: "User not found" });
  user.password = await bcrypt.hash(newPassword, 10);
  users.set(userId, user);
  passwordResets.delete(safeEmail);
  return res.json({ message: "Password reset successful. You can now log in." });
});

app.post("/api/auth/login", async (req, res) => {
  const safeEmail = String(req.body?.email || "").toLowerCase();
  const password = String(req.body?.password || "");
  const userId = usersByEmail.get(safeEmail);
  if (!userId) return res.status(401).json({ detail: "Invalid credentials" });
  const user = users.get(userId);
  if (!user) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }
  if (!user.emailVerified) {
    return res.status(403).json({ detail: "Please verify your email before logging in." });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { userId, createdAt: Date.now() });
  res.cookie("access_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
  return res.json(publicUser(user));
});

app.get("/api/auth/me", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  return res.json(publicUser(user));
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies.access_token;
  if (token) sessions.delete(token);
  res.clearCookie("access_token", { path: "/" });
  return res.json({ message: "Logged out" });
});

app.get("/api/products", (req, res) => {
  const { category, search } = req.query;
  let out = [...products];
  if (category) out = out.filter((p) => p.category === String(category));
  if (search) {
    const q = String(search).toLowerCase();
    out = out.filter((p) => p.name.toLowerCase().includes(q));
  }
  return res.json(out);
});

app.get("/api/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) return res.status(404).json({ detail: "Product not found" });
  return res.json(product);
});

app.post("/api/products/:id/reviews", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });

  const product = getProduct(req.params.id);
  if (!product) return res.status(404).json({ detail: "Product not found" });

  const body = req.body || {};
  const rating = Number(body.rating);
  const comment = String(body.comment || "").trim();

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ detail: "Rating must be between 1 and 5" });
  }

  const nextReview = {
    user_name: user.name || "User",
    rating,
    comment,
  };

  const existingReviews = Array.isArray(product.reviews) ? product.reviews : [];
  product.reviews = [nextReview, ...existingReviews];

  const avgRating = product.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / product.reviews.length;
  product.rating = Number(avgRating.toFixed(1));

  return res.status(201).json({ message: "Review added", product });
});

app.post("/api/products", (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const price = Number(body.price || 0);
  const category = String(body.category || "General").trim() || "General";
  const video = normalizeMediaValue(body.video ?? body.videoUrl);
  
  // Handle multiple images (new format) or single image (backward compatibility)
  let images = [];
  if (Array.isArray(body.images) && body.images.length > 0) {
    // New format: multiple images array
    images = body.images.filter(img => typeof img === "string" && img.trim()).map(img => img.trim());
  } else if (typeof body.image === "string" && body.image.trim()) {
    // Old format: single image
    images = [body.image.trim()];
  }
  
  // Fallback to default image if none provided
  if (images.length === 0) {
    images = ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"];
  }

  if (!name || !description || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ detail: "Invalid product payload" });
  }

  const product = {
    id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    description,
    price,
    images,
    category,
    rating: Number(body.rating || 4.5),
    reviews: [],
    variants: Array.isArray(body.variants) && body.variants.length > 0 ? body.variants : [{ name: "Default" }],
    video,
  };

  products.push(product);
  return res.status(201).json(product);
});

app.put("/api/products/:id", (req, res) => {
  const index = getProductIndex(req.params.id);
  if (index < 0) return res.status(404).json({ detail: "Product not found" });

  const body = req.body || {};
  const existing = products[index];
  const nextName = body.name != null ? String(body.name).trim() : existing.name;
  const nextDescription = body.description != null ? String(body.description).trim() : existing.description;
  const nextPrice = body.price != null ? Number(body.price) : existing.price;
  const nextCategory = body.category != null ? String(body.category).trim() : existing.category;
  const hasVideoField = Object.prototype.hasOwnProperty.call(body, "video") || Object.prototype.hasOwnProperty.call(body, "videoUrl");
  const nextVideo = hasVideoField ? normalizeMediaValue(body.video ?? body.videoUrl) : existing.video ?? null;
  
  // Handle multiple images (new format) or single image (backward compatibility)
  let nextImages = existing.images;
  if (Array.isArray(body.images) && body.images.length > 0) {
    // New format: multiple images array
    nextImages = body.images.filter(img => typeof img === "string" && img.trim()).map(img => img.trim());
  } else if (typeof body.image === "string" && body.image.trim()) {
    // Old format: single image
    nextImages = [body.image.trim()];
  }
  
  // Fallback to default if no images
  if (!nextImages || nextImages.length === 0) {
    nextImages = ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"];
  }

  if (!nextName || !nextDescription || !Number.isFinite(nextPrice) || nextPrice <= 0) {
    return res.status(400).json({ detail: "Invalid product payload" });
  }

  products[index] = {
    ...existing,
    name: nextName,
    description: nextDescription,
    price: nextPrice,
    category: nextCategory || "General",
    images: nextImages,
    video: nextVideo,
  };

  return res.json(products[index]);
});

app.delete("/api/products/:id", (req, res) => {
  const index = getProductIndex(req.params.id);
  if (index < 0) return res.status(404).json({ detail: "Product not found" });

  const [deleted] = products.splice(index, 1);
  return res.json({ message: "Product deleted", product: deleted });
});

app.get("/api/categories", (req, res) => {
  const categories = [...new Set(products.map((p) => p.category))];
  return res.json(categories);
});

app.get("/api/cart", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  const items = carts.get(user._id) || [];
  let total = 0;
  const expanded = items
    .map((item) => {
      const product = getProduct(item.product_id);
      if (!product) return null;
      total += product.price * item.quantity;
      return { product, quantity: item.quantity, variant: item.variant || null };
    })
    .filter(Boolean);
  return res.json({ items: expanded, total });
});

app.post("/api/cart/add", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });

  const { product_id, quantity, variant } = req.body || {};
  const product = getProduct(product_id);
  if (!product) return res.status(404).json({ detail: "Product not found" });

  const userCart = carts.get(user._id) || [];
  const index = userCart.findIndex((it) => it.product_id === product_id && (it.variant || null) === (variant || null));
  if (index >= 0) {
    userCart[index].quantity += Number(quantity || 1);
  } else {
    userCart.push({ product_id, quantity: Number(quantity || 1), variant: variant || null });
  }
  carts.set(user._id, userCart);
  return res.json({ message: "Item added" });
});

app.post("/api/cart/update", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });

  const { product_id, quantity } = req.body || {};
  const userCart = carts.get(user._id) || [];
  const idx = userCart.findIndex((it) => it.product_id === product_id);
  if (idx < 0) return res.status(404).json({ detail: "Item not found" });

  if (Number(quantity) <= 0) userCart.splice(idx, 1);
  else userCart[idx].quantity = Number(quantity);
  carts.set(user._id, userCart);
  return res.json({ message: "Cart updated" });
});

app.delete("/api/cart/remove/:productId", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  const userCart = carts.get(user._id) || [];
  carts.set(user._id, userCart.filter((it) => it.product_id !== req.params.productId));
  return res.json({ message: "Item removed" });
});

app.delete("/api/cart/clear", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  carts.set(user._id, []);
  return res.json({ message: "Cart cleared" });
});

app.post("/api/orders", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  const body = req.body || {};
  const id = crypto.randomUUID();
  const order = {
    id,
    user_id: user._id,
    items: body.items || [],
    shipping_address: body.shipping_address || {},
    payment_method: body.payment_method || "cod",
    total: Number(body.total || 0),
    status: "pending",
    contact_email: user.email,
    contact_phone: body.shipping_address?.phone || user.phone || "",
    created_at: new Date().toISOString(),
  };
  orders.set(id, order);
  carts.set(user._id, []);
  return res.json(order);
});

app.get("/api/orders", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  const userOrders = [...orders.values()].filter((o) => o.user_id === user._id);
  return res.json(userOrders);
});

app.get("/api/admin/orders", (req, res) => {
  const allOrders = [...orders.values()]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((order) => enrichOrderForTracking(order));
  return res.json(allOrders);
});

app.put("/api/admin/orders/:orderId/status", (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ detail: "Order not found" });
  }

  const nextStatus = normalizeStatus(req.body?.status);
  order.status = nextStatus;
  orders.set(req.params.orderId, order);

  return res.json(enrichOrderForTracking(order));
});

app.get("/api/orders/:orderId([0-9a-fA-F-]{8,})", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  const order = orders.get(req.params.orderId);
  if (!order || order.user_id !== user._id) {
    return res.status(404).json({ detail: "Order not found" });
  }
  return res.json(order);
});

app.get("/api/orders/track/search", (req, res) => {
  const query = String(req.query.query || "").trim();
  if (!query) {
    return res.status(400).json({ detail: "query is required" });
  }

  const normalizedQuery = query.toLowerCase();
  const normalizedPhoneQuery = normalizePhone(query);

  const matchedOrders = [...orders.values()]
    .filter((order) => {
      const orderId = String(order.id || "").toLowerCase();
      const email = String(order.contact_email || "").toLowerCase();
      const phone = normalizePhone(order.contact_phone || order.shipping_address?.phone || "");

      return (
        orderId === normalizedQuery ||
        email === normalizedQuery ||
        (normalizedPhoneQuery.length >= 6 && phone.endsWith(normalizedPhoneQuery))
      );
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((order) => enrichOrderForTracking(order));

  return res.json(matchedOrders);
});

app.get("/api/orders/track/:orderId", (req, res) => {
  const orderId = String(req.params.orderId || "").trim();
  const contact = String(req.query.contact || "").trim();
  if (!orderId || !contact) {
    return res.status(400).json({ detail: "orderId and contact are required" });
  }

  const order = orders.get(orderId);
  if (!order) {
    return res.status(404).json({ detail: "Order not found" });
  }

  const normalizedContact = contact.toLowerCase();
  const normalizedContactPhone = normalizePhone(contact);
  const email = String(order.contact_email || "").toLowerCase();
  const phone = normalizePhone(order.contact_phone || order.shipping_address?.phone || "");
  const matches =
    email === normalizedContact ||
    (normalizedContactPhone.length >= 6 && phone.endsWith(normalizedContactPhone));

  if (!matches) {
    return res.status(403).json({ detail: "Contact does not match this order" });
  }

  return res.json(enrichOrderForTracking(order));
});

app.use((err, req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({ detail: "Uploaded images are too large. Please choose smaller files." });
  }
  if (err) {
    return res.status(500).json({ detail: "Server error while processing request." });
  }
  next();
});

seedAdmin().catch(err => console.error("Failed to seed admin:", err));
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
