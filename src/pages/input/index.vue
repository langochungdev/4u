<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLetter } from "@/composables/useLetter";
import { createQRFromId } from "@/utils/prCode";
import { useCloudinary } from "@/composables/useCloudinary";
import { usePreviewStore } from "@/stores/previewStore";

const route = useRoute();
const router = useRouter();
const { title, content, loading, submit, imageManager, videoManager, audioManager, fetchLetter, update } = useLetter();
const { upload, totalProgress } = useCloudinary();
const previewStore = usePreviewStore();

const isEditMode = ref(false);
const currentId = ref<string | null>(null);
const existingData = ref<any>(null);
const deletedImageUrls = ref<string[]>([]);
const deletedVideoUrls = ref<string[]>([]);
const deletedAudioUrls = ref<string[]>([]);

const mediaConstraints = ref({
    maxImages: Infinity,
    maxVideos: Infinity,
    maxAudios: Infinity,
    template: 'default'
});

const canAddMoreImages = computed(() => {
    const currentCount = imageManager.files.value.length + (existingData.value?.images?.length || 0);
    return currentCount < mediaConstraints.value.maxImages;
});

const canAddMoreVideos = computed(() => {
    const currentCount = videoManager.files.value.length + (existingData.value?.videos?.length || 0);
    return currentCount < mediaConstraints.value.maxVideos;
});

const canAddMoreAudios = computed(() => {
    const currentCount = audioManager.files.value.length + (existingData.value?.audios?.length || 0);
    return currentCount < mediaConstraints.value.maxAudios;
});

const remainingImages = computed(() => {
    const currentCount = imageManager.files.value.length + (existingData.value?.images?.length || 0);
    return mediaConstraints.value.maxImages - currentCount;
});

const remainingVideos = computed(() => {
    const currentCount = videoManager.files.value.length + (existingData.value?.videos?.length || 0);
    return mediaConstraints.value.maxVideos - currentCount;
});

const remainingAudios = computed(() => {
    const currentCount = audioManager.files.value.length + (existingData.value?.audios?.length || 0);
    return mediaConstraints.value.maxAudios - currentCount;
});

const restorePreviewData = () => {
    title.value = previewStore.title;
    content.value = previewStore.content;
    
    if (previewStore.imageFiles.length > 0) imageManager.addFiles(previewStore.imageFiles);
    if (previewStore.videoFiles.length > 0) videoManager.addFiles(previewStore.videoFiles);
    if (previewStore.audioFiles.length > 0) audioManager.addFiles(previewStore.audioFiles);

    if (previewStore.editId) {
        isEditMode.value = true;
        currentId.value = previewStore.editId;
        if (previewStore.deletedUrls.length > 0) {
            deletedImageUrls.value = previewStore.deletedUrls.filter((url: string) => 
                url.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)/i)
            );
            deletedVideoUrls.value = previewStore.deletedUrls.filter((url: string) => 
                url.includes('video') || url.match(/\.(mp4|webm|ogg)/i)
            );
            deletedAudioUrls.value = previewStore.deletedUrls.filter((url: string) => 
                url.includes('audio') || url.match(/\.(mp3|wav|ogg)/i)
            );
        }
    }
};

onMounted(async () => {
    if (route.query.maxImages) mediaConstraints.value.maxImages = parseInt(route.query.maxImages as string);
    if (route.query.maxVideos) mediaConstraints.value.maxVideos = parseInt(route.query.maxVideos as string);
    if (route.query.maxAudios) mediaConstraints.value.maxAudios = parseInt(route.query.maxAudios as string);
    if (route.query.template) mediaConstraints.value.template = route.query.template as string;

    const id = route.params.id as string;
    if (id) {
        isEditMode.value = true;
        currentId.value = id;
        existingData.value = await fetchLetter(id);
    }

    if (route.query.fromPreview === 'true' && previewStore.hasData) {
        restorePreviewData();
    }

    if (route.query.confirmPreview === 'true' && previewStore.hasData) {
        restorePreviewData();
        await handleSubmit();
    }
});

const removeExistingImage = (index: number) => {
    if (!existingData.value) return;
    const url = existingData.value.images[index];
    deletedImageUrls.value.push(url);
    existingData.value.images.splice(index, 1);
};

const removeExistingVideo = (index: number) => {
    if (!existingData.value) return;
    const url = existingData.value.videos[index];
    deletedVideoUrls.value.push(url);
    existingData.value.videos.splice(index, 1);
};

const removeExistingAudio = (index: number) => {
    if (!existingData.value) return;
    const url = existingData.value.audios[index];
    deletedAudioUrls.value.push(url);
    existingData.value.audios.splice(index, 1);
};

