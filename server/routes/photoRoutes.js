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

// Add this route to photoRoutes.js
router.put("/:photoId/caption", protect, async (req, res) => {
  try {
    const { caption } = req.body;
    await require("../db").query(
      "UPDATE photos SET caption = $1 WHERE id = $2",
      [caption, req.params.photoId]
    );
    res.json({ message: "Caption updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update caption" });
  }
});

module.exports = router;