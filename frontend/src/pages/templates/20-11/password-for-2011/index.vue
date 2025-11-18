<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

import './style.css';


const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const letterContent = computed(() => contextData.value?.content?.[0] || 'Chúc thầy cô một ngày 20/11 thật ý nghĩa...');
const images = computed(() => contextData.value?.images || []);
const audioUrl = computed(() => contextData.value?.audios?.[0] || null);

const audioPlayer = ref<HTMLAudioElement | null>(null);
const passwordInput = ref("");
const errorMessage = ref("");
const isLoggedIn = ref(false);
const currentView = ref("hub");

const selectedImageIndex = ref<number | null>(null);

const selectedImageUrl = computed(() => {
  if (selectedImageIndex.value === null) return null;
  return images.value[selectedImageIndex.value];
});

// 3. LOGIC CHÍNH (Giữ nguyên)
const checkPassword = () => {
  if (passwordInput.value === "2011") {
    isLoggedIn.value = true;
    errorMessage.value = "";
    audioPlayer.value?.play().catch(e => console.error("Lỗi phát nhạc:", e));
  } else {
    errorMessage.value = "Mật mã không đúng!";
    setTimeout(() => {
      passwordInput.value = "";
      errorMessage.value = "";
    }, 1000);
  }
};
const handleKeyPress = (num: string) => {
  if (passwordInput.value.length < 4) passwordInput.value += num;
  if (passwordInput.value.length === 4) setTimeout(checkPassword, 200);
};
const handleDelete = () => {
  passwordInput.value = passwordInput.value.slice(0, -1);
  errorMessage.value = "";
};
const showLetter = () => currentView.value = "letter";
const showCamera = () => currentView.value = "camera";
const goBackToHub = () => currentView.value = "hub";

// --- THÊM MỚI: Logic xem ảnh ---
const openImageViewer = (index: number) => {
  selectedImageIndex.value = index;
};
const closeImageViewer = () => {
  selectedImageIndex.value = null;
};
// Lật ảnh tiếp theo (có vòng lặp)
const showNextImage = () => {
  if (selectedImageIndex.value !== null) {
    selectedImageIndex.value = (selectedImageIndex.value + 1) % images.value.length;
  }
};
// Lật ảnh trước (có vòng lặp)
const showPrevImage = () => {
  if (selectedImageIndex.value !== null) {
    selectedImageIndex.value = (selectedImageIndex.value - 1 + images.value.length) % images.value.length;
  }
};
// ---------------------------------

// 5. LOGIC ICON BAY (Giữ nguyên)
const particles = ref<any[]>([]);
const createParticles = () => {
  const arr = [];
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 1.5 + 0.8;
    const duration = Math.random() * 20 + 20;
    const delay = Math.random() * -20;
    const left = Math.random() * 100;
    arr.push({
      fontSize: `${size}rem`, left: `${left}%`,
      animationDuration: `${duration}s`, animationDelay: `${delay}s`,
      icon: ['📚', '🖋️', '🌸', '🏫', '🎓', '💐'][i % 6],
    });
  }
  particles.value = arr;
};

// 6. LOGIC DÁN ẢNH (Giữ nguyên)
const getPhotoStyle = (index: number) => {
  const rotations = [-5, 8, -3, 6, -7];
  const positions = [
    { top: '15%', left: '10%' },
    { top: '20%', right: '15%' },
    { top: '45%', left: '20%' },
    { top: '55%', right: '10%' },
    { top: '30%', left: '55%' },
  ];
  const style = positions[index % 5] || { top: '0', left: '0' };
  return {
    ...style,
    transform: `rotate(${rotations[index % 5]}deg)`,
    zIndex: index + 1,
  };
};

onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.load();
  }
  createParticles(); // Thêm lại icon bay
});
</script>

<template>
  <div class="album-container relative flex items-center justify-center min-h-screen overflow-hidden p-4">

    <audio v-if="audioUrl" ref="audioPlayer" :src="audioUrl" loop id="audio-player"></audio>
    
    <div class="particle-background">
      <span v-for="(p, index) in particles" :key="index" class="particle-icon" :style="p">
        {{ p.icon }}
      </span>
    </div>

    <Transition name="fade">
      <div v-if="!isLoggedIn" class="chalkboard-login">
        <span class="chalk-decor decor-1">🌸</span>
        <span class="chalk-decor decor-2">✨</span>
        <h2 class="chalk-title">Mật Mã Tri Ân</h2>
        <div class="pin-display">
          <span v-for="i in 4" :key="i" :class="{ 'filled': passwordInput.length >= i }"></span>
        </div>
        <p class="error-message">{{ errorMessage }}</p>
        <p class="chalk-hint">(Gợi ý: Ngày Nhà giáo Việt Nam)</p>
        <div class="keypad">
          <button @click="handleKeyPress('1')" class="key">1</button>
          <button @click="handleKeyPress('2')" class="key">2</button>
          <button @click="handleKeyPress('3')" class="key">3</button>
          <button @click="handleKeyPress('4')" class="key">4</button>
          <button @click="handleKeyPress('5')" class="key">5</button>
          <button @click="handleKeyPress('6')" class="key">6</button>
          <button @click="handleKeyPress('7')" class="key">7</button>
          <button @click="handleKeyPress('8')" class="key">8</button>
          <button @click="handleKeyPress('9')" class="key">9</button>
          <button class="key key-icon key-disabled"></button>
          <button @click="handleKeyPress('0')" class="key">0</button>
          <button @click="handleDelete" class="key key-icon">⌫</button>
        </div>
        <div class="chalk-tray"><span class="chalk"></span></div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isLoggedIn" class="w-full max-w-2xl">
        <Transition name="fade-fast" mode="out-in">
          
          <div v-if="currentView === 'hub'" class="hub-container-wow">
            <div @click="showLetter" class="hub-card-wow hub-letter">
              <div class="hub-card-inner">
                <div class="hub-front">💌</div>
                <div class="hub-back">Đọc Thư</div>
              </div>
            </div>
            <div @click="showCamera" class="hub-card-wow hub-album">
              <div class="hub-card-inner">
                <div class="hub-front">📷</div>
                <div class="hub-back">Xem Ảnh</div>
              </div>
            </div>
          </div>

          <div v-else-if="currentView === 'letter'" class="view-wrapper">
            <button @click="goBackToHub" class="back-button">&larr; Quay lại</button>
            <div class="letter-content paper-texture">
              <p class="message-body">{{ letterContent }}</p>
            </div>
          </div>

          <div v-else-if="currentView === 'camera'" class="view-wrapper">
            <button @click="goBackToHub" class="back-button">&larr; Quay lại</button>
            <div class="gallery-content-wow">
              <p class="gallery-title">Album ảnh</p>
              <div 
                v-for="(img, idx) in images" 
                :key="idx" 
                class="polaroid-wow"
                :style="getPhotoStyle(idx)"
                @click="openImageViewer(idx)" >
                <img :src="img" alt="Kỷ niệm"/>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
    
    <Transition name="fade">
      <div v-if="selectedImageUrl" class="image-viewer-overlay" @click.self="closeImageViewer">
        
        <button @click="closeImageViewer" class="close-button">&times;</button>
        
        <button @click="showPrevImage" class="nav-button prev-button">&lsaquo;</button>
        
        <Transition name="fade-fast" mode="out-in">
          <img :src="selectedImageUrl" :key="selectedImageUrl" alt="Xem ảnh lớn" class="fullscreen-image"/>
        </Transition>
        
        <button @click="showNextImage" class="nav-button next-button">&rsaquo;</button>
      </div>
    </Transition>
    
  </div>
</template>