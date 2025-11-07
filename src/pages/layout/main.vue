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

        <!-- Main Content (slot cho các page) -->
        <main class="grow">
            <slot />
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
// Main layout with header and footer
// Used for pages that need standard layout (Home, Input, Result, etc.)
</script>
