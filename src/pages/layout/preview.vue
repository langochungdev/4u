<template>
    <!-- Preview layout - for template pages with preview functionality -->
    <div class="preview-layout">
        <slot />
        
        <!-- Back button - only show in preview mode -->
        <div v-if="showBackButton && isPreviewMode" class="fixed bottom-6 right-6 z-50">
            <button 
                @click="handleBackButton"
                class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg shadow-lg transition-colors flex items-center gap-2"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Quay lại
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTemplateConfig } from '@/config/templates';
import { usePreviewStore } from '@/stores/previewStore';

const route = useRoute();
const router = useRouter();
const previewStore = usePreviewStore();

const isPreviewMode = computed(() => route.query.preview === 'true');
const showBackButton = computed(() => route.meta.showBackButton === true);

const handleBackButton = async () => {
    // Get template name from route path (e.g., /demo2 -> demo2)
    const pathSegments = route.path.split('/').filter((s: string) => s);
    const templateName = (route.query.template as string) || 
                         (previewStore.template) || 
                         (pathSegments[0]) || 
                         'demo';
    
    const templateConfig = await getTemplateConfig(templateName);
    
    if (!templateConfig) {
        console.error(`Template "${templateName}" not found`);
        return;
    }
    
    // Get edit ID from current route params or preview store
    const editId = route.params.id || previewStore.editId;
    
    // Get topic from query or preview store
    const topic = (route.query.topic as string) || previewStore.topic || '';
    
    // Build query object
    const query: Record<string, string> = {
        maxImages: templateConfig.maxImages.toString(),
        maxVideos: templateConfig.maxVideos.toString(),
        maxAudios: templateConfig.maxAudios.toString(),
        maxContent: templateConfig.maxContent.toString(),
        template: templateConfig.templateName,
        fromPreview: 'true'
    };
    
    // Only add topic if it's not empty
    if (topic) {
        query.topic = topic;
    }
    
    router.push({
        name: 'Input',
        params: editId ? { id: editId } : {},
        query
    });
};
</script>

<style scoped>
.preview-layout {
    position: relative;
    min-height: 100vh;
}
</style>
