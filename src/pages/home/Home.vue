<template>
    <!-- Main Content -->
    <div class="bg-pink-50 p-4 md:p-10">
        <!-- Banner Section -->
        <div class="mb-12 bg-white shadow-lg rounded-2xl overflow-hidden">
            <img src="/banner.jpeg" alt="Banner" class="w-full aspect-video object-cover max-h-64" />
        </div>

        <h1 class="text-center text-3xl font-bold mb-12 text-pink-600">Chọn mẫu e-Card của bạn</h1>

        <!-- Sections -->
        <div v-for="section in sections" :key="section.id" class="mb-16">
            <!-- Section Header -->
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ section.title }}</h2>
                <p v-if="section.description" class="text-gray-600">{{ section.description }}</p>
            </div>

            <!-- Cards Grid -->
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div v-for="card in section.cards" :key="card.id"
                    class="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                    <!-- Thumbnail -->
                    <div class="relative h-48 overflow-hidden">
                        <video v-if="card.thumbnailType === 'video'" :src="card.thumbnail"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                            autoplay loop muted playsinline @click="goToDemo(card.demoLink)">
                        </video>
                        <img @click="goToDemo(card.demoLink)" v-else :src="card.thumbnail" :alt="card.title"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer" />
                    </div>

                    <div class="p-4">
                        <h3 class="font-semibold text-gray-800 text-lg mb-1">{{ card.title }}</h3>
                        <p class="text-gray-600 text-sm mb-4">{{ card.description }}</p>

                        <div class="flex gap-2">
                            <button @click="goToDemo(card.demoLink)"
                                class="cursor-pointer flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium">
                                Demo
                            </button>
                            <button @click="buyCard(card)"
                                class="cursor-pointer flex-1 bg-linear-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition font-medium">
                                Tạo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HOME_SECTIONS, type TemplateCard } from './config/home.config'

const router = useRouter()
const sections = HOME_SECTIONS

function goToDemo(demoLink: string) {
    router.push(demoLink)
}

function buyCard(card: TemplateCard) {
    router.push(card.createLink)
}
</script>

<style scoped>
@media (max-width: 640px) {
    img {
        height: 160px;
    }
}
</style>
