<script setup lang="ts">
import { ref, computed } from "vue";
import { useTemplateData } from "@/composables/useTemplateData";
import TEMPLATE_CONFIG from "./config";

// Lấy dữ liệu từ template service
const { contextData } = useTemplateData(TEMPLATE_CONFIG);

// Lấy mã số và nội dung thư từ contextData
const correctCode = computed(() => contextData.value?.content?.[0] || "");
const savedLetter = computed(() => contextData.value?.content?.[1] || "");
const title = computed(() => contextData.value?.content?.[2] || "");
const code = ref("");
// Default password that always works
const DEFAULT_PASSWORD = "1234";
const isSubmitted = ref(false);

// Khi nhập mã xong
function handleSubmitCode() {
  // Trim leading/trailing whitespace in case user pasted with spaces
  const entered = code.value.trim();
  if (entered === correctCode.value || entered === DEFAULT_PASSWORD) {
    isSubmitted.value = true;
  } else {
    alert("Mã chưa đúng đâu, thử lại nhé 💕");
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-pink-100 to-rose-200 overflow-hidden">
    <!-- Form nhập mã bí mật -->
    <div v-if="!isSubmitted" class="bg-white/80 p-8 rounded-2xl shadow-lg text-center backdrop-blur-sm">
      <h1 class="text-3xl font-bold text-pink-600 mb-4">💞 Kỷ niệm tình yêu 💞</h1>
      <input
        v-model="code"
        type="text"
        class="border-2 border-pink-400 rounded-lg p-2 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
        placeholder="••••"
        @keyup.enter="handleSubmitCode"
      />
      <button
        @click="handleSubmitCode"
        class="mt-6 bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition"
      >
        Gửi 💌
      </button>
    </div>

    <!-- Khi nhập mã đúng: Hiển thị thư -->
    <div
      v-else
      class="relative w-full min-h-screen flex flex-col items-center justify-center text-center p-6"
    >
      <div class="bg-white/90 p-8 rounded-2xl backdrop-blur-lg shadow-lg w-[95%] max-w-4xl">
        <h2 class="text-4xl font-bold text-pink-700 mb-8 drop-shadow-md">
          {{title}}
        </h2>

        <!-- Nội dung thư - dạng lá thư dài -->
        <div class="relative w-full bg-pink-50/50 rounded-xl shadow-md">
          <div class="p-8 border-2 border-pink-200/50 rounded-xl">
            <div class="text-lg text-pink-600 whitespace-pre-wrap leading-relaxed wrap-break-word max-w-full">
              {{ savedLetter }}
            </div>
          </div>
        </div>

      </div>

      <!-- Ảnh trang trí bay xung quanh -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          v-for="(img, index) in contextData?.images"
          :key="index"
          :src="img"
          class="absolute w-32 h-32 object-cover rounded-full opacity-80 animate-float"
          :style="{
            top: `${Math.random() * 20}%`,
            left: `${Math.random() * 70}%`,
            transform: `rotate(${Math.random() * 160}deg)`
          }"
        />
        
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Animation cho ảnh bay */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Custom scrollbar cho phần nội dung */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 192, 203, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(236, 72, 153, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(236, 72, 153, 0.5);
}
</style>
