<script setup lang="ts">
definePageMeta({
  layout: 'main'
})

import { doc, setDoc, increment } from "firebase/firestore"
import { MEDIA_LIMITS } from '~/config/app'
import { canCreate, ECARD_LIMIT } from '~/composables/useEcards'
import { useContext } from "~/composables/useContext"
import { useCloudinary } from "~/composables/useCloudinary"
import { getTemplateConfig, isValidTemplate } from "~/config/templates"

const route = useRoute()
const router = useRouter()
const previewStore = usePreviewStore()
const emailCookie = useCookie('email')
const { $firestore } = useNuxtApp()
const db = $firestore

const { content, loading, submit, imageManager, videoManager, audioManager, fetchContext, update, addContentItem, removeContentItem, updateContentItem } = useContext()
const { upload, totalProgress, prepareUpload } = useCloudinary()

function waitUntilProgressComplete(timeoutMs = 5000) {
    return new Promise<void>((resolve) => {
        if (totalProgress.value >= 100) {
            resolve();
            return;
        }
        const stop = watch(totalProgress, (v) => {
            if (v >= 100) {
                try { stop(); } catch (_e) {}
                resolve();
            }
        });
        setTimeout(() => {
            try { stop(); } catch (_e) {}
            resolve();
        }, timeoutMs);
    });
}

const managers = { image: imageManager, video: videoManager, audio: audioManager };
const labels = { image: 'ảnh', video: 'video', audio: 'audio' };

const getCount = (type: 'image' | 'video' | 'audio') =>
    managers[type].files.value.length + (existingData.value?.[`${type}s`]?.length || 0);

const isEditMode = ref(false)
const currentId = ref<string | null>(null)
const existingData = ref<any>(null)
const userEmail = ref<string | null>(route.query.email ? String(route.query.email) : (emailCookie.value || null))
const showEmailModal = ref(false)
const showAudioTrimmer = ref(false)
const currentAudioFile = ref<File | null>(null)
const currentAudioIndex = ref<number>(-1)
const trimmedAudioIndexes = ref<Set<number>>(new Set())
const isLoadingTemplate = ref(false)
const isNavigating = ref(false)
const isExtractingAudio = ref(false)
const extractProgress = ref(0)
const cancelExtract = ref<(() => void) | null>(null)

function handleVerifiedEmail(email: string) {
    emailCookie.value = email
    userEmail.value = email
    showEmailModal.value = false
}
const deletedUrls = ref<string[]>([]);
const selectedDuration = ref<'1day' | '1week' | '1month' | '6months'>('1day');
const expiresAt = ref<Date | null>(null);
const countdown = ref<string>('');
const countdownInterval = ref<number | null>(null);

const constraints = ref({
    maxImages: MEDIA_LIMITS.maxImages,
    maxVideos: MEDIA_LIMITS.maxVideos,
    maxAudios: MEDIA_LIMITS.maxAudios,
    maxContent: Infinity,
    contentPlaceholders: [] as string[],
    template: 'default'
});
let stopWatchRef: (() => void) | undefined;
const prefetchedTemplates = new Set<string>();
const templateModules = import.meta.glob('~/pages/_templates/*/*/index.vue') as Record<string, () => Promise<any>>;

async function prefetchTemplateShell(topic?: string, templateName?: string) {
    const t = templateName || (constraints.value.template || '');
    const top = topic || (route.query.topic as string) || '';
    const key = top ? `${top}/${t}` : t;
    if (!t) return false;
    if (prefetchedTemplates.has(key)) return true;
    try {
        if (top) {
        for (const p in templateModules) {
            if (p.includes(`${top}/${t}/index.vue`)) {
                const loader = templateModules[p];
                if (typeof loader === 'function') await loader();
                    prefetchedTemplates.add(key);
                    return true;
                }
            }
    }
        for (const p in templateModules) {
            if (p.includes(`/${t}/index.vue`)) {
                const loader = templateModules[p];
                if (typeof loader === 'function') await loader();
                prefetchedTemplates.add(key);
                return true;
            }
        }
    try { await import(`~/pages/_templates/${top}/${t}/index.vue`); prefetchedTemplates.add(key); return true } catch (_e) {}
    } catch (_e) {
    }
    return false;
}
 

