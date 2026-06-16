// server/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

// Import ONLY the functions that actually exist in your new orderController.js
const {
  getUserOrders,
  requestCancellation,
} = require("../controllers/orderController");

// ─── ORDER LEDGER ─────────────────────────────────────────
// Fetch all orders for the logged-in user
router.get("/", protect, getUserOrders);

// ─── CANCELLATIONS ────────────────────────────────────────
// Request a cancellation for a specific order
router.patch("/:id/cancel-request", protect, requestCancellation);

module.exports = router;