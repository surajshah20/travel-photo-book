// server/routes/pageRoutes.js

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getPagesByBook } = require("../db/queries");

// GET /api/pages/:bookId
router.get("/:bookId", protect, async (req, res) => {
  try {
    const result = await getPagesByBook(req.params.bookId);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch pages" });
  }
});

module.exports = router;