const calculateExpiryDate = (duration: '1day' | '1week' | '1month' | '6months'): Date => {
    const now = new Date();
    const expiry = new Date(now);
    switch (duration) {
        case '1day':
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
    expiry.setHours(0, 0, 0, 0);
    return expiry;
};

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
    { key: 'audio' as const, label: 'Audio hoặc video', max: constraints.value.maxAudios }
]);

const filledContentCount = computed(() => content.value.filter(c => c.trim()).length);

const getMaxForMedia = (mediaKey: 'image' | 'video' | 'audio') => {
    if (mediaKey === 'image') return constraints.value.maxImages;
    if (mediaKey === 'video') return constraints.value.maxVideos;
    return constraints.value.maxAudios;
}

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

 

const handleMedia = async (e: Event, type: 'image' | 'video' | 'audio') => {
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
    
    if (type === 'audio' && files.length > 0) {
        if (files.length === 1) {
            const file = files[0]!;
            
            // Check file extension for video formats (more reliable on mobile)
            const fileName = file.name.toLowerCase();
            const isVideoFile = file.type.startsWith('video/') || 
                               fileName.endsWith('.mp4') || 
                               fileName.endsWith('.webm') ||
                               fileName.endsWith('.mov');
            
            const isAudioFile = file.type.startsWith('audio/') || 
                               fileName.endsWith('.mp3') || 
                               fileName.endsWith('.m4a') ||
                               fileName.endsWith('.wav') ||
                               fileName.endsWith('.ogg') ||
                               fileName.endsWith('.aac') ||
                               fileName.endsWith('.flac');
            
            // Check if it's a video file
            if (isVideoFile) {
                try {
                    const audioFile = await extractAudioFromVideo(file);
                    currentAudioFile.value = audioFile;
                    currentAudioIndex.value = -1;
                    showAudioTrimmer.value = true;
                } catch (error) {
                    // Check if error is cancellation
                    if (error instanceof Error && error.message === 'cancelled') {
                        // Reset input to allow selecting the same file again
                        input.value = '';
                        return;
                    }
                    const errorMessage = error instanceof Error ? error.message : 'Không thể trích xuất audio từ video. Vui lòng chọn file audio hoặc video khác.';
                    alert('❌ ' + errorMessage);
                    // Reset input on error too
                    input.value = '';
                }
            } else if (isAudioFile) {
                currentAudioFile.value = file;
                currentAudioIndex.value = -1;
                showAudioTrimmer.value = true;
            } else {
                alert('Vui lòng chọn tệp audio hoặc video hợp lệ.');
            }
        } else {
            // Multiple files - process each one
            const processedFiles: File[] = [];
            for (const file of files) {
                const fileName = file.name.toLowerCase();
                const isVideoFile = file.type.startsWith('video/') || 
                                   fileName.endsWith('.mp4') || 
                                   fileName.endsWith('.webm') ||
                                   fileName.endsWith('.mov');
                
                const isAudioFile = file.type.startsWith('audio/') || 
                                   fileName.endsWith('.mp3') || 
                                   fileName.endsWith('.m4a') ||
                                   fileName.endsWith('.wav') ||
                                   fileName.endsWith('.ogg') ||
                                   fileName.endsWith('.aac') ||
                                   fileName.endsWith('.flac');
                
                if (isVideoFile) {
                    try {
                        const audioFile = await extractAudioFromVideo(file);
                        processedFiles.push(audioFile);
                    } catch (error) {
                        // Silent fail for batch processing
                    }
                } else if (isAudioFile) {
                    processedFiles.push(file);
                }
            }
            if (processedFiles.length > 0) {
                managers.audio.addFiles(processedFiles);
            }
        }
    } else {
        managers[type].addFiles(files);
    }
    
    input.value = '';
};

