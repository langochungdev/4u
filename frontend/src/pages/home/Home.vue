<template>
            <EmailOtpModal v-model="showEmailModal" :defaultEmail="emailFromCookie || ''" @verified="onVerified" />
        <div class="min-h-screen bg-background text-foreground">

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-12">
            <!-- Tag Filter -->
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
            <!-- Sections -->
            <div v-for="section in filteredSections" :key="section.id" class="mb-16">
                <!-- Section Header -->
                <div class="mb-8">
                    <h2 class="section-title">
                        {{ section.title }}
                    </h2>
                    <p v-if="section.description" class="section-description">
                        {{ section.description }}
                    </p>
                </div>

                <!-- Cards Grid -->
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div v-for="card in section.cards" :key="card.id" class="window-border">
                        <div class="window text">
                            <div class="title-bar">
                                <div class="icon"></div>
                                <span>{{ card.title }}</span>
                                <div class="title-bar-buttons"></div>
                            </div>
                            <div class="text-area">
                                <!-- Thumbnail -->
                                <div class="aspect-16/10 cursor-pointer overflow-hidden" @click="goToDemo(section, card)" @mouseenter="prefetchInput; prefetchPreview(section, card)">
                                    <video v-if="card.thumbnailType === 'video'" :src="card.thumbnail"
                                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        autoplay loop muted playsinline>
                                    </video>
                                    <img v-else :src="card.thumbnail" :alt="card.title"
                                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                
                                <!-- Divider line -->
                                <div class="divider-line"></div>

                                <div class="p-4 grow flex flex-col">
                                    <p class="mb-2 line-clamp-1 text-sm text-black card-description">
                                        {{ card.description }}
                                    </p>
                                    <p v-if="card.createdBy" class="text-sm text-muted-foreground mt-auto card-description">
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
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { HOME_SECTIONS, loadAllSections, type TemplateCard, type Section } from './home.config'
// template config and creation checks are done inside the Input page to keep Home lightweight
import EmailOtpModal from '@/components/EmailOtpModal.vue'
import { getCookie, setCookie } from '@/utils/cookies'
// creation checks are done within Input page

const router = useRouter()
const loadingDemo = ref<string | null>(null)
const templateModules = import.meta.glob('@/pages/templates/*/*/index.vue') as Record<string, () => Promise<any>>;

function getCardKey(section: Section, card: TemplateCard) {
    return `${section.id}-${card.id}`
}

async function prefetchPreview(section: Section, card: TemplateCard) {
    try {
        const frag = `/${section.id}/${card.id}/index.vue`;
        for (const p in templateModules) {
            if (p.includes(frag)) {
                await (templateModules[p] as any)();
                return true;
            }
        }
        // fallback (may not be supported in some bundlers), ignore errors
        try { await import(/* @vite-ignore */ `@/pages/templates/${section.id}/${card.id}/index.vue`) } catch {}
    } catch (_err) {
        // ignore
    }
    return false;
}
const inputPrefetched = ref(false)

function prefetchInput() {
    if (inputPrefetched.value) return
    inputPrefetched.value = true
    try { import('@/pages/input/index.vue') } catch (_e) { /* ignore */ }
}
const sections = ref<Section[]>([])
const isLoading = ref(true)
const selectedTag = ref<string>('all')
const showEmailModal = ref(false)
// Use centralized helper and count from the composable
const emailFromCookie = ref<string | null>(null)
const pendingQuery = ref<Record<string, string> | null>(null)

// Computed property để filter sections theo tag được chọn
const filteredSections = computed(() => {
    if (selectedTag.value === 'all') {
        return sections.value
    }
    return sections.value.filter(section => section.id === selectedTag.value)
})

onMounted(async () => {
    // Load tất cả sections
    await loadAllSections();
    
    // Gán sau khi load xong
    sections.value = HOME_SECTIONS;
    
    isLoading.value = false
    // Prefetch Input page component (shell) to improve UX when user navigates to create
    try {
        // dynamic import to warm-up the input route chunk and its CSS
        import('@/pages/input/index.vue')
    } catch (_err) {
        // ignore prefetch errors
    }
})

async function goToDemo(section: Section, card: TemplateCard) {
    const key = getCardKey(section, card)
    loadingDemo.value = key
    // Trigger prefetch of preview component
    prefetchPreview(section, card)
    try {
        await router.push(`/${section.id}/${card.id}/${card.demoId}`)
    } catch (err) {
        // navigation failure – ignore; show message if needed
        console.warn('Navigation failed:', err)
    } finally {
        // Clear loading indicator
        loadingDemo.value = null
    }
}

async function buyCard(section: Section, card: TemplateCard) {
    const query: Record<string, string> = {
        template: card.id,
        topic: section.id
    }

    const existing = getCookie('email')
    if (existing) {
        // We avoid awaiting server-side checks here to make navigation instant and load the input shell immediately.
        // The Input page itself will validate whether the user can create this template and show a message if not allowed.
        query.email = existing
        router.push({ path: `/input`, query })
        return
    }

    // show modal to collect email + OTP; we store query so we can navigate after verification
    pendingQuery.value = query
    emailFromCookie.value = null
    showEmailModal.value = true
}

