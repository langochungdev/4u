import { ref } from "vue";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useCloudinary } from "../../composables/useCloudinary";
import { useImageManager } from "../../composables/useImageManager";

export const useLetterForm = () => {
  const title = ref("");
  const content = ref("");
  const loading = ref(false);
  const { uploadMultiple } = useCloudinary();
  const imageManager = useImageManager();

  const validate = () => {
    if (!title.value || !content.value) {
      alert("Vui lòng nhập tiêu đề và nội dung.");
      return false;
    }
    return true;
  };

  const submit = async (): Promise<string | null> => {
    if (!validate()) return null;
    loading.value = true;

    try {
      const imageUrls = imageManager.images.value.length > 0
        ? await uploadMultiple(imageManager.images.value)
        : [];

      const id = (await addDoc(collection(db, "letters"), {
        title: title.value,
        content: content.value,
        images: imageUrls,
        createdAt: serverTimestamp(),
      })).id;

      return id; 
    } catch (error) {
      console.error("Error submitting letter:", error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    title,
    content,
    loading,
    submit,
    imageManager,
  };
};
