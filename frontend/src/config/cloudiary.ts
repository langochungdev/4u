export const cloudinaryConfig = {
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string,
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string,
};

if (!cloudinaryConfig.CLOUD_NAME || !cloudinaryConfig.UPLOAD_PRESET) {
  throw new Error("Missing Cloudinary environment variables");
}
