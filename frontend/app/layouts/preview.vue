<template>
    <!-- Fullscreen Trigger Overlay - Click anywhere to enter fullscreen (first time only) -->
    <!-- Only show when NOT in preview mode AND NOT on iOS -->
    <div 
        v-if="showFullscreenOverlay && !isPreviewMode && !isIOS" 
        @click="handleFirstClick"
        class="fixed inset-0 z-50 cursor-pointer bg-transparent"
        title="Click để xem toàn màn hình"
    ></div>
    
    
        <!-- Expired Message Overlay (Win2k-inspired responsive window) -->
        <div v-if="isExpired" class="min-h-screen flex items-center justify-center p-6 bg-[#111827]">
            <div class="w-full max-w-2xl">
                <div class="border border-[#d0d0c8] bg-[#d0d0c8] shadow-lg overflow-hidden">
                    <div class="flex items-center justify-between px-3 py-1 bg-gradient-to-r from-[#082468] to-[#a0c8f0] text-white select-none">
                        <div class="flex items-center gap-2">
                            <div aria-hidden class="text-2xl leading-none">⏰</div>
                            <div class="font-semibold text-sm">Link đã hết hạn</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 rounded-sm bg-[#d0d0c8] border border-[#b0b0b0]" aria-hidden="true"></div>
                            <div class="w-4 h-4 rounded-sm bg-[#d0d0c8] border border-[#b0b0b0]" aria-hidden="true"></div>
                            <div class="w-4 h-4 rounded-sm bg-[#d0d0c8] border border-[#b0b0b0]" aria-hidden="true"></div>
                        </div>
                    </div>

                    <div class="bg-white p-6">
                        <div class="text-center">
                            <div class="text-6xl mb-3 text-red-500">⏰</div>
                            <h2 class="text-2xl font-bold text-[#082468] mb-2">Link đã hết hạn</h2>
                            <p class="text-gray-700 mb-2">Nội dung này đã hết hạn vào lúc:</p>
                            <p class="text-lg font-semibold text-red-500 mb-4">{{ expiresAt?.toLocaleString('vi-VN') }}</p>
                        </div>

                        <div class="mx-auto max-w-md bg-[#fff7ed] border border-[#ffedd5] rounded-md p-4 mb-4">
                            <p class="text-sm font-semibold text-[#92400e] mb-2">⏳ Thời gian gia hạn còn lại:</p>
                            <p :class="[
                                'text-2xl font-bold',
                                countdown24h === 'Đã quá hạn gia hạn' ? 'text-red-600' : 'text-orange-600'
                            ]">{{ countdown24h }}</p>
                        </div>

                        <div class="mx-auto max-w-md bg-[#fffbeb] border border-[#fef3c7] rounded-md p-4 mt-2 mb-4">
                            <p class="text-sm text-[#7c2d12]">💡 <strong>Yêu cầu gia hạn trong 24h tới</strong></p>
                            <p class="text-xs text-[#92400e] mt-1">Vui lòng liên hệ người tạo để gia hạn nội dung này.</p>
                        </div>

                        <div class="flex items-center justify-center mt-6">
                            <button @click="router.push('/')" class="bg-[#e0e0e0] text-black border border-[#d0d0c8] px-6 py-2 rounded-md shadow-sm hover:bg-[#f0f0f0] active:translate-y-[1px] transition-transform">
                                🏠 Về trang chủ
                            </button>
                        </div>
                    </div>

                    <div class="px-3 py-2 bg-[#d0d0c8] border-t border-[#b0b0b0] text-xs text-gray-800">Thông tin: nội dung đã bị vô hiệu hoá</div>
                </div>
            </div>
        </div>
    
    <!-- Normal content when not expired or in preview mode -->
    <div v-else class="relative min-h-screen select-none">
        <slot />
        
        <!-- Back button - only show in preview mode -->
        <div v-if="showBackButton && isPreviewMode" class="fixed bottom-6 right-6 z-50">
            <button 
                @click="handleBackButton"
                class="flex items-center gap-2 bg-[#e0e0e0] text-black border border-[#d0d0c8] px-4 py-2 rounded-md shadow-sm hover:bg-[#f0f0f0] active:translate-y-[1px] transition-transform"
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
import { contextService } from '~/pages/input/service/context.service';

const route = useRoute();
const router = useRouter();
const previewStore = usePreviewStore();

const isExpired = ref<boolean>(false);
const expiresAt = ref<Date | null>(null);
const countdown24h = ref<string>('');
const countdownInterval = ref<number | null>(null);
const showFullscreenOverlay = ref<boolean>(true);
const hasRequestedFullscreen = ref<boolean>(false);

// Detect iOS devices
const isIOS = ref(false);

