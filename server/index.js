// server/index.js

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
// Allows React (running on port 3000) to call this backend
app.use(cors());

// Lets Express read JSON data sent from the frontend
app.use(express.json());

// ─── Test Route ───────────────────────────────────────────
// Visit http://localhost:5000/ to confirm backend is running
app.get("/", (req, res) => {
  res.json({ message: "Travel Photo Book API is running ✅" });
});

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});