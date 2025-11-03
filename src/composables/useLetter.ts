import { ref } from "vue";
import { letterService } from "@/pages/input/letter.service";
import { useMediaGroupManager } from "@/composables/useMediaManager";

export const useLetter = () => {
  const title = ref("");
  const content = ref("");
  const loading = ref(false);
  const { imageManager, videoManager, audioManager } = useMediaGroupManager();

  const validate = () => {
    if (!title.value.trim() || !content.value.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
      return false;
    }
    return true;
  };

  const submit = async (imageUrls: string[], videoUrls: string[], audioUrls: string[]): Promise<string | null> => {
    if (!validate()) return null;
    loading.value = true;

    try {
      return await letterService.create({
        title: title.value,
        content: content.value,
        images: imageUrls,
        videos: videoUrls,
        audios: audioUrls,
      });
    } catch (err) {
      console.error("Error submitting letter:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchLetter = async (id: string) => {
    loading.value = true;
    try {
      const data = await letterService.getById(id);
      if (data) {
        title.value = data.title;
        content.value = data.content;
        return data;
      }
    } catch (err) {
      console.error("Error fetching letter:", err);
    } finally {
      loading.value = false;
    }
  };

  const update = async (
    id: string, 
    imageUrls: string[], 
    videoUrls: string[], 
    audioUrls: string[],
    deletedUrls: string[] = []
  ): Promise<void> => {
    loading.value = true;
    try {
      if (deletedUrls.length > 0) {
        await letterService.saveDeletedMedia(deletedUrls);
      }

      await letterService.update(id, {
        title: title.value,
        content: content.value,
        images: imageUrls,
        videos: videoUrls,
        audios: audioUrls,
      });
    } catch (err) {
      console.error("Error updating letter:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    title.value = "";
    content.value = "";
    imageManager.clearAll();
    videoManager.clearAll();
    audioManager.clearAll();
  };

  return {
    title,
    content,
    loading,
    imageManager,
    videoManager,
    audioManager,
    validate,
    submit,
    fetchLetter,
    update,
    reset,
  };
};