const handleAudioTrimmed = (trimmedFile: File) => {
    if (currentAudioIndex.value >= 0) {
        audioManager.files.value[currentAudioIndex.value] = trimmedFile
        const newPreviews = [...audioManager.previews.value]
        newPreviews[currentAudioIndex.value] = URL.createObjectURL(trimmedFile)
        audioManager.previews.value = newPreviews
        trimmedAudioIndexes.value.add(currentAudioIndex.value)
    } else {
        audioManager.addFiles([trimmedFile])
        trimmedAudioIndexes.value.add(audioManager.files.value.length - 1)
    }
    showAudioTrimmer.value = false
    currentAudioFile.value = null
    currentAudioIndex.value = -1
}

const handleAudioTrimCancel = () => {
    showAudioTrimmer.value = false
    currentAudioFile.value = null
    currentAudioIndex.value = -1
}

// Extract audio from video file using Web Audio API (iOS compatible)
const extractAudioFromVideo = async (videoFile: File): Promise<File> => {
    return new Promise(async (resolve, reject) => {
        let isCancelled = false;
        let audioContext: AudioContext | null = null;
        
        // Setup cancel function
        cancelExtract.value = () => {
            isCancelled = true;
            if (audioContext && audioContext.state !== 'closed') {
                try {
                    audioContext.close();
                } catch (e) {
                    // Silent fail
                }
            }
            isExtractingAudio.value = false;
            extractProgress.value = 0;
            cancelExtract.value = null;
            reject(new Error('cancelled'));
        };
        
        try {
            isExtractingAudio.value = true;
            extractProgress.value = 10;
            
            // Read file as ArrayBuffer
            const arrayBuffer = await videoFile.arrayBuffer();
            extractProgress.value = 30;
            
            if (isCancelled) return;
            
            // Create audio context and decode
            audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            extractProgress.value = 60;
            
            if (isCancelled) return;
            
            const duration = audioBuffer.duration;
            
            // Check duration
            if (duration > 30) {
                if (audioContext) audioContext.close();
                isExtractingAudio.value = false;
                extractProgress.value = 0;
                cancelExtract.value = null;
                reject(new Error('Video quá dài! Chỉ chấp nhận video ≤ 30 giây.'));
                return;
            }
            
            extractProgress.value = 70;
            
            // Create offline context to render audio
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );
            
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start();
            
            extractProgress.value = 80;
            
            // Render audio
            const renderedBuffer = await offlineContext.startRendering();
            extractProgress.value = 90;
            
            if (isCancelled) return;
            
            // Convert to WAV format (most compatible)
            const wavBlob = audioBufferToWav(renderedBuffer);
            const audioFile = new File(
                [wavBlob],
                videoFile.name.replace(/\.[^.]+$/, '.wav'),
                { type: 'audio/wav' }
            );
            
            extractProgress.value = 100;
            
            if (audioContext) audioContext.close();
            isExtractingAudio.value = false;
            extractProgress.value = 0;
            cancelExtract.value = null;
            
            resolve(audioFile);
            
        } catch (error) {
            if (audioContext) audioContext.close();
            isExtractingAudio.value = false;
            extractProgress.value = 0;
            cancelExtract.value = null;
            
            if (error instanceof Error && error.message === 'cancelled') {
                reject(error);
            } else {
                reject(new Error('chỉ hỗ trợ chuyển mp4 sang audio'));
            }
        }
    });
};

// Convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;
    
    // Write WAV header
    const setUint16 = (data: number) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };
    const setUint32 = (data: number) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };
    
    // "RIFF" chunk descriptor
    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    
    // "fmt " sub-chunk
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);
    
    // "data" sub-chunk
    setUint32(0x61746164);
    setUint32(length - pos - 4);
    
    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }
    
    while (pos < length) {
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i]![offset]!));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Increment template creation counter in Firestore
const incrementTemplateStats = async (templateName: string, topic: string) => {
    try {
        // Structure: 4U/develop/template/{topic} with field {templateName}: count
        const config = useRuntimeConfig().public;
        const firestorePath = config.firestore.split('/');
        const topicDocRef = doc(db, firestorePath[0]!, firestorePath[1]!, 'template', topic || 'default');
        
        // Update the specific template count field
        await setDoc(topicDocRef, {
                    [templateName]: increment(1)
        }, { merge: true });
    } catch (err) {
    }
};const validate = () => {
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
    if (type === 'audio') continue; // audio is optional
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
    
    
    const filterDeletedUrls = (urls: string[] = []) => 
        urls.filter(url => !deletedUrls.value.includes(url));
    
    previewStore.setPreviewData({
        content: content.value.filter(c => c.trim()),
        images: [...filterDeletedUrls(existingData.value?.images), ...imageManager.previews.value],
        videos: [...filterDeletedUrls(existingData.value?.videos), ...videoManager.previews.value],
        audios: [...filterDeletedUrls(existingData.value?.audios), ...audioManager.previews.value],
        imageFiles: imageManager.files.value,
        videoFiles: videoManager.files.value,
        audioFiles: audioManager.files.value,
        template: templateName,
        topic: topic,
        editId: isEditMode.value ? currentId.value : undefined,
    deletedUrls: isEditMode.value ? deletedUrls.value : undefined,
    });

    
    const previewId = currentId.value || 'preview'
    const previewPath = topic ? `/${topic}/${templateName}/${previewId}` : `/demo/${templateName}/${previewId}`;
    router.push({ path: previewPath, query: { preview: 'true' } });
};

const handleSubmit = async () => {
    if (!validate()) return;

    if (isEditMode.value && (!currentId.value || currentId.value.trim() === '')) {
        alert('Có lỗi xảy ra: không tìm thấy ID. Vui lòng thử lại.');
        loading.value = false;
        return;
    }

    
    loading.value = true;
    isNavigating.value = true;
    prepareUpload(imageManager.files.value.length + videoManager.files.value.length + audioManager.files.value.length);

    try {
        const [imageUrls, videoUrls, audioUrls] = await Promise.all([
            imageManager.files.value.length ? upload(imageManager.files.value) : [],
            videoManager.files.value.length ? upload(videoManager.files.value) : [],
            audioManager.files.value.length ? upload(audioManager.files.value) : []
        ]);

    const calculatedExpiresAt = expiresAt.value || calculateExpiryDate(selectedDuration.value);

            if (isEditMode.value && currentId.value) {
            
            const filterDeletedUrls = (urls: string[] = []) => 
                urls.filter(url => !deletedUrls.value.includes(url));
            
            const finalImages = [...filterDeletedUrls(existingData.value?.images), ...imageUrls];
            const finalVideos = [...filterDeletedUrls(existingData.value?.videos), ...videoUrls];
            const finalAudios = [...filterDeletedUrls(existingData.value?.audios), ...audioUrls];
            
            
            
            await update(
                currentId.value,
                finalImages,
                finalVideos,
                finalAudios,
                deletedUrls.value,
                calculatedExpiresAt
            );
            
            
            
            if (deletedUrls.value.length > 0) {
                try {
                    const config = useRuntimeConfig().public;
                    await fetch(`${config.backendUrl}media/delete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ urls: deletedUrls.value }),
                    });
                } catch (_err) {
                    // Silent fail
                }
            }
            
            deletedUrls.value = [];
            
            
            try { await waitUntilProgressComplete(4000); } catch (_e) {}
            
            const templateName = route.query.template as string || 'demo';
            const topic = route.query.topic as string || '';
            await router.push({
                path: `/result/${currentId.value}`,
                query: { template: templateName, topic }
            });
            
            return;
        } else {
            const id = await submit(imageUrls, videoUrls, audioUrls, calculatedExpiresAt);
            if (id) {
                try {
                    const email = userEmail.value || emailCookie.value;
                    if (email) {
                        
                        try {
                            const { allowed } = await canCreate(email, id);
                            if (!allowed) {
                                alert(`Bạn đã vượt quá số lượng thiệp cho phép (tối đa ${ECARD_LIMIT}).`);
                                loading.value = false;
                                isNavigating.value = false;
                                return;
                            }
                        } catch (err) {
                            // Silent fail
                        }
                        const templateName = route.query.template as string || 'demo';
                        const topic = route.query.topic as string || '';
                        const resultUrl = `${window.location.origin}/result/${id}` + (templateName ? `?template=${templateName}${topic ? `&topic=${topic}` : ''}` : '');
                        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}user/ecard/add`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, resultUrl }),
                        });
                        if (!res.ok) {
                                if (res.status === 403) {
                                const txt = await res.text();
                                alert(txt || `Bạn đã vượt quá số lượng thiệp cho phép (tối đa ${ECARD_LIMIT}).`);
                                loading.value = false;
                                isNavigating.value = false;
                                return;
                            }
                                await res.text();
                        }
                    }
                } catch (err) {
                    // Silent fail
                }                
                try { await waitUntilProgressComplete(4000); } catch (_e) {}
                const templateName = route.query.template as string || 'demo';
                const topic = route.query.topic as string || '';
                
                // Increment template creation counter
                try {
                    await incrementTemplateStats(templateName, topic);
                } catch (err) {
                    // Silent fail
                }
                
                await router.push({
                    name: 'Result',
                    params: { id },
                    query: { template: templateName, topic }
                });
                
                return;
            }
        }

        previewStore.clear();
    } catch (error) {
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
        loading.value = false;
        isNavigating.value = false;
    }
};

