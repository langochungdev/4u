import imageCompression from 'browser-image-compression';

// src/composables/useCloudinary.ts
export const useCloudinary = () => {
  const env = import.meta.env as Record<string, string | undefined>;
  
  const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Missing Cloudinary environment variables");
  }

  const compressImage = async (file: File): Promise<File> => {
    // Nếu file < 10MB thì trả về nguyên gốc
    if (file.size < 10 * 1024 * 1024) return file;
    // Nếu file >= 10MB thì nén về tối đa 9MB, resize max 1920px
    const options = {
      maxSizeMB: 9,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const processed = await compressImage(file);
    const formData = new FormData();
    formData.append("file", processed);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const uploadMultiple = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      urls.push(url);
    }
    return urls;
  };

  return { uploadImage, uploadMultiple };
};