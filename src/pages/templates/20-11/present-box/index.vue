<script setup lang="ts">
import { ref, computed, watchEffect, onBeforeUnmount, nextTick } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import config from "./config";

const { contextData } = useTemplateData(config);

const contentCard = computed(
  () => contextData.value?.content[0] || "Chúc Cô 20/11 vui vẻ..."
);
const eventName = computed(
  () => contextData.value?.content[1] || "Nhà Giáo Việt Nam 20/11"
);
const titleCard = computed(() => contextData.value?.content[2] || "Tặng Cô...");
const polaroidCaption = computed(
  () => contextData.value?.content[3] || "GFF ❤️ 20-11-2023 ❤️"
);
const giftImage = computed(
  () => contextData.value?.images[0] || "https://i.imgur.com/eBf2b4j.jpeg"
);
const cardImage = computed(
  () => contextData.value?.images[1] || "https://i.imgur.com/o2P837z.jpeg"
);
const audioSrc = computed(
  () => contextData.value?.audios?.[0] || "/nhacnen.mp3"
);

const clickStep = ref(0);
let clickHandler: ((e: Event) => void) | null = null;

function setupPresent() {
  const gift_image_url = giftImage.value;
  const templateRoot = document.getElementById("template-root");

  if (!templateRoot) return;

  const graphElem = document.querySelector(".present-box > .side.top .to");
  if (graphElem) graphElem.setAttribute("data-before", eventName.value);

  const cardSmallHeaderElem = document.querySelector("#card .small-header");
  if (cardSmallHeaderElem) cardSmallHeaderElem.innerHTML = eventName.value;

  const cardTitleElem = document.querySelector("#card .title-card");
  if (cardTitleElem) cardTitleElem.innerHTML = `❤️ ${titleCard.value} ❤️`;

  const cardContentElem = document.querySelector("#card .content-card");
  if (cardContentElem) cardContentElem.innerHTML = `${contentCard.value}`;

  const captionElem = document.querySelector("#card .polaroid-caption");
  if (captionElem) captionElem.innerHTML = polaroidCaption.value;

  const presentImageEl = document.getElementById("present-image");
  if (presentImageEl) {
    presentImageEl.innerHTML = "";

    let _giftImg = document.createElement("img");
    _giftImg.src = gift_image_url;
    presentImageEl.appendChild(_giftImg);
  }

  if (!clickHandler) {
    clickHandler = () => {
      const presentEl = document.getElementById("present");
      if (!presentEl) return;

      const infoTextEl = document.querySelector(".info-text") as HTMLElement;
      const aboveFoldEl = document.querySelector(".above-fold") as HTMLElement;
      const cardEl = document.getElementById("card");

      const confettiEl = document.getElementById("confetti-overlay");
      const teacherGifEl = document.querySelector(".teacher-gif-corner");
      const flyGifCardBackground = document.getElementById(
        "fly-gif-card-background"
      );

      clickStep.value++;

      if (clickStep.value === 1) {
        presentEl.classList.add("open");
        if (aboveFoldEl) aboveFoldEl.style.zIndex = "200";
        if (presentImageEl) presentImageEl.classList.add("show-main-image");
        if (confettiEl) confettiEl.classList.add("show");
        if (teacherGifEl) teacherGifEl.classList.add("show");
        if (flyGifCardBackground) flyGifCardBackground.classList.remove("show");
        playMusic();
        if (infoTextEl) infoTextEl.textContent = "Click để xem thiệp";
      } else if (clickStep.value === 2) {
        if (presentImageEl) presentImageEl.classList.remove("show-main-image");
        if (confettiEl) confettiEl.classList.remove("show");
        if (teacherGifEl) teacherGifEl.classList.remove("show");
        if (aboveFoldEl) aboveFoldEl.style.zIndex = "10";
        if (cardEl) cardEl.classList.add("card-show");
        if (infoTextEl) infoTextEl.style.display = "none";
        if (flyGifCardBackground) flyGifCardBackground.classList.add("show");
      } else if (clickStep.value === 3) {
        clickStep.value = 2;
      }
    };
    templateRoot.addEventListener("click", clickHandler, false);
  }
}

function playMusic() {
  const myAudio = document.getElementById("playAudio") as HTMLAudioElement;
  if (!myAudio) return;
  if (myAudio.duration > 0 && !myAudio.paused) {
  } else {
    myAudio.play().catch(() => {
      console.warn("Autoplay bị chặn.");
    });
  }
}

watchEffect(async () => {
  if (contextData.value) {
    await nextTick();
    setupPresent();
  }
});

onBeforeUnmount(() => {
  const templateRoot = document.getElementById("template-root");
  if (templateRoot && clickHandler) {
    templateRoot.removeEventListener("click", clickHandler);
  }
});
</script>

<template>
  <div
    v-if="contextData"
    id="template-root"
    class="relative w-screen h-screen overflow-hidden"
  >
    <div id="effects-root"></div>

    <div class="gif-overlay" id="confetti-overlay"></div>
    <section class="above-fold">
      <div class="wrap-present">
        <div class="present-box" id="present">
          <div class="present">
            <div class="img-wrap" id="present-image"></div>
          </div>
          <div class="side front"></div>
          <div class="side back"></div>
          <div class="side left"></div>
          <div class="side right"></div>
          <div class="side top">
            <span class="to"></span>
          </div>
          <div class="side bottom"></div>
        </div>
      </div>
      <p class="info-text">Click to Open</p>
    </section>

    <div id="card" class="fixed">
      <p class="small-header">{{ eventName }}</p>
      <h4 class="title-card">❤️ {{ titleCard }} ❤️</h4>
      <div class="polaroid-wrapper">
        <img class="honey" :src="cardImage" />
        <p class="polaroid-caption">{{ polaroidCaption }}</p>
      </div>
      <h4 class="content-card">{{ contentCard }}</h4>
    </div>
    <div class="fly-gif-card-background" id="fly-gif-card-background"></div>
    <div class="teacher-gif-corner"></div>
    <audio autoplay loop id="playAudio" :src="audioSrc"></audio>
  </div>
</template>

<style scoped src="./style.css"></style>
