export const usePreviewStore = defineStore('preview', () => {
  const content = ref<string[]>([])
  const images = ref<string[]>([])
  const videos = ref<string[]>([])
  const audios = ref<string[]>([])
  const imageFiles = ref<File[]>([])
  const videoFiles = ref<File[]>([])
  const audioFiles = ref<File[]>([])
  const template = ref('demo')
  const topic = ref('')
  const editId = ref<string | null>(null)
  const deletedUrls = ref<string[]>([])

  const hasData = computed(() => 
    content.value.length > 0 || 
    imageFiles.value.length > 0 || 
    videoFiles.value.length > 0 || 
    audioFiles.value.length > 0
  )

  const isEditMode = computed(() => editId.value !== null)

  const displayData = computed(() => ({
    content: content.value,
    images: images.value,
    videos: videos.value,
    audios: audios.value,
  }))

  function setPreviewData(data: {
    content: string[]
    images: string[]
    videos: string[]
    audios: string[]
    imageFiles: File[]
    videoFiles: File[]
    audioFiles: File[]
    template: string
    topic?: string
    editId?: string | null
    deletedUrls?: string[]
  }) {
    content.value = data.content
    images.value = data.images
    videos.value = data.videos
    audios.value = data.audios
    imageFiles.value = data.imageFiles
    videoFiles.value = data.videoFiles
    audioFiles.value = data.audioFiles
    template.value = data.template
    topic.value = data.topic || ''
    editId.value = data.editId || null
    deletedUrls.value = data.deletedUrls || []
  }

  function restoreToInput() {
    return {
      content: content.value,
      imageFiles: imageFiles.value,
      videoFiles: videoFiles.value,
      audioFiles: audioFiles.value,
      editId: editId.value,
      deletedUrls: deletedUrls.value,
    }
  }

  function clear() {
    content.value = []
    images.value = []
    videos.value = []
    audios.value = []
    imageFiles.value = []
    videoFiles.value = []
    audioFiles.value = []
    template.value = 'demo'
    topic.value = ''
    editId.value = null
    deletedUrls.value = []
  }

  return {
    content,
    images,
    videos,
    audios,
    imageFiles,
    videoFiles,
    audioFiles,
    template,
    topic,
    editId,
    deletedUrls,
    hasData,
    isEditMode,
    displayData,
    setPreviewData,
    restoreToInput,
    clear,
  }
});
