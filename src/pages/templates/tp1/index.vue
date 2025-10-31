<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue"
import EnvelopeView from "@/pages/templates/tp1/EnvelopeView.vue"
import ContentView from "@/pages/templates/tp1/ContentView.vue"
import GridView from "@/pages/templates/tp1/GridView.vue"
import { useRoute } from "vue-router"
import { useLetter } from "@/composables/useLetter"

const route = useRoute()
const { title, content, images, loading, fetchLetter } = useLetter()

const step = ref<1 | 2 | 3>(1)
const progress = computed(() => (step.value === 1 ? 0 : step.value === 2 ? 67 : 100))
const lines = computed(() => content.value ? content.value.split("\n").filter(Boolean) : [])

const currentId = computed(() => {
    const raw = route.params.id
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : ""
})
watch(currentId, async (id) => {
    if (!id) return
    step.value = 1
    await fetchLetter(id)
}, { immediate: true })

function handleOpened() { step.value = 2 }
function handleNext() { step.value = 3 }
function handleBack() { step.value = 2 }
function handleReplay() { step.value = 1 }

async function startHearts() {
    const engine = (window as any).tsParticles
    if (!engine) return
    await nextTick()
    await engine.load({
        id: "hearts",
        options: {
            fpsLimit: 60,
            background: { color: "transparent" },
            particles: {
                number: { value: 28, density: { enable: true, area: 700 } },
                color: { value: ["#ff4d8d", "#ff9a9e", "#ffd1dc", "#fff0f3"] },
                shape: { type: "char", options: { char: { value: "❤", font: "serif", style: "", weight: "400" } } },
                opacity: { value: { min: .4, max: .95 } },
                size: { value: { min: 10, max: 26 } },
                move: { enable: true, speed: { min: 1, max: 2.6 }, direction: "bottom", outModes: "out", drift: 1.2 },
                rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 10 } },
                wobble: { enable: true, distance: 6, speed: { min: -3, max: 3 } },
                tilt: { enable: true, value: { min: 0, max: 360 }, direction: "random", animation: { enable: true, speed: 5 } }
            },
            interactivity: {
                events: { onHover: { enable: true, mode: "repulse" }, resize: true },
                modes: { repulse: { distance: 80, duration: 0.3 } }
            },
            detectRetina: true,
            fullScreen: { enable: false }
        }
    })
}
function stopHearts() {
    const engine = (window as any).tsParticles
    const dom = document.getElementById("hearts")
    if (engine && dom) dom.innerHTML = ""
}
watch(step, async (s, prev) => {
    if (s === 2) await startHearts()
    if (prev === 2 && s !== 2) stopHearts()
})

</script>

<template>
    <header class="fixed top-0 inset-x-0 z-40 px-3 py-2 safe shadow-lg rounded-b-2xl bg-white/70 backdrop-blur-md">
        <div class="flex items-center gap-3">
            <div class="text-[12px] font-bold tracking-widest uppercase text-pink-600 drop-shadow">Love</div>
            <div class="flex-1 h-2 rounded-full bg-neutral-200/70 overflow-hidden">
                <div class="h-full rounded-full bg-linear-to-r from-pink-400 via-fuchsia-400 to-pink-600 shadow transition-all" :style="{ width: progress + '%' }"></div>
            </div>
        </div>
    </header>

    <main class="relative pt-16 min-h-dvh overflow-hidden flex flex-col justify-center">

        <div v-if="step === 2" id="hearts" class="pointer-events-none absolute inset-0 z-10" style="display:block">
        </div>

        <div v-if="loading" class="relative z-20 text-center text-white/90 mt-10">Đang tải…</div>

        <EnvelopeView v-else v-show="step === 1" class="relative z-20 px-3 pb-3 grid place-items-center"
            @opened="handleOpened" />

        <ContentView v-show="step === 2" class="relative z-20 px-3 pb-3" :title="title" :lines="lines"
            @next="handleNext" />

        <GridView v-show="step === 3" class="relative z-20 px-2 pb-3" :images="images" @back="handleBack"
            @replay="handleReplay" />
    </main>

</template>

<style scoped>
main {
    background: url('@/assets/bg.webp') center/cover no-repeat;
    background-attachment: fixed;
}
</style>
