<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import config from './config';
import { useTemplateData } from "@/composables/useTemplateData";

// --- IMPORT ẢNH ---
import treeImg from './tree.webp'; 
import noelImg from './santa.webp'; 

// --- DATA & CONFIG ---
const { contextData: data } = useTemplateData(config);
const MAX_GIFTS = 5; 

const validImages = computed(() => {
  const userImages = data.value?.images || [];
  return (Array.from({ length: config.maxImages }).map((_, i) => userImages[i] || null)).filter(img => img !== null);
});

const greetingContent = computed(() => data.value?.content?.[1] || "Giáng sinh an lành! Chúc bạn luôn vui vẻ và hạnh phúc.");
const letterTitle = computed(() => data.value?.content?.[0] || "Merry Christmas");

// --- AUDIO HANDLE ---
const audioSource = computed(() => {
    if (data.value?.audios?.[0]) {
        const audio = data.value.audios[0];
        return (typeof audio === 'object') ? URL.createObjectURL(audio) : audio;
    }
    return "https://storage.googleapis.com/webai-54992.appspot.com/WeWishYouAMerryChristmas.mp3";
});

const bgMusic = ref<HTMLAudioElement | null>(null);
const isMusicPlaying = ref(false);

const initAudio = () => {
    if (!audioSource.value) return;
    bgMusic.value = new Audio(audioSource.value);
    bgMusic.value.loop = true;
    bgMusic.value.volume = 0.5;
    
    const tryPlay = () => {
        bgMusic.value?.play().then(() => isMusicPlaying.value = true).catch(() => isMusicPlaying.value = false);
    };
    tryPlay();
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('touchstart', tryPlay, { once: true });
};

const toggleMusic = () => {
    if (!bgMusic.value) return;
    if (isMusicPlaying.value) { bgMusic.value.pause(); isMusicPlaying.value = false; }
    else { bgMusic.value.play(); isMusicPlaying.value = true; }
};

watch(audioSource, (newSrc) => {
    if (bgMusic.value && newSrc) {
        bgMusic.value.src = newSrc;
        if (isMusicPlaying.value) bgMusic.value.play();
    }
});

// --- GAME LOGIC ---
const showModal = ref(false);
const modalType = ref<'image' | 'letter'>('image');
const currentItem = ref<string>('');
const isTreeShaking = ref(false);
const treeClickCount = ref(0); 
const isLetterOpen = ref(false);   
const isCardVisible = ref(false);
const isImageLoading = ref(true); // Biến kiểm soát trạng thái đang tải ảnh

interface FallingGift { id: number; style: any; content: string; }
const fallingGifts = ref<FallingGift[]>([]);
const stars = ref<any[]>([]);
const snowFlakes = ref<any[]>([]);

// HÀM PRELOAD: Tải ngầm ảnh ngay lập tức
const preloadImages = (images: any[]) => {
    images.forEach((img) => {
        const src = (typeof img === 'string') ? img : URL.createObjectURL(img);
        const preloadLink = new Image();
        preloadLink.src = src;
    });
};

const initFallingGifts = () => {
    const gifts: FallingGift[] = [];
    const images = validImages.value;
    
    if (images.length === 0) return;

    // Kích hoạt tải ngầm ngay khi có danh sách ảnh
    preloadImages(images);

    for (let i = 0; i < MAX_GIFTS; i++) {
        let content = '';
        const raw = images[Math.floor(Math.random() * images.length)];
        content = (typeof raw === 'object' && raw) ? URL.createObjectURL(raw) : (raw as string);

        gifts.push({
            id: i,
            content: content,
            style: {
                left: `${Math.random() * 80 + 10}%`,
                animationDuration: `${Math.random() * 5 + 8}s`,
                animationDelay: `-${Math.random() * 10}s`
            }
        });
    }
    fallingGifts.value = gifts;
};

// Watch để cập nhật quà và preload ảnh
watch(validImages, (newImages) => {
    if (newImages && newImages.length > 0) {
        initFallingGifts();
    }
}, { immediate: true });

const shakeTree = () => {
  if (isTreeShaking.value) return;
  isTreeShaking.value = true;
  
  snowFlakes.value = Array.from({length: 15}).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      top: Math.random() * 50
  }));

  setTimeout(() => isTreeShaking.value = false, 500);
  setTimeout(() => snowFlakes.value = [], 1500);

  treeClickCount.value++;
  if (treeClickCount.value >= 3) { 
      openModal('letter'); 
      treeClickCount.value = 0; 
  }
};

const openModal = (type: 'image' | 'letter', content?: string) => {
    if (type === 'image' && !content) return;

    modalType.value = type;
    
    if (content) {
        currentItem.value = content;
        isImageLoading.value = true; // Bật trạng thái loading khi mới mở
    }
    
    showModal.value = true;

    if (type === 'letter') {
        isLetterOpen.value = false;
        isCardVisible.value = false;
        setTimeout(() => {
             isLetterOpen.value = true; 
             setTimeout(() => isCardVisible.value = true, 600);
        }, 300);
    }
};

// Hàm tắt loading khi ảnh đã tải xong
const onImageLoad = () => {
    isImageLoading.value = false;
};

const closeModal = () => {
    showModal.value = false;
    isLetterOpen.value = false; 
    isCardVisible.value = false;
};

