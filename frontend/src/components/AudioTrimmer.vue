<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import { useAudioTrimmer } from '@/composables/useAudioTrimmer'

const props = defineProps<{
  file: File
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'trimmed': [file: File]
  'cancel': []
}>()

const { trimAudio, isTrimming, trimProgress } = useAudioTrimmer()

const waveformContainer = ref<HTMLDivElement | null>(null)
const wavesurfer = ref<WaveSurfer | null>(null)
const regionsPlugin = ref<any>(null)
const currentRegion = ref<any>(null)

const startTime = ref(0)
const duration = ref(15)
const audioDuration = ref(0)
const isPlaying = ref(false)
const playTimeout = ref<number | null>(null)
const error = ref('')
const isLoading = ref(true)

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const initWaveSurfer = async () => {
  if (!waveformContainer.value || !props.file) {
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    
    if (wavesurfer.value) {
      wavesurfer.value.destroy()
    }

    regionsPlugin.value = RegionsPlugin.create()

    wavesurfer.value = WaveSurfer.create({
      container: waveformContainer.value,
      waveColor: '#4F46E5',
      progressColor: '#818CF8',
      cursorColor: '#312E81',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 128,
      normalize: true,
      plugins: [regionsPlugin.value]
    })

    wavesurfer.value.on('ready', () => {
      const duration = wavesurfer.value?.getDuration() || 0
      audioDuration.value = duration
      isLoading.value = false
      if (duration > 0) {
        createInitialRegion()
      } else {
        error.value = 'File audio không hợp lệ hoặc quá ngắn'
      }
    })

    wavesurfer.value.on('click', (relativeX: number) => {
      if (wavesurfer.value) {
        const clickTime = relativeX * wavesurfer.value.getDuration()
        updateRegion(clickTime)
      }
    })

    wavesurfer.value.on('finish', () => {
      isPlaying.value = false
      if (playTimeout.value) {
        clearTimeout(playTimeout.value)
        playTimeout.value = null
      }
    })

    wavesurfer.value.on('error', () => {
      error.value = 'Lỗi khi tải file audio'
      isLoading.value = false
    })

  const url = URL.createObjectURL(props.file)
  await wavesurfer.value.load(url)

  } catch (_err) {
    error.value = 'Không thể tải file audio'
    isLoading.value = false
  }
}

const createInitialRegion = () => {
  if (!regionsPlugin.value || !wavesurfer.value) {
    return
  }

  const maxEnd = Math.min(duration.value, audioDuration.value)
  // region creation
  
  if (currentRegion.value) {
    currentRegion.value.remove()
  }

  currentRegion.value = regionsPlugin.value.addRegion({
    start: 0,
    end: maxEnd,
    color: 'rgba(99, 102, 241, 0.3)',
    drag: false,
    resize: false
  })

  startTime.value = 0
}

const updateRegion = (newStartTime: number) => {
  if (!regionsPlugin.value || !wavesurfer.value) return

  const maxStart = Math.max(0, audioDuration.value - duration.value)
  startTime.value = Math.min(newStartTime, maxStart)
  
  const endTime = Math.min(startTime.value + duration.value, audioDuration.value)

  if (currentRegion.value) {
    currentRegion.value.remove()
  }

  currentRegion.value = regionsPlugin.value.addRegion({
    start: startTime.value,
    end: endTime,
    color: 'rgba(99, 102, 241, 0.3)',
    drag: false,
    resize: false
  })
  
  playPreview()
}

const playPreview = () => {
  if (!wavesurfer.value || !currentRegion.value) return

  const endTime = Math.min(startTime.value + duration.value, audioDuration.value)
  
  wavesurfer.value.setTime(startTime.value)
  wavesurfer.value.play()
  isPlaying.value = true

  if (playTimeout.value) {
    clearTimeout(playTimeout.value)
    playTimeout.value = null
  }
  playTimeout.value = window.setTimeout(() => {
    wavesurfer.value?.pause()
    isPlaying.value = false
    playTimeout.value = null
  }, (endTime - startTime.value) * 1000)
}

const stopPreview = () => {
  if (!wavesurfer.value) return
  wavesurfer.value.pause()
  wavesurfer.value.setTime(startTime.value)
  isPlaying.value = false
  if (playTimeout.value) {
    clearTimeout(playTimeout.value)
    playTimeout.value = null
  }
}

const handleTrim = async () => {
  try {
    error.value = ''
    const trimmedFile = await trimAudio(props.file, startTime.value, duration.value)
    emit('trimmed', trimmedFile)
    handleClose()
  } catch (err) {
    error.value = 'Không thể cắt audio. Vui lòng thử lại.'
  }
}

