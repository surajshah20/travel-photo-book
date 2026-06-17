// server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser"); // ✅ REQUIRED FOR SECURE COOKIES
const passport = require("./config/passport");
require("./db");

const authRoutes = require("./routes/authRoutes");
const photoRoutes = require("./routes/photoRoutes");
const bookRoutes = require("./routes/bookRoutes");
const templateRoutes = require("./routes/templateRoutes");
const aiRoutes = require("./routes/aiRoutes");
const pageRoutes = require("./routes/pageRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // ✅ NEW PAYMENT ROUTES
const adminRoutes = require("./routes/adminRoutes"); // ✅ ADD THIS LINE

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

// ─── PRODUCTION PROXY FLAG ────────────────────────────────
// CRITICAL: Tells Express it is running behind Cloudflare/Render proxy.
// Without this, rateLimiters will look at the proxy IP and block ALL users simultaneously.
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ─── CORS SECURITY PRODUCTION AUDIT ───────────────────────
const allowedOrigins = isProd
  ? [
      process.env.CLIENT_URL,
      "https://getblushbook.com",
      "https://www.getblushbook.com"
    ].filter(Boolean)
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
console.log("Blocked Origin:", origin);
callback(new Error(`CORS: Origin not allowed -> ${origin}`));    },
    credentials: true, // ✅ REQUIRED FOR SECURE COOKIES
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // ✅ TELLS EXPRESS HOW TO READ THE JWT COOKIE
app.use(passport.initialize());

const skip = () => !isProd;

// ─── GATEKEEPER SECURITY SHIELDS ──────────────────────────
app.use("/api/auth/login", rateLimit({ windowMs: 900000, max: 10, skip, message: { error: "Too many attempts. Please wait 15 minutes." } }));
app.use("/api/auth/register", rateLimit({ windowMs: 900000, max: 10, skip, message: { error: "Too many attempts. Please wait 15 minutes." } }));
app.use("/api/photos/upload", rateLimit({ windowMs: 60000, max: 30, skip, message: { error: "Too many uploads. Please slow down." } }));

// Health Check for Render Deployment Monitor
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── ROUTE MOUNTING ───────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes); // ✅ ATTACH PAYMENT ROUTES
app.use("/api/admin", adminRoutes); // ✅ ADD THIS LINE

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  if (err.message?.includes("CORS")) return res.status(403).json({ error: "Not allowed by CORS" });
  if (err.name === "MulterError") return res.status(400).json({ error: err.message });
  if (err.name === "JsonWebTokenError") return res.status(401).json({ error: "Invalid token" });
  res.status(err.status || 500).json({ error: isProd ? "An unexpected error occurred" : err.message });
});

// ✅ Add this friendly root route so the API doesn't look broken
app.get("/", (req, res) => {
  res.json({ message: "BlushBook Production API is live and running! 🚀" });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (err?.error?.name === "TimeoutError") return;
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`));