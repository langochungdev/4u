<script setup lang="ts">
import { ref, computed, onUnmounted, type Ref } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

import catGif from "./img/cat.gif";
import birthdayGif from "./img/birthday.gif";

/* ===== KIỂU DỮ LIỆU TỪ BUILDER ===== */
type TemplateContext = {
  content: string[];
  images: string[];
  videos?: string[];
  audios?: string[];
};

/* ===== LẤY DATA TỪ CONFIG ===== */
const { contextData } = useTemplateData(TEMPLATE_CONFIG) as {
  contextData: Ref<TemplateContext>;
};

const teacherName = computed(
  () => contextData.value?.content?.[0] || "Thầy/Cô kính mến"
);

const teacherWish = computed(
  () =>
    contextData.value?.content?.[1] ||
    "Nhân ngày 20/11, em xin gửi đến Thầy/Cô những lời tri ân chân thành nhất."
);

const senderName = computed(
  () => contextData.value?.content?.[2] || "Học trò nhỏ của Thầy/Cô"
);

/* ✅ AUDIO TỪ BUILDER (nếu có) */
const bgAudio = computed(() => contextData.value?.audios?.[0] || "");

/* ===== STATE CHUNG 3 STEP ===== */
type Screen = "password" | "cake" | "envelope";
const step = ref<Screen>("password");

const PASSWORD = "2011";
const passwordInput = ref("");
const errorMessage = ref("");

/* STEP 3 – ENVELOPE STATE */
type HeartItem = { id: number; left: number; delay: number };
const envelopeOpen = ref(false);
const hearts = ref<HeartItem[]>([]);

/* STEP 2 – FIREWORKS */
const fireworksContainer = ref<HTMLDivElement | null>(null);
let fireworksInterval: number | undefined;

/* =====================
   STEP 1: CHECK PASSWORD
   ===================== */
function checkPassword() {
  if (passwordInput.value === PASSWORD) {
    errorMessage.value = "";
    step.value = "cake";
    startFireworks();
  } else {
    errorMessage.value = "Sai mật khẩu rồi 😢";
    const card = document.getElementById("passwordCard");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 500);
    }
  }
}

/* =====================
   STEP 2 → STEP 3
   ===================== */
function goEnvelope() {
  step.value = "envelope";
  envelopeOpen.value = false;
  hearts.value = [];
}

/* =====================
   ENVELOPE TOGGLE
   ===================== */
function toggleEnvelope() {
  if (!envelopeOpen.value) {
    envelopeOpen.value = true;

    // tạo 1 đợt tim bay
    const newHearts: HeartItem[] = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 60 + 20, // tập trung khoảng giữa
      delay: Math.random() * 0.6,
    }));
    hearts.value = newHearts;

    setTimeout(() => {
      hearts.value = [];
    }, 3200);
  } else {
    envelopeOpen.value = false;
    hearts.value = [];
  }
}

/* =====================
   FIREWORK EFFECT (STEP 2)
   ===================== */
function startFireworks() {
  if (fireworksInterval || !fireworksContainer.value) return;

  const colors = ["#F96F6F", "#F8AFA6", "#FBD1B7", "#FFD700"];

  fireworksInterval = window.setInterval(() => {
    const container = fireworksContainer.value;
    if (!container) return;

    const fw = document.createElement("div");
    fw.className = "firework";

    fw.style.left = Math.random() * 100 + "%";
    fw.style.top = Math.random() * 60 + "%"; // chủ yếu quanh bánh

    const color =
      colors[Math.floor(Math.random() * colors.length)] ?? "#F96F6F";
    fw.style.backgroundColor = color;

    fw.style.setProperty("--tx", (Math.random() - 0.5) * 220 + "px");
    fw.style.setProperty("--ty", (Math.random() - 0.5) * 220 + "px");

    container.appendChild(fw);
    setTimeout(() => fw.remove(), 1400);
  }, 180);
}

onUnmounted(() => {
  if (fireworksInterval) clearInterval(fireworksInterval);
});
</script>

<template>
  <div class="wrapper">
    <!-- ============ STEP 1 ============ -->
    <div class="screen" :class="{ active: step === 'password' }">
      <div class="card" id="passwordCard">
        <img :src="catGif" class="cat-img" />

        <input
          type="password"
          v-model="passwordInput"
          @keyup.enter="checkPassword"
          placeholder="Nhập mật khẩu..."
          class="password-input"
        />

        <div class="error-message">{{ errorMessage }}</div>

        <button class="btn" @click="checkPassword">ENTER</button>
      </div>
    </div>

    <!-- ============ STEP 2 ============ -->
    <div class="screen" :class="{ active: step === 'cake' }">
      <div class="cake-container">
        <h1 class="title-2011">MỪNG NGÀY 20/11</h1>

        <img :src="birthdayGif" class="cake-img" />

        <div id="fireworksContainer" ref="fireworksContainer"></div>

        <button class="btn" @click="goEnvelope">NEXT</button>

        <!-- ✅ AUDIO PHÁT NHẠC (nếu có) -->
        <audio
          v-if="bgAudio"
          :src="bgAudio"
          autoplay
          loop
          class="audio-hidden"
        />
      </div>
    </div>

    <!-- ============ STEP 3 ============ -->
    <div class="screen" :class="{ active: step === 'envelope' }">
      <div class="envelope-stage">
        <!-- Lớp tim bay overlay -->
        <div class="heart-layer">
          <div
            v-for="heart in hearts"
            :key="heart.id"
            class="floating-heart"
            :style="{
              left: heart.left + '%',
              animationDelay: heart.delay + 's'
            }"
          ></div>
        </div>

        <!-- Card pastel + phong bì -->
        <div
          :class="[
            'envelope-card',
            { 'envelope-card--open': envelopeOpen, 'envelope-card--pulse': !envelopeOpen }
          ]"
        >
          <!-- Tim 4 góc -->
          <div class="corner-heart corner-heart--tl"></div>
          <div class="corner-heart corner-heart--tr"></div>
          <div class="corner-heart corner-heart--bl"></div>
          <div class="corner-heart corner-heart--br"></div>

          <!-- LÁ THƯ TRẮNG: nằm trong khoảng trống phía trên -->
          <div
            class="letter-panel"
            :class="{ 'letter-panel--open': envelopeOpen }"
          >
            <div class="letter-inner">
              <h3 class="letter-title">Gửi {{ teacherName }}</h3>
              <div class="letter-sep"></div>
              <p class="letter-text">
                {{ teacherWish }}
              </p>
              <div class="letter-sign">
                <span>Thân gửi,</span><br />
                <span>{{ senderName }}</span>
              </div>
            </div>
          </div>

          <!-- khoảng trống pastel phía trên (để thư nằm trong) -->
          <div class="envelope-empty-space"></div>

          <!-- PHONG BÌ 4 TAM GIÁC -->
          <div class="envelope-shape">
            <!-- nắp trên -->
            <div
              class="env-part env-top"
              :class="{ 'env-top--open': envelopeOpen }"
            ></div>

            <!-- cánh trái / phải -->
            <div class="env-part env-left"></div>
            <div class="env-part env-right"></div>

            <!-- thân dưới -->
            <div class="env-part env-bottom"></div>

            <!-- Icon giữa phong bì -->
            <div class="envelope-icon">💌</div>
          </div>

          <!-- nút mở/đóng thư ở DƯỚI -->
          <button class="btn-pill" @click="toggleEnvelope">
            <span>{{ envelopeOpen ? "ĐÓNG THƯ" : "MỞ THƯ" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./style.css"></style>
