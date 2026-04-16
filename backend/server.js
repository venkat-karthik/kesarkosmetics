const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 8001);
const isProduction = process.env.NODE_ENV === "production";
const shouldServeFrontendBuild =
  isProduction || String(process.env.SERVE_FRONTEND_BUILD || "").toLowerCase() === "true";
const razKeyId = process.env.RAZORPAY_KEY_ID || "";
const razKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
const razWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || "";
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;
const razorpay = razKeyId && razKeySecret ? new Razorpay({ key_id: razKeyId, key_secret: razKeySecret }) : null;
const normalizeOrigin = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};
const corsOriginsFromEnv = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => normalizeOrigin(value))
  .filter(Boolean);
const allowedFrontendOrigins = new Set(
  [
    normalizeOrigin(process.env.FRONTEND_URL),
    normalizeOrigin(process.env.VERCEL_URL),
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    ...corsOriginsFromEnv,
  ].filter(Boolean)
);
const cookieSameSite = (process.env.COOKIE_SAMESITE || (isProduction ? "none" : "lax")).toLowerCase();
const cookieSecure =
  typeof process.env.COOKIE_SECURE === "string"
    ? process.env.COOKIE_SECURE.toLowerCase() === "true"
    : cookieSameSite === "none";
const authCookieOptions = {
  httpOnly: true,
  sameSite: cookieSameSite,
  secure: cookieSecure,
  path: "/",
};
const frontendBuildPath = path.resolve(__dirname, "../frontend/build");
const hasFrontendBuild = shouldServeFrontendBuild && fs.existsSync(path.join(frontendBuildPath, "index.html"));
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedFrontendOrigins.has(origin)) return true;
  return (
    /^https:\/\/.*\.vercel\.app$/.test(origin) ||
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
  );
};

app.use(express.json({
  limit: "200mb",
  verify: (req, res, buf) => {
    req.rawBody = Buffer.from(buf || []);
  },
}));
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

app.get("/", (req, res) => {
  if (hasFrontendBuild) {
    return res.sendFile(path.join(frontendBuildPath, "index.html"));
  }
  return res.status(200).json({ status: "ok", service: "app-backend" });
});

if (hasFrontendBuild) {
  app.use(express.static(frontendBuildPath));

  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    return res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

const users = new Map();
const usersByEmail = new Map();
const sessions = new Map();
const carts = new Map();
const orders = new Map();
const passwordResetCodes = new Map();
const emailVerificationCodes = new Map();

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
    email_verified: true,
  };
  await saveUserToStore(admin);
}

function isTokenExpired(token) {
  const session = sessions.get(token);
  if (!session) return true;
  const expiryTime = session.createdAt + 24 * 60 * 60 * 1000; // 24 hours
  return Date.now() > expiryTime;
}

function authUser(req) {
  const token = req.cookies.access_token;
  if (!token || !sessions.has(token)) return null;
  if (isTokenExpired(token)) {
    sessions.delete(token);
    return null;
  }
  return sessions.get(token).user || null;
}

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

function normalizeUserRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    email: String(row.email || "").toLowerCase(),
    phone: row.phone || "",
    password: row.password || "",
    role: row.role || "customer",
    email_verified: Boolean(row.email_verified),
    email_verification_code_hash: row.email_verification_code_hash || null,
    email_verification_expires_at: row.email_verification_expires_at || null,
  };
}

function normalizeOrderRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    items: Array.isArray(row.items) ? row.items : [],
    shipping_address: row.shipping_address || {},
    payment_method: row.payment_method || "cod",
    total: Number(row.total || 0),
    status: row.status || "pending",
    contact_email: row.contact_email || "",
    contact_registered_email: row.contact_registered_email || "",
    contact_phone: row.contact_phone || "",
    contact_registered_phone: row.contact_registered_phone || "",
    payment_status: row.payment_status || "created",
    razorpay_order_id: row.razorpay_order_id || null,
    razorpay_payment_id: row.razorpay_payment_id || null,
    razorpay_signature: row.razorpay_signature || null,
    payment_gateway: row.payment_gateway || null,
    currency: row.currency || "INR",
    amount_paise: Number(row.amount_paise || 0),
    created_at: row.created_at || new Date().toISOString(),
  };
}

