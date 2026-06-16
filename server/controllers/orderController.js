// server/controllers/orderController.js
const db = require("../db");

// ─── GET USER ORDERS ──────────────────────────────────────
exports.getUserOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, b.title, b.destination, b.cover_image_url
       FROM orders o
       JOIN books b ON o.book_id = b.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ error: "Could not fetch orders" });
  }
};

// ─── REQUEST CANCELLATION ─────────────────────────────────
// Inside server/controllers/orderController.js
exports.requestCancellation = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body; // ✅ Extract reason from frontend

    const orderRes = await db.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2", 
      [orderId, userId]
    );

    if (!orderRes.rows.length) return res.status(404).json({ error: "Order not found" });

    const currentStatus = orderRes.rows[0].order_status;
    if (['shipped', 'delivered', 'cancelled'].includes(currentStatus)) {
      return res.status(400).json({ error: "This order cannot be cancelled at this stage." });
    }

    // ✅ Save the reason and update status
    await db.query(
      "UPDATE orders SET order_status = 'cancellation_requested', cancellation_reason = $1, updated_at = NOW() WHERE id = $2", 
      [reason || "No reason provided", orderId]
    );

    await db.query(
      "INSERT INTO order_status_history (order_id, status, note) VALUES ($1, 'cancellation_requested', $2)", 
      [orderId, `User requested cancellation: ${reason || "No reason provided"}`]
    );

    res.json({ message: "Cancellation request received successfully" });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
};