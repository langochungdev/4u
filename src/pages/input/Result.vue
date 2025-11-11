<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import QRCode from "qrcode";

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
  <div class="min-h-screen bg-linear-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        <p class="mt-4 text-gray-600">Đang tạo QR code...</p>
      </div>

      <div v-else-if="!contextId" class="text-center">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy ID</h2>
        <p class="text-gray-600">Vui lòng kiểm tra lại đường dẫn.</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="text-center border-b pb-6">
          <div class="text-5xl mb-3">🎉</div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Tạo thành công!</h1>
          <p class="text-gray-600">Template: <span class="font-semibold text-pink-600">{{ templateName }}</span></p>
          <p class="text-sm text-gray-500 mt-1">ID: {{ contextId }}</p>
        </div>

        <!-- Links Section -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-800">📎 Liên kết</h2>
          
          <!-- View Link -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-800">🔗 Xem nội dung</span>
              <button 
                @click="copyToClipboard(viewLink, 'Link xem')"
                class="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                📋 Copy
              </button>
            </div>
            <a 
              :href="viewLink" 
              target="_blank"
              class="text-blue-600 hover:text-blue-800 break-all text-sm underline"
            >
              {{ viewLink }}
            </a>
          </div>

          <!-- Edit Link -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-green-800">✏️ Chỉnh sửa</span>
              <button 
                @click="copyToClipboard(editLink, 'Link edit')"
                class="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
              >
                📋 Copy
              </button>
            </div>
            <a 
              :href="editLink" 
              target="_blank"
              class="text-green-600 hover:text-green-800 break-all text-sm underline"
            >
              {{ editLink }}
            </a>
          </div>
        </div>

        <!-- QR Code Section -->
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">📱 Mã QR</h2>
          <div class="inline-block bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
            <img 
              v-if="qrDataUrl" 
              :src="qrDataUrl" 
              alt="QR Code" 
              class="w-64 h-64 mx-auto"
            />
            <p class="text-xs text-gray-500 mt-3">Quét mã để xem nội dung</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4 border-t">
          <a 
            :href="viewLink"
            target="_blank"
            class="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors text-center font-medium"
          >
            👁️ Xem ngay
          </a>
          <a 
            :href="editLink"
            class="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors text-center font-medium"
          >
            ✏️ Chỉnh sửa
          </a>
          <button 
            @click="$router.push('/')"
            class="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            🏠 Trang chủ
          </button>
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
