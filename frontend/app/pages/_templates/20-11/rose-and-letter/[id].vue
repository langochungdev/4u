<template>
    <div
        class="relative min-h-screen w-full overflow-hidden bg-[#FDF5E6] flex flex-col items-center justify-center select-none font-sans">
        <div v-if="scene === 1"
            class="relative z-10 w-full h-screen flex flex-col items-center justify-center cursor-pointer"
            @click="goToScene2">
            <img :src="imgFlowerV4"
                class="absolute top-2 left-2 w-[30vw] max-w-[180px] pointer-events-none animate-fade-in z-10"
                style="animation-delay: 0.2s" />

            <img :src="imgFlowerFall"
                class="absolute top-5 right-0 w-[25vw] max-w-[150px] opacity-80 pointer-events-none animate-fade-in z-10"
                style="animation-delay: 0.4s" />

            <div class="relative z-20 flex flex-col items-center">
                <div
                    class="bg-white p-2 pb-8 md:pb-12 shadow-2xl rounded transform transition-transform duration-500 hover:scale-105 w-[70vw] max-w-[380px] group">
                    <div class="aspect-square overflow-hidden bg-gray-100 relative">
                        <img :src="drawnImageSrc" class="w-full h-full object-cover animate-draw block" alt="Memory" />
                    </div>

                    <p
                        class="absolute bottom-2 left-0 w-full text-center font-hand text-gray-500 text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Chạm nhẹ để xem bất ngờ...
                    </p>
                </div>

                <p
                    class="font-hand text-click-me text-4xl md:text-6xl mt-6 md:mt-10 font-bold animate-pulse-fast drop-shadow-lg z-30">
                    Click me now !
                </p>
            </div>

            <img :src="imgThankYou"
                class="absolute bottom-0 left-0 w-[35vw] max-w-[200px] pointer-events-none animate-fade-in z-10"
                style="animation-delay: 0.6s" />

            <img :src="imgFlowerV3"
                class="absolute bottom-0 right-0 w-[30vw] max-w-[190px] pointer-events-none animate-fade-in z-10"
                style="animation-delay: 0.8s" />
        </div>

        <div v-show="scene === 2" class="w-full h-screen flex items-center justify-center bg-scene-2"
            ref="castleContainer">
            <div class="relative group cursor-pointer transition-transform active:scale-95" @click="goToScene3">
                <div
                    class="w-[90vw] max-w-[420px] aspect-[1.4/1] chalkboard-box rounded-lg shadow-2xl flex flex-col items-center justify-center relative z-10">
                    <div
                        class="font-chalk text-white text-2xl md:text-4xl text-center leading-relaxed animate-chalk px-4">
                        Nhà Giáo Việt Nam<br />
                        <span class="text-yellow-200 text-3xl md:text-5xl">20 - 11</span>
                    </div>

                    <div
                        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100px] h-3 chalk-tray border-t border-[#8b4513]">
                        <div class="absolute -top-1 left-4 w-4 h-2 bg-white rounded-sm rotate-12"></div>
                        <div class="absolute -top-1 right-4 w-3 h-2 bg-white rounded-sm -rotate-6"></div>
                    </div>
                </div>

                <div
                    class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-4 bg-black/20 rounded-[50%] blur-sm z-0">
                </div>
            </div>
        </div>

        <div v-if="scene === 3" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            @click.self="closeLetter">
            <div class="relative w-[92vw] max-w-[480px] animate-fade-in">
                <div class="absolute inset-0 bg-white rounded-2xl -rotate-3 shadow-lg scale-[0.98]"></div>

                <div
                    class="relative z-10 letter-box border-2 border-dashed letter-border rounded-2xl p-1 min-h-80 flex flex-col shadow-xl overflow-hidden">
                    <button @click="closeLetter"
                        class="absolute top-2 right-2 w-8 h-8 bg-white/60 rounded-full letter-text-color hover:bg-red-100 flex items-center justify-center z-50 shadow-sm">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                    <div class="absolute bottom-2 left-2 w-[20vw] max-w-[100px] z-20 pointer-events-none">
                        <img :src="imgBooksStack" alt="Books" class="w-full drop-shadow-md transform -rotate-6" />
                    </div>

                    <div class="absolute top-4 left-3 w-[15vw] max-w-[70px] z-20 animate-write pointer-events-none">
                        <img :src="imgFountainPen" alt="Pen" class="w-full drop-shadow-lg" />
                    </div>

                    <div class="absolute top-3 right-12 letter-icon-color opacity-60">
                        <i class="fa-solid fa-heart"></i>
                    </div>
                    <div class="absolute bottom-3 right-4 letter-icon-color opacity-60">
                        <i class="fa-solid fa-heart"></i>
                    </div>

                    <div class="relative z-30 flex flex-col items-center w-full pt-8 pb-4 pl-[20vw] md:pl-[100px] pr-4">
                        <h2 class="font-hand letter-title text-2xl md:text-3xl font-bold mb-4 text-center min-h-9">
                            {{ letterTitleRef }}
                        </h2>

                        <div class="w-full max-h-[220px] overflow-y-auto custom-scrollbar text-center md:text-left">
                            <p
                                class="font-hand text-lg md:text-xl text-gray-800 whitespace-pre-wrap leading-relaxed pb-8">
                                {{ letterContentRef
                                }}<span v-if="isTyping" class="animate-pulse">|</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <audio id="bg-audio" ref="audioRef" :src="audioSrc" loop class="hidden"></audio>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import config from "./config";

import imgThankYou from "./imgs/giphy.gif";
import imgFlowerFall from "./imgs/flower.gif";
import imgFlowerV3 from "./imgs/flower-v3.gif";
import imgFlowerV4 from "./imgs/flower-v4.gif";
import imgFountainPen from "./imgs/fountain-pen.png";
import imgBooksStack from "./imgs/books-stack.png";

const { contextData } = useTemplateData(config);

const drawnImageSrc = computed(
    () => contextData.value?.images?.[0] || "https://via.placeholder.com/400"
);
const audioSrc = computed(() => contextData.value?.audios?.[0] || "");
const fullTitle = computed(
    () => contextData.value?.content?.[0] || "Gửi Lời Chúc 20/11"
);
const fullBody = computed(
    () =>
        contextData.value?.content?.[1] ||
        "Chúc mừng ngày Nhà giáo Việt Nam. Em kính chúc thầy cô luôn mạnh khỏe và hạnh phúc."
);

const scene = ref(1);
const letterTitleRef = ref("");
const letterContentRef = ref("");
const isTyping = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);
const castleContainer = ref<HTMLElement | null>(null);

