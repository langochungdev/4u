<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";
import giayHoaUrl from "./images/giay-hoa.png?url";
import nenUrl from "./images/nen.jpg?url";


const { contextData } = useTemplateData(TEMPLATE_CONFIG);


const open = ref(false);            
const envVisible = ref(false);      
const envelopeOpen = ref(false);    
const envReady = ref(false);        

const bowRef = ref<HTMLElement | null>(null);
const bowY = ref(620);


const STEM_GROW = 700;   
const BLOOM_DELAY = 800; 
const EXTRA_WAIT = 100;   
const ENVELOPE_DELAY = STEM_GROW + BLOOM_DELAY + EXTRA_WAIT;


function placeEnvelope() {
  const svg = bowRef.value?.querySelector("svg");
  const h = svg ? (svg as SVGElement).getBoundingClientRect().height : 540;
  bowY.value = Math.round(h * 0.79);
}

onMounted(async () => {
  await nextTick();
  placeEnvelope();
  window.addEventListener("resize", placeEnvelope);

  // Hoa xong mới show phong bì
  setTimeout(() => {
    envVisible.value = true;
    setTimeout(() => (envReady.value = true), 350);
  }, ENVELOPE_DELAY);
});

onUnmounted(() => window.removeEventListener("resize", placeEnvelope));


const pulling = ref(false);
const pullPx = ref(0);
const PULL_MAX = 200; 
const pullProgress = computed(() => Math.min(Math.max(pullPx.value / PULL_MAX, 0), 1));
const easedPull = computed(() => Math.pow(pullProgress.value, 1.6)); // easing mở nắp

function completeOpen() {
  if (envelopeOpen.value) return;
  envelopeOpen.value = true;
  setTimeout(() => (open.value = true), 800);
}
function closeModal() {
  open.value = false;

  // reset phong bì về trạng thái ban đầu
  envelopeOpen.value = false;
  pullPx.value = 0;
  pulling.value = false;

  // cho nó nhịp nhịp lại nếu mày nha hùng muốn
  envReady.value = true;
}


let startX = 0;
function onPullStart(e: PointerEvent) {
  pulling.value = true;
  startX = e.clientX;
  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
}
function onPullMove(e: PointerEvent) {
  if (!pulling.value) return;
  const dx = e.clientX - startX;
  pullPx.value = Math.max(0, dx);
  if (pullPx.value >= PULL_MAX) {
    pulling.value = false;
    completeOpen();
  }
}
function onPullEnd() {
  if (!envelopeOpen.value) pullPx.value = 0;
  pulling.value = false;
}
function openByDoubleClick() { completeOpen(); } // fallback double-click
</script>

