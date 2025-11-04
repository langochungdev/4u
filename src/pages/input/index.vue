<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useContext } from "@/composables/useContext";
import { useCloudinary } from "@/composables/useCloudinary";
import { usePreviewStore } from "@/stores/previewStore";
import { getTemplateConfig, isValidTemplate } from "@/config/templates";

const route = useRoute();
const router = useRouter();
const { content, loading, submit, imageManager, videoManager, audioManager, fetchContext, update, addContentItem, removeContentItem, updateContentItem } = useContext();
const { upload, totalProgress, prepareUpload } = useCloudinary();
const previewStore = usePreviewStore();

const isEditMode = ref(false);
const currentId = ref<string | null>(null);
const existingData = ref<any>(null);
const deletedUrls = ref<string[]>([]);

const constraints = ref({
    maxImages: Infinity,
    maxVideos: Infinity,
    maxAudios: Infinity,
    maxContent: Infinity,
    template: 'default'
});

const managers = { image: imageManager, video: videoManager, audio: audioManager };
const labels = { image: 'ảnh', video: 'video', audio: 'audio' };

const getCount = (type: 'image' | 'video' | 'audio') => 
    managers[type].files.value.length + (existingData.value?.[`${type}s`]?.length || 0);

const canAdd = computed(() => ({
    image: getCount('image') < constraints.value.maxImages,
    video: getCount('video') < constraints.value.maxVideos,
    audio: getCount('audio') < constraints.value.maxAudios,
    content: content.value.length < constraints.value.maxContent
}));

const remaining = computed(() => ({
    image: constraints.value.maxImages - getCount('image'),
    video: constraints.value.maxVideos - getCount('video'),
    audio: constraints.value.maxAudios - getCount('audio')
}));

const mediaTypes = computed(() => [
    { key: 'image' as const, label: 'Ảnh', max: constraints.value.maxImages },
    { key: 'video' as const, label: 'Video', max: constraints.value.maxVideos },
    { key: 'audio' as const, label: 'Audio', max: constraints.value.maxAudios }
]);

const removeExisting = (type: 'image' | 'video' | 'audio', index: number) => {
    if (!existingData.value) return;
    const key = `${type}s`;
    deletedUrls.value.push(existingData.value[key][index]);
    existingData.value[key].splice(index, 1);
};

const handleMedia = (e: Event, type: 'image' | 'video' | 'audio') => {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    
    const max = constraints.value[`max${type.charAt(0).toUpperCase() + type.slice(1)}s` as keyof typeof constraints.value] as number;
    const current = getCount(type);
    
    if (current >= max) {
        alert(`Chỉ được phép tối đa ${max} ${labels[type]}!`);
        input.value = '';
        return;
    }
    
    const allowed = max - current;
    const files = Array.from(input.files).slice(0, allowed);
    
    if (input.files.length > allowed) {
        alert(`Chỉ thêm được ${allowed} ${labels[type]} nữa. Đã chọn ${allowed}/${input.files.length}.`);
    }
    
    managers[type].addFiles(files);
    input.value = '';
};

const validate = () => {
    const validContents = content.value.filter(c => c.trim());
    
    if (constraints.value.maxContent !== Infinity && validContents.length < constraints.value.maxContent) {
        alert(`Vui lòng nhập đủ ${constraints.value.maxContent} nội dung. Hiện tại: ${validContents.length}/${constraints.value.maxContent}`);
        return false;
    }
    if (constraints.value.maxContent === Infinity && !validContents.length) {
        alert("Vui lòng nhập ít nhất một nội dung.");
        return false;
    }

    for (const type of ['image', 'video', 'audio'] as const) {
        const max = constraints.value[`max${type.charAt(0).toUpperCase() + type.slice(1)}s` as keyof typeof constraints.value] as number;
        const current = getCount(type);
        if (max !== Infinity && current < max) {
            alert(`Vui lòng tải lên đủ ${max} ${labels[type]}. Hiện tại: ${current}/${max}`);
            return false;
        }
    }

    return true;
};

const handlePreview = () => {
    if (!validate()) return;

    const templateName = route.query.template as string || 'demo';
    
    previewStore.setPreviewData({
        content: content.value.filter(c => c.trim()),
        images: [...(existingData.value?.images || []), ...imageManager.previews.value],
        videos: [...(existingData.value?.videos || []), ...videoManager.previews.value],
        audios: [...(existingData.value?.audios || []), ...audioManager.previews.value],
        imageFiles: imageManager.files.value,
        videoFiles: videoManager.files.value,
        audioFiles: audioManager.files.value,
        template: templateName,
        editId: isEditMode.value ? currentId.value : undefined,
        deletedUrls: isEditMode.value ? deletedUrls.value : undefined
    });

    router.push({ path: `/${templateName}`, query: { preview: 'true' } });
};

