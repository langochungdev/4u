<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import config from './config';
import { useTemplateData } from "@/composables/useTemplateData";

// --- 1. IMPORT ẢNH ---
import treeImg from './tree.webp'; 
import noelImg from './santa.webp'; // Đảm bảo import ảnh Santa
import './styles.css'; 

// --- 2. XỬ LÝ DỮ LIỆU ---
const { contextData: data } = useTemplateData(config);

const validImages = computed(() => {
  const userImages = data.value?.images || [];
  return (Array.from({ length: config.maxImages }).map((_, i) => userImages[i] || null)).filter(img => img !== null);
});

const greetingContent = computed(() => data.value?.content?.[1] || "Chúc bạn một mùa Giáng Sinh an lành, ấm áp và hạnh phúc!");
const letterTitle = computed(() => data.value?.content?.[0] || "Merry Christmas");

// --- 3. STATE ---
const showModal = ref(false);
const modalType = ref<'image' | 'letter'>('image');
const currentItem = ref<string>('');
const isTreeShaking = ref(false);
const treeSnow = ref<{id: number, left: number, top: number}[]>([]);
const treeClickCount = ref(0); // Đếm số lần bấm cây

interface FallingGift {
  id: number;
  left: number;
  top: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  contentImage: string | null;
}
const fallingGifts = ref<FallingGift[]>([]);
let giftInterval: any = null;
let animationFrameId: number | null = null;

// State hiệu ứng lá thư
const isLetterOpen = ref(false);
const isCardVisible = ref(false);

// --- 4. LOGIC ---

const getImageUrl = (img: string | File | null) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  return URL.createObjectURL(img);
};

const createFallingGift = () => {
  const images = validImages.value;
  let randomContent = null;
  if (images.length > 0) {
    randomContent = images[Math.floor(Math.random() * images.length)];
  }

  const id = Date.now() + Math.random();
  const left = Math.random() * 90 + 5; 
  const top = -80; 
  const speed = Math.random() * 1.5 + 0.8; 
  const rotation = Math.random() * 360;
  const rotationSpeed = (Math.random() - 0.5) * 1.5; 

  fallingGifts.value.push({ 
      id, left, top, speed, rotation, rotationSpeed, 
      contentImage: getImageUrl(randomContent || null)
  });
};

const updateFallingGifts = () => {
  fallingGifts.value.forEach(gift => {
    gift.top += gift.speed;
    gift.rotation += gift.rotationSpeed;
  });
  fallingGifts.value = fallingGifts.value.filter(gift => gift.top < window.innerHeight + 100);
  animationFrameId = requestAnimationFrame(updateFallingGifts);
};

const openGift = (giftContent: string | null) => {
  if (!giftContent) return; 
  currentItem.value = giftContent;
  modalType.value = 'image';
  showModal.value = true;
};

// MỞ THƯ (VỚI HIỆU ỨNG PHONG BÌ)
const openLetter = () => {
  modalType.value = 'letter';
  showModal.value = true;
  
  // Reset trạng thái
  isLetterOpen.value = false;
  isCardVisible.value = false;

  // Bắt đầu chuỗi hiệu ứng
  setTimeout(() => {
      isLetterOpen.value = true; // 1. Mở nắp phong bì
      setTimeout(() => {
          isCardVisible.value = true; // 2. Lá thư trượt lên
      }, 600);
  }, 300);
};

const closeModal = () => {
    showModal.value = false;
    setTimeout(() => {
        // Reset lại khi đóng để lần sau mở lại đẹp
        isLetterOpen.value = false;
        isCardVisible.value = false;
    }, 300);
}

// LOGIC RUNG CÂY & ĐẾM CLICK
const shakeTree = () => {
  // 1. Rung cây
  if (isTreeShaking.value) return;
  isTreeShaking.value = true;
  for(let i=0; i<30; i++) { 
    treeSnow.value.push({
      id: Date.now() + i,
      left: Math.random() * 100,
      top: Math.random() * 60
    });
  }
  setTimeout(() => isTreeShaking.value = false, 500);
  setTimeout(() => treeSnow.value = [], 1500);

  // 2. Kiểm tra click 3 lần
  treeClickCount.value++;
  if (treeClickCount.value >= 3) {
      openLetter(); // Mở thư
      treeClickCount.value = 0; // Reset đếm
  }
};

const stars = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  delay: Math.random() * 4,
  size: Math.random() * 2 + 1
}));

onMounted(() => {
  giftInterval = setInterval(createFallingGift, 1500);
  updateFallingGifts();
});

onUnmounted(() => {
  if (giftInterval) clearInterval(giftInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="christmas-container">
    
    <div class="moon"></div>
    <div v-for="star in stars" :key="star.id" class="star"
         :style="{ top: star.top + '%', left: star.left + '%', animationDelay: star.delay + 's', width: star.size + 'px', height: star.size + 'px' }">
    </div>
    <div class="cloud-container"><div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div></div>
    <div class="snow-container"><div class="snow snow-1"></div><div class="snow snow-2"></div><div class="snow snow-3"></div></div>

    <div class="main-scene">
      <div class="santa-wrapper"><img :src="noelImg" class="santa-img" alt="Santa" /></div>
      
      <div class="tree-area" @click="shakeTree">
        <div class="tree-wrapper" :class="{ 'shaking': isTreeShaking }">
            <img :src="treeImg" class="tree-img" alt="Tree" />
            <div v-for="flake in treeSnow" :key="flake.id" class="tree-snowflake" :style="{ left: flake.left + '%', top: flake.top + '%' }"></div>
        </div>
        <p class="tap-hint">(Chạm vào cây 3 lần để xem điều ước)</p>
      </div>
    </div>

    <div class="falling-layer">
      <template v-for="gift in fallingGifts" :key="gift.id">
        <div class="gift-item" :style="{ left: `${gift.left}%`, top: `${gift.top}px`, transform: `rotate(${gift.rotation}deg)` }" @click="openGift(gift.contentImage)">
          <span class="gift-emoji">🎁</span>
        </div>
      </template>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div v-if="modalType === 'image'" class="modal-content image-type">
        <button class="close-btn" @click="closeModal">✕</button>
        <div class="modal-body">
           <img :src="currentItem" class="modal-img" />
        </div>
      </div>

      <div v-else class="envelope-wrapper" :class="{ 'open': isLetterOpen, 'fully-open': isCardVisible }">
         <div class="envelope">
            <div class="envelope-back"></div>
            
            <div class="letter-card" :class="{ 'full-view': isCardVisible }">
                <div class="card-inner">
                    <div class="card-header">
                        <h2>{{ letterTitle }}</h2>
                        <div class="decoration-line"></div>
                    </div>
                    <div class="card-body">
                        <p>{{ greetingContent }}</p>
                    </div>
                </div>
                <button class="close-card-btn" @click="closeModal">Đóng thư</button>
            </div>

            <div class="envelope-front"></div>
            <div class="envelope-flap"></div>
            <div class="seal"><span>❄️</span></div>
         </div>
      </div>
    </div>

  </div>
</template>