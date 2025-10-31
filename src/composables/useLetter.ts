import { ref } from "vue"
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"

export const useLetter = () => {
  const title = ref("")
  const content = ref("")
  const images = ref<string[]>([])
  const loading = ref(false)

  const fetchLetter = async (id: string) => {
    loading.value = true
    const docRef = doc(db, "letters", id)
    const snapshot = await getDoc(docRef)

    if (snapshot.exists()) {
      const data = snapshot.data()
      title.value = data.title || ""
      content.value = data.content || ""
      images.value = data.images || []
    }

    loading.value = false
  }

  return { title, content, images, loading, fetchLetter }
}
