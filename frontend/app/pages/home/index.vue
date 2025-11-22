<template>
    <EmailOtpModal v-model="showEmailModal" :defaultEmail="emailFromCookie || ''" @verified="onVerified" />
    <div class="min-h-screen bg-background text-foreground">
        <!-- Loading Skeleton -->
        <main v-if="isLoading" class="container mx-auto px-4 py-12">
            <div class="mb-12">
                <div class="flex flex-wrap gap-3">
                    <div v-for="i in 5" :key="i" class="skeleton-tag"></div>
                </div>
            </div>
            <div class="mb-16">
                <div class="skeleton-title mb-8"></div>
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div v-for="i in 8" :key="i" class="skeleton-card"></div>
                </div>
            </div>
        </main>

        <!-- Actual Content -->
        <main v-else class="container mx-auto px-4 py-12 fade-in">
            <div class="mb-12">
                <nav class="flex flex-wrap gap-3" role="navigation" aria-label="Template categories">
                    <a
                        href="#all"
                        @click.prevent="selectedTag = 'all'"
                        :class="['win2k-tag-button', selectedTag === 'all' ? 'selected' : '']"
                        :aria-current="selectedTag === 'all' ? 'page' : undefined">
                        Tất cả mẫu thiệp
                    </a>
                    <a
                        v-for="section in sections"
                        :key="section.id"
                        :href="`#${section.id}`"
                        @click.prevent="selectedTag = section.id"
                        :class="['win2k-tag-button', selectedTag === section.id ? 'selected' : '']"
                        :aria-current="selectedTag === section.id ? 'page' : undefined">
                        {{ section.title }}
                    </a>
                </nav>
            </div>

            <section v-for="section in filteredSections" :key="section.id" :id="section.id" class="mb-16" :aria-labelledby="`section-${section.id}`">
                <header class="mb-8">
                    <h2 :id="`section-${section.id}`" class="section-title">
                        {{ section.title }}
                    </h2>
                    <p v-if="section.description" class="section-description">
                        {{ section.description }}
                    </p>
                </header>

                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div v-for="card in section.cards" :key="card.id" class="window-border">
                        <div class="window text">
                            <div class="title-bar">
                                <div class="icon"></div>
                                <span :title="card.title">{{ truncateTitle(card.title) }}</span>
                                <div class="title-bar-buttons"></div>
                            </div>
                            <div class="text-area">
                                <div class="thumbnail-container cursor-pointer overflow-hidden" @click="goToDemo(section, card)" @mouseenter="prefetchPreview(section, card)">
                                    <video v-if="card.thumbnailType === 'video'" :src="card.thumbnail"
                                        class="thumbnail-image"
                                        autoplay loop muted playsinline
                                        loading="lazy"
                                        preload="none">
                                    </video>
                                    <img v-else :src="card.thumbnail" :alt="card.title"
                                        class="thumbnail-image"
                                        loading="lazy"
                                        decoding="async"
                                        fetchpriority="low"
                                        width="300"
                                        height="200" />
                                </div>

                                <div class="divider-line"></div>

                                <div class="p-4 flex flex-col">
                                    <p class="mb-2 line-clamp-1 text-sm text-black card-description">
                                        {{ card.description }}
                                    </p>
                                    <p v-if="card.createdBy" class="text-sm text-gray-600 mt-1 card-description">
                                        Tạo bởi: {{ card.createdBy }}
                                    </p>
                                </div>
                            </div>
                            <div class="status-bar">
                                    <div class="flex gap-2 justify-center">
                                        <button 
                                            @click="goToDemo(section, card)" 
                                            @mouseenter="prefetchPreview(section, card)" 
                                            class="win2k-button"
                                            :aria-label="`Xem demo thiệp ${card.title}`">
                                            Demo
                                        </button>
                                        <button 
                                            @click="buyCard(section, card)" 
                                            class="win2k-button"
                                            :aria-label="`Tạo thiệp ${card.title}`">
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
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { HOME_SECTIONS, loadAllSections, type TemplateCard, type Section } from './home.config'
import { getActiveCount } from '@/composables/useEcards'
import { setLocalStorageItem } from '@/utils/localstorage.helper'

definePageMeta({
  layout: 'main'
})

// SEO Optimization
useSeoMeta({
  title: 'Tạo Thiệp Điện Tử Miễn Phí - Thiệp Sinh Nhật, Valentine, Giáng Sinh | Story4U',
  description: 'Tạo thiệp điện tử độc đáo và miễn phí với hàng trăm mẫu thiệp đẹp: sinh nhật, Valentine, Giáng sinh, 20/11. Dễ dàng tùy chỉnh với ảnh, video, nhạc. Chia sẻ ngay!',
  ogTitle: 'Tạo Thiệp Điện Tử Miễn Phí - Story4U',
  ogDescription: 'Hàng trăm mẫu thiệp điện tử đẹp cho mọi dịp. Tùy chỉnh dễ dàng với ảnh, video, nhạc. Tạo và chia sẻ ngay!',
  ogImage: '/meta-img.webp',
  ogUrl: 'https://story4u.online/home',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Tạo Thiệp Điện Tử Miễn Phí - Story4U',
  twitterDescription: 'Hàng trăm mẫu thiệp điện tử đẹp cho mọi dịp. Tạo ngay!',
  twitterImage: '/meta-img.webp'
})

