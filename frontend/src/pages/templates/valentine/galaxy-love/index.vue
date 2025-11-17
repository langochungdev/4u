<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useTemplateData } from '@/composables/useTemplateData';
import TEMPLATE_CONFIG from './config';
import { initGalaxyScene } from './galaxyScene';

const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(true);
let cleanupFn: (() => void) | null = null;

// Detect iOS devices (iPhone, iPad, iPod)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

onMounted(async () => {
  await nextTick();
  if (canvasRef.value) {
    // Initialize immediately without waiting
    cleanupFn = initGalaxyScene(
      canvasRef.value,
      [],
      []
    );
    // Hide loading after first frame (instant on iOS)
    if (isIOS) {
      // iOS: hide loading immediately to prevent overlay blocking touch
      isLoading.value = false;
    } else {
      // Android/Desktop: show loading animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isLoading.value = false;
        });
      });
    }
  }
});

watch(contextData, async (data) => {
  if (data && canvasRef.value) {
    if (!isIOS) {
      isLoading.value = true;
    }
    if (cleanupFn) {
      cleanupFn();
    }
    await nextTick();
    cleanupFn = initGalaxyScene(
      canvasRef.value,
      data.content || [],
      data.images || []
    );
    if (isIOS) {
      isLoading.value = false;
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isLoading.value = false;
        });
      });
    }
  }
});

onUnmounted(() => {
  if (cleanupFn) {
    cleanupFn();
  }
});
</script>

<template>
  <div class="galaxy-container">
    <!-- Touch activation layer - ensures immediate touch response on mobile -->
    <div class="touch-activator"></div>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">Đang tải vũ trụ...</p>
      </div>
    </div>
    <canvas ref="canvasRef" id="scene" :class="{ 'ready': !isLoading }"></canvas>
    <div id="err" class="error">Không tải được thư viện 3D. Kiểm tra kết nối CDN.</div>
  </div>
</template>

<style scoped>
.galaxy-container {
  position: fixed;
  inset: 0;
  background: radial-gradient(1200px 800px at 50% 60%, #0a0610 0%, #12041a 50%, #05020b 100%);
  overflow: hidden;
  touch-action: none;
  overscroll-behavior: none;
  -webkit-user-select: none;
  user-select: none;
  will-change: transform;
}

.touch-activator {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: auto;
  touch-action: none;
  background: transparent;
}

#scene {
  position: fixed;
  inset: 0;
  z-index: 2;
  touch-action: none;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  will-change: transform, opacity;
  pointer-events: auto;
}

#scene.ready {
  opacity: 1;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(1200px 800px at 50% 60%, #0a0610 0%, #12041a 50%, #05020b 100%);
  z-index: 100;
  transition: opacity 0.3s ease-in-out;
  pointer-events: none;
}

.loading-overlay:not([v-if]) {
  opacity: 0;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #00ffff;
  border-right-color: #ff00ff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.error {
  position: fixed;
  inset: 0;
  display: none;
  place-items: center;
  color: #ffd1d1;
  font-family: system-ui, Segoe UI, Roboto, Arial;
  text-align: center;
  padding: 16px;
}
</style>
