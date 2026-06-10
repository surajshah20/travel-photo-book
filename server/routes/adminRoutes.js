// server/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const db = require("../db");

// GET /api/admin/orders
router.get("/orders", protect, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT orders.*, books.title, books.destination,
        books.cover_image_url, books.book_type
       FROM orders
       JOIN books ON orders.book_id = books.id
       ORDER BY orders.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

// PUT /api/admin/orders/:id
router.put("/orders/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query(
      "UPDATE orders SET status = $1 WHERE id = $2",
      [status, req.params.id]
    );
    res.json({ message: "Order updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update order" });
  }
});

// GET /api/admin/users
router.get("/users", protect, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// GET /api/admin/books
router.get("/books", protect, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM books ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch books" });
  }
});

module.exports = router;