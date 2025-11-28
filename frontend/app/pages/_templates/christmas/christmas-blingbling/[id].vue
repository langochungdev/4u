<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import config from './config'; 
import { useTemplateData } from "@/composables/useTemplateData";

// --- DỮ LIỆU ---
const { contextData: data } = useTemplateData(config);

const validImages = computed(() => {
    if (!data.value || !data.value.images) return [];
    return data.value.images.filter(img => img);
});

const letterTitle = computed(() => data.value?.content?.[0] || "Merry Christmas");
const letterBody = computed(() => data.value?.content?.[1] || "Giáng sinh an lành! Chạm vào các quả cầu pha lê để xem kỷ niệm, và chạm ngôi sao trên đỉnh để đọc thư nhé!");

// Xử lý ảnh & Nhạc
const getSrc = (source: any) => {
    if (!source) return '';
    try {
        if (typeof source === 'string') return source;
        if (source instanceof File || source instanceof Blob) return URL.createObjectURL(source);
    } catch (e) { console.error(e); }
    return '';
};

const audioSource = computed(() => {
    try {
        const audio = data.value?.audios?.[0];
        if (audio && (audio as any) instanceof File) return URL.createObjectURL(audio as any);
        return (audio as string) || "https://storage.googleapis.com/webai-54992.appspot.com/WeWishYouAMerryChristmas.mp3";
    } catch (e) { return "https://storage.googleapis.com/webai-54992.appspot.com/WeWishYouAMerryChristmas.mp3"; }
});

// --- FIX LỖI NHẠC (QUAN TRỌNG) ---
const bgMusic = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const isManuallyPaused = ref(false); // Biến đánh dấu người dùng đã chủ động tắt

const initAudio = () => {
    const src = audioSource.value;
    if(!src) return;
    bgMusic.value = new Audio(src);
    bgMusic.value.loop = true; bgMusic.value.volume = 0.6;
    
    // Hàm tự động phát khi chạm màn hình
    const autoPlay = () => {
        // Nếu người dùng đã bấm tắt nhạc rồi thì KHÔNG tự bật lại nữa
        if (isManuallyPaused.value) return; 
        
        if (bgMusic.value && bgMusic.value.paused) {
            bgMusic.value.play()
                .then(() => isPlaying.value = true)
                .catch(() => isPlaying.value = false);
        }
    };

    document.addEventListener('click', autoPlay, { once: true });
    document.addEventListener('touchstart', autoPlay, { once: true });
};

const toggleMusic = () => {
    if(!bgMusic.value) return;
    
    // Đánh dấu là người dùng đã can thiệp
    isManuallyPaused.value = true;

    if(isPlaying.value) { 
        bgMusic.value.pause(); 
        isPlaying.value = false; 
    } else { 
        bgMusic.value.play(); 
        isPlaying.value = true; 
    }
}

// --- LOGIC VISUALS ---
const stars = ref<any[]>([]); 
const bgStars = ref<any[]>([]); 
const orbitItems = ref<any[]>([]); 
const TOTAL_STARS = 250; 

