<template>
  <div
    ref="mainContainer"
    class="relative w-full h-screen overflow-hidden font-sans text-slate-800"
    v-if="contextData"
  >
    <audio
      ref="audioPlayer"
      :src="contextData.audios?.[0] || 'sangelbaby3.mp3'"
      class="hidden"
      loop
    ></audio>

    <div
      ref="backgroundOverlay"
      class="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transition-all duration-1000"
      :style="{
        backgroundImage: `url('${
          contextData.images?.[0] ||
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhsOhJrSDLjYoVvzWl_1aZtqnw-Xgd6yALV-5OK0AxYHhkTB_BttocjSoNya_XxaC-CPPl1C1OrvABOaSHLzWaYs4GKxUe9UWr3dH4xpI09cEOKMYrYCx813XimY0sHH1hdgz41_Z4xWhcdJK2qeIyX8QBvjrf5x-0ZJqeghO3ZyRNomQzSrvScel8GQO7Z/s1600/1000359042.jpg'
        }')`,
      }"
    >
      <div class="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
    </div>

    <canvas
      id="fireworks-canvas"
      ref="fireworksCanvas"
      class="absolute inset-0 z-0 pointer-events-none"
    ></canvas>
    <canvas
      id="game-canvas"
      ref="gameCanvas"
      class="absolute inset-0 z-0 pointer-events-none"
    ></canvas>

    <div
      ref="teksSembunyi1"
      class="fixed top-8 left-4 md:top-12 md:left-12 text-white font-bold text-sm md:text-xl opacity-0 z-50 transition-opacity duration-700 drop-shadow-md"
    ></div>
    <div
      ref="teksSembunyi2"
      class="fixed top-12 right-4 md:top-16 md:right-12 text-white font-bold text-sm md:text-xl opacity-0 z-50 transition-opacity duration-700 drop-shadow-md"
    ></div>

    <div
      class="relative z-10 flex items-center justify-center h-full w-full px-4"
    >
      <div
        v-show="currentStage === 1"
        class="glass-box flex flex-col items-center gap-4 p-6 md:p-8 animate-popIn"
      >
        <div
          class="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/80 shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm"
        >
          <img
            :src="contextData.images?.[1] || './assets/pusn3.gif'"
            class="w-full h-full object-cover"
          />
        </div>
        <h2
          class="text-xl md:text-2xl font-bold text-white drop-shadow-md text-center max-h-[30vh] overflow-y-auto custom-scrollbar px-2"
        >
          {{ contextData.content?.[0] || "Hello You! 💐" }}
        </h2>
        <button @click="goToStage(2)" class="btn-primary">Start</button>
      </div>

      <div
        v-show="currentStage === 2"
        class="transition-transform duration-700 transform flex flex-col items-center"
        :class="[isEnvelopeVisible ? 'scale-100' : 'scale-0']"
      >
        <div class="envelope-wrapper">
          <div id="envelope" ref="envelope" class="close">
            <div class="front flap"></div>
            <div class="front pocket"></div>
            <div class="letter">
              <div class="message">
                <p>{{ contextData.content?.[0] || "Hello You! 💐" }}</p>
              </div>
            </div>
            <div class="hearts">
              <div class="heart a1"></div>
              <div class="heart a2"></div>
              <div class="heart a3"></div>
            </div>
          </div>
        </div>
        <div
          class="mt-16 text-center reset-btn-container transition-all duration-500"
        >
          <button @click="openEnvelope()" class="btn-primary">Open</button>
        </div>
      </div>

      <div
        v-show="currentStage === 3"
        ref="finalBox"
        class="glass-box flex flex-col items-center gap-4 p-5 md:p-8 max-h-[80vh] overflow-hidden transition-all duration-700 transform scale-0 opacity-0"
      >
        <div class="relative w-24 h-24 md:w-28 md:h-28 shrink-0">
          <img
            ref="avatarImg"
            :src="contextData.images?.[2] || './assets/pusn.gif'"
            class="w-full h-full object-cover rounded-full border-4 border-white/80 shadow-lg bg-white/50"
          />
        </div>
        <div
          ref="textOverlay"
          class="w-full text-center min-h-[60px] max-h-[200px] overflow-y-auto custom-scrollbar"
        >
          <p
            ref="teksAwalan"
            class="text-white font-medium text-base md:text-lg leading-relaxed"
          ></p>
          <p
            ref="teksCinta"
            class="text-white font-bold text-lg md:text-xl mt-2 leading-relaxed hidden"
          ></p>
          <p
            ref="pesanAkhir"
            class="text-white font-medium text-sm md:text-base mt-3 leading-relaxed hidden"
          ></p>
        </div>
        <button
          ref="tombolLanjut"
          @click="goToFinalReveal()"
          class="btn-primary mt-2 opacity-0 transform scale-0"
        >
          LesssGo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick, onMounted } from "vue";
