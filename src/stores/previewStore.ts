import { defineStore } from 'pinia';

export const usePreviewStore = defineStore('preview', {
  state: () => ({
    title: '',
    content: '',
    images: [] as string[], // Preview URLs (blob URLs + existing URLs)
    videos: [] as string[],
    audios: [] as string[],
    imageFiles: [] as File[],
    videoFiles: [] as File[],
    audioFiles: [] as File[],
    template: 'demo',
    editId: null as string | null,
    deletedUrls: [] as string[],
  }),

  getters: {
    hasData: (state) => 
      state.title !== '' || 
      state.content !== '' || 
      state.imageFiles.length > 0 || 
      state.videoFiles.length > 0 || 
      state.audioFiles.length > 0,

    isEditMode: (state) => state.editId !== null,

    displayData: (state) => ({
      title: state.title,
      content: state.content,
      images: state.images,
      videos: state.videos,
      audios: state.audios,
    }),
  },

  actions: {
    setPreviewData(data: {
      title: string;
      content: string;
      images: string[];
      videos: string[];
      audios: string[];
      imageFiles: File[];
      videoFiles: File[];
      audioFiles: File[];
      template: string;
      editId?: string | null;
      deletedUrls?: string[];
    }) {
      this.title = data.title;
      this.content = data.content;
      this.images = data.images;
      this.videos = data.videos;
      this.audios = data.audios;
      this.imageFiles = data.imageFiles;
      this.videoFiles = data.videoFiles;
      this.audioFiles = data.audioFiles;
      this.template = data.template;
      this.editId = data.editId || null;
      this.deletedUrls = data.deletedUrls || [];
    },

    restoreToInput() {
      return {
        title: this.title,
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
    pick: ['title', 'content', 'template', 'editId', 'deletedUrls'],
  },
});
