// src/composables/useImageManager.ts
import { ref } from "vue";

export const useImageManager = () => {
  const images = ref<File[]>([]);
  const previews = ref<string[]>([]);

  const addImages = (files: File[] | null) => {
    if (!files || files.length === 0) return;
    files.forEach(file => {
      images.value.push(file);
      previews.value.push(URL.createObjectURL(file));
    });
  };

  const removeImage = (index: number) => {
    const preview = previews.value[index];
    if (preview) URL.revokeObjectURL(preview);
    
    images.value.splice(index, 1);
    previews.value.splice(index, 1);
  };

  const clearAll = () => {
    previews.value.forEach(url => URL.revokeObjectURL(url));
    images.value = [];
    previews.value = [];
  };

  return { images, previews, addImages, removeImage, clearAll };
};