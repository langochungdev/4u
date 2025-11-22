<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

import bgMerry from "./imgs/background-merry.webp";
import bgCard from "./imgs/background2.webp";
import treeGif from "./imgs/tree.webp";
import defaultCardImg from "./demo.png";
import decorationImg from "./imgs/decor1.webp";
import textMerryImg from "./imgs/text-merry.webp";

const { contextData } = useTemplateData(TEMPLATE_CONFIG);

const cardTitle = computed(
  () => contextData.value?.content?.[0] || "MERRY CHRISTMAS"
);
const cardMessage = computed(
  () =>
    contextData.value?.content?.[1] ||
    "Giáng sinh an lành! Chúc bạn một mùa lễ ấm áp và ngọt ngào như tình bạn của chúng ta."
);
const cardSender = computed(
  () => contextData.value?.content?.[2] || "♥ From Tan ♥"
);
const cardImage = computed(
  () => contextData.value?.images?.[0] || defaultCardImg
);
const cardAudio = computed(() => contextData.value?.audios?.[0] || "");

const showCardModal = ref(false);
const isCardOpen = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);
const snowContainer = ref<HTMLElement | null>(null);

const createSnowflakes = () => {
  if (!snowContainer.value) return;
  const container = snowContainer.value;
  for (let i = 0; i < 50; i++) {
    const snowflake = document.createElement("div");
    snowflake.classList.add("snowflake");
    const size = Math.random() * 10 + 5;
    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    snowflake.style.left = `${Math.random() * 100}vw`;
    snowflake.style.animationDuration = `${Math.random() * 2 + 3}s`;
    snowflake.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(snowflake);
  }
};

const handleOpenCard = () => {
  showCardModal.value = true;
  isCardOpen.value = false;
  if (audioRef.value && cardAudio.value) {
    audioRef.value
      .play()
      .catch((e) => console.log("Audio autoplay blocked:", e));
  }
};

const handleCloseCard = () => {
  showCardModal.value = false;
  isCardOpen.value = false;
};

const toggleCard = () => {
  isCardOpen.value = !isCardOpen.value;
};

onMounted(() => {
  createSnowflakes();
});

onUnmounted(() => {
  if (snowContainer.value) snowContainer.value.innerHTML = "";
});
</script>

<template>
  <div
    class="fixed inset-0 w-full h-dvh overflow-hidden flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat font-sans z-0"
    :style="{ backgroundImage: `url(${bgMerry})` }"
  >
    <audio ref="audioRef" :src="cardAudio" loop></audio>
    <div
      ref="snowContainer"
      class="absolute inset-0 pointer-events-none z-10"
    ></div>

    <div
      v-show="!showCardModal"
      class="fixed top-[5%] md:top-[8%] left-1/2 -translate-x-1/2 z-20 w-full max-w-[1000px] flex justify-center items-center px-0"
    >
      <img
        :src="decorationImg"
        alt="decoration left"
        class="w-[20%] md:w-[180px] object-contain shrink-0 -mr-2 md:-mr-6 transform translate-y-2"
      />
      <img
        :src="textMerryImg"
        alt="Merry Christmas Text"
        class="christmas-text-img w-[60%] md:w-[450px] h-auto object-contain z-10 relative"
      />
      <img
        :src="decorationImg"
        alt="decoration right"
        class="w-[20%] md:w-[180px] object-contain shrink-0 -ml-2 md:-ml-6 transform scale-x-[-1] translate-y-2"
      />
    </div>

    <div class="relative z-10 mt-16 md:mt-24 flex flex-col items-center">
      <div class="tree-container relative cursor-pointer group">
        <img
          :src="treeGif"
          alt="Christmas Tree"
          class="tree-icon w-[85vw] md:w-[35vw] max-w-[500px] max-h-[45vh] md:max-h-[60vh] object-contain mx-auto transition-transform duration-300"
        />
      </div>
    </div>

    <div
      class="absolute bottom-[12%] md:bottom-[10%] w-full flex justify-center z-30"
    >
      <button
        @click="handleOpenCard"
        v-show="!showCardModal"
        class="show-button bg-[#f56060] text-white font-serif text-lg px-8 py-3 md:py-4 rounded-xl shadow-lg hover:bg-[#e2475c] transition-all transform active:scale-95"
      >
        Thiệp nè 💌
      </button>
    </div>

    <div
      v-if="showCardModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-500"
    >
      <button
        @click="handleCloseCard"
        class="absolute top-4 right-4 text-white text-4xl font-bold hover:text-red-500 z-60"
      >
        &times;
      </button>

      <div
        class="card-wrapper relative w-[90vw] h-[60vh] md:w-[350px] md:h-[450px] cursor-pointer"
        @click="toggleCard"
        :class="{ open: isCardOpen }"
      >
        <div class="card">
          <div class="imgBox">
            <div class="bark"></div>
            <img :src="bgCard" class="full-cover-img" />
          </div>

          <div
            class="details font-serif overflow-y-auto custom-scrollbar flex flex-col items-center"
            :style="{ backgroundColor: '#fffdf7' }"
          >
            <div
              class="w-full mt-2 md:mt-4 mb-2 px-1 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
            >
              <div
                class="bg-white p-2 pb-8 shadow-md border border-gray-200 mx-auto max-w-[90%]"
              >
                <img
                  :src="cardImage"
                  class="w-full max-h-[130px] md:max-h-[180px] object-cover filter sepia-[0.1]"
                />
              </div>
            </div>

            <h4
              class="font-handwriting text-3xl md:text-4xl text-[#c0392b] text-center mb-2 mt-1 font-bold tracking-wide"
              style="text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.1)"
            >
              {{ cardTitle }}
            </h4>

            <div
              class="font-content w-full px-3 text-center grow overflow-y-auto custom-scrollbar"
            >
              <p
                class="text-[#2c3e50] text-[clamp(13px,3.5vw,16px)] md:text-[18px] leading-relaxed whitespace-pre-line"
              >
                {{ cardMessage }}
              </p>
            </div>

            <div class="w-full mt-1 pb-4 pr-6 shrink-0">
              <p
                class="text-right text-[#c0392b] font-bold font-handwriting text-xl transform -rotate-3"
              >
                {{ cardSender }} <span class="text-sm">✎</span>
              </p>
            </div>

            <div
              class="absolute bottom-2 left-2 text-2xl opacity-30 rotate-12 grayscale pointer-events-none"
            >
              🎄
            </div>
            <div
              class="absolute top-2 right-2 text-2xl opacity-30 -rotate-12 grayscale pointer-events-none"
            >
              ❄️
            </div>
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-20 text-white/50 text-sm animate-pulse md:hidden pointer-events-none"
      >
        (Chạm vào thiệp để mở)
      </div>
    </div>
  </div>
</template>

<style scoped src="./style.css"></style>
