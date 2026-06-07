// server/routes/templateRoutes.js

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getAllTemplates } = require("../db/queries");

// GET /api/templates — get all templates
router.get("/", protect, async (req, res) => {
  try {
    const result = await getAllTemplates();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch templates" });
  }
});

module.exports = router;