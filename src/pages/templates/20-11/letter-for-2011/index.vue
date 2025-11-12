<script setup lang="ts">
// SỬA 1: Import thêm 'nextTick'
import { ref, computed, nextTick } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

// --- Dữ liệu (giữ nguyên) ---
const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const letterTitle = computed(() => contextData.value?.content?.[0] || "Tri Ân Thầy Cô");
const letterBody = computed(() => contextData.value?.content?.[1] || "...");
const letterImages = computed(() => contextData.value?.images || []);
const letterAudio = computed(() => contextData.value?.audios?.[0] || null);

// SỬA 2: Thêm một 'ref' để điều khiển thẻ <audio>
const audioPlayer = ref<HTMLAudioElement | null>(null);

// --- Logic mở thư ---
const isOpened = ref(false);
const openLetter = () => {
  isOpened.value = true;
  
  // SỬA 3: Ra lệnh bật nhạc sau khi thư đã mở
  // (dùng nextTick để đảm bảo thẻ <audio> đã kịp render)
  nextTick(() => {
    if (audioPlayer.value) {
      audioPlayer.value.play().catch(e => console.error("Lỗi phát nhạc:", e));
    }
  });
};

const focusedImage = ref<string | null>(null);

// --- Style cho 5 ảnh xếp chồng ---
const getImageStyle = (index: number) => {
  const styles = [
    { transform: 'rotate(-10deg)', left: '1rem', top: '1rem', zIndex: 1 },
    { transform: 'rotate(5deg)', left: 'auto', right: '5rem', top: '0.5rem', zIndex: 2 },
    { transform: 'rotate(15deg)', left: 'auto', right: '1rem', top: '1.5rem', zIndex: 3 },
    { transform: 'rotate(0deg)', left: '3rem', top: '0rem', zIndex: 4 },
    { transform: 'rotate(-5deg)', left: '7rem', top: '1rem', zIndex: 5 } // Style cho ảnh thứ 5
  ];
  return styles[index % 5]; 
};

// --- Logic cho hiệu ứng icon bay ---
const getParticleStyle = () => {
  const size = Math.random() * 1.5 + 1; // Kích thước font (rem)
  const duration = Math.random() * 20 + 15; // Thời gian bay (15-35s)
  const delay = Math.random() * -20; // Bắt đầu ở các thời điểm khác nhau
  const left = Math.random() * 100; // Vị trí trái

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

    <div class="absolute inset-2 z-[25] pointer-events-none">
      <span 
        v-for="i in 20" 
        :key="i"
        class="particle-icon" 
        :style="getParticleStyle()"
      >
        {{ i % 2 === 0 ? '💐' : '📚' }}
      </span>
    </div>

    <div class="relative z-10 flex flex-col items-center">

      <div class="relative w-96 z-10" style="height: 40rem;"> 
        
        <h1 
          class="title-clamp text-5xl font-extralight text-amber-900 text-center mb-4 transition-all duration-500" 
          style="font-family: 'Dancing Script', cursive;"
          :class="{ 'opacity-0 -translate-y-4': isOpened }"
        >
          {{ letterTitle }}
        </h1>
        
        <div
          class="absolute top-40 w-full transition-all duration-1000 ease-in-out transform-gpu"
          :class="{
            'opacity-0 translate-y-4 z-10': !isOpened,
            'opacity-100 z-30 [transform:translateY(-6rem)]': isOpened
          }"
        >
          <div class="relative z-10 w-full h-80 paper-texture p-6 rounded-lg flex flex-col">
            <div class="flex-1 overflow-y-auto pr-2 min-h-0">
              <p class="font-serif text-stone-800 whitespace-pre-line text-sm break-words">
                {{ letterBody }}
              </p>
            </div>
            
            <audio v-if="letterAudio" ref="audioPlayer" loop preload="auto">
              <source :src="letterAudio" type="audio/mpeg">
            </audio>

          </div>

          <div 
            v-if="letterImages.length > 0"
            class="relative z-20 h-48 " > 
            <img 
              v-for="(image, index) in letterImages.slice(0, 5)" 
              :key="image" 
              :src="image" 
              alt="Ảnh kỷ niệm" 
              class="absolute w-28 h-auto p-1 bg-white rounded shadow-md cursor-pointer transition-all duration-100 hover:scale-110 hover:shadow-lg hover:z-20"
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
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] text-yellow-500 text-6xl z-30 transition-all duration-300"
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

/* Import font Lora (serif), Dancing Script (tiêu đề), VÀ Caveat (viết tay) */
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap'); 

/*
  TEXTURE GIẤY
*/
.paper-texture {
background-color: #ffffff;
background-image: url("https://www.transparenttextures.com/patterns/gray-floral.png");
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 0.75rem;
}

/*
  FONT CHỮ VIẾT TAY
*/
.font-serif {
  font-family: 'Caveat', cursive; /* Đổi sang font viết tay */
  font-size: 19px; 
  line-height: 1.7; 
}

[style*="font-family: 'Dancing Script'"] {
  font-family: 'Dancing Script', cursive;
}

/*
  GIỚI HẠN TITLE (2 DÒNG VÀ DẤU ...)
*/
.title-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-line-clamp: 2; /* Giới hạn 2 dòng */
  line-clamp: 2;         /* Tắt warning */
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  line-height: 1.2;
  max-height: 3.6em; /* Hết warning */
}


/*
  Định nghĩa cho icon bay
*/
.particle-icon {
  position: absolute;
  bottom: -50px; /* Bắt đầu từ dưới */
  color: rgba(217, 119, 6); /* Sửa lỗi màu (từ 10 -> 0.3) */
  animation: float-up 20s infinite linear;
  will-change: transform;
}

/*
  SỬA LỖI GÕ SAI: 'translater' -> 'translateY'
*/
@keyframes float-up {
  0% {
    transform: translateY(0); /* Sửa lỗi gõ sai ở đây */
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100vh); /* Bay lên hết màn hình */
    opacity: 0;
  }
} 

</style>