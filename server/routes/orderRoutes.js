// server/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createPaymentIntent,
  createOrder,
  getUserOrders,
} = require("../controllers/orderController");

router.post("/payment-intent", protect, createPaymentIntent);
router.post("/", protect, createOrder);
router.get("/", protect, getUserOrders);

module.exports = router;