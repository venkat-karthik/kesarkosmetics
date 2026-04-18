const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 8001);
const isProduction = process.env.NODE_ENV === "production";
const shouldServeFrontendBuild =
  isProduction || String(process.env.SERVE_FRONTEND_BUILD || "").toLowerCase() === "true";
const razKeyId = process.env.RAZORPAY_KEY_ID || "";
const razKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
const razWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
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
const orders = new Map();

// Firebase UID passed in request body/headers
function authUserOrFirebase(req) {
  const uid = req.body?.user_id || req.headers["x-user-id"];
  const email = String(req.body?.user_email || req.headers["x-user-email"] || "").toLowerCase();
  const name = req.body?.user_name || "User";
  const phone = req.body?.user_phone || "";

  if (!uid) return null;

  return { _id: uid, email, name, phone, role: "customer" };
}

function normalizeUserRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    email: String(row.email || "").toLowerCase(),
    phone: row.phone || "",
    role: row.role || "customer",
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

// In-memory store — orders persist in memory while server is running.
// For full persistence, integrate Firebase Admin SDK.
async function loadSupabaseState() {
  // No-op: Supabase removed. Orders are stored in Firestore by the frontend.
}

async function saveUserToStore(user) {
  users.set(user._id, user);
  usersByEmail.set(String(user.email || "").toLowerCase(), user._id);
  return user;
}

async function saveOrderToStore(order) {
  orders.set(order.id, order);
  return order;
}

async function updateOrderInStore(orderId, patch) {
  const existing = orders.get(orderId);
  if (!existing) return null;
  const nextOrder = { ...existing, ...patch };
  orders.set(orderId, nextOrder);
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

function getSmtpConfig() {
  const host =
    process.env.SMTP_HOST ||
    process.env.SMTP_SERVER ||
    process.env.MAIL_HOST ||
    process.env.EMAIL_HOST ||
    "";
  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || process.env.EMAIL_PORT || 587);
  const user =
    process.env.SMTP_USER ||
    process.env.SMTP_USERNAME ||
    process.env.MAIL_USER ||
    process.env.MAIL_USERNAME ||
    process.env.EMAIL_USER ||
    "";
  const pass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.MAIL_PASS ||
    process.env.MAIL_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    "";
  const from = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.EMAIL_FROM || user || "no-reply@kesarkosmetics.com";
  const secureOverride = String(process.env.SMTP_SECURE || "").trim().toLowerCase();
  const secure =
    secureOverride === "true"
      ? true
      : secureOverride === "false"
        ? false
        : port === 465;

  return {
    host,
    port,
    user,
    pass,
    from,
    secure,
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15000),
  };
}

function getSmtpErrorDetail(err) {
  const code = String(err?.code || "").toUpperCase();
  const message = String(err?.message || "SMTP error");

  if (code === "EAUTH") {
    return "SMTP authentication failed. Use your real email in SMTP_USER and an App Password in SMTP_PASS.";
  }
  if (code === "ETIMEDOUT" || code === "ESOCKET") {
    return "SMTP connection timed out. Verify SMTP_HOST/SMTP_PORT and firewall/network rules.";
  }
  if (message.toLowerCase().includes("certificate") || message.toLowerCase().includes("ssl")) {
    return "SMTP TLS/SSL mismatch. Use SMTP_PORT=587 with SMTP_SECURE=false (or 465 with SMTP_SECURE=true).";
  }

  return `SMTP delivery failed: ${message}`;
}

function createSmtpTransporter(smtp) {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
    connectionTimeout: smtp.connectionTimeout,
    greetingTimeout: smtp.greetingTimeout,
    socketTimeout: smtp.socketTimeout,
  });
}

async function sendEmail(to, subject, text, html) {
  const smtp = getSmtpConfig();

  if (!smtp.host || !smtp.user || !smtp.pass) {
    console.log(`[email:fallback] to=${to} subject=${subject}`);
    console.warn(`[SMTP Config Missing] Host: ${!smtp.host}, User: ${!smtp.user}, Pass: ${!smtp.pass}`);
    return { delivered: false };
  }

  try {
    const transporter = createSmtpTransporter(smtp);

    await transporter.sendMail({ from: smtp.from, to, subject, text, html });
    console.log(`[email:success] Email sent to ${to} - ${subject}`);
    return { delivered: true };
  } catch (err) {
    console.error(`[email:error] Failed to send email to ${to}:`, err.message);
    throw err;
  }
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

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatMoney(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

// Legacy auth helpers removed — frontend uses Firebase auth

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

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ detail: "Name, email and message are required" });
  }
  try {
    await sendEmail(
      "kesarkosmetics@gmail.com",
      subject || `Contact Form: ${name}`,
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\n\nMessage:\n${message}`,
      `<div style="font-family:Arial,sans-serif;color:#3E2723;line-height:1.6">
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br/>")}</p>
      </div>`
    );
    return res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact email error:", err.message);
    return res.status(500).json({ detail: "Failed to send message. Please try emailing us directly." });
  }
});

app.post("/api/orders", async (req, res) => {
  const user = authUserOrFirebase(req);
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
  await sendOrderCreatedEmail(order);
  return res.json(order);
});

app.post("/api/payments/razorpay/create-order", async (req, res) => {
  const user = authUserOrFirebase(req);
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
    await sendOrderPaidEmail(nextOrder);
  }

  return nextOrder;
}

app.post("/api/payments/razorpay/verify", async (req, res) => {
  const user = authUserOrFirebase(req);
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
  const user = authUserOrFirebase(req);
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
  const user = authUserOrFirebase(req);
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
  if (!orderId) {
    return res.status(400).json({ detail: "orderId is required" });
  }

  const order = orders.get(orderId);
  if (!order) {
    return res.status(404).json({ detail: "Order not found" });
  }

  // If contact provided, validate it — otherwise allow open access (Firestore is source of truth)
  if (contact && contact !== "bypass") {
    const normalizedContact = contact.toLowerCase();
    const normalizedContactPhone = normalizePhone(contact);
    const { emails, phones } = getOrderContactCandidates(order);
    const matches =
      emails.some((email) => email === normalizedContact) ||
      phones.some((phone) => matchesPhoneQuery(phone, normalizedContactPhone));
    if (!matches) {
      return res.status(403).json({ detail: "Contact does not match this order" });
    }
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
  } catch (err) {
    console.error("Failed to initialize backend state:", err);
  }

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

startServer();
