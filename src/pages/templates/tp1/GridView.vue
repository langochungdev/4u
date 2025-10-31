<script setup lang="ts">
import { onMounted, ref, watch } from "vue"

const props = defineProps<{ images: string[] }>()
const emit = defineEmits<{ (e: "back"): void; (e: "replay"): void }>()
const imgEls = ref<(HTMLImageElement | null)[]>([null, null, null, null])

function setImgRef(el: HTMLImageElement | null, i: number) {
    imgEls.value[i] = el
}

function animateGridIn() {
    const gsapAny = (window as any).gsap
    if (!gsapAny) return
    const els = imgEls.value
    // guard đủ 4 phần tử và không null
    if (els.some(el => !el)) return
    gsapAny.set(els, { scale: 1.06 })
    gsapAny.fromTo(els[0], { xPercent: -18, yPercent: -18, opacity: 0 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: .5, ease: "power2.out" })
    gsapAny.fromTo(els[1], { xPercent: 18, yPercent: -18, opacity: 0 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: .5, ease: "power2.out", delay: .04 })
    gsapAny.fromTo(els[2], { xPercent: -18, yPercent: 18, opacity: 0 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: .5, ease: "power2.out", delay: .08 })
    gsapAny.fromTo(els[3], { xPercent: 18, yPercent: 18, opacity: 0 }, { xPercent: 0, yPercent: 0, opacity: 1, duration: .5, ease: "power2.out", delay: .12 })
}

onMounted(animateGridIn)
watch(() => props.images, animateGridIn)
</script>

<template>
    <section class="min-h-screen flex flex-col justify-center items-center">
        <div class="max-w-[500px] w-full grid grid-cols-2 gap-2.5">
            <div v-for="(img, i) in props.images.slice(0, 6)" :key="i"
                class="group relative rounded-2xl overflow-hidden ig-ring">
                <img :ref="(el) => setImgRef(el as HTMLImageElement | null, i)" :src="img"
                    class="h-full w-full object-cover" alt="" />
            </div>
        </div>
        <button class="mt-3 pt-2 px-4 py-2 rounded-full bg-white/90 text-neutral-900 text-[13px] shadow"
            @click="emit('back')">Quay lại</button>
    </section>
</template>
