import { ref } from 'vue'
import { MEDIA_LIMITS } from '~/config/app'
import { useAudioTrimmer } from './useAudioTrimmer'

export const useMediaInput = () => {
  const { isExtractingAudio, extractProgress, cancelExtract, extractAudioFromVideo } = useAudioTrimmer()

  const handleMedia = async (e: Event, type: 'image' | 'video' | 'audio') => {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    const max = MEDIA_LIMITS[`max${type.charAt(0).toUpperCase() + type.slice(1)}s` as keyof typeof MEDIA_LIMITS] as number;
    const current = 0; // This will be passed from parent

    if (current >= max) {
      alert(`Chỉ được phép tối đa ${max} ${type === 'image' ? 'ảnh' : type === 'video' ? 'video' : 'audio'}!`);
      input.value = '';
      return;
    }

    const allowed = max - current;
    const files = Array.from(input.files).slice(0, allowed);

    if (input.files.length > allowed) {
      alert(`Chỉ thêm được ${allowed} ${type === 'image' ? 'ảnh' : type === 'video' ? 'video' : 'audio'} nữa. Đã chọn ${allowed}/${input.files.length}.`);
    }

    // For now, just return the files - the actual handling will be done in the parent component
    // This is a simplified version, the full logic should be implemented based on requirements
    input.value = '';
    return files;
  };

  return {
    handleMedia,
    isExtractingAudio,
    extractProgress,
    cancelExtract,
    extractAudioFromVideo
  }
}