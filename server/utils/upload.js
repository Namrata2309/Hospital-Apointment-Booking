// utils/upload.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage Settings
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'SmartCare_Documents', // The folder name in your Cloudinary account
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], // Allow images and PDFs
  },
});

// 3. Initialize Multer
const upload = multer({ storage });

module.exports = upload;