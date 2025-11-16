<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import QRCode from "qrcode";
import { contextService } from "./context.service";
import "./css/result.css";

const route = useRoute();
const qrDataUrl = ref<string>("");
const viewLink = ref<string>("");
const editLink = ref<string>("");
const templateName = ref<string>("");
const contextId = ref<string>("");
const loading = ref(true);
const expiresAt = ref<Date | null>(null);
const countdown = ref<string>("");
const countdownInterval = ref<number | null>(null);

const updateCountdown = () => {
    if (!expiresAt.value) {
        countdown.value = '';
        return;
    }
    
    const now = new Date().getTime();
    const expiry = expiresAt.value.getTime();
    const distance = expiry - now;
    
    if (distance < 0) {
        countdown.value = 'Đã hết hạn';
        if (countdownInterval.value) {
            clearInterval(countdownInterval.value);
            countdownInterval.value = null;
        }
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    countdown.value = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
};

const startCountdown = () => {
    if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
    }
    updateCountdown();
    countdownInterval.value = window.setInterval(updateCountdown, 1000);
};

onMounted(async () => {
  const id = route.params.id as string;
  const template = route.query.template as string || 'demo';
  const topic = route.query.topic as string || '';
  
  if (!id) {
    loading.value = false;
    return;
  }

  contextId.value = id;
  templateName.value = template;

  // Create links
  viewLink.value = `${window.location.origin}/${topic}/${template}/${id}`;
  editLink.value = `${window.location.origin}/input/${template}?id=${id}&topic=${topic}`;

  // Fetch context data to get expiresAt
  try {
    const contextData = await contextService.getById(id);
    if (contextData?.expiresAt) {
      // Convert Firestore Timestamp to Date
      if (contextData.expiresAt.toDate) {
        expiresAt.value = contextData.expiresAt.toDate();
      } else if (contextData.expiresAt instanceof Date) {
        expiresAt.value = contextData.expiresAt;
      } else if (typeof contextData.expiresAt === 'number') {
        expiresAt.value = new Date(contextData.expiresAt);
      }
      
      if (expiresAt.value) {
        startCountdown();
      }
    }
  } catch (error) {
    console.error("Error fetching context:", error);
  }

  // Generate QR code
  try {
    qrDataUrl.value = await QRCode.toDataURL(viewLink.value, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
});

const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert(`${type} đã được copy!`);
  } catch (error) {
    console.error("Error copying to clipboard:", error);
  }
};
</script>

<template>
    <div class="result-container">
        <div class="result-window">
            <div class="window-border">
                <div class="window result-form">
                    <div class="title-bar">
                        <div class="icon"></div>
                        Template: <span class="font-semibold text-pink-600">{{ templateName}}</span>
                        <div class="title-bar-buttons"></div>
                    </div>
                    <div class="text-area">
                        <div class="result-content">
                            <div v-if="loading" class="loading-container">
                                <div class="loading-spinner"></div>
                                <p class="loading-text">Đang tạo QR code...</p>
                            </div>

                            <div v-else-if="!contextId" class="error-container">
                                <div class="error-emoji">❌</div>
                                <h2 class="error-title">Không tìm thấy ID</h2>
                                <p class="error-text">Vui lòng kiểm tra lại đường dẫn.</p>
                            </div>

                            <div v-else class="space-y-6">
                                <!-- Countdown Section -->
                                <div v-if="expiresAt" class="mb-4 p-4 bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg shadow-md">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm font-semibold text-orange-800">⏰ Thời gian còn lại:</span>
                                        <span :class="[
                                            'text-lg font-bold',
                                            countdown === 'Đã hết hạn' ? 'text-red-600' : 'text-green-600'
                                        ]">
                                            {{ countdown }}
                                        </span>
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        Hết hạn lúc: {{ expiresAt.toLocaleString('vi-VN') }}
                                    </div>
                                </div>

                                <!-- <div class="result-section">
                                    <div class="link-card">
                                        <div class="link-header">
                                            <span class="link-label">🔗 Xem nội dung</span>
                                            <button @click="copyToClipboard(viewLink, 'Link xem')"
                                                class="file-input-button">
                                                📋 Copy
                                            </button>
                                        </div>
                                        <a :href="viewLink" target="_blank" class="link-url">
                                            {{ viewLink }}
                                        </a>
                                    </div>

                                    <div class="link-card">
                                        <div class="link-header">
                                            <span class="link-label">✏️ Chỉnh sửa</span>
                                            <button @click="copyToClipboard(editLink, 'Link edit')"
                                                class="file-input-button">
                                                📋 Copy
                                            </button>
                                        </div>
                                        <a :href="editLink" target="_blank" class="link-url">
                                            {{ editLink }}
                                        </a>
                                    </div>
                                </div> -->

                                <!-- QR Code Section -->
                                <div class="qr-section">
                                    <div class="qr-container">
                                        <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="qr-code" />
                                        <p class="qr-caption">Quét mã để xem nội dung</p>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
                                <div class="action-buttons">
                                    <a :href="viewLink" target="_blank" class="action-button win2k-button">
                                        👁️ Xem ngay
                                    </a>
                                    <a :href="editLink" class="action-button win2k-button">
                                        ✏️ Chỉnh sửa
                                    </a>
                                    <!-- <button @click="$router.push('/')" class="action-button win2k-button">
                                        🏠 Trang chủ
                                    </button> -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="status-bar">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