const handleSubmit = async () => {
    if (!validate()) return;

    loading.value = true;
    prepareUpload(imageManager.files.value.length + videoManager.files.value.length + audioManager.files.value.length);

    try {
        const [imageUrls, videoUrls, audioUrls] = await Promise.all([
            imageManager.files.value.length ? upload(imageManager.files.value) : [],
            videoManager.files.value.length ? upload(videoManager.files.value) : [],
            audioManager.files.value.length ? upload(audioManager.files.value) : []
        ]);

        if (isEditMode.value && currentId.value) {
            await update(
                currentId.value,
                [...(existingData.value?.images || []), ...imageUrls],
                [...(existingData.value?.videos || []), ...videoUrls],
                [...(existingData.value?.audios || []), ...audioUrls],
                deletedUrls.value
            );
            console.log("Cập nhật thành công!");
            deletedUrls.value = [];
            
            // Redirect to result page after update
            const templateName = route.query.template as string || 'demo';
            router.push({
                name: 'Result',
                params: { id: currentId.value },
                query: { template: templateName }
            });
        } else {
            const id = await submit(imageUrls, videoUrls, audioUrls);
            if (id) {
                const templateName = route.query.template as string || 'demo';
                // Redirect to result page after create
                router.push({
                    name: 'Result',
                    params: { id },
                    query: { template: templateName }
                });
            }
        }

        previewStore.clear();
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    const templateName = route.params.id as string;
    
    if (templateName && route.query.id && await isValidTemplate(templateName)) {
        const config = await getTemplateConfig(templateName);
        if (config) {
            await router.replace({
                name: 'Input',
                params: { id: route.query.id as string },
                query: {
                    maxImages: config.maxImages.toString(),
                    maxVideos: config.maxVideos.toString(),
                    maxAudios: config.maxAudios.toString(),
                    maxContent: config.maxContent.toString(),
                    template: config.templateName
                }
            });
        }
    }
    
    // Load constraints
    ['maxImages', 'maxVideos', 'maxAudios', 'maxContent'].forEach(key => {
        if (route.query[key]) (constraints.value as any)[key] = parseInt(route.query[key] as string);
    });
    if (route.query.template) constraints.value.template = route.query.template as string;

    // Init content array
    if (constraints.value.maxContent !== Infinity && constraints.value.maxContent > 0) {
        content.value = Array(constraints.value.maxContent).fill("");
    }

    // Load existing
    const id = route.params.id as string;
    if (id) {
        isEditMode.value = true;
        currentId.value = id;
        existingData.value = await fetchContext(id);
    }

    // Restore preview
    if ((route.query.fromPreview === 'true' || route.query.confirmPreview === 'true') && previewStore.hasData) {
        content.value = [...previewStore.content];
        if (previewStore.imageFiles.length) imageManager.addFiles(previewStore.imageFiles);
        if (previewStore.videoFiles.length) videoManager.addFiles(previewStore.videoFiles);
        if (previewStore.audioFiles.length) audioManager.addFiles(previewStore.audioFiles);
        if (previewStore.editId) {
            isEditMode.value = true;
            currentId.value = previewStore.editId;
            deletedUrls.value = previewStore.deletedUrls || [];
            
            // Filter out deleted URLs from existingData
            if (existingData.value && deletedUrls.value.length > 0) {
                existingData.value.images = existingData.value.images.filter((url: string) => !deletedUrls.value.includes(url));
                if (existingData.value.videos) {
                    existingData.value.videos = existingData.value.videos.filter((url: string) => !deletedUrls.value.includes(url));
                }
                if (existingData.value.audios) {
                    existingData.value.audios = existingData.value.audios.filter((url: string) => !deletedUrls.value.includes(url));
                }
            }
        }
        if (route.query.confirmPreview === 'true') await handleSubmit();
    }
});
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-4">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ isEditMode ? 'Chỉnh sửa e-Card' : 'Tạo e-Card' }}</h1>
            
            <!-- Template info -->
            <div v-if="constraints.template !== 'default'" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p class="text-sm text-blue-800">
                    <span class="font-semibold">📋 Template: {{ constraints.template }}</span>
                </p>
                <p class="text-xs text-blue-600 mt-1">
                    Giới hạn: 
                    {{ constraints.maxContent !== Infinity ? `${constraints.maxContent} nội dung` : 'không giới hạn nội dung' }} · 
                    {{ constraints.maxImages !== Infinity ? `${constraints.maxImages} ảnh` : 'không giới hạn ảnh' }} · 
                    {{ constraints.maxVideos !== Infinity ? `${constraints.maxVideos} video` : 'không giới hạn video' }} · 
                    {{ constraints.maxAudios !== Infinity ? `${constraints.maxAudios} audio` : 'không giới hạn audio' }}
                </p>
            </div>

            <div class="space-y-4">
                <!-- Content -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-sm font-medium text-gray-700">
                            Nội dung <span class="text-red-500">*</span>
                            <span v-if="constraints.maxContent !== Infinity" class="text-xs text-red-500 font-normal">
                                (Bắt buộc: {{ constraints.maxContent }})
                            </span>
                        </label>
                        <button 
                            v-if="constraints.maxContent === Infinity"
                            @click="addContentItem" 
                            :disabled="!canAdd.content"
                            :class="['text-sm px-3 py-1 rounded-md transition-colors', canAdd.content ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white cursor-not-allowed']"
                        >
                            + Thêm
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div v-for="(item, index) in content" :key="index" class="flex gap-2">
                            <textarea 
                                :value="item" 
                                @input="updateContentItem(index, ($event.target as HTMLTextAreaElement).value)"
                                :placeholder="`Nội dung ${index + 1}`" 
                                rows="3" 
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            ></textarea>
                            <button 
                                v-if="constraints.maxContent === Infinity && content.length > 1"
                                @click="removeContentItem(index)" 
                                class="bg-red-500 text-white px-3 rounded-md hover:bg-red-600 self-start mt-1"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Media sections -->
                <div v-for="media in mediaTypes" :key="media.key" v-show="media.max > 0">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ media.label }}
                        <span v-if="media.max !== Infinity" class="text-xs text-red-500">
                            (Bắt buộc: {{ media.max }} - Còn: {{ remaining[media.key] }})
                        </span>
                        <span v-else class="text-xs text-gray-500">(không bắt buộc)</span>
                    </label>
                    <input 
                        :type="'file'" 
                        :id="`${media.key}Input`" 
                        multiple 
                        :accept="`${media.key}/*`" 
                        @change="handleMedia($event, media.key)" 
                        class="hidden" 
                        :disabled="!canAdd[media.key]" 
                    />
                    <label 
                        :for="`${media.key}Input`" 
                        :class="['inline-block text-white px-4 py-2 rounded-md', canAdd[media.key] ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' : 'bg-gray-400 cursor-not-allowed']"
                    >
                        Chọn {{ media.key === 'image' ? 'ảnh' : media.key }}
                    </label>
                    
                    <!-- New files preview -->
                    <div v-if="managers[media.key].previews.value.length" class="mt-2">
                        <div :class="media.key === 'audio' ? 'space-y-2' : media.key === 'video' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'">
                            <div v-for="(p, i) in managers[media.key].previews.value" :key="i" :class="media.key === 'audio' ? 'flex items-center space-x-2 bg-gray-100 p-2 rounded-md' : 'relative'">
                                <img v-if="media.key === 'image'" :src="p" class="w-full h-24 object-cover rounded-md" />
                                <video v-else-if="media.key === 'video'" :src="p" controls class="w-full h-24 object-cover rounded-md"></video>
                                <audio v-else :src="p" controls :class="media.key === 'audio' ? 'flex-1' : ''"></audio>
                                <button @click="managers[media.key].removeFile(i)" :class="media.key === 'audio' ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600' : 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'">×</button>
                            </div>
                        </div>
                    </div>

                    <!-- Existing files -->
                    <div v-if="isEditMode && existingData && existingData[`${media.key}s`]?.length" class="mt-2">
                        <h4 class="text-xs font-medium text-gray-600 mb-1">{{ media.label }} hiện có:</h4>
                        <div :class="media.key === 'audio' ? 'space-y-2' : media.key === 'video' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'">
                            <div v-for="(url, i) in existingData[`${media.key}s`]" :key="i" :class="media.key === 'audio' ? 'flex items-center space-x-2 bg-gray-100 p-2 rounded-md' : 'relative'">
                                <img v-if="media.key === 'image'" :src="url" class="w-full h-24 object-cover rounded-md" />
                                <video v-else-if="media.key === 'video'" :src="url" controls class="w-full h-24 object-cover rounded-md"></video>
                                <audio v-else :src="url" controls :class="media.key === 'audio' ? 'flex-1' : ''"></audio>
                                <button @click="removeExisting(media.key, i)" :class="media.key === 'audio' ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600' : 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'">×</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Submit -->
                <div v-if="loading" class="w-full">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-700">{{ totalProgress > 0 ? "Đang tải lên..." : "Đang xử lý..." }}</span>
                        <span v-if="totalProgress > 0" class="text-sm font-medium text-gray-700">{{ totalProgress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-10 flex items-center px-2">
                        <div 
                            class="bg-pink-500 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-sm font-medium"
                            :style="{ width: (totalProgress || 10) + '%' }"
                        >
                            <span v-if="totalProgress >= 20">{{ totalProgress }}%</span>
                        </div>
                    </div>
                </div>
                <div v-else class="flex gap-3">
                    <button @click="handlePreview" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Xem trước</button>
                    <button @click="handleSubmit" class="flex-1 bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600">{{ isEditMode ? "Cập nhật" : "Xác nhận" }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