const handleClose = () => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
    wavesurfer.value = null
  }
  if (playTimeout.value) {
    clearTimeout(playTimeout.value)
    playTimeout.value = null
  }
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    isLoading.value = true
    audioDuration.value = 0
    startTime.value = 0
    setTimeout(() => {
      initWaveSurfer()
    }, 300)
  } else {
    if (wavesurfer.value) {
      wavesurfer.value.destroy()
      wavesurfer.value = null
    }
    isLoading.value = true
    audioDuration.value = 0
  }
})

onMounted(() => {
  // mounted
  if (props.modelValue) {
    setTimeout(() => {
      initWaveSurfer()
    }, 300)
  }
})

onUnmounted(() => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
  }
})
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
    <div class="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
      <div class="window-border">
        <div class="window trimmer-window">
          <div class="title-bar">
            <div class="icon"></div>
            <span class="font-semibold text-xs sm:text-sm">Cắt Audio - {{ file.name }}</span>
            <div class="title-bar-buttons">
              <button @click="handleCancel" class="title-bar-button" :disabled="isTrimming">×</button>
            </div>
          </div>

          <div class="text-area p-3 sm:p-4">
            <div v-if="error" class="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs sm:text-sm">
              {{ error }}
            </div>

            <div class="mb-3 sm:mb-4">
              <p v-if="!isLoading && audioDuration" class="text-xs sm:text-sm text-gray-600">
                Tổng thời lượng: <span class="font-medium">{{ formatTime(audioDuration) }}</span>
              </p>
              <p v-if="isLoading" class="text-xs sm:text-sm text-blue-600 animate-pulse">
                Đang tải audio...
              </p>
            </div>

            <div class="mb-4 sm:mb-6 relative">
              <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-300 rounded min-h-24 sm:min-h-32 z-10">
                <div class="text-gray-400 text-xs sm:text-sm">Đang tải waveform...</div>
              </div>
              <div ref="waveformContainer" class="border border-gray-300 rounded overflow-hidden min-h-24 sm:min-h-32"></div>
            </div>

            <div v-if="!isLoading && audioDuration > 0" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-indigo-50 border border-indigo-200 rounded">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <span class="text-xs sm:text-sm font-medium text-gray-700">Vùng được chọn:</span>
                <span class="text-xs sm:text-sm font-bold text-indigo-600">
                  {{ formatTime(startTime) }} → {{ formatTime(Math.min(startTime + duration, audioDuration)) }}
                </span>
              </div>
              <div class="text-xs text-gray-600">
                Click vào waveform để chọn điểm bắt đầu. Tự động cắt {{ duration }} giây từ điểm đã chọn.
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
              <button
                @click="isPlaying ? stopPreview() : playPreview()"
                :disabled="!wavesurfer || isTrimming || isLoading || audioDuration === 0"
                class="win2k-button flex-1 text-xs sm:text-sm py-2 sm:py-2"
              >
                {{ isPlaying ? '⏸ Dừng' : '▶ Nghe thử' }}
              </button>
              <button
                @click="handleTrim"
                :disabled="!wavesurfer || isTrimming || isLoading || audioDuration === 0"
                class="win2k-button flex-1 text-xs sm:text-sm py-2 sm:py-2"
              >
                {{ isTrimming ? `Đang cắt... ${trimProgress}%` : '✂ Cắt Audio' }}
              </button>
              <button
                @click="handleCancel"
                :disabled="isTrimming"
                class="win2k-button flex-1 text-xs sm:text-sm py-2 sm:py-2"
              >
                Hủy
              </button>
            </div>

            <div v-if="isTrimming" class="w-full">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${trimProgress}%` }"
                >
                  <span v-if="trimProgress >= 20" class="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">{{ trimProgress }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="status-bar">
            <div class="text-center text-xs">
              {{ isLoading ? 'Đang tải...' : isTrimming ? 'Đang xử lý...' : 'Sẵn sàng' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../pages/input/css/style.css';

.trimmer-window {
  background-color: #d0d0c8;
  max-height: 90vh;
}

.title-bar-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-bar-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
}

.title-bar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: white;
  border: 1px solid #808080;
  border-left-color: #404040;
  border-top-color: #404040;
  border-right-color: #d0d0c8;
  border-bottom-color: #d0d0c8;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #082468;
  background: linear-gradient(to right, #082468 0%, #4080d0 100%);
  position: relative;
  transition: width 0.3s ease;
}

@media (max-width: 640px) {
  .title-bar span {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  
  .win2k-button {
    min-height: 32px;
    padding: 4px 8px;
    transition: none; /* disable smooth transitions for immediate response */
  }
}
</style>
