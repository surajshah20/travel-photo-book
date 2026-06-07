// server/controllers/bookController.js

const {
  createBook,
  getBooksByUser,
  getBookById,
  updateBook,
  deleteBook,
} = require("../db/queries");

// ─── CREATE BOOK ──────────────────────────────────────────
const createNewBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await createBook(userId, req.body);
    res.status(201).json({
      message: "Book created successfully",
      book: result.rows[0],
    });
  } catch (err) {
    console.error("Create book error:", err.message);
    res.status(500).json({ error: "Could not create book" });
  }
};

// ─── GET ALL BOOKS FOR USER ───────────────────────────────
const getUserBooks = async (req, res) => {
  try {
    const result = await getBooksByUser(req.user.id);
    res.json(result.rows);
  } catch (err) {
    console.error("Get books error:", err.message);
    res.status(500).json({ error: "Could not fetch books" });
  }
};

// ─── GET SINGLE BOOK ──────────────────────────────────────
const getSingleBook = async (req, res) => {
  try {
    const result = await getBookById(req.params.id);
    if (result.rows.length === 0) {
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
  try {
    const result = await updateBook(req.params.id, req.body);
    res.json({
      message: "Book updated successfully",
      book: result.rows[0],
    });
  } catch (err) {
    console.error("Update book error:", err.message);
    res.status(500).json({ error: "Could not update book" });
  }
};

// ─── DELETE BOOK ──────────────────────────────────────────
const deleteUserBook = async (req, res) => {
  try {
    await deleteBook(req.params.id);
    res.json({ message: "Book deleted successfully" });
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