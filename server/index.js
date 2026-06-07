// server/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import database connection (runs on startup)
require("./db");

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────
// All auth routes will be at /api/auth/...
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Travel Photo Book API is running ✅" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});