async function loadSupabaseState() {
  if (!supabase) return;

  const [usersResult, ordersResult] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: true }),
  ]);

  if (!usersResult.error && Array.isArray(usersResult.data)) {
    users.clear();
    usersByEmail.clear();
    for (const row of usersResult.data) {
      const user = normalizeUserRow(row);
      if (!user) continue;
      users.set(user._id, user);
      usersByEmail.set(user.email, user._id);
    }
  }

  if (!ordersResult.error && Array.isArray(ordersResult.data)) {
    orders.clear();
    for (const row of ordersResult.data) {
      const order = normalizeOrderRow(row);
      if (!order) continue;
      orders.set(order.id, order);
    }
  }
}

async function saveUserToStore(user) {
  users.set(user._id, user);
  usersByEmail.set(String(user.email || "").toLowerCase(), user._id);

  if (!supabase) return user;

  const { error } = await supabase.from("users").upsert(
    {
      id: user._id,
      name: user.name,
      email: String(user.email || "").toLowerCase(),
      phone: user.phone || "",
      password: user.password,
      role: user.role || "customer",
      email_verified: Boolean(user.email_verified),
      email_verification_code_hash: user.email_verification_code_hash || null,
      email_verification_expires_at: user.email_verification_expires_at || null,
      created_at: user.created_at || new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }

  return user;
}

async function saveOrderToStore(order) {
  orders.set(order.id, order);

  if (!supabase) return order;

  const { error } = await supabase.from("orders").upsert(
    {
      id: order.id,
      user_id: order.user_id,
      items: order.items,
      shipping_address: order.shipping_address,
      payment_method: order.payment_method,
      total: order.total,
      status: order.status,
      contact_email: order.contact_email,
      contact_registered_email: order.contact_registered_email,
      contact_phone: order.contact_phone,
      contact_registered_phone: order.contact_registered_phone,
      payment_status: order.payment_status || "created",
      razorpay_order_id: order.razorpay_order_id || null,
      razorpay_payment_id: order.razorpay_payment_id || null,
      razorpay_signature: order.razorpay_signature || null,
      payment_gateway: order.payment_gateway || null,
      currency: order.currency || "INR",
      amount_paise: Number(order.amount_paise || 0),
      created_at: order.created_at,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }

  return order;
}

async function updateOrderInStore(orderId, patch) {
  const existing = orders.get(orderId);
  if (!existing) return null;
  const nextOrder = { ...existing, ...patch };
  orders.set(orderId, nextOrder);

  if (!supabase) return nextOrder;

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) {
    throw error;
  }

  return nextOrder;
}

function getOrderByRazorpayOrderId(razorpayOrderId) {
  for (const order of orders.values()) {
    if (order.razorpay_order_id === razorpayOrderId) return order;
  }
  return null;
}

function verifyRazorpaySignature(rawBodyBuffer, signature) {
  if (!razWebhookSecret || !rawBodyBuffer || !signature) return false;
  const digest = crypto.createHmac("sha256", razWebhookSecret).update(rawBodyBuffer).digest("hex");
  return digest === signature;
}

async function sendOrderNotificationEmail(order, subject, html, text) {
  const email = order.contact_email || order.contact_registered_email;
  if (!email) return;
  try {
    await sendEmail(email, subject, text, html);
    console.log(`[order-email:success] Sent to ${email}: ${subject}`);
  } catch (error) {
    console.error(`[order-email:error] Failed to send to ${email}:`, error.message);
  }
}

async function sendEmail(to, subject, text, html) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user || "no-reply@kesarkosmetics.com";

  if (!host || !user || !pass) {
    console.log(`[email:fallback] to=${to} subject=${subject}`);
    console.warn(`[SMTP Config Missing] Host: ${!host}, User: ${!user}, Pass: ${!pass}`);
    return { delivered: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({ from, to, subject, text, html });
    console.log(`[email:success] Email sent to ${to} - ${subject}`);
    return { delivered: true };
  } catch (err) {
    console.error(`[email:error] Failed to send email to ${to}:`, err.message);
    throw err;
  }
}

function buildOrderSummary(order) {
  const itemLines = Array.isArray(order.items)
    ? order.items
        .map((item) => `${item.product_name || "Product"} x ${item.quantity || 1}`)
        .join(", ")
    : "";
  return `Order ${order.id} - ${itemLines || "No items"} - Total ${formatMoney(Number(order.total || 0))}`;
}

async function sendOrderCreatedEmail(order) {
  await sendOrderNotificationEmail(
    order,
    "Your order has been received",
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #3E2723;"><h2>Order received</h2><p>We received your order and are preparing it now.</p><p><strong>Order ID:</strong> ${order.id}</p><p><strong>Total:</strong> ${formatMoney(Number(order.total || 0))}</p><p><strong>Status:</strong> ${order.status}</p></div>`,
    `We received your order ${order.id}. Total: ${formatMoney(Number(order.total || 0))}. Status: ${order.status}.`
  );
}

async function sendOrderPaidEmail(order) {
  await sendOrderNotificationEmail(
    order,
    "Payment verified successfully",
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #3E2723;"><h2>Payment confirmed</h2><p>Your Razorpay payment was verified successfully.</p><p><strong>Order ID:</strong> ${order.id}</p><p><strong>Payment ID:</strong> ${order.razorpay_payment_id || "N/A"}</p><p><strong>Status:</strong> ${order.status}</p></div>`,
    `Your Razorpay payment for order ${order.id} was verified successfully.`
  );
}

async function sendOrderStatusEmail(order) {
  await sendOrderNotificationEmail(
    order,
    `Your order status changed to ${order.status}`,
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #3E2723;"><h2>Order status updated</h2><p>Your order status changed to <strong>${order.status}</strong>.</p><p><strong>Order ID:</strong> ${order.id}</p></div>`,
    `Your order ${order.id} status changed to ${order.status}.`
  );
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

function formatMoney(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function hashResetCode(email, code) {
  return crypto
    .createHash("sha256")
    .update(`${String(email || "").toLowerCase()}:${String(code || "")}`)
    .digest("hex");
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateVerificationCode() {
  return generateResetCode();
}

function clearUserSessions(userId) {
  for (const [token, session] of sessions.entries()) {
    if (session?.userId === userId || session?.user?._id === userId || session?.user?.id === userId) {
      sessions.delete(token);
    }
  }
}

async function sendResetCodeEmail(email, code) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user || "no-reply@kesarkosmetics.com";

  if (!host || !user || !pass) {
    console.log(`[reset-code:fallback] ${email} -> ${code}`);
    console.warn(`[SMTP Config Missing] Host: ${!host}, User: ${!user}, Pass: ${!pass}`);
    return { delivered: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: "Your Kesar Kosmetics password reset code",
      text: `Use this verification code to reset your password: ${code}. This code expires in 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #3E2723;"><h2>Password Reset Code</h2><p>Use this verification code to reset your password:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #D97736;">${code}</p><p>This code expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p></div>`,
    });

    console.log(`[reset-code:success] Email sent to ${email}`);
    return { delivered: true };
  } catch (err) {
    console.error(`[reset-code:error] Failed to send email to ${email}:`, err.message);
    throw err;
  }
}

async function sendVerificationEmail(email, code) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user || "no-reply@kesarkosmetics.com";

  if (!host || !user || !pass) {
    console.log(`[email-verify:fallback] ${email} -> ${code}`);
    console.warn(`[SMTP Config Missing] Host: ${!host}, User: ${!user}, Pass: ${!pass}`);
    return { delivered: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your Kesar Kosmetics email",
      text: `Use this verification code to activate your account: ${code}. This code expires in 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #3E2723;"><h2>Email Verification Code</h2><p>Use this verification code to activate your account:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #D97736;">${code}</p><p>This code expires in 10 minutes.</p></div>`,
    });

    console.log(`[email-verify:success] Verification email sent to ${email}`);
    return { delivered: true };
  } catch (err) {
    console.error(`[email-verify:error] Failed to send verification email to ${email}:`, err.message);
    throw err;
  }
}

