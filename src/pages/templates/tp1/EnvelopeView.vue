<script setup lang="ts">
import { ref } from "vue"
import ContentView from "./ContentView.vue"
// Demo dữ liệu cho ContentView
const contentTitle = "Thư gửi bạn";
const contentLines = [
    "Chúc bạn một ngày thật vui vẻ!",
    "Cảm ơn bạn đã mở trái tim này.",
    "Hãy luôn mỉm cười nhé!"
]
const emit = defineEmits<{ (e: "opened"): void }>()
const tapCount = ref(0)
const unlocked = ref(false)
const heartEl = ref<HTMLElement | null>(null)
const contentKey = ref(0)

function handleTap() {
    if (unlocked.value) return
    tapCount.value++
    if (heartEl.value) {
        heartEl.value.classList.add("animate-heart")
        setTimeout(() => heartEl.value?.classList.remove("animate-heart"), 180)
    }
    if (tapCount.value >= 10) {
        unlocked.value = true
        contentKey.value++ // Tăng key để ContentView re-mount
        setTimeout(() => emit("opened"), 400)
    }
}
</script>

<template>
    <section class="w-full flex flex-col justify-center items-center">
        <div v-if="!unlocked" class="flex flex-col items-center">
            <div ref="heartEl"
                class="cursor-pointer select-none transition-all duration-150"
                :class="[unlocked ? 'scale-90 opacity-60 pointer-events-none' : 'hover:scale-110']"
                @click="handleTap"
                style="font-size:120px; color:#ff4d8d; text-shadow:0 4px 32px #ffb6d5;">
                ❤
            </div>
            <div class="mt-6">
                <div class="blur-bg px-4 py-2 rounded-xl text-lg text-rose-500 font-semibold inline-block">
                    Chạm trái tim <span class="font-bold">{{ 10 - tapCount }}</span> lần để mở thư
                </div>
            </div>
        </div>
        <div v-if="unlocked">
            <ContentView
                :title="contentTitle"
                :lines="contentLines"
                @next="emit('opened')"
                :key="contentKey"
            />
        </div>
    </section>
</template>

<style scoped>
.animate-heart {
    animation: heart-bounce 0.18s;
}
@keyframes heart-bounce {
    0% { transform: scale(1); }
    40% { transform: scale(1.18); }
    100% { transform: scale(1); }
}
.blur-bg {
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 2px 16px 0 rgba(255,255,255,0.18);
}
</style>
