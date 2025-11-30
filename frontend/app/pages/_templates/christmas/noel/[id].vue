<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

import { initNoelLove } from "./noelLove";
import { TREE_SVG } from "./treeSvg";

import santaUrl from "./img/santa.webp?url";
import giftUrl from "./img/gift.webp?url";

// Lấy data từ builder (1 ảnh + 1 content cho popup quà)
const { contextData } = useTemplateData(TEMPLATE_CONFIG);

const popupImage = computed(() => contextData.value?.images?.[0] || "");
const popupText = computed(
  () =>
    contextData.value?.content?.[0] ||
    "Merry Christmas! Chúc bạn có một mùa Giáng Sinh an lành ❤️"
);

const showModal = ref(false);
const activeGift = ref<number | null>(null);

// Tạm cho 3 hộp quà giống nhau
const gifts = computed(() => [0, 1, 2]);

// SVG cây thông (string literal)
const treeSvg = ref(TREE_SVG);

function openGift(index: number) {
  activeGift.value = index;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  activeGift.value = null;
}

// Chạy GSAP + cây thông + slider bên client
onMounted(() => {
  if (process.client) {
    initNoelLove();
  }
});
</script>

<template>
  <ClientOnly>
    <div class="noel-page">
      <!-- ============ SLIDER TRÁI TIM ============ -->
      <svg
        id="loveSliderSVG"
        class="noel-slider-svg"
        viewBox="0 0 800 250"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Track -->
        <line
          class="trackBg"
          x1="50"
          x2="750"
          y1="150"
          y2="150"
          stroke="#FFFCF9"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="15"
        />
        <line
          class="trackMiddle"
          x1="50"
          x2="750"
          y1="150"
          y2="150"
          stroke="green"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="6"
          opacity="1"
        />
        <line
          class="track"
          x1="50"
          x2="750"
          y1="150"
          y2="150"
          stroke="#ff595e"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="6"
        />

        <!-- Khung chat trái tim -->
        <g id="heartChat" class="heartChat">
          <path
            d="M115.44,92H81.15a8.32,8.32,0,0,0-5.9,2.45l-9.9,9.9a1,1,0,0,1-1.34,0l-9.9-9.9A8.35,8.35,0,0,0,48.2,92H13.91A10.44,10.44,0,0,1,3.5,81.6V13.91A10.45,10.45,0,0,1,13.91,3.5H115.44a10.44,10.44,0,0,1,10.41,10.41V81.6A10.43,10.43,0,0,1,115.44,92Z"
            fill="none"
          />
          <path
            d="M115.44,92H81.15a8.32,8.32,0,0,0-5.9,2.45l-9.9,9.9a1,1,0,0,1-1.34,0l-9.9-9.9A8.35,8.35,0,0,0,48.2,92H13.91A10.44,10.44,0,0,1,3.5,81.6V13.91A10.45,10.45,0,0,1,13.91,3.5H115.44a10.44,10.44,0,0,1,10.41,10.41V81.6A10.43,10.43,0,0,1,115.44,92Z"
            fill="none"
            stroke="#FFFCF9"
            stroke-miterlimit="10"
            stroke-width="5"
          />

          <mask id="heartFillMask">
            <rect class="heartFill" x="-54" y="72" width="237" height="91" fill="#FFF" />
          </mask>

          <path
            id="heartBg"
            d="M76.16,23a13.23,13.23,0,0,0-10.83,5.63,13.24,13.24,0,0,0-24.08,7.62c0,18.06,24.08,34.92,24.08,34.92S89.41,54.33,89.41,36.27A13.25,13.25,0,0,0,76.16,23Z"
            fill="#FFF"
            opacity="0.1"
          />
          <g mask="url(#heartFillMask)">
            <path
              id="XXpinkHeart"
              d="M76.16,23a13.23,13.23,0,0,0-10.83,5.63,13.24,13.24,0,0,0-24.08,7.62c0,18.06,24.08,34.92,24.08,34.92S89.41,54.33,89.41,36.27A13.25,13.25,0,0,0,76.16,23Z"
              fill="#ff595e"
            />
          </g>
        </g>

        <!-- follower & liquidFollower cho GSAP dùng (ẩn) -->
        <g class="follower">
          <circle cx="50" cy="150" r="2" fill="transparent" />
        </g>
        <g class="liquidFollower">
          <circle cx="50" cy="150" r="2" fill="transparent" />
        </g>

        <!-- Dragger vô hình để GSAP kéo -->
        <rect
          class="dragger"
          x="50"
          y="80"
          width="290"
          height="140"
          fill="transparent"
          stroke="none"
        />
      </svg>

      <!-- ============ CẢNH CÂY THÔNG + SANTA + QUÀ ============ -->
      <!-- .container để noelLove.ts show/hide -->
      <div class="container">
        <div class="noel-tree-container">
          <!-- SVG cây thông (literal string) -->
          <div class="noel-tree-svg" v-html="treeSvg" />

          <!-- LAYER SANTA + GIFT overlay trên cây thông -->
          <div class="noel-santa-layer">
            <img class="noel-santa" :src="santaUrl" alt="Santa" />

            <button
              v-for="(g, index) in gifts"
              :key="index"
              type="button"
              class="noel-gift"
              @click="openGift(index)"
            >
              <img :src="giftUrl" alt="Gift" />
            </button>
          </div>
        </div>
      </div>

      <!-- ============ POPUP QUÀ ============ -->
      <div v-if="showModal" class="noel-modal-backdrop" @click.self="closeModal">
        <div class="noel-modal">
          <div class="noel-modal-img-wrap" v-if="popupImage">
            <img :src="popupImage" alt="Gift content" class="noel-modal-img" />
          </div>
          <p class="noel-modal-text">
            {{ popupText }}
          </p>
          <button type="button" class="noel-modal-close" @click="closeModal">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