function buildTrackingSteps(status) {
  const activeStatus = String(status || "pending").toLowerCase();
  const stepKeys = ["pending", "shipped", "in_transit", "delivered"];

  let normalizedTrackingStatus = activeStatus;
  if (activeStatus === "confirmed" || activeStatus === "processing") {
    normalizedTrackingStatus = "pending";
  }
  if (activeStatus === "out_for_delivery") {
    normalizedTrackingStatus = "in_transit";
  }
  if (activeStatus === "cancelled") {
    normalizedTrackingStatus = "pending";
  }

  const activeIndex = Math.max(stepKeys.indexOf(normalizedTrackingStatus), 0);
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
  const allowed = new Set([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "in_transit",
    "delivered",
    "cancelled",
  ]);
  return allowed.has(value) ? value : "pending";
}

function getOrderContactCandidates(order) {
  const owner = users.get(order.user_id);
  const orderEmail = String(order.contact_email || "").toLowerCase();
  const orderPhone = normalizePhone(order.contact_phone || order.shipping_address?.phone || "");
  const registeredEmail = String(order.contact_registered_email || owner?.email || "").toLowerCase();
  const registeredPhone = normalizePhone(order.contact_registered_phone || owner?.phone || "");

  return {
    emails: [...new Set([orderEmail, registeredEmail].filter(Boolean))],
    phones: [...new Set([orderPhone, registeredPhone].filter(Boolean))],
  };
}

