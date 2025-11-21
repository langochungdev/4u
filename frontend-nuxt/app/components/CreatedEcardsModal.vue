<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white rounded-lg p-4 w-full max-w-md border border-gray-300 shadow-lg">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-bold">Các mẫu đã tạo</h3>
          <div v-if="props.email" class="text-sm text-gray-500">{{ props.email }}</div>
        </div>
        <button @click="onClose" class="text-gray-600 hover:text-gray-900">✕</button>
      </div>
  <div v-if="loading" class="text-sm text-gray-600">Đang tải...</div>
  <div v-else>
        <div v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</div>
        <ul class="space-y-2">
          <li v-if="entries.length === 0" class="text-sm text-blue-500">Chưa có mẫu nào.</li>
          <li v-for="([id, url]) in entries" :key="id" class="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 rounded hover:bg-gray-50 border border-gray-200">
            <a :href="url" target="_blank" class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-sm font-medium text-blue-600">{{ getTemplateName(url) }}:</span>
              <span class="text-sm text-blue-500 truncate">{{ id }}</span>
            </a>
            <div class="flex items-center gap-2 ml-3">
              <button
                @click.stop="deleteEcard(id)"
                :disabled="!props.email"
                class="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
                aria-label="Xóa ecard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h.293l.853 9.647A2 2 0 006.138 18h7.724a2 2 0 001.992-1.353L16.707 6H17a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 012 0v7a1 1 0 11-2 0V7z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button @click="onClose" class="win2k-button">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetchActiveEcards } from '@/composables/useEcards'
import { setLocalStorageItem } from '@/utils/localstorage.helper'
import { contextService } from '@/pages/input/service/context.service'
import { userService } from '@/pages/input/service/user.service'

const props = defineProps({
  modelValue: Boolean,
  email: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const items = ref<Record<string, string>>({})
const loading = ref(false)
const error = ref('')
const entries = computed(() => Object.entries(items.value || {}))

function extractPublicId(url: string): { publicId: string, resourceType: string } {
  try {
    const u = new URL(url);
    const path = u.pathname;
    let resourceType = 'image'; // default
    if (path.includes('/video/upload/')) {
      resourceType = 'video';
    } else if (path.includes('/raw/upload/')) {
      resourceType = 'raw';
    } else if (path.includes('/image/upload/')) {
      resourceType = 'image';
    }
    const uploadIndex = path.indexOf('/upload/');
    if (uploadIndex === -1) return { publicId: '', resourceType };
    let afterUpload = path.substring(uploadIndex + 8); // e.g., v123/folder/public_id.jpg
    // Remove version if present (starts with v followed by digits)
    if (afterUpload.length > 1 && afterUpload.startsWith('v') && afterUpload[1] && /^\d/.test(afterUpload[1])) {
      const slashIndex = afterUpload.indexOf('/');
      if (slashIndex !== -1) {
        afterUpload = afterUpload.substring(slashIndex + 1);
      } else {
        // No folder, just version/public_id.jpg
        afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1 || 0);
      }
    }
    const dotIndex = afterUpload.lastIndexOf('.');
    if (dotIndex === -1) return { publicId: afterUpload, resourceType };
    return { publicId: afterUpload.substring(0, dotIndex), resourceType };
  } catch (e) {
    return { publicId: '', resourceType: 'image' };
  }
}

function getTemplateName(url: string) {
  try {
    const u = new URL(url);
    const t = u.searchParams.get('template');
    return (t && t.length) ? t : 'demo';
  } catch (e) {
    // Fallback: try manual query parsing
    const idx = url.indexOf('?');
    if (idx >= 0) {
      const q = url.substring(idx + 1).split('&');
      for (const kv of q) {
        const [k, v] = kv.split('=');
        if (k === 'template') return v || 'demo';
      }
    }
    return 'demo';
  }
}

watch(() => visible.value, async (v) => {
  if (!v) return
  if (!props.email) {
    items.value = {}
    return
  }
  loading.value = true
  error.value = ''
  try {
    const normalized = (props.email || '').trim().toLowerCase();
    const res = await fetchActiveEcards(normalized);
    items.value = res.map || {}
    setLocalStorageItem('activeEcardsCount', res.ids.length)
  } catch (e: any) {
    items.value = {}
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
})

// refresh when email changes while modal is open
watch(() => props.email, async () => {
  if (!visible.value) return
  if (!props.email) {
    items.value = {}
    return
  }
  loading.value = true
  error.value = ''
  try {
    const normalized = (props.email || '').trim().toLowerCase();
    const res = await fetchActiveEcards(normalized);
    items.value = res.map || {}
    setLocalStorageItem('activeEcardsCount', res.ids.length)
  } catch (e: any) {
    items.value = {}
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
})

function onClose() {
  visible.value = false
}

async function deleteEcard(id: string) {
  if (!props.email) return
  // Immediately hide the item from UI
  const copy = { ...items.value }
  const url = copy[id]
  delete copy[id]
  items.value = copy

  try {
    // Get context to retrieve media URLs
    const context = await contextService.getById(id)
    if (!context) {
      throw new Error('Context not found')
    }
    const allUrls = [
      ...(context.images || []),
      ...(context.videos || []),
      ...(context.audios || [])
    ]
    const mediaInfos = allUrls.map(extractPublicId).filter(info => info.publicId !== '')
    const mediaIds = mediaInfos.map(info => info.publicId)
    const resourceTypes = mediaInfos.map(info => info.resourceType)

    // Delete media on backend only if there are mediaIds
    if (mediaIds.length > 0) {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}user/ecard/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: props.email, mediaIds, resourceTypes })
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to delete media')
      }
    }

    // Delete from Firestore
    await contextService.delete(id)
    await userService.deleteEcardFromUser(props.email, id, '4U', 'develop') // Assuming firestoreRoot

    // Success: item already hidden, no further action needed
  } catch (e: any) {
    // On error: restore the item and show error
    const restoreCopy = { ...items.value }
    if (url) restoreCopy[id] = url
    items.value = restoreCopy
    error.value = e.message || String(e)
  }
}
</script>

<style scoped>
.win2k-button {
    border: 1px outset #d0d0c8;
    background-color: #e0e0e0;
    color: black;
    font-size: 14px;
    padding: 12px 24px;
    cursor: pointer;
    min-width: 120px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transition: none; /* disable animation for immediate click response */
}
</style>
