<template>
  <div v-if="contextData">
    <audio
      ref="audioPlayer"
      :src="contextData.audios?.[0] || 'sangelbaby3.mp3'"
      id="linkmp3"
    ></audio>

    <div
      ref="backgroundOverlay"
      class="background-overlay"
      :data-src="
        contextData.images?.[0] ||
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhsOhJrSDLjYoVvzWl_1aZtqnw-Xgd6yALV-5OK0AxYHhkTB_BttocjSoNya_XxaC-CPPl1C1OrvABOaSHLzWaYs4GKxUe9UWr3dH4xpI09cEOKMYrYCx813XimY0sHH1hdgz41_Z4xWhcdJK2qeIyX8QBvjrf5x-0ZJqeghO3ZyRNomQzSrvScel8GQO7Z/s1600/1000359042.jpg'
      "
    ></div>

    <div id="hal1" ref="hal1" class="kotak">
      <div id="stiker1" ref="stiker1" class="stiker">
        <img :src="contextData.images?.[1] || './assets/pusn3.gif'" />
      </div>
      <p style="font-size: 18px; font-weight: 700">
        {{ contextData.content?.[0] || "Hello You! 💐" }}
      </p>
      <div class="tombol">
        <button @click="pindahHal(2)">Start</button>
      </div>
    </div>

    <div id="hal2" ref="hal2" class="sembunyi">
      <div class="envlope-wrapper">
        <div id="envelope" ref="envelope" class="close">
          <div class="front flap"></div>
          <div class="front pocket"></div>
          <div class="letter">
            <div class="letter-corner corner-tl"></div>
            <div class="letter-corner corner-br"></div>
            <div class="message">
              <p>{{ contextData.content?.[0] || "Hello You! 💐" }}</p>
            </div>
          </div>
          <div class="hearts">
            <div class="heart a1"></div>
            <div class="heart a2"></div>
            <div class="heart a3"></div>
          </div>
          <div class="sparkles">
            <div class="sparkle s1"></div>
            <div class="sparkle s2"></div>
            <div class="sparkle s3"></div>
          </div>
        </div>
      </div>
      <div class="reset">
        <button @click="bukaEnvelope()">Open</button>
      </div>
    </div>

    <div id="hal3" ref="hal3" class="kotak sembunyi">
      <canvas id="fireworks-canvas" ref="fireworksCanvas"></canvas>
      <canvas id="game-canvas" ref="gameCanvas"></canvas>
      <div id="stiker3" ref="stiker3" class="stiker">
        <img
          id="stiker3a"
          ref="stiker3a"
          :src="contextData.images?.[2] || './assets/pusn.gif'"
        />
        <img
          id="stiker3b"
          ref="stiker3b"
          class="sembunyi"
          :src="contextData.images?.[3] || './assets/panah.gif'"
        />
        <img
          id="stiker3c"
          ref="stiker3c"
          class="sembunyi"
          :src="contextData.images?.[4] || './assets/muah.gif'"
        />
      </div>
      <div class="textOverlay" ref="textOverlay">
        <p id="teksAwalan" ref="teksAwalan"></p>
        <p id="teksCinta" ref="teksCinta"></p>
        <p id="pesanAkhir" ref="pesanAkhir"></p>
      </div>
      <button id="tombolLanjut" ref="tombolLanjut" @click="nextHal3()">
        LesssGo
      </button>
    </div>
    <div class="tombol" ref="tombol"></div>

    <span id="teksSembunyi1" ref="teksSembunyi1">Eh, I mean right</span>
    <span id="teksSembunyi2" ref="teksSembunyi2"
      ><b>I love u</b> more darling 🫶</span
    >
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import config from "./love-more-v2.config";
import TypeIt from "typeit";

// Lấy dữ liệu
const { contextData } = useTemplateData(config);

