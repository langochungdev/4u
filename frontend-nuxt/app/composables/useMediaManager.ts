import { ref } from "vue";
import { MEDIA_LIMITS } from '@/config/app'

const createManager = (type: "image" | "audio" | "video", limit: number) => {
  const files = ref<File[]>([]);
  const previews = ref<string[]>([]);

  const addFiles = (fileList: FileList | File[] | null) => {
    if (!fileList || fileList.length === 0) return;
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm', '.flac'];
    const videoExts = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic'];

    const extMatches = (name: string, exts: string[]) => {
      const lower = name.toLowerCase();
      return exts.some(e => lower.endsWith(e));
    };

    const incoming = Array.from(fileList).filter(f => {
      // if browser provides MIME type, use it
      if (f.type && f.type.startsWith(type + '/')) return true;
      // fallback to extension checks for files with missing/incorrect MIME
      if (!f.type || f.type.trim() === '') {
        if (type === 'audio') return extMatches(f.name, audioExts);
        if (type === 'video') return extMatches(f.name, videoExts);
        if (type === 'image') return extMatches(f.name, imageExts);
      }
  // do not accept video files into audio manager (no conversion)
      return false;
    });
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
  const imageManager = createManager("image", MEDIA_LIMITS.maxImages);
  const videoManager = createManager("video", MEDIA_LIMITS.maxVideos);
  const audioManager = createManager("audio", MEDIA_LIMITS.maxAudios);

  const clearAll = () => {
    imageManager.clearAll();
    videoManager.clearAll();
    audioManager.clearAll();
  };

  return { imageManager, videoManager, audioManager, clearAll };
};
