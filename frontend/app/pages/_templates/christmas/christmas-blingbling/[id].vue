<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import config from './config'; 
import { useTemplateData } from "@/composables/useTemplateData";

// --- DỮ LIỆU ---
const { contextData: data } = useTemplateData(config);

const validImages = computed(() => {
    if (!data.value || !data.value.images) return [];
    return data.value.images.filter(img => img);
});

const letterTitle = computed(() => data.value?.content?.[0] || "Merry Christmas");
const letterBody = computed(() => data.value?.content?.[1] || "Giáng sinh an lành! Chúc bạn luôn hạnh phúc và tỏa sáng như ngôi sao trên đỉnh cây thông nhé!");

const getSrc = (source: any) => {
    if (!source) return '';
    try {
        if (typeof source === 'string') return source;
        if (source instanceof File || source instanceof Blob) return URL.createObjectURL(source);
    } catch (e) { console.error(e); }
    return '';
};

const bgMusic = ref<HTMLAudioElement | null>(null);

const audioSource = computed(() => {
    try {
        const audio = data.value?.audios?.[0];
        
        // FIX LỖI: Thêm "(audio as any)" vào trước instanceof
        if (audio && ((audio as any) instanceof File || (audio as any) instanceof Blob)) {
            return URL.createObjectURL(audio as any);
        }
        
        // Nếu là link online
        if (typeof audio === 'string' && audio.length > 5) {
            return audio; 
        }
    } catch (e) { 
        console.error("Lỗi parse nhạc:", e); 
    }
    
    // Nhạc mặc định
    return "https://storage.googleapis.com/webai-54992.appspot.com/WeWishYouAMerryChristmas.mp3";
});
// Hàm khởi tạo Player
const initAudio = () => {
    if (bgMusic.value) return; // Đã tạo rồi thì thôi

    const src = audioSource.value;
    bgMusic.value = new Audio(src);
    bgMusic.value.loop = true; 
    bgMusic.value.volume = 0.5;

    // Sự kiện: Chạm vào màn hình là phát
    const attemptPlay = () => {
        if (bgMusic.value && bgMusic.value.paused) {
            bgMusic.value.play().catch(() => {});
        }
    };

    document.addEventListener('click', attemptPlay);
    document.addEventListener('touchstart', attemptPlay);
};


watch(audioSource, (newSrc) => {
    if (newSrc && bgMusic.value) {
        console.log("Cập nhật nhạc người dùng:", newSrc);
        const wasPlaying = !bgMusic.value.paused; // Kiểm tra xem đang hát hay đang tắt
        
        bgMusic.value.src = newSrc; // Thay đĩa nhạc mới
        
        // Nếu trước đó đang hát (hoặc chưa hát), thì thử phát ngay
        bgMusic.value.play().catch(e => console.log("Chờ tương tác để phát nhạc mới"));
    } else if (newSrc && !bgMusic.value) {
        initAudio(); 
    }
});

const stars = ref<any[]>([]); 
const bgStars = ref<any[]>([]); 
const snowflakes = ref<any[]>([]);
const TOTAL_STARS = 180; 

const generateVisuals = () => {
    // 1. Cây thông
    const treeArr = [];
    for (let i = 0; i < TOTAL_STARS; i++) {
        const k = i / TOTAL_STARS; 
        const angle = i * 137.5; 
        const radius = k * 180; 
        const y = Math.pow(k, 1.2) * 480; 
        const color = Math.random() > 0.75 ? '#FFD700' : (Math.random() > 0.9 ? '#ff4d4d' : '#ffffff');
        const size = Math.random() * 4 + 2; 
        treeArr.push({
            id: i,
            style: { '--angle': `${angle}deg`, '--radius': `${radius}px`, '--y': `${y}px`, '--color': color, '--size': `${size}px` }
        });
    }
    stars.value = treeArr;

    // 2. Sao nền
    const bgArr = [];
    for(let i = 0; i < 40; i++) { 
        bgArr.push({
            id: i + 1000,
            style: {
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`, opacity: Math.random() * 0.7 + 0.3
            }
        })
    }
    bgStars.value = bgArr;

    // 3. Tuyết rơi
    const snowArr = [];
    for(let i = 0; i < 30; i++) { 
        snowArr.push({
            id: i + 2000,
            style: {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                opacity: Math.random() * 0.6 + 0.4,
                width: `${Math.random() * 3 + 2}px`,
                height: `${Math.random() * 3 + 2}px`,
            }
        })
    }
    snowflakes.value = snowArr;
};

// --- MODAL ---
const showModal = ref(false);
const openLetter = () => { showModal.value = true; };

// Zoom ảnh
const previewImage = ref<string | null>(null);
const zoomImage = (src: string) => { previewImage.value = src; }
const closeZoom = () => { previewImage.value = null; }

onMounted(() => { 
    generateVisuals(); 
    initAudio(); 
});
onUnmounted(() => { 
    if (bgMusic.value) {
        bgMusic.value.pause();
        bgMusic.value = null;
    }
});
</script>

<template>
<div class="fixed-fullscreen bg-shimmer-night">
    <div class="bg-twinkling">
        <div v-for="star in bgStars" :key="star.id" class="bg-star" :style="star.style"></div>
    </div>

    <div class="falling-snow-layer">
        <div v-for="flake in snowflakes" :key="flake.id" class="snowflake" :style="flake.style"></div>
    </div>

    <div class="scene-3d">
        <div class="spiral-tree">
            <div v-for="star in stars" :key="star.id" class="star-point" :style="star.style"></div>
            
            <div class="top-star-container" @click="openLetter">
                <div class="halo"></div>
                <svg class="main-star" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M256,32l55,153l161,11l-123,105l38,158l-131-83l-131,83l38-158L40,196l161-11L256,32z"/>
                </svg>
                <div class="click-hint-star">Mở thư ✉️</div>
            </div>
        </div>
    </div>
    
    <div class="footer-hint animate-pulse">Chạm vào ngôi sao trên đỉnh để mở thư</div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="scrapbook-card">
            <button class="close-btn" @click="showModal = false">✕</button>
            
            <div class="stamp-container">
                <div class="stamp">NOEL<br>2025</div>
            </div>

            <h1 class="scrap-title" :title="letterTitle">{{ letterTitle }}</h1>
            
            <div class="text-scroll-area">
                <p class="scrap-body">{{ letterBody }}</p>
            </div>

            <div class="scattered-images" v-if="validImages.length > 0">
                <div 
                    v-for="(img, index) in validImages" 
                    :key="index" 
                    class="polaroid"
                    @click="zoomImage(getSrc(img))"
                >
                    <img :src="getSrc(img)" loading="lazy"/>
                </div>
            </div>
        </div>
    </div>

    <div v-if="previewImage" class="zoom-overlay" @click="closeZoom">
        <img :src="previewImage" class="zoom-img" />
    </div>
</div>
</template>

<style scoped>
@import './styles.css';
</style>