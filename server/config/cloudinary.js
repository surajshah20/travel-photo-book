// server/config/cloudinary.js
// Sets up Cloudinary and multer together
// Any route that uses this will automatically upload files to Cloudinary

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Connect to your Cloudinary account using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tell multer to store files in Cloudinary instead of local disk
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "travel-photo-book",  // files go into this folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto" }], // auto optimize image quality
  },
});

// This is the middleware we'll use in upload routes
const upload = multer({ storage });

module.exports = { upload, cloudinary };