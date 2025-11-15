<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Ref } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";
import "./style.css";

/* ===== LẤY DATA TỪ CONFIG / BUILDER ===== */

type TemplateContext = {
  content: string[];
  images: string[];
  videos?: string[];
  audios?: string[];
};

const { contextData } = useTemplateData(TEMPLATE_CONFIG) as {
  contextData: Ref<TemplateContext | null>;
};

const safeContext = computed<TemplateContext>(() => {
  const raw = contextData.value;
  return raw ?? { content: [], images: [] };
});

/* ===== CONTENT CHỈ DÙNG CHO MODAL ===== */

const rawContent = computed<string>(() => {
  const arr = safeContext.value.content;
  return arr.length > 0 && arr[0] ? arr[0] : "";
});

const modalText = computed(() => {
  if (!rawContent.value.trim()) {
    return "Con mong thầy/cô luôn mỉm cười hạnh phúc như hôm nay 💖";
  }
  return rawContent.value;
});

/* ===== ẢNH CHỈ DÙNG CHO MODAL ===== */

const mainImage = computed<string>(() => {
  const imgs = safeContext.value.images;
  const first = imgs.length > 0 ? imgs[0] : undefined;
  return first && first.length > 0
    ? first
    : new URL("./demo.png", import.meta.url).href;
});

/* ===== TIÊU ĐỀ NGOÀI MÀN HÌNH (CỐ ĐỊNH) ===== */

const pageTitle = "💐 Chúc mừng Ngày Nhà Giáo Việt Nam 20/11 💕";
const pageSubtitle =
  "Cảm ơn thầy/cô vì những cống hiến thầm lặng và tình yêu dành cho học trò.";

/* ===== LÁ THƯ RƠI (img/Anh (1..12).png) ===== */

interface FallingItem {
  id: number;
  left: number;
  width: number;
  duration: number;
  rotate: number;
  src: string;
}

const fallingItems = ref<FallingItem[]>([]);
let nextId = 0;

const fallingSources: string[] = Array.from({ length: 12 }, (_v, idx) =>
  new URL(`./img/Anh (${idx + 1}).png`, import.meta.url).href
);

const activePositions: number[] = [];

function getFallSrc(randomIndex: number): string {
  if (randomIndex < 0 || randomIndex >= fallingSources.length) {
    return mainImage.value;
  }
  const val = fallingSources[randomIndex];
  return val && val.length > 0 ? val : mainImage.value;
}

function createFallingImage() {
  if (fallingSources.length === 0) return;

  let left: number;
  const safe = 8;
  const minDistance = 10;
  let tries = 0;

  do {
    left = safe + Math.random() * (100 - 2 * safe);
    tries++;
  } while (
    activePositions.some((x) => Math.abs(x - left) < minDistance) &&
    tries < 20
  );

  let min = 80;
  let max = 120;
  if (window.innerWidth <= 480) {
    min = 40;
    max = 70;
  } else if (window.innerWidth <= 768) {
    min = 60;
    max = 90;
  }

  const width = min + Math.random() * (max - min);
  const duration = 8 + Math.random() * 4;
  const rotate = Math.random() * 360;

  const randomIndex = Math.floor(Math.random() * fallingSources.length);
  const src: string = getFallSrc(randomIndex);

  const id = nextId++;

  fallingItems.value.push({
    id,
    left,
    width,
    duration,
    rotate,
    src,
  });

  activePositions.push(left);

  setTimeout(() => {
    const idx = fallingItems.value.findIndex((it) => it.id === id);
    if (idx !== -1) fallingItems.value.splice(idx, 1);

    const posIdx = activePositions.indexOf(left);
    if (posIdx !== -1) activePositions.splice(posIdx, 1);
  }, 14000);
}

onMounted(() => {
  setInterval(createFallingImage, 1100);
});

/* ===== MODAL ===== */

const showModal = ref(false);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<template>
  <div
    class="letter-box-page relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-linear-to-br from-pink-200 via-amber-50 to-pink-100 text-center text-rose-800 px-4"
  >
    <!-- Nội dung trung tâm -->
    <div class="relative z-10 flex flex-col items-center max-w-xl gap-3">
      <h1 class="text-2xl sm:text-3xl font-semibold leading-snug drop-shadow-sm">
        {{ pageTitle }}
      </h1>

      <p class="mt-1 text-sm sm:text-base text-rose-600 max-w-xl">
        {{ pageSubtitle }}
      </p>

      <p class="mt-2 text-xs sm:text-sm text-rose-400">
        Hãy chạm vào một lá thư đang bay để mở thiệp 💌
      </p>
    </div>

    <!-- Lá thư / ảnh rơi -->
    <img
      v-for="item in fallingItems"
      :key="item.id"
      :src="item.src"
      class="falling-img"
      :style="{
        left: item.left + 'vw',
        width: item.width + 'px',
        animationDuration: item.duration + 's',
        transform: `rotate(${item.rotate}deg)`
      }"
      @click="openModal"
    />

    <!-- MODAL GLASS NEW DESIGN -->
<div
  v-if="showModal"
  class="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
  @click.self="closeModal"
>
  <div
    class="modal-wrapper animate-pop-up w-full max-w-[560px]"
  >
    <!-- Lớp kính -->
    <div
      class="glass-box rounded-[40px] border border-white/40 bg-white/10 backdrop-blur-2xl shadow-[0_28px_70px_rgba(0,0,0,0.45)] p-3 sm:p-4"
    >
      <!-- Card trắng bên trong -->
      <div
        class="inner-card bg-white rounded-4xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] overflow-hidden"
      >

        <!-- Ảnh thật sự to và rõ -->
        <img
          :src="mainImage"
          alt="Card Image"
          class="w-full h-[380px] sm:h-[440px] object-cover"
        />

        <!-- Khối lời chúc rõ ràng -->
        <div class="px-6 py-5 text-center">
          <p
            class="text-[15px] sm:text-[16px] text-slate-800 leading-relaxed whitespace-pre-line wrap-break-word"
          >
            {{ modalText }}
          </p>

        <button
            class="close-button"
            @click="closeModal"
            >
            <span>Đóng thư</span> 💗
        </button>
        </div>
      </div>
    </div>
  </div>
</div>
  </div>
</template>