function matchesPhoneQuery(phone, queryDigits) {
  if (!phone || !queryDigits || queryDigits.length < 6) return false;
  return (
    phone === queryDigits ||
    phone.endsWith(queryDigits) ||
    queryDigits.endsWith(phone) ||
    phone.includes(queryDigits)
  );
}

function getMatchingUserIdsByQuery(rawQuery) {
  const normalizedQuery = String(rawQuery || "").trim().toLowerCase();
  const normalizedPhoneQuery = normalizePhone(rawQuery);
  const matched = new Set();

  for (const user of users.values()) {
    const userEmail = String(user.email || "").toLowerCase();
    const userPhone = normalizePhone(user.phone || "");

    if (normalizedQuery && userEmail === normalizedQuery) {
      matched.add(user._id);
      continue;
    }

    if (matchesPhoneQuery(userPhone, normalizedPhoneQuery)) {
      matched.add(user._id);
    }
  }

  return matched;
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

  const existingUserId = usersByEmail.get(safeEmail);
  if (existingUserId) {
    const existingUser = users.get(existingUserId);
    
    // If email is already verified, ask user to login
    if (existingUser && existingUser.email_verified) {
      return res.status(400).json({ 
        detail: "Email already registered and verified. Please login instead.",
        alreadyVerified: true 
      });
    }
    
    // If email exists but not verified, resend verification code
    if (existingUser && !existingUser.email_verified) {
      const code = generateVerificationCode();
      existingUser.email_verification_code_hash = hashResetCode(safeEmail, code);
      existingUser.email_verification_expires_at = Date.now() + 10 * 60 * 1000;
      await saveUserToStore(existingUser);
      
      try {
        await sendVerificationEmail(safeEmail, code);
      } catch (err) {
        console.error("Failed to resend verification email:", err);
        return res.status(500).json({ detail: "Failed to send verification code" });
      }
      
      return res.status(200).json({
        message: "New verification code sent to your email",
        email: safeEmail,
        requires_verification: true,
        isResend: true,
      });
    }
  }

  const id = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);
  const code = generateVerificationCode();
  const user = {
    _id: id,
    name,
    email: safeEmail,
    phone,
    password: hashedPassword,
    role: "customer",
    email_verified: false,
    email_verification_code_hash: hashResetCode(safeEmail, code),
    email_verification_expires_at: Date.now() + 10 * 60 * 1000,
  };
  await saveUserToStore(user);

  try {
    await sendVerificationEmail(safeEmail, code);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return res.status(500).json({ detail: "Failed to send verification code" });
  }

  return res.status(201).json({
    message: "Verification code sent to your email",
    email: safeEmail,
    requires_verification: true,
  });
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
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }

  if (!user.email_verified) {
    return res.status(403).json({ detail: "Email not verified. Please verify your email first." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { user: publicUser(user), createdAt: Date.now() });
  res.cookie("access_token", token, authCookieOptions);
  return res.json(publicUser(user));
});

