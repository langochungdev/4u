import { ref } from 'vue'
import { useAudioTrimmer } from './useAudioTrimmer'
import { useMediaUtils } from './useMediaUtils'

export const useMediaInput = (
  imageManager: any,
  videoManager: any,
  audioManager: any,
  constraints: any,
  existingData: any
) => {
  const { isExtractingAudio, extractProgress, cancelExtract, extractAudioFromVideo } = useAudioTrimmer()
  const { labels, getCount } = useMediaUtils(imageManager, videoManager, audioManager, existingData)
  
  const showAudioTrimmer = ref(false)
  const currentAudioFile = ref<File | null>(null)
  const currentAudioIndex = ref<number>(-1)
  const trimmedAudioIndexes = ref<Set<number>>(new Set())

  const isVideoFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase()
    return file.type.startsWith('video/') ||
           fileName.endsWith('.mp4') ||
           fileName.endsWith('.webm') ||
           fileName.endsWith('.mov')
  }

  const isAudioFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase()
    return file.type.startsWith('audio/') ||
           fileName.endsWith('.mp3') ||
           fileName.endsWith('.m4a') ||
           fileName.endsWith('.wav') ||
           fileName.endsWith('.ogg') ||
           fileName.endsWith('.aac') ||
           fileName.endsWith('.flac')
  }

  const validateFileSelection = (input: HTMLInputElement, type: 'image' | 'video' | 'audio') => {
    const max = constraints.value[`max${type.charAt(0).toUpperCase() + type.slice(1)}s` as keyof typeof constraints.value] as number
    const current = getCount(type)

    if (current >= max) {
      input.value = ''
      return null
    }

    const allowed = max - current
    const files = Array.from(input.files!).slice(0, allowed)

    return files
  }

  const handleAudioFile = async (file: File, input: HTMLInputElement) => {
    if (isVideoFile(file)) {
      try {
        const audioFile = await extractAudioFromVideo(file)
        currentAudioFile.value = audioFile
        currentAudioIndex.value = -1
        showAudioTrimmer.value = true
      } catch (error) {
        if (error instanceof Error && error.message === 'cancelled') {
          input.value = ''
          return
        }
        const errorMessage = error instanceof Error ? error.message : 'Không thể trích xuất audio từ video. Vui lòng chọn file audio hoặc video khác.'
        alert('❌ ' + errorMessage)
        input.value = ''
      }
    } else if (isAudioFile(file)) {
      currentAudioFile.value = file
      currentAudioIndex.value = -1
      showAudioTrimmer.value = true
    } else {
      alert('Vui lòng chọn tệp audio hoặc video hợp lệ.')
    }
  }

  const handleMultipleAudioFiles = async (files: File[]) => {
    const processedFiles: File[] = []

    for (const file of files) {
      if (isVideoFile(file)) {
        try {
          const audioFile = await extractAudioFromVideo(file)
          processedFiles.push(audioFile)
        } catch (error) {
          // Silent fail for batch processing
        }
      } else if (isAudioFile(file)) {
        processedFiles.push(file)
      }
    }

    for (const processedFile of processedFiles) {
      await audioManager.addFiles([processedFile])
    }
  }

  const handleMediaFiles = async (files: File[], type: 'image' | 'video') => {
    const manager = type === 'image' ? imageManager : videoManager
    for (const file of files) {
      await manager.addFiles([file])
    }
  }

  const handleMedia = async (e: Event, type: 'image' | 'video' | 'audio') => {
    const input = e.target as HTMLInputElement
    if (!input.files) return

    const files = validateFileSelection(input, type)
    if (!files) return

    if (type === 'audio' && files.length > 0) {
      if (files.length === 1) {
        const file = files[0]
        if (file) {
          await handleAudioFile(file, input)
        }
      } else {
        await handleMultipleAudioFiles(files)
      }
    } else if (type === 'image' || type === 'video') {
      await handleMediaFiles(files, type)
    }

    input.value = ''
  }

  const handleAudioTrimmed = (trimmedFile: File) => {
    if (currentAudioIndex.value >= 0) {
      audioManager.files.value[currentAudioIndex.value] = trimmedFile
      const newPreviews = [...audioManager.previews.value]
      newPreviews[currentAudioIndex.value] = URL.createObjectURL(trimmedFile)
      audioManager.previews.value = newPreviews
      trimmedAudioIndexes.value.add(currentAudioIndex.value)
    } else {
      audioManager.addFiles([trimmedFile])
      trimmedAudioIndexes.value.add(audioManager.files.value.length - 1)
    }
    showAudioTrimmer.value = false
    currentAudioFile.value = null
    currentAudioIndex.value = -1
  }

  const handleAudioTrimCancel = () => {
    showAudioTrimmer.value = false
    currentAudioFile.value = null
    currentAudioIndex.value = -1
  }

  const removeExisting = (type: 'image' | 'video' | 'audio', index: number, deletedUrls: any) => {
    if (!existingData.value) return
    const key = `${type}s`
    deletedUrls.value.push(existingData.value[key][index])
    existingData.value[key].splice(index, 1)
  }

  return {
    showAudioTrimmer,
    currentAudioFile,
    currentAudioIndex,
    trimmedAudioIndexes,
    handleMedia,
    handleAudioTrimmed,
    handleAudioTrimCancel,
    removeExisting,
    isExtractingAudio,
    extractProgress,
    cancelExtract,
    extractAudioFromVideo
  }
}