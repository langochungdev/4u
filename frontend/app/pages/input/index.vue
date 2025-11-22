<script setup lang="ts">
// Redirect /input/ to /input/demo1 (default template)
const route = useRoute()
const router = useRouter()

onMounted(() => {
  const query = { ...route.query }
  
  // If coming from preview or has topic, try to preserve it
  const topic = query.topic as string || ''
  const template = topic ? `${topic}/demo1` : 'demo1'
  
  router.replace({
    path: `/input/${template}`,
    query
  })
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-4 text-gray-600">Đang chuyển hướng...</p>
    </div>
  </div>
</template>
