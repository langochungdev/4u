<script setup lang="ts">
import { ref } from "vue";
import { useLetterForm } from "@/pages/input/useLetterForm";
import { createQRFromId } from "@/utils/prCode";

const { title, content, loading, submit, imageManager } = useLetterForm();

const qrImage = ref("");
const link = ref("");

const handleImage = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    const currentCount = imageManager.images.value.length;
    const maxToAdd = 6 - currentCount;
    if (maxToAdd <= 0) return;
    const filesToAdd = Array.from(files).slice(0, maxToAdd);
    imageManager.addImages(filesToAdd);
};

const handleSubmit = async () => {
    const id = await submit(); 
    if (!id) return;

    const { link: fullLink, qrDataUrl } = await createQRFromId(id);
    link.value = fullLink;
    qrImage.value = qrDataUrl;
    console.log("ID thư:", id);
};

const resetForm = () => {
    qrImage.value = '';
    link.value = '';
    title.value = '';
    content.value = '';
    imageManager.clearAll();
};
</script>

<template>
    <div class="input-page min-h-screen flex flex-col justify-center items-center">
    <div class="w-full max-w-md flex flex-col gap-4 px-4 py-6 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl">
            <template v-if="!qrImage">

                <input v-model="title" type="text" placeholder="Nhập tiêu đề..."
                    class="liquid-input w-full p-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/5 backdrop-blur-2xl font-semibold text-gray-900 transition-all shadow" />

                <textarea v-model="content" rows="6" placeholder="Nhập nội dung..."
                    class="liquid-input w-full p-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none bg-white/5 backdrop-blur-2xl font-medium text-gray-900 transition-all shadow" />

                <div>
                    <label class="block mb-2 text-sm font-medium text-pink-700">Chọn hình ảnh (tối đa 6 ảnh)</label>
                    <input type="file" accept="image/*" multiple @change="handleImage"
                        class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200" />

                    <div v-if="imageManager.previews.value.length > 0" class="mt-3 grid grid-cols-2 gap-3">
                        <div v-for="(preview, index) in imageManager.previews.value" :key="index" class="relative">
                            <img :src="preview" alt="Preview" class="rounded-xl w-full h-32 object-cover" />
                            <button @click="imageManager.removeImage(index)" type="button"
                                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs font-bold">
                                ×
                            </button>
                        </div>
                    </div>
                </div>

                <button @click="handleSubmit" :disabled="loading"
                    class="w-full py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 disabled:opacity-50 transition-all">
                    {{ loading ? "Đang lưu..." : "Tạo lá thư" }}
                </button>
            </template>

            <template v-else>
                <div class="min-h-[60vh] flex flex-col justify-center items-center gap-4 text-center">
                    <p class="text-sm break-all text-gray-700 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl px-3 py-2 shadow">{{ link }}</p>
                    <img :src="qrImage" alt="QR Code" class="w-40 h-40 mx-auto" />
                    <button @click="resetForm"
                        class="mt-4 px-6 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-all">
                        Tạo mới
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>


<style scoped>
.input-page {
    background: url('@/assets/bg.webp') center/cover no-repeat;
    background-attachment: fixed;
    min-height: 100vh;
}
.liquid-input {
    position: relative;
    transition: box-shadow 0.3s, border-color 0.3s, background 0.3s;
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
}
.liquid-input:focus {
    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.18), 0 2px 16px 0 rgba(236, 72, 153, 0.12);
    border-color: #ec4899;
    background: rgba(255,255,255,0.12);
}
</style>