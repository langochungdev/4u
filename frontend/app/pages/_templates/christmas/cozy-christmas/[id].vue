<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useTemplateData } from "../../../../composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

import bgImg from "./imgs/bg.webp";
import boxImg from "./imgs/box.webp";
import santaImg from "./imgs/santa.webp";
import snowmanImg from "./imgs/snowman.webp";
import reindeerImg from "./imgs/cl.webp";

const { contextData } = useTemplateData(TEMPLATE_CONFIG);

const isOpened = ref(false);
const displayedText = ref("");
const audioRef = ref<HTMLAudioElement | null>(null);
const showConfetti = ref(false);
const confettiParticles = ref<any[]>([]);
const isSnowmanJumping = ref(false);

const fireworks = ref<any[]>([]);

const tiltRef = ref<HTMLElement | null>(null);
const tiltStyle = ref({});

const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const updateCountdown = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  let xmasDate = new Date(currentYear, 11, 25);
  if (now.getTime() > xmasDate.getTime())
    xmasDate = new Date(currentYear + 1, 11, 25);
  const diff = xmasDate.getTime() - now.getTime();
  timeLeft.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const reindeerStyle = ref({});
let animationFrameId: number;
let time = 0;
const animateReindeer = () => {
  time += 0.005;
  const startX = 120;
  const endX = -30;
  const currentLeft = startX - (((time * 10) % 100) / 100) * (startX - endX);
  const waveY = Math.sin(time * 5) * 5;
  const baseTop = 15;
  reindeerStyle.value = {
    left: `${currentLeft}%`,
    top: `${baseTop + waveY}%`,
    transform: `scaleX(-1) scale(${0.8 + Math.sin(time * 5) * 0.05})`,
    filter: "blur(1px) brightness(0.8)",
  };
  animationFrameId = requestAnimationFrame(animateReindeer);
};

