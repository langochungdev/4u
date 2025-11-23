<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import config from './config';
import { useTemplateData } from "@/composables/useTemplateData";

// --- IMPORT ẢNH ---
import treeImg from './tree.webp'; 
import noelImg from './santa.webp'; 

// --- XỬ LÝ DỮ LIỆU ---
const { contextData: data } = useTemplateData(config);

const validImages = computed(() => {
  const userImages = data.value?.images || [];
  return (Array.from({ length: config.maxImages }).map((_, i) => userImages[i] || null)).filter(img => img !== null);
});

// Nội dung thư
const greetingContent = computed(() => data.value?.content?.[1] || "Gửi người thương,\n\nGiáng sinh này chúc bạn thật nhiều niềm vui, hạnh phúc và bình an. Mong rằng mọi điều ước của bạn sẽ thành hiện thực.\n\nMerry Christmas!");
const letterTitle = computed(() => data.value?.content?.[0] || "Merry Christmas");

// --- XỬ LÝ NHẠC (AUDIO) ---
// Lấy nhạc từ user upload (audios[0]), nếu không có thì dùng link fallback
const audioSource = computed(() => {
    if (data.value?.audios && data.value.audios.length > 0) {
        return data.value.audios[0];
    }
    return "https://storage.googleapis.com/webai-54992.appspot.com/WeWishYouAMerryChristmas.mp3";
});

const bgMusic = ref<HTMLAudioElement | null>(null);
const isMusicPlaying = ref(false);

const initAudio = () => {
    if (audioSource.value) {
        bgMusic.value = new Audio(audioSource.value);
        bgMusic.value.loop = true; 
        bgMusic.value.volume = 0.5; 
        attemptPlayMusic();

        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    }
};

const attemptPlayMusic = () => {
    if (bgMusic.value) {
        bgMusic.value.play()
            .then(() => { isMusicPlaying.value = true; })
            .catch(() => { isMusicPlaying.value = false; });
    }
};

const handleFirstInteraction = () => {
    if (!isMusicPlaying.value && bgMusic.value) {
        bgMusic.value.play();
        isMusicPlaying.value = true;
    }
};

const toggleMusic = () => {
    if (!bgMusic.value) return;
    if (isMusicPlaying.value) {
        bgMusic.value.pause();
        isMusicPlaying.value = false;
    } else {
        bgMusic.value.play();
        isMusicPlaying.value = true;
    }
};

// --- LOGIC GAME ---
const showModal = ref(false);
const modalType = ref<'image' | 'letter'>('image');
const currentItem = ref<string>('');
const isTreeShaking = ref(false);
const treeSnow = ref<{id: number, left: number, top: number}[]>([]);
const treeClickCount = ref(0); 
const isLetterOpen = ref(false);   
const isCardVisible = ref(false); 

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
  const isMobile = window.innerWidth < 768;
  const speed = isMobile ? Math.random() * 0.6 + 0.4 : Math.random() * 1.5 + 0.8;

  fallingGifts.value.push({ 
      id, 
      left: Math.random() * 90 + 5, 
      top: -80, 
      speed: speed, 
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5, 
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

const openLetter = () => {
  modalType.value = 'letter';
  showModal.value = true;
  isLetterOpen.value = false;
  isCardVisible.value = false;

  setTimeout(() => {
      isLetterOpen.value = true; 
      setTimeout(() => {
          isCardVisible.value = true; 
      }, 800);
  }, 300);
};

const closeModal = () => {
    showModal.value = false;
    setTimeout(() => {
        isLetterOpen.value = false;
        isCardVisible.value = false;
    }, 300);
}

const shakeTree = () => {
  if (isTreeShaking.value) return;
  isTreeShaking.value = true;
  for(let i=0; i<30; i++) { 
    treeSnow.value.push({ id: Date.now() + i, left: Math.random() * 100, top: Math.random() * 60 });
  }
  setTimeout(() => isTreeShaking.value = false, 500);
  setTimeout(() => treeSnow.value = [], 1500);

  treeClickCount.value++;
  if (treeClickCount.value >= 3) {
      openLetter(); 
      treeClickCount.value = 0; 
  }
};

const stars = Array.from({ length: 50 }).map((_, i) => ({
  id: i, top: Math.random() * 100, left: Math.random() * 100, delay: Math.random() * 4, size: Math.random() * 2 + 1
}));

onMounted(() => {
  initAudio(); 
  giftInterval = setInterval(createFallingGift, 1500);
  updateFallingGifts();
});

onUnmounted(() => {
  if (bgMusic.value) {
      bgMusic.value.pause();
      bgMusic.value = null;
  }
  if (giftInterval) clearInterval(giftInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="christmas-container aurora-bg">
    
    <button class="music-toggle-btn" @click.stop="toggleMusic" :class="{ 'playing': isMusicPlaying }">
        <span v-if="isMusicPlaying">🎵</span>
        <span v-else>🔇</span>
    </button>

    <div class="moon"></div>
    <div v-for="star in stars" :key="star.id" class="star" :style="{ top: star.top + '%', left: star.left + '%', animationDelay: star.delay + 's', width: star.size + 'px', height: star.size + 'px' }"></div>
    <div class="cloud-container"><div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div></div>
    
    <div class="snow-container">
        <div class="snow snow-1"></div>
        <div class="snow snow-2"></div>
        <div class="snow snow-3"></div>
        <div class="snow snow-4"></div> 
    </div>

    <div class="main-scene">
      <div class="santa-wrapper"><img :src="noelImg" class="santa-img" alt="Santa" /></div>
      <div class="tree-area" @click="shakeTree">
        <div class="tree-wrapper swaying" :class="{ 'shaking': isTreeShaking }">
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
          <div class="gift-glow"></div>
        </div>
      </template>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      
      <div v-if="modalType === 'image'" class="modal-content image-type">
        <button class="close-btn" @click="closeModal">✕</button>
        <div class="modal-body"><img :src="currentItem" class="modal-img" /></div>
      </div>

      <div v-else class="letter-modal-container">
         
         <div class="envelope-wrap" :class="{ 'open': isLetterOpen, 'vanish': isCardVisible }">
            <div class="envelope">
                <div class="envelope-back"></div>
                <div class="envelope-front"></div>
                <div class="envelope-flap"></div>
                <div class="seal"><span>🎄</span></div>
            </div>
         </div>

         <div class="real-letter-card" :class="{ 'visible': isCardVisible }" @click.stop>
            <div class="paper-texture">
                <div class="stamp">
                    <div class="stamp-inner">❄️</div>
                </div>

                <div class="letter-content">
                    <h2 class="letter-title">{{ letterTitle }}</h2>
                    <div class="letter-divider"></div>
                    
                    <div class="letter-body-scroll">
                        <p class="letter-text">{{ greetingContent }}</p>
                    </div>
                </div>
            </div>
            <button class="close-letter-btn" @click="closeModal">Đóng thư</button>
         </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
@import './styles.css';
</style>