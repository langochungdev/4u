import { ref } from "vue";

const createManager = (type: "image" | "audio" | "video", limit: number) => {
  const files = ref<File[]>([]);
  const previews = ref<string[]>([]);

  const addFiles = (fileList: FileList | File[] | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList).filter(f => f.type.startsWith(type + "/"));
    if (incoming.length === 0) return;

    const availableSlots = limit - files.value.length;
    const toAdd = incoming.slice(0, availableSlots);
    toAdd.forEach(file => {
      files.value.push(file);
      previews.value.push(URL.createObjectURL(file));
    });
  };

  const removeFile = (index: number) => {
    if (previews.value[index]) URL.revokeObjectURL(previews.value[index]);
    files.value.splice(index, 1);
    previews.value.splice(index, 1);
  };

  const clearAll = () => {
    previews.value.forEach(url => URL.revokeObjectURL(url));
    files.value = [];
    previews.value = [];
  };

  return { type, limit, files, previews, addFiles, removeFile, clearAll };
};

export const useMediaGroupManager = () => {
  const imageManager = createManager("image", 10);
  const videoManager = createManager("video", 10);
  const audioManager = createManager("audio", 10);

  const clearAll = () => {
    imageManager.clearAll();
    videoManager.clearAll();
    audioManager.clearAll();
  };

  return { imageManager, videoManager, audioManager, clearAll };
};