function goToScene2() {
    scene.value = 2;
    if (audioRef.value) {
        audioRef.value.play().catch((e) => console.warn("Audio blocked:", e));
    }
}

function goToScene3() {
    scene.value = 3;
    letterTitleRef.value = "";
    letterContentRef.value = "";
    isTyping.value = true;
    nextTick(() => {
        typeWriter(fullTitle.value, letterTitleRef, () => {
            typeTimeout = window.setTimeout(() => {
                typeWriter(fullBody.value, letterContentRef, () => {
                    isTyping.value = false;
                });
            }, 300);
        });
    });
}

function closeLetter() {
    scene.value = 2;
    clearTimeout(typeTimeout);
    isTyping.value = false;
}

let typeTimeout: number;
function typeWriter(
    text: string,
    targetRef: any,
    callback: () => void,
    index = 0
) {
    if (scene.value !== 3) return;
    if (index < text.length) {
        targetRef.value += text.charAt(index);
        typeTimeout = window.setTimeout(() => {
            typeWriter(text, targetRef, callback, index + 1);
        }, 50);
    } else {
        callback();
    }
}

const head = document.getElementsByTagName("head")[0];
const injectedStyles = ref<HTMLStyleElement[]>([]);
let animationId = 0;

function CreateMagicDust(
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    sizeRatio: number,
    fallingTime: number,
    delay: number
) {
    if (!castleContainer.value) return;
    let dust = document.createElement("span");
    let style = document.createElement("style");
    let animName = `dustAnim${animationId++}`;
    style.innerHTML = `
    @keyframes ${animName} {
      0% { top: ${y1}px; left: ${x1}px; width: ${2 * sizeRatio}px; height: ${2 * sizeRatio
        }px; opacity: .4 }
      50% { width: ${4 * sizeRatio}px; height: ${4 * sizeRatio}px; opacity: .8 }
      100% { top: ${y2}px; left: ${x2}px; width: 0; height: 0; opacity: 0 }
    }
  `;
    if (head) {
        head.appendChild(style);
        injectedStyles.value.push(style);
    }
    dust.style.position = "absolute";
    dust.style.background = "white";
    dust.style.borderRadius = "50%";
    dust.style.boxShadow = "0 0 3px white";
    dust.style.zIndex = "5";
    dust.style.animation = `${animName} ${fallingTime}s infinite ${delay}s`;
    if (scene.value === 2 && castleContainer.value) {
        castleContainer.value.appendChild(dust);
    }
}