onMounted(async () => {
    const urlParamId = route.params.id as string;
    const queryDocId = route.query.id as string;
    
    if (urlParamId && queryDocId && await isValidTemplate(urlParamId)) {
        const config = await getTemplateConfig(urlParamId);
        if (config) {
            const templateNameToUse = config.templateName || urlParamId;
            
            const newQuery: Record<string, string> = {
                maxImages: config.maxImages.toString(),
                maxVideos: config.maxVideos.toString(),
                maxAudios: config.maxAudios.toString(),
                maxContent: config.maxContent.toString(),
                template: templateNameToUse
            };
            
            if (route.query.topic) {
                newQuery.topic = route.query.topic as string;
            }
            
            constraints.value.maxImages = config.maxImages;
            constraints.value.maxVideos = config.maxVideos;
            constraints.value.maxAudios = config.maxAudios;
            constraints.value.maxContent = config.maxContent;
            constraints.value.template = templateNameToUse;
            
            if (config.contentPlaceholders) {
                constraints.value.contentPlaceholders = config.contentPlaceholders;
            }
            
            await router.replace({
                path: '/input',
                query: { ...newQuery, id: queryDocId }
            });
        }
    }
    
    ['maxImages', 'maxVideos', 'maxAudios', 'maxContent'].forEach(key => {
        if (route.query[key]) (constraints.value as any)[key] = parseInt(route.query[key] as string);
    });
    
    if (route.query.template) {
        constraints.value.template = route.query.template as string;

        
        try {
            isLoadingTemplate.value = true;
            const config = await getTemplateConfig(constraints.value.template);
            if (config) {
                constraints.value.maxImages = config.maxImages;
                constraints.value.maxVideos = config.maxVideos;
                constraints.value.maxAudios = config.maxAudios;
                constraints.value.maxContent = config.maxContent;
                if (config.contentPlaceholders) {
                    constraints.value.contentPlaceholders = config.contentPlaceholders;
                }
            }
        } catch (_err) {
            // Silent fail
        }
        finally { isLoadingTemplate.value = false }

    try { prefetchTemplateShell(route.query.topic as string | undefined, constraints.value.template); } catch (_e) { }

        
        const emailFromQuery = route.query.email as string | undefined;
        const emailToCheck = emailFromQuery || userEmail.value;
        if (emailToCheck) {
            try {
                const { allowed } = await canCreate(emailToCheck, constraints.value.template);
                if (!allowed) {
                    alert(`Bạn đã vượt quá số lượng thiệp cho phép (tối đa ${ECARD_LIMIT}).`);
                    
                    router.push({ name: 'Home' });
                    return;
                }
            } catch (err) {
                // Silent fail
            }
        }
    } else if (urlParamId && !queryDocId) {
        const defaultTemplate = 'demo';
        constraints.value.template = defaultTemplate;
        const config = await getTemplateConfig(defaultTemplate);
        if (config?.contentPlaceholders) {
            constraints.value.contentPlaceholders = config.contentPlaceholders;
        }
    }

    if (constraints.value.maxContent !== Infinity && constraints.value.maxContent > 0) {
        content.value = Array(constraints.value.maxContent).fill("");
    }

    
    stopWatchRef = watch(() => route.query.template, async (newTemplate) => {
        if (!newTemplate) return;
        if (newTemplate === constraints.value.template) return;
        constraints.value.template = newTemplate as string;
        try {
            const config = await getTemplateConfig(constraints.value.template);
            if (config) {
                constraints.value.maxImages = config.maxImages;
                constraints.value.maxVideos = config.maxVideos;
                constraints.value.maxAudios = config.maxAudios;
                constraints.value.maxContent = config.maxContent;
                if (config.contentPlaceholders) {
                    constraints.value.contentPlaceholders = config.contentPlaceholders;
                }
            }
        } catch (err) {
            // Silent fail
        }
    try { prefetchTemplateShell(route.query.topic as string | undefined, constraints.value.template); } catch (_e) { }
        const emailToCheck = (route.query.email as string) || userEmail.value;
        if (emailToCheck) {
            try {
                const { allowed } = await canCreate(emailToCheck, constraints.value.template);
                if (!allowed) {
                    alert(`Bạn đã vượt quá số lượng thiệp cho phép (tối đa ${ECARD_LIMIT}).`);
                    router.push({ name: 'Home' });
                    return;
                }
            } catch (err) {
                // Silent fail
            }
        }
    });

    const docId = route.params.id as string;
    if (docId) {
        isEditMode.value = true;
        currentId.value = docId;
        existingData.value = await fetchContext(docId);
        
        if (existingData.value?.expiresAt) {
            
            if (existingData.value.expiresAt.toDate) {
                expiresAt.value = existingData.value.expiresAt.toDate();
            } else if (existingData.value.expiresAt instanceof Date) {
                expiresAt.value = existingData.value.expiresAt;
            } else if (typeof existingData.value.expiresAt === 'number') {
                expiresAt.value = new Date(existingData.value.expiresAt);
            }
            
            if (expiresAt.value) {
                startCountdown();
            }
        }
    }

    
    if ((route.query.fromPreview === 'true' || route.query.confirmPreview === 'true') && previewStore.hasData) {
        content.value = [...previewStore.content];
        if (previewStore.imageFiles.length) imageManager.addFiles(previewStore.imageFiles);
        if (previewStore.videoFiles.length) videoManager.addFiles(previewStore.videoFiles);
        if (previewStore.audioFiles.length) audioManager.addFiles(previewStore.audioFiles);
        
        
        if (previewStore.editId) {
            isEditMode.value = true;
            currentId.value = previewStore.editId;
            deletedUrls.value = previewStore.deletedUrls || [];

            if (!existingData.value && currentId.value) {
                existingData.value = await fetchContext(currentId.value);
            }

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

    // bypassAudio removed - audio is optional by default
        
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
    if (typeof stopWatchRef === 'function') {
        try { stopWatchRef(); } catch (e) { }
    }
});
</script>

<template>
    <EmailOtpModal v-model="showEmailModal" :defaultEmail="userEmail || ''" @verified="handleVerifiedEmail" />
    <AudioTrimmer 
        v-if="currentAudioFile"
        v-model="showAudioTrimmer" 
        :file="currentAudioFile"
        @trimmed="handleAudioTrimmed"
        @cancel="handleAudioTrimCancel"
    />
    <div class="input-container">
        <div class="input-window">
            <div v-if="isLoadingTemplate" class="loading-overlay"><div class="spinner"></div></div>
            
            <!-- Audio extraction progress overlay -->
            <div v-if="isExtractingAudio" class="loading-overlay">
                <div class="window-border" style="width: 90%; max-width: 500px;">
                    <div class="window">
                        <div class="title-bar">
                            <div class="icon"></div>
                            <span class="font-semibold text-sm">🎬 Đang trích xuất audio...</span>
                            <div class="title-bar-buttons"></div>
                        </div>
                        <div class="text-area">
                            <div class="input-content flex flex-col items-center justify-center p-8">
                                <div class="mb-4 text-sm text-gray-700">Vui lòng đợi trong giây lát...</div>
                                <div class="w-full">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-sm font-medium text-gray-700">Tiến trình</span>
                                        <span class="text-sm font-medium text-gray-700">{{ extractProgress }}%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div 
                                            class="progress-fill"
                                            :style="{ width: extractProgress + '%' }"
                                        >
                                            <span v-if="extractProgress >= 20" class="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">{{ extractProgress }}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-4 text-xs text-gray-500">
                                    💡 Đang chuyển đổi video sang audio...
                                </div>
                                <button 
                                    @click="() => cancelExtract && cancelExtract()"
                                    class="mt-4 win2k-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                >
                                    ❌ Hủy bỏ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="window-border">
                <div class="window input-form" v-if="!loading && !isNavigating">
                    <div class="title-bar">
                        <div class="icon"></div>
                        <span class="font-semibold text-sm">Template: {{ constraints.template }}</span>
                        <div class="title-bar-buttons"></div>
                    </div>
                    
                    <div class="text-area">
                        <div class="input-content">
                            
                            <div class="mb-4 p-4 bg-linear-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg shadow-sm">
                                <label class="block text-sm font-semibold text-purple-800 mb-3">
                                    ⏰ Thời hạn duy trì form
                                </label>
                                
                                
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

                                
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <label 
                                        v-for="option in [
                                            { value: '1day', label: '1 Ngày', icon: '📅', disabled: isEditMode && !!expiresAt },
                                            { value: '1week', label: '1 Tuần', icon: '📆', disabled: false },
                                            { value: '1month', label: '1 Tháng', icon: '🗓️', disabled: true },
                                            { value: '6months', label: '6 Tháng', icon: '📊', disabled: true }
                                        ]"
                                        :key="option.value"
                                        :class="[
                                            'p-3 border-2 rounded-lg text-center',
                                            option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                                            selectedDuration === option.value && !option.disabled
                                                ? 'border-purple-500 bg-purple-100 shadow-md' 
                                                : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                                        ]"
                                        :style="{ transition: 'none' }"
                                    >
                                        <input 
                                            type="radio" 
                                            :value="option.value" 
                                            v-model="selectedDuration"
                                            class="hidden"
                                            :disabled="option.disabled"
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
                                            selectedDuration === option.value && !option.disabled ? 'text-purple-700' : 'text-gray-700',
                                            option.disabled ? 'text-gray-400' : ''
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
                                
                                <div>
                                    <div class="flex justify-between items-center mb-2">
                                        <label class="block text-sm font-medium text-gray-700">
                                            Nội dung <span class="text-red-500">*</span>
                                            <span v-if="constraints.maxContent !== Infinity && filledContentCount < constraints.maxContent" class="text-xs text-red-500 font-normal">
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

                                
                                <div v-for="media in mediaTypes" :key="media.key" v-show="media.max > 0">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        {{ media.label }}
                                        <span v-if="media.key === 'audio'" class="text-xs text-gray-500">(không bắt buộc)</span>
                                        <span v-else-if="media.max !== Infinity && remaining[media.key] > 0" class="text-xs text-red-500">(Bắt buộc: {{ media.max }} - Còn: {{ remaining[media.key] }})</span>
                                    </label>
                                    <input 
                                        :type="'file'" 
                                        :id="`${media.key}Input`" 
                                        multiple 
                                        :accept="media.key === 'audio' ? 'audio/*,video/mp4,video/webm,video/quicktime,.mp3,.m4a,.wav,.mp4,.webm,.mov' : `${media.key}/*`" 
                                        @change="handleMedia($event, media.key)" 
                                        class="hidden" 
                                        :disabled="!canAdd[media.key]" 
                                    />
                                    <label 
                                        v-if="canAdd[media.key]"
                                        :for="`${media.key}Input`" 
                                        class="file-input-button"
                                    >
                                        Chọn {{ media.key === 'image' ? 'ảnh' : media.key === 'video' ? 'video' : 'nhạc nền' }}
                                    </label>
                                    <div v-else class="text-xs text-gray-500 mt-1">Đã đạt giới hạn: {{ getMaxForMedia(media.key) }}</div>
                                    
                                    
                                    <div v-if="managers[media.key].previews.value.length" class="mt-2">
                                        <div class="media-preview">
                                            <div :class="media.key === 'audio' ? 'space-y-2' : media.key === 'video' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'">
                                                <div v-for="(p, i) in managers[media.key].previews.value" :key="i" :class="media.key === 'audio' ? 'flex items-center space-x-2 bg-gray-100 p-2 rounded-md' : 'relative'">
                                                    <img v-if="media.key === 'image'" :src="p" class="w-full h-24 object-cover rounded-md" />
                                                    <video v-else-if="media.key === 'video'" :src="p" controls class="w-full h-24 object-cover rounded-md"></video>
                                                    <audio v-else :src="p" controls :class="media.key === 'audio' ? 'flex-1' : ''"></audio>
                                                    <button @click="managers[media.key].removeFile(i)" :class="media.key === 'audio' ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shrink-0 cursor-pointer' : 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer'">×</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    
                                    <div v-if="isEditMode && existingData && existingData[`${media.key}s`]?.length" class="mt-2">
                                        <h4 class="text-xs font-medium text-gray-600 mb-1">{{ media.label }} hiện có:</h4>
                                        <div class="media-preview">
                                            <div :class="media.key === 'audio' ? 'space-y-2' : media.key === 'video' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'">
                                                <div v-for="(url, i) in existingData[`${media.key}s`]" :key="i" :class="media.key === 'audio' ? 'flex items-center space-x-2 bg-gray-100 p-2 rounded-md' : 'relative'">
                                                    <img v-if="media.key === 'image'" :src="url" class="w-full h-24 object-cover rounded-md" />
                                                    <video v-else-if="media.key === 'video'" :src="url" controls class="w-full h-24 object-cover rounded-md"></video>
                                                    <audio v-else :src="url" controls class="flex-1"></audio>
                                                    <button @click="removeExisting(media.key, i)" :class="media.key === 'audio' ? 'bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 ml-2 cursor-pointer' : 'absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer'">×</button>
                                          </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
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
                <div v-if="loading" class="submit-overlay">
                    <div class="window-border" style="width: 90%; max-width: 720px;">
                        <div class="window">
                            <div class="title-bar">
                                <div class="icon"></div>
                                <span class="font-semibold text-sm">Đang xử lý...</span>
                                <div class="title-bar-buttons"></div>
                            </div>
                            <div class="text-area">
                                <div class="input-content flex flex-col items-center justify-center p-8">
                                    <div class="mb-4 text-sm text-gray-700">Đang tải lên, vui lòng chờ...</div>
                                    <div class="w-full">
                                        <div class="progress-bar">
                                            <div class="progress-fill" :style="{ width: (totalProgress || 10) + '%' }">
                                                <span v-if="totalProgress >= 20" class="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">{{ totalProgress }}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped src="./style.css"></style>