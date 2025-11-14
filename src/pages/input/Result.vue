<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import QRCode from "qrcode";
import "./result.css";

const route = useRoute();
const qrDataUrl = ref<string>("");
const viewLink = ref<string>("");
const editLink = ref<string>("");
const templateName = ref<string>("");
const contextId = ref<string>("");
const loading = ref(true);

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
                                <div class="result-section">
                                    <!-- View Link -->
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

                                    <!-- Edit Link -->
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
                                </div>

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
                                    <button @click="$router.push('/')" class="action-button win2k-button">
                                        🏠 Trang chủ
                                    </button>
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
