// src/composables/useCloudinary.ts
export const useCloudinary = () => {
  const env = import.meta.env as Record<string, string | undefined>;
  
  const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Missing Cloudinary environment variables");
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    
    const data = await res.json();
    return data.secure_url;
  };

  const uploadMultiple = async (files: File[]): Promise<string[]> => {
    return Promise.all(files.map(uploadImage));
  };

  return { uploadImage, uploadMultiple };
};