onMounted(() => {
    const dusts = [
        [130, 132, 150, 152, 0.15, 2.5, 0.1],
        [65, 63, 300, 299, 0.5, 2, 0.2],
        [70, 70, 150, 150, 0.45, 2, 0.5],
        [75, 78, 160, 170, 0.6, 2, 1],
        [80, 82, 160, 180, 0.6, 1, 0.4],
        [85, 100, 160, 170, 0.5, 2, 0.5],
        [125, 110, 170, 180, 0.25, 3, 1.5],
        [90, 90, 115, 115, 0.4, 2, 2],
        [93, 95, 200, 200, 0.4, 3, 1.5],
        [100, 100, 145, 155, 0.45, 1, 0.5],
        [100, 90, 170, 230, 0.35, 2, 0.75],
        [100, 102, 115, 112, 0.35, 3, 0.25],
        [100, 95, 170, 200, 0.55, 1.5, 0.75],
        [100, 97, 150, 190, 0.7, 2, 1.5],
        [105, 100, 160, 180, 0.5, 1.5, 0.725],
        [125, 125, 180, 190, 0.25, 1, 0.725],
        [130, 130, 135, 135, 0.45, 3, 1.5],
        [135, 132, 170, 190, 0.25, 2.5, 0.75],
        [135, 132, 320, 315, 0.2, 5, 0.3],
    ];

    dusts.forEach((o) =>
        CreateMagicDust(
            o[0] ?? 0,
            o[1] ?? 0,
            o[2] ?? 0,
            o[3] ?? 0,
            o[4] ?? 0,
            o[5] ?? 0,
            o[6] ?? 0
        )
    );
});

onBeforeUnmount(() => {
    clearTimeout(typeTimeout);
    injectedStyles.value.forEach((s) => s.remove());
});
</script>

<style scoped src="./style.css"></style>

<style scoped>
.text-click-me {
    color: #d90429;
}

.bg-scene-2 {
    background-color: #f0f2f5;
}

.chalkboard-box {
    background-color: #34495e;
    border: 12px solid #8b4513;
}

@media (min-width: 768px) {
    .chalkboard-box {
        border-width: 16px;
    }
}

.chalk-tray {
    background-color: #a0522d;
}

.letter-box {
    background-color: #ffebeb;
}

.letter-border {
    border-color: #ff6666;
}

.letter-text-color {
    color: #ff6666;
}

.letter-title {
    color: #d90429;
}

.letter-icon-color {
    color: #ff6666;
}
</style>