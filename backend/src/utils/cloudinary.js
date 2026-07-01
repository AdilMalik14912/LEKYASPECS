/**
 * cloudinary.js — Cloudinary upload helper
 *
 * Uses your real credentials from .env:
 *   CLOUDINARY_CLOUD_NAME=xmuvjd8u
 *   CLOUDINARY_API_KEY=792654721576823
 *   CLOUDINARY_API_SECRET=baP_EX5Vjf14bWNqksD7ZLLqJcQ
 */

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload an image buffer or base64 string to Cloudinary.
 * @param {string} fileDataUri - Base64 data URI (e.g. from multer/formidable)
 * @param {string} folder - Cloudinary folder name (default: 'lekya-specs/products')
 * @returns {Promise<{url: string, public_id: string}>}
 */
async function uploadImage(fileDataUri, folder = 'lekya-specs/products') {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
  });
  return {
    url:       result.secure_url,
    public_id: result.public_id,
  };
}

/**
 * Delete an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

module.exports = { cloudinary, uploadImage, deleteImage };
