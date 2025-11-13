<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";
import giaybohoaUrl from "./images/giaybohoa.png?url";
import nenUrl from "./images/nen.jpg?url";


const { contextData } = useTemplateData(TEMPLATE_CONFIG);


const open = ref(false);            
const envVisible = ref(false);      
const envelopeOpen = ref(false);    
const envReady = ref(false);        

const bowRef = ref<HTMLElement | null>(null);
const bowY = ref(620);


const STEM_GROW = 1500;   
const BLOOM_DELAY = 2000; 
const EXTRA_WAIT = 400;   
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
const PULL_MAX = 220; 
const pullProgress = computed(() => Math.min(Math.max(pullPx.value / PULL_MAX, 0), 1));
const easedPull = computed(() => Math.pow(pullProgress.value, 1.6)); // easing mở nắp

function completeOpen() {
  if (envelopeOpen.value) return;
  envelopeOpen.value = true;
  setTimeout(() => (open.value = true), 800);
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
  <div class="min-h-screen w-full relative overflow-hidden text-gray-900 bg-[#faf6ef]">
    
    <div class="absolute inset-0 z-0 bg-center bg-cover" :style="{ backgroundImage: `url(${nenUrl})` }"></div>

    
    <div class="relative z-10 pt-10 md:pt-14 text-center select-none">
      <h1 class="font-semibold tracking-wide text-2xl md:text-3xl text-violet-700">
        Chúc Mừng Ngày Nhà Giáo 20-11
      </h1>
      <p class="mt-2 text-violet-700/70 text-sm">Tri ân thầy cô – người lái đò thầm lặng</p>
    </div>

    <!-- lớp hoa  -->
    <div
      class="relative z-10 mx-auto mt-[-110px] md:mt-[-40px] w-[min(92vw,480px)] scale-80 md:scale-95"
      ref="bowRef"
      style="transform-origin: center top;"
    >
      <!-- giấy bó hoa của t -->
      <svg viewBox="0 0 440 540" class="w-full h-auto overflow-visible relative z-0" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(220,475)" pointer-events="none">
          <image
            :href="giaybohoaUrl"
            x="-190" y="-300" width="380" height="420"
            preserveAspectRatio="xMidYMid meet"
            style="filter: drop-shadow(0 10px 40px rgba(123,31,162,.22)); opacity:.98"
          />
        </g>
      </svg>

      <!-- Thân + Hoa  -->
      <svg viewBox="0 0 440 540" class="w-full h-auto overflow-visible absolute inset-0 z-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3a8f46"/><stop offset="100%" stop-color="#1f5b2c"/>
          </linearGradient>
          <linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#facc15"/><stop offset="100%" stop-color="#eab308"/>
          </linearGradient>
          <linearGradient id="centerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#7c3f12"/><stop offset="100%" stop-color="#4a1f07"/>
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
            <!-- Thân -->
            <path
              :d="`M 0,0 C ${s.c1},-46 ${s.c2},-125 ${s.dx},${s.topY}`"
              stroke="url(#stemGrad)" stroke-width="6" stroke-linecap="round"
              vector-effect="non-scaling-stroke" fill="none"
              class="stem-path anim-stem--grow"
            />
            <!-- Hoa -->
            <g :transform="`translate(${s.dx},${s.topY}) rotate(${s.rot}) scale(${s.scale})`">
              <g class="flower-anim--bloom">
                <g class="spin-slow">
                  <g v-for="n in 12" :key="n" :transform="`rotate(${n*30}) translate(0,-24)`">
                    <ellipse cx="0" cy="0" rx="9" ry="18"
                             fill="url(#petalGrad)" stroke="#eab308" stroke-width=".5" opacity=".98"/>
                  </g>
                </g>
                <circle r="10" fill="url(#centerGrad)" stroke="#78350f" stroke-width="1.4"/>
                <circle r="3.5" fill="#facc15" opacity=".55"/>
              </g>
            </g>
          </g>
        </g>
      </svg>

      <!-- bao thư  -->
      <div
        v-show="envVisible"
        class="envpull absolute z-50 env-theme-cream"
        :class="{ opened: envelopeOpen, 'env--pulse': envReady && !envelopeOpen }"
        :style="{ top: bowY + 'px', '--pull': easedPull.toString(), '--env-delay': `${ENVELOPE_DELAY}ms` }"
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
              :style="{ transform: `translateX(${pullPx}px) translateY(-50%)` }"
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

    <!-- MODAL -->
    <div v-if="open" class="fixed inset-0 z-[100]">
      <!-- Backdrop -->
      <div class="absolute inset-0 modal-backdrop"></div>

      <!-- Container -->
      <div class="relative h-full w-full flex items-center justify-center p-4">
        <div class="modal-shell animate-pop">
          <div class="modal-frame">
            <div class="ribbon"></div>

            <div class="paper">
              <!-- Header -->
              <div class="paper-head">
                <h2 class="paper-title">
                  Gửi {{ contextData?.content?.[0] || "Thầy/Cô" }} kính mến,
                </h2>
                <span class="badge-date">20/11</span>
              </div>

              <!-- img -->
              <div v-if="(contextData?.images?.length || 0) > 0" class="paper-photo">
                <img :src="contextData!.images![0]" alt="Ảnh gửi thầy/cô" />
              </div>

              <!-- context -->
              <div class="paper-body">
                {{ contextData?.content?.[1] || "Chúc Thầy/Cô luôn mạnh khỏe, hạnh phúc và tràn đầy nhiệt huyết với sự nghiệp trồng người!" }}
              </div>

              <!-- signature -->
              <div class="paper-sign">
                <div class="sign-label">Kính gửi</div>
                <div class="sign-name signature-font">
                  {{ contextData?.content?.[2] || "Trân trọng" }}
                </div>
              </div>

              <!-- Footer -->
              <div class="paper-actions">
                <button class="btn-primary" @click="open=false">Đóng thư</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer nhỏ -->
    <div class="absolute bottom-3 w-full text-center text-xs text-gray-700 z-10">
      Made with ❤️ • 20/11
    </div>
  </div>
</template>

<style scoped>
/* ---------- Fonts ---------- */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Merriweather:wght@700&family=Dancing+Script:wght@600&display=swap');
.signature-font{ font-family:"Dancing Script", cursive; }

/* ---------- Hiệu ứng hoa ---------- */
.anim-seed { animation: seedPop .35s ease-out both; }
@keyframes seedPop { 0%{transform:scale(0);opacity:0}70%{transform:scale(1.2);opacity:1}100%{transform:scale(1)} }
.stem-path { stroke-dasharray: 600; stroke-dashoffset: 600; }
.anim-stem--grow { animation: growUp 1.5s ease-out var(--sd, 0s) both; }
@keyframes growUp { 0%{stroke-dashoffset:600;opacity:0} 40%{opacity:1} 100%{stroke-dashoffset:0;opacity:1} }
.flower-anim--bloom { transform-box: fill-box; transform-origin: center; animation: bloomFlower 1.2s ease-out var(--fd, 2s) both; }
@keyframes bloomFlower { 0%{transform:scale(0);opacity:0} 55%{transform:scale(1.18)} 100%{transform:scale(1);opacity:1} }
.spin-slow { animation: spinSun 18s linear infinite; }
@keyframes spinSun { from{transform:rotate(0)} to{transform:rotate(360deg)} }

/* ---------- ENVELOPE – PULL STRING ---------- */
.envpull{
  --top:#fff7ea; --bot:#fde6c7; --flap:#ffd9a8; --ribbon:#d946ef;
  --w: 300px; --h: 188px; --r: 16px;
  --pull: 0;

  left:50%; transform:translateX(-50%);
  opacity:0; animation: envIn .9s ease-out both var(--env-delay, .1s);
  width:max-content; user-select:none; touch-action:none;
}
@keyframes envIn{0%{transform:translate(-50%,18px) scale(.96);opacity:0}70%{transform:translate(-50%,-6px) scale(1.05);opacity:1}100%{transform:translate(-50%,0) scale(1);opacity:1}}
.env--pulse{ animation: envIn .9s ease-out both var(--env-delay, .1s), envPulse 2.4s ease-in-out calc(var(--env-delay, .1s) + .9s) infinite; }
@keyframes envPulse{0%,100%{transform:translate(-50%,0) scale(1)}40%{transform:translate(-50%,0) scale(1.03)}}

.envp-wrap{ position:relative; width:var(--w); height:var(--h); filter:drop-shadow(0 12px 26px rgba(0,0,0,.35)); perspective:900px; }
.envp-shadow{ position:absolute; inset:auto 0 -14px 0; height:20px; border-radius:50%; background:radial-gradient(60% 60% at 50% 50%, rgba(0,0,0,.26), transparent 70%); }

.envp-body{
  position:absolute; inset:0; border-radius:var(--r);
  background: linear-gradient(180deg,var(--top),var(--bot));
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.55);
  z-index:2;
}
.envp-flap{
  position:absolute; left:0; right:0; top:0; height:53%;
  transform-origin:50% 0; z-index:5;
  transform: rotateX(calc(-160deg * var(--pull)));
  transition: transform .0s linear;
}
.envp-flap::before{
  content:""; position:absolute; inset:0;
  background: linear-gradient(180deg, var(--flap), #fca5a5);
  clip-path: polygon(0 0,100% 0,100% 78%,50% 100%,0 78%);
  border-top-left-radius: var(--r); border-top-right-radius: var(--r);
  box-shadow: 0 10px 22px rgba(0,0,0,.18);
}
.envp-ribbon{
  position:absolute; left:10%; right:10%; top:52%; height:24px; transform:translateY(-50%);
  background: linear-gradient(90deg,#f472b6,var(--ribbon)); border-radius:14px; z-index:4;
}

/* giấy trượt theo pull */
.envp-paper{
  position:absolute; left:50%; bottom:18px; width:82%; height:56%;
  transform: translate(-50%, calc(-72% * var(--pull)));
  background:
    linear-gradient(180deg,#fff,#fffdf8 60%,#fff),
    repeating-linear-gradient(to bottom, rgba(2,132,199,.15) 0 1px, transparent 1px 26px);
  border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,.18);
  opacity: calc(.15 + .85 * var(--pull));
  overflow:hidden; z-index:3; transition: opacity .15s linear;
}
.envp-lines{ position:absolute; inset:0; pointer-events:none; }
.envp-mark{ position:absolute; right:10px; top:6px; color:#64748b; font-size:13px; }

/* dây kéo + tay nắm */
.envp-string{
  position:absolute; left: calc(10% + 8px); right: calc(10% + 8px); top: 58%;
  height: 18px; transform: translateY(-50%); z-index:6;
  background:
    linear-gradient(90deg, rgba(255,255,255,.7), rgba(255,255,255,.7)) 0 50% /
    calc((var(--w) - 2*(10% + 8px)) * var(--pull)) 2px no-repeat;
}
.envp-handle{
  position:absolute; left:0; top:50%;
  width:42px; height:28px; border-radius:999px;
  background:#fff; box-shadow:0 8px 18px rgba(0,0,0,.22), inset 0 0 0 1px rgba(0,0,0,.06);
  display:grid; place-items:center; cursor:ew-resize; touch-action: none;
}
.envp-handle .dot{ font-size:14px; color:#8b5cf6; transform: translateY(-1px); }
.envpull.opened{ --pull: 1; }
.envp-hint{ position:absolute; left:50%; transform:translateX(-50%); bottom:-26px; color:rgba(0,0,0,.75); font-size:.9rem; }

/* ---------- Modal ---------- */
:host, .paper { font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto; }

.modal-backdrop{
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(76,29,149,.25), transparent 60%),
    linear-gradient(180deg, rgba(2,6,23,.75), rgba(2,6,23,.85));
  position: absolute; inset: 0;
}
.modal-backdrop::after{
  content:""; position:absolute; inset:0; pointer-events:none;
  opacity:.12;
  background-image:
    radial-gradient(rgba(255,255,255,.35) 1px, transparent 1.5px),
    radial-gradient(rgba(255,255,255,.25) .5px, transparent 1px);
  background-size: 28px 28px, 16px 16px;
  background-position: 0 0, 6px 8px;
}

.modal-shell{ width: min(920px, 100%); padding: 12px; }
.modal-frame{
  position: relative;
  background: linear-gradient(180deg, rgba(109,40,217,.14), rgba(109,40,217,.06));
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0,0,0,.45), inset 0 0 0 1px rgba(109,40,217,.2);
  padding: 12px;
}
.ribbon{
  position: absolute; left: 22px; right: 22px; top: 16px; height: 10px;
  background: linear-gradient(90deg, #f0abfc, #a78bfa);
  border-radius: 999px;
  filter: blur(.2px);
  opacity: .9;
}

.paper{
  position: relative; z-index: 1;
  background:
    linear-gradient(180deg, #fff, #fffdf8 65%, #fff),
    repeating-linear-gradient(to bottom, rgba(2,132,199,.08) 0 1px, transparent 1px 28px);
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(0,0,0,.18), inset 0 0 0 1px rgba(0,0,0,.03);
  padding: 20px 18px 16px;
  color: #111827;
}
.paper-head{
  display:flex; align-items:center; justify-content:space-between; gap: 10px;
  padding: 4px 2px 10px 2px;
}
.paper-title{
  font-family: "Merriweather", ui-serif, Georgia, "Times New Roman", serif;
  font-weight: 700;
  font-size: clamp(18px, 2.1vw, 22px);
  color: #1f2937;
  line-height: 1.25;
}
.badge-date{
  font-size: 12px;
  background: #ede9fe; color: #6d28d9;
  padding: 6px 10px; border-radius: 8px; letter-spacing: .08em;
  border: 1px dashed rgba(109,40,217,.35);
  white-space: nowrap;
}
.paper-photo{
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 10px 24px rgba(0,0,0,.12);
  background:#fff; margin: 0 0 14px 0;
}
.paper-photo img{
  display:block; width:100%; height:auto; object-fit:cover;
  max-height: 460px;
}
.paper-body{
  white-space: pre-wrap;
  font-size: clamp(15px, 2.05vw, 18px);
  line-height: 1.9;
  color: #1f2937;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.03);
}
.paper-sign{
  text-align: right; margin-top: 12px;
  background:#fff; border-radius: 12px; padding: 14px 16px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.03);
}
.sign-label{ color:#6b7280; font-size:.96rem; }
.sign-name{ font-size: clamp(26px, 3.2vw, 36px); color:#1f2937; }

.paper-actions{
  display:flex; justify-content:flex-end; gap:10px;
  padding-top: 12px;
}
.btn-primary{
  background: linear-gradient(180deg, #7c3aed, #6d28d9);
  color:#fff; padding:10px 16px; border-radius:12px;
  box-shadow: 0 8px 18px rgba(109,40,217,.35);
  transition: transform .15s ease, filter .15s ease;
}
.btn-primary:hover{ transform: translateY(-1px); filter: brightness(1.05); }

/* hiệu ứng vào modal */
@keyframes pop { 0%{ transform: scale(.96); opacity:0 } 100%{ transform: scale(1); opacity:1 } }
.animate-pop { animation: pop .2s ease-out both; }

/* mobile nhỏ */
@media (max-width: 380px){
  .envpull{ --w: 264px; --h: 168px; }
  .modal-frame{ padding: 10px; border-radius: 18px; }
  .paper{ padding: 16px 12px 12px; }
  .paper-photo img{ max-height: 320px; }
}
</style>
