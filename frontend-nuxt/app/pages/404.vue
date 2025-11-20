<script setup lang="ts">
import { useRouter } from 'vue-router';

// @ts-ignore
definePageMeta({
  layout: 'empty'
})

const router = useRouter();

const goHome = () => {
  // @ts-ignore
  navigateTo('/');
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-100 to-purple-100">
    <div class="text-center p-8">
      <h1 class="text-9xl font-bold text-pink-500 mb-4">404</h1>
      <h2 class="text-3xl font-semibold text-gray-800 mb-4">Không tìm thấy trang</h2>
      <p class="text-gray-600 mb-8">Xin lỗi, trang bạn đang tìm kiếm không tồn tại.</p>
      <button 
        @click="goHome"
        class="px-6 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
      >
        Quay về trang chủ
      </button>
    </div>
  </div>
</template>