const handleMediaUpload = (e: Event, manager: any, maxCount: number, mediaType: string) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;
    
    const currentCount = manager.files.value.length + (existingData.value?.[`${mediaType}s`]?.length || 0);
    
    if (currentCount >= maxCount) {
        alert(`Chỉ được phép tối đa ${maxCount} ${mediaType} cho template này!`);
        input.value = '';
        return;
    }
    
    const allowedCount = maxCount - currentCount;
    const filesToAdd = Array.from(files).slice(0, allowedCount);
    
    if (files.length > allowedCount) {
        alert(`Chỉ thêm được ${allowedCount} ${mediaType} nữa. Đã chọn ${allowedCount}/${files.length} ${mediaType}.`);
    }
    
    manager.addFiles(filesToAdd);
    input.value = '';
};

const handleImage = (e: Event) => handleMediaUpload(e, imageManager, mediaConstraints.value.maxImages, 'ảnh');
const handleVideo = (e: Event) => handleMediaUpload(e, videoManager, mediaConstraints.value.maxVideos, 'video');
const handleAudio = (e: Event) => handleMediaUpload(e, audioManager, mediaConstraints.value.maxAudios, 'audio');

const handlePreview = () => {
    if (!title.value.trim() || !content.value.trim()) {
        alert("Vui lòng nhập tiêu đề và nội dung.");
        return;
    }

    const templateName = route.query.template as string || 'demo';

    previewStore.setPreviewData({
        title: title.value,
        content: content.value,
        images: [...(existingData.value?.images || []), ...imageManager.previews.value],
        videos: [...(existingData.value?.videos || []), ...videoManager.previews.value],
        audios: [...(existingData.value?.audios || []), ...audioManager.previews.value],
        imageFiles: imageManager.files.value,
        videoFiles: videoManager.files.value,
        audioFiles: audioManager.files.value,
        template: templateName,
        editId: isEditMode.value ? currentId.value : undefined,
        deletedUrls: isEditMode.value ? [
            ...deletedImageUrls.value,
            ...deletedVideoUrls.value,
            ...deletedAudioUrls.value
        ] : undefined
    });

    router.push({
        path: `/${templateName}`,
        query: { preview: 'true' }
    });
};

