<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTemplateData } from "../../../../composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

// --- Dữ liệu ---
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

// --- Logic Đăng Nhập ---
const checkPassword = () => {
  if (passwordInput.value === "2011") {
    isLoggedIn.value = true; errorMessage.value = "";
    audioPlayer.value?.play().catch(e => console.error("Lỗi phát nhạc:", e));
  } else {
    errorMessage.value = "Sai mật mã rồi!";
    setTimeout(() => { passwordInput.value = ""; errorMessage.value = ""; }, 1000);
  }
};
const handleKeyPress = (num: string) => {
  if (passwordInput.value.length < 4) passwordInput.value += num;
  if (passwordInput.value.length === 4) setTimeout(checkPassword, 200);
};
const handleDelete = () => { passwordInput.value = passwordInput.value.slice(0, -1); };

// --- Chuyển trang ---
const showLetter = () => currentView.value = "letter";
const showCamera = () => currentView.value = "camera";
const goBackToHub = () => currentView.value = "hub";

// --- Logic Xem Ảnh (Viewer) ---
const openImageViewer = (index: number) => { selectedImageIndex.value = index; };
const closeImageViewer = () => { selectedImageIndex.value = null; };
const showNextImage = () => { 
  if (selectedImageIndex.value !== null) 
    selectedImageIndex.value = (selectedImageIndex.value + 1) % images.value.length; 
};
const showPrevImage = () => { 
  if (selectedImageIndex.value !== null) 
    selectedImageIndex.value = (selectedImageIndex.value - 1 + images.value.length) % images.value.length; 
};

// --- Icon Bay ---
const particles = ref<any[]>([]);
onMounted(() => {
  if (audioPlayer.value) audioPlayer.value.load();
  const arr = [];
  for (let i = 0; i < 20; i++) {
    arr.push({
      fontSize: `${Math.random() * 1.5 + 0.8}rem`, left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 20 + 20}s`, animationDelay: `${Math.random() * -20}s`,
      icon: ['📚', '🖋️', '🌸', '🏫', '🎓', '💐'][i % 6],
    });
  }
  particles.value = arr;
});
</script>

<template>
  <div class="album-container">
    <audio v-if="audioUrl" ref="audioPlayer" :src="audioUrl" loop id="audio-player"></audio>
    <div class="particle-background"><span v-for="(p, i) in particles" :key="i" class="particle-icon" :style="p">{{ p.icon }}</span></div>

    <Transition name="fade">
      <div v-if="!isLoggedIn" class="chalkboard-login">
        <span class="chalk-decor decor-1">🌸</span><span class="chalk-decor decor-2">✨</span>
        <h2 class="chalk-title">Mật Mã Tri Ân</h2>
        <div class="pin-display"><span v-for="i in 4" :key="i" :class="{ 'filled': passwordInput.length >= i }"></span></div>
        <p class="error-message">{{ errorMessage }}</p>
        <div class="keypad">
          <button v-for="n in 9" :key="n" @click="handleKeyPress(n.toString())" class="key">{{ n }}</button>
          <button class="key key-disabled"></button>
          <button @click="handleKeyPress('0')" class="key">0</button>
          <button @click="handleDelete" class="key key-icon">⌫</button>
        </div>
        <div class="chalk-tray"><span class="chalk"></span></div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isLoggedIn" class="w-full h-full flex items-center justify-center">
        <Transition name="fade-fast" mode="out-in">
          
          <div v-if="currentView === 'hub'" class="hub-container-style">
            <div @click="showLetter" class="hub-icon-btn bounce-animation">
              💌
            </div>
            
            <div @click="showCamera" class="hub-icon-btn bounce-animation delay-100 mb-10">
              📷
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
              <p class="gallery-title">Album Kỷ Niệm</p>
              <div class="gallery-grid">
                <div v-for="(img, idx) in images" :key="idx" class="polaroid-wow" @click="openImageViewer(idx)">
                  <div class="polaroid-inner">
                    <img :src="img" alt="Kỷ niệm"/>
                  </div>
                </div>
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
          <img :src="selectedImageUrl" :key="selectedImageUrl" class="fullscreen-image" />
        </Transition>
        <button @click="showNextImage" class="nav-button next-button">&rsaquo;</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  @import "./styles.css";
</style>