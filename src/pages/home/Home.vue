<template>
    <div class="min-h-screen bg-background text-foreground">
        <!-- Hero Section -->
        <div
            class="relative overflow-hidden border-b bg-linear-to-br from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F] text-white">
            <div
                class="absolute inset-0 bg-[linear-gradient(to_right,#FFD70010_1px,transparent_1px),linear-gradient(to_bottom,#FFD70010_1px,transparent_1px)] bg-size-[4rem_4rem]">
            </div>
            <div class="absolute inset-0 bg-linear-to-r from-[#FFD700]/5 via-[#00FFFF]/5 to-[#FF2E63]/5"></div>

            <main class="container relative mx-auto px-4 py-12">
                <div class="mb-12 text-center">
                    <h1
                        class="mb-4 bg-linear-to-r from-[#FFD700] via-[#00FFFF] to-[#FF2E63] bg-clip-text text-5xl font-bold text-transparent">
                        Tạo Thiệp Tương Tác Trực Tuyến
                    </h1>
                    <p class="mx-auto max-w-2xl text-gray-300">
                        Thiết kế và chia sẻ những tấm thiệp độc đáo với hiệu ứng tương
                        tác đầy sáng tạo cho mọi dịp đặc biệt
                    </p>
                </div>
            </main>
        </div>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-12">
            <!-- Sections -->
            <div v-for="section in sections" :key="section.id" class="mb-16">
                <!-- Section Header -->
                <div class="mb-8">
                    <h2
                        class="mb-2 bg-linear-to-r from-[#FFD700] via-[#00FFFF] to-[#FF2E63] bg-clip-text text-3xl font-bold text-transparent">
                        {{ section.title }}
                    </h2>
                    <p v-if="section.description" class="text-muted-foreground">
                        {{ section.description }}
                    </p>
                </div>

                <!-- Cards Grid -->
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div v-for="card in section.cards" :key="card.id"
                        class="group relative overflow-hidden rounded-lg border bg-card transition-all hover:scale-105 hover:border-[#00FFFF] hover:shadow-lg hover:shadow-[#00FFFF]/20">
                        <!-- Thumbnail -->
                        <div class="aspect-4/3 cursor-pointer overflow-hidden" @click="goToDemo(section, card)">
                            <video v-if="card.thumbnailType === 'video'" :src="card.thumbnail"
                                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                autoplay loop muted playsinline>
                            </video>
                            <img v-else :src="card.thumbnail" :alt="card.title"
                                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        </div>

                        <div class="p-4">
                            <h3 class="mb-2 line-clamp-1 font-semibold">{{ card.title }}</h3>
                            <p class="mb-2 line-clamp-2 text-sm text-muted-foreground">
                                {{ card.description }}
                            </p>
                            <p v-if="card.createdBy" class="mb-4 text-sm text-muted-foreground">
                                Tạo bởi: {{ card.createdBy }}
                            </p>

                            <div class="flex gap-2">
                                <button @click="goToDemo(section, card)"
                                    class="w-full cursor-pointer rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600">
                                    Demo
                                </button>
                                <button @click="buyCard(section, card)"
                                    class="w-full cursor-pointer rounded-md bg-linear-to-r from-[#FFD700] to-[#00FFFF] px-4 py-2 text-black hover:opacity-90">
                                    Tạo thiệp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { HOME_SECTIONS, loadAllSections, type TemplateCard, type Section } from './home.config'
import { getTemplateConfig } from '@/config/templates'

const router = useRouter()
const sections = ref<Section[]>([])
const isLoading = ref(true)

onMounted(async () => {
    // Load tất cả sections
    await loadAllSections();
    
    // Gán sau khi load xong
    sections.value = HOME_SECTIONS;
    
    isLoading.value = false
})

function goToDemo(section: Section, card: TemplateCard) {
    router.push(`/${section.id}/${card.id}/${card.demoId}`)
}

async function buyCard(section: Section, card: TemplateCard) {
    const templatePath = `${section.id}/${card.id}`;
    const config = await getTemplateConfig(templatePath);
    
    if (config) {
        router.push({
            path: `/input`,
            query: {
                template: card.id,
                topic: section.id,
                maxImages: config.maxImages.toString(),
                maxVideos: config.maxVideos.toString(),
                maxAudios: config.maxAudios.toString(),
                maxContent: config.maxContent.toString()
            }
        })
    } else {
        // Fallback nếu không tìm thấy config
        router.push(`/${section.id}/${card.id}`)
    }
}
</script>

<style scoped>

.text-foreground {
    color: #f8f8f8;
    /* light text */
}

.text-muted-foreground {
    color: #a0a0a0;
    /* muted text */
}

.border {
    border-color: #2a2a2a;
}

.bg-card {
    background-color: #1a1a1a;
}
</style>
