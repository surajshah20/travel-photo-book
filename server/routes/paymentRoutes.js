// server/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

// ── Cash on Delivery ──────────────────────────────────────
router.post("/cod", authMiddleware, paymentController.processCOD);

// ── eSewa Payment ─────────────────────────────────────────
router.post("/esewa/initiate", authMiddleware, paymentController.esewaInitiate);
router.get("/esewa/verify", paymentController.esewaVerify); // Public Webhook

// ── Khalti Payment ────────────────────────────────────────
router.post("/khalti/initiate", authMiddleware, paymentController.khaltiInitiate);
router.get("/khalti/verify", paymentController.khaltiVerify); // Public Webhook

module.exports = router;