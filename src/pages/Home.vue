<template>
    <div class="min-h-screen flex flex-col">
        <!-- Header -->
        <header class="bg-white shadow-md">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center">
                        <h1 class="text-2xl font-bold text-pink-600">4U e-Card</h1>
                    </div>
                    <nav class="hidden md:flex space-x-8">
                        <a href="#" class="text-gray-700 hover:text-pink-600">Trang chủ</a>
                        <a href="#" class="text-gray-700 hover:text-pink-600">Mẫu thẻ</a>
                        <a href="#" class="text-gray-700 hover:text-pink-600">Liên hệ</a>
                        <a href="#" class="text-gray-700 hover:text-pink-600">VN/EN</a>
                    </nav>
                    <div class="md:hidden">
                        <button class="text-gray-700 hover:text-pink-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="grow bg-pink-50 p-4 md:p-10">
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
                            <video v-if="card.thumbnailType === 'video'" 
                                :src="card.thumbnail" 
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                autoplay loop muted playsinline>
                            </video>
                            <img v-else 
                                :src="card.thumbnail" 
                                :alt="card.title" 
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            
                            <!-- Overlay on hover -->
                                <span class="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                                    Xem Demo
                                </span>
                        </div>

                        <!-- Card Content -->
                        <div class="p-4">
                            <h3 class="font-semibold text-gray-800 text-lg mb-1">{{ card.title }}</h3>
                            <p class="text-gray-600 text-sm mb-4">{{ card.description }}</p>
                            
                            <div class="flex gap-2">
                                <button @click="goToDemo(card.demoLink)" 
                                    class="flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium">
                                    Demo
                                </button>
                                <button @click="buyCard(card)" 
                                    class="flex-1 bg-linear-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition font-medium">
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">4U e-Card</h3>
                        <p class="text-gray-300">Tạo những tấm thiệp điện tử đẹp và ý nghĩa cho mọi dịp.</p>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Liên kết</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-300 hover:text-white">Trang chủ</a></li>
                            <li><a href="#" class="text-gray-300 hover:text-white">Mẫu thẻ</a></li>
                            <li><a href="#" class="text-gray-300 hover:text-white">Hướng dẫn</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Liên hệ</h3>
                        <p class="text-gray-300">Email: info@4ucard.com</p>
                        <p class="text-gray-300">Điện thoại: 0123 456 789</p>
                    </div>
                </div>
                <div class="mt-8 pt-8 border-t border-gray-700 text-center">
                    <p class="text-gray-300">&copy; 2025 4U e-Card. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HOME_SECTIONS, type TemplateCard } from './home.config'

const router = useRouter()
const sections = HOME_SECTIONS

function goToDemo(demoLink: string) {
    router.push(demoLink)
}

function buyCard(card: TemplateCard) {
    // Navigate to buy page using configured buyLink
    router.push(card.buyLink)
}
</script>

<style scoped>
@media (max-width: 640px) {
    img {
        height: 160px;
    }
}
</style>