const handleSubmit = async () => {
    if (!title.value.trim() || !content.value.trim()) {
        alert("Vui lòng nhập tiêu đề và nội dung.");
        return;
    }

    loading.value = true;

    try {
        const imageUrls = imageManager.files.value.length > 0 ? await upload(imageManager.files.value) : [];
        const videoUrls = videoManager.files.value.length > 0 ? await upload(videoManager.files.value) : [];
        const audioUrls = audioManager.files.value.length > 0 ? await upload(audioManager.files.value) : [];

        if (isEditMode.value && currentId.value) {
            const finalImageUrls = [...(existingData.value?.images || []), ...imageUrls];
            const finalVideoUrls = [...(existingData.value?.videos || []), ...videoUrls];
            const finalAudioUrls = [...(existingData.value?.audios || []), ...audioUrls];
            const allDeletedUrls = [...deletedImageUrls.value, ...deletedVideoUrls.value, ...deletedAudioUrls.value];

            await update(currentId.value, finalImageUrls, finalVideoUrls, finalAudioUrls, allDeletedUrls);
            console.log("Cập nhật thành công!");
            
            deletedImageUrls.value = [];
            deletedVideoUrls.value = [];
            deletedAudioUrls.value = [];
        } else {
            const id = await submit(imageUrls, videoUrls, audioUrls);
            if (!id) return;
            const { link: fullLink } = await createQRFromId(id);
            console.log("URL:", fullLink);
        }

        previewStore.clear();
    } catch (error) {
        console.error("Lỗi khi submit:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-4">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div class="mb-4">
                <h1 class="text-2xl font-bold text-gray-800">{{ isEditMode ? 'Chỉnh sửa e-Card' : 'Tạo e-Card' }}</h1>
                <!-- Hiển thị thông tin template constraints -->
                <div v-if="mediaConstraints.template !== 'default'" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p class="text-sm text-blue-800">
                        <span class="font-semibold">📋 Template: {{ mediaConstraints.template }}</span>
                    </p>
                    <p class="text-xs text-blue-600 mt-1">
                        Giới hạn: 
                        <span v-if="mediaConstraints.maxImages !== Infinity">{{ mediaConstraints.maxImages }} ảnh</span>
                        <span v-else>không giới hạn ảnh</span>
                        · 
                        <span v-if="mediaConstraints.maxVideos !== Infinity">{{ mediaConstraints.maxVideos }} video</span>
                        <span v-else>không giới hạn video</span>
                        · 
                        <span v-if="mediaConstraints.maxAudios !== Infinity">{{ mediaConstraints.maxAudios }} audio</span>
                        <span v-else>không giới hạn audio</span>
                    </p>
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề <span class="text-red-500">*</span>
                    </label>
                    <input v-model="title" placeholder="Nhập tiêu đề" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Nội dung <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="content" placeholder="Nhập nội dung" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"></textarea>
                </div>

                <!-- Ảnh Section -->
                <div v-if="mediaConstraints.maxImages > 0">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Ảnh (không bắt buộc)
                        <span v-if="mediaConstraints.maxImages !== Infinity" class="text-xs text-gray-500">
                            - Còn lại: {{ remainingImages }}/{{ mediaConstraints.maxImages }}
                        </span>
                    </label>
                    <input type="file" id="imageInput" multiple accept="image/*" @change="handleImage" class="hidden" :disabled="!canAddMoreImages" />
                    <label for="imageInput" :class="['inline-block text-white px-4 py-2 rounded-md', canAddMoreImages ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed']">Chọn ảnh</label>
                    <div v-if="imageManager.previews.value.length" class="mt-2">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div v-for="(p, i) in imageManager.previews.value" :key="i" class="relative">
                                <img :src="p" class="w-full h-24 object-cover rounded-md" />
                                <button @click="imageManager.removeFile(i)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="isEditMode && existingData && existingData.images.length" class="mt-2">
                        <h4 class="text-xs font-medium text-gray-600 mb-1">Ảnh hiện có:</h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div v-for="(url, i) in existingData.images" :key="i" class="relative">
                                <img :src="url" class="w-full h-24 object-cover rounded-md" />
                                <button @click="removeExistingImage(i)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Video Section -->
                <div v-if="mediaConstraints.maxVideos > 0">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Video (không bắt buộc)
                        <span v-if="mediaConstraints.maxVideos !== Infinity" class="text-xs text-gray-500">
                            - Còn lại: {{ remainingVideos }}/{{ mediaConstraints.maxVideos }}
                        </span>
                    </label>
                    <input type="file" id="videoInput" multiple accept="video/*" @change="handleVideo" class="hidden" :disabled="!canAddMoreVideos" />
                    <label for="videoInput" :class="['inline-block text-white px-4 py-2 rounded-md', canAddMoreVideos ? 'bg-green-500 hover:bg-green-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed']">Chọn video</label>
                    <div v-if="videoManager.previews.value.length" class="mt-2">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div v-for="(p, i) in videoManager.previews.value" :key="i" class="relative">
                                <video :src="p" class="w-full h-24 object-cover rounded-md" controls></video>
                                <button @click="videoManager.removeFile(i)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="isEditMode && existingData && existingData.videos.length" class="mt-2">
                        <h4 class="text-xs font-medium text-gray-600 mb-1">Video hiện có:</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div v-for="(url, i) in existingData.videos" :key="i" class="relative">
                                <video :src="url" class="w-full h-24 object-cover rounded-md" controls></video>
                                <button @click="removeExistingVideo(i)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Audio Section -->
                <div v-if="mediaConstraints.maxAudios > 0">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Audio (không bắt buộc)
                        <span v-if="mediaConstraints.maxAudios !== Infinity" class="text-xs text-gray-500">
                            - Còn lại: {{ remainingAudios }}/{{ mediaConstraints.maxAudios }}
                        </span>
                    </label>
                    <input type="file" id="audioInput" multiple accept="audio/*" @change="handleAudio" class="hidden" :disabled="!canAddMoreAudios" />
                    <label for="audioInput" :class="['inline-block text-white px-4 py-2 rounded-md', canAddMoreAudios ? 'bg-purple-500 hover:bg-purple-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed']">Chọn audio</label>
                    <div v-if="audioManager.previews.value.length" class="mt-2">
                        <div class="space-y-2">
                            <div v-for="(p, i) in audioManager.previews.value" :key="i" class="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                                <audio :src="p" controls class="flex-1"></audio>
                                <button @click="audioManager.removeFile(i)" class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="isEditMode && existingData && existingData.audios.length" class="mt-2">
                        <h4 class="text-xs font-medium text-gray-600 mb-1">Audio hiện có:</h4>
                        <div class="space-y-2">
                            <div v-for="(url, i) in existingData.audios" :key="i" class="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                                <audio :src="url" controls class="flex-1"></audio>
                                <button @click="removeExistingAudio(i)" class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nút submit hoặc progress bar -->
                <div v-if="loading" class="w-full">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-700">
                            {{ totalProgress > 0 ? "Đang tải lên..." : "Đang xử lý..." }}
                        </span>
                        <span v-if="totalProgress > 0" class="text-sm font-medium text-gray-700">{{ totalProgress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-10 flex items-center px-2">
                        <div 
                            class="bg-pink-500 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-sm font-medium"
                            :style="{ width: (totalProgress > 0 ? totalProgress : 10) + '%', minWidth: totalProgress > 0 ? 'auto' : '10%' }"
                        >
                            <span v-if="totalProgress >= 20">{{ totalProgress > 0 ? totalProgress + '%' : '' }}</span>
                        </div>
                    </div>
                </div>
                <!-- Two buttons: Preview and Confirm -->
                <div v-else class="flex gap-3">
                    <button 
                        @click="handlePreview" 
                        class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Xem trước
                    </button>
                    <button 
                        @click="handleSubmit" 
                        class="flex-1 bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 transition-colors"
                    >
                        {{ isEditMode ? "Cập nhật thư" : "Xác nhận" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
