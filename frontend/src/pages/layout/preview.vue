<template>
    <!-- Fullscreen Trigger Overlay - Click anywhere to enter fullscreen (first time only) -->
    <!-- Only show when NOT in preview mode -->
    <div 
        v-if="showFullscreenOverlay && !isPreviewMode" 
        @click="handleFirstClick"
        class="fixed inset-0 z-50 cursor-pointer bg-transparent"
        title="Click để xem toàn màn hình"
    ></div>
    
    
    <!-- Expired Message Overlay -->
    <div v-if="isExpired" class="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div class="max-w-2xl w-full">
            <div class="bg-red-50 border-2 border-red-300 rounded-lg shadow-lg p-8 text-center">
                <div class="text-6xl mb-4">⏰</div>
                <h2 class="text-2xl font-bold text-red-600 mb-3">
                    Link đã hết hạn
                </h2>
                <p class="text-gray-700 mb-2">
                    Nội dung này đã hết hạn vào lúc:
                </p>
                <p class="text-lg font-semibold text-red-500 mb-4">
                    {{ expiresAt?.toLocaleString('vi-VN') }}
                </p>
                
                <!-- 24h countdown -->
                <div class="bg-orange-100 border-2 border-orange-400 rounded-md p-4 mb-4">
                    <p class="text-sm font-semibold text-orange-800 mb-2">
                        ⏳ Thời gian gia hạn còn lại:
                    </p>
                    <p :class="[
                        'text-2xl font-bold',
                        countdown24h === 'Đã quá hạn gia hạn' ? 'text-red-600' : 'text-orange-600'
                    ]">
                        {{ countdown24h }}
                    </p>
                </div>
                
                <div class="bg-yellow-100 border border-yellow-400 rounded-md p-4 mt-4">
                    <p class="text-sm text-yellow-800">
                        💡 <strong>Yêu cầu gia hạn trong 24h tới</strong>
                    </p>
                    <p class="text-xs text-yellow-700 mt-1">
                        Vui lòng liên hệ người tạo để gia hạn nội dung này.
                    </p>
                </div>
                <button 
                    @click="router.push('/')" 
                    class="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    🏠 Về trang chủ
                </button>
            </div>
        </div>
    </div>
    
    <!-- Normal content when not expired or in preview mode -->
    <div v-else class="preview-layout">
        <slot />
        
        <!-- Back button - only show in preview mode -->
        <div v-if="showBackButton && isPreviewMode" class="fixed bottom-6 right-6 z-50">
            <button 
                @click="handleBackButton"
                class="win2k-button flex items-center gap-2"
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
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTemplateConfig } from '@/config/templates';
import { usePreviewStore } from '@/stores/previewStore';
import { contextService } from '@/pages/input/context.service';

const route = useRoute();
const router = useRouter();
const previewStore = usePreviewStore();

const isExpired = ref<boolean>(false);
const expiresAt = ref<Date | null>(null);
const countdown24h = ref<string>('');
const countdownInterval = ref<number | null>(null);
const showFullscreenOverlay = ref<boolean>(true);
const hasRequestedFullscreen = ref<boolean>(false);

const isPreviewMode = computed(() => route.query.preview === 'true');
const showBackButton = computed(() => route.meta.showBackButton === true);

const checkExpiration = (expiryDate: any): boolean => {
    if (!expiryDate) return false;
    
    let expiry: Date | null = null;
    
    // Convert Firestore Timestamp to Date
    if (expiryDate.toDate) {
        expiry = expiryDate.toDate();
    } else if (expiryDate instanceof Date) {
        expiry = expiryDate;
    } else if (typeof expiryDate === 'number') {
        expiry = new Date(expiryDate);
    }
    
    if (expiry) {
        expiresAt.value = expiry;
        return new Date() > expiry;
    }
    
    return false;
};

const updateCountdown24h = () => {
    if (!expiresAt.value) {
        countdown24h.value = '';
        return;
    }
    
    const now = new Date().getTime();
    const expiry = expiresAt.value.getTime();
    const deadline = expiry + (24 * 60 * 60 * 1000); // Add 24 hours
    const distance = deadline - now;
    
    if (distance < 0) {
        countdown24h.value = 'Đã quá hạn gia hạn';
        if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
        }
        return;
    }
    
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    countdown24h.value = `${hours} giờ ${minutes} phút ${seconds} giây`;
};

const startCountdown24h = () => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
    }
    updateCountdown24h();
    countdownInterval.value = window.setInterval(updateCountdown24h, 1000);
};

const requestFullscreen = async () => {
    try {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
            await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
            await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).msRequestFullscreen) {
            await (elem as any).msRequestFullscreen();
        }
    } catch (error) {
        console.log('Fullscreen request failed or denied:', error);
    }
};

const handleFirstClick = async () => {
    if (hasRequestedFullscreen.value) {
        return;
    }
    
    hasRequestedFullscreen.value = true;
    showFullscreenOverlay.value = false;
    
    await requestFullscreen();
};

onMounted(async () => {
    // Only check expiration if we have an ID in params and NOT in preview mode
    const id = route.params.id as string;
    
    if (id && !isPreviewMode.value) {
        try {
            const data = await contextService.getById(id);
            if (data?.expiresAt) {
                isExpired.value = checkExpiration(data.expiresAt);
                if (isExpired.value) {
                    startCountdown24h();
                }
            }
        } catch (error) {
            // Error checking expiration
        }
    }
});

// Cleanup countdown interval
const cleanup = () => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
        countdownInterval.value = null;
    }
};

// Use onBeforeUnmount instead of onUnmounted
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(cleanup);

const handleBackButton = async () => {
    const pathSegments = route.path.split('/').filter((s: string) => s);
    
    let templateName = (route.query.template as string) || previewStore.template;
    
    if (!templateName) {
        if (pathSegments.length === 1) {
            templateName = pathSegments[0] || 'demo';
        } else if (pathSegments.length >= 2) {
            templateName = pathSegments[1] || 'demo';
        } else {
            templateName = 'demo';
        }
    }
    
    const templateConfig = await getTemplateConfig(templateName);
    
    if (!templateConfig) {
        return;
    }
    
    // Use editId from previewStore, NOT from route.params.id (which is template name)
    const editId = previewStore.editId;
    
    let topic = (route.query.topic as string) || previewStore.topic || '';
    
    if (!topic && pathSegments.length >= 2) {
        topic = pathSegments[0] || '';
    }
    
    const query: Record<string, string> = {
        maxImages: templateConfig.maxImages.toString(),
        maxVideos: templateConfig.maxVideos.toString(),
        maxAudios: templateConfig.maxAudios.toString(),
        maxContent: templateConfig.maxContent.toString(),
        template: templateConfig.templateName,
        fromPreview: 'true'
    };
    
    if (topic) {
        query.topic = topic;
    }
    
    // Navigating back to input
    
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

.win2k-button {
    border: 1px outset #d0d0c8;
    background-color: #e0e0e0;
    color: black;
    font-size: 14px;
    padding: 12px 24px;
    cursor: pointer;
    min-width: 120px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    transition: none; /* disable smooth transitions to make clicks immediate */
    touch-action: manipulation; /* hint to browsers to avoid double-tap zoom */
    -webkit-tap-highlight-color: transparent; /* remove highlight on tap for better UX */
}
</style>
