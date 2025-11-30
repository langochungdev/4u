<script setup lang="ts">
import { onMounted, ref, nextTick, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";
import { initNoelLove, initChristmasScene } from "./noelLove";

// --- IMPORT ẢNH ---
import bgPhase2Img from "./img/top.webp";     
import mainCenterImg from "./img/thong.webp";  
import triggerImg from "./img/OIP.webp";     
import santaImgPath from "./img/santa.webp";   
import giftImgPath from "./img/gift.webp";     

useHead({
  script: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', tagPosition: 'bodyClose' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/Draggable.min.js', tagPosition: 'bodyClose' }
  ]
});

const { contextData } = useTemplateData(TEMPLATE_CONFIG);

// Gán biến ảnh
const bgUrl = bgPhase2Img;
const mainCenterUrl = mainCenterImg;
const triggerUrl = triggerImg;
const santaUrl = santaImgPath;
const giftUrl = giftImgPath;

const showTree = ref(false);
const showModal = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);

const bgAudio = computed(() => contextData.value?.audios?.[0] ?? "");
const mainImage = computed(() => contextData.value?.images?.[0] ?? "");
const mainText = computed(() => contextData.value?.content?.[0] ?? "");

async function onCompleted() {
  showTree.value = true;
  await nextTick();
  initChristmasScene();
  if (audioRef.value) {
    audioRef.value.play().catch(() => {});
  }
}

function openModal() { showModal.value = true; }
function closeModal() { showModal.value = false; }

onMounted(() => {
  initNoelLove(onCompleted);
});
</script>

<template>
  <ClientOnly>
    <div 
      class="noel-love-root fullscreen-fix" 
      :class="{ 'phase-two': showTree }"
      :style="showTree ? { backgroundImage: `url(${bgUrl})` } : {}"
    >
      
      <audio v-if="bgAudio" ref="audioRef" :src="bgAudio" loop class="hidden"></audio>

      <div v-show="!showTree" class="slider-container">
        <p class="guide-text">Kéo trái tim sang bên phải để mở quà 🎄</p>
        <svg id="loveSliderSVG" viewBox="0 0 800 600">
           <defs><mask id="heartFillMask"><rect class="heartFill" x="-54" y="72" width="237" height="91" fill="#FFF" /></mask></defs>
           <line class="trackBg" x1="50" x2="750" y1="366" y2="366" />
           <line class="trackMiddle" x1="50" x2="750" y1="366" y2="366" />
           <line class="track" x1="50" x2="750" y1="366" y2="366" stroke-dasharray="0 100%" pathLength="1" />
           <g id="heartChat" class="heartChat">
             <path d="M115.4,92H81.1a8.3,8.3,0,0,1-5.9,2.4L65.3,104.3a1,1,0,0,1-1.3,0L54.1,94.4A8.3,8.3,0,0,1,48.2,92H13.9A10.4,10.4,0,0,1,3.5,81.6V13.9A10.4,10.4,0,0,1,13.9,3.5H115.4a10.4,10.4,0,0,1,10.4,10.4V81.6A10.4,10.4,0,0,1,115.4,92Z" fill="none" />
             <path d="M115.4,92H81.1a8.3,8.3,0,0,1-5.9,2.4L65.3,104.3a1,1,0,0,1-1.3,0L54.1,94.4A8.3,8.3,0,0,1,48.2,92H13.9A10.4,10.4,0,0,1,3.5,81.6V13.9A10.4,10.4,0,0,1,13.9,3.5H115.4a10.4,10.4,0,0,1,10.4,10.4V81.6A10.4,10.4,0,0,1,115.4,92Z" fill="none" stroke="#FFFCF9" stroke-miterlimit="10" stroke-width="5" />
             <g mask="url(#heartFillMask)"><path id="XXpinkHeart" d="M76.16,23a13.23,13.23,0,0,0-10.83,5.63,13.24,13.24,0,0,0-24.08,7.62c0,18.06,24.08,34.92,24.08,34.92S89.41,54.33,89.41,36.27A13.25,13.25,0,0,0,76.16,23Z" fill="#ff595e" /></g>
           </g>
           <circle class="follower" cx="0" cy="0" r="0" fill="#62B6CB" stroke="#FFFCF9" stroke-width="0" />
           <circle class="liquidFollower" cx="0" cy="0" r="0" fill="#62B6CB" stroke="#FFFCF9" stroke-width="0" />
           <rect class="dragger" x="-100" y="105" width="290" height="220" fill="transparent" style="cursor: grab;" />
        </svg>
      </div>

      <div v-show="showTree" class="scene-container">
        <div class="christmas-scene">
          
          <img :src="mainCenterUrl" class="main-illu" alt="Christmas Tree" />

          <img :src="santaUrl" class="decor-santa" alt="Santa" />
          <img :src="giftUrl" class="decor-gift" alt="Gift" />
          
          <div class="letter-trigger" @click="openModal">
             <div class="letter-label">Bạn có thư nè 💌</div>
             <img :src="triggerUrl" class="letter-img" />
          </div>

        </div>
      </div>

      <transition name="fade">
        <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card">
            <div class="modal-header">
              <span>Món quà dành cho bạn nè</span>
              <button @click="closeModal">✕</button>
            </div>
            <div class="modal-body">
              <img v-if="mainImage" :src="mainImage" class="modal-img" />
              <p class="modal-msg">{{ mainText }}</p>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </ClientOnly>
</template>

<style src="./style.css"></style>