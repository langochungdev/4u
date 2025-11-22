import { doc, setDoc, increment } from "firebase/firestore"
import { canCreate, getEcardLimit } from '~/composables/useEcards'
import { useContext } from "~/composables/useContext"
import { useCloudinary } from "~/composables/useCloudinary"
import { getTemplateConfig, isValidTemplate } from "~/config/templates"
import { contextService } from "../service/context.service"
import { userService } from "../service/user.service"
import { useExpiry } from "./useExpiry"
import { useTemplateManager } from "./useTemplateManager"
import { useMediaInput } from "./useMediaInput"
import { useValidation } from "./useValidation"
import { useMediaUtils } from "./useMediaUtils"

export const useInputLogic = () => {
  const route = useRoute()
  const router = useRouter()
  const previewStore = usePreviewStore()
  const emailCookie = useCookie('email')
  const { $firestore } = useNuxtApp()
  const db = $firestore
  const config = useRuntimeConfig()

  const { content, loading, submit, imageManager, videoManager, audioManager, fetchContext, update, addContentItem, removeContentItem, updateContentItem } = useContext()
  const { upload, totalProgress, prepareUpload } = useCloudinary()
  const { expiresAt, countdown, countdownInterval, calculateExpiryDate, updateCountdown, startCountdown } = useExpiry()
  const { prefetchTemplateShell, incrementTemplateStats } = useTemplateManager()

  const isEditMode = ref(false)
  const currentId = ref<string | null>(null)
  const existingData = ref<any>(null)
  const userEmail = ref<string | null>(route.query.email ? String(route.query.email) : (emailCookie.value || null))
  const showEmailModal = ref(false)
  const isLoadingTemplate = ref(false)
  const isNavigating = ref(false)
  const deletedUrls = ref<string[]>([])
  const selectedDuration = ref<'1day' | '1week' | '1month' | '6months'>('1day')

  const constraints = ref({
    maxImages: config.public.maxImages,
    maxVideos: config.public.maxVideos,
    maxAudios: config.public.maxAudios,
    maxContent: Infinity,
    contentPlaceholders: [] as string[],
    template: 'default'
  })

  const {
    showAudioTrimmer,
    currentAudioFile,
    currentAudioIndex,
    trimmedAudioIndexes,
    handleMedia,
    handleAudioTrimmed,
    handleAudioTrimCancel,
    removeExisting: removeExistingMedia,
    isExtractingAudio,
    extractProgress,
    cancelExtract,
    extractAudioFromVideo
  } = useMediaInput(imageManager, videoManager, audioManager, constraints, existingData)

  const { validate } = useValidation(content, constraints, imageManager, videoManager, audioManager, existingData)
  const { labels, managers, getCount } = useMediaUtils(imageManager, videoManager, audioManager, existingData)

  const removeExisting = (type: 'image' | 'video' | 'audio', index: number) => {
    removeExistingMedia(type, index, deletedUrls)
  }

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

  function handleVerifiedEmail(email: string) {
    emailCookie.value = email
    userEmail.value = email
    showEmailModal.value = false
  }

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
    if (mediaKey === 'image') return constraints.value.maxImages
    if (mediaKey === 'video') return constraints.value.maxVideos
    return constraints.value.maxAudios
  }

  const getTemplateInfo = () => {
    const templateName = route.params.template as string || route.query.template as string || 'demo'
    const topic = route.query.topic as string || ''
    return { templateName, topic }
  }

  const applyTemplateConfig = async (config: any) => {
    constraints.value.maxImages = config.maxImages
    constraints.value.maxVideos = config.maxVideos
    constraints.value.maxAudios = config.maxAudios
    constraints.value.maxContent = config.maxContent
    if (config.contentPlaceholders) {
      constraints.value.contentPlaceholders = config.contentPlaceholders
    }
  }

  const checkEmailLimit = async (email: string) => {
    try {
      const { allowed } = await canCreate(email, constraints.value.template)
      if (!allowed) {
        alert(`Bạn đã vượt quá số lượng thiệp cho phép (tối đa ${getEcardLimit()}).`)
        router.push({ name: 'Home' })
        return false
      }
      return true
    } catch (err) {
      return true
    }
  }

  const filterDeletedUrls = (urls: string[] = []) =>
    urls.filter(url => !deletedUrls.value.includes(url))

  const parseFirestoreDate = (firestoreDate: any): Date | null => {
    if (!firestoreDate) return null
    if (firestoreDate.toDate) return firestoreDate.toDate()
    if (firestoreDate instanceof Date) return firestoreDate
    if (typeof firestoreDate === 'number') return new Date(firestoreDate)
    return null
  }

  const restorePreviewData = async () => {
    content.value = [...previewStore.content]
    if (previewStore.imageFiles.length) imageManager.addFiles(previewStore.imageFiles)
    if (previewStore.videoFiles.length) videoManager.addFiles(previewStore.videoFiles)
    if (previewStore.audioFiles.length) audioManager.addFiles(previewStore.audioFiles)

    if (previewStore.editId) {
      isEditMode.value = true
      currentId.value = previewStore.editId
      deletedUrls.value = previewStore.deletedUrls || []

      if (!existingData.value && currentId.value) {
        existingData.value = await fetchContext(currentId.value)
      }

      if (existingData.value && deletedUrls.value.length > 0) {
        existingData.value.images = existingData.value.images.filter((url: string) => !deletedUrls.value.includes(url))
        if (existingData.value.videos) {
          existingData.value.videos = existingData.value.videos.filter((url: string) => !deletedUrls.value.includes(url))
        }
        if (existingData.value.audios) {
          existingData.value.audios = existingData.value.audios.filter((url: string) => !deletedUrls.value.includes(url))
        }
      }
    }

    const needRestore = (previewStore.topic && !route.query.topic) || (previewStore.template && !route.params.template)
    if (needRestore) {
      const newQuery = { ...route.query }
      if (previewStore.topic && !route.query.topic) {
        newQuery.topic = previewStore.topic
      }
      if (previewStore.template && !route.params.template) {
        newQuery.template = previewStore.template
      }
      await router.replace({
        ...route,
        query: newQuery
      })
    }

    if (previewStore.template) {
      constraints.value.template = previewStore.template
    }
  }

  const handlePreview = () => {
    if (!validate()) return;

    const { templateName, topic } = getTemplateInfo();

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
        const finalImages = [...filterDeletedUrls(existingData.value?.images), ...imageUrls];
        const finalVideos = [...filterDeletedUrls(existingData.value?.videos), ...videoUrls];
        const finalAudios = [...filterDeletedUrls(existingData.value?.audios), ...audioUrls];

        await contextService.updateContextWithDeleted(currentId.value, {
          content: content.value.filter(c => c.trim()),
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

        // Set progress to 100% to hide overlay
        totalProgress.value = 100;
        try { await waitUntilProgressComplete(4000); } catch (_e) {}

        const { templateName, topic } = getTemplateInfo();
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
              const { templateName, topic } = getTemplateInfo();
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
          const { templateName, topic } = getTemplateInfo();

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

        await applyTemplateConfig(config);
        constraints.value.template = templateNameToUse;

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
          await applyTemplateConfig(config);
        }
      } catch (_err) {
        // Silent fail
      }
      finally { isLoadingTemplate.value = false }

      try { prefetchTemplateShell(route.query.topic as string | undefined, constraints.value.template); } catch (_e) { }

      const emailFromQuery = route.query.email as string | undefined;
      const emailToCheck = emailFromQuery || userEmail.value;
      if (emailToCheck) {
        const allowed = await checkEmailLimit(emailToCheck);
        if (!allowed) return;
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
          await applyTemplateConfig(config);
        }
      } catch (err) {
        // Silent fail
      }
      try { prefetchTemplateShell(route.query.topic as string | undefined, constraints.value.template); } catch (_e) { }
      const emailToCheck = (route.query.email as string) || userEmail.value;
      if (emailToCheck) {
        const allowed = await checkEmailLimit(emailToCheck);
        if (!allowed) return;
      }
    });

    const docId = route.query.id as string;
    if (docId) {
      isEditMode.value = true;
      currentId.value = docId;
      existingData.value = await fetchContext(docId);

      if (existingData.value?.expiresAt) {
        expiresAt.value = parseFirestoreDate(existingData.value.expiresAt)
        if (expiresAt.value) {
          startCountdown()
        }
      }
    }

    if ((route.query.fromPreview === 'true' || route.query.confirmPreview === 'true') && previewStore.hasData) {
      await restorePreviewData()
      if (route.query.confirmPreview === 'true') await handleSubmit()
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