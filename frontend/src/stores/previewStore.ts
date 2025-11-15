import { defineStore } from 'pinia';

export const usePreviewStore = defineStore('preview', {
  state: () => ({
    content: [] as string[],
    images: [] as string[], // Preview URLs (blob URLs + existing URLs)
    videos: [] as string[],
    audios: [] as string[],
    imageFiles: [] as File[],
    videoFiles: [] as File[],
    audioFiles: [] as File[],
    template: 'demo',
    topic: '',
    editId: null as string | null,
    deletedUrls: [] as string[],
  }),

  getters: {
    hasData: (state) => 
      state.content.length > 0 || 
      state.imageFiles.length > 0 || 
      state.videoFiles.length > 0 || 
      state.audioFiles.length > 0,

    isEditMode: (state) => state.editId !== null,

    displayData: (state) => ({
      content: state.content,
      images: state.images,
      videos: state.videos,
      audios: state.audios,
    }),
  },

  actions: {
    setPreviewData(data: {
      content: string[];
      images: string[];
      videos: string[];
      audios: string[];
      imageFiles: File[];
      videoFiles: File[];
      audioFiles: File[];
      template: string;
      topic?: string;
      editId?: string | null;
      deletedUrls?: string[];
    }) {
      this.content = data.content;
      this.images = data.images;
      this.videos = data.videos;
      this.audios = data.audios;
      this.imageFiles = data.imageFiles;
      this.videoFiles = data.videoFiles;
      this.audioFiles = data.audioFiles;
      this.template = data.template;
      this.topic = data.topic || '';
      this.editId = data.editId || null;
      this.deletedUrls = data.deletedUrls || [];
    },

    restoreToInput() {
      return {
        content: this.content,
        imageFiles: this.imageFiles,
        videoFiles: this.videoFiles,
        audioFiles: this.audioFiles,
        editId: this.editId,
        deletedUrls: this.deletedUrls,
      };
    },

    clear() {
      this.$reset();
    },
  },

  persist: {
    key: 'preview-store',
    storage: localStorage,
    pick: ['content', 'template', 'topic', 'editId', 'deletedUrls'],
  },
});
