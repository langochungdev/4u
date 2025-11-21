import { doc, setDoc, increment } from "firebase/firestore"
import { MEDIA_LIMITS } from '~/config/app'
import { canCreate, ECARD_LIMIT } from '~/composables/useEcards'
import { useContext } from "~/composables/useContext"
import { useCloudinary } from "~/composables/useCloudinary"
import { getTemplateConfig, isValidTemplate } from "~/config/templates"
import { contextService } from "../service/context.service"
import { userService } from "../service/user.service"
import { useAudioTrimmer } from "./useAudioTrimmer"
import { useExpiry } from "./useExpiry"
import { useTemplateManager } from "./useTemplateManager"

export const useInputLogic = () => {
  const route = useRoute()
  const router = useRouter()
  const previewStore = usePreviewStore()
  const emailCookie = useCookie('email')
  const { $firestore } = useNuxtApp()
  const db = $firestore

  const { content, loading, submit, imageManager, videoManager, audioManager, fetchContext, update, addContentItem, removeContentItem, updateContentItem } = useContext()
  const { upload, totalProgress, prepareUpload } = useCloudinary()
  const { isExtractingAudio, extractProgress, cancelExtract, extractAudioFromVideo } = useAudioTrimmer()
  const { expiresAt, countdown, countdownInterval, calculateExpiryDate, updateCountdown, startCountdown } = useExpiry()
  const { prefetchTemplateShell, incrementTemplateStats } = useTemplateManager()

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

  function handleVerifiedEmail(email: string) {
    emailCookie.value = email
    userEmail.value = email
    showEmailModal.value = false
  }

  const deletedUrls = ref<string[]>([]);
  const selectedDuration = ref<'1day' | '1week' | '1month' | '6months'>('1day');

  const constraints = ref({
    maxImages: MEDIA_LIMITS.maxImages,
    maxVideos: MEDIA_LIMITS.maxVideos,
    maxAudios: MEDIA_LIMITS.maxAudios,
    maxContent: Infinity,
    contentPlaceholders: [] as string[],
    template: 'default'
  });

  let stopWatchRef: (() => void) | undefined;

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

  const removeExisting = (type: 'image' | 'video' | 'audio', index: number) => {
    if (!existingData.value) return;
    const key = `${type}s`;
    deletedUrls.value.push(existingData.value[key][index]);
    existingData.value[key].splice(index, 1);
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

  // Helper functions for file type checking
  const isVideoFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return file.type.startsWith('video/') ||
           fileName.endsWith('.mp4') ||
           fileName.endsWith('.webm') ||
           fileName.endsWith('.mov');
  };

  const isAudioFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return file.type.startsWith('audio/') ||
           fileName.endsWith('.mp3') ||
           fileName.endsWith('.m4a') ||
           fileName.endsWith('.wav') ||
           fileName.endsWith('.ogg') ||
           fileName.endsWith('.aac') ||
           fileName.endsWith('.flac');
  };

  // Validate file selection and return allowed files
  const validateFileSelection = (input: HTMLInputElement, type: 'image' | 'video' | 'audio') => {
    const max = constraints.value[`max${type.charAt(0).toUpperCase() + type.slice(1)}s` as keyof typeof constraints.value] as number;
    const current = getCount(type);

    if (current >= max) {
      alert(`Chỉ được phép tối đa ${max} ${labels[type]}!`);
      input.value = '';
      return null;
    }

    const allowed = max - current;
    const files = Array.from(input.files!).slice(0, allowed);

    if (input.files!.length > allowed) {
      alert(`Chỉ thêm được ${allowed} ${labels[type]} nữa. Đã chọn ${allowed}/${input.files!.length}.`);
    }

    return files;
  };

  // Handle single audio file processing
  const handleAudioFile = async (file: File, input: HTMLInputElement) => {
    if (isVideoFile(file)) {
      try {
        const audioFile = await extractAudioFromVideo(file);
        currentAudioFile.value = audioFile;
        currentAudioIndex.value = -1;
        showAudioTrimmer.value = true;
      } catch (error) {
        if (error instanceof Error && error.message === 'cancelled') {
          input.value = '';
          return;
        }
        const errorMessage = error instanceof Error ? error.message : 'Không thể trích xuất audio từ video. Vui lòng chọn file audio hoặc video khác.';
        alert('❌ ' + errorMessage);
        input.value = '';
      }
    } else if (isAudioFile(file)) {
      currentAudioFile.value = file;
      currentAudioIndex.value = -1;
      showAudioTrimmer.value = true;
    } else {
      alert('Vui lòng chọn tệp audio hoặc video hợp lệ.');
    }
  };

  // Handle multiple audio files (batch processing)
  const handleMultipleAudioFiles = async (files: File[]) => {
    const processedFiles: File[] = [];

    for (const file of files) {
      if (isVideoFile(file)) {
        try {
          const audioFile = await extractAudioFromVideo(file);
          processedFiles.push(audioFile);
        } catch (error) {
          // Silent fail for batch processing
        }
      } else if (isAudioFile(file)) {
        processedFiles.push(file);
      }
    }

    // Add all processed files to audio manager
    for (const processedFile of processedFiles) {
      await audioManager.addFiles([processedFile]);
    }
  };

  // Handle image and video files
  const handleMediaFiles = async (files: File[], type: 'image' | 'video') => {
    const manager = type === 'image' ? imageManager : videoManager;
    for (const file of files) {
      await manager.addFiles([file]);
    }
  };

  const handleMedia = async (e: Event, type: 'image' | 'video' | 'audio') => {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    const files = validateFileSelection(input, type);
    if (!files) return;

    if (type === 'audio' && files.length > 0) {
      if (files.length === 1) {
        const file = files[0];
        if (file) {
          await handleAudioFile(file, input);
        }
      } else {
        await handleMultipleAudioFiles(files);
      }
    } else if (type === 'image' || type === 'video') {
      await handleMediaFiles(files, type);
    }

    // Reset input
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

    const templateName = route.params.template as string || route.query.template as string || 'demo';
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

  const handleSubmit = async (uploadedUrls?: { images: string[], videos: string[], audios: string[] }) => {
    if (!validate()) return;

    if (isEditMode.value && (!currentId.value || currentId.value.trim() === '')) {
      alert('Có lỗi xảy ra: không tìm thấy ID. Vui lòng thử lại.');
      loading.value = false;
      return;
    }

    loading.value = true;
    isNavigating.value = true;

    try {
      let imageUrls: string[] = []
      let videoUrls: string[] = []
      let audioUrls: string[] = []

      if (uploadedUrls) {
        imageUrls = uploadedUrls.images
        videoUrls = uploadedUrls.videos
        audioUrls = uploadedUrls.audios
      } else {
        prepareUpload(imageManager.files.value.length + videoManager.files.value.length + audioManager.files.value.length);

        const [imgUrls, vidUrls, audUrls] = await Promise.all([
          imageManager.files.value.length ? upload(imageManager.files.value) : [],
          videoManager.files.value.length ? upload(videoManager.files.value) : [],
          audioManager.files.value.length ? upload(audioManager.files.value) : []
        ]);
        imageUrls = imgUrls
        videoUrls = vidUrls
        audioUrls = audUrls
      }

      const calculatedExpiresAt = expiresAt.value || calculateExpiryDate(selectedDuration.value);

      if (isEditMode.value && currentId.value) {
        const filterDeletedUrls = (urls: string[] = []) =>
          urls.filter(url => !deletedUrls.value.includes(url));

        const finalImages = [...filterDeletedUrls(existingData.value?.images), ...imageUrls];
        const finalVideos = [...filterDeletedUrls(existingData.value?.videos), ...videoUrls];
        const finalAudios = [...filterDeletedUrls(existingData.value?.audios), ...audioUrls];

        await contextService.updateContextWithDeleted(currentId.value, {
          images: finalImages,
          videos: finalVideos,
          audios: finalAudios,
          expiresAt: calculatedExpiresAt,
        }, deletedUrls.value);

        // Preload updated context data immediately after update
        try {
          const updatedContextData = await contextService.getById(currentId.value);
          localStorage.setItem('preloadedResultData', JSON.stringify(updatedContextData));
        } catch (err) {
          console.error('Failed to preload updated context data:', err);
        }

        // Delete media asynchronously without blocking UI
        if (deletedUrls.value.length > 0) {
          (async () => {
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
          })();
        }

        deletedUrls.value = [];

        try { await waitUntilProgressComplete(4000); } catch (_e) {}

        const templateName = route.params.template as string || route.query.template as string || 'demo';
        const topic = route.query.topic as string || '';
        await router.push({
          path: `/result/${currentId.value}`,
          query: { template: templateName, topic }
        });

        return;
      } else {
        const id = await contextService.submitContext({
          content: content.value.filter(c => c.trim()),
          images: imageUrls,
          videos: videoUrls,
          audios: audioUrls,
          expiresAt: calculatedExpiresAt,
        });
        if (id) {
          // Preload context data for faster result page
          try {
            const contextData = await contextService.getById(id);
            // Use localStorage to pass data quickly
            localStorage.setItem('preloadedResultData', JSON.stringify(contextData));
          } catch (err) {
            console.error('Failed to preload context data:', err);
          }

          try {
            const email = userEmail.value || emailCookie.value;
            if (email) {
              const templateName = route.params.template as string || route.query.template as string || 'demo';
              const topic = route.query.topic as string || '';
              const resultUrl = `${window.location.origin}/result/${id}` + (templateName ? `?template=${templateName}${topic ? `&topic=${topic}` : ''}` : '');
              console.log('resultUrl:', resultUrl);

              const config = useRuntimeConfig().public;
              const firestorePath = config.firestore.split('/');
              console.log('firestorePath:', firestorePath);
              await userService.addEcardToUser(email, resultUrl, firestorePath[0]!, firestorePath[1]);
            }
          } catch (err) {
            // Silent fail
          }
          try { await waitUntilProgressComplete(4000); } catch (_e) {}
          const templateName = route.params.template as string || route.query.template as string || 'demo';
          const topic = route.query.topic as string || '';

          // Increment template creation counter
          try {
            await incrementTemplateStats(templateName, topic);
          } catch (err) {
            // Silent fail
          }

          await router.push({
            path: `/result/${id}`,
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

    const templateParam = route.params.template as string || route.query.template as string;
    if (templateParam) {
      constraints.value.template = templateParam;

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

    stopWatchRef = watch(() => route.params.template as string || route.query.template as string, async (newTemplate) => {
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

    const docId = route.query.id as string;
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

      const needRestore = (previewStore.topic && !route.query.topic) || (previewStore.template && !route.params.template);
      if (needRestore) {
        const newQuery = { ...route.query };
        if (previewStore.topic && !route.query.topic) {
          newQuery.topic = previewStore.topic;
        }
        if (previewStore.template && !route.params.template) {
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

  return {
    // Refs
    isEditMode,
    currentId,
    existingData,
    userEmail,
    showEmailModal,
    showAudioTrimmer,
    currentAudioFile,
    currentAudioIndex,
    trimmedAudioIndexes,
    isLoadingTemplate,
    isNavigating,
    deletedUrls,
    selectedDuration,
    constraints,
    stopWatchRef,
    // Computed
    canAdd,
    remaining,
    mediaTypes,
    filledContentCount,
    // Additional
    managers,
    labels,
    // Functions
    handleVerifiedEmail,
    getMaxForMedia,
    removeExisting,
    handleMedia,
    handleAudioTrimmed,
    handleAudioTrimCancel,
    validate,
    handlePreview,
    handleSubmit,
    // From composables
    content,
    loading,
    imageManager,
    videoManager,
    audioManager,
    addContentItem,
    removeContentItem,
    updateContentItem,
    totalProgress,
    upload,
    prepareUpload,
    // From useAudioTrimmer
    isExtractingAudio,
    extractProgress,
    cancelExtract,
    extractAudioFromVideo,
    // From useExpiry
    expiresAt,
    countdown,
    countdownInterval,
    calculateExpiryDate,
    updateCountdown,
    startCountdown,
    // From useTemplateManager
    prefetchTemplateShell,
    incrementTemplateStats,
  };
};