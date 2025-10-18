// config/cloudinary.js
import dotenv from "dotenv";
import cloudinary from "cloudinary";

dotenv.config(); // <-- this must be first

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary.v2;

/**
 * Upload buffer via upload_stream and return Promise which resolves with result
 * Usage: await uploadBufferToCloudinary(buffer, { folder: 'folder/name' })
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // 🔥 Add timeout and resource_type
    const uploadOptions = {
      resource_type: "auto",
      timeout: 120000, // 120 seconds (2 minutes)
      chunk_size: 6000000, // 6MB chunks for large files
      ...options,
    };

    const stream = cloudinary.v2.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          return reject(error);
        }
        console.log("✅ Cloudinary upload success:", result.public_id);
        resolve(result);
      }
    );
    
    stream.end(buffer);
  });
};