<template>
  <!-- Lớp ngoài: full màn hình, canh giữa theo chiều ngang -->
  <div class="min-h-screen w-full flex justify-center bg-[#fce4ec]">
    <!-- Khung "màn hình điện thoại": max-width ~ 480px -->
    <div
      class="relative w-full max-w-[480px] min-h-screen overflow-hidden text-gray-900 bg-[#faf6ef]"
    >
      <!-- Ảnh nền chỉ áp dụng trong khung này -->
      <div
        class="absolute inset-0 z-0 bg-center bg-cover"
        :style="{ backgroundImage: `url(${nenUrl})` }"
      ></div>

      <!-- Tiêu đề -->
      <div class="relative z-10 pt-10 md:pt-14 text-center select-none">
        <h1 class="font-semibold tracking-wide text-2xl md:text-3xl text-violet-700">
          Chúc Mừng Ngày Nhà Giáo 20-11
        </h1>
        <p class="mt-2 text-violet-700/70 text-sm">
          Tri ân thầy cô – người lái đò thầm lặng
        </p>
      </div>

      <!-- Lớp hoa + phong bì (giữ nguyên code cũ của bạn) -->
      <div
        class="relative z-10 mx-auto mt-[-110px] md:mt-[-100px] w-[min(92vw,480px)] scale-80 md:scale-95"
        ref="bowRef"
        style="transform-origin: center top;"
      >
        <!-- giấy bó hoa -->
        <svg
          viewBox="0 0 440 540"
          class="w-full h-auto overflow-visible relative z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(220,475)" pointer-events="none">
            <image
              :href="giayHoaUrl"
              x="-190"
              y="-300"
              width="380"
              height="420"
              preserveAspectRatio="xMidYMid meet"
              style="filter: drop-shadow(0 10px 40px rgba(123,31,162,.22)); opacity:.98"
            />
          </g>
        </svg>

        <!-- Thân + Hoa -->
        <svg
          viewBox="0 0 440 540"
          class="w-full h-auto overflow-visible absolute inset-0 z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- ... phần <defs> + hoa y như code bạn đang có ... -->
          <!-- mình không thay gì ở đây -->
          <defs>
            <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3a8f46" />
              <stop offset="100%" stop-color="#1f5b2c" />
            </linearGradient>
            <linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#facc15" />
              <stop offset="100%" stop-color="#eab308" />
            </linearGradient>
            <linearGradient id="centerGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#7c3f12" />
              <stop offset="100%" stop-color="#4a1f07" />
            </linearGradient>
          </defs>

          <g transform="translate(220,475)" pointer-events="none">
            <circle r="5.5" fill="#198754" class="anim-seed" />
            <g
              v-for="(s, i) in [
                { dx:-85, topY:-200, c1:-26, c2:-70, rot:-12, scale:.86, delay:0.00 },
                { dx:-20, topY:-235, c1:-10, c2:-28, rot: -6, scale:.94, delay:0.15 },
                { dx: 40, topY:-230, c1: 14, c2:  30, rot:  6, scale:.92, delay:0.30 },
                { dx:100, topY:-205, c1: 28, c2:  62, rot: 12, scale:.88, delay:0.45 }
              ]"
              :key="i"
              :style="{ '--sd': `${s.delay}s`, '--fd': `${s.delay + 2.0}s` }"
            >
              <path
                :d="`M 0,0 C ${s.c1},-46 ${s.c2},-125 ${s.dx},${s.topY}`"
                stroke="url(#stemGrad)"
                stroke-width="6"
                stroke-linecap="round"
                vector-effect="non-scaling-stroke"
                fill="none"
                class="stem-path anim-stem--grow"
              />
              <g :transform="`translate(${s.dx},${s.topY}) rotate(${s.rot}) scale(${s.scale})`">
                <g class="flower-anim--bloom">
                  <g class="spin-slow">
                    <g
                      v-for="n in 12"
                      :key="n"
                      :transform="`rotate(${n*30}) translate(0,-24)`"
                    >
                      <ellipse
                        cx="0"
                        cy="0"
                        rx="9"
                        ry="18"
                        fill="url(#petalGrad)"
                        stroke="#eab308"
                        stroke-width=".5"
                        opacity=".98"
                      />
                    </g>
                  </g>
                  <circle
                    r="10"
                    fill="url(#centerGrad)"
                    stroke="#78350f"
                    stroke-width="1.4"
                  />
                  <circle r="3.5" fill="#facc15" opacity=".55" />
                </g>
              </g>
            </g>
          </g>
        </svg>

        <!-- Bao thư kéo dây (y như bạn đang có) -->
        <div
          v-show="envVisible"
          class="envpull absolute z-50 env-theme-cream"
          :class="{ opened: envelopeOpen, 'env--pulse': envReady && !envelopeOpen }"
          :style="{
            top: bowY + 'px',
            '--pull': easedPull.toString(),
            '--env-delay': `${ENVELOPE_DELAY / 1000}s`
          }"
          @dblclick="openByDoubleClick"
        >
          <div class="envp-wrap">
            <div class="envp-shadow"></div>
            <div class="envp-body"></div>
            <div class="envp-flap"></div>
            <div class="envp-ribbon"></div>

            <div class="envp-paper">
              <div class="envp-lines"></div>
              <div class="envp-mark">20·11</div>
            </div>

            <div class="envp-string">
              <div
                class="envp-handle"
                :style="{ transform: `translateX(${pullPx}px) translateY(-85%)` }"
                @pointerdown="onPullStart"
                @pointermove="onPullMove"
                @pointerup="onPullEnd"
                @pointercancel="onPullEnd"
                @pointerleave="onPullEnd"
                title="Kéo sang phải để mở"
              >
                <span class="dot">⟡</span>
              </div>
            </div>
          </div>
          <span v-if="!envelopeOpen" class="envp-hint">Kéo dây để mở thiệp</span>
        </div>
      </div>

      <!-- MODAL (giữ nguyên logic cũ) -->
      <div v-if="open" class="fixed inset-0 z-[100]">
        <div class="absolute inset-0 modal-backdrop"></div>
        <div class="relative h-full w-full flex items-center justify-center p-4">
          <div class="modal-shell animate-pop">
            <div class="modal-frame">
              <div class="ribbon"></div>
              <div class="paper">
                <div class="paper-head">
                  <h2 class="paper-title">
                    Gửi {{ contextData?.content?.[0] || "Thầy/Cô" }} kính mến,
                  </h2>
                  <span class="badge-date">20/11</span>
                </div>

                <div
                  v-if="(contextData?.images?.length || 0) > 0"
                  class="paper-photo"
                >
                  <img :src="contextData!.images![0]" alt="Ảnh gửi thầy/cô" />
                </div>

                <div class="paper-body">
                  {{
                    contextData?.content?.[1] ||
                    "Chúc Thầy/Cô luôn mạnh khỏe, hạnh phúc và tràn đầy nhiệt huyết với sự nghiệp trồng người!"
                  }}
                </div>

                <div class="paper-sign">
                  <div class="sign-label">Kính gửi</div>
                  <div class="sign-name signature-font">
                    {{ contextData?.content?.[2] || "Trân trọng" }}
                  </div>
                </div>

                <div class="paper-actions">
                  <button class="btn-primary" @click="closeModal">Đóng thư</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer nhỏ (nằm trong khung 480px) -->
      <div class="absolute bottom-3 w-full text-center text-xs text-gray-700 z-10">
        Made with ❤️ • 20/11
      </div>
    </div>
  </div>
</template>


<style scoped src="./style.css"></style>

