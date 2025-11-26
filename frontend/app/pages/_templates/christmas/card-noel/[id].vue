<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

import bgMerry from "./imgs/background-merry.webp";
import bgCard from "./imgs/background2.webp";
import treeGif from "./imgs/tree.webp";
import defaultCardImg from "./demo.webp";
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
    class="fixed inset-0 w-full h-dvh overflow-hidden flex flex-col items-center justify-center md:justify-between bg-cover bg-center bg-no-repeat font-sans z-0"
    :style="{ backgroundImage: `url(${bgMerry})` }"
  >
    <audio ref="audioRef" :src="cardAudio" loop></audio>
    <div
      ref="snowContainer"
      class="absolute inset-0 pointer-events-none z-10"
    ></div>

    <div
      v-show="!showCardModal"
      class="fixed top-[5%] md:static md:top-auto left-1/2 -translate-x-1/2 md:translate-x-0 z-20 w-full max-w-[1200px] flex justify-center items-center px-2 md:px-0 md:h-[20vh] md:mt-4 md:flex-none"
    >
      <img
        :src="decorationImg"
        alt="decoration left"
        class="w-[12%] md:w-auto md:h-[80%] object-contain shrink-0 -mr-1 md:-mr-10 transform translate-y-2"
      />
      <img
        :src="textMerryImg"
        alt="Merry Christmas Text"
        class="christmas-text-img w-[76%] md:w-auto md:h-full object-contain z-10 relative"
      />
      <img
        :src="decorationImg"
        alt="decoration right"
        class="w-[12%] md:w-auto md:h-[80%] object-contain shrink-0 -ml-1 md:-ml-10 transform scale-x-[-1] translate-y-2"
      />
    </div>

    <div
      class="relative z-10 flex flex-col justify-center items-center mt-14 md:mt-0 md:flex-grow md:h-0 md:w-full"
    >
      <div
        class="tree-container relative cursor-pointer group h-full flex items-center justify-center"
      >
        <img
          :src="treeGif"
          alt="Christmas Tree"
          class="tree-icon w-[85vw] md:w-auto max-w-[450px] md:max-w-none max-h-[50vh] md:max-h-[90%] object-contain mx-auto transition-transform duration-300"
        />
      </div>
    </div>

    <div
      class="absolute bottom-[10%] md:static md:bottom-auto md:mb-[5vh] md:flex-none w-full flex justify-center z-30"
    >
      <button
        @click="handleOpenCard"
        v-show="!showCardModal"
        class="show-button bg-[#f56060] text-white font-serif text-lg md:text-xl px-8 md:px-12 py-3 md:py-4 rounded-xl shadow-lg hover:bg-[#e2475c] transition-all transform active:scale-95 border-2 border-white/20"
      >
        Thiệp nè 💌
      </button>
    </div>

    <div
      v-if="showCardModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-500 p-4"
    >
      <button
        @click="handleCloseCard"
        class="absolute top-6 right-6 text-white text-4xl font-bold hover:text-red-500 z-[60] drop-shadow-md"
      >
        &times;
      </button>

      <div
        class="card-wrapper relative w-[85vw] aspect-[5/7] max-h-[75vh] md:h-[85vh] md:w-auto md:max-w-none md:aspect-[5/7] cursor-pointer"
        @click="toggleCard"
        :class="{ open: isCardOpen }"
      >
        <div class="card">
          <div class="imgBox">
            <div class="bark"></div>
            <img :src="bgCard" class="full-cover-img" />
          </div>

          <div
            class="details font-serif flex flex-col items-center justify-between"
            :style="{ backgroundColor: '#fffdf7' }"
          >
            <div
              class="w-full mt-3 md:mt-5 mb-2 px-1 transform -rotate-2 hover:rotate-0 transition-transform duration-500 shrink-0"
            >
              <div
                class="bg-white p-1.5 pb-4 md:p-3 md:pb-6 shadow-md border border-gray-200 mx-auto max-w-[85%]"
              >
                <img
                  :src="cardImage"
                  class="w-full h-[120px] md:h-[20vh] object-cover filter sepia-[0.1]"
                />
              </div>
            </div>

            <h4
              class="font-handwriting text-[#c0392b] text-center my-1 font-bold tracking-wide break-words line-clamp-1 px-2 w-full leading-tight shrink-0"
              style="
                text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.1);
                font-size: clamp(24px, 3.5vh, 40px);
              "
            >
              {{ cardTitle }}
            </h4>

            <div
              class="font-content w-full px-4 text-center grow overflow-y-auto no-scrollbar flex flex-col justify-start md:justify-center items-center"
            >
              <p
                class="text-[#2c3e50] leading-relaxed whitespace-pre-line"
                style="font-size: clamp(13px, 2.2vh, 18px)"
              >
                {{ cardMessage }}
              </p>
            </div>

            <div
              class="w-full pb-3 md:pb-4 pr-6 shrink-0 flex items-center justify-end gap-1 mt-2"
            >
              <p
                class="text-[#c0392b] font-bold font-handwriting transform -rotate-3 whitespace-nowrap"
                style="font-size: clamp(18px, 3vh, 26px)"
              >
                {{
                  cardSender.length > 20
                    ? cardSender.slice(0, 20) + "..."
                    : cardSender
                }}
              </p>
              <span class="text-sm transform -rotate-3 text-[#c0392b]">✎</span>
            </div>

            <div
              class="absolute bottom-2 left-2 text-xl md:text-3xl opacity-30 rotate-12 grayscale pointer-events-none"
            >
              🎄
            </div>
            <div
              class="absolute top-2 right-2 text-xl md:text-3xl opacity-30 -rotate-12 grayscale pointer-events-none"
            >
              ❄️
            </div>
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-10 text-white/70 text-sm animate-pulse md:hidden pointer-events-none bg-black/30 px-3 py-1 rounded-full"
      >
        (Chạm vào thiệp để mở)
      </div>
    </div>
  </div>
</template>

<style scoped src="./style.css"></style>
