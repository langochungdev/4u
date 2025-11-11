<script setup lang="ts">
import { ref, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const letterTitle = computed(() => contextData.value?.content?.[0] || "Teacher's Day");
const letterBody = computed(() => contextData.value?.content?.[1] || "...");
const letterImages = computed(() => contextData.value?.images || []);

const isOpened = ref(false);
const openLetter = () => {
  isOpened.value = true;
};

const focusedImage = ref<string | null>(null);

// --- Style cho 5 ảnh xếp chồng ---
const getImageStyle = (index: number) => {
  const styles = [
    { transform: 'rotate(-10deg)', left: '1rem', top: '1rem', zIndex: 1 },
    { transform: 'rotate(5deg)', left: 'auto', right: '5rem', top: '0.5rem', zIndex: 2 },
    { transform: 'rotate(15deg)', left: 'auto', right: '1rem', top: '1.5rem', zIndex: 3 },
    { transform: 'rotate(0deg)', left: '3rem', top: '0rem', zIndex: 4 },
    { transform: 'rotate(-5deg)', left: '7rem', top: '1rem', zIndex: 5 } 
  ];
  return styles[index % 5]; 
};
</script>

<template>
  <div class="relative min-h-screen bg-pink-50 overflow-hidden flex items-center justify-center py-10">

    <span class="absolute top-10 left-10 text-7xl text-pink-200 opacity-50 transform -rotate-12">❤️</span>
    <span class="absolute top-1/2 left-1/4 text-4xl text-pink-200 opacity-70 transform rotate-12">❤️</span>
    <span class="absolute top-1/3 right-10 text-8xl text-pink-200 opacity-50 transform rotate-20">❤️</span>
    <span class="absolute bottom-10 right-1/3 text-5xl text-pink-200 opacity-60 transform -rotate-45">❤️</span>
    <span class="absolute bottom-1/3 left-10 text-3xl text-pink-200 opacity-70 transform rotate-45">❤️</span>
    <span class="absolute bottom-20 right-10 text-6xl text-pink-200 opacity-50 transform rotate-12">❤️</span>

    <div class="relative z-10 flex flex-col items-center">

      <div class="relative w-96 z-10" style="height: 40rem;"> 
        
        <h1 
          class="text-5xl font-extralight text-pink-500 text-center mb-4 transition-all duration-500" 
          style="font-family: 'Dancing Script', cursive;"
          :class="{ 'opacity-0 -translate-y-4': isOpened }"
        >
          {{ letterTitle }}
        </h1>
        
        <div
          class="absolute top-40 w-full transition-all duration-[1500ms] ease-in-out transform-gpu"
          :class="{
            'opacity-0 translate-y-4 z-10': !isOpened,
            'opacity-100 z-30 [transform:translateY(-6rem)_rotateY(360deg)]': isOpened
          }"
        >
          <div class="relative z-10 w-full h-80 bg-pink-100 p-6 rounded-lg shadow-xl flex flex-col">
            <div class="flex-1 overflow-y-auto pr-2 min-h-0">
              <p class="font-serif text-stone-800 whitespace-pre-line text-sm break-words">
                {{ letterBody }}
              </p>
            </div>
          </div>
          
        </div>

        <div
          class="absolute top-40 left-0 w-full h-52 z-20 cursor-pointer"
          @click="openLetter"
        >
          <div class="absolute top-0 left-0 w-full h-full bg-pink-300 rounded-lg shadow-lg">
            <img 
              v-if="letterImages.length > 0"
              :src="letterImages[0]" 
              alt="Tem thư" 
              class="absolute bottom-4 right-4 w-12 h-12 rounded-md border-2 border-white object-cover" 
            />
          </div>
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] text-red-500 text-6xl z-30 transition-all duration-300"
            :class="{ 'opacity-0 scale-0': isOpened }"
            style="text-shadow: 0 2px 4px rgba(0,0,0,0.2);"
          >
            ❤️
          </div>
          <div
            class="absolute top-0 left-0 w-full h-28 bg-pink-400 rounded-t-lg origin-bottom transition-all duration-1000"
            style="clip-path: polygon(0 0, 100% 0, 50% 100%);"
            :class="{ '[transform:rotateX(180deg)]': isOpened }"
          >
          </div>
        </div>
      </div> 

     <div 
        v-if="letterImages.length > 0"
        class="absolute top-[30rem] left-0 w-96 h-48 transition-opacity duration-1000 delay-500"
        :class="isOpened ? 'opacity-100 z-30' : 'opacity-0 z-10'"
      >
        <img 
          v-for="(image, index) in letterImages.slice(0, 5)" 
          :key="image" 
          :src="image" 
          alt="Ảnh kỷ niệm" 
          class="absolute w-28 h-auto  bg-white rounded shadow-md cursor-pointer transition-all duration-100 hover:scale-70 hover:shadow-lg hover:z-20"
          :style="getImageStyle(index)"
          @click="focusedImage = image"
        />
      </div>

    </div> </div> 
  
  <div 
    v-if="focusedImage"
    class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    @click="focusedImage = null"
  >
    <img 
      :src="focusedImage" 
      alt="Ảnh phóng to" 
      class="max-w-full max-h-full rounded-lg shadow-xl"
    />
  </div>

</template>

<style scoped>

/* Import font Lora (serif) và Dancing Script (tiêu đề) */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');

.font-serif {
  font-family: 'Lora', serif;
  font-size: 15px; 
  line-height: 1.6; 
}

[style*="font-family: 'Dancing Script'"] {
  font-family: 'Dancing Script', cursive;
}
div[class*="[transform:rotateX(180deg)]"] {
  transform-style: preserve-3d;
}
.origin-bottom {
  transform-style: preserve-d;
}
</style>