import { useTemplateData } from "../../../../composables/useTemplateData";
import config from "./config";
import TypeIt from "typeit";

const { contextData } = useTemplateData(config);
const currentStage = ref(1);
const isEnvelopeVisible = ref(false);

const mainContainer = ref<HTMLElement | null>(null);
const audioPlayer = ref<HTMLAudioElement | null>(null);
const envelope = ref<HTMLElement | null>(null);
const finalBox = ref<HTMLElement | null>(null);
const avatarImg = ref<HTMLImageElement | null>(null);
const teksSembunyi1 = ref<HTMLElement | null>(null);
const teksSembunyi2 = ref<HTMLElement | null>(null);
const teksAwalan = ref<HTMLElement | null>(null);
const teksCinta = ref<HTMLElement | null>(null);
const pesanAkhir = ref<HTMLElement | null>(null);
const textOverlay = ref<HTMLElement | null>(null);
const tombolLanjut = ref<HTMLElement | null>(null);
const fireworksCanvas = ref<HTMLCanvasElement | null>(null);
const gameCanvas = ref<HTMLCanvasElement | null>(null);

let intervalHati: ReturnType<typeof setInterval> | undefined;
let scrollInterval: ReturnType<typeof setInterval> | undefined;
let animationFrameId: number | null = null;

