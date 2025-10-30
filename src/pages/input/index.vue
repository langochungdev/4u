<script setup lang="ts">
import { ref } from "vue";
import { useLetterForm } from "@/pages/input/useLetterForm";
import { createQRFromId } from "@/utils/prCode";

const { title, content, loading, submit, imageManager } = useLetterForm();

const qrImage = ref("");
const link = ref("");

const handleImage = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    imageManager.addImages(files);
};

const handleSubmit = async () => {
    const id = await submit(); 
    if (!id) return;

    const { link: fullLink, qrDataUrl } = await createQRFromId(id);
    link.value = fullLink;
    qrImage.value = qrDataUrl;
    console.log("ID thư:", id);
};
</script>

<template>
    <div class="p-4 max-w-md mx-auto flex flex-col gap-4 text-gray-800">
        <h1 class="text-xl font-semibold text-center">Tạo lá thư</h1>

        <input v-model="title" type="text" placeholder="Nhập tiêu đề..."
            class="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400" />

        <textarea v-model="content" rows="6" placeholder="Nhập nội dung..."
            class="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" />

        <div>
            <label class="block mb-2 text-sm font-medium">Chọn hình ảnh (có thể chọn nhiều)</label>
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
            class="w-full py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 disabled:opacity-50">
            {{ loading ? "Đang lưu..." : "Tạo lá thư" }}
        </button>

        <!-- Hiển thị QR sau khi tạo -->
        <div v-if="qrImage" class="text-center mt-4">
            <p class="text-sm break-all text-gray-600">{{ link }}</p>
            <img :src="qrImage" alt="QR Code" class="w-40 h-40 mx-auto" />
        </div>
    </div>
</template>
