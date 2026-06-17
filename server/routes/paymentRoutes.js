const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

// ── Security: Configure Multer (Memory Storage + 5MB Limit) ─
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Blocks massive payload attacks
});

// ── Secure Receipt Upload (NEW) ───────────────────────────
router.post("/upload-receipt", authMiddleware, upload.single("receipt"), paymentController.uploadReceipt);

// ── Manual QR / Bank Transfer ─────────────────────────────
router.post("/qr", authMiddleware, paymentController.processQRTransfer);

// ── Cash on Delivery ──────────────────────────────────────
router.post("/cod", authMiddleware, paymentController.processCOD);

// ── eSewa Payment ─────────────────────────────────────────
router.post("/esewa/initiate", authMiddleware, paymentController.esewaInitiate);
router.get("/esewa/verify", paymentController.esewaVerify); // Public Webhook

// ── Khalti Payment ────────────────────────────────────────
router.post("/khalti/initiate", authMiddleware, paymentController.khaltiInitiate);
router.get("/khalti/verify", paymentController.khaltiVerify); // Public Webhook

module.exports = router;