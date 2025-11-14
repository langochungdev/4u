<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useContext } from "@/composables/useContext";
import { useCloudinary } from "@/composables/useCloudinary";
import { usePreviewStore } from "@/stores/previewStore";
import { getTemplateConfig, isValidTemplate } from "@/config/templates";
import "./css/style.css";

const route = useRoute();
const router = useRouter();
const { content, loading, submit, imageManager, videoManager, audioManager, fetchContext, update, addContentItem, removeContentItem, updateContentItem } = useContext();
const { upload, totalProgress, prepareUpload } = useCloudinary();
const previewStore = usePreviewStore();

const isEditMode = ref(false);
const currentId = ref<string | null>(null);
const existingData = ref<any>(null);
const deletedUrls = ref<string[]>([]);
const selectedDuration = ref<'1day' | '1week' | '1month' | '6months'>('1day');
const expiresAt = ref<Date | null>(null);
const countdown = ref<string>('');
const countdownInterval = ref<number | null>(null);

const constraints = ref({
    maxImages: Infinity,
    maxVideos: Infinity,
    maxAudios: Infinity,
    maxContent: Infinity,
    contentPlaceholders: [] as string[],
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

const calculateExpiryDate = (duration: '1day' | '1week' | '1month' | '6months'): Date => {
    const now = new Date();
    const expiry = new Date(now);
    
    switch (duration) {
        case '1day':
            // Set to 12am (0:00) of the day after tomorrow
            expiry.setDate(expiry.getDate() + 2);
            break;
        case '1week':
            expiry.setDate(expiry.getDate() + 7);
            break;
        case '1month':
            expiry.setMonth(expiry.getMonth() + 1);
            break;
        case '6months':
            expiry.setMonth(expiry.getMonth() + 6);
            break;
    }
    
    // Set to 0:00:00 of that day
    expiry.setHours(0, 0, 0, 0);
    return expiry;
};

const updateCountdown = () => {
    if (!expiresAt.value) {
        countdown.value = '';
        return;
    }
    
    const now = new Date().getTime();
    const expiry = expiresAt.value.getTime();
    const distance = expiry - now;
    
    if (distance < 0) {
        countdown.value = 'Đã hết hạn';
        if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
        }
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    countdown.value = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
};

const startCountdown = () => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
    }
    updateCountdown();
    countdownInterval.value = window.setInterval(updateCountdown, 1000);
};

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
    const topic = route.query.topic as string || '';
    
    previewStore.setPreviewData({
        content: content.value.filter(c => c.trim()),
        images: [...(existingData.value?.images || []), ...imageManager.previews.value],
        videos: [...(existingData.value?.videos || []), ...videoManager.previews.value],
        audios: [...(existingData.value?.audios || []), ...audioManager.previews.value],
        imageFiles: imageManager.files.value,
        videoFiles: videoManager.files.value,
        audioFiles: audioManager.files.value,
        template: templateName,
        topic: topic,
        editId: isEditMode.value ? currentId.value : undefined,
        deletedUrls: isEditMode.value ? deletedUrls.value : undefined
    });

    // Build path based on whether topic exists
    const previewPath = topic ? `/${topic}/${templateName}` : `/${templateName}`;
    router.push({ path: previewPath, query: { preview: 'true' } });
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

        // Calculate expiry date based on selected duration
        const calculatedExpiresAt = expiresAt.value || calculateExpiryDate(selectedDuration.value);

        if (isEditMode.value && currentId.value) {
            await update(
                currentId.value,
                [...(existingData.value?.images || []), ...imageUrls],
                [...(existingData.value?.videos || []), ...videoUrls],
                [...(existingData.value?.audios || []), ...audioUrls],
                deletedUrls.value,
                calculatedExpiresAt
            );
            console.log("Cập nhật thành công!");
            deletedUrls.value = [];
            
            // Redirect to result page after update
            const templateName = route.query.template as string || 'demo';
            const topic = route.query.topic as string || '';
            router.push({
                name: 'Result',
                params: { id: currentId.value },
                query: { template: templateName, topic }
            });
        } else {
            const id = await submit(imageUrls, videoUrls, audioUrls, calculatedExpiresAt);
            if (id) {
                const templateName = route.query.template as string || 'demo';
                const topic = route.query.topic as string || '';
                // Redirect to result page after create
                router.push({
                    name: 'Result',
                    params: { id },
                    query: { template: templateName, topic }
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
    const urlParamId = route.params.id as string;
    const queryDocId = route.query.id as string;
    
    if (urlParamId && queryDocId && await isValidTemplate(urlParamId)) {
        const config = await getTemplateConfig(urlParamId);
        if (config) {
            const newQuery: Record<string, string> = {
                maxImages: config.maxImages.toString(),
                maxVideos: config.maxVideos.toString(),
                maxAudios: config.maxAudios.toString(),
                maxContent: config.maxContent.toString(),
                template: config.templateName
            };
            
            if (route.query.topic) {
                newQuery.topic = route.query.topic as string;
            }
            
            await router.replace({
                name: 'Input',
                params: { id: queryDocId },
                query: newQuery
            });
            
            if (config.contentPlaceholders) {
                constraints.value.contentPlaceholders = config.contentPlaceholders;
            }
        }
    }
    
    ['maxImages', 'maxVideos', 'maxAudios', 'maxContent'].forEach(key => {
        if (route.query[key]) (constraints.value as any)[key] = parseInt(route.query[key] as string);
    });
    if (route.query.template) {
        constraints.value.template = route.query.template as string;
        
        if (constraints.value.contentPlaceholders.length === 0) {
            const config = await getTemplateConfig(constraints.value.template);
            if (config?.contentPlaceholders) {
                constraints.value.contentPlaceholders = config.contentPlaceholders;
            }
        }
    }

    if (constraints.value.maxContent !== Infinity && constraints.value.maxContent > 0) {
        content.value = Array(constraints.value.maxContent).fill("");
    }

    const docId = route.params.id as string;
    if (docId) {
        isEditMode.value = true;
        currentId.value = docId;
        existingData.value = await fetchContext(docId);
        
        // Load expiresAt if exists
        if (existingData.value?.expiresAt) {
            // Convert Firestore Timestamp to Date
            if (existingData.value.expiresAt.toDate) {
                expiresAt.value = existingData.value.expiresAt.toDate();
            } else if (existingData.value.expiresAt instanceof Date) {
                expiresAt.value = existingData.value.expiresAt;
            } else if (typeof existingData.value.expiresAt === 'number') {
                expiresAt.value = new Date(existingData.value.expiresAt);
            }
            
            // Start countdown
            if (expiresAt.value) {
                startCountdown();
            }
        }
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
        
        const needRestore = (previewStore.topic && !route.query.topic) || (previewStore.template && !route.query.template);
        if (needRestore) {
            const newQuery = { ...route.query };
            if (previewStore.topic && !route.query.topic) {
                newQuery.topic = previewStore.topic;
            }
            if (previewStore.template && !route.query.template) {
                newQuery.template = previewStore.template;
            }
            await router.replace({
                ...route,
                query: newQuery
            });
        }
        
        if (previewStore.template) {
            constraints.value.template = previewStore.template;
        }
        
        if (route.query.confirmPreview === 'true') await handleSubmit();
    }
});

onUnmounted(() => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
    }
});
</script>

