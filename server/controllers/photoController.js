// server/controllers/photoController.js

const { cloudinary } = require("../config/cloudinary");
const db = require("../db");

// ─── UPLOAD PHOTO ─────────────────────────────────────────
const uploadPhoto = async (req, res) => {
  try {
    const { book_id } = req.body;
    const user_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const image_url = req.file.path;
    const public_id = req.file.filename;

    if (!image_url) {
      return res.status(500).json({ error: "Upload failed — no URL returned" });
    }

    const result = await db.query(
      `INSERT INTO photos (book_id, user_id, image_url, public_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [book_id, user_id, image_url, public_id]
    );

    res.status(201).json({
      message: "Photo uploaded successfully",
      photo: result.rows[0],
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
};

// ─── GET PHOTOS FOR A BOOK ────────────────────────────────
const getPhotos = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM photos WHERE book_id = $1 ORDER BY id ASC",
      [req.params.bookId]
    );
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

    // Get the photo first to find its Cloudinary public_id
    const photoRes = await db.query(
      "SELECT * FROM photos WHERE id = $1",
      [photoId]
    );

    if (photoRes.rows.length > 0) {
      const photo = photoRes.rows[0];
      
      // ✅ Actively delete from Cloudinary to prevent billing leaks
      if (photo.public_id) {
        await cloudinary.uploader.destroy(photo.public_id).catch(e => {
          console.error("Cloudinary delete error:", e.message);
        });
      }
    }

    // Delete from local database
    await db.query("DELETE FROM photos WHERE id = $1", [photoId]);

    res.json({ message: "Photo permanently deleted" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: "Could not delete photo" });
  }
};

module.exports = { uploadPhoto, getPhotos, removePhoto };