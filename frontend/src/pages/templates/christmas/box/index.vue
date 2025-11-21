<script setup lang="ts">
import { ref, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

/* ===== ẢNH LOCAL (bộ bạn gửi) ===== */
import treeUrl from "./img/pine-tree.webp?url";
import giftsUrl from "./img/anh-4.webp?url";
import santaUrl from "./img/satan.webp?url";

// nếu muốn dùng thêm snow icon riêng thì import luôn:
// import snowIconUrl from "./snow.webp?url";

/** LẤY DATA TỪ CONFIG (builder) */
const { contextData } = useTemplateData(TEMPLATE_CONFIG);

const message = computed(() => {
  const content = contextData.value?.content?.[0];
  return content && content.trim().length > 0
    ? content
    : "Merry Christmas & Happy New Year! 🎄✨";
});

/** TUYẾT RƠI – tạo sẵn dữ liệu (tránh Math.random trong template) */
type Snowflake = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
};

const snowflakes = ref<Snowflake[]>(
  Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 6,
    size: 6 + Math.random() * 10,
    opacity: 0.4 + Math.random() * 0.6,
  }))
);
</script>

<template>
  <div class="xmas-wrapper">
    <!-- TUYẾT RƠI -->
    <div
      v-for="flake in snowflakes"
      :key="flake.id"
      class="snowflake"
      :style="{
        left: flake.left + '%',
        animationDelay: flake.delay + 's',
        animationDuration: flake.duration + 's',
        width: flake.size + 'px',
        height: flake.size + 'px',
        opacity: flake.opacity,
      }"
    />

    <!-- LỚP GLOW NỀN -->
    <div class="xmas-bg-glow"></div>

    <!-- CARD CHÍNH -->
    <div class="xmas-card">
      <!-- ÔNG GIÀ NOEL BAY TRÊN TRỜI -->
      <div class="santa-wrap">
        <img :src="santaUrl" alt="Santa" class="santa-img" />
      </div>

      <!-- KHU VỰC CÂY THÔNG -->
      <div class="tree-wrapper">
        <img :src="treeUrl" alt="Christmas Tree" class="tree-img" />

        <!-- MẶT ĐẤT TUYẾT -->
        <div class="ground"></div>

        <!-- ĐỐNG QUÀ DƯỚI GỐC CÂY -->
        <img :src="giftsUrl" alt="Gifts" class="gifts-img" />

        <!-- ĐÈN GLOW TRÊN CÂY -->
        <span class="light-dot light-1"></span>
        <span class="light-dot light-2"></span>
        <span class="light-dot light-3"></span>
        <span class="light-dot light-4"></span>
      </div>

      <!-- LỜI CHÚC -->
      <div class="message-card">
        <h1 class="message-title">Merry Christmas</h1>
        <p class="message-text">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ====== NỀN CHUNG ====== */
.xmas-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #2f82ff 0, #061428 55%, #020713 100%);
  overflow: hidden;
  color: #fff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Helvetica Neue", Arial, sans-serif;
}

/* Lớp ánh sáng mờ phía sau */
.xmas-bg-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.25) 0, transparent 55%),
    radial-gradient(circle at bottom, rgba(255, 0, 92, 0.15) 0, transparent 60%);
  mix-blend-mode: screen;
  pointer-events: none;
}

/* ====== CARD CHÍNH ====== */
.xmas-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 24px 18px 22px;
  border-radius: 24px;
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.04)
    );
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.65),
    0 0 60px rgba(0, 180, 255, 0.3);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 2;
  overflow: hidden;
}

/* ====== ÔNG GIÀ NOEL BAY ====== */
.santa-wrap {
  position: absolute;
  top: 4%;
  left: -40%;
  width: 70%;
  pointer-events: none;
  animation: santaFly 14s linear infinite;
}

.santa-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.8));
}

/* ====== CÂY THÔNG + QUÀ ====== */
.tree-wrapper {
  position: relative;
  width: 100%;
  padding-top: 32px;
  padding-bottom: 12px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.tree-img {
  max-width: 230px;
  width: 68%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.9));
  animation: treeFloat 3.5s ease-in-out infinite;
}

/* mặt đất tuyết */
.ground {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 130%;
  height: 82px;
  background: radial-gradient(circle at top, #ffffff, #f5f9ff, #d0e8ff);
  border-radius: 50%;
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.5),
    0 -8px 24px rgba(255, 255, 255, 0.5);
}

/* quà dưới gốc cây */
.gifts-img {
  position: absolute;
  bottom: -4px;
  right: 16%;
  width: 42%;
  max-width: 150px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.8));
}

/* đèn nhỏ trên cây (glow) */
.light-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  filter: blur(0.8px);
  animation: glowPulse 2.4s ease-in-out infinite alternate;
}

.light-1 {
  top: 32%;
  left: 40%;
  background: #ffdf6b;
}

.light-2 {
  top: 42%;
  right: 32%;
  background: #ff7aa2;
  animation-delay: 0.4s;
}

.light-3 {
  top: 55%;
  left: 34%;
  background: #6bffcd;
  animation-delay: 0.9s;
}

.light-4 {
  top: 65%;
  right: 38%;
  background: #8ad3ff;
  animation-delay: 1.3s;
}

/* ====== LỜI CHÚC ====== */
.message-card {
  position: relative;
  margin-top: 6px;
  padding: 16px 14px 14px;
  border-radius: 18px;
  background: radial-gradient(
      circle at top left,
      rgba(255, 255, 255, 0.32),
      transparent 60%
    ),
    rgba(3, 9, 25, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.6);
}

.message-title {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
}

.message-text {
  font-size: 0.98rem;
  line-height: 1.6;
  text-align: center;
  white-space: pre-line;
}

/* ====== TUYẾT RƠI ====== */
.snowflake {
  position: fixed;
  top: -20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 0 6px rgba(255, 255, 255, 0.9),
    0 0 12px rgba(180, 220, 255, 0.85);
  animation-name: snowFall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  pointer-events: none;
  z-index: 1;
}

/* ====== ANIMATION ====== */
@keyframes snowFall {
  0% {
    transform: translate3d(0, 0, 0);
  }
  60% {
    transform: translate3d(-10px, 60vh, 0);
  }
  100% {
    transform: translate3d(15px, 110vh, 0);
  }
}

@keyframes treeFloat {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes glowPulse {
  0% {
    transform: scale(0.95);
    opacity: 0.6;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
  }
  100% {
    transform: scale(1.2);
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 255, 255, 1);
  }
}

/* ông già Noel bay ngang */
@keyframes santaFly {
  0% {
    transform: translateX(0) translateY(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translateX(120%) translateY(-6px);
    opacity: 1;
  }
  90% {
    opacity: 0;
  }
  100% {
    transform: translateX(160%) translateY(-16px);
    opacity: 0;
  }
}

/* ====== RESPONSIVE ====== */
@media (max-width: 480px) {
  .xmas-card {
    padding: 20px 14px 18px;
    border-radius: 20px;
  }

  .tree-img {
    max-width: 210px;
  }

  .gifts-img {
    right: 12%;
    width: 48%;
  }

  .message-title {
    font-size: 1.2rem;
  }

  .message-text {
    font-size: 0.92rem;
  }
}
</style>