app.post("/api/auth/register/resend-code", async (req, res) => {
  const safeEmail = String(req.body?.email || "").trim().toLowerCase();
  if (!safeEmail) {
    return res.status(400).json({ detail: "Email is required" });
  }

  const userId = usersByEmail.get(safeEmail);
  const user = userId ? users.get(userId) : null;
  if (!user) {
    return res.status(404).json({ detail: "Account not found" });
  }

  if (user.email_verified) {
    return res.status(400).json({ detail: "Email is already verified" });
  }

  const code = generateVerificationCode();
  user.email_verification_code_hash = hashResetCode(safeEmail, code);
  user.email_verification_expires_at = Date.now() + 10 * 60 * 1000;
  await saveUserToStore(user);

  try {
    await sendVerificationEmail(safeEmail, code);
  } catch (err) {
    console.error("Failed to resend verification email:", err);
    return res.status(500).json({ detail: "Failed to send verification code" });
  }

  return res.json({ message: "Verification code sent to your email" });
});

app.post("/api/auth/register/verify-code", async (req, res) => {
  const safeEmail = String(req.body?.email || "").trim().toLowerCase();
  const code = String(req.body?.code || "").trim();

  if (!safeEmail || !code) {
    return res.status(400).json({ detail: "Email and verification code are required" });
  }

  const userId = usersByEmail.get(safeEmail);
  const user = userId ? users.get(userId) : null;
  if (!user) {
    return res.status(404).json({ detail: "Account not found" });
  }

  if (user.email_verified) {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { user: publicUser(user), createdAt: Date.now() });
    res.cookie("access_token", token, authCookieOptions);
    return res.json(publicUser(user));
  }

  if (!user.email_verification_code_hash || Date.now() > Number(user.email_verification_expires_at || 0)) {
    return res.status(400).json({ detail: "Verification code has expired. Please resend the code." });
  }

  const expectedHash = hashResetCode(safeEmail, code);
  if (expectedHash !== user.email_verification_code_hash) {
    return res.status(400).json({ detail: "Invalid verification code" });
  }

  user.email_verified = true;
  user.email_verification_code_hash = null;
  user.email_verification_expires_at = null;
  await saveUserToStore(user);

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { user: publicUser(user), createdAt: Date.now() });
  res.cookie("access_token", token, authCookieOptions);
  return res.json(publicUser(user));
});

