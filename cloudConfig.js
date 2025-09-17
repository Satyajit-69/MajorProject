// cloudConfig.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

require('dotenv').config(); // ✅ make sure env is loaded here too

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // ✅ this must be defined
  params: {
    folder: 'MajorProject', // you can change folder name
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

// Export
module.exports = {
  cloudinary,
  storage,
};
