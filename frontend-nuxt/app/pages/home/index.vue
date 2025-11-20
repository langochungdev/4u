<template>
            <EmailOtpModal v-model="showEmailModal" :defaultEmail="emailFromCookie || ''" @verified="onVerified" />
        <div class="min-h-screen bg-background text-foreground">

        <main class="container mx-auto px-4 py-12">
            <div class="mb-12">
                <div class="flex flex-wrap gap-3">
                    <button
                        @click="selectedTag = 'all'"
                        :class="['win2k-tag-button', selectedTag === 'all' ? 'selected' : '']">
                        Tất cả
                    </button>
                    <button
                        v-for="section in sections"
                        :key="section.id"
                        @click="selectedTag = section.id"
                        :class="['win2k-tag-button', selectedTag === section.id ? 'selected' : '']">
                        {{ section.title }}
                    </button>
                </div>
            </div>

            <div v-for="section in filteredSections" :key="section.id" class="mb-16">
                <div class="mb-8">
                    <h2 class="section-title">
                        {{ section.title }}
                    </h2>
                    <p v-if="section.description" class="section-description">
                        {{ section.description }}
                    </p>
                </div>

                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div v-for="card in section.cards" :key="card.id" class="window-border">
                        <div class="window text">
                            <div class="title-bar">
                                <div class="icon"></div>
                                <span :title="card.title">{{ truncateTitle(card.title) }}</span>
                                <div class="title-bar-buttons"></div>
                            </div>
                            <div class="text-area">
                                <div class="thumbnail-container cursor-pointer overflow-hidden" @click="goToDemo(section, card)" @mouseenter="prefetchInput; prefetchPreview(section, card)">
                                    <video v-if="card.thumbnailType === 'video'" :src="card.thumbnail"
                                        class="thumbnail-image"
                                        autoplay loop muted playsinline>
                                    </video>
                                    <img v-else :src="card.thumbnail" :alt="card.title"
                                        class="thumbnail-image" />
                                </div>

                                <div class="divider-line"></div>

                                <div class="p-4 flex flex-col">
                                    <p class="mb-2 line-clamp-1 text-sm text-black card-description">
                                        {{ card.description }}
                                    </p>
                                    <p v-if="card.createdBy" class="text-sm text-muted-foreground mt-1 card-description">
                                        Tạo bởi: {{ card.createdBy }}
                                    </p>
                                </div>
                            </div>
                            <div class="status-bar">
                                    <div class="flex gap-2 justify-center">
                                        <button @click="goToDemo(section, card)" @mouseenter="prefetchInput; prefetchPreview(section, card)" class="win2k-button">
                                            Demo
                                        </button>
                                        <button @click="buyCard(section, card)" @mouseenter="prefetchInput" class="win2k-button">
                                            Tạo thiệp
                                        </button>
                                    </div>
                            </div>
                        </div>
                        <div v-if="loadingDemo === getCardKey(section, card)" class="card-loading-overlay">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { HOME_SECTIONS, loadAllSections, type TemplateCard, type Section } from './home.config'

definePageMeta({
  layout: 'main'
})

const emailCookie = useCookie('email')
const loadingDemo = ref<string | null>(null)

function getCardKey(section: Section, card: TemplateCard) {
    return `${section.id}-${card.id}`
}

async function prefetchPreview(section: Section, card: TemplateCard) {
    try {
        // Preload template component
        await import(`../_templates/${section.id}/${card.id}/[id].vue`)
        return true
    } catch (_err) {
        // ignore
    }
    return false
}
const inputPrefetched = ref(false)

function prefetchInput() {
    if (inputPrefetched.value) return
    inputPrefetched.value = true
    try { import('../input/index.vue') } catch (_e) { }
}
const sections = ref<Section[]>([])
const isLoading = ref(true)
const selectedTag = ref<string>('all')
const showEmailModal = ref(false)
const emailFromCookie = ref<string | null>(null)
const pendingQuery = ref<Record<string, string> | null>(null)

const filteredSections = computed(() => {
    if (selectedTag.value === 'all') {
        return sections.value
    }
    return sections.value.filter(section => section.id === selectedTag.value)
})

onMounted(async () => {
    await loadAllSections();
    sections.value = HOME_SECTIONS;
    isLoading.value = false
    try {
        import('../input/index.vue')
    } catch (_err) {
    }
})

async function goToDemo(section: Section, card: TemplateCard) {
    const key = getCardKey(section, card)
    loadingDemo.value = key
    try {
        await navigateTo(`/${section.id}/${card.id}/${card.demoId}`)
    } catch (err) {
        console.warn('Navigation failed:', err)
    } finally {
        loadingDemo.value = null
    }
}

async function buyCard(section: Section, card: TemplateCard) {
    const query: Record<string, string> = {
        template: card.id,
        topic: section.id
    }

    const existing = emailCookie.value
    if (existing) {
        query.email = existing
        navigateTo({ path: `/input`, query })
        return
    }

    pendingQuery.value = query
    emailFromCookie.value = null
    showEmailModal.value = true
}

function truncateTitle(title: string | undefined | null, max = 30) {
    if (!title) return '';
    return title.length > max ? `${title.slice(0, max)}...` : title;
}

function onVerified(email: string) {
    emailCookie.value = email
    showEmailModal.value = false
    
    if (pendingQuery.value) {
        const q = { ...pendingQuery.value, email }
        navigateTo({ path: `/input`, query: q })
        pendingQuery.value = null
    } else {
        navigateTo({ path: `/input`, query: { email } })
    }
}
</script>

<style scoped src="./style.css">
</style>
