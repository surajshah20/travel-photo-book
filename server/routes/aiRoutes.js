// server/routes/aiRoutes.js

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { generateAIBook, regenerateCaption } = require("../controllers/aiController");

// POST /api/ai/generate/:bookId — generate full book with AI
router.post("/generate/:bookId", protect, generateAIBook);

// POST /api/ai/caption/:photoId — regenerate one caption
router.post("/caption/:photoId", protect, regenerateCaption);

module.exports = router;