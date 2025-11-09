<script setup lang="ts">
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./demo.config";

const { contextData } = useTemplateData(TEMPLATE_CONFIG);
</script>

<template>
  <div class="min-h-screen p-4">
    <div class="max-w-4xl mx-auto">
      <div v-if="contextData" class="py-8 space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Nội dung ({{ contextData.content.length }})
          </h2>
          <div class="space-y-4">
            <div v-for="(item, index) in contextData.content" :key="index"
                 class="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                {{ index + 1 }}
              </span>
              <p class="text-gray-700 whitespace-pre-wrap">{{ item }}</p>
            </div>
          </div>
        </div>

        <div v-if="contextData.images?.length" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Hình ảnh ({{ contextData.images.length }})
          </h2>
          <div class="grid grid-cols-3 gap-4">
            <img v-for="(image, index) in contextData.images" :key="index"
                 :src="image" class="w-full h-32 object-cover rounded" />
          </div>
        </div>

        <div v-if="contextData.videos?.length" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Video ({{ contextData.videos.length }})
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <video v-for="(video, index) in contextData.videos" :key="index"
                   :src="video" controls class="w-full"></video>
          </div>
        </div>

        <div v-if="contextData.audios?.length" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Audio ({{ contextData.audios.length }})
          </h2>
          <div class="space-y-2">
            <audio v-for="(audio, index) in contextData.audios" :key="index"
                   :src="audio" controls class="w-full"></audio>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>