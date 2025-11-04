<template>
  <div class="app-container">
    <router-view v-slot="{ Component, route }">
      <component :is="Component" />
      
      <!-- Back button - only show in preview mode -->
      <div v-if="route.meta.showBackButton && route.query.preview === 'true'" class="fixed bottom-6 right-6">
        <button 
          @click="handleBackButton(route)"
          class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Quay lại
        </button>
      </div>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { getTemplateConfig } from '@/config/templates';
import { usePreviewStore } from '@/stores/previewStore';

const router = useRouter();
const previewStore = usePreviewStore();

const handleBackButton = async (currentRoute: any) => {
  const isPreviewMode = currentRoute.query.preview === 'true';
  
  // Get template name from route path (e.g., /demo2 -> demo2)
  const pathSegments = currentRoute.path.split('/').filter((s: string) => s);
  const templateName = (currentRoute.query.template as string) || 
                       (previewStore.template) || 
                       (pathSegments[0]) || 
                       'demo';
  
  const templateConfig = await getTemplateConfig(templateName);
  
  if (!templateConfig) {
    console.error(`Template "${templateName}" not found`);
    return;
  }
  
  // Get edit ID from current route params or preview store
  const editId = currentRoute.params.id || previewStore.editId;
  
  router.push({
    name: 'Input',
    params: editId ? { id: editId } : {},
    query: {
      maxImages: templateConfig.maxImages.toString(),
      maxVideos: templateConfig.maxVideos.toString(),
      maxAudios: templateConfig.maxAudios.toString(),
      maxContent: templateConfig.maxContent.toString(),
      template: templateConfig.templateName,
      ...(isPreviewMode && { fromPreview: 'true' })
    }
  });
};
</script>

<style>
.app-container {
  position: relative;
  min-height: 100vh;
}
</style>
