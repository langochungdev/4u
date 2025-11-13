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
const showLotusBackground = ref(false);
const showCardFlowers = ref(false);
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
      const cardFlowersContainer = document.getElementById(
        "card-flowers-container"
      );

      clickStep.value++;

      if (clickStep.value === 1) {
        presentEl.classList.add("open");
        if (aboveFoldEl) aboveFoldEl.style.zIndex = "200";
        if (presentImageEl) presentImageEl.classList.add("show-main-image");
        playMusic();
        createFallingFlowers();
        if (infoTextEl) infoTextEl.textContent = "Click để xem thiệp";
        showLotusBackground.value = false;
      } else if (clickStep.value === 2) {
        if (presentImageEl) presentImageEl.classList.remove("show-main-image");
        if (aboveFoldEl) aboveFoldEl.style.zIndex = "10";
        if (cardEl) cardEl.classList.add("card-show");
        if (infoTextEl) infoTextEl.style.display = "none";

        showLotusBackground.value = true;
        showCardFlowers.value = true;

        if (cardFlowersContainer) {
          cardFlowersContainer.innerHTML = "";
          for (let i = 0; i < 4; i++) {
            const flower = document.createElement("div");
            flower.classList.add("lotus-flower-item");
            flower.style.left = `${30 + Math.random() * 40}%`;
            flower.style.bottom = `${-50 + Math.random() * 30}px`;
            flower.style.transform = `rotate(${
              Math.random() * 30 - 15
            }deg) scale(${0.5 + Math.random() * 0.3})`;
            flower.style.opacity = `${0.5 + Math.random() * 0.3}`;
            cardFlowersContainer.appendChild(flower);
          }
        }
      } else if (clickStep.value === 3) {
        clickStep.value = 2;
      }
    };
    templateRoot.addEventListener("click", clickHandler, false);
  }
}

function createFallingFlowers() {
  const container = document.getElementById("effects-root") || document.body;
  if (!container) return;

  if (container.querySelectorAll(".petal").length > 0) return;

  const flowerCount = 30;
  for (let i = 0; i < flowerCount; i++) {
    const petal = document.createElement("div");
    petal.classList.add("petal");

    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.top = `${-10 - Math.random() * 20}vh`;

    const randomDuration = 8 + Math.random() * 7;
    const randomDelay = Math.random() * 10;

    petal.style.animationDuration = `${randomDuration}s`;
    petal.style.animationDelay = `${randomDelay}s`;

    const randomSize = 15 + Math.random() * 10;
    petal.style.width = `${randomSize}px`;
    petal.style.height = `${randomSize}px`;

    container.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, (randomDuration + randomDelay) * 1000);
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
    <div
      class="lotus-background"
      :class="{ visible: showLotusBackground }"
    ></div>
    <div id="effects-root"></div>

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

      <template v-if="showCardFlowers">
        <div class="card-flower top-left"></div>
        <div class="card-flower top-right"></div>
        <div class="card-flower bottom-left"></div>
        <div class="card-flower bottom-right"></div>
      </template>

      <div id="card-flowers-container"></div>
    </div>

    <audio autoplay loop id="playAudio" :src="audioSrc"></audio>
  </div>
</template>

<style scoped src="./style.css"></style>