onMounted(() => {
  if (process.client) {
    isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
});

const isPreviewMode = computed(() => route.query.preview === 'true');
const showBackButton = computed(() => {
    // Prioritize explicit page meta value: true -> show, false -> hide
    const metaVal = (route.meta as any)?.showBackButton;
    if (metaVal === true) return true;
    if (metaVal === false) return false;
    // Default: show back button when in preview mode
    return isPreviewMode.value;
});

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

// Helper to set status bar color
const setStatusBarColor = (color: string, appleStyle: string = 'black-translucent') => {
    // Set theme-color for Android/Chrome
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = color;
    
    // Set apple-mobile-web-app-status-bar-style for iOS
    let appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement;
    if (!appleStatusMeta) {
        appleStatusMeta = document.createElement('meta');
        appleStatusMeta.name = 'apple-mobile-web-app-status-bar-style';
        document.head.appendChild(appleStatusMeta);
    }
    appleStatusMeta.content = appleStyle;
    
    // Ensure apple-mobile-web-app-capable is set
    let appleCapableMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]') as HTMLMetaElement;
    if (!appleCapableMeta) {
        appleCapableMeta = document.createElement('meta');
        appleCapableMeta.name = 'apple-mobile-web-app-capable';
        document.head.appendChild(appleCapableMeta);
    }
    appleCapableMeta.content = 'yes';
};

onMounted(async () => {
    // Set status bar to black for preview layout
    setStatusBarColor('#000000', 'black-translucent');
    
    // Hide fullscreen overlay immediately on iOS (Safari doesn't support fullscreen)
    if (isIOS) {
        showFullscreenOverlay.value = false;
        hasRequestedFullscreen.value = true;
    }
    
    // Only check expiration if we have an ID in params and NOT in preview mode
    const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id as string;
    
    if (id && !isPreviewMode.value) {
        try {
            const data = await contextService.getById(id);
            
            // If no data found, already deleted (past 24h grace period)
            if (!data) {
                isExpired.value = true;
                expiresAt.value = new Date(Date.now() - 25 * 60 * 60 * 1000);
                return;
            }
            
            if (data.expiresAt) {
                isExpired.value = checkExpiration(data.expiresAt);
                if (isExpired.value) {
                    startCountdown24h();
                }
            }
        } catch (error) {
            // Error checking expiration - treat as deleted
            isExpired.value = true;
            expiresAt.value = new Date(Date.now() - 25 * 60 * 60 * 1000);
        }
    }
});

// Cleanup countdown interval
const cleanup = () => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
        countdownInterval.value = null;
    }
    
    // Restore status bar color when leaving preview
    const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (themeColorMeta) {
        themeColorMeta.content = 'rgba(22,16,12,0)';
    }
    
    const appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement;
    if (appleStatusMeta) {
        appleStatusMeta.content = 'black-translucent';
    }
};

// Use onBeforeUnmount instead of onUnmounted
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(cleanup);

const handleBackButton = async () => {
    const pathSegments = route.path.split('/').filter((s: string) => s);
    
    console.log('[Back Button] Route path:', route.path);
    console.log('[Back Button] Path segments:', pathSegments);
    console.log('[Back Button] PreviewStore template:', previewStore.template);
    
    let templateName = (route.query.template as string) || previewStore.template;
    
    if (!templateName) {
        // For routes like /christmas/demo1/preview or /_templates/christmas/demo1/preview
        // We need to extract the template name (demo1)
        if (pathSegments.length >= 2) {
            // Check if path contains '_templates'
            const templatesIndex = pathSegments.indexOf('_templates');
            if (templatesIndex >= 0 && pathSegments.length > templatesIndex + 2) {
                // /_templates/christmas/demo1/... -> demo1
                templateName = pathSegments[templatesIndex + 2] || '';
            } else {
                // /christmas/demo1/preview -> demo1
                templateName = pathSegments[pathSegments.length - 2] || ''; // Get second-to-last segment
            }
        } else {
            templateName = ''; // Default fallback
        }
    }
    
    console.log('[Back Button] Detected template name:', templateName);
    
    const templateConfig = await getTemplateConfig(templateName);
    
    if (!templateConfig) {
        console.error('[Back Button] Template config not found for:', templateName);
        console.error('[Back Button] Available path segments:', pathSegments);
        return;
    }
    
    console.log('[Back Button] Template config found:', templateConfig.templateName);
    
    // Use editId from previewStore, NOT from route.params.id (which is template name)
    const editId = previewStore.editId;
    
    let topic = (route.query.topic as string) || previewStore.topic || '';
    
    if (!topic && pathSegments.length >= 2) {
        topic = pathSegments[0] || '';
    }
    
    const query: Record<string, string> = {
        fromPreview: 'true'
    };
    
    if (topic) {
        query.topic = topic;
    }
    
    // Navigating back to input
    // Use templateName as fallback if templateConfig.templateName is undefined
    const targetTemplate = templateConfig.templateName || templateName;
    
    // Put editId into query.id (input page expects id via query)
    const pushQuery = { ...query };
    if (editId) pushQuery.id = editId;
    
    router.push({
        path: `/input/${targetTemplate}`,
        query: pushQuery
    });
};
</script>

<!--
  All styling for preview layout is now done with Tailwind utilities.
  Removed scoped CSS to follow the '100% Tailwind' policy. If you still need
  specific touch-action or select behavior, consider adding a Tailwind utility plugin
  or applying inline attributes selectively.
-->