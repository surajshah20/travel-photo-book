// server/controllers/orderController.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../db");

// Book pricing
const PRICES = {
  journal: 19.99,
  hardcover: 34.99,
  luxury: 49.99,
  scrapbook: 24.99,
};

// ─── CREATE PAYMENT INTENT ────────────────────────────────
// This creates a Stripe payment session
const createPaymentIntent = async (req, res) => {
  try {
    const { bookId } = req.body;

    // Get book details
    const bookResult = await db.query(
      "SELECT * FROM books WHERE id = $1",
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const book = bookResult.rows[0];
    const price = PRICES[book.book_type] || 19.99;

    // Create payment intent with Stripe
    // Amount must be in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: "usd",
      metadata: {
        bookId: String(bookId),
        userId: String(req.user.id),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: price,
      bookTitle: book.title,
    });

  } catch (err) {
    console.error("Payment intent error:", err.message);
    res.status(500).json({ error: "Payment setup failed" });
  }
};

// ─── CREATE ORDER ─────────────────────────────────────────
// Called after successful payment
const createOrder = async (req, res) => {
  try {
    const {
      bookId,
      stripePaymentId,
      totalPrice,
      shipping_name,
      shipping_address,
      shipping_city,
      shipping_country,
      shipping_zip,
    } = req.body;

    const result = await db.query(
      `INSERT INTO orders 
        (user_id, book_id, stripe_payment_id, total_price, 
         shipping_name, shipping_address, shipping_city, 
         shipping_country, shipping_zip, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.user.id, bookId, stripePaymentId, totalPrice,
        shipping_name, shipping_address, shipping_city,
        shipping_country, shipping_zip, "paid",
      ]
    );

    // Update book status to ordered
    await db.query(
      "UPDATE books SET status = $1 WHERE id = $2",
      ["ordered", bookId]
    );

    res.status(201).json({
      message: "Order placed successfully!",
      order: result.rows[0],
    });

  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(500).json({ error: "Could not create order" });
  }
};

// ─── GET USER ORDERS ──────────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT orders.*, books.title, books.destination, books.cover_image_url
       FROM orders
       JOIN books ON orders.book_id = books.id
       WHERE orders.user_id = $1
       ORDER BY orders.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ error: "Could not fetch orders" });
  }
};

module.exports = { createPaymentIntent, createOrder, getUserOrders };