const trailParticles = ref<any[]>([]);
const handleMouseMove = (e: MouseEvent) => {
  if (window.innerWidth > 768) {
    const mouseX = (e.clientX - window.innerWidth / 2) / 50;
    const mouseY = (e.clientY - window.innerHeight / 2) / 50;
    document.documentElement.style.setProperty("--mx", `${mouseX * -0.5}px`);
    document.documentElement.style.setProperty("--my", `${mouseY * -0.5}px`);

    if (tiltRef.value && !isOpened.value) {
      const boxRect = tiltRef.value.getBoundingClientRect();
      const boxCenterX = boxRect.left + boxRect.width / 2;
      const boxCenterY = boxRect.top + boxRect.height / 2;
      const rotateX = -((e.clientY - boxCenterY) / 15);
      const rotateY = (e.clientX - boxCenterX) / 15;

      tiltStyle.value = {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`,
        filter: `drop-shadow(${rotateY * -0.5}px ${Math.max(
          10,
          rotateX + 20
        )}px 20px rgba(0,0,0,0.5))`,
      };
    }
  }

  if (Math.random() > 0.3) {
    const id = Date.now() + Math.random();
    trailParticles.value.push({
      id,
      x: e.clientX,
      y: e.clientY,
      color: Math.random() > 0.5 ? "#ffd700" : "#ffffff",
      size: Math.random() * 3 + 1 + "px",
    });
    setTimeout(() => {
      trailParticles.value = trailParticles.value.filter((p) => p.id !== id);
    }, 1000);
  }
};

const resetTilt = () => {
  tiltStyle.value = {
    transform: "perspective(1000px) rotateX(0) rotateY(0) scale(1)",
    filter: `drop-shadow(0px 20px 20px rgba(0,0,0,0.4))`,
  };
};

const greetingMessage = computed(
  () =>
    contextData.value?.content?.[0] ||
    "Chúc bạn một mùa Giáng sinh an lành, ấm áp và tràn đầy niềm vui bên những người thân yêu!"
);
const bgMusic = computed(() => contextData.value?.audios?.[0] || "");
const userPhoto = computed(() => contextData.value?.images?.[0] || null);

const createSnowflakes = (
  count: number,
  minSize: number,
  maxSize: number,
  speedMultiplier: number,
  blur: number,
  zIndex: number
) => {
  return Array.from({ length: count }, (_, i) => ({
    id: zIndex + "_" + i,
    left: Math.random() * 100 + "%",
    duration: (Math.random() * 10 + 10) / speedMultiplier + "s",
    delay: Math.random() * -20 + "s",
    size: Math.random() * (maxSize - minSize) + minSize + "px",
    blur: `${blur}px`,
    zIndex: zIndex,
  }));
};

const snowflakesBack = ref(createSnowflakes(40, 2, 4, 0.5, 2, 1));
const snowflakesMiddle = ref(createSnowflakes(30, 4, 8, 1, 0, 15));
const snowflakesFront = ref(createSnowflakes(20, 8, 12, 1.5, 1, 60));

const stars = ref(
  Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100 + "%",
    top: Math.random() * 50 + "%",
    delay: Math.random() * 3 + "s",
    size: Math.random() * 2 + 0.5 + "px",
  }))
);

const spawnFirework = (x: number, y: number) => {
  const id = Date.now() + Math.random();
  const premiumColors = ["#FFD700", "#C41E3A", "#50C878", "#FFFFFF"];
  const color = premiumColors[Math.floor(Math.random() * premiumColors.length)];
  fireworks.value.push({
    id,
    style: { left: x + "px", top: y + "px", "--color": color },
  });
  setTimeout(() => {
    fireworks.value = fireworks.value.filter((fw) => fw.id !== id);
  }, 1200);
};

const handleContainerClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.closest(".no-firework-zone")) return;
  spawnFirework(e.clientX, e.clientY);
};

const triggerConfetti = () => {
  const colors = ["#ffd700", "#ffffff", "#C41E3A"];
  confettiParticles.value = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    style: {
      "--tx": (Math.random() - 0.5) * 1200 + "px",
      "--ty": (Math.random() - 1.2) * 1000 + "px",
      "--r": Math.random() * 720 + "deg",
      "--c": colors[Math.floor(Math.random() * colors.length)],
      "--s": Math.random() * 0.8 + 0.3,
      left: "50%",
      top: "60%",
    },
  }));
  showConfetti.value = true;
  setTimeout(() => (showConfetti.value = false), 3000);
};

const handleOpenGift = async () => {
  if (isOpened.value) return;
  triggerConfetti();
  for (let i = 0; i < 7; i++) {
    setTimeout(() => {
      spawnFirework(
        window.innerWidth / 2 + (Math.random() - 0.5) * 400,
        window.innerHeight / 2 + (Math.random() - 0.8) * 400
      );
    }, i * 250);
  }
  isOpened.value = true;
  resetTilt();
  if (audioRef.value && bgMusic.value) {
    try {
      audioRef.value.volume = 0.7;
      await audioRef.value.play();
    } catch (e) {
      console.log("Auto-play blocked", e);
    }
  }
  let index = 0;
  displayedText.value = "";
  setTimeout(() => {
    const typeInterval = setInterval(() => {
      if (index < greetingMessage.value.length) {
        displayedText.value += greetingMessage.value.charAt(index);
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);
  }, 800);
};

const handleSnowmanClick = (e: Event) => {
  e.stopPropagation();
  isSnowmanJumping.value = true;
  setTimeout(() => (isSnowmanJumping.value = false), 1000);
};

let countdownInterval: any;
onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  animationFrameId = requestAnimationFrame(animateReindeer);
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
  resetTilt();
});
onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  cancelAnimationFrame(animationFrameId);
  clearInterval(countdownInterval);
});
</script>

<template>
  <div
    v-if="contextData"
    class="relative w-full h-[100dvh] overflow-hidden font-sans text-gray-100 selection:bg-red-500/30 cursor-crosshair theme-christmas premium-bg"
    @mouseleave="resetTilt"
    @click="handleContainerClick"
  >
    <div
      class="absolute inset-[-20px] bg-cover bg-center bg-no-repeat transition-transform duration-100 ease-out z-0 filter blur-[2px] brightness-[0.7]"
      :style="{
        backgroundImage: `url(${bgImg})`,
        transform: `translate(var(--mx, 0px), var(--my, 0px)) scale(1.05)`,
      }"
    ></div>
    <div
      class="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)]"
    ></div>
    <div
      class="absolute bottom-0 left-0 right-0 h-3/5 bg-[radial-gradient(ellipse_at_bottom_center,rgba(255,215,0,0.15)_0%,transparent_70%)] z-2 pointer-events-none mix-blend-screen"
    ></div>
    <div
      class="absolute inset-0 pointer-events-none z-3 opacity-20 aurora-layer mix-blend-overlay"
    ></div>

    <div class="absolute inset-0 pointer-events-none z-4">
      <div
        v-for="s in stars"
        :key="s.id"
        class="absolute bg-white rounded-full animate-twinkle-star shadow-[0_0_4px_#fff]"
        :style="{
          left: s.left,
          top: s.top,
          width: s.size,
          height: s.size,
          animationDelay: s.delay,
        }"
      ></div>
    </div>

    <div
      class="absolute w-auto h-24 md:h-32 z-5 pointer-events-none will-change-transform opacity-90"
      :style="reindeerStyle"
    >
      <img
        :src="reindeerImg"
        class="h-full w-auto object-contain drop-shadow-lg"
        alt="Reindeer"
        decoding="async"
      />
    </div>

    <div
      class="absolute inset-0 pointer-events-none overflow-hidden"
      :style="{ zIndex: snowflakesBack[0]?.zIndex }"
    >
      <div
        v-for="flake in snowflakesBack"
        :key="flake.id"
        class="snowflake"
        :style="{
          left: flake.left,
          animationDuration: flake.duration,
          animationDelay: flake.delay,
          width: flake.size,
          height: flake.size,
          filter: `blur(${flake.blur})`,
        }"
      ></div>
    </div>
    <div
      class="absolute inset-0 pointer-events-none overflow-hidden"
      :style="{ zIndex: snowflakesMiddle[0]?.zIndex }"
    >
      <div
        v-for="flake in snowflakesMiddle"
        :key="flake.id"
        class="snowflake"
        :style="{
          left: flake.left,
          animationDuration: flake.duration,
          animationDelay: flake.delay,
          width: flake.size,
          height: flake.size,
          filter: `blur(${flake.blur})`,
        }"
      ></div>
    </div>

    <div class="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
      <div
        v-for="fw in fireworks"
        :key="fw.id"
        class="firework"
        :style="fw.style"
      >
        <div
          v-for="n in 12"
          :key="n"
          class="explosion"
          :style="{ transform: `rotate(${n * 30}deg) translateY(-80px)` }"
        ></div>
      </div>
    </div>
    <div class="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <div
        v-for="p in trailParticles"
        :key="p.id"
        class="absolute rounded-full animate-trail-fade shadow-[0_0_4px_var(--tw-shadow-color)]"
        :style="{
          left: p.x + 'px',
          top: p.y + 'px',
          backgroundColor: p.color,
          width: p.size,
          height: p.size,
          '--tw-shadow-color': p.color,
        }"
      ></div>
    </div>
    <div
      v-if="showConfetti"
      class="absolute inset-0 pointer-events-none z-[70] overflow-hidden"
    >
      <div
        v-for="p in confettiParticles"
        :key="p.id"
        class="confetti-piece"
        :style="p.style"
      ></div>
    </div>

    <div v-if="!isOpened" class="w-full h-full relative z-30">
      <div
        class="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 animate-fade-in-down no-firework-zone w-full px-4"
      >
        <div
          class="glass-badge text-amber-200 font-bold font-serif text-sm md:text-base tracking-[0.2em] py-1.5 px-6 rounded-full uppercase"
        >
          <span class="drop-shadow-sm">Thời khắc kỳ diệu</span>
        </div>

        <div class="flex gap-2 md:gap-4">
          <div class="countdown-box group">
            <span class="count-num">{{ timeLeft.days }}</span>
            <span class="count-label">Ngày</span>
            <div
              class="absolute inset-0 rounded-xl border border-white/20 group-hover:border-amber-400/50 transition-colors"
            ></div>
          </div>
          <div class="countdown-box group">
            <span class="count-num">{{ timeLeft.hours }}</span>
            <span class="count-label">Giờ</span>
            <div
              class="absolute inset-0 rounded-xl border border-white/20 group-hover:border-amber-400/50 transition-colors"
            ></div>
          </div>
          <div class="countdown-box group">
            <span class="count-num">{{ timeLeft.minutes }}</span>
            <span class="count-label">Phút</span>
            <div
              class="absolute inset-0 rounded-xl border border-white/20 group-hover:border-amber-400/50 transition-colors"
            ></div>
          </div>
          <div class="countdown-box group">
            <span class="count-num">{{ timeLeft.seconds }}</span>
            <span class="count-label">Giây</span>
            <div
              class="absolute inset-0 rounded-xl border border-white/20 group-hover:border-amber-400/50 transition-colors"
            ></div>
          </div>
        </div>
      </div>

      <div
        class="absolute top-[55%] md:top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group no-firework-zone perspective-container"
        @click.stop="handleOpenGift"
        ref="tiltRef"
      >
        <div
          class="relative transition-all duration-200 ease-out will-change-transform"
          :style="tiltStyle"
        >
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-400/40 blur-[50px] rounded-full animate-pulse-slow mix-blend-screen pointer-events-none z-0"
          ></div>
          <div class="w-48 h-48 md:w-72 md:h-72 relative animate-float z-10">
            <img
              :src="boxImg"
              class="w-full h-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
              alt="Gift Box"
            />
            <div
              class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4)_0%,transparent_10%)] animate-sparkle"
            ></div>
          </div>
        </div>
        <div class="mt-10 relative z-20 group">
          <div
            class="absolute inset-0 bg-amber-400/30 blur-md rounded-full group-hover:blur-lg transition-all animate-pulse"
          ></div>
          <button
            class="relative px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-red-600/90 to-red-800/90 backdrop-blur-md rounded-full border-2 border-amber-300/50 text-amber-100 font-bold text-lg md:text-xl shadow-[0_0_30px_rgba(220,20,60,0.4)] hover:shadow-[0_0_50px_rgba(255,215,0,0.6)] hover:border-amber-300 transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span class="relative z-10 flex items-center gap-2 drop-shadow-sm">
              Chạm để mở quà 🎁
            </span>
            <div
              class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer-slide w-full h-full z-0"
            ></div>
          </button>
        </div>
      </div>

      <div
        class="absolute bottom-4 left-4 md:bottom-10 md:left-16 w-48 md:w-64 cursor-pointer z-20 transition-transform hover:scale-105 no-firework-zone group"
        :class="{
          'animate-bounce-custom': isSnowmanJumping,
          'animate-sway': !isSnowmanJumping,
        }"
        @click="handleSnowmanClick"
      >
        <div
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-white/20 blur-xl rounded-full pointer-events-none"
        ></div>
        <img
          :src="snowmanImg"
          class="w-full h-auto drop-shadow-2xl"
          alt="Snowman"
        />
        <div
          class="absolute -top-8 right-10 bg-white/90 text-gray-900 text-sm font-bold px-4 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg whitespace-nowrap pointer-events-none -translate-y-2 group-hover:translate-y-0"
        >
          Hi! Click me! ⛄
        </div>
      </div>
    </div>

    <div
      v-else
      class="absolute inset-0 z-40 flex items-center justify-center p-4 transition-all duration-1000 animate-fade-in bg-black/30 backdrop-blur-[8px]"
    >
      <div
        class="absolute inset-0 pointer-events-none overflow-hidden"
        :style="{ zIndex: snowflakesFront[0]?.zIndex }"
      >
        <div
          v-for="flake in snowflakesFront"
          :key="flake.id"
          class="snowflake"
          :style="{
            left: flake.left,
            animationDuration: flake.duration,
            animationDelay: flake.delay,
            width: flake.size,
            height: flake.size,
            filter: `blur(${flake.blur})`,
          }"
        ></div>
      </div>

      <div
        class="relative w-full max-w-[90%] md:max-w-6xl flex flex-col md:flex-row items-center justify-center mt-8 md:mt-0 gap-4 md:gap-16 no-firework-zone"
      >
        <div
          class="w-40 md:w-[28%] flex-shrink-0 animate-pop-up z-20 md:z-10 relative transition-all duration-500 mb-2 md:mb-0 md:mr-8"
        >
          <div
            class="absolute inset-0 bg-red-500/20 blur-[40px] rounded-full pointer-events-none animate-pulse-slow"
          ></div>
          <img
            :src="santaImg"
            class="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-breathe relative z-10"
            alt="Santa"
          />
        </div>

        <div class="w-full md:flex-1 relative animate-zoom-in z-[15] group">
          <div
            class="bg-white/10 backdrop-blur-xl rounded-3xl md:rounded-[2rem] p-6 pt-14 md:p-12 shadow-[0_30px_80px_-10px_rgba(0,0,0,0.8)] border border-white/10 relative"
          >
            <div
              class="absolute inset-0 rounded-3xl md:rounded-[2rem] border-2 border-amber-300/30 pointer-events-none mix-blend-overlay"
            ></div>
            <div
              class="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-70 pointer-events-none rounded-3xl md:rounded-[2rem]"
            ></div>

            <div
              class="absolute -top-4 -right-4 md:-top-6 md:-right-6 text-4xl md:text-6xl animate-swing drop-shadow-lg filter hue-rotate-[20deg]"
              style="animation-delay: 1.2s"
            >
              🔔
            </div>

            <div
              v-if="userPhoto"
              class="flex justify-center md:justify-start -mt-[5.5rem] md:-mt-[7rem] mb-6 md:mb-8 pointer-events-none relative z-20"
            >
              <div
                class="w-24 h-24 md:w-32 md:h-32 rounded-full border-[6px] border-amber-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-amber-100 relative group pointer-events-auto transform transition-all duration-500 hover:scale-110 hover:rotate-3 overflow-hidden ring-4 ring-amber-500/30"
              >
                <img
                  :src="userPhoto"
                  class="w-full h-full object-cover"
                  alt="User memory"
                />
                <div
                  class="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] rounded-full pointer-events-none"
                ></div>
              </div>
            </div>

            <h1
              class="text-3xl md:text-5xl font-bold text-center md:text-left mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-red-400 to-amber-300 animate-shimmer-text drop-shadow-sm font-christmas tracking-wider"
            >
              Merry Christmas!
            </h1>

            <div
              class="max-h-[25vh] md:max-h-[45vh] overflow-y-auto pr-3 scrollbar-premium relative z-10"
            >
              <p
                class="text-base md:text-xl text-amber-50/90 leading-relaxed font-serif text-justify drop-shadow-sm"
              >
                {{ displayedText }}
                <span
                  class="inline-block w-0.5 h-5 md:h-7 bg-amber-300/80 ml-1 animate-blink align-text-bottom shadow-[0_0_8px_#ffd700]"
                ></span>
              </p>
            </div>

            <div
              class="mt-6 md:mt-8 flex justify-center items-center gap-6 text-2xl md:text-3xl border-t border-amber-200/20 pt-4 opacity-80 relative z-10 text-amber-200/80 font-serif"
            >
              <span class="animate-spin-slow filter drop-shadow">❄️</span>
              <span
                class="animate-heartbeat text-red-500 filter drop-shadow-[0_0_10px_rgba(220,20,60,0.8)]"
                >❤️</span
              >
              <span
                class="animate-spin-slow"
                style="animation-direction: reverse"
                >❄️</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <audio ref="audioRef" :src="bgMusic" loop class="hidden"></audio>
  </div>
  <div
    v-else
    class="w-full h-screen flex items-center justify-center bg-[#0a0f1d] text-amber-200 font-serif tracking-widest uppercase premium-bg"
  >
    <span class="animate-pulse">Loading Magic...</span>
  </div>
</template>

<style scoped src="./style.css"></style>
