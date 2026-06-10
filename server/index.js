// server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("./config/passport");
require("./db");

const authRoutes = require("./routes/authRoutes");
const photoRoutes = require("./routes/photoRoutes");
const bookRoutes = require("./routes/bookRoutes");
const templateRoutes = require("./routes/templateRoutes");
const orderRoutes = require("./routes/orderRoutes");
const pageRoutes = require("./routes/pageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Initialize passport (no sessions — we use JWT)
app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Blushbook API running ✅" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});