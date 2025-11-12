<script setup lang="ts">
import { ref, computed, watchEffect, onBeforeUnmount, nextTick } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import config from "./config";

const { contextData } = useTemplateData(config);

const contentCard = computed(
  () => contextData.value?.content[0] || "Chúc cô/thầy luôn vui vẻ..."
);
const eventName = computed(
  () => contextData.value?.content[1] || "Chúc Mừng 20-11"
);
const titleCard = computed(
  () => contextData.value?.content[2] || "Tặng người ấy"
);

const giftImage = computed(
  () => contextData.value?.images[0] || "/hot-girl.png"
);
const cardImage = computed(
  () => contextData.value?.images[1] || "/card-default.png"
);
const previewImage = computed(
  () => contextData.value?.images[2] || giftImage.value
);
const audioSrc = computed(
  () => contextData.value?.audios?.[0] || "/nhacnen.mp3"
);
const clickStep = ref(0);
let clickHandler: ((e: Event) => void) | null = null;
let resizeHandler: (() => void) | null = null;
let continuousInterval: number | null = null;

function setupPresent() {
  const gift_image_url = giftImage.value;
  const templateRoot = document.getElementById("template-root");
  const presentImage = document.getElementById("present-image");

  if (!templateRoot) return;

  const graphElem = document.querySelector(".present-box > .side.top .to");
  if (graphElem) graphElem.setAttribute("data-before", eventName.value);

  const titleElem = document.querySelector("#card .title-card");
  const contentElem = document.querySelector("#card .content-card");
  if (titleElem) titleElem.innerHTML = `💘${titleCard.value}💘`;
  if (contentElem) contentElem.innerHTML = `${contentCard.value}`;

  if (presentImage) {
    presentImage.innerHTML = "";
    let _giftImg = null;

    if (gift_image_url) {
      _giftImg = document.createElement("img");
      _giftImg.src = gift_image_url;
      presentImage.appendChild(_giftImg);
    }
  }

  if (!clickHandler) {
    clickHandler = () => {
      const presentEl = document.getElementById("present");
      if (!presentEl) return;

      const infoTextEl = document.querySelector(".info-text") as HTMLElement;
      const aboveFoldEl = document.querySelector(".above-fold") as HTMLElement;
      const imgWrapEl = document.getElementById("present-image");
      const cardEl = document.getElementById("card");
      const previewCardEl = document.getElementById("preview-card");

      clickStep.value++;

      if (clickStep.value === 1) {
        presentEl.classList.add("open");
        if (aboveFoldEl) aboveFoldEl.style.zIndex = "200";
        if (imgWrapEl) imgWrapEl.classList.add("show-main-image");

        playMusic();
        createFireworks();
        if (infoTextEl) infoTextEl.textContent = "Click để xem thiệp";
      } else if (clickStep.value === 2) {
        if (imgWrapEl) imgWrapEl.classList.remove("show-main-image");
        if (aboveFoldEl) aboveFoldEl.style.zIndex = "10";
        if (cardEl) cardEl.classList.add("card-show");

        if (infoTextEl) infoTextEl.textContent = "Click để xem ảnh kỷ niệm";
      } else if (clickStep.value === 3) {
        if (cardEl) cardEl.classList.remove("card-show");
        if (previewCardEl) previewCardEl.classList.add("preview-show");

        if (infoTextEl) infoTextEl.style.display = "none";
      }
    };
    templateRoot.addEventListener("click", clickHandler, false);
  }
}

function createFireworks() {
  const container = document.getElementById("effects-root") || document.body;
  const colors = ["#FFD700", "#FFA500", "#FF69B4", "#DC143C", "#FFB6C1"];

  for (let i = 0; i < 30; i++) {
    const spark = document.createElement("div");
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * (window.innerHeight * 0.7);
    const randomDuration = 1 + Math.random() * 1.5;

    spark.style.cssText = `
position: fixed;
left: ${randomX}px;
top: ${randomY}px;
width: 8px;
height: 8px;
border-radius: 50%;
background-color: ${randomColor};
pointer-events: none;
z-index: 9;
box-shadow: 0 0 10px ${randomColor};
animation: sparkShine ${randomDuration}s ease-out forwards;
`;

    container.appendChild(spark);
    setTimeout(() => spark.remove(), randomDuration * 1000);
  }
}

function playMusic() {
  const myAudio = document.getElementById("playAudio") as HTMLAudioElement;
  if (!myAudio) return;
  if (myAudio.duration > 0 && !myAudio.paused) {
  } else {
    myAudio.play().catch(() => {
      console.warn("Autoplay bị chặn, cần tương tác của người dùng.");
    });
  }
}

watchEffect(async () => {
  if (contextData.value) {
    await nextTick();
    setupPresent();

    const w = window as any;
    if (w.drawFlowers && typeof w.drawFlowers === "function") {
      try {
        w.drawFlowers();
      } catch (e) {}

      if (!resizeHandler) {
        resizeHandler = () => {
          try {
            w.drawFlowers();
          } catch (e) {}
        };
        window.addEventListener("resize", resizeHandler);
      }
    }
  }
});

onBeforeUnmount(() => {
  const templateRoot = document.getElementById("template-root");
  if (templateRoot && clickHandler) {
    templateRoot.removeEventListener("click", clickHandler);
  }
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
  if (continuousInterval) {
    window.clearInterval(continuousInterval);
    continuousInterval = null;
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
      id="effects-root"
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 5;
      "
    ></div>

    <canvas
      id="canvas"
      class="h-screen w-screen absolute top-0 left-0"
    ></canvas>

    <div
      class="fixed top-0 left-0 w-full h-full pointer-events-none z-0 decoration-lights"
    ></div>

    <div class="floating-particles"></div>

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
      <div class="card-ribbon">{{ eventName }}</div>

      <h4 class="title-card"></h4>

      <img class="honey" :src="cardImage" />

      <h4 class="content-card"></h4>
    </div>
    <div id="preview-card" class="fixed">
      <img class="preview-image" :src="previewImage" />
      <div class="preview-shine"></div>
    </div>

    <audio autoplay loop id="playAudio" :src="audioSrc"></audio>
  </div>
</template>

<style scoped src="./style.css"></style>
