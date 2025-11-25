<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

/* Ảnh nền */
import treeUrl from "./img/pine-tree.webp?url";
import snowUrl from "./img/snow.webp?url";
import santaUrl from "./img/satan.webp?url";

/* Ảnh hộp quà (vỏ) */
import giftBox1 from "./img/anh-1.webp?url";
import giftBox2 from "./img/anh-2.webp?url";
import giftBox3 from "./img/anh-3.webp?url";

const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const bgAudio = computed(() => contextData.value?.audios?.[0] || "");

/* Chỉ render hiệu ứng sau khi client mounted (tránh hydration mismatch) */
const isClient = ref(false);

const showHint = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const santaRef = ref<HTMLElement | null>(null);

/* ===== Tuyết ===== */
type SnowDot = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
};

type SnowImg = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

const farDots = ref<SnowDot[]>([]);
const midDots = ref<SnowDot[]>([]);
const nearDots = ref<SnowDot[]>([]);
const snowImgs = ref<SnowImg[]>([]);

/* ===== Quà ===== */
type Gift = {
  id: number;
  boxImg: string;      // ảnh hộp ngoài
  contentImg: string;  // ảnh popup bên trong
  left: number;        // % ngang
  top: number;         // % dọc
};

const gifts = ref<Gift[]>([]);
const giftIdCounter = ref(0);
const giftBoxList = [giftBox1, giftBox2, giftBox3];
const giftBoxIndex = ref(0);
const activeGift = ref<Gift | null>(null);

/* Nội dung lời chúc trong popup */
const message = computed(() => {
  const c = contextData.value?.content?.[0];
  return c?.trim() || "Merry Christmas! 🎄✨";
});

/* ===== Mounted: chỉ chạy ở client ===== */
onMounted(() => {
  isClient.value = true;

  // Tuyết random – chỉ client render
  farDots.value = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 16 + Math.random() * 8,
    size: 2 + Math.random() * 2,
    opacity: 0.2 + Math.random() * 0.2,
  }));

  midDots.value = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 11 + Math.random() * 6,
    size: 3 + Math.random() * 3,
    opacity: 0.35 + Math.random() * 0.3,
  }));

  nearDots.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 8 + Math.random() * 5,
    size: 4 + Math.random() * 3,
    opacity: 0.5 + Math.random() * 0.3,
  }));

  snowImgs.value = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 9 + Math.random() * 7,
    size: 40 + Math.random() * 40,
  }));

  // Hint Santa
  showHint.value = true;
  setTimeout(() => {
    showHint.value = false;
  }, 7000);
});

/* ===== Drop quà từ vị trí Santa ===== */
function dropGift() {
  if (!santaRef.value || !containerRef.value) return;
  const santaRect = santaRef.value.getBoundingClientRect();
  const containerRect = containerRef.value.getBoundingClientRect();
  const centerX = santaRect.left + santaRect.width / 2;
  const centerY = santaRect.top + santaRect.height / 2;

  let leftPercent =
    ((centerX - containerRect.left) / containerRect.width) * 100;
  let topPercent =
    ((centerY - containerRect.top) / containerRect.height) * 100;
  leftPercent = Math.min(95, Math.max(5, leftPercent));
  topPercent = Math.min(35, Math.max(5, topPercent));
  const id = giftIdCounter.value++;
  const imgList = contextData.value?.images ?? [];
  const hasContentImgs = imgList.length > 0;
  const boxImg =
    giftBoxList[giftBoxIndex.value % giftBoxList.length] || giftBox1;
  const contentImg = hasContentImgs
    ? (imgList[giftBoxIndex.value % imgList.length] || boxImg)
    : boxImg;

  giftBoxIndex.value++;
  gifts.value.push({
    id,
    boxImg,
    contentImg,
    left: leftPercent,
    top: topPercent,
  });
}
/* mở / đóng popup quà */
function openGift(g: Gift) {
  activeGift.value = g;
}

function closeModal() {
  activeGift.value = null;
}
</script>

<template>
  <div ref="containerRef" class="winter-bg">
    <!-- Chỉ render hiệu ứng sau khi client mounted -->
    <template v-if="isClient">
      <div class="winter-ground"></div>

      <!-- Marquee -->
      <div class="marquee-wrap">
        <div class="marquee-text">
          🎄 Merry Christmas — Wish You Joy &amp; Love — Merry Christmas 🎅
        </div>
      </div>

      <!-- Tuyết xa -->
      <div class="snow-layer snow-layer--far">
        <span
          v-for="f in farDots"
          :key="f.id"
          class="snow-dot snow-dot--far"
          :style="{
            left: f.left + '%',
            animationDelay: f.delay + 's',
            animationDuration: f.duration + 's',
            width: f.size + 'px',
            height: f.size + 'px',
            opacity: f.opacity,
          }"
        />
      </div>

      <!-- Tuyết trung -->
      <div class="snow-layer snow-layer--mid">
        <span
          v-for="f in midDots"
          :key="f.id"
          class="snow-dot snow-dot--mid"
          :style="{
            left: f.left + '%',
            animationDelay: f.delay + 's',
            animationDuration: f.duration + 's',
            width: f.size + 'px',
            height: f.size + 'px',
            opacity: f.opacity,
          }"
        />
      </div>

      <!-- Tuyết gần + snow.webp -->
      <div class="snow-layer snow-layer--near">
        <span
          v-for="f in nearDots"
          :key="f.id"
          class="snow-dot snow-dot--near"
          :style="{
            left: f.left + '%',
            animationDelay: f.delay + 's',
            animationDuration: f.duration + 's',
            width: f.size + 'px',
            height: f.size + 'px',
            opacity: f.opacity,
          }"
        />
        <img
          v-for="f in snowImgs"
          :key="f.id"
          :src="snowUrl"
          class="snow-img"
          :style="{
            left: f.left + '%',
            width: f.size + 'px',
            animationDelay: f.delay + 's',
            animationDuration: f.duration + 's',
          }"
        />
      </div>

      <!-- Santa -->
      <button ref="santaRef" class="santa-wrap" @click="dropGift">
        <img :src="santaUrl" class="santa-img" />
        <div v-if="showHint" class="santa-hint">
          <div class="santa-hint-text">
            Chạm vào ông già Noel để nhận quà 🎁
          </div>
        </div>
      </button>

      <!-- Cây thông -->
      <div class="tree-wrap">
        <img :src="treeUrl" class="tree-img" />
      </div>

      <!-- Quà rơi từ Santa -->
      <div class="gift-zone">
        <div
          v-for="gift in gifts"
          :key="gift.id"
          class="gift-slot gift-slot--dropped"
          :style="{
            left: gift.left + '%',
            top: gift.top + '%',
          }"
          @click.stop="openGift(gift)"
        >
          <img :src="gift.boxImg" class="gift-img" />
        </div>
      </div>

      <!-- Popup quà -->
      <div
        v-if="activeGift"
        class="gift-modal-backdrop"
        @click.self="closeModal"
      >
        <div class="gift-modal">
          <button class="gift-modal-close" @click="closeModal">✕</button>

          <div class="gift-modal-body">
            <img :src="activeGift.contentImg" class="gift-modal-img" />
            <p class="gift-modal-text">{{ message }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
  <audio
    v-if="bgAudio"
    :src="bgAudio"
    autoplay
    loop
    class="audio-hidden"
  />
</template>
<style src="./style.css"></style>
