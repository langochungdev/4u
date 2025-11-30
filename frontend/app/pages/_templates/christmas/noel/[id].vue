<script setup lang="ts">
import { ref, onMounted } from "vue";
import { initNoelLove } from "./noelLove";
import "./style.css"; // CSS gốc của HTML (body, snow, ...)

const rootRef = ref<HTMLElement | null>(null);

const showSlider = ref(true);
const showScene = ref(false);

function handleSliderDone() {
  showSlider.value = false;
  showScene.value = true;
}

onMounted(() => {
  if (rootRef.value) {
    // initNoelLove(root, callback khi kéo full)
    initNoelLove(rootRef.value, handleSliderDone);
  }
});
</script>

<template>
  <ClientOnly>
    <div ref="rootRef" class="noel-love-root">
      <!-- ================== SLIDER TRÁI TIM (GIỐNG HỆT HTML) ================== -->
      <svg
        v-if="showSlider"
        id="loveSliderSVG"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- 🔽 DÁN NGUYÊN ĐOẠN SVG SLIDER TỪ HTML GỐC VÀO ĐÂY 🔽
             Bắt đầu từ:
               <line class="trackBg" x1="50" x2="750" y1="366" .../>
             cho tới:
               <rect class="dragger" x="-100" y="105" width="290" height="220" .../>
        -->

        <!-- ví dụ (đoạn đầu) -->
        <line
          class="trackBg"
          x1="50"
          x2="750"
          y1="366"
          y2="366"
          stroke="#FFFCF9"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="15"
        />
        <line
          class="trackMiddle"
          x1="50"
          x2="750"
          y1="366"
          y2="366"
          stroke="green"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="6"
          opacity="1"
        />
        <line
          class="track"
          x1="50"
          x2="750"
          y1="366"
          y2="366"
          stroke="#ff595e"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="6"
        />

        <!-- nhóm gốc: <g id="heartChat" class="heartChat">...</g> -->
        <!-- follower + liquidFollower + dragger y chang -->
        <!-- 👉 copy nguyên từ file HTML, không sửa gì -->
      </svg>

      <!-- ================== CÂY THÔNG GSAP (GIỐNG HỆT HTML) ================== -->
      <div v-if="showScene" class="container">
        <p id="days">Merry christmas !!!</p>

        <svg
          class="mainSVG"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 800 600"
        >
          <!-- 🔽 DÁN NGUYÊN mainSVG TỪ HTML GỐC VÀO ĐÂY 🔽
               Bắt đầu từ:
                 <defs>
                   <circle id="circ" .../>
                   <polygon id="star" .../>
                   ...
                 </defs>
               cho tới:
                 </svg> (cuối cây thông)
          -->

          <!-- ví dụ (đầu defs) -->
          <defs>
            <circle id="circ" class="particle" cx="0" cy="0" r="1" />
            <polygon
              id="star"
              class="particle"
              points="4.55,0 5.95,2.85 9.1,3.3 6.82,5.52 7.36,8.65 4.55,7.17 1.74,8.65 2.27,5.52 0,3.3 3.14,2.85 "
            />
            <!-- ... toàn bộ defs khác, mask, filter ... -->
          </defs>

          <g class="whole">
            <g class="pContainer"></g>

            <!-- toàn bộ <g class="tree" ...>, treeBottomPath, treePath,
                 treeBottom, treePot, treeStar, circle.sparkle... -->
          </g>
        </svg>
      </div>
    </div>
  </ClientOnly>
</template>

<!-- CSS global từ file html -->
<style src="./style.css"></style>

<!-- CSS nhỏ cho wrapper trong Vue -->
<style scoped>
.noel-love-root {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