// handle verified event from modal
function onVerified(email: string) {
    // save cookie
    setCookie('email', email)
    showEmailModal.value = false
    // redirect to input page with same query as buyCard
    if (pendingQuery.value) {
        const q = { ...pendingQuery.value, email }
        router.push({ path: `/input`, query: q })
        pendingQuery.value = null
    } else {
        router.push({ path: `/input`, query: { email } })
    }
}
</script>

<style scoped>

.text-foreground {
    color: #f8f8f8;
    /* light text */
}

.text-muted-foreground {
    color: #a0a0a0;
    /* muted text */
}

.border {
    border-color: #2a2a2a;
}

.bg-card {
    background-color: #1a1a1a;
}

/* Window styles */
* {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
}

.window-border {
    margin: 0;
    width: 100%;
    border: 1px solid #d0d0c8;
    border-right-color: #404040;
    border-bottom-color: #404040;
    min-height: 380px; /* allow flexible content while keeping a default card height */
    overflow: hidden;
    position: relative; /* allow overlay inside */
}

.window {
    background-color: #d0d0c8;
    padding: 2px;
    border: 1px solid #d0d0c8;
    border-left-color: white;
    border-top-color: white;
    border-right-color: #808080;
    border-bottom-color: #808080;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.title-bar {
    background-color: #082468;
    background: -moz-linear-gradient(left, #082468 0%, #a0c8f0 100%);
    background: -webkit-linear-gradient(left, #082468 0%, #a0c8f0 100%);
    background: linear-gradient(to right, #082468, #a0c8f0);
    color: #ffffff;
    font-size: 11px;
    font-weight: bold;
    padding: 1px;
    overflow-y: hidden;
    cursor: default;
    min-height: 16px;
}

.title-bar-buttons {
    float: right;
    width: 50px;
    height: 15px;
    background-image: url('//static.tumblr.com/anzluor/Fgkolwea1/m56u7v9.png');
    background-repeat: no-repeat;
    background-position: -2px -33px;
}

.title-bar .icon {
    width: 16px;
    height: 16px;
    background-image: url('//static.tumblr.com/anzluor/Fgkolwea1/m56u7v9.png');
    background-repeat: no-repeat;
    background-position: -96px 0;
    float: left;
    margin-right: 2px;
}

.text-area {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    border: 1px inset #d0d0c8;
    border-left-color: #404040;
    border-top-color: #404040;
    border-right-color: white;
    border-bottom-color: white;
    background-color: white;
    flex: 1 1 auto; /* allow content to grow/shrink accordingly */
    min-height: 0; /* prevents overflow issues with flex children */
    overflow: auto; /* enable internal scrolling when content exceeds available space */
}

.status-bar {
    padding: 4px 2px;
    margin-top: 2px;
    border: 1px solid #d0d0c8;
    border-left-color: #808080;
    border-top-color: #808080;
    border-right-color: white;
    border-bottom-color: white;
    font-size: 11px;
    flex-shrink: 0; /* keep status-bar visible even if text-area grows */
    display: flex;
    align-items: center; /* vertically center content */
    justify-content: center; /* horizontally center content */
    gap: 8px; /* consistent gap between items */
}
/* Ensure buttons inside status bar have consistent height */
.status-bar .win2k-button,
.status-bar .file-input-button {
    min-height: 40px; /* target a comfortable touch target */
    padding-top: 8px;
    padding-bottom: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}
.win2k-button {
    border: 1px outset #d0d0c8;
    background-color: #e0e0e0;
    color: black;
    font-size: 14px;
    padding: 12px 24px;
    cursor: pointer;
    min-width: 120px;
    box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    transition: none; /* immediate interaction without smooth transitions */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}
.win2k-button:hover {
    border: 1px solid #808080;
    background-color: #f0f0f0;
    box-shadow: 3px 3px 6px rgba(0,0,0,0.4);
}
.win2k-button:active {
    border: 1px inset #d0d0c8;
    box-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}
.win2k-tag-button {
    border: 1px outset #d0d0c8;
    background-color: #c0c0c0;
    color: black;
    font-size: 14px;
    padding: 8px 18px;
    cursor: pointer;
    margin-right: 8px;
    margin-bottom: 8px;
    transition: none; /* immediate interaction */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}
.win2k-tag-button.selected {
    border: 1px inset #d0d0c8;
    background-color: #082468;
    color: #ffffff;
}
.win2k-tag-button:hover {
    background-color: #d0d0d0;
    border-color: #a0a0a0;
}
/* Remove hover effect for already selected tag buttons so they keep selected style */
.win2k-tag-button.selected:hover {
    /* keep the same selected background and text color on hover */
    background-color: #082468;
    color: #ffffff;
    border: 1px inset #d0d0c8;
}
.section-title {
    font-family: 'Courier New', monospace;
    font-size: 2rem;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 0.5rem;
}
.section-description {
    font-family: 'Courier New', monospace;
    color: #ffffff;
}
.card-description {
    font-family: 'Courier New', monospace;
}

.divider-line {
    border: 4px solid #d0d0c8;
    border-right-color: #404040;
    border-bottom-color: #404040;
}

/* Loading overlay for card previews */
.card-loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.9);
    z-index: 40;
}
.card-loading-overlay .spinner {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 4px solid #d0d0c8;
    border-top-color: #082468;
    animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
