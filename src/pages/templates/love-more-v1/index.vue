<script setup lang="ts">
import { ref, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./love-more-v1.config";

/* ===== Lấy dữ liệu từ TEMPLATE_CONFIG ===== */
const { contextData } = useTemplateData(TEMPLATE_CONFIG);
const data = computed(() => (contextData as any)?.value ?? contextData ?? {});
const images = computed<string[]>(() => data.value?.images ?? []);
const contentText = computed<string>(() => (data.value?.content?.[0] as string) ?? "");

/* ===== Ảnh hiện tại ===== */
const imgIdx = ref(0);
const imageUrl = computed(() => images.value[imgIdx.value] || "");

/* ===== Câu hỏi & câu từ chối ===== */
const question = "Em làm người yêu anh nhé!";
const noTexts = [
  "Thật sao em?",
  "Em chắc chưa đó?",
  "Đừng làm vậy với anh 😢",
  "Tim anh đang tan vỡ 💔",
  "Anh sắp khóc rồi đó 😭"
] as const;
const noText = ref<string>(noTexts[0]);

/* ===== Đếm từ chối & nút trái ===== */
const rejectCount = ref(0);
const showAccept = computed(() => rejectCount.value >= 4);
const yesScale = ref(1.4);
const leftBtnLabel = computed(() => (showAccept.value ? "Đồng ý" : "Dạ"));

function growYes(step = 0.18) {
  yesScale.value = Math.min(yesScale.value + step, 2.4);
}
function onWrapClick(e: MouseEvent) {
  const el = e.target as HTMLElement;
  if (!el.closest(".yes") && !el.closest(".no")) growYes();
}
function onNoClick() {
  rejectCount.value++;
  noText.value = noTexts[Math.floor(Math.random() * noTexts.length)]!;
  if (images.value.length > 0) imgIdx.value = (imgIdx.value + 1) % images.value.length;
  growYes(0.22);
}

/* ===== Overlay kết quả ngay trên index ===== */
const showResult = ref(false);

/* Kiểu dữ liệu hiệu ứng */
type Drop = {
  text: string; left: number; delay: number; duration: number; size: number;
  color: string; blur: number; rotate: number;
};
type Heart = { left: number; delay: number; duration: number; size: number; };

const drops = ref<Drop[]>([]);
const hearts = ref<Heart[]>([]);
const COLORS = ["#ff9db2", "#8bd3ff", "#ffc0cb"] as const;

function buildResultScene() {
  drops.value = [];
  hearts.value = [];
  const phrase = (contentText.value && contentText.value.trim()) || "Anh yêu em";

  for (let i = 0; i < 30; i++) {
    const c = COLORS[i % COLORS.length] ?? "#ff9db2";
    drops.value.push({
      text: phrase,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 10 + Math.random() * 14,
      size: 16 + Math.random() * 44,
      color: c,
      blur: Math.random() * 1.2,
      rotate: (Math.random() - 0.5) * 16
    });
  }
  for (let i = 0; i < 18; i++) {
    hearts.value.push({
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
      size: 14 + Math.random() * 22
    });
  }
}

function goYes() {
  // bật kết quả ngay trên index
  buildResultScene();
  showResult.value = true;
}
</script>

<template>
  <div class="page" @click="onWrapClick">
    <div class="box" :class="{ blurred: showResult }">
      <!-- ẢNH -->
      <div v-if="images.length" class="img-wrap">
        <img :src="imageUrl" alt="cute" />
      </div>
      <div v-else class="img-fallback">🐾</div>

      <!-- CÂU HỎI -->
      <h1 class="title">{{ question }}</h1>

      <!-- NÚT -->
      <div class="btn-wrap">
        <button class="btn yes"
                :style="{ transform: `scale(${yesScale})` }"
                @click.stop="goYes">
          {{ leftBtnLabel }}
        </button>

        <button v-if="!showAccept"
                class="btn no"
                @click.stop="onNoClick">
          {{ noText }}
        </button>
      </div>
    </div>

    <!-- ===== Overlay KẾT QUẢ (full screen) ===== -->
    <div v-if="showResult" class="stage">
      <div class="stars"></div>
      <div class="stars stars-2"></div>

      <!-- Nhắc nếu thiếu content -->
      <div v-if="!contentText" class="hint">
        Vui lòng nhập <strong>1 dòng nội dung</strong> (content) trong cấu hình để hiện chữ rơi xuống.
      </div>

      <!-- Chữ rơi -->
      <span v-for="(d, i) in drops" :key="'d-'+i" class="drop"
        :style="{
          left: d.left + '%',
          animationDuration: d.duration + 's',
          animationDelay: d.delay + 's',
          fontSize: d.size + 'px',
          color: d.color,
          filter: `blur(${d.blur}px)`,
          transform: `rotate(${d.rotate}deg)`,
          textShadow: '0 0 10px ' + d.color
        }"
      >{{ d.text }}</span>

      <!-- Tim rơi -->
      <span v-for="(h, i) in hearts" :key="'h-'+i" class="heart"
        :style="{
          left: h.left + '%',
          fontSize: h.size + 'px',
          animationDuration: h.duration + 's',
          animationDelay: h.delay + 's'
        }"
      >❤</span>

      <!-- Dòng trung tâm: chính là content[0] -->
      <div class="center" v-if="contentText">{{ contentText }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Khu hỏi */
.page { min-height:100vh; display:grid; place-items:center; background:#fff; }
.box  { width:min(680px,92vw); text-align:center; transition: filter .3s ease; }
.blurred{ filter: blur(2px) brightness(.9); }

.img-wrap{ display:grid; place-items:center; margin:16px auto 8px; }
.img-wrap img{ width:min(340px,80vw); height:auto; object-fit:contain; transition:opacity .25s ease; }
.img-fallback{ width:180px; height:180px; font-size:72px; display:grid; place-items:center; background:#f7f7f7; border-radius:24px; }

.title{ margin:10px 0 18px; font-weight:700; font-size:24px; color:#222; }

.btn-wrap{
  position:relative;
  height:140px;
  margin: 15px 30px;
}
.btn{
  border:none; cursor:pointer; font-weight:700; display:inline-block;
  transition:transform .15s ease, filter .15s ease, box-shadow .2s ease;
}
.yes{
  position:absolute; left:0; bottom:0;
  background:#4ade80; color:#0a3316;
  font-size:36px; padding:16px 28px; border-radius:18px;
  box-shadow:0 10px 18px rgba(74,222,128,.35);
}
.yes:hover{ filter:brightness(1.05); }
.no{
  position:absolute; right:0; bottom:20px;
  background:#f87171; color:#fff;
  font-size:16px; padding:12px 16px; border-radius:999px; white-space:nowrap;
  box-shadow:0 10px 18px rgba(248,113,113,.3);
}
.no:hover{ filter:brightness(1.02); }

/* ===== Overlay kết quả ===== */
.stage {
  position: fixed; inset: 0; z-index: 50;
  background: #0a0a0a; color: #fff; overflow: hidden;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

/* Sao nền */
.stars, .stars-2{
  position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(2px 2px at 20% 30%, #fff 60%, transparent 61%) repeat,
    radial-gradient(1.5px 1.5px at 70% 60%, #fff 60%, transparent 61%) repeat,
    radial-gradient(1.2px 1.2px at 40% 80%, #fff 60%, transparent 61%) repeat;
  background-size: 300px 300px, 260px 260px, 220px 220px;
  opacity:.7; animation: drift 60s linear infinite;
}
.stars-2{ opacity:.4; animation-duration:90s; filter: blur(.5px); }
@keyframes drift { from{transform:translateY(0)} to{transform:translateY(-300px)} }

/* Chữ rơi */
.drop{
  position:absolute; top:-10vh;
  font-weight:700; letter-spacing:.5px; white-space:nowrap;
  animation: fall linear infinite; will-change: transform, opacity;
}
@keyframes fall{
  0%   { transform: translateY(0) translateX(0) scale(1); opacity:0; }
  10%  { opacity:.95; }
  60%  { transform: translateY(70vh) translateX(8px)  scale(1.05); }
  100% { transform: translateY(115vh) translateX(-8px) scale(1.08); opacity:0; }
}

/* Tim rơi */
.heart{
  position:absolute; top:-8vh; color:#ff86a5;
  text-shadow: 0 0 10px rgba(255,134,165,.6);
  animation: fallHeart ease-in infinite;
}
@keyframes fallHeart{
  0%   { transform: translateY(0) scale(.9) rotate(0deg); opacity:0; }
  12%  { opacity:1; }
  70%  { transform: translateY(78vh) scale(1.1) rotate(-12deg); }
  100% { transform: translateY(118vh) scale(1.2) rotate(10deg); opacity:0; }
}

/* Dòng trung tâm */
.center{
  position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  font-size: clamp(28px, 6vw, 56px); color:#ffd1dd;
  text-shadow: 0 0 18px rgba(255,150,180,.8), 0 0 40px rgba(255,150,180,.35);
  animation: pulse 2.4s ease-in-out infinite; pointer-events:none;
}
@keyframes pulse{
  0%,100%{ transform:translate(-50%,-50%) scale(1); }
  50%    { transform:translate(-50%,-50%) scale(1.06); }
}
</style>
