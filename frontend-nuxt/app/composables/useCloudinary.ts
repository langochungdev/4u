import { uploadToCloudinary } from "~/utils/upload.helper"

export const useCloudinary = () => {
  const totalProgress = ref(0);
  const fileProgress = ref<Record<string, number>>({});
  const totalFileCount = ref(0);
  const completedCount = ref(0);
  
  const resetProgress = () => {
    totalProgress.value = 0;
    fileProgress.value = {};
    totalFileCount.value = 0;
    completedCount.value = 0;
  };

  // Chuẩn bị upload: đếm tổng số files trước
  const prepareUpload = (fileCount: number) => {
    totalFileCount.value = fileCount;
    totalProgress.value = 0;
    fileProgress.value = {};
    completedCount.value = 0;
  };

  const upload = async (files: File | File[]): Promise<string[]> => {
    const fileArray = Array.isArray(files) ? files : [files];
    if (fileArray.length === 0) return [];

    // Khởi tạo progress cho files mới
    fileArray.forEach(f => (fileProgress.value[f.name] = 0));

    const updateTotal = () => {
      const sum = Object.values(fileProgress.value).reduce((a, b) => a + b, 0);
      totalProgress.value = totalFileCount.value > 0 ? Math.round(sum / totalFileCount.value) : 0;
    };

    const urls = await Promise.all(
      fileArray.map(file =>
        uploadToCloudinary(file, percent => {
          fileProgress.value[file.name] = percent;
          updateTotal();
        })
      )
    );

    completedCount.value += fileArray.length;
    return urls;
  };

  return { upload, totalProgress, fileProgress, resetProgress, prepareUpload };
};
