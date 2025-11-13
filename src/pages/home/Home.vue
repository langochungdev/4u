<template>
    <div class="min-h-screen bg-background text-foreground">

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-12">
            <!-- Tag Filter -->
            <div class="mb-12">
                <h2 class="mb-4 text-2xl font-bold text-[#00FFFF]">Chọn chủ đề</h2>
                <div class="flex flex-wrap gap-3">
                    <button
                        @click="selectedTag = 'all'"
                        :class="[
                            'rounded-full px-6 py-2.5 font-medium transition-all',
                            selectedTag === 'all'
                                ? 'bg-[#00FFFF] text-black shadow-lg shadow-[#00FFFF]/50'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                        ]">
                        Tất cả
                    </button>
                    <button
                        v-for="section in sections"
                        :key="section.id"
                        @click="selectedTag = section.id"
                        :class="[
                            'rounded-full px-6 py-2.5 font-medium transition-all',
                            selectedTag === section.id
                                ? 'bg-[#00FFFF] text-black shadow-lg shadow-[#00FFFF]/50'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                        ]">
                        {{ section.title }}
                    </button>
                </div>
            </div>
            <!-- Sections -->
            <div v-for="section in filteredSections" :key="section.id" class="mb-16">
                <!-- Section Header -->
                <div class="mb-8">
                    <h2
                        class="mb-2 text-3xl font-bold text-[#00FFFF]">
                        {{ section.title }}
                    </h2>
                    <p v-if="section.description" class="text-muted-foreground">
                        {{ section.description }}
                    </p>
                </div>

                <!-- Cards Grid -->
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div v-for="card in section.cards" :key="card.id"
                        class="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:scale-105 hover:border-[#00FFFF] hover:shadow-lg hover:shadow-[#00FFFF]/20">
                        <!-- Thumbnail -->
                        <div class="aspect-16/10 cursor-pointer overflow-hidden" @click="goToDemo(section, card)">
                            <video v-if="card.thumbnailType === 'video'" :src="card.thumbnail"
                                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                autoplay loop muted playsinline>
                            </video>
                            <img v-else :src="card.thumbnail" :alt="card.title"
                                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        </div>

                        <div class="p-4 grow">
                            <h3 class="mb-2 line-clamp-1 font-semibold">{{ card.title }}</h3>
                            <p class="mb-2 line-clamp-2 text-sm text-muted-foreground">
                                {{ card.description }}
                            </p>
                            <p v-if="card.createdBy" class="text-sm text-muted-foreground">
                                Tạo bởi: {{ card.createdBy }}
                            </p>
                        </div>

                        <div class="p-4 pt-0">
                            <div class="flex gap-2">
                                <button @click="goToDemo(section, card)"
                                    class="w-full cursor-pointer rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600">
                                    Demo
                                </button>
                                <button @click="buyCard(section, card)"
                                    class="w-full cursor-pointer rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600">
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
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { HOME_SECTIONS, loadAllSections, type TemplateCard, type Section } from './home.config'
import { getTemplateConfig } from '@/config/templates'

const router = useRouter()
const sections = ref<Section[]>([])
const isLoading = ref(true)
const selectedTag = ref<string>('all')

// Computed property để filter sections theo tag được chọn
const filteredSections = computed(() => {
    if (selectedTag.value === 'all') {
        return sections.value
    }
    return sections.value.filter(section => section.id === selectedTag.value)
})

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
