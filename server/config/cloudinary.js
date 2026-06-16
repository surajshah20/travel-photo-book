// server/config/cloudinary.js

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

console.log("CLOUD:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("KEY:", process.env.CLOUDINARY_API_KEY);
console.log(
  "SECRET:",
  process.env.CLOUDINARY_API_SECRET
    ? "Loaded"
    : "Missing"
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "blushbook-photos",
    resource_type: "image",
    // No transformation here — causes 403 on free plans
    // Cloudinary auto-optimises on delivery instead
  }),
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 15MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed"), false);
    }
  },
});

cloudinary.api.ping()
  .then(() => console.log("✅ Cloudinary connected"))
  .catch(err => console.error("❌ Cloudinary error:", err));

module.exports = { cloudinary, upload };