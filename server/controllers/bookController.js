// server/controllers/bookController.js

const db = require("../db");

// ─── CREATE BOOK ──────────────────────────────────────────
const createNewBook = async (req, res) => {
  const userId = req.user.id;
  const {
    title, destination, book_type, template_id,
    travel_date_start, travel_date_end, creation_mode,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO books
         (user_id, title, destination, book_type, template_id,
          travel_date_start, travel_date_end, creation_mode, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft')
       RETURNING *`,
      [
        userId,
        title || "Untitled Book",
        destination || null,
        book_type || "hardcover",
        template_id || null,
        travel_date_start || null,
        travel_date_end || null,
        creation_mode || "ai",
      ]
    );
    res.status(201).json({ message: "Book created", book: result.rows[0] });
  } catch (err) {
    console.error("Create book error:", err.message);
    res.status(500).json({ error: "Could not create book" });
  }
};

// ─── GET ALL BOOKS FOR USER ───────────────────────────────
const getUserBooks = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*,
              COUNT(p.id)::int AS photo_count
       FROM books b
       LEFT JOIN photos p ON p.book_id = b.id
       WHERE b.user_id = $1
         AND b.deleted_at IS NULL
       GROUP BY b.id
       ORDER BY b.updated_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get books error:", err.message);
    res.status(500).json({ error: "Could not fetch books" });
  }
};

// ─── GET SINGLE BOOK ──────────────────────────────────────
const getSingleBook = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*,
              COUNT(p.id)::int AS photo_count
       FROM books b
       LEFT JOIN photos p ON p.book_id = b.id
       WHERE b.id = $1
       GROUP BY b.id`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get book error:", err.message);
    res.status(500).json({ error: "Could not fetch book" });
  }
};

// ─── UPDATE BOOK ──────────────────────────────────────────
const updateUserBook = async (req, res) => {
  const {
    title, destination, cover_image_url, cover_subtitle,
    font_style, color_scheme, status,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE books SET
         title            = COALESCE($1, title),
         destination      = COALESCE($2, destination),
         cover_image_url  = COALESCE($3, cover_image_url),
         cover_subtitle   = COALESCE($4, cover_subtitle),
         font_style       = COALESCE($5, font_style),
         color_scheme     = COALESCE($6, color_scheme),
         status           = COALESCE($7, status),
         updated_at       = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        title, destination, cover_image_url, cover_subtitle,
        font_style, color_scheme, status,
        req.params.id,
      ]
    );
    res.json({ message: "Book updated", book: result.rows[0] });
  } catch (err) {
    console.error("Update book error:", err.message);
    res.status(500).json({ error: "Could not update book" });
  }
};

// ─── DELETE BOOK (soft delete) ────────────────────────────
const deleteUserBook = async (req, res) => {
  try {
    await db.query(
      "UPDATE books SET deleted_at = NOW() WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error("Delete book error:", err.message);
    res.status(500).json({ error: "Could not delete book" });
  }
};

module.exports = {
  createNewBook,
  getUserBooks,
  getSingleBook,
  updateUserBook,
  deleteUserBook,
};