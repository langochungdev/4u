<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { letterService, type LetterPayload } from "@/pages/input/letter.service";
import { usePreviewStore } from "@/stores/previewStore";

const TEMPLATE_CONSTRAINTS = {
    maxImages: 3,
    maxVideos: 1,
    maxAudios: 0,
    templateName: 'demo'
};

const route = useRoute();
const router = useRouter();
const previewStore = usePreviewStore();
const letterData = ref<LetterPayload | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const letterId = ref<string>("");
const imageLoaded = ref<Record<number, boolean>>({});
const imageError = ref<Record<number, boolean>>({});
const videoLoaded = ref<Record<number, boolean>>({});
const videoError = ref<Record<number, boolean>>({});

const isPreviewMode = computed(() => route.query.preview === 'true');

const goToInputWithConstraints = () => {
    router.push({
        name: 'Input',
        query: {
            maxImages: TEMPLATE_CONSTRAINTS.maxImages,
            maxVideos: TEMPLATE_CONSTRAINTS.maxVideos,
            maxAudios: TEMPLATE_CONSTRAINTS.maxAudios,
            template: TEMPLATE_CONSTRAINTS.templateName,
            ...(isPreviewMode.value && { fromPreview: 'true' })
        }
    });
};

const initLoadingStates = (images: string[], videos: string[]) => {
    images.forEach((_, index) => {
        imageLoaded.value[index] = false;
        imageError.value[index] = false;
    });
    videos.forEach((_, index) => {
        videoLoaded.value[index] = false;
        videoError.value[index] = false;
    });
};

onMounted(async () => {
    if (isPreviewMode.value) {
        if (!previewStore.hasData) {
            goToInputWithConstraints();
            return;
        }
        
        letterData.value = {
            title: previewStore.title,
            content: previewStore.content,
            images: previewStore.images,
            videos: previewStore.videos,
            audios: previewStore.audios
        };
        
        initLoadingStates(previewStore.images, previewStore.videos);
        loading.value = false;
        return;
    }

    const id = route.params.id as string;
    if (!id) {
        goToInputWithConstraints();
        return;
    }

    letterId.value = id;
    
    try {
        const data = await letterService.getById(id);
        if (data) {
            letterData.value = data;
            initLoadingStates(data.images || [], data.videos || []);
        } else {
            error.value = "Không tìm thấy dữ liệu";
        }
    } catch (err) {
        console.error("Error fetching letter:", err);
        error.value = "Có lỗi xảy ra khi tải dữ liệu";
    } finally {
        loading.value = false;
    }
});

const onImageLoad = (index: number) => {
    imageLoaded.value[index] = true;
};

const onImageError = (index: number) => {
    imageError.value[index] = true;
};

const onVideoLoad = (index: number) => {
    videoLoaded.value[index] = true;
};

const onVideoError = (index: number) => {
    videoError.value[index] = true;
};
</script>

