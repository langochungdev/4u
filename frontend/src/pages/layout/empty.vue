<template>
    <!-- Empty layout - no header/footer -->
    <!-- Used for template pages, 404, or full-screen experiences -->
    
    <!-- Expired Message Overlay -->
    <div v-if="isExpired" class="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div class="max-w-2xl w-full">
            <div class="bg-red-50 border-2 border-red-300 rounded-lg shadow-lg p-8 text-center">
                <div class="text-6xl mb-4">⏰</div>
                <h2 class="text-2xl font-bold text-red-600 mb-3">
                    Link đã hết hạn
                </h2>
                <p class="text-gray-700 mb-2">
                    Nội dung này đã hết hạn vào lúc:
                </p>
                <p class="text-lg font-semibold text-red-500 mb-4">
                    {{ expiresAt?.toLocaleString('vi-VN') }}
                </p>
                
                <!-- 24h countdown -->
                <div class="bg-orange-100 border-2 border-orange-400 rounded-md p-4 mb-4">
                    <p class="text-sm font-semibold text-orange-800 mb-2">
                        ⏳ Thời gian gia hạn còn lại:
                    </p>
                    <p :class="[
                        'text-2xl font-bold',
                        countdown24h === 'Đã quá hạn gia hạn' ? 'text-red-600' : 'text-orange-600'
                    ]">
                        {{ countdown24h }}
                    </p>
                </div>
                
                <div class="bg-yellow-100 border border-yellow-400 rounded-md p-4 mt-4">
                    <p class="text-sm text-yellow-800">
                        💡 <strong>Yêu cầu gia hạn trong 24h tới</strong>
                    </p>
                    <p class="text-xs text-yellow-700 mt-1">
                        Vui lòng liên hệ người tạo để gia hạn nội dung này.
                    </p>
                </div>
                <button 
                    @click="$router.push('/')" 
                    class="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    🏠 Về trang chủ
                </button>
            </div>
        </div>
    </div>
    
    <!-- Normal content when not expired or in preview mode -->
    <slot v-else />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { contextService } from "@/pages/input/context.service";

const route = useRoute();
const isExpired = ref<boolean>(false);
const expiresAt = ref<Date | null>(null);
const isChecking = ref<boolean>(true);
const countdown24h = ref<string>('');
const countdownInterval = ref<number | null>(null);

const checkExpiration = (expiryDate: any): boolean => {
    if (!expiryDate) return false;
    
    let expiry: Date | null = null;
    
    // Convert Firestore Timestamp to Date
    if (expiryDate.toDate) {
        expiry = expiryDate.toDate();
    } else if (expiryDate instanceof Date) {
        expiry = expiryDate;
    } else if (typeof expiryDate === 'number') {
        expiry = new Date(expiryDate);
    }
    
    if (expiry) {
        expiresAt.value = expiry;
        return new Date() > expiry;
    }
    
    return false;
};

const updateCountdown24h = () => {
    if (!expiresAt.value) {
        countdown24h.value = '';
        return;
    }
    
    const now = new Date().getTime();
    const expiry = expiresAt.value.getTime();
    const deadline = expiry + (24 * 60 * 60 * 1000); // Add 24 hours
    const distance = deadline - now;
    
    if (distance < 0) {
        countdown24h.value = 'Đã quá hạn gia hạn';
        if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
        }
        return;
    }
    
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    countdown24h.value = `${hours} giờ ${minutes} phút ${seconds} giây`;
};

const startCountdown24h = () => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
    }
    updateCountdown24h();
    countdownInterval.value = window.setInterval(updateCountdown24h, 1000);
};

onMounted(async () => {
    // Only check expiration if we have an ID in params and NOT in preview mode
    const id = route.params.id as string;
    const isPreview = route.query.preview === "true";
    
    if (id && !isPreview) {
        try {
            const data = await contextService.getById(id);
            
            // If no data found, already deleted (past 24h grace period)
            if (!data) {
                isExpired.value = true;
                expiresAt.value = new Date(Date.now() - 25 * 60 * 60 * 1000);
                isChecking.value = false;
                return;
            }
            
            if (data.expiresAt) {
                isExpired.value = checkExpiration(data.expiresAt);
                if (isExpired.value) {
                    startCountdown24h();
                }
            }
        } catch (error) {
            // Error checking expiration - treat as deleted
            isExpired.value = true;
            expiresAt.value = new Date(Date.now() - 25 * 60 * 60 * 1000);
        }
    }
    
    isChecking.value = false;
});

// Cleanup countdown interval
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
        countdownInterval.value = null;
    })
});
</script>

<style scoped>
body,
html,
.empty-layout {
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
}
</style>

<style>
body {
    touch-action: manipulation;
    -webkit-touch-callout: none;
}
</style>

