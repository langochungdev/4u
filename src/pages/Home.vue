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
            <h1 class="text-center text-3xl font-bold mb-8 text-pink-600">Chọn mẫu e-Card của bạn</h1>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div v-for="(card, index) in cards" :key="index"
                    class="bg-white shadow-lg rounded-2xl overflow-hidden hover:scale-105 transition cursor-pointer">
                    <img :src="card.thumbnail" alt="e-card" class="w-full h-48 object-cover" />
                    <div class="p-4 text-center">
                        <h2 class="font-semibold text-gray-700">{{ card.title }}</h2>
                        <div class="mt-4 flex justify-center space-x-2">
                            <button @click="goToDetail(card.id)" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                                Chi tiết
                            </button>
                            <button @click="buyCard(card.id)" class="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition">
                                Mua ngay
                            </button>
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

interface Card {
    id: string
    title: string
    thumbnail: string
}

const router = useRouter()

const cards: Card[] = [
    { id: 'love1', title: 'Lãng mạn cổ điển', thumbnail: '/images/card1.jpg' },
    { id: 'love2', title: 'Tối giản hiện đại', thumbnail: '/images/card2.jpg' },
    { id: 'love3', title: 'Màu pastel dịu nhẹ', thumbnail: '/images/card3.jpg' },
    { id: 'love4', title: 'Thư tay vintage', thumbnail: '/images/card4.jpg' },
    { id: 'love5', title: 'Hiện đại 3 ảnh', thumbnail: '/images/card5.jpg' },
]

function goToDetail(id: string) {
    router.push(`/detail/${id}`)
}

function buyCard(id: string) {
    router.push(`/buy/${id}`)
}
</script>

<style scoped>
@media (max-width: 640px) {
    img {
        height: 160px;
    }
}
</style>
