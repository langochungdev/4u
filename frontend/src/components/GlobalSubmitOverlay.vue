<template>
  <teleport to="body">
    <div v-if="overlay.isSubmitting" class="global-submit-overlay">
      <div class="window-border" style="width: 90%; max-width: 720px;">
        <div class="window">
          <div class="title-bar">
            <div class="icon"></div>
            <span class="font-semibold text-sm">Đang xử lý...</span>
            <div class="title-bar-buttons"></div>
          </div>
          <div class="text-area">
            <div class="input-content flex flex-col items-center justify-center p-8">
              <div class="mb-4 text-sm text-gray-700">Đang tải lên, vui lòng chờ...</div>
              <div class="w-full">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (totalProgress || 10) + '%' }">
                    <span v-if="totalProgress >= 20" class="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">{{ totalProgress }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useCloudinary } from '@/composables/useCloudinary'
import { useGlobalOverlay } from '@/stores/globalOverlay'

const { totalProgress } = useCloudinary()
const overlay = useGlobalOverlay()
</script>

<style scoped>
.global-submit-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
}
</style>