<template>
    <div class="input-container">
        <div class="input-window">
            <div class="window-border">
                <div class="window input-form">
                    <div class="title-bar">
                        <div class="icon"></div>
                        <span class="font-semibold text-sm">Template: {{ constraints.template }}</span>
                        <div class="title-bar-buttons"></div>
                    </div>
                    <div class="text-area">
                        <div class="input-content">
                            <!-- Duration Selector -->
                            <div class="mb-4 p-4 bg-linear-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg shadow-sm">
                                <label class="block text-sm font-semibold text-purple-800 mb-3">
                                    ⏰ Thời hạn duy trì form
                                </label>
                                
                                <!-- Countdown display (only in edit mode) -->
                                <div v-if="isEditMode && expiresAt" class="mb-3 p-3 bg-white border border-purple-300 rounded-md">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-medium text-gray-700">Thời gian còn lại:</span>
                                        <span :class="[
                                            'text-sm font-bold',
                                            countdown === 'Đã hết hạn' ? 'text-red-600' : 'text-green-600'
                                        ]">
                                            {{ countdown }}
                                        </span>
                                    </div>
                                    <div class="text-xs text-gray-500 mt-1">
                                        Hết hạn lúc: {{ expiresAt.toLocaleString('vi-VN') }}
                                    </div>
                                </div>

                                <!-- Duration options -->
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <label 
                                        v-for="option in [
                                            { value: '1day', label: '1 Ngày', icon: '📅' },
                                            { value: '1week', label: '1 Tuần', icon: '📆' },
                                            { value: '1month', label: '1 Tháng', icon: '🗓️' },
                                            { value: '6months', label: '6 Tháng', icon: '📊' }
                                        ]"
                                        :key="option.value"
                                        :class="[
                                            'cursor-pointer p-3 border-2 rounded-lg text-center transition-all duration-200',
                                            selectedDuration === option.value 
                                                ? 'border-purple-500 bg-purple-100 shadow-md transform scale-105' 
                                                : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                                        ]"
                                    >
                                        <input 
                                            type="radio" 
                                            :value="option.value" 
                                            v-model="selectedDuration"
                                            class="hidden"
                                            @change="() => {
                                                expiresAt = calculateExpiryDate(selectedDuration);
                                                if (isEditMode && expiresAt) {
                                                    startCountdown();
                                                }
                                            }"
                                        />
                                        <div class="text-2xl mb-1">{{ option.icon }}</div>
                                        <div :class="[
                                            'text-sm font-medium',
                                            selectedDuration === option.value ? 'text-purple-700' : 'text-gray-700'
                                        ]">
                                            {{ option.label }}
                                        </div>
                                    </label>
                                </div>
                                
                                <p class="text-xs text-gray-600 mt-3 italic">
                                    💡 Form sẽ được duy trì đến 0:00 của ngày được tính từ thời điểm hiện tại
                                </p>
                            </div>

                            <div v-if="constraints.template !== 'default'" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
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
                                            :class="['file-input-button', !canAdd.content ? 'file-input-button:disabled' : '']"
                                        >
                                            + Thêm
                                        </button>
                                    </div>
                                    <div class="space-y-3">
                                        <div v-for="(item, index) in content" :key="index" class="flex gap-2">
                                            <textarea 
                                                :value="item" 
                                                @input="updateContentItem(index, ($event.target as HTMLTextAreaElement).value)"
                                                :placeholder="constraints.contentPlaceholders[index] || `Nội dung ${index + 1}`" 
                                                rows="3" 
                                                class="input-field flex-1"
                                            ></textarea>
                                            <button 
                                                v-if="constraints.maxContent === Infinity && content.length > 1"
                                                @click="removeContentItem(index)" 
                                                class="file-input-button"
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
                                        :class="['file-input-button', !canAdd[media.key] ? 'file-input-button:disabled' : '']"
                                        :disabled="!canAdd[media.key]"
                                    >
                                        Chọn {{ media.key === 'image' ? 'ảnh' : media.key === 'video' ? 'video' : 'audio' }}
                                    </label>
                                    
                                    <!-- New files preview -->
                                    <div v-if="managers[media.key].previews.value.length" class="mt-2">
                                        <div class="media-preview">
                                            <div :class="media.key === 'audio' ? 'space-y-2' : media.key === 'video' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'">
                                                <div v-for="(p, i) in managers[media.key].previews.value" :key="i" :class="media.key === 'audio' ? 'flex items-center space-x-2 bg-gray-100 p-2 rounded-md' : 'relative'">
                                                    <img v-if="media.key === 'image'" :src="p" class="w-full h-24 object-cover rounded-md" />
                                                    <video v-else-if="media.key === 'video'" :src="p" controls class="w-full h-24 object-cover rounded-md"></video>
                                                    <audio v-else :src="p" controls :class="media.key === 'audio' ? 'flex-1' : ''"></audio>
                                                    <button @click="managers[media.key].removeFile(i)" :class="media.key === 'audio' ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shrink-0' : 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'">×</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Existing files -->
                                    <div v-if="isEditMode && existingData && existingData[`${media.key}s`]?.length" class="mt-2">
                                        <h4 class="text-xs font-medium text-gray-600 mb-1">{{ media.label }} hiện có:</h4>
                                        <div class="media-preview">
                                            <div :class="media.key === 'audio' ? 'space-y-2' : media.key === 'video' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'">
                                                <div v-for="(url, i) in existingData[`${media.key}s`]" :key="i" :class="media.key === 'audio' ? 'flex items-center space-x-2 bg-gray-100 p-2 rounded-md' : 'relative'">
                                                    <img v-if="media.key === 'image'" :src="url" class="w-full h-24 object-cover rounded-md" />
                                                    <video v-else-if="media.key === 'video'" :src="url" controls class="w-full h-24 object-cover rounded-md"></video>
                                                    <audio v-else :src="url" controls class="flex-1"></audio>
                                                    <button @click="removeExisting(media.key, i)" :class="media.key === 'audio' ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 ml-2' : 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'">×</button>
                                                </div>
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
                                    <div class="progress-bar">
                                        <div 
                                            class="progress-fill"
                                            :style="{ width: (totalProgress || 10) + '%' }"
                                        >
                                            <span v-if="totalProgress >= 20" class="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">{{ totalProgress }}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="submit-buttons">
                                    <button @click="handlePreview" class="win2k-button">
                                        Xem trước
                                    </button>
                                    <button @click="handleSubmit" class="win2k-button">
                                        {{ isEditMode ? "Cập nhật" : "Xác nhận" }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="status-bar">
                        <div class="text-center text-xs">
                            Sẵn sàng
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