app.post("/api/auth/forgot-password/send-code", async (req, res) => {
  const safeEmail = String(req.body?.email || "").trim().toLowerCase();
  if (!safeEmail) {
    return res.status(400).json({ detail: "Email is required" });
  }

  const userId = usersByEmail.get(safeEmail);
  if (!userId) {
    return res.json({ message: "If this email is registered, a verification code has been sent." });
  }

  const code = generateResetCode();
  passwordResetCodes.set(safeEmail, {
    codeHash: hashResetCode(safeEmail, code),
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  try {
    const emailResult = await sendResetCodeEmail(safeEmail, code);
    if (!emailResult.delivered) {
      console.warn(`[forgot-password] Email not delivered for ${safeEmail}, but code stored`);
    }
  } catch (err) {
    console.error("Failed to send reset code email:", err.message);
    return res.status(500).json({ detail: "Failed to send verification code. Please check your email configuration or try again later." });
  }

  return res.json({ message: "If this email is registered, a verification code has been sent." });
});

app.post("/api/auth/forgot-password/reset", async (req, res) => {
  const safeEmail = String(req.body?.email || "").trim().toLowerCase();
  const code = String(req.body?.code || "").trim();
  const newPassword = String(req.body?.new_password || "");
  const confirmPassword = String(req.body?.confirm_password || "");

  if (!safeEmail || !code || !newPassword || !confirmPassword) {
    return res.status(400).json({ detail: "Email, code, new password and confirm password are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ detail: "New password and confirm password do not match" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ detail: "Password must be at least 6 characters" });
  }

  const userId = usersByEmail.get(safeEmail);
  const user = userId ? users.get(userId) : null;
  const resetEntry = passwordResetCodes.get(safeEmail);
  if (!user || !resetEntry) {
    return res.status(400).json({ detail: "Invalid or expired verification code" });
  }

  if (Date.now() > resetEntry.expiresAt) {
    passwordResetCodes.delete(safeEmail);
    return res.status(400).json({ detail: "Verification code has expired" });
  }

  if (resetEntry.attempts >= 5) {
    passwordResetCodes.delete(safeEmail);
    return res.status(400).json({ detail: "Too many invalid attempts. Request a new code." });
  }

  const expectedHash = hashResetCode(safeEmail, code);
  if (expectedHash !== resetEntry.codeHash) {
    resetEntry.attempts += 1;
    passwordResetCodes.set(safeEmail, resetEntry);
    return res.status(400).json({ detail: "Invalid verification code" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await saveUserToStore(user);
  passwordResetCodes.delete(safeEmail);
  clearUserSessions(user._id);

  return res.json({ message: "Password reset successful" });
});

app.get("/api/auth/me", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  return res.json(publicUser(user));
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies.access_token;
  if (token) sessions.delete(token);
  res.clearCookie("access_token", authCookieOptions);
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

app.post("/api/orders", async (req, res) => {
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
    contact_registered_email: user.email,
    contact_phone: body.shipping_address?.phone || user.phone || "",
    contact_registered_phone: user.phone || "",
    created_at: new Date().toISOString(),
  };
  await saveOrderToStore(order);
  carts.set(user._id, []);
  await sendOrderCreatedEmail(order);
  return res.json(order);
});

app.post("/api/payments/razorpay/create-order", async (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });
  if (!razorpay) {
    return res.status(500).json({ detail: "Razorpay is not configured on the server" });
  }

  const body = req.body || {};
  const total = Number(body.total || 0);
  if (!Number.isFinite(total) || total <= 0) {
    return res.status(400).json({ detail: "Invalid order total" });
  }

  const id = crypto.randomUUID();
  const amountPaise = Math.round(total * 100);
  const currency = String(body.currency || "INR").toUpperCase();
  const razorpayOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency,
    receipt: id,
    payment_capture: 1,
    notes: {
      app_order_id: id,
      user_id: user._id,
      email: user.email,
    },
  });

  const order = {
    id,
    user_id: user._id,
    items: body.items || [],
    shipping_address: body.shipping_address || {},
    payment_method: "razorpay",
    total,
    status: "pending",
    payment_status: "created",
    payment_gateway: "razorpay",
    razorpay_order_id: razorpayOrder.id,
    razorpay_payment_id: null,
    razorpay_signature: null,
    currency,
    amount_paise: amountPaise,
    contact_email: user.email,
    contact_registered_email: user.email,
    contact_phone: body.shipping_address?.phone || user.phone || "",
    contact_registered_phone: user.phone || "",
    created_at: new Date().toISOString(),
  };

  await saveOrderToStore(order);
  await sendOrderCreatedEmail(order);

  return res.status(201).json({
    order,
    razorpay: {
      key_id: razKeyId,
      order_id: razorpayOrder.id,
      amount: amountPaise,
      currency,
    },
  });
});

async function finalizeRazorpayPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentStatus }) {
  const order = getOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    return null;
  }

  const nextOrder = await updateOrderInStore(order.id, {
    payment_status: paymentStatus,
    status: paymentStatus === "captured" ? "confirmed" : order.status,
    razorpay_payment_id: razorpayPaymentId || order.razorpay_payment_id || null,
    razorpay_signature: razorpaySignature || order.razorpay_signature || null,
  });

  if (paymentStatus === "captured") {
    carts.set(order.user_id, []);
    await sendOrderPaidEmail(nextOrder);
  }

  return nextOrder;
}

