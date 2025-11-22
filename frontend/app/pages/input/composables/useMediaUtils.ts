export const useMediaUtils = (
  imageManager: any,
  videoManager: any,
  audioManager: any,
  existingData: any
) => {
  const labels = { image: 'ảnh', video: 'video', audio: 'audio' }
  const managers = { image: imageManager, video: videoManager, audio: audioManager }

  const getCount = (type: 'image' | 'video' | 'audio') =>
    managers[type].files.value.length + (existingData.value?.[`${type}s`]?.length || 0)

  return {
    labels,
    managers,
    getCount
  }
}
