import { ref } from "vue";
import { uploadToCloudinary } from "@/utils/upload.helper";

export const useCloudinary = () => {
  const totalProgress = ref(0);
  const fileProgress = ref<Record<string, number>>({});

  const upload = async (files: File | File[]): Promise<string[]> => {
    const fileArray = Array.isArray(files) ? files : [files];
    if (fileArray.length === 0) throw new Error("Empty file list");

    fileArray.forEach(f => (fileProgress.value[f.name] = 0));

    const updateTotal = () => {
      const sum = Object.values(fileProgress.value).reduce((a, b) => a + b, 0);
      totalProgress.value = Math.round(sum / fileArray.length);
    };

    const urls = await Promise.all(
      fileArray.map(file =>
        uploadToCloudinary(file, percent => {
          fileProgress.value[file.name] = percent;
          updateTotal();
        })
      )
    );

    totalProgress.value = 100;
    return urls;
  };

  return { upload, totalProgress, fileProgress };
};
