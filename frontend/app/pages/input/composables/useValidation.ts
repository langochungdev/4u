import { useMediaUtils } from './useMediaUtils'

export const useValidation = (
  content: any,
  constraints: any,
  imageManager: any,
  videoManager: any,
  audioManager: any,
  existingData: any
) => {
  const { labels, getCount } = useMediaUtils(imageManager, videoManager, audioManager, existingData)

  const validate = () => {
    const validContents = content.value.filter((c: string) => c.trim())

    if (constraints.value.maxContent !== Infinity && validContents.length < constraints.value.maxContent) {
      alert(`Vui lòng nhập đủ ${constraints.value.maxContent} nội dung. Hiện tại: ${validContents.length}/${constraints.value.maxContent}`)
      return false
    }
    if (constraints.value.maxContent === Infinity && !validContents.length) {
      alert("Vui lòng nhập ít nhất một nội dung.")
      return false
    }

    for (const type of ['image', 'video', 'audio'] as const) {
      const max = constraints.value[`max${type.charAt(0).toUpperCase() + type.slice(1)}s` as keyof typeof constraints.value] as number
      const current = getCount(type)
      if (type === 'audio') continue // audio is optional
      if (max !== Infinity && current < max) {
        alert(`Vui lòng tải lên đủ ${max} ${labels[type]}. Hiện tại: ${current}/${max}`)
        return false
      }
    }

    return true
  }

  return {
    validate
  }
}
