// server/routes/bookRoutes.js

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createNewBook,
  getUserBooks,
  getSingleBook,
  updateUserBook,
  deleteUserBook,
} = require("../controllers/bookController");

router.post("/", protect, createNewBook);           // create book
router.get("/", protect, getUserBooks);             // get all my books
router.get("/:id", protect, getSingleBook);         // get one book
router.put("/:id", protect, updateUserBook);        // update book
router.delete("/:id", protect, deleteUserBook);     // delete book

module.exports = router;