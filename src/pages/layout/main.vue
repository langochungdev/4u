<template>
    <div class="min-h-screen flex flex-col bg-background">
        <header
            class="sticky top-0 z-50 border-b border-gray-700 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <router-link to="/" class="flex items-center gap-2">
                        <div
                            class="bg-linear-to-r from-[#FFD700] via-[#00FFFF] to-[#FF2E63] bg-clip-text text-2xl font-bold text-transparent">
                            NEXTGEN
                        </div>
                        <span class="text-muted-foreground">Thiệp Tương Tác</span>
                    </router-link>

                    <div class="flex items-center gap-2">
                        <button @click="toggleLanguage"
                            class="flex items-center gap-2 rounded-md border border-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-globe">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                <path d="M2 12h20" />
                            </svg>
                            {{ language === 'vi' ? 'EN' : 'VI' }}
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
        <footer class="border-t border-gray-700 bg-gray-800 py-8 text-center text-white">
            <p>&copy; 2025 NEXTGEN. Tất cả quyền được bảo lưu.</p>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const language = ref<'vi' | 'en'>('vi');

const toggleLanguage = () => {
    language.value = language.value === 'vi' ? 'en' : 'vi';
};
</script>