onMounted(() => {
    initAudio();
    
    stars.value = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        style: {
            top: `${Math.random() * 60}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            opacity: Math.random() 
        }
    }));
});

onUnmounted(() => {
    if (bgMusic.value) { bgMusic.value.pause(); bgMusic.value = null; }
});
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-sky-900 font-sans select-none">
    
    <button 
        @click.stop="toggleMusic"
        class="absolute top-5 right-5 z-50 w-12 h-12 rounded-full border-2 border-white/40 bg-white/10 text-white flex items-center justify-center transition active:scale-95"
        :class="{ 'animate-spin-slow text-yellow-400 border-yellow-400': isMusicPlaying }"
    >
        <span class="text-xl">{{ isMusicPlaying ? '🎵' : '🔇' }}</span>
    </button>

    <div class="absolute top-10 right-20 w-20 h-20 bg-yellow-100 rounded-full blur-xl opacity-50"></div> 
    <div class="absolute top-12 right-24 w-16 h-16 bg-yellow-50 rounded-full shadow-lg z-0"></div> 
    <div v-for="star in stars" :key="star.id" class="absolute w-1 h-1 bg-white rounded-full animate-twinkle" :style="star.style"></div>

    <div class="absolute inset-0 pointer-events-none z-10">
        <div class="snow snow-1"></div>
        <div class="snow snow-2"></div>
    </div>

    <div class="absolute w-40 z-10 animate-fly pointer-events-none top-[10%] -left-[200px]">
        <img :src="noelImg" class="w-full drop-shadow-md" alt="Santa" />
    </div>

    <div class="absolute bottom-0 w-full h-full pointer-events-none z-20 flex flex-col items-center justify-end pb-10">
         <div class="relative pointer-events-auto" @click="shakeTree">
            <div class="w-full max-w-[600px] transition-transform origin-bottom animate-sway" :class="{ 'animate-shake': isTreeShaking }">
                <img :src="treeImg" class="w-full h-auto drop-shadow-xl" alt="Tree" />
                <div v-for="flake in snowFlakes" :key="flake.id" class="absolute w-2 h-2 bg-white rounded-full animate-drop" 
                     :style="{ left: flake.left + '%', top: flake.top + '%' }"></div>
            </div>
            <p class="text-white text-center mt-4 text-lg font-bold animate-pulse drop-shadow-md">
                (Chạm vào cây 3 lần để nhận thư)
            </p>
         </div>
    </div>

    <div class="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <template v-for="gift in fallingGifts" :key="gift.id">
            <div 
                class="absolute -top-24 w-16 h-16 flex items-center justify-center cursor-pointer pointer-events-auto animate-fall hover:scale-110 active:scale-90 transition-transform will-change-transform"
                :style="gift.style"
                @click="openModal('image', gift.content)"
            >
                <span class="text-5xl drop-shadow-none">🎁</span>
            </div>
        </template>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" @click.self="closeModal">
        
        <div v-if="modalType === 'image'" class="relative bg-white p-2 rounded-lg shadow-2xl max-w-full max-h-[80vh] animate-popIn min-w-[200px] min-h-[200px] flex items-center justify-center">
             <button @click="closeModal" class="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white rounded-full font-bold shadow-md z-10">✕</button>
             
             <div v-if="isImageLoading" class="absolute inset-0 flex flex-col items-center justify-center text-red-600 z-0">
                 <div class="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
                 <span class="text-sm font-bold animate-pulse">Đang mở quà...</span>
             </div>

             <img 
               :src="currentItem" 
               class="max-w-full max-h-[70vh] rounded object-contain transition-opacity duration-300"
               :class="{ 'opacity-0': isImageLoading, 'opacity-100': !isImageLoading }"
               @load="onImageLoad" 
             />
        </div>

        <div v-else class="relative w-full h-full flex items-center justify-center">
            <div class="envelope-wrap" :class="{ 'open': isLetterOpen, 'vanish': isCardVisible }">
                <div class="envelope">
                    <div class="envelope-back"></div>
                    <div class="envelope-front"></div>
                    <div class="envelope-flap"></div>
                    <div class="seal">🎄</div>
                </div>
            </div>

            <div class="real-letter-card bg-[#fffdf0] w-full max-w-[600px] h-[85vh] md:h-auto md:max-h-[80vh] p-4 md:p-8 rounded shadow-2xl flex flex-col transition-all duration-700 transform translate-y-10 opacity-0 relative mx-4"
                 :class="{ '!opacity-100 !translate-y-0': isCardVisible }" @click.stop>
                
                <div class="absolute top-2 right-2 md:top-4 md:right-4 w-10 h-12 md:w-14 md:h-16 bg-white border-2 border-dotted border-red-600 hidden sm:flex items-center justify-center rotate-12 shadow-sm z-10">
                    <span class="text-xl md:text-2xl">❄️</span>
                </div>

                <div class="flex flex-col h-full overflow-hidden relative z-0">
                    
                    <div class="flex-shrink-0 mb-4 pt-2 px-8 text-center">
                        <h2 class="text-2xl md:text-4xl text-red-800 font-bold font-dancing leading-tight line-clamp-2 overflow-hidden text-ellipsis">
                            {{ letterTitle }}
                        </h2>
                         <div class="w-full h-px bg-red-300 mt-2"></div>
                         <div class="w-full h-px bg-red-300 mt-1"></div>
                    </div>
                    
                    <div class="flex-grow overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-transparent paper-lines">
                        <p class="text-base md:text-lg text-gray-800 font-hand whitespace-pre-wrap text-justify leading-[32px] pt-[3px]">
                            {{ greetingContent }}
                        </p>
                        <div class="h-4"></div>
                    </div>

                    <div class="flex-shrink-0 mt-4 flex justify-center pt-2 border-t border-red-200">
                        <button @click="closeModal" class="px-6 py-2 md:px-8 md:py-2 bg-white border-2 border-red-700 text-red-700 rounded-full font-bold uppercase text-sm md:text-base hover:bg-red-700 hover:text-white transition shadow-md active:scale-95">
                            Đóng thư
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
@import './styles.css';
</style>