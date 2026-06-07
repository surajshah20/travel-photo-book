// server/controllers/photoController.js
// Handles uploading, fetching, and deleting photos

const { cloudinary } = require("../config/cloudinary");
const { addPhoto, getPhotosByBook, deletePhoto } = require("../db/queries");

// ─── UPLOAD PHOTO ─────────────────────────────────────────
// multer already uploaded the file to Cloudinary before this runs
// req.file contains the Cloudinary response
const uploadPhoto = async (req, res) => {
  try {
    const { book_id } = req.body;
    const user_id = req.user.id; // from JWT middleware

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Save photo info to database
    const result = await addPhoto({
      book_id,
      user_id,
      image_url: req.file.path,        // Cloudinary URL
      public_id: req.file.filename,    // Cloudinary public ID
      width: req.file.width || null,
      height: req.file.height || null,
    });

    res.status(201).json({
      message: "Photo uploaded successfully",
      photo: result.rows[0],
    });

  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ─── GET PHOTOS FOR A BOOK ────────────────────────────────
const getPhotos = async (req, res) => {
  try {
    const { bookId } = req.params;
    const result = await getPhotosByBook(bookId);
    res.json(result.rows);
  } catch (err) {
    console.error("Get photos error:", err.message);
    res.status(500).json({ error: "Could not fetch photos" });
  }
};

// ─── DELETE PHOTO ─────────────────────────────────────────
const removePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { public_id } = req.body;

    // Delete from Cloudinary first
    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }

    // Then delete from database
    await deletePhoto(photoId);

    res.json({ message: "Photo deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: "Could not delete photo" });
  }
};

module.exports = { uploadPhoto, getPhotos, removePhoto };