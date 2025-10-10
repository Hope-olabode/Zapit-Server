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
 * Usage: await uploadBufferToCloudinary(buffer, 'folder/name')
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};
