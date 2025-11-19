<template>
    <div class="main-layout min-h-screen flex flex-col">
        <header
            class=" top-0 z-50 border-b border-gray-700 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div class="container mx-auto px-2 py-1">
                <div class="flex items-center justify-between gap-2 md:grid md:grid-cols-3 md:gap-4">
                    <div class="flex items-center justify-start shrink-0">
                        <router-link to="/" class="flex items-center gap-2">
                            <img src="/logo.png" alt="foryou" class="h-12 w-auto md:h-16" />
                        </router-link>
                    </div>
                    <div class="text-center text-white text-xs max-w-[50ch] md:max-w-[80ch] px-2 hidden md:block">
                        <p>mail góp ý: langochungdev@gmail.com</p>
                        <p>mỗi tuần sẽ xuất bản 8 template chủ đề theo sự kiện gần nhất</p>
                        <p>hiện tại đang demo nên sẽ miễn phí hoàn toàn 100%</p>
                    </div>
                    <div class="flex items-center gap-1 md:gap-2 justify-end shrink-0">
                        <button v-if="userEmail" @click="showCreatedModal = true" class="win2k-button header-button">Đã tạo</button>
                        <button v-else @click="showEmailModal = true" class="win2k-button header-button">Đăng nhập</button>
                        <button v-if="userEmail" @click="logout" class="win2k-button header-button">Đăng xuất</button>
                    </div>
                </div>
            </div>
        </header>

        <main class="grow">
            <slot />
        </main>

    <EmailOtpModal v-model="showEmailModal" :defaultEmail="userEmail || ''" @verified="handleVerified" />
    <CreatedEcardsModal v-model="showCreatedModal" :email="userEmail || ''" />

        <footer class="border-t border-gray-700 bg-gray-900 py-6 text-center text-white">
            <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div class="flex flex-col items-center md:items-start">
                        <div class="mb-3 flex items-center gap-2">
                            <img src="/logo.png" alt="FOR YOU" class="h-8 w-auto" />
                            <span class="text-xl font-bold ">FOR YOU</span>
                        </div>
                        <p class="text-gray-400 text-sm leading-relaxed truncate max-w-xs">
                            Tạo thiệp tương tác độc đáo và ý nghĩa cho mọi dịp đặc biệt.
                        </p>
                    </div>

                    <div class="flex flex-col items-center">
                        <h3 class="mb-3 text-lg font-semibold ">Liên kết</h3>
                        <div class="flex flex-row gap-4 text-sm">
                            <router-link to="/" class="text-gray-400 hover:text-[#00FFFF] transition-colors">
                                Trang chủ
                            </router-link>
                            <a href="#about" class="text-gray-400 hover:text-[#00FFFF] transition-colors">
                                Giới thiệu
                            </a>
                            <a href="#contact" class="text-gray-400 hover:text-[#00FFFF] transition-colors">
                                Liên hệ
                            </a>
                        </div>
                    </div>

                    <div class="flex flex-col items-center md:items-end">
                        <h3 class="mb-3 text-lg font-semibold ">Theo dõi chúng tôi</h3>
                        <div class="flex gap-4">
                            <a href="https://tiktok.com/@langochungdev" target="_blank" rel="noopener noreferrer"
                                class="text-gray-400 hover:text-[#00FFFF] transition-colors">
                                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                </svg>
                            </a>
                            <a href="https://github.com/langochungdev" target="_blank" rel="noopener noreferrer"
                                class="text-gray-400 hover:text-[#00FFFF] transition-colors">
                                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="mt-6 border-t border-gray-700 pt-6 text-center">
                    <p class="text-gray-400 text-sm">
                        &copy; 2025 FORYOU. Tất cả quyền được bảo lưu.
                        <span class="mx-2">|</span>
                        <a href="#privacy" class="hover:text-[#00FFFF] transition-colors">Bảo mật</a>
                        <span class="mx-2">|</span>
                        <a href="#terms" class="hover:text-[#00FFFF] transition-colors">Điều khoản</a>
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import EmailOtpModal from '@/components/EmailOtpModal.vue'
import CreatedEcardsModal from '@/components/CreatedEcardsModal.vue'
import { getCookie, setCookie, deleteCookie } from '@/utils/cookies'

