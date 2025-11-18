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

  
  viewLink.value = `${window.location.origin}/${topic}/${template}/${id}`;
  editLink.value = `${window.location.origin}/input/${template}?id=${id}&topic=${topic}`;

  
  try {
    const contextData = await contextService.getById(id);
    if (contextData?.expiresAt) {
      
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

const downloadQr = async () => {
    if (!qrDataUrl.value) return;
    const link = document.createElement('a');
    link.href = qrDataUrl.value;
    const filename = `${templateName.value || 'qrcode'}_${contextId.value || ''}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
};

const showCopied = ref(false);
const copyViewLink = async () => {
  if (!viewLink.value) return;
  try {
    await navigator.clipboard.writeText(viewLink.value);
    showCopied.value = true;
    setTimeout(() => { showCopied.value = false; }, 1500);
  } catch (err) {
    console.warn('Failed to copy view link:', err);
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
                                
                                <div v-if="expiresAt" class="mb-4 p-4 bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg shadow-md">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm font-semibold text-orange-800">⏰ Thời gian còn lại:</span>
                    <span :class="[
                      'text-lg font-bold',
                      countdown === 'Đã hết hạn' ? 'text-red-600' : 'text-green-600'
                    ]">{{ countdown }}</span>
                                    </div>
                                    <div class="text-xs text-gray-600">
                                        Hết hạn lúc: {{ expiresAt.toLocaleString('vi-VN') }}
                                    </div>
                                </div>

                                

                                
                                <div class="qr-section">
                      <div class="qr-container">
                        <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="qr-code" />
                        <p class="qr-caption">Quét mã để xem nội dung</p>
                        <div class="qr-action-buttons">
                          <button
                            class="qr-button win2k-button"
                            :disabled="!viewLink"
                            @click="copyViewLink"
                            :title="viewLink ? 'Sao chép link' : 'Link chưa sẵn sàng'"
                            aria-label="Sao chép link"
                          >
                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M9 2h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Sao chép</span>
                          </button>
                          <button
                            class="qr-button win2k-button"
                            :disabled="!qrDataUrl"
                            @click="downloadQr"
                            :title="qrDataUrl ? 'Tải mã QR' : 'QR chưa sẵn sẵn sàng'"
                            aria-label="Tải mã QR"
                          >
                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M21 21H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Tải xuống</span>
                          </button>
                        </div>
                        <div v-if="showCopied" class="copy-notice">Đã sao chép</div>
                      </div>
                                </div>

                                
                                <div class="action-buttons">
                                    <a :href="viewLink" target="_blank" class="action-button win2k-button">
                                        👁️ Xem ngay
                                    </a>
                                    <a :href="editLink" class="action-button win2k-button">
                                        ✏️ Chỉnh sửa
                                    </a>
                                    
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
