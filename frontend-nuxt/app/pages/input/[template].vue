<script setup lang="ts">
definePageMeta({
  layout: 'main'
})

import { useInputLogic } from './composables/useInputLogic'
import ProgressBar from './components/ProgressBar.vue'
import AudioTrimmer from './components/AudioTrimmer.vue'

const route = useRoute()

const {
  // Refs
  isEditMode,
  currentId,
  existingData,
  userEmail,
  showEmailModal,
  showAudioTrimmer,
  currentAudioFile,
  currentAudioIndex,
  trimmedAudioIndexes,
  isLoadingTemplate,
  isNavigating,
  isExtractingAudio,
  extractProgress,
  cancelExtract,
  deletedUrls,
  selectedDuration,
  expiresAt,
  countdown,
  countdownInterval,
  constraints,
  stopWatchRef,
  // Computed
  canAdd,
  remaining,
  mediaTypes,
  filledContentCount,
  // Additional
  managers,
  labels,
  // Functions
  handleVerifiedEmail,
  prefetchTemplateShell,
  calculateExpiryDate,
  getMaxForMedia,
  updateCountdown,
  startCountdown,
  removeExisting,
  handleMedia,
  handleAudioTrimmed,
  handleAudioTrimCancel,
  extractAudioFromVideo,
  incrementTemplateStats,
  validate,
  handlePreview,
  handleSubmit,
  // From composables
  content,
  loading,
  imageManager,
  videoManager,
  audioManager,
  addContentItem,
  removeContentItem,
  updateContentItem,
  totalProgress,
  upload,
  prepareUpload,
} = useInputLogic()

const isUploading = ref(false)

const handleUploaded = (urls: { images: string[], videos: string[], audios: string[] }) => {
  isUploading.value = false
  handleSubmit(urls)
}

const handleConfirm = () => {
  const hasFiles = imageManager.files.value.length > 0 || videoManager.files.value.length > 0 || audioManager.files.value.length > 0
  if (hasFiles) {
    isUploading.value = true
  } else {
    handleSubmit()
  }
}

watch(isUploading, async (newVal) => {
  if (newVal) {
    await performUpload()
  }
})

const performUpload = async () => {
  prepareUpload(imageManager.files.value.length + videoManager.files.value.length + audioManager.files.value.length)

  const [imageUrls, videoUrls, audioUrls] = await Promise.all([
    imageManager.files.value.length ? upload(imageManager.files.value) : [],
    videoManager.files.value.length ? upload(videoManager.files.value) : [],
    audioManager.files.value.length ? upload(audioManager.files.value) : []
  ])

  handleUploaded({ images: imageUrls, videos: videoUrls, audios: audioUrls })
}
</script>

