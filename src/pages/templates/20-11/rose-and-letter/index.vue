<template>
  <div
    class="container"
    id="image-container"
    v-show="showImage"
    @click="handleImageClick"
  >
    <div class="content-wrapper">
      <img
        :src="imgFlowerFall"
        alt="Falling Flowers"
        class="flower-fall-gif"
        v-if="showImage"
      />
      <img
        :src="imgFlowerV4"
        alt="Flower GIF V4"
        class="top-left-gif"
        v-if="showImage"
      />
      <div id="image-draw-container">
        <img id="drawn-image" :src="drawnImageSrc" alt="Thiệp chúc mừng" />
      </div>
      <p id="text-click" v-show="showTextClick">Click me now !</p>
      <img
        :src="imgThankYou"
        alt="Thank You GIF"
        class="corner-gif"
        v-if="showImage"
      />
      <img
        :src="imgFlowerV3"
        alt="Flower GIF"
        class="corner-gif-right"
        v-if="showImage"
      />
    </div>
  </div>

  <div id="castle" ref="castleContainer" v-show="showCastle">
    <div class="letter">
      <div class="chalkboard" @click="openLetter">
        <div class="chalk-text">Nhà Giáo Việt Nam 20-11</div>
        <div class="chalk-holder">
          <div class="chalk"></div>
        </div>
      </div>
      <div class="shadow"></div>
    </div>
  </div>

  <div class="wrapperLetterForm" v-show="showLetterModal">
    <div class="boxLetter" @click.self="closeLetter">
      <div class="formLetter">
        <i class="fa-solid fa-xmark" @click="closeLetter"></i>
        <div class="heartLetter">
          <div class="heartLetterItem"></div>
        </div>
        <div class="heartLetter">
          <div class="heartLetterItem"></div>
        </div>
        <div class="wrapperLetter">
          <div class="books-stack">
            <div class="img">
              <img :src="imgBooksStack" alt="Chồng sách" />
            </div>
          </div>

          <div class="textLetter">
            <h2>{{ letterTitleRef }}</h2>
            <p class="contentLetter">{{ letterContentRef }}</p>
          </div>

          <div class="fountain-pen">
            <img :src="imgFountainPen" alt="Cây bút máy" />
          </div>
        </div>
      </div>
      <div class="before"></div>
    </div>
  </div>

  <audio
    id="background-audio"
    ref="backgroundAudio"
    :src="audioSrc"
    loop
    style="display: none"
  ></audio>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import config from "./config.ts";

import imgThankYou from "./imgs/giphy.gif";
import imgFlowerFall from "./imgs/flower.gif";
import imgFlowerV3 from "./imgs/flower-v3.gif";
import imgFlowerV4 from "./imgs/flower-v4.gif";
import imgFountainPen from "./imgs/fountain-pen.png";
import imgBooksStack from "./imgs/books-stack.png";

const { contextData } = useTemplateData(config);

const drawnImageSrc = computed(
  () =>
    contextData.value?.images[0] ||
    "https://via.placeholder.com/400?text=Vui+lòng+thêm+ảnh"
);
const audioSrc = computed(() => contextData.value?.audios?.[0] || "");
const modalTitle = computed(
  () => contextData.value?.content[0] || "Gửi Lời Chúc!"
);
const modalBody = computed(
  () =>
    contextData.value?.content[1] ||
    "Chúc bạn một ngày thật vui vẻ, hạnh phúc và ý nghĩa..."
);

const showImage = ref(true);
const showCastle = ref(false);
const showSvg = ref(false);
const showTextClick = ref(true);
const showLetterModal = ref(false);
const letterTitleRef = ref("");
const letterContentRef = ref("");

const backgroundAudio = ref<HTMLAudioElement | null>(null);
const castleContainer = ref<HTMLElement | null>(null);

function handleImageClick() {
  showImage.value = false;
  showCastle.value = true;
  showSvg.value = false;

  if (backgroundAudio.value) {
    backgroundAudio.value
      .play()
      .catch((e) => console.warn("Audio play blocked by browser:", e));
  }
}
function openLetter() {
  showLetterModal.value = true;
  funcTimeoutLetter();
}
function closeLetter() {
  showLetterModal.value = false;
}

