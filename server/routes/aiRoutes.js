// server/routes/aiRoutes.js

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const aiController = require("../controllers/aiController");
const { generateAIBook, regenerateCaption } = require("../controllers/aiController");

// ─── THE AI SECURITY SHIELD ───────────────────────────────
// Limits each IP to 5 requests per hour.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, 
  message: {
    error: "Too many AI generations requested. Please try again in an hour, or use the Manual Builder."
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

// POST /api/ai/generate/:bookId — generate full book with AI
router.post("/generate/:bookId", protect, generateAIBook);

// POST /api/ai/caption/:photoId — regenerate one caption
router.post("/caption/:photoId", protect, regenerateCaption);

module.exports = router;