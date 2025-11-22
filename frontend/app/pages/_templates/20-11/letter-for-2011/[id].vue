<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useTemplateData } from "../../../../composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

// --- Dữ liệu ---
const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const letterTitle = computed(() => contextData.value?.content?.[0] || "Tri Ân Thầy Cô");
const letterBody = computed(() => contextData.value?.content?.[1] || "Nhân ngày 20/11, em gửi đến thầy cô ngàn lời tri ân...");
const letterImages = computed(() => contextData.value?.images || []);
const letterAudio = computed(() => contextData.value?.audios?.[0] || null);

const audioPlayer = ref<HTMLAudioElement | null>(null);

// --- Logic mở thư ---
const isOpened = ref(false);
const openLetter = () => {
  isOpened.value = true;
  nextTick(() => {
    if (audioPlayer.value) {
      audioPlayer.value.play().catch(e => console.error("Lỗi phát nhạc:", e));
    }
  });
};

const focusedImage = ref<string | null>(null);

// --- Style cho ảnh xếp chồng ---
const getImageStyle = (index: number) => {
  const styles = [
    { transform: 'rotate(-10deg)', left: '1rem', top: '-1rem', zIndex: 1 }, // Giảm top: 1rem -> -1rem
    { transform: 'rotate(5deg)', left: 'auto', right: '5rem', top: '-1.5rem', zIndex: 2 }, // Giảm top: 0.5rem -> -1.5rem
    { transform: 'rotate(15deg)', left: 'auto', right: '1rem', top: '-0.5rem', zIndex: 3 }, // Giảm top: 1.5rem -> -0.5rem
    { transform: 'rotate(0deg)', left: '3rem', top: '-2rem', zIndex: 4 }, // Giảm top: 0rem -> -2rem
    { transform: 'rotate(-5deg)', left: '7rem', top: '-1rem', zIndex: 5 } // Giảm top: 1rem -> -1rem
  ];
  return styles[index % 5]; 
};

// --- Icon bay ---
const getParticleStyle = () => {
  const size = Math.random() * 1.5 + 1; 
  const duration = Math.random() * 20 + 15; 
  const delay = Math.random() * -20; 
  const left = Math.random() * 100; 

  return {
    fontSize: `${size}rem`,
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
};
</script>

<template>
  <div class="relative min-h-screen bg-amber-50 overflow-hidden flex items-center justify-center py-10">

    <div class="absolute inset-2 z-25 pointer-events-none">
      <span v-for="i in 20" :key="i" class="particle-icon" :style="getParticleStyle()">
        {{ i % 2 === 0 ? '💐' : '📚' }}
      </span>
    </div>

    <div class="relative z-10 flex flex-col items-center w-full px-4"> <div class="relative w-full max-w-md z-10" style="height: 40rem;"> <h1 
          class="title-clamp text-3xl md:text-5xl font-bold text-amber-900 text-center mb-4 transition-all duration-500" 
          style="font-family: 'Mali', cursive;"
          :class="{ 'opacity-0 -translate-y-4': isOpened }"
        >
          {{ letterTitle }}
        </h1>
        
        <div
          class="absolute top-40 w-full transition-all duration-1000 ease-in-out transform-gpu"
          :class="{
            'opacity-0 translate-y-4 z-10': !isOpened,
            'opacity-100 z-30 transform-[translateY(-6rem)]': isOpened
          }"
        >
          <div class="relative z-10 w-full h-96 paper-texture p-6 rounded-lg flex flex-col shadow-xl"> <div class="flex-1 overflow-y-auto pr-2 min-h-0 scrollbar-hide">
              <p class="font-handwriting text-stone-800 whitespace-pre-line text-lg md:text-xl wrap-break-word">
                {{ letterBody }}
              </p>
            </div>
            
            <audio v-if="letterAudio" ref="audioPlayer" loop preload="auto">
              <source :src="letterAudio" type="audio/mpeg">
            </audio>

          </div>

          <div 
            v-if="letterImages.length > 0"
            class="relative z-20 h-48 mt-4" > 
            <img 
              v-for="(image, index) in letterImages.slice(0, 5)" 
              :key="image" 
              :src="image" 
              alt="Ảnh kỷ niệm" 
              class="absolute w-24 md:w-32 h-auto p-1 bg-white rounded shadow-md cursor-pointer transition-all duration-100 hover:scale-110 hover:shadow-lg hover:z-20"
              :style="getImageStyle(index)"
              @click="focusedImage = image"
            />
          </div>
          
        </div>

        <div
          class="absolute top-40 left-0 w-full h-52 z-20 cursor-pointer"
          @click="openLetter"
        >
          <div 
            class="absolute top-0 left-0 w-full h-full bg-amber-800 rounded-lg shadow-lg transition-opacity duration-700"
            :class="{ 'opacity-0': isOpened }"
          >
            <img 
              v-if="letterImages.length > 0"
              :src="letterImages[0]" 
              alt="Tem thư" 
              class="absolute bottom-4 right-4 w-12 h-12 rounded-md border-2 border-white object-cover" 
            />
          </div>
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-yellow-500 text-6xl z-30 transition-all duration-300"
            :class="{ 'opacity-0 scale-0': isOpened }"
            style="text-shadow: 0 2px 4px rgba(0,0,0,0.2);"
          >
            💐
          </div>
          <div
            class="absolute top-0 left-0 w-full h-28 bg-amber-900 rounded-t-lg origin-bottom transition-all duration-700 ease-in-out"
            style="clip-path: polygon(0 0, 100% 0, 50% 100%);"
            :class="{ 'opacity-0': isOpened }"
          >
          </div>
        </div>
      </div> 

    </div> 
  </div> 
  
  <div 
    v-if="focusedImage"
    class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-5"
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


@import url('https://fonts.googleapis.com/css2?family=Mali:wght@400;600;700&family=Patrick+Hand&display=swap&subset=vietnamese');

/* TEXTURE GIẤY */
.paper-texture {
background-color: #fafffb;
background-image: url("https://www.transparenttextures.com/patterns/gray-floral.png");
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 0.5rem;
}

/* FONT CHỮ NỘI DUNG */
.font-handwriting {
  font-family: 'Patrick Hand', cursive;
  font-weight: 400;
  line-height: 1.6;
}

/* FONT CHỮ TIÊU ĐỀ */
[style*="font-family: 'Mali'"] {
  font-family: 'Mali', cursive;
}

/* GIỚI HẠN TITLE */
.title-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  line-height: 1.3;
  padding: 0 10px; /* Thêm padding để không sát lề điện thoại */
}

/* ICON BAY */
.particle-icon {
  position: absolute;
  bottom: -50px;
  color: rgba(217, 119, 6, 0.6);
  animation: float-up 20s infinite linear;
  will-change: transform;
}

@keyframes float-up {
  0% {
    transform: translateY(0);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100vh);
    opacity: 0;
  }
} 

/* Ẩn thanh cuộn cho đẹp trên mobile */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>