app.post("/api/payments/razorpay/verify", async (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ detail: "Not authenticated" });

  const razorpayOrderId = String(req.body?.razorpay_order_id || "").trim();
  const razorpayPaymentId = String(req.body?.razorpay_payment_id || "").trim();
  const razorpaySignature = String(req.body?.razorpay_signature || "").trim();

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ detail: "Missing Razorpay verification fields" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", razKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ detail: "Invalid Razorpay signature" });
  }

  const order = getOrderByRazorpayOrderId(razorpayOrderId);
  if (!order || order.user_id !== user._id) {
    return res.status(404).json({ detail: "Order not found" });
  }

  const updatedOrder = await finalizeRazorpayPayment({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentStatus: "captured",
  });

  return res.json(enrichOrderForTracking(updatedOrder));
});

app.post("/api/payments/razorpay/webhook", async (req, res) => {
  const signature = String(req.headers["x-razorpay-signature"] || "").trim();
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));

  if (!verifyRazorpaySignature(rawBody, signature)) {
    return res.status(400).json({ detail: "Invalid webhook signature" });
  }

  const payload = typeof req.body === "object" && req.body ? req.body : JSON.parse(rawBody.toString("utf8") || "{}");
  const eventType = String(payload.event || "");
  const paymentEntity = payload?.payload?.payment?.entity || {};
  const razorpayOrderId = String(paymentEntity.order_id || payload?.payload?.order?.entity?.id || "").trim();

  if (!razorpayOrderId) {
    return res.json({ received: true });
  }

  if (eventType === "payment.captured") {
    const updatedOrder = await finalizeRazorpayPayment({
      razorpayOrderId,
      razorpayPaymentId: paymentEntity.id,
      razorpaySignature: signature,
      paymentStatus: "captured",
    });
    if (updatedOrder) {
      return res.json({ received: true });
    }
  }

  if (eventType === "payment.failed") {
    const existingOrder = getOrderByRazorpayOrderId(razorpayOrderId);
    if (existingOrder) {
      await updateOrderInStore(existingOrder.id, {
        payment_status: "failed",
        status: "payment_failed",
        razorpay_payment_id: paymentEntity.id || existingOrder.razorpay_payment_id || null,
        razorpay_signature: signature,
      });
      await sendOrderStatusEmail({ ...existingOrder, payment_status: "failed", status: "payment_failed" });
    }
  }

  return res.json({ received: true });
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

app.put("/api/admin/orders/:orderId/status", async (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ detail: "Order not found" });
  }

  const nextStatus = normalizeStatus(req.body?.status);
  const updatedOrder = await updateOrderInStore(req.params.orderId, { status: nextStatus });
  if (updatedOrder) {
    await sendOrderStatusEmail(updatedOrder);
  }

  return res.json(enrichOrderForTracking({ ...order, status: nextStatus }));
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
  const matchedUserIds = getMatchingUserIdsByQuery(query);

  const matchedOrders = [...orders.values()]
    .filter((order) => {
      const orderId = String(order.id || "").toLowerCase();
      const { emails, phones } = getOrderContactCandidates(order);
      const emailMatch = emails.some((email) => email === normalizedQuery);
      const phoneMatch = phones.some((phone) => matchesPhoneQuery(phone, normalizedPhoneQuery));
      const userMatch = matchedUserIds.has(order.user_id);

      return orderId === normalizedQuery || emailMatch || phoneMatch || userMatch;
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
  const { emails, phones } = getOrderContactCandidates(order);
  const matches =
    emails.some((email) => email === normalizedContact) ||
    phones.some((phone) => matchesPhoneQuery(phone, normalizedContactPhone));

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

async function startServer() {
  try {
    await loadSupabaseState();
    await seedAdmin();
  } catch (err) {
    console.error("Failed to initialize backend state:", err);
  }

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

startServer();
