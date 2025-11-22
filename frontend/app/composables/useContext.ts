import { ref } from "vue";
import { contextService } from "~/pages/input/service/context.service";
import { useMediaGroupManager } from "@/composables/useMediaManager";

export const useContext = () => {
  const content = ref<string[]>([""]);
  const loading = ref(false);
  const { imageManager, videoManager, audioManager } = useMediaGroupManager();

  const validate = () => {
    const validContents = content.value.filter(c => c.trim() !== "");
    if (validContents.length === 0) {
      alert("Vui lòng nhập ít nhất một nội dung.");
      return false;
    }
    return true;
  };

  const submit = async (imageUrls: string[], videoUrls: string[], audioUrls: string[], expiresAt?: Date): Promise<string | null> => {
    if (!validate()) return null;
    loading.value = true;

    try {
      return await contextService.create({
        content: content.value.filter(c => c.trim() !== ""),
        images: imageUrls,
        videos: videoUrls,
        audios: audioUrls,
        expiresAt: expiresAt || null,
      });
    } catch (_err) {
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchContext = async (id: string) => {
    loading.value = true;
    try {
      const data = await contextService.getById(id);
      if (data) {
        content.value = data.content;
        return data;
      }
    } catch (_err) {
    } finally {
      loading.value = false;
    }
  };

  const update = async (
    id: string, 
    imageUrls: string[], 
    videoUrls: string[], 
    audioUrls: string[],
    _deletedUrls: string[] = [], // Không dùng ở đây, xử lý ở component
    expiresAt?: Date
  ): Promise<void> => {
    loading.value = true;
    try {
      // Chỉ cập nhật Firestore context với media mới (đã loại bỏ media cũ)
      await contextService.update(id, {
        content: content.value.filter(c => c.trim() !== ""),
        images: imageUrls,
        videos: videoUrls,
        audios: audioUrls,
        expiresAt: expiresAt || undefined,
      });
      
      // deletedUrls sẽ được xử lý ở component để gọi backend xóa Cloudinary
    } catch (_err) {
      throw _err;
    } finally {
      loading.value = false;
    }
  };

  const addContentItem = () => {
    content.value.push("");
  };

  const removeContentItem = (index: number) => {
    if (content.value.length > 1) {
      content.value.splice(index, 1);
    }
  };

  const updateContentItem = (index: number, value: string) => {
    content.value[index] = value;
  };

  const reset = () => {
    content.value = [""];
    imageManager.clearAll();
    videoManager.clearAll();
    audioManager.clearAll();
  };

  return {
    content,
    loading,
    imageManager,
    videoManager,
    audioManager,
    validate,
    submit,
    fetchContext,
    update,
    reset,
    addContentItem,
    removeContentItem,
    updateContentItem,
  };
};
