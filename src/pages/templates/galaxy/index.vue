<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useTemplateData } from '@/composables/useTemplateData';
import TEMPLATE_CONFIG from './galaxy.config';
import { initGalaxyScene } from './galaxyScene';

const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let cleanupFn: (() => void) | null = null;

// Initialize scene immediately when canvas is ready (empty content)
onMounted(() => {
  if (canvasRef.value) {
    // Init with empty data first to show galaxy immediately
    cleanupFn = initGalaxyScene(
      canvasRef.value,
      [],
      []
    );
  }
});

// Watch for data and update scene when available
watch(contextData, (data) => {
  if (data && canvasRef.value) {
    // Cleanup and reinit with actual data
    if (cleanupFn) {
      cleanupFn();
    }
    cleanupFn = initGalaxyScene(
      canvasRef.value,
      data.content || [],
      data.images || []
    );
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
    <canvas ref="canvasRef" id="scene"></canvas>
    <div id="err" class="error">Không tải được thư viện 3D. Kiểm tra kết nối CDN.</div>
  </div>
</template>

<style scoped>
.galaxy-container {
  position: fixed;
  inset: 0;
  background: radial-gradient(1200px 800px at 50% 60%, #0a0610 0%, #12041a 50%, #05020b 100%);
  overflow: hidden;
}

#scene {
  position: fixed;
  inset: 0;
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