const showEmailModal = ref(false)
const showCreatedModal = ref(false)
const userEmail = ref<string | null>(getCookie('email'))

// Set mobile status bar meta tags only when this layout is active.
// On mount: set theme-color to the provided rgba value (for Android/Chrome) and
// apply apple-mobile-web-app-status-bar-style to allow translucent background on iOS.
// On unmount: restore previous meta values / remove created tags.
const _metaState: {
    themeColor?: string | null
    themeColorCreated?: boolean
    appleStatus?: string | null
    appleStatusCreated?: boolean
    appleCapable?: string | null
    appleCapableCreated?: boolean
} = {}

const DESIRED_THEME_COLOR = 'rgba(22,16,12,0)'
const DESIRED_APPLE_STATUS = 'black-translucent'

function setOrCreateMeta(name: string, content: string) {
    const selector = `meta[name="${name}"]`
    let el = document.head.querySelector(selector) as HTMLMetaElement | null
    const created = !el
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        el.setAttribute('data-created-by', 'main-layout')
        document.head.appendChild(el)
    }
    const previous = el.content ?? null
    el.content = content
    return { previous, created }
}

onMounted(() => {
    // theme-color
    const t = setOrCreateMeta('theme-color', DESIRED_THEME_COLOR)
    _metaState.themeColor = t.previous
    _metaState.themeColorCreated = t.created
    // apple-mobile-web-app-status-bar-style
    const a = setOrCreateMeta('apple-mobile-web-app-status-bar-style', DESIRED_APPLE_STATUS)
    _metaState.appleStatus = a.previous
    _metaState.appleStatusCreated = a.created
    // apple-mobile-web-app-capable (for PWA translucent status bar to work)
    const cap = setOrCreateMeta('apple-mobile-web-app-capable', 'yes')
    _metaState.appleCapable = cap.previous
    _metaState.appleCapableCreated = cap.created
})

onUnmounted(() => {
    // revert theme-color
    const themeEl = document.head.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (themeEl) {
        if (_metaState.themeColorCreated) {
            themeEl.remove()
        } else if (_metaState.themeColor !== undefined) {
            themeEl.content = _metaState.themeColor ?? ''
        }
    }
    // revert apple-mobile-web-app-status-bar-style
    const appleEl = document.head.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement | null
    if (appleEl) {
        if (_metaState.appleStatusCreated) {
            appleEl.remove()
        } else if (_metaState.appleStatus !== undefined) {
            appleEl.content = _metaState.appleStatus ?? ''
        }
    }
    // revert apple-mobile-web-app-capable
    const appleCapEl = document.head.querySelector('meta[name="apple-mobile-web-app-capable"]') as HTMLMetaElement | null
    if (appleCapEl) {
        if (_metaState.appleCapableCreated) {
            appleCapEl.remove()
        } else if (_metaState.appleCapable !== undefined) {
            appleCapEl.content = _metaState.appleCapable ?? ''
        }
    }
})

function logout() {
    deleteCookie('email')
    userEmail.value = null
}

function handleVerified(email: string) {
    setCookie('email', email)
    userEmail.value = email
    showEmailModal.value = false
}
</script>

<style scoped>
.main-layout {
    background-image: url('/b3.jpg');
    background-size: 300px auto;
    background-position: top left;
    background-repeat: repeat;
    background-attachment: fixed;
    font-family: 'Courier New', monospace;
    cursor: url('/cursor.cur'), auto;
}

.win2k-button {
    border: 1px outset #d0d0c8;
    background-color: #e0e0e0;
    color: black;
    font-size: 13px;
    padding: 10px 16px;
    cursor: pointer;
    min-width: 85px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    transition: none;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .win2k-button {
        font-size: 14px;
        padding: 12px 24px;
        min-width: 120px;
    }
}
</style>
