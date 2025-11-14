<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";
import './style.css';

const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const title = computed(() => contextData.value?.content?.[0] || 'Sách Kỷ Niệm');
const letterContent = computed(() => contextData.value?.content?.[1] || 'Đây là những dòng tâm tư...');
const images = computed(() => contextData.value?.images || []);
const audioUrl = computed(() => contextData.value?.audios?.[0] || null);
const audioPlayer = ref<HTMLAudioElement | null>(null);

// Logic lật trang
const currentPage = ref(0);
const maxPage = 3;

const openBook = () => {
  currentPage.value = 1;
  nextTick(() => {
    if (audioPlayer.value) {
      audioPlayer.value.play().catch(e => console.error("Lỗi phát nhạc:", e));
    }
  });
};
const nextPage = () => {
  if (currentPage.value < maxPage) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
  else if (currentPage.value === 1) currentPage.value = 0;
};

// ===============================
// ❗ FIX ICON BAY BỊ LOẠN XẠ
// ===============================
const particles = ref<any[]>([]);

const createParticles = () => {
  const arr = [];
  for (let i = 0; i < 20; i++) {
    const size = Math.random() * 1.5 + 0.8;
    const duration = Math.random() * 20 + 20;
    const delay = Math.random() * -20;
    const left = Math.random() * 100;

    arr.push({
      fontSize: `${size}rem`,
      left: `${left}%`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      icon: ['💖', '🎉', '✨', '📚', '🎓', '🌟'][i % 6],
    });
  }
  particles.value = arr;
};

// TẠO ICON 1 LẦN DUY NHẤT
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
      <div class="cover-content">
        <span class="cover-icon">📖</span>
        <h1>{{ title }}</h1>
        <p>(Nhấn để mở)</p>
      </div>
    </div>

    <div v-else class="album-open">
      <div class="page left" @click.stop="prevPage">
        <div class="page-content">
          <img v-if="currentPage === 1 && images[0]" :src="images[0]" alt="Ảnh 1" />
          <img v-if="currentPage === 2 && images[2]" :src="images[2]" alt="Ảnh 3" />
          <img v-if="currentPage === 3 && images[4]" :src="images[4]" alt="Ảnh 5" />
        </div>
        <span v-if="currentPage >= 1" class="click-hint left-hint">
          {{ currentPage === 1 ? '&#9664; Đóng sách' : '&#9664; Lật lại' }}
        </span>
      </div>

      <div class="page right" @click.stop="nextPage">
        <div class="page-content">
          <img v-if="currentPage === 1 && images[1]" :src="images[1]" alt="Ảnh 2" />
          <img v-if="currentPage === 2 && images[3]" :src="images[3]" alt="Ảnh 4" />

          <div v-if="currentPage === 3" class="letter-content">
            <p class="message-body"> {{ letterContent }} </p>
          </div>
        </div>
        <span v-if="currentPage < maxPage" class="click-hint right-hint">
          Lật tiếp &#9654;
        </span>
      </div>
    </div>

  </div>
</template>