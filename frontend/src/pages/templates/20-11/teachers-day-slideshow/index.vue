<template>
  <div class="relative w-full h-screen overflow-hidden bg-white font-sans">
    <Transition name="fade">
      <div
        v-if="!cardVisible"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center w-full h-full bg-white cursor-pointer"
        @click="showCard"
      >
        <img :src="flowerGif" alt="Bó hoa" class="w-48 h-48 animate-bounce" />
        <p class="mt-4 text-lg text-gray-600">💎 Chạm nhẹ vào bó hoa 💎</p>
      </div>
    </Transition>

    <div class="absolute inset-0 z-0 overflow-hidden">
      <span v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)">
        {{ particles[i % particles.length] }}
      </span>
    </div>

    <Transition name="zoom">
      <div
        v-if="cardVisible && contextData"
        class="absolute inset-0 z-10 flex items-center justify-center p-4"
      >
        <div
          class="w-full max-w-sm p-5 bg-white shadow-xl rounded-2xl"
          style="background-color: rgba(255, 255, 255, 0.9)"
        >
          <h1 class="text-center text-lg font-bold text-pink-500 mb-3">
            {{ headerText }}
          </h1>

          <div
            class="relative w-full overflow-hidden bg-gray-200 rounded-lg aspect-video"
          >
            <TransitionGroup name="fade-slide">
              <img
                v-for="(img, index) in images"
                :key="img"
                v-show="index === currentImageIndex"
                :src="img"
                alt="Teacher's Day"
                class="absolute inset-0 object-cover w-full h-full"
              />
            </TransitionGroup>
          </div>

          <div
            class="relative min-h-24 mt-4 p-4 bg-orange-100 rounded-lg"
            style="transition: height 0.3s ease"
          >
            <Transition name="fade-slide" mode="out-in">
              <p
                :key="currentTextIndex"
                class="text-center text-sm font-medium text-gray-700"
              >
                {{ messages[currentTextIndex] }}
              </p>
            </Transition>
          </div>

          <p class="mt-4 text-xs text-center text-gray-500">
            Thiết kế đầy yêu thương dành tặng Thầy Cô
          </p>
        </div>
      </div>
    </Transition>

    <audio ref="audioPlayer" :src="audioSrc" loop></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import config from "./config";
import { useTemplateData } from "@/composables/useTemplateData";
import flowerGif from "./imgs/flower.gif";
const { contextData } = useTemplateData(config);

const cardVisible = ref(false);
const currentImageIndex = ref(0);
const currentTextIndex = ref(0);
const audioPlayer = ref<HTMLAudioElement | null>(null);
const particles = ["🌸", "✏️", "📖", "🌷", "📚", "🖋️"];

const headerText = computed(
  () =>
    contextData.value?.content?.[0] || "Chúc mừng Ngày Nhà giáo Việt Nam 20/11"
);
const messages = computed(() => [
  contextData.value?.content?.[1] ||
    "Cảm ơn Thầy Cô đã mang đến cho chúng em tri thức, niềm tin và ước mơ 💖",
  contextData.value?.content?.[2] ||
    "Mỗi bài học, mỗi lời dạy của Thầy Cô là hành trang quý giá suốt đời",
]);
const images = computed(() => contextData.value?.images ?? []);
const audioSrc = computed(() => contextData.value?.audios?.[0] || "");
const startSlideshow = () => {
  if (images.value.length > 1) {
    setInterval(() => {
      currentImageIndex.value =
        (currentImageIndex.value + 1) % images.value.length;
    }, 3000);
  }

  if (messages.value.length > 1) {
    setInterval(() => {
      currentTextIndex.value =
        (currentTextIndex.value + 1) % messages.value.length;
    }, 5000);
  }
};

const showCard = () => {
  cardVisible.value = true;
  if (audioPlayer.value && audioSrc.value) {
    audioPlayer.value
      .play()
      .catch((e) => console.error("Audio play failed:", e));
  }
  startSlideshow();
};

const particleStyle = (_i: number) => ({
  left: `${Math.random() * 100}vw`,
  animationDuration: `${Math.random() * 5 + 8}s`,
  animationDelay: `${Math.random() * 10}s`,
  fontSize: `${Math.random() * 0.5 + 0.75}rem`,
});
</script>

<style scoped>
@keyframes fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
.particle {
  position: absolute;
  top: -10%;
  animation: fall linear infinite;
  user-select: none;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.5s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.8s ease-in-out;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}
</style>
