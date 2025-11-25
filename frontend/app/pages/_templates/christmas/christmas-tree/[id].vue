<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'; // <-- 1. Thêm watch vào đây
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

// --- XỬ LÝ NHẠC ---
const audioSource = computed(() => {
    // Ưu tiên nhạc user
    if (data.value?.audios && data.value.audios.length > 0) {
        const userAudio = data.value.audios[0];
        // Nếu là URL string thì trả về luôn
        if (typeof userAudio === 'string') return userAudio;
        // Nếu là File object thì tạo URL tạm để player có thể đọc được
        if (typeof userAudio === 'object' && userAudio) {
            return URL.createObjectURL(userAudio);
        }
    }
    // Fallback nhạc mặc định
    return "https://storage.googleapis.com/webai-54992.appspot.com/WeWishYouAMerryChristmas.mp3";
});

const bgMusic = ref<HTMLAudioElement | null>(null);
const isMusicPlaying = ref(false);

// Hàm thiết lập hoặc cập nhật nguồn nhạc
const setupAudioPlayer = (src: string) => {
    if (!bgMusic.value) {
        // Nếu chưa có player thì tạo mới
        bgMusic.value = new Audio(src);
        bgMusic.value.loop = true; 
        bgMusic.value.volume = 0.5; 
    } else {
        // Nếu đã có player thì chỉ thay đổi đường dẫn
        const wasPlaying = !bgMusic.value.paused; // Kiểm tra xem đang chạy hay dừng
        bgMusic.value.src = src;
        // Nếu đang chạy thì phát tiếp bài mới
        if (wasPlaying || isMusicPlaying.value) {
            bgMusic.value.play().catch(() => isMusicPlaying.value = false);
        }
    }
};

const initAudio = () => {
    const src = audioSource.value || ""; 

    if (src) {
        setupAudioPlayer(src); // Khởi tạo lần đầu
    }
    
    attemptPlayMusic();
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
};

watch(audioSource, (newSrc) => {
    if (newSrc) {
        console.log("Cập nhật nhạc mới:", newSrc);
        setupAudioPlayer(newSrc);
    }
});

const attemptPlayMusic = () => {
    if (bgMusic.value) {
        bgMusic.value.play().then(() => { isMusicPlaying.value = true; }).catch(() => { isMusicPlaying.value = false; });
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
    if (isMusicPlaying.value) { bgMusic.value.pause(); isMusicPlaying.value = false; } else { bgMusic.value.play(); isMusicPlaying.value = true; }
};

// --- LOGIC GAME & HIỂN THỊ ---
const showModal = ref(false);
const modalType = ref<'image' | 'letter'>('image');
const currentItem = ref<string>('');
const isTreeShaking = ref(false);
const treeSnow = ref<{id: number, left: number, top: number}[]>([]);
const treeClickCount = ref(0); 
const isLetterOpen = ref(false);   
const isCardVisible = ref(false); 

// --- TỐI ƯU HÓA QUÀ RƠI (REACTIVE COMPUTED PROPERTY) ---
interface FallingGift {
  id: number;
  style: any;
  contentImage: string | null;
}

const getImageUrl = (img: string | File | null) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  return URL.createObjectURL(img);
};

// --- TỐI ƯU HÓA QUÀ RƠI ---
const fallingGifts = computed<FallingGift[]>(() => {
    const gifts: FallingGift[] = [];
    
    // GIẢM SỐ LƯỢNG QUÀ TẠI ĐÂY
    // Giảm từ 15 xuống 6 để đỡ lag trên mobile
    const MAX_GIFTS = 6; 
    
    const images = validImages.value;
    
    for (let i = 0; i < MAX_GIFTS; i++) {
        let randomContent: string | File | null = null;
        
        if (images.length > 0) {
            randomContent = images[Math.floor(Math.random() * images.length)] || null;
        }
        
        const leftPos = Math.random() * 100; 
        const duration = Math.random() * 5 + 5; 
        const delay = Math.random() * 10 * -1; 

        gifts.push({
            id: i,
            contentImage: getImageUrl(randomContent),
            style: {
                left: `${leftPos}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`
            }
        });
    }
    return gifts;
});

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
      setTimeout(() => { isCardVisible.value = true; }, 800);
  }, 300);
};

const closeModal = () => {
    showModal.value = false;
    setTimeout(() => { isLetterOpen.value = false; isCardVisible.value = false; }, 300);
}

const shakeTree = () => {
  if (isTreeShaking.value) return;
  isTreeShaking.value = true;
  for(let i=0; i<30; i++) { treeSnow.value.push({ id: Date.now() + i, left: Math.random() * 100, top: Math.random() * 60 }); }
  setTimeout(() => isTreeShaking.value = false, 500);
  setTimeout(() => treeSnow.value = [], 1500);
  treeClickCount.value++;
  if (treeClickCount.value >= 3) { openLetter(); treeClickCount.value = 0; }
};

const stars = Array.from({ length: 50 }).map((_, i) => ({
  id: i, top: Math.random() * 100, left: Math.random() * 100, delay: Math.random() * 4, size: Math.random() * 2 + 1
}));
onMounted(() => {
  initAudio(); 
});

onUnmounted(() => {
  if (bgMusic.value) { bgMusic.value.pause(); bgMusic.value = null; }
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
        <div class="gift-item" :style="gift.style" @click="openGift(gift.contentImage)">
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
                <div class="stamp"><div class="stamp-inner">❄️</div></div>
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