const generateVisuals = () => {
    // 1. Tạo cây thông
    const treeArr = [];
    for (let i = 0; i < TOTAL_STARS; i++) {
        const k = i / TOTAL_STARS; 
        const angle = i * 137.5; 
        const radius = k * 160; 
        const y = Math.pow(k, 1.2) * 450; 
        const color = Math.random() > 0.75 ? '#FFD700' : (Math.random() > 0.9 ? '#ff4d4d' : '#ffffff');
        const size = Math.random() * 3 + 1.5; 
        treeArr.push({
            id: i,
            style: {
                '--angle': `${angle}deg`, '--radius': `${radius}px`, '--y': `${y}px`,
                '--color': color, '--size': `${size}px`,
            }
        });
    }
    stars.value = treeArr;

    // 2. Tạo sao nền
    const bgArr = [];
    for(let i = 0; i < 60; i++) {
        bgArr.push({
            id: i + 1000,
            style: {
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`, opacity: Math.random() * 0.7 + 0.3
            }
        })
    }
    bgStars.value = bgArr;

    // 3. TẠO CÁC QUẢ CẦU ẢNH
    const imgs = validImages.value;
    const orbs = [];
    if (imgs.length > 0) {
        let displayImgs = [...imgs];
        while (displayImgs.length < 6) { displayImgs = [...displayImgs, ...imgs]; }
        if (displayImgs.length > 12) displayImgs = displayImgs.slice(0, 12);
        
        const step = 360 / displayImgs.length;
        for (let i = 0; i < displayImgs.length; i++) {
            orbs.push({
                id: i,
                src: getSrc(displayImgs[i]),
                realIndex: i % imgs.length,
                style: { '--angle': `${i * step}deg`, '--delay': `-${i * 0.5}s` }
            });
        }
    }
    orbitItems.value = orbs;
};

// --- LOGIC MODAL ---
const showModal = ref(false);
const modalType = ref<'image' | 'letter'>('image');
const currentImgIndex = ref(0);

const openImage = (index: number) => {
    currentImgIndex.value = index;
    modalType.value = 'image';
    showModal.value = true;
};

const openLetter = () => {
    modalType.value = 'letter';
    showModal.value = true;
};

const nextImg = () => {
    if(validImages.value.length === 0) return;
    currentImgIndex.value = (currentImgIndex.value + 1) % validImages.value.length;
}

onMounted(() => {
    generateVisuals();
    initAudio();
});
onUnmounted(() => { bgMusic.value?.pause(); });
</script>

<template>
<div class="fixed-fullscreen bg-shimmer-night">
    <div class="bg-twinkling">
        <div v-for="star in bgStars" :key="star.id" class="bg-star" :style="star.style"></div>
    </div>

    <button @click.stop="toggleMusic" class="music-btn" :class="{'spinning': isPlaying}">
        {{ isPlaying ? '🎵' : '🔇' }}
    </button>

    <div class="scene-3d">
        <div class="spiral-tree">
            <div v-for="star in stars" :key="star.id" class="star-point" :style="star.style"></div>
            <div class="top-star-container" @click="openLetter">
                <div class="halo"></div>
                <svg class="main-star" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M256,32l55,153l161,11l-123,105l38,158l-131-83l-131,83l38-158L40,196l161-11L256,32z"/>
                </svg>
                <div class="click-hint-star">Bấm tui nè! ✉️</div>
            </div>
        </div>

        <div class="orbit-ring">
            <div 
                v-for="orb in orbitItems" 
                :key="orb.id" 
                class="orbit-item-wrapper"
                :style="orb.style"
                @click="openImage(orb.realIndex)"
            >
                <div class="crystal-orb">
                    <div class="orb-ring"></div> 
                    <img :src="orb.src" class="orb-img" />
                    <div class="orb-reflection"></div> 
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer-hint animate-pulse">Chạm vào quả cầu pha lê để xem ảnh • Chạm ngôi sao để đọc thư</div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="glass-card premium-glass">
            <button class="close-btn" @click="showModal = false">✕</button>
            
            <div v-if="modalType === 'image'" class="modal-body-image">
                <div v-if="validImages.length > 0" class="photo-frame" @click="nextImg">
                    <img :src="getSrc(validImages[currentImgIndex])" />
                    <div class="photo-hint" v-if="validImages.length > 1">
                        Ảnh {{currentImgIndex + 1}}/{{validImages.length}} (Chạm để chuyển)
                    </div>
                </div>
            </div>

            <div v-if="modalType === 'letter'" class="content-text">
                <h1 class="title">{{ letterTitle }}</h1>
                <div class="divider"></div>
                <div class="scroll-body">
                    <p class="body">{{ letterBody }}</p>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style scoped>
@import './styles.css';

</style>