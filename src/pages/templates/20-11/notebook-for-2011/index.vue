<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";
import './style.css';

// Lấy dữ liệu động từ context (Giữ nguyên)
const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const title = computed(() => contextData.value?.content?.[0] || 'Tri Ân Thầy Cô');
const letterContent = computed(() => contextData.value?.content?.[1] ?? 'Đây là những dòng tâm tư...');
const images = computed(() => contextData.value?.images || []);
const audioUrl = computed(() => contextData.value?.audios?.[0] || null);
const audioPlayer = ref<HTMLAudioElement | null>(null);


const currentPage = ref(0);
const maxPage = 6; 

const openBook = () => {
  currentPage.value = 1;
  nextTick(() => {
    if (audioPlayer.value) {
      audioPlayer.value.play().catch(e => console.error("Lỗi phát nhạc:", e));
    }
  });
};

// --- Lật trang (cho Mobile) ---
const nextPage = () => {
  if (currentPage.value < maxPage) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
  else if (currentPage.value === 1) currentPage.value = 0;
};

// --- Lật trang (cho Desktop) ---
const nextPageDesktop = () => {
  if (currentPage.value === 1 || currentPage.value === 2) {
    currentPage.value = 3;
  } else if (currentPage.value === 3 || currentPage.value === 4) {
    currentPage.value = 5;
  } else if (currentPage.value === 5) {
    currentPage.value = 6;
  }
};
const prevPageDesktop = () => {
  if (currentPage.value === 3 || currentPage.value === 4) {
    currentPage.value = 1;
  } else if (currentPage.value === 5 || currentPage.value === 6) {
    currentPage.value = 3;
  } else if (currentPage.value === 1 || currentPage.value === 2) {
    currentPage.value = 0;
  }
};



// Logic icon bay (Giữ nguyên)
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

onMounted(() => createParticles());
</script>

<template>
  <div class="album-container">

    <audio v-if="audioUrl" ref="audioPlayer" :src="audioUrl" loop id="audio-player"></audio>

    <div class="particle-background">
      <span v-for="(p, index) in particles" :key="index" class="particle-icon" :style="p">
        {{ p.icon }}
      </span>
    </div>

    <div v-if="currentPage === 0" class="album-cover" @click="openBook">
      <span class="corner top-left"></span>
      <span class="corner top-right"></span>
      <span class="corner bottom-left"></span>
      <span class="corner bottom-right"></span>
      <div class="cover-content">
        <span class="cover-icon">👩‍🏫</span>
        <h1>{{ title }}</h1>
        <p>(Nhấn để mở)</p>
      </div>
    </div>

    <div v-else class="book-wrapper">
      
      <div class="album-open-desktop">
        <div class="page left" @click.stop="prevPageDesktop">
          <div class="page-content">
            <Transition name="page-fade" mode="out-in">
              <img v-if="(currentPage === 1 || currentPage === 2) && images[0]" :src="images[0]" alt="Ảnh 1" :key="1" />
              <img v-else-if="(currentPage === 3 || currentPage === 4) && images[2]" :src="images[2]" alt="Ảnh 3" :key="2" />
              <img v-else-if="(currentPage === 5 || currentPage === 6) && images[4]" :src="images[4]" alt="Ảnh 5" :key="3" />
            </Transition>
          </div>
          <span class="click-hint left-hint">&#9664; Lật lại</span>
        </div>

        <div class="page right" @click.stop="nextPageDesktop">
          <div class="page-content">
            <Transition name="page-fade" mode="out-in">
              <img v-if="(currentPage === 1 || currentPage === 2) && images[1]" :src="images[1]" alt="Ảnh 2" :key="4" />
              <img v-else-if="(currentPage === 3 || currentPage === 4) && images[3]" :src="images[3]" alt="Ảnh 4" :key="5" />
              <div v-else-if="(currentPage === 5 || currentPage === 6)" class="letter-content" :key="6">
                <p class="message-body">{{ letterContent }}</p>
              </div>
            </Transition>
          </div>
          <span v-if="currentPage < 5" class="click-hint right-hint">Lật tiếp &#9654;</span>
        </div>
      </div>

      <div class="album-open-mobile">
        <div class="page-mobile">
          <div class="page-content">
            <Transition name="page-fade" mode="out-in">
              <img v-if="currentPage === 1 && images[0]" :src="images[0]" alt="Ảnh 1" :key="1" />
              <img v-else-if="currentPage === 2 && images[1]" :src="images[1]" alt="Ảnh 2" :key="2" />
              <img v-else-if="currentPage === 3 && images[2]" :src="images[2]" alt="Ảnh 3" :key="3" />
              <img v-else-if="currentPage === 4 && images[3]" :src="images[3]" alt="Ảnh 4" :key="4" />
              <img v-else-if="currentPage === 5 && images[4]" :src="images[4]" alt="Ảnh 5" :key="5" />
              <div v-else-if="currentPage === 6" class="letter-content" :key="6">
                <p class="message-body">{{ letterContent }}</p>
              </div>
            </Transition>
          </div>
        </div>
        
        <div class="mobile-nav">
          <button @click="prevPage" :disabled="currentPage === 0"><span>&#9664;</span></button>
          <span class="mobile-page-number">{{ currentPage === 0 ? 'Bìa' : `Trang ${currentPage}/${maxPage}` }}</span>
          <button @click="nextPage" :disabled="currentPage === maxPage"><span>&#9654;</span></button>
        </div>
      </div>

    </div> </div>
</template>