<script setup lang="ts">
const route = useRoute()
const topic = route.params.topic as string
const template = route.params.template as string

definePageMeta({
  layout: 'preview',
  ssr: false
})

const templateModules = import.meta.glob('~/pages/_templates/*/*/[id].vue')
const templatePath = `/pages/_templates/${topic}/${template}/[id].vue`

const componentLoader = templateModules[templatePath]

if (!componentLoader) {
  const availableKeys = Object.keys(templateModules)
  console.error('Template not found:', {
    topic,
    template,
    templatePath,
    availableKeys
  })
  throw createError({ statusCode: 404, statusMessage: `Template not found: ${templatePath}` })
}

const TemplateComponent = await componentLoader() as any
</script>

<template>
  <component :is="TemplateComponent.default" />
</template>