let indexText = 0;
let timoutTextLetter: number;
function textCharLetter() {
  if (indexText < modalTitle.value.length) {
    letterTitleRef.value += modalTitle.value[indexText];
    indexText++;
    timoutTextLetter = window.setTimeout(textCharLetter, 100);
  } else {
    window.clearTimeout(timoutTextLetter);
    window.setTimeout(funcTimeoutLetterContent, 500);
  }
}
function funcTimeoutLetter() {
  indexText = 0;
  letterTitleRef.value = "";
  window.clearTimeout(timoutTextLetter);
  textCharLetter();
}
let indexTextContent = 0;
let timoutTextLetterContent: number;
function textCharLetterContent() {
  if (indexTextContent < modalBody.value.length) {
    letterContentRef.value += modalBody.value[indexTextContent];
    indexTextContent++;
    timoutTextLetterContent = window.setTimeout(textCharLetterContent, 100);
  } else {
    window.clearTimeout(timoutTextLetterContent);
  }
}
function funcTimeoutLetterContent() {
  indexTextContent = 0;
  letterContentRef.value = "";
  window.clearTimeout(timoutTextLetterContent);
  textCharLetterContent();
}

const head = document.getElementsByTagName("head")[0];
let animationId = 1;
const injectedStyles = ref<HTMLStyleElement[]>([]);

function CreateMagicDust(
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  sizeRatio: number,
  fallingTime: number,
  animationDelay: number
) {
  let dust = document.createElement("span");
  let animation = document.createElement("style");
  animation.innerHTML = `
    @keyframes blink${animationId}{
      0% { top: ${y1}px; left: ${x1}px; width: ${2 * sizeRatio}px; height: ${
    2 * sizeRatio
  }px; opacity: .4 }
      20% { width: ${4 * sizeRatio}px; height: ${4 * sizeRatio}px; opacity: .8 }
      35% { width: ${2 * sizeRatio}px; height: ${2 * sizeRatio}px; opacity: .5 }
      55% { width: ${3 * sizeRatio}px; height: ${3 * sizeRatio}px; opacity: .7 }
      80% { width: ${sizeRatio}px; height: ${sizeRatio}px; opacity: .3 }
      100% { top: ${y2}px; left: ${x2}px; width: 0px; height: 0px; opacity: .1 }
    }`;

  if (head) {
    head.appendChild(animation);
    injectedStyles.value.push(animation);
  }

  dust.classList.add("dustDef");
  dust.setAttribute(
    "style",
    `animation: blink${animationId++} ${fallingTime}s cubic-bezier(.71, .11, .68, .83) infinite ${animationDelay}s`
  );

  if (castleContainer.value) {
    castleContainer.value.appendChild(dust);
  }
}

onMounted(() => {
  document.body.style.overflow = "hidden";
  document.body.style.backgroundColor = "#FDF5E6";

  [
    [130, 132, 150, 152, 0.15, 2.5, 0.1],
    [65, 63, 300, 299, 0.5, 2, 0.2],
    [70, 70, 150, 150, 0.45, 2, 0.5],
    [75, 78, 160, 170, 0.6, 2, 1],
    [80, 82, 160, 180, 0.6, 1, 0.4],
    [85, 100, 160, 170, 0.5, 2, 0.5],
    [125, 110, 170, 180, 0.25, 3, 1.5],
    [90, 90, 115, 115, 0.4, 2, 2],
    [93, 95, 200, 200, 0.4, 3, 1.5],
    [100, 100, 145, 155, 0.45, 1, 0.5],
    [100, 90, 170, 230, 0.35, 2, 0.75],
    [100, 102, 115, 112, 0.35, 3, 0.25],
    [100, 95, 170, 200, 0.55, 1.5, 0.75],
    [100, 97, 150, 190, 0.7, 2, 1.5],
    [105, 100, 160, 180, 0.5, 1.5, 0.725],
    [125, 125, 180, 190, 0.25, 1, 0.725],
    [130, 130, 135, 135, 0.45, 3, 1.5],
    [135, 132, 170, 190, 0.25, 2.5, 0.75],
    [135, 132, 320, 315, 0.2, 5, 0.3],
  ].forEach((o) =>
    CreateMagicDust(
      o[0] ?? 0,
      o[1] ?? 0,
      o[2] ?? 0,
      o[3] ?? 0,
      o[4] ?? 0,
      o[5] ?? 0,
      o[6] ?? 0
    )
  );
});

onBeforeUnmount(() => {
  document.body.style.overflow = "auto";
  document.body.style.backgroundColor = "";

  window.clearTimeout(timoutTextLetter);
  window.clearTimeout(timoutTextLetterContent);

  if (head) {
    injectedStyles.value.forEach((styleEl) => {
      try {
        head.removeChild(styleEl);
      } catch (e) {}
    });
  }
  injectedStyles.value = [];
});
</script>

<style scoped src="./style.css"></style>
