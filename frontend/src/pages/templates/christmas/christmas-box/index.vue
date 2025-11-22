<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

/* Ảnh nền */
import treeUrl from "./img/pine-tree.webp?url";
import snowUrl from "./img/snow.webp?url";
import santaUrl from "./img/satan.webp?url";

/* Ảnh hộp quà rơi */
import giftBox1 from "./img/anh-1.webp?url";
import giftBox2 from "./img/anh-2.webp?url";
import giftBox3 from "./img/anh-3.webp?url";

const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const bgAudio = computed(() => contextData.value?.audios?.[0] || "");
/* Dữ liệu tuyết rơi */
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

const farDots = ref<SnowDot[]>(
  Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 16 + Math.random() * 8,
    size: 2 + Math.random() * 2,
    opacity: 0.2 + Math.random() * 0.2,
  }))
);

const midDots = ref<SnowDot[]>(
  Array.from({ length: 55 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 11 + Math.random() * 6,
    size: 3 + Math.random() * 3,
    opacity: 0.35 + Math.random() * 0.3,
  }))
);

const nearDots = ref<SnowDot[]>(
  Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 8 + Math.random() * 5,
    size: 4 + Math.random() * 3,
    opacity: 0.5 + Math.random() * 0.3,
  }))
);

const snowImgs = ref<SnowImg[]>(
  Array.from({ length: 4 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 9 + Math.random() * 7,
    size: 40 + Math.random() * 40,
  }))
);


type Gift = {
  id: number;
  boxImg: string;
  contentImg: string;
  dropped: boolean;
};

const gifts = ref<Gift[]>([]);
const currentDropIndex = ref(0);
const activeGift = ref<Gift | null>(null);

onMounted(() => {
  const imgList = contextData.value?.images ?? [];

  gifts.value = [
    { id: 0, boxImg: giftBox1, contentImg: imgList[0] || "", dropped: false },
    { id: 1, boxImg: giftBox2, contentImg: imgList[1] || "", dropped: false },
    { id: 2, boxImg: giftBox3, contentImg: imgList[2] || "", dropped: false },
  ];
});

/* Santa click => thả 1 quà */
function dropGift() {
  const idx = currentDropIndex.value;
  const g = gifts.value[idx];
  if (!g) return;

  gifts.value[idx] = {
    id: g.id,
    boxImg: g.boxImg,
    contentImg: g.contentImg,
    dropped: true,
  };

  currentDropIndex.value++;
}

/* mở quà */
function openGift(g: Gift) {
  if (!g.dropped) return;
  activeGift.value = g;
}

function closeModal() {
  activeGift.value = null;
}

/* Nội dung chúc */
const message = computed(() => {
  const c = contextData.value?.content?.[0];
  return c?.trim() || "Merry Christmas! 🎄✨";
});
</script>

<template>
  <div class="winter-bg">

    <div class="winter-ground"></div>
    <!-- 🎉 Text chạy Merry Christmas -->
      <div class="marquee-wrap">
        <div class="marquee-text">🎄 Merry Christmas — Wish You Joy & Love — Merry Christmas 🎅</div>
      </div>
    <!--  TUYẾT XA -->
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

    <!--  TUYẾT TRUNG -->
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

    <!--  TUYẾT GẦN + snow.webp -->
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

    <!--  SANTA BAY VÒNG TRÒN -->
    <button class="santa-wrap" @click="dropGift">
      <img :src="santaUrl" class="santa-img" />
    </button>

    <!--  CÂY THÔNG -->
    <div class="tree-wrap">
      <img :src="treeUrl" class="tree-img" />
    </div>

    <!--  ZONE QUÀ -->
    <div class="gift-zone">
      <div
        v-for="gift in gifts"
        :key="gift.id"
        class="gift-slot"
        :class="{ 'gift-slot--dropped': gift.dropped }"
        @click="openGift(gift)"
      >
        <img :src="gift.boxImg" class="gift-img" />
      </div>
    </div>

    <!--  POPUP -->
    <div v-if="activeGift" class="gift-modal-backdrop" @click.self="closeModal">
      <div class="gift-modal">
        <button class="gift-modal-close" @click="closeModal">✕</button>

        <div class="gift-modal-body">
          <img :src="activeGift.contentImg" class="gift-modal-img" />
          <p class="gift-modal-text">{{ message }}</p>
        </div>
      </div>
    </div>
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
