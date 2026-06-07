// server/routes/photoRoutes.js

const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const protect = require("../middleware/authMiddleware");
const { uploadPhoto, getPhotos, removePhoto } = require("../controllers/photoController");

// POST /api/photos/upload — upload a single photo
// protect = must be logged in
// upload.single("photo") = multer reads the file named "photo" from the request
router.post("/upload", protect, upload.single("photo"), uploadPhoto);

// GET /api/photos/:bookId — get all photos for a book
router.get("/:bookId", protect, getPhotos);

// DELETE /api/photos/:photoId — delete a photo
router.delete("/:photoId", protect, removePhoto);

module.exports = router;