<template>
    <EmailOtpModal v-model="showEmailModal" :defaultEmail="userEmail || ''" @verified="handleVerifiedEmail" />
    <AudioTrimmer 
        v-if="currentAudioFile"
        v-model="showAudioTrimmer" 
        :file="currentAudioFile"
        @trimmed="handleAudioTrimmed"
        @cancel="handleAudioTrimCancel"
    />
    <div class="input-container">
        <div class="input-window">
            <div v-if="isLoadingTemplate" class="loading-overlay"><div class="spinner"></div></div>
            
            <!-- Audio extraction progress overlay -->
            <div v-if="isExtractingAudio" class="loading-overlay">
                <div class="window-border" style="width: 90%; max-width: 500px;">
                    <div class="window">
                        <div class="title-bar">
                            <div class="icon"></div>
                            <span class="font-semibold text-sm">🎬 Đang trích xuất audio...</span>
                            <div class="title-bar-buttons"></div>
                        </div>
                        <div class="text-area">
                            <div class="input-content flex flex-col items-center justify-center p-8">
                                <div class="mb-4 text-sm text-gray-700">Vui lòng đợi trong giây lát...</div>
                                <div class="w-full">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm font-medium text-gray-700">Tiến trình</span>
                                        <span class="text-sm font-medium text-gray-700">{{ extractProgress }}%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div 
                                            class="progress-fill"
                                            :style="{ width: extractProgress + '%' }"
                                        >
                                            <span v-if="extractProgress >= 20" class="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">{{ extractProgress }}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-4 text-xs text-gray-500">
                                    💡 Đang chuyển đổi video sang audio...
                                </div>
                                <button 
                                    @click="() => cancelExtract && cancelExtract()"
                                    class="mt-4 win2k-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                >
                                    ❌ Hủy bỏ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Upload progress overlay -->
            <div v-if="isUploading" class="submit-overlay">
                <div class="window-border" style="width: 90%; max-width: 720px;">
                    <div class="window">
                        <div class="title-bar">
                            <div class="icon"></div>
                            <span class="font-semibold text-sm">Đang tải lên...</span>
                            <div class="title-bar-buttons"></div>
                        </div>
                        <div class="text-area">
                            <div class="input-content flex flex-col items-center justify-center p-8">
                                <div class="mb-4 text-sm text-gray-700">Đang tải lên, vui lòng chờ...</div>
                                <div class="w-full">
                                    <div class="progress-bar">
                                        <div 
                                            class="progress-fill"
                                            :style="{ width: (totalProgress || 10) + '%' }"
                                        >
                                            <span v-if="totalProgress >= 20" class="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">{{ totalProgress }}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="window-border">
                <div class="window input-form" v-if="!loading && !isNavigating">
                    <div class="title-bar">
                        <div class="icon"></div>
                        <span class="font-semibold text-sm">Template: {{ constraints.template }}</span>
                        <div class="title-bar-buttons"></div>
                    </div>
                    
                    <div class="text-area">
                        <div class="input-content">
                            
                            <div class="mb-4 p-4 bg-linear-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg shadow-sm">
                                <label class="block text-sm font-semibold text-purple-800 mb-3">
                                    ⏰ Thời hạn duy trì form
                                </label>
                                
                                
                                <div v-if="isEditMode && expiresAt" class="mb-3 p-3 bg-white border border-purple-300 rounded-md">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-medium text-gray-700">Thời gian còn lại:</span>
                                        <span :class="[
                                            'text-sm font-bold',
                                            countdown === 'Đã hết hạn' ? 'text-red-600' : 'text-green-600'
                                        ]">
                                            {{ countdown }}
                                        </span>
                                    </div>
                                    <div class="text-xs text-gray-500 mt-1">
                                        Hết hạn lúc: {{ expiresAt.toLocaleString('vi-VN') }}
                                    </div>
                                </div>

                                
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <label 
                                        v-for="option in [
                                            { value: '1day', label: '1 Ngày', icon: '📅', disabled: isEditMode && !!expiresAt },
                                            { value: '1week', label: '1 Tuần', icon: '📆', disabled: false },
                                            { value: '1month', label: '1 Tháng', icon: '🗓️', disabled: true },
                                            { value: '6months', label: '6 Tháng', icon: '📊', disabled: true }
                                        ]"
                                        :key="option.value"
                                        :class="[
                                            'p-3 border-2 rounded-lg text-center',
                                            option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                                            selectedDuration === option.value && !option.disabled
                                                ? 'border-purple-500 bg-purple-100 shadow-md' 
                                                : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                                        ]"
                                        :style="{ transition: 'none' }"
                                    >
                                        <input 
                                            type="radio" 
                                            :value="option.value" 
                                            v-model="selectedDuration"
                                            class="hidden"
                                            :disabled="option.disabled"
                                            @change="() => {
                                                expiresAt = calculateExpiryDate(selectedDuration);
                                                if (isEditMode && expiresAt) {
                                                    startCountdown();
                                                }
                                            }"
                                        />
                                        <div class="text-2xl mb-1">{{ option.icon }}</div>
                                        <div :class="[
                                            'text-sm font-medium',
                                            selectedDuration === option.value && !option.disabled ? 'text-purple-700' : 'text-gray-700',
                                            option.disabled ? 'text-gray-400' : ''
                                        ]">
                                            {{ option.label }}
                                        </div>
                                    </label>
                                </div>
                                
                                <p class="text-xs text-gray-600 mt-3 italic">
                                    💡 Form sẽ được duy trì đến 0:00 của ngày được tính từ thời điểm hiện tại
                                </p>
                            </div>

                            <div v-if="constraints.template !== 'default'" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p class="text-xs text-blue-600 mt-1">
                                    Giới hạn: 
                                    {{ constraints.maxContent !== Infinity ? `${constraints.maxContent} nội dung` : 'không giới hạn nội dung' }} · 
                                    {{ constraints.maxImages !== Infinity ? `${constraints.maxImages} ảnh` : 'không giới hạn ảnh' }} · 
                                    {{ constraints.maxVideos !== Infinity ? `${constraints.maxVideos} video` : 'không giới hạn video' }} · 
                                    {{ constraints.maxAudios !== Infinity ? `${constraints.maxAudios} audio` : 'không giới hạn audio' }}
                                </p>
                            </div>

                            <div class="space-y-4">
                                
                                <div>
                                    <div class="flex justify-between items-center mb-2">
                                        <label class="block text-sm font-medium text-gray-700">
                                            Nội dung <span class="text-red-500">*</span>
                                            <span v-if="constraints.maxContent !== Infinity && filledContentCount < constraints.maxContent" class="text-xs text-red-500 font-normal">
                                                (Bắt buộc: {{ constraints.maxContent }})
                                            </span>
                                        </label>
                                        <button 
                                            v-if="constraints.maxContent === Infinity"
                                            @click="addContentItem" 
                                            :disabled="!canAdd.content"
                                            :class="['file-input-button', !canAdd.content ? 'file-input-button:disabled' : '']"
                                        >
                                            + Thêm
                                        </button>
                                    </div>
                                    <div class="space-y-3">
                                        <div v-for="(item, index) in content" :key="index" class="flex gap-2">
                                            <textarea 
                                                :value="item" 
                                                @input="updateContentItem(index, ($event.target as HTMLTextAreaElement).value)"
                                                :placeholder="constraints.contentPlaceholders[index] || `Nội dung ${index + 1}`" 
                                                rows="3" 
                                                class="input-field flex-1"
                                            ></textarea>
                                            <button 
                                                v-if="constraints.maxContent === Infinity && content.length > 1"
                                                @click="removeContentItem(index)" 
                                                class="file-input-button"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                
                                <div v-for="media in mediaTypes" :key="media.key" v-show="media.max > 0">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        {{ media.label }}
                                        <span v-if="media.key === 'audio'" class="text-xs text-gray-500">(không bắt buộc)</span>
                                        <span v-else-if="media.max !== Infinity && remaining[media.key] > 0" class="text-xs text-red-500">(Bắt buộc: {{ media.max }} - Còn: {{ remaining[media.key] }})</span>
                                    </label>
                                    <input 
                                        :type="'file'" 
                                        :id="`${media.key}Input`" 
                                        multiple 
                                        :accept="media.key === 'audio' ? 'audio/*,video/mp4,video/webm,video/quicktime,.mp3,.m4a,.wav,.mp4,.webm,.mov' : `${media.key}/*`" 
                                        @change="handleMedia($event, media.key)" 
                                        class="hidden" 
                                        :disabled="!canAdd[media.key]" 
                                    />
                                    <label 
                                        v-if="canAdd[media.key]"
                                        :for="`${media.key}Input`" 
                                        class="file-input-button"
                                    >
                                        Chọn {{ media.key === 'image' ? 'ảnh' : media.key === 'video' ? 'video' : 'nhạc nền' }}
                                    </label>
                                    <div v-else class="text-xs text-gray-500 mt-1">Đã đạt giới hạn: {{ getMaxForMedia(media.key) }}</div>
                                    
                                    
                                    <div v-if="managers[media.key].previews.value.length" class="mt-2">
                                        <div class="media-preview">
                                            <div :class="media.key === 'audio' ? 'space-y-2' : media.key === 'video' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'">
                                                <div v-for="(p, i) in managers[media.key].previews.value" :key="i" :class="media.key === 'audio' ? 'flex items-center space-x-2 bg-gray-100 p-2 rounded-md' : 'relative'">
                                                    <img v-if="media.key === 'image'" :src="p" class="w-full h-24 object-cover rounded-md" />
                                                    <video v-else-if="media.key === 'video'" :src="p" controls class="w-full h-24 object-cover rounded-md"></video>
                                                    <audio v-else :src="p" controls :class="media.key === 'audio' ? 'flex-1' : ''"></audio>
                                                    <button @click="managers[media.key].removeFile(i)" :class="media.key === 'audio' ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shrink-0 cursor-pointer' : 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer'">×</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    
                                    <div v-if="isEditMode && existingData && existingData[`${media.key}s`]?.length" class="mt-2">
                                        <h4 class="text-xs font-medium text-gray-600 mb-1">{{ media.label }} hiện có:</h4>
                                        <div class="media-preview">
                                            <div :class="media.key === 'audio' ? 'space-y-2' : media.key === 'video' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'">
                                                <div v-for="(url, i) in existingData[`${media.key}s`]" :key="i" :class="media.key === 'audio' ? 'flex items-center space-x-2 bg-gray-100 p-2 rounded-md' : 'relative'">
                                                    <img v-if="media.key === 'image'" :src="url" class="w-full h-24 object-cover rounded-md" />
                                                    <video v-else-if="media.key === 'video'" :src="url" controls class="w-full h-24 object-cover rounded-md"></video>
                                                    <audio v-else :src="url" controls class="flex-1"></audio>
                                                    <button @click="removeExisting(media.key, i)" :class="media.key === 'audio' ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 ml-2 cursor-pointer' : 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer'">×</button>
                                          </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="!isUploading" class="submit-buttons">
                                    <button @click="handlePreview" class="win2k-button">
                                        Xem trước
                                    </button>
                                    <button @click="handleConfirm" class="win2k-button">
                                        {{ isEditMode ? "Cập nhật" : "Xác nhận" }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="status-bar">
                        <div class="text-center text-xs">
                            Sẵn sàng
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped src="./css/style.css"></style>