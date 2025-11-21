import { contextService, type ContextPayload } from "~/pages/input/service/context.service"
import type { TemplateConfig } from "~/config/templates"

export const useTemplateData = (templateConfig: TemplateConfig) => {
  const route = useRoute()
  const router = useRouter()
  const previewStore = usePreviewStore()
  const contextData = ref<ContextPayload | null>(null)

  const isPreviewMode = computed(() => route.query.preview === "true");

  onMounted(async () => {
    const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id as string;

    if (isPreviewMode.value) {
      // Preview mode: load from store or redirect
      if ((previewStore as any).hasData) {
        contextData.value = {
          content: previewStore.content,
          images: previewStore.images,
          videos: previewStore.videos,
          audios: previewStore.audios,
        };
      } else {
        router.push("/");
      }
    } else if (!id) {
      // No ID: redirect to input with template constraints
      router.push({
        path: '/input',
        query: {
          maxImages: templateConfig.maxImages.toString(),
          maxVideos: templateConfig.maxVideos.toString(),
          maxAudios: templateConfig.maxAudios.toString(),
          maxContent: templateConfig.maxContent.toString(),
          template: templateConfig.templateName
        }
      });
    } else {
      // Load from Firebase
      const data = await contextService.getById(id);
      if (data) contextData.value = data;
    }
  });

  return { contextData, isPreviewMode };
};