<template>
    <div class="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
        <div class="max-w-4xl mx-auto">
            <div v-if="loading" class="flex items-center justify-center min-h-screen">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
                    <p class="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>

            <div v-else-if="error" class="flex items-center justify-center min-h-screen">
                <div class="bg-white rounded-lg shadow-lg p-8 text-center">
                    <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Lỗi</h2>
                    <p class="text-gray-600">{{ error }}</p>
                    <router-link to="/" class="inline-block mt-6 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors">
                        Về trang chủ
                    </router-link>
                </div>
            </div>

            <div v-else-if="letterData" class="py-8">
                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h1 class="text-3xl font-bold text-gray-800">{{ letterData.title }}</h1>
                        <router-link 
                            v-if="!isPreviewMode && letterId"
                            :to="{
                                name: 'Input',
                                params: { id: letterId },
                                query: {
                                    maxImages: TEMPLATE_CONSTRAINTS.maxImages,
                                    maxVideos: TEMPLATE_CONSTRAINTS.maxVideos,
                                    maxAudios: TEMPLATE_CONSTRAINTS.maxAudios,
                                    template: TEMPLATE_CONSTRAINTS.templateName
                                }
                            }" 
                            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
                        >
                            Chỉnh sửa
                        </router-link>
                    </div>
                    <div v-if="!isPreviewMode" class="border-t pt-4">
                        <p class="text-sm text-gray-500 mb-2">ID: {{ letterId }}</p>
                        <p class="text-xs text-gray-400">Template: {{ TEMPLATE_CONSTRAINTS.templateName }} ({{ TEMPLATE_CONSTRAINTS.maxImages }} ảnh, {{ TEMPLATE_CONSTRAINTS.maxVideos }} video, {{ TEMPLATE_CONSTRAINTS.maxAudios }} audio)</p>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Nội dung
                    </h2>
                    <div class="prose max-w-none">
                        <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ letterData.content }}</p>
                    </div>
                </div>

                <div v-if="letterData.images && letterData.images.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Hình ảnh ({{ letterData.images.length }})
                    </h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div v-for="(image, index) in letterData.images" :key="index" class="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow bg-gray-100">
                            <div v-if="!imageLoaded[index] && !imageError[index]" class="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div v-else-if="imageError[index]" class="w-full h-64 bg-gray-200 flex items-center justify-center">
                                <div class="text-center text-gray-500">
                                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p class="text-xs">Không thể tải ảnh</p>
                                    <a :href="image" target="_blank" class="text-xs text-blue-500 hover:text-blue-700 mt-1 block">Mở trong tab mới</a>
                                </div>
                            </div>
                            <img 
                                v-show="imageLoaded[index] && !imageError[index]"
                                :src="image" 
                                :alt="`Image ${index + 1}`" 
                                class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                                @load="onImageLoad(index)"
                                @error="onImageError(index)"
                                crossorigin="anonymous"
                            />
                            <a :href="image" target="_blank" class="absolute bottom-2 right-2 bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100 shadow-md">
                                🔍 Xem
                            </a>
                        </div>
                    </div>
                </div>

                <div v-if="letterData.videos && letterData.videos.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Video ({{ letterData.videos.length }})
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="(video, index) in letterData.videos" :key="index" class="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-gray-100">
                            <div v-if="!videoLoaded[index] && !videoError[index]" class="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
                                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div v-else-if="videoError[index]" class="w-full h-48 bg-gray-200 flex items-center justify-center">
                                <div class="text-center text-gray-500">
                                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p class="text-xs">Không thể tải video</p>
                                    <a :href="video" target="_blank" class="text-xs text-blue-500 hover:text-blue-700 mt-1 block">Mở trong tab mới</a>
                                </div>
                            </div>
                            <video 
                                v-show="videoLoaded[index] && !videoError[index]"
                                :src="video" 
                                controls 
                                class="w-full h-auto"
                                :poster="video + '#t=0.1'"
                                @loadeddata="onVideoLoad(index)"
                                @error="onVideoError(index)"
                                crossorigin="anonymous"
                            ></video>
                        </div>
                    </div>
                </div>

                <div v-if="letterData.audios && letterData.audios.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                        </svg>
                        Audio ({{ letterData.audios.length }})
                    </h2>
                    <div class="space-y-3">
                        <div v-for="(audio, index) in letterData.audios" :key="index" class="bg-gray-50 rounded-lg p-4 shadow-sm">
                            <div class="flex items-center space-x-3">
                                <span class="text-sm font-medium text-gray-600 min-w-20">Audio {{ index + 1 }}</span>
                                <audio :src="audio" controls class="flex-1"></audio>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="(!letterData.images || letterData.images.length === 0) && 
                           (!letterData.videos || letterData.videos.length === 0) && 
                           (!letterData.audios || letterData.audios.length === 0)" 
                     class="bg-white rounded-lg shadow-md p-8 text-center">
                    <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                    </svg>
                    <p class="text-gray-500">Chưa có hình ảnh, video hoặc audio nào</p>
                </div>

                <div class="mt-8 text-center">
                    <button 
                        v-if="isPreviewMode"
                        @click="goToInputWithConstraints"
                        class="inline-flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Quay lại
                    </button>
                    <router-link 
                        v-else
                        to="/" 
                        class="inline-flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Về trang chủ
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.prose {
    line-height: 1.75;
}
</style>