const handleResize = () => {
  if (fireworksCanvas.value) {
    fireworksCanvas.value.width = window.innerWidth;
    fireworksCanvas.value.height = window.innerHeight;
  }
  if (gameCanvas.value) {
    gameCanvas.value.width = window.innerWidth;
    gameCanvas.value.height = window.innerHeight;
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

function goToStage(stage: number) {
  if (stage === 2) {
    currentStage.value = 2;
    setTimeout(() => {
      isEnvelopeVisible.value = true;
    }, 50);
  }
}

function openEnvelope() {
  if (audioPlayer.value) audioPlayer.value.play().catch(() => {});
  if (envelope.value) {
    envelope.value.classList.remove("close");
    envelope.value.classList.add("open");
  }
  const btnContainer = document.querySelector(
    ".reset-btn-container"
  ) as HTMLElement;
  if (btnContainer) {
    btnContainer.style.opacity = "0";
    btnContainer.style.transform = "scale(0)";
  }
  setTimeout(() => {
    isEnvelopeVisible.value = false;
    setTimeout(() => {
      currentStage.value = 3;
      startStage3Interaction();
    }, 700);
  }, 1500);
}

function startStage3Interaction() {
  nextTick(() => {
    if (!finalBox.value) return;
    finalBox.value.classList.remove("scale-0", "opacity-0");
    finalBox.value.classList.add("scale-100", "opacity-100");
    mulaiKelopak();
    const txt1 =
      contextData.value?.content?.[1] ||
      "<b>Hey you</b>, yes you! 🫵<br>Try looking at the top left corner<br>of your phone screen 🫣";
    const txtHidden1 = contextData.value?.content?.[2] || "Look here! 👀";
    const txtHidden2 =
      contextData.value?.content?.[3] || "<b>I love u</b> more darling 🫶";

    if (teksAwalan.value) {
      new TypeIt(teksAwalan.value, {
        strings: txt1,
        speed: 30,
        lifeLike: true,
        afterComplete: (instance: any) => {
          instance.element.querySelector(".ti-cursor")?.remove();
          setTimeout(() => {
            if (teksSembunyi1.value) {
              teksSembunyi1.value.innerHTML = txtHidden1;
              teksSembunyi1.value.style.opacity = "1";
              setTimeout(() => {
                if (teksSembunyi2.value) {
                  teksSembunyi2.value.innerHTML = txtHidden2;
                  teksSembunyi2.value.style.opacity = "1";
                  setTimeout(() => {
                    if (tombolLanjut.value) {
                      tombolLanjut.value.classList.remove(
                        "opacity-0",
                        "scale-0"
                      );
                      tombolLanjut.value.classList.add(
                        "opacity-100",
                        "scale-100"
                      );
                    }
                  }, 500);
                }
              }, 1500);
            }
          }, 500);
        },
      }).go();
    }
  });
}

function goToFinalReveal() {
  if (tombolLanjut.value) tombolLanjut.value.classList.add("hidden");
  if (teksSembunyi1.value) teksSembunyi1.value.style.opacity = "0";
  if (teksSembunyi2.value) teksSembunyi2.value.style.opacity = "0";
  if (finalBox.value) {
    finalBox.value.style.transform = "scale(0.9)";
    finalBox.value.style.opacity = "0.8";
  }
  setTimeout(() => {
    if (avatarImg.value) {
      avatarImg.value.src =
        contextData.value?.images?.[3] ||
        contextData.value?.images?.[2] ||
        "./assets/panah.gif";
    }
    if (teksAwalan.value) teksAwalan.value.style.display = "none";
    if (teksCinta.value) teksCinta.value.style.display = "block";
    if (pesanAkhir.value) pesanAkhir.value.style.display = "block";
    if (finalBox.value) {
      finalBox.value.style.transform = "scale(1)";
      finalBox.value.style.opacity = "1";
    }
    const txtTitle =
      contextData.value?.content?.[4] ||
      "Why do I prefer <span class='text-pink-400'>I love you</span> more? 🌹";
    const txtBody =
      contextData.value?.content?.[5] ||
      "Because I love you in every universe...<br>I love you more than I can say. ❤️";
    if (teksCinta.value) {
      new TypeIt(teksCinta.value, {
        strings: txtTitle,
        speed: 40,
        afterComplete: (inst: any) => {
          inst.element.querySelector(".ti-cursor")?.remove();
          startAutoScroll();
          if (pesanAkhir.value) {
            new TypeIt(pesanAkhir.value, {
              strings: txtBody,
              speed: 35,
              startDelay: 500,
              afterComplete: (inst2: any) => {
                inst2.element.querySelector(".ti-cursor")?.remove();
                finishAnimation();
              },
            }).go();
          }
        },
      }).go();
    }
  }, 400);
}

function finishAnimation() {
  if (avatarImg.value) {
    avatarImg.value.src =
      contextData.value?.images?.[4] ||
      contextData.value?.images?.[3] ||
      "./assets/muah.gif";
  }
  intervalHati = setInterval(hatiJatuh, 300);
  mulaiKembangApi();
  const ctx = gameCanvas.value?.getContext("2d");
  ctx?.clearRect(0, 0, 9999, 9999);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
}

function startAutoScroll() {
  if (scrollInterval) clearInterval(scrollInterval);
  scrollInterval = setInterval(() => {
    if (textOverlay.value) textOverlay.value.scrollTop += 1;
  }, 50);
}

function hatiJatuh() {
  const hati = document.createElement("div");
  hati.className = "hati-fall";
  hati.innerHTML = `<svg class='w-6 h-6 text-pink-500 fill-current' viewBox='0 0 24 24'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/></svg>`;
  hati.style.left = Math.random() * 100 + "vw";
  hati.style.animationDuration = Math.random() * 3 + 2 + "s";

  if (mainContainer.value) {
    mainContainer.value.appendChild(hati);
  }

  setTimeout(() => hati.remove(), 5000);
}

function mulaiKelopak() {
  const canvas = gameCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const petals: any[] = Array.from({ length: 20 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 3 + 1,
    s: Math.random() * 1 + 0.5,
  }));
  function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(249, 168, 212, 0.6)";
    petals.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.s;
      p.x += Math.sin(p.y * 0.01) * 0.5;
      if (p.y > canvas.height) p.y = -5;
    });
    animationFrameId = requestAnimationFrame(draw);
  }
  draw();
}

function mulaiKembangApi() {
  const canvas = fireworksCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles: any[] = [];
  function createFirework() {
    const x = Math.random() * canvas!.width;
    const y = Math.random() * canvas!.height * 0.5;
    const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * 3 + 1;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life: 100,
        color,
      });
    }
  }
  function draw() {
    if (!ctx || !canvas) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
    if (Math.random() < 0.05) createFirework();
    requestAnimationFrame(draw);
  }
  draw();
}

onUnmounted(() => {
  if (intervalHati) clearInterval(intervalHati);
  if (scrollInterval) clearInterval(scrollInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  if (mainContainer.value) {
    const hearts = mainContainer.value.querySelectorAll(".hati-fall");
    hearts.forEach((el) => el.remove());
  }

  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped src="./style.css"></style>
