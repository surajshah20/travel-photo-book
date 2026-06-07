// server/db/queries.js
// Reusable database query functions
// Instead of writing raw SQL everywhere, we keep it here

const db = require("./index");

// ─── USER QUERIES ─────────────────────────────────────────
const findUserByEmail = (email) =>
  db.query("SELECT * FROM users WHERE email = $1", [email]);

const findUserById = (id) =>
  db.query("SELECT id, name, email, created_at FROM users WHERE id = $1", [id]);

// ─── BOOK QUERIES ─────────────────────────────────────────

// Get all books for a user
const getBooksByUser = (userId) =>
  db.query(
    "SELECT * FROM books WHERE user_id = $1 ORDER BY updated_at DESC",
    [userId]
  );

// Get a single book by ID
const getBookById = (bookId) =>
  db.query("SELECT * FROM books WHERE id = $1", [bookId]);

// Create a new book
const createBook = (userId, bookData) => {
  const {
    title, destination, travel_date_start, travel_date_end,
    book_type, book_size, template_id, creation_mode
  } = bookData;

  return db.query(
    `INSERT INTO books 
      (user_id, title, destination, travel_date_start, travel_date_end, book_type, book_size, template_id, creation_mode)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, title, destination, travel_date_start, travel_date_end,
     book_type, book_size, template_id, creation_mode]
  );
};

// Update book details
const updateBook = (bookId, updates) => {
  const {
    title, destination, cover_image_url, cover_subtitle,
    font_style, color_scheme, logo_url, status
  } = updates;

  return db.query(
    `UPDATE books SET
      title = COALESCE($1, title),
      destination = COALESCE($2, destination),
      cover_image_url = COALESCE($3, cover_image_url),
      cover_subtitle = COALESCE($4, cover_subtitle),
      font_style = COALESCE($5, font_style),
      color_scheme = COALESCE($6, color_scheme),
      logo_url = COALESCE($7, logo_url),
      status = COALESCE($8, status),
      updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [title, destination, cover_image_url, cover_subtitle,
     font_style, color_scheme, logo_url, status, bookId]
  );
};

// Delete a book
const deleteBook = (bookId) =>
  db.query("DELETE FROM books WHERE id = $1", [bookId]);

// ─── TEMPLATE QUERIES ─────────────────────────────────────
const getAllTemplates = () =>
  db.query("SELECT * FROM templates ORDER BY id");

// ─── PHOTO QUERIES ────────────────────────────────────────
const getPhotosByBook = (bookId) =>
  db.query(
    "SELECT * FROM photos WHERE book_id = $1 ORDER BY position",
    [bookId]
  );

const addPhoto = (photoData) => {
  const { book_id, user_id, image_url, public_id, width, height } = photoData;
  return db.query(
    `INSERT INTO photos (book_id, user_id, image_url, public_id, width, height)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [book_id, user_id, image_url, public_id, width, height]
  );
};

const deletePhoto = (photoId) =>
  db.query("DELETE FROM photos WHERE id = $1", [photoId]);

// ─── PAGE QUERIES ─────────────────────────────────────────
const getPagesByBook = (bookId) =>
  db.query(
    "SELECT * FROM pages WHERE book_id = $1 ORDER BY page_number",
    [bookId]
  );

const createPage = (bookId, pageNumber, layout) =>
  db.query(
    `INSERT INTO pages (book_id, page_number, layout)
     VALUES ($1, $2, $3) RETURNING *`,
    [bookId, pageNumber, layout]
  );

module.exports = {
  findUserByEmail,
  findUserById,
  getBooksByUser,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAllTemplates,
  getPhotosByBook,
  addPhoto,
  deletePhoto,
  getPagesByBook,
  createPage,
};