// --- Khai báo tất cả các Template Refs ---
const audioPlayer = ref<HTMLAudioElement | null>(null);
const backgroundOverlay = ref<HTMLElement | null>(null);
const hal1 = ref<HTMLElement | null>(null);
const stiker1 = ref<HTMLElement | null>(null);
const hal2 = ref<HTMLElement | null>(null);
const envelope = ref<HTMLElement | null>(null);
const hal3 = ref<HTMLElement | null>(null);
const fireworksCanvas = ref<HTMLCanvasElement | null>(null);
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const stiker3 = ref<HTMLElement | null>(null);
const stiker3a = ref<HTMLImageElement | null>(null);
const stiker3b = ref<HTMLImageElement | null>(null);
const stiker3c = ref<HTMLImageElement | null>(null);
const textOverlay = ref<HTMLElement | null>(null);
const teksAwalan = ref<HTMLElement | null>(null);
const teksCinta = ref<HTMLElement | null>(null);
const pesanAkhir = ref<HTMLElement | null>(null);
const tombolLanjut = ref<HTMLElement | null>(null);
const tombol = ref<HTMLElement | null>(null);
const teksSembunyi1 = ref<HTMLElement | null>(null);
const teksSembunyi2 = ref<HTMLElement | null>(null);

// Biến toàn cục từ script gốc
let animationFrameId: number | null = null;
// SỬA 1: Dùng kiểu dữ liệu chính xác cho setInterval
let intervalHati: ReturnType<typeof setInterval> | undefined;
let scrollInterval: ReturnType<typeof setInterval> | undefined;

// --- TẤT CẢ CÁC HÀM LOGIC ĐƯỢC CHUYỂN RA ĐÂY ---

// SỬA 2: Sửa lỗi canvas/ctx
function mulaiKelopak(canvasId: string) {
  const canvas = canvasId === "game-canvas" ? gameCanvas.value : null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const kelopak = Array.from({ length: 20 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 5 + 2,
    speed: Math.random() * 2 + 1,
  }));

  // SỬA: Truyền ctx và canvas làm tham số để TypeScript hiểu
  function gambarKelopak(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    kelopak.forEach((petal) => {
      ctx.beginPath();
      ctx.arc(petal.x, petal.y, petal.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#f87171";
      ctx.fill();
      petal.y += petal.speed;
      if (petal.y > canvas.height) petal.y = -petal.radius;
      petal.x += Math.sin(petal.y / 50) * 2;
    });
    // SỬA: Truyền lại tham số khi gọi frame tiếp theo
    animationFrameId = requestAnimationFrame(() => gambarKelopak(ctx, canvas));
  }
  // SỬA: Truyền tham số lần đầu
  gambarKelopak(ctx, canvas);
}

function hatiJatuh() {
  const hati = document.createElement("div");
  hati.className = "hati";
  hati.innerHTML = `<svg class='line' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><g transform='translate(2.550170, 3.550158)'><path d='M0.371729633,8.89614246 C-0.701270367,5.54614246 0.553729633,1.38114246 4.07072963,0.249142462 C5.92072963,-0.347857538 8.20372963,0.150142462 9.50072963,1.93914246 C10.7237296,0.0841424625 13.0727296,-0.343857538 14.9207296,0.249142462 C18.4367296,1.38114246 19.6987296,5.54614246 18.6267296,8.89614246 C16.9567296,14.2061425 11.1297296,16.9721425 9.50072963,16.9721425 C7.87272963,16.9721425 2.09772963,14.2681425 0.371729633,8.89614246 Z'></path><path d='M13.23843,4.013842 C14.44543,4.137842 15.20043,5.094842 15.15543,6.435842'></path></g></svg>`;
  hati.style.left = Math.random() * 100 + "vw";
  hati.addEventListener("animationend", () => hati.remove());
  document.body.appendChild(hati);
}

function bukaEnvelope() {
  if (audioPlayer.value) {
    audioPlayer.value.play();
  }
  const env = envelope.value;
  if (!env) return;
  env.classList.remove("close");
  env.classList.add("open");
  const resetBtn = env.closest("#hal2")?.querySelector(".reset");
  if (resetBtn) {
    (resetBtn as HTMLElement).style.transform = "scale(0)";
    (resetBtn as HTMLElement).style.opacity = "0";
    (resetBtn as HTMLElement).style.transition = "all .7s ease";
  }
  setTimeout(() => {
    env.style.transform = "scale(0)";
    env.style.opacity = "0";
    env.style.transition = "all .7s ease";
    setTimeout(() => {
      pindahHal(3);
      env.classList.remove("open");
      env.classList.add("close");
    }, 600);
  }, 1200);
}

// SỬA 2: Sửa lỗi canvas/ctx
function mulaiKembangApi(canvasId: string) {
  const canvas = canvasId === "fireworks-canvas" ? fireworksCanvas.value : null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fireworks: any[] = [];
  const colors = ["#ff6f91", "#ffd1dc", "#ffffff", "#f87171"];

  // SỬA: Thêm tham số (canvas: HTMLCanvasElement)
  function createFirework(canvas: HTMLCanvasElement) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const particles: any[] = [];

    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1,
        color: color,
        life: 100,
        alpha: 1,
      });
    }
    fireworks.push({ particles });
  }

  let lastFrameTime = 0;
  const frameInterval = 1000 / 60;

  function drawFireworks(
    timestamp: number,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    if (timestamp - lastFrameTime < frameInterval) {
      requestAnimationFrame((ts) => drawFireworks(ts, ctx, canvas));
      return;
    }
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworks.forEach((firework, index) => {
      firework.particles.forEach((particle: any) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${parseInt(
          particle.color.slice(1, 3),
          16
        )}, ${parseInt(particle.color.slice(3, 5), 16)}, ${parseInt(
          particle.color.slice(5, 7),
          16
        )}, ${particle.alpha})`;
        ctx.fill();

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05;
        particle.alpha -= 0.01;
        particle.life--;

        if (particle.life <= 0) {
          particle.alpha = 0;
        }
      });

      firework.particles = firework.particles.filter((p: any) => p.life > 0);
      if (firework.particles.length === 0) {
        fireworks.splice(index, 1);
      }
    });

    // SỬA: Truyền (canvas) vào đây
    if (Math.random() < 0.065) createFirework(canvas);
    requestAnimationFrame((ts) => drawFireworks(ts, ctx, canvas));
  }
  requestAnimationFrame((ts) => drawFireworks(ts, ctx, canvas));
}
// SỬA 3: Xóa `.text` khỏi contextData.content
function mulaiHal3() {
  if (
    !stiker3.value ||
    !teksAwalan.value ||
    !teksSembunyi1.value ||
    !teksSembunyi2.value ||
    !tombolLanjut.value
  )
    return;

  stiker3.value.style.transform = "scale(1)";

  // SỬA: Bỏ .text
  const txtAwalan =
    contextData.value?.content?.[1] ||
    "<b>Hey you</b>, yes you! 🫵<br><br>Try looking at the top left corner<br>of your phone screen 🫣";
  const speedText = 27;

  // SỬA: Bỏ .text
  const txtSembunyiSatu = contextData.value?.content?.[2] || "Eh, I mean right";
  teksSembunyi1.value.innerHTML = "";
  // SỬA: Bỏ .text
  const txtSembunyiDua =
    contextData.value?.content?.[3] || "<b>I love u</b> more darling 🫶";
  teksSembunyi2.value.innerHTML = "";

  mulaiKelopak("game-canvas");

  new TypeIt(teksAwalan.value, {
    strings: txtAwalan,
    speed: speedText,
    startDelay: 200,
    afterComplete: function (instance: any) {
      instance.element.querySelector(".ti-cursor").style.display = "none";
      setTimeout(() => {
        if (!teksSembunyi1.value) return;
        teksSembunyi1.value.style.opacity = "1";
        new TypeIt(teksSembunyi1.value, {
          strings: txtSembunyiSatu,
          speed: speedText,
          startDelay: 100,
          afterComplete: function (instance1: any) {
            instance1.element.querySelector(".ti-cursor").style.display =
              "none";
            setTimeout(() => {
              if (!teksSembunyi2.value) return;
              teksSembunyi2.value.style.opacity = "1";
              new TypeIt(teksSembunyi2.value, {
                strings: txtSembunyiDua,
                speed: speedText,
                startDelay: 100,
                afterComplete: function (instance2: any) {
                  instance2.element.querySelector(".ti-cursor").style.display =
                    "none";
                  setTimeout(() => {
                    if (tombolLanjut.value) {
                      tombolLanjut.value.style.position = "relative";
                      tombolLanjut.value.style.transform = "scale(1)";
                      tombolLanjut.value.style.opacity = "1";
                    }
                  }, 500);
                },
              }).go();
            }, 700);
          },
        }).go();
      }, 700);
    },
  }).go();
}

function nextHal3() {
  if (
    !hal3.value ||
    !teksSembunyi1.value ||
    !teksSembunyi2.value ||
    !stiker3.value ||
    !tombolLanjut.value ||
    !teksAwalan.value ||
    !stiker3a.value ||
    !stiker3b.value
  )
    return;

  hal3.value.style.transform = "scale(0)";
  teksSembunyi1.value.style.opacity = "0";
  teksSembunyi2.value.style.opacity = "0";
  stiker3.value.style.transform = "scale(0)";

  setTimeout(() => {
    if (tombolLanjut.value) tombolLanjut.value.style.display = "none";
    if (teksAwalan.value) {
      teksAwalan.value.innerHTML = "";
      teksAwalan.value.style.display = "none";
    }
    if (hal3.value) {
      hal3.value.style.transform = "scale(1)";
      hal3.value.style.marginTop = "130px";
    }

    if (stiker3a.value && stiker3b.value) {
      stiker3a.value.src = stiker3b.value.src;
    }
    setTimeout(() => {
      if (stiker3.value) stiker3.value.style.transform = "scale(1)";
      lanjutAkhir();
    }, 200);
  }, 500);
}

// SỬA 3: Xóa `.text` khỏi contextData.content
function lanjutAkhir() {
  // Thêm kiểm tra cho pesanAkhir
  if (
    !teksCinta.value ||
    !pesanAkhir.value ||
    !tombol.value ||
    !stiker3.value ||
    !stiker3a.value ||
    !stiker3c.value
  )
    return;

  // SỬA: Bỏ .text
  const txtDoa =
    contextData.value?.content?.[4] ||
    "Why do I prefer<br><span style='color:pink'>I love you</span> more? 🌹🩷";
  // SỬA: Bỏ .text
  const txtPesanAkhir =
    contextData.value?.content?.[5] ||
    "Because... I love you more than I said,<br>I love you more than you know,<br>I love you more when your<br>day didn't go so well,<br>I love you more when you cried,<br>I love you more at your lowest,<br>and I love you in every situation ᡣ𐭩<br>😍💐🌹💖❤️";
  const speedText = 24;

  new TypeIt(teksCinta.value, {
    strings: txtDoa,
    speed: speedText,
    startDelay: 100,
    afterComplete: function (instance: any) {
      instance.element.querySelector(".ti-cursor").style.display = "none";
      // Đảm bảo pesanAkhir không null trước khi dùng
      if (pesanAkhir.value) {
        new TypeIt(pesanAkhir.value, {
          strings: txtPesanAkhir,
          speed: speedText,
          startDelay: 700,
          waitUntilVisible: true,
          afterComplete: function (instance2: any) {
            instance2.element.querySelector(".ti-cursor").style.display =
              "none";
            intervalHati = setInterval(hatiJatuh, 200);
            if (tombol.value) {
              tombol.value.style.transform = "scale(1)";
              tombol.value.style.opacity = "1";
            }
            setTimeout(() => {
              if (stiker3.value) stiker3.value.style.transform = "scale(0)";
              setTimeout(() => {
                if (stiker3a.value && stiker3c.value)
                  stiker3a.value.src = stiker3c.value.src;
                if (stiker3.value) stiker3.value.style.transform = "scale(1)";
                if (scrollInterval) clearInterval(scrollInterval);
              }, 300);
              if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
              }
              gameCanvas.value?.remove();
            }, 50);
            setTimeout(() => {
              mulaiKembangApi("fireworks-canvas");
            }, 50);
          },
        }).go();
      }
    },
  }).go();
}

// Đây là code đã sửa lỗi canvas (bằng nextTick)
function pindahHal(hal: number) {
  const refs = [hal1, hal2, hal3];

  // SỬA 1: Thêm '?' sau refs[i - 1]
  for (let i = 1; i <= 3; i++) {
    if (hal < 3 && i !== 1) {
      refs[i - 1]?.value?.classList.add("sembunyi");
    }
  }

  // SỬA 2: Thêm '?' sau refs[hal - 1]
  // và thêm kiểm tra (hal > 0) để đảm bảo an toàn 100%
  if (hal > 0 && hal < 3) {
    refs[hal - 1]?.value?.classList.remove("sembunyi");
  }

  setTimeout(() => {
    // SỬA 3: Thêm '?' sau refs[hal - 1]
    const currentHal = refs[hal - 1]?.value;

    // SỬA 4: Thêm '?' sau refs[0] và refs[1] cho nhất quán
    if (hal === 2 && currentHal) {
      const prevHal = refs[0]?.value; // hal-2 = 0
      if (prevHal) {
        prevHal.style.transform = "scale(0)";
        setTimeout(() => {
          prevHal.classList.add("sembunyi");
          currentHal.classList.remove("sembunyi");
          setTimeout(() => {
            currentHal.style.transform = "scale(1)";
            currentHal.style.transition = "all .7s ease";
          }, 100);
        }, 700);
      }
    } else if (hal === 3 && currentHal) {
      const prevHal = refs[1]?.value; // hal-2 = 1
      if (prevHal) {
        prevHal.style.transform = "scale(0)";
        prevHal.style.transition = "all .7s ease";

        setTimeout(() => {
          prevHal.classList.add("sembunyi");
          currentHal.classList.remove("sembunyi");

          nextTick(() => {
            setTimeout(() => {
              currentHal.style.transform = "scale(1)";
              currentHal.style.transition = "all .7s ease";
            }, 100);

            setTimeout(() => {
              mulaiHal3();
            }, 150);
          });
        }, 50);
      }
    }
  }, 50);
}

function autoScroll() {
  if (textOverlay.value) {
    textOverlay.value.scrollTop += 10;
  }
}

// --- Logic chạy khi dữ liệu đã sẵn sàng ---
watch(
  contextData,
  (newData) => {
    if (newData) {
      // Đợi DOM được cập nhật với dữ liệu mới (do v-if="contextData")
      nextTick(() => {
        // --- Khởi tạo và Gán dữ liệu ---
        const bgOverlay = backgroundOverlay.value;
        if (bgOverlay) {
          const bgImageUrl = bgOverlay.getAttribute("data-src");
          if (bgImageUrl) {
            bgOverlay.style.background = `url('${bgImageUrl}') no-repeat center center fixed`;
            bgOverlay.style.backgroundSize = "cover";
          }
        }

        // --- BẮT ĐẦU CÁC LOGIC KHỞI TẠO ---
        scrollInterval = setInterval(autoScroll, 50);

        // --- Logic khởi tạo ban đầu (từ cuối script gốc) ---
        if (hal1.value) hal1.value.style.transform = "scale(0)";

        setTimeout(() => {
          if (hal1.value) hal1.value.style.transform = "scale(1)";
          if (stiker1.value) stiker1.value.style.transform = "scale(1)";
        }, 1000);
      });
    }
  },
  { immediate: true } // Thử chạy ngay khi có dữ liệu (kể cả từ cache)
);

onUnmounted(() => {
  // Dọn dẹp interval trái tim rơi
  if (intervalHati) clearInterval(intervalHati);

  // Dọn dẹp interval tự cuộn
  if (scrollInterval) clearInterval(scrollInterval);

  // Dừng mọi animation frame
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // Remove tất cả các element rơi / heart / sparkle
  document
    .querySelectorAll(".hati, .heart, .sparkle")
    .forEach((el) => el.remove());

  // Nếu có container tạm cho heart, reset luôn innerHTML
  const heartsContainer = document.querySelector(".hearts");
  if (heartsContainer) heartsContainer.innerHTML = "";
});
</script>

<style>
/* QUAN TRỌNG: Khối style này không có chữ "scoped"
    vì nó cần áp dụng cho các element .hati được thêm vào document.body
  */

.hati {
  position: fixed;
  top: -10vh; /* Bắt đầu bên trên màn hình */
  font-size: 1.5rem; /* Kích thước trái tim (bạn có thể chỉnh to nhỏ) */
  z-index: 9999; /* Luôn nằm trên cùng */
  animation: hati-fall 4s linear forwards;
  pointer-events: none; /* Không cho phép click vào */
}

.hati svg.line {
  width: 1em;
  height: 1em;
  color: #ff6699; /* Màu hồng */
  opacity: 0.8;
}

/* Định nghĩa màu cho hình SVG (quan trọng) */
.hati svg.line path {
  fill: #ff6699;
  stroke: #ff6699;
}

/* Định nghĩa hiệu ứng rơi */
@keyframes hati-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    /* Rơi xuống 110% chiều cao màn hình (để đảm bảo đi ra khỏi màn hình) */
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
  }
}
</style>

<style scoped>
/* KHỐI 2: CSS CỤC BỘ (Scoped)
    (Có 'scoped')
    Tất cả các style còn lại DÀNH RIÊNG
    cho component này.
  */
:root {
  --color-heart: #ff6699;
  --color-flap: #ff88aa;
  --color-env: #ffb6c1;
  --color-env2: #ff99cc;
  --color-sparkle: #ffe4e1;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  opacity: 0.3;
  z-index: 0;
}
.kotak {
  margin: 0 auto;
  margin-top: 150px;
  transform: scale(0);
  transition: all 0.7s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  text-align: center;
  max-width: 80%;
  width: 400px;
  min-height: 200px;
  position: relative;
  z-index: 1;
}
#hal1.kotak {
  transform: scale(1);
}
#hal2 {
  transform: scale(0);
  transition: all 0.7s ease;
  position: relative;
  z-index: 1;
}
#envelope {
  margin: 0 auto;
  margin-top: 150px;
  position: relative;
  width: 160px;
  height: 110px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  top: 160px;
  background-color: var(--color-flap);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.front {
  position: absolute;
  width: 0;
  height: 0;
  z-index: 3;
}
.flap {
  border-left: 80px solid transparent;
  border-right: 80px solid transparent;
  border-bottom: 55px solid transparent;
  border-top: 55px solid var(--color-flap);
  transform-origin: top;
  pointer-events: none;
}
.pocket {
  border-left: 80px solid var(--color-env);
  border-right: 8px solid var(--color-env);
  border-bottom: 55px solid var(--color-env2);
  border-top: 55px solid transparent;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
.letter {
  position: relative;
  background-color: #e0d9dd;
  width: 90%;
  margin: 0 auto;
  height: 100%;
  top: 0%;
  border-radius: 6px;
  box-shadow: 0 2px 26px rgba(0, 0, 0, 0.08);
  padding: 15px;
  box-sizing: border-box;
}
.letter:after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 25%,
    rgba(255, 231, 236, 0.7) 55%,
    rgba(255, 231, 236, 1) 100%
  );
}
.message {
  position: relative;
  z-index: 2;
  font-family: "Handlee", cursive;
  color: #d46a84;
  text-align: center;
  line-height: 1;
  padding-top: 0;
}
.message p {
  margin: 10px 0;
  font-size: 1.4em;
  font-weight: 700;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}
.envlope-wrapper {
  height: 210px;
  margin-top: -50px;
}
.open .flap {
  transform: rotateX(180deg);
  transition: transform 0.4s ease, z-index 0.6s;
  z-index: 1;
}
.close .flap {
  transform: rotateX(0deg);
  transition: transform 0.4s 0.6s ease, z-index 1s;
  z-index: 5;
}
.close .letter {
  transform: translateY(0);
  transition: transform 0.4s ease, z-index 1s;
  z-index: 1;
}
.open .letter {
  transform: translateY(-40px) rotate(-2.5deg);
  transition: transform 0.4s 0.2s ease, z-index 0.6s;
  z-index: 2;
}
.letter-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1px solid #ffd1dc;
  border-radius: 2.5px;
  z-index: 3;
}
.corner-tl {
  top: 5px;
  left: 5px;
  border-right: none;
  border-bottom: none;
}
.corner-br {
  bottom: 5px;
  right: 5px;
  border-left: none;
  border-top: none;
}
.hearts,
.sparkles {
  position: absolute;
  top: 55px;
  left: 0;
  right: 0;
  z-index: 2;
}
.heart,
.sparkle {
  position: absolute;
  bottom: 0;
  pointer-events: none;
}
.heart:before,
.heart:after {
  content: "";
  position: absolute;
  left: 12.5px;
  top: 0;
  width: 12.5px;
  height: 25px;
  background: var(--color-heart, #ff6699);
  border-radius: 12.5px 12.5px 0 0;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
}
.heart:after {
  left: 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
}
.sparkle {
  width: 4px;
  height: 4px;
  background: var(--color-sparkle);
  border-radius: 50%;
  animation: sparkleTwinkle 1s infinite;
}
.close .heart,
.close .sparkle {
  opacity: 0;
  animation: none;
}
.a1 {
  left: 20%;
  transform: scale(0.6);
  animation: slideUp 4s linear infinite,
    sideSway 2s ease-in-out infinite alternate;
}
.a2 {
  left: 55%;
  animation: slideUp 5s linear infinite,
    sideSway 4s ease-in-out infinite alternate;
}
.a3 {
  left: 10%;
  transform: scale(0.8);
  animation: slideUp 7s linear infinite,
    sideSway 2s ease-in-out infinite alternate;
}
.s1 {
  left: 30%;
  animation: sparkleUp 3s linear infinite;
}
.s2 {
  left: 60%;
  animation: sparkleUp 4s linear infinite;
}
.s3 {
  left: 45%;
  animation: sparkleUp 5s linear infinite;
}
@keyframes slideUp {
  0% {
    top: 0;
  }
  100% {
    top: -600px;
  }
}
@keyframes sideSway {
  0% {
    margin-left: 0;
  }
  50% {
    margin-left: 50px;
  }
  100% {
    margin-left: 0;
  }
}
@keyframes sparkleUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-500px) rotate(360deg);
    opacity: 0;
  }
}
@keyframes sparkleTwinkle {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
}
.reset,
.tombol {
  position: relative;
  text-align: center;
  margin-top: 57px;
  z-index: 5;
}
.reset button,
.tombol button {
  font-family: "Sriracha", serif;
  font-weight: 600;
  transition: all 0.3s ease;
  background-color: var(--color-flap);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  color: #fff;
  text-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);
  padding: 6px 14px;
  margin: 10px;
  font-size: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}
.reset button:hover,
.tombol button:hover,
button:hover {
  background-color: var(--color-env2);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.2);
}
.tombol {
  transform: scale(0);
  opacity: 0;
  transition: all 0.7s ease;
}
#hal1 .tombol,
#hal3 .tombol {
  transform: scale(1);
  opacity: 1;
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.pic {
  font-size: 3rem;
  margin-bottom: 1rem;
}
h1,
h2 {
  font-size: 18px;
  margin-bottom: 1rem;
  font-weight: 700;
}
.textOverlay {
  position: relative;
  margin: auto;
  width: 100%;
  min-height: 20px;
  max-height: 250px;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
#teksCinta {
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}
#teksLucu {
  font-size: 16px;
  color: #fff;
  margin-top: 1rem;
  font-weight: 500;
}
p {
  font-size: 16px;
  margin-bottom: 1rem;
  font-weight: 500;
}
#statusGame {
  margin-top: 25px;
}
button {
  font-family: "Sriracha", serif;
  font-weight: 600;
  transition: all 0.3s ease;
  background-color: var(--color-flap);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  color: #fff;
  text-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);
  padding: 2px 10px;
  margin: 10px;
  font-size: 14px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}
#tombolLanjut {
  position: absolute;
  transform: scale(0);
  opacity: 0;
  transition: all 0.7s ease;
}
#hal1 .tombol button,
#hal3 .tombol button {
  font-size: 0.9em;
}
.tombolCadangan {
  background: #6b7280;
}
.tombolCadangan:hover {
  background: #4b5563;
}
.papanGame {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 0.5rem;
  justify-items: center;
  width: 90%;
  max-width: 600px;
  margin: auto;
}
.kartu {
  width: 50px;
  height: 50px;
}
.dalemKartu {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.kartu.balik .dalemKartu {
  transform: rotateY(180deg);
}
.depanKartu,
.belakangKartu {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}
.depanKartu {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}
.belakangKartu {
  background: rgba(255, 255, 255, 0.5);
  transform: rotateY(180deg);
  font-size: 1.5rem;
}
.sembunyi {
  display: none;
}
.stiker {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
  transform: scale(0);
  transition: all 0.7s ease;
}
.stiker img {
  width: 100px;
  height: 100px;
  box-shadow: 0 4px 30px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.7);
  border: 3px solid rgba(255, 255, 255, 1);
  border-radius: 50%;
  padding: 10px;
}

.wrapper {
  position: fixed;
}

.input-range-container {
  text-align: center;
  padding: 0px 20px;
}
.input-range-container label {
  font-size: 1.2em;
  font-weight: 600;
  margin-top: 15px;
  margin-bottom: 15px;
  display: block;
}
.input-range-container input[type="range"] {
  width: 80%;
  accent-color: var(--color-heart);
  margin-bottom: 20px;
}
.input-range-container output {
  font-size: 1.2em;
  font-weight: 700;
  color: var(--color-heart);
}
.input-range-container input[type="range"] {
  width: 80%;
  accent-color: var(--color-heart);
  margin-bottom: 20px;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: var(--color-heart);
  border: 1.5px solid white;
  border-radius: 5px;
}
.input-range-container input[type="range"]::-webkit-slider-runnable-track {
  height: 8px;
  border: 1px solid white;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
}
.input-range-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-heart);
  border: 1.5px solid white;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -5px;
}
.input-range-container input[type="range"]::-moz-range-track {
  height: 8px;
  border: 1px solid white;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
}
.input-range-container input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--color-heart);
  border: 1px solid white;
  border-radius: 50%;
  cursor: pointer;
}
@media (max-width: 600px) {
  .kotak {
    width: 80%;
    padding: 1rem;
  }
  #envelope {
    width: 120px;
    height: 82.5px;
    top: 100px;
  }
  .flap,
  .pocket {
    border-left-width: 60px;
    border-right-width: 60px;
    border-bottom-width: 41.25px;
    border-top-width: 41.25px;
  }
  .letter {
    padding: 10px;
  }
  .message p {
    font-size: 1.2em;
  }
  .papanGame {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem 0.2rem;
  }
  .kartu {
    width: 40px;
    height: 40px;
  }
  .belakangKartu {
    font-size: 1.2rem;
  }
  .input-range-container label {
    font-size: 18px;
  }
  .input-range-container input[type="range"] {
    width: 90%;
  }
}
#teksSembunyi1 {
  position: fixed;
  top: 50px;
  left: 30px;
  font-size: 15px;
  color: white;
  text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  transition: all 0.7s ease;
}
#teksSembunyi2 {
  position: fixed;
  top: 80px;
  right: 30px;
  font-size: 15px;
  color: white;
  text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  transition: all 0.7s ease;
}
#linkmp3 {
  display: none;
}
</style>