useHead({
  htmlAttrs: {
    lang: 'vi'
  },
  link: [
    {
      rel: 'canonical',
      href: 'https://story4u.online/home'
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Story4U - Tạo Thiệp Điện Tử',
        description: 'Ứng dụng tạo thiệp điện tử miễn phí với hàng trăm mẫu thiệp đẹp',
        url: 'https://story4u.online/home',
        applicationCategory: 'DesignApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'VND'
        },
        creator: {
          '@type': 'Organization',
          name: 'Story4U'
        }
      })
    }
  ]
})

// Lazy load EmailOtpModal only when needed
const EmailOtpModal = defineAsyncComponent(() =>
  import('@/components/EmailOtpModal.vue')
)

const emailCookie = useCookie('email')
const loadingDemo = ref<string | null>(null)

// Debounce function to prevent multiple rapid calls
let updateCountDebounce: ReturnType<typeof setTimeout> | null = null

function updateActiveEcardsCount() {
    if (!emailCookie.value) return
    
    // Just check the activeEcardsCount from localStorage without fetching
    const countStr = localStorage.getItem('activeEcardsCount')
    const count = countStr ? parseInt(countStr, 10) : 0
    // No further action needed, just checking
}

function getCardKey(section: Section, card: TemplateCard) {
    return `${section.id}-${card.id}`
}

// Cache prefetched templates to avoid duplicate requests
const prefetchedTemplates = new Set<string>()

async function prefetchPreview(section: Section, card: TemplateCard) {
    const key = `${section.id}/${card.id}`
    
    // Skip if already prefetched
    if (prefetchedTemplates.has(key)) return true
    
    try {
        // Use requestIdleCallback for low-priority prefetch
        if ('requestIdleCallback' in window) {
            requestIdleCallback(async () => {
                try {
                    await import(`../_templates/${section.id}/${card.id}/[id].vue`)
                    prefetchedTemplates.add(key)
                } catch (_err) {
                    // ignore
                }
            }, { timeout: 2000 })
        } else {
            // Fallback: preload immediately
            await import(`../_templates/${section.id}/${card.id}/[id].vue`)
            prefetchedTemplates.add(key)
        }
        return true
    } catch (_err) {
        // ignore
    }
    return false
}
const sections = ref<Section[]>([])
const isLoading = ref(true)
const selectedTag = ref<string>('all')
const showEmailModal = ref(false)
const emailFromCookie = ref<string | null>(null)
const pendingQuery = ref<Record<string, string> | null>(null)
const visibleCards = ref<Set<string>>(new Set())

// Intersection Observer for lazy rendering cards
let cardObserver: IntersectionObserver | null = null

const setupCardObserver = () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
    
    cardObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const cardId = entry.target.getAttribute('data-card-id')
                    if (cardId) {
                        visibleCards.value.add(cardId)
                        cardObserver?.unobserve(entry.target)
                    }
                }
            })
        },
        {
            rootMargin: '50px',
            threshold: 0.01
        }
    )
}

onMounted(() => {
    setupCardObserver()
})

onUnmounted(() => {
    cardObserver?.disconnect()
})

const filteredSections = computed(() => {
    if (selectedTag.value === 'all') {
        return sections.value
    }
    return sections.value.filter(section => section.id === selectedTag.value)
})

onMounted(async () => {
    // Show skeleton immediately
    isLoading.value = true
    
    // Use requestIdleCallback for non-critical loading
    if ('requestIdleCallback' in window) {
        requestIdleCallback(async () => {
            await loadAllSections()
            sections.value = HOME_SECTIONS
            // Defer hiding skeleton slightly for smooth transition
            setTimeout(() => {
                isLoading.value = false
                // Prefetch input page after home is fully loaded
                prefetchInputPage()
            }, 100)
        })
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(async () => {
            await loadAllSections()
            sections.value = HOME_SECTIONS
            isLoading.value = false
            prefetchInputPage()
        }, 0)
    }
})

function prefetchInputPage() {
    if (typeof window === 'undefined') return
    
    if ('requestIdleCallback' in window) {
        requestIdleCallback(async () => {
            try {
                // Prefetch input page components when browser is idle
                await preloadRouteComponents('/input/demo1')
            } catch (err) {
                // Silent fail - prefetch is not critical
            }
        }, { timeout: 3000 })
    }
}

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
    const config = useRuntimeConfig()
    const ecardLimit = config.public.ecardLimit
    const activeCountStr = localStorage.getItem('activeEcardsCount')
    const activeCount = activeCountStr ? parseInt(activeCountStr, 10) : 0

    if (activeCount >= ecardLimit) {
        alert(`Bạn đã vượt quá số lượng thiệp cho phép (tối đa ${ecardLimit}).`)
        return
    }

    const query: Record<string, string> = {
        topic: section.id,
        template: card.id
    }

    const existing = emailCookie.value
    if (existing) {
        query.email = existing
        navigateTo({ path: `/input/${card.id}`, query })
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
        navigateTo({ path: `/input/${pendingQuery.value.template}`, query: q })
        pendingQuery.value = null
    } else {
        navigateTo({ path: `/input/demo1`, query: { email } })
    }
}
</script>

<style scoped src="./style.css">
</style>
