// server/routes/adminRoutes.js

const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const db = require("../db");

// ─────────────────────────────────────────────
// GET /api/admin/orders/stats
// Admin only - Gets the top-level dashboard numbers
// ─────────────────────────────────────────────
router.get("/orders/stats", protect, admin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE payment_status = 'paid') as total_paid,
        COUNT(*) FILTER (WHERE order_status = 'processing' OR order_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE order_status = 'printing') as printing,
        COUNT(*) FILTER (WHERE order_status = 'shipped') as shipped,
        COUNT(*) FILTER (WHERE order_status = 'delivered') as delivered,
        COALESCE(SUM(amount_npr) FILTER (WHERE payment_status = 'paid' OR payment_method = 'cod'), 0) as total_revenue
      FROM orders
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/orders
// Admin only - Now supports pagination!
// ─────────────────────────────────────────────
router.get("/orders", protect, admin, async (req, res) => {
  const { status, page = 1, limit = 15 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT o.*, 
             u.name as user_name, u.email as user_email,
             b.title as book_title, b.cover_image_url
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN books b ON o.book_id = b.id
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` WHERE o.order_status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [ordersRes, countRes] = await Promise.all([
      db.query(query, params),
      db.query(
        `SELECT COUNT(*) FROM orders${status && status !== 'all' ? " WHERE order_status = $1" : ""}`,
        status && status !== 'all' ? [status] : []
      ),
    ]);

    // Return the exact object structure the new frontend expects
    res.json({
      orders: ordersRes.rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countRes.rows[0].count / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/admin/orders/:id/status
// Admin only - Updates order status (shipped, delivered, etc)
// ─────────────────────────────────────────────
router.patch("/orders/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      "UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2",
      [status, req.params.id]
    );

    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update order status" });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/users
// Admin only
// ─────────────────────────────────────────────
router.get("/users", protect, admin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         id,
         name,
         email,
         is_admin,
         created_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/books
// Admin only
// ─────────────────────────────────────────────
router.get("/books", protect, admin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM books
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch books" });
  }
});

module.exports = router;