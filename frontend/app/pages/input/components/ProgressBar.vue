<template>
  <div v-if="isActive" class="w-full">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-gray-700">{{ totalProgress > 0 ? "Đang tải lên..." : "Đang xử lý..." }}</span>
      <span v-if="totalProgress > 0" class="text-sm font-medium text-gray-700">{{ totalProgress }}%</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: (totalProgress || 10) + '%' }"
      >
        <span v-if="totalProgress >= 20" class="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">{{ totalProgress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCloudinary } from "~/composables/useCloudinary"

const props = defineProps<{
  imageFiles: File[]
  videoFiles: File[]
  audioFiles: File[]
  isActive: boolean
}>()

const emit = defineEmits<{
  uploaded: [urls: { images: string[], videos: string[], audios: string[] }]
}>()

const { upload, totalProgress, prepareUpload } = useCloudinary()

watch(() => props.isActive, async (newVal) => {
  if (newVal) {
    await performUpload()
  }
})

const performUpload = async () => {
  prepareUpload(props.imageFiles.length + props.videoFiles.length + props.audioFiles.length)

  const [imageUrls, videoUrls, audioUrls] = await Promise.all([
    props.imageFiles.length ? upload(props.imageFiles) : [],
    props.videoFiles.length ? upload(props.videoFiles) : [],
    props.audioFiles.length ? upload(props.audioFiles) : []
  ])

  emit('uploaded', { images: imageUrls, videos: videoUrls, audios: audioUrls })
}

watch(totalProgress, (newProgress) => {
  // Optional: do something with progress
})
</script>