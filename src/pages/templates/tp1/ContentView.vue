<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue"

const props = defineProps<{ title: string; lines: string[] }>()
const emit = defineEmits<{ (e: "next"): void }>()
const container = ref<HTMLElement | null>(null)

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)) }

const timers: number[] = []
function clearTimers() {
    while (timers.length) {
        const id = timers.pop()
        if (id) clearInterval(id)
    }
}

function typeText(el: HTMLElement, text: string, speed = 35) {
    return new Promise<void>((resolve) => {
        let i = 0
        const id = window.setInterval(() => {
            el.textContent = text.slice(0, i++)
            if (i > text.length) { clearInterval(id); resolve() }
        }, speed)
        timers.push(id)
    })
}

async function revealLines(lines: string[], root: HTMLElement) {
    clearTimers()
    root.innerHTML = ""
    for (const line of lines) {
        const p = document.createElement("p")
        p.className = "text-white/90 font-['Inter'] text-[15px] leading-7"
        root.appendChild(p)
        await typeText(p, line, 35)
        await wait(450)
    }
}

// onMounted không cần gọi hiệu ứng gõ chữ, đã có trong watch

watch(
    () => props.lines,
    async (lines) => {
        await nextTick()
        if (!container.value || !lines?.length) return
        clearTimers()
        container.value.innerHTML = ""
        await revealLines(lines, container.value)
    },
    { immediate: true, deep: true }
)

onBeforeUnmount(() => {
    clearTimers()
    if (container.value) container.value.innerHTML = ""
})
</script>

<template>
    <section class="relative min-h-[calc(100dvh-4rem)] overflow-hidden flex items-center justify-center">
        <div class="bg-blur"></div>

        <div class="glass-card">
            <h1 class="text-center font-['Playfair_Display'] text-[22px] font-bold leading-snug text-white">
                {{ title }}
            </h1>

            <div class="mt-3 h-px bg-white/25"></div>

            <div ref="container" class="mt-3 space-y-1.5 text-white"></div>

            <div class="mt-4 flex justify-center">
                <button
                    class="px-4 py-2 rounded-full bg-white/90 text-neutral-900 text-[13px] shadow active:scale-[.98]"
                    @click="emit('next')">
                    Tiếp tục
                </button>
            </div>
        </div>
    </section>
</template>


<style scoped>
.bg-blur {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: url("/bg-blur.jpg") center / cover no-repeat;
    filter: blur(18px);
    opacity: 0.7;
}

.glass-card {
    position: relative;
    z-index: 10;
    width: 500px;
    max-width: 90vw;
    margin-left: auto;
    margin-right: auto;
    padding: 1rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, .2);
}
</style>