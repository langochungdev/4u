<template>
    <div class="main-layout min-h-screen flex flex-col">
        <header
            class="sticky top-0 z-50 border-b border-gray-700 bg-transparent backdrop-blur-sm"
            style="-webkit-backdrop-filter: blur(4px);">
            <div class="container mx-auto px-2 py-1">
                <div class="flex items-center justify-between gap-2 md:grid md:grid-cols-3 md:gap-4">
                    <div class="flex items-center justify-start shrink-0">
                        <NuxtLink to="/" class="flex items-center gap-2" aria-label="Trang chủ">
                            <img src="/logo.webp" alt="foryou" class="h-12 w-auto md:h-16" />
                        </NuxtLink>
                    </div>
                    <div class="text-center text-white text-xs max-w-[50ch] md:max-w-[80ch] px-2 hidden md:block">
                        <p>mail góp ý: langochungdev@gmail.com</p>
                        <p>mỗi tuần sẽ xuất bản 8 template chủ đề theo sự kiện gần nhất</p>
                        <!-- <p>hiện tại đang demo nên sẽ miễn phí hoàn toàn 100%</p> -->
                    </div>
                    <div class="flex items-center gap-1 md:gap-2 justify-end shrink-0">
                        <button v-if="userEmail" @click="showCreatedModal = true" class="win2k-button header-button new-button">
                            <img class="button-hat" src="./santa-hat.webp" alt="">
                            Đã tạo
                        </button>
                        <button v-else @click="showEmailModal = true" class="win2k-button header-button new-button">
                            <img class="button-hat" src="./santa-hat.webp" alt="">
                            Đăng nhập
                        </button>
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
                            <img src="/logo.webp" alt="FOR YOU" class="h-8 w-auto" />
                            <span class="text-xl font-bold ">FOR YOU</span>
                        </div>
                        <p class="text-gray-400 text-sm leading-relaxed truncate max-w-xs">
                            Tạo thiệp tương tác độc đáo và ý nghĩa cho mọi dịp đặc biệt.
                        </p>
                    </div>

                    <div class="flex flex-col items-center">
                        <h3 class="mb-3 text-lg font-semibold ">Liên kết</h3>
                        <div class="flex flex-row gap-4 text-sm">
                            <NuxtLink to="/" class="text-gray-400 hover:text-[#00FFFF] transition-colors">
                                Trang chủ
                            </NuxtLink>
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
                                class="text-gray-400 hover:text-[#00FFFF] transition-colors"
                                aria-label="Theo dõi chúng tôi trên TikTok">
                                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                </svg>
                            </a>
                            <a href="https://github.com/langochungdev" target="_blank" rel="noopener noreferrer"
                                class="text-gray-400 hover:text-[#00FFFF] transition-colors"
                                aria-label="Xem mã nguồn trên GitHub">
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

        <div class="snowflakes" aria-hidden="true">
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
            <div class="snowflake">
                <div class="inner">❅</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const showEmailModal = ref(false)
const showCreatedModal = ref(false)

const emailCookie = useCookie('email')
const userEmail = computed(() => emailCookie.value || null)

// Debug: watch userEmail changes
watch(userEmail, (newVal, oldVal) => {
    console.log('userEmail changed:', { oldVal, newVal })
})

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

// Prevent mobile zoom (iOS/Android) on input focus and double-tap by
// adding a viewport meta at the app level (nuxt.config.ts). Individual
// per-layout useHead was removed in favor of global configuration.

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
    emailCookie.value = null
}

function handleVerified(email: string) {
    emailCookie.value = email
    showEmailModal.value = false
}
</script>

<style scoped>
.main-layout {
    position: relative;
    font-family: 'Noto Sans', sans-serif;
    cursor: url('/cursor.cur'), auto;
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    min-height: 100vh;
    opacity: 1;
    animation: layoutFadeIn 0.3s ease-in;
}

@keyframes layoutFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.main-layout::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/background.webp');
    background-size: 300px auto;
    background-position: top left;
    background-repeat: repeat;
    z-index: -2;
    pointer-events: none;
    will-change: transform;
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

.new-button {
    position: relative;
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 6px 12px;
    min-width: 7em;
    text-align: center;
    color: #fff;
    background-image: linear-gradient(to bottom, #f12828, #a00332, #9f0f31), linear-gradient(to bottom, #ae0034, #6f094c);
    background-clip: padding-box, border-box;
    background-origin: padding-box, border-box;
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.25), inset 0 -1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
}

.button-hat {
    position: absolute;
    top: -26px;
    left: -24px;
    height: 62px;
    filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.25));
}

@media (min-width: 768px) {
    .win2k-button {
        font-size: 14px;
        padding: 12px 24px;
        min-width: 120px;
    }
    .new-button {
        font-size: 14px;
        padding: 10px 20px;
        min-width: 100px;
    }
}

/* Prevent iOS auto-zoom on input focus by ensuring inputs use 16px font-size on mobile */
@media (max-width: 640px) {
    input, textarea, select, .win2k-input, button {
        font-size: 16px !important;
    }
}

/* Ensure the whole app uses manipulation touch-action to reduce double-tap zooming behavior */
html, body, .main-layout {
    touch-action: manipulation;
    -ms-touch-action: manipulation;
}

/* customizable snowflake styling */
.snowflake {
  color: #fff;
  font-size: 1em;
  font-family: Arial, sans-serif;
  text-shadow: 0 0 5px #000;
}

.snowflake,.snowflake .inner{animation-iteration-count:infinite;animation-play-state:running}@keyframes snowflakes-fall{0%{transform:translateY(0) rotate(0deg)}100%{transform:translateY(110vh) rotate(360deg)}}@keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.snowflake{position:fixed;top:-10%;z-index:-1;-webkit-user-select:none;user-select:none;cursor:default;pointer-events:none;animation-name:snowflakes-shake;animation-duration:20s;animation-timing-function:ease-in-out}.snowflake .inner{animation:snowflakes-fall 10s linear infinite}.snowflake:nth-of-type(0){left:1%;animation-delay:0s; font-size: 0.8em;}
.snowflake:nth-of-type(0) .inner{animation-delay:0s; animation-duration: 9s;}
.snowflake:first-of-type{left:10%;animation-delay:1s; font-size: 1.2em;}
.snowflake:first-of-type .inner,.snowflake:nth-of-type(8) .inner{animation-delay:1s; animation-duration: 11s;}
.snowflake:nth-of-type(2){left:20%;animation-delay:.5s; font-size: 0.9em;}
.snowflake:nth-of-type(2) .inner,.snowflake:nth-of-type(6) .inner{animation-delay:6s; animation-duration: 8s;}
.snowflake:nth-of-type(3){left:30%;animation-delay:2s; font-size: 1.1em;}
.snowflake:nth-of-type(11) .inner,.snowflake:nth-of-type(3) .inner{animation-delay:4s; animation-duration: 12s;}
.snowflake:nth-of-type(4){left:40%;animation-delay:2s; font-size: 0.7em;}
.snowflake:nth-of-type(10) .inner,.snowflake:nth-of-type(4) .inner{animation-delay:2s; animation-duration: 10s;}
.snowflake:nth-of-type(5){left:50%;animation-delay:3s; font-size: 1.3em;}
.snowflake:nth-of-type(5) .inner{animation-delay:8s; animation-duration: 9.5s;}
.snowflake:nth-of-type(6){left:60%;animation-delay:2s; font-size: 0.6em;}
.snowflake:nth-of-type(7){left:70%;animation-delay:1s; font-size: 1.4em;}
.snowflake:nth-of-type(7) .inner{animation-delay:2.5s; animation-duration: 11.5s;}
.snowflake:nth-of-type(8){left:80%;animation-delay:0s; font-size: 1.4em;}
.snowflake:nth-of-type(9){left:90%;animation-delay:1.5s; font-size: 1.6em;}
.snowflake:nth-of-type(9) .inner{animation-delay:3s; animation-duration: 8.5s;}
.snowflake:nth-of-type(10){left:25%;animation-delay:0s; font-size: 1.3em;}
.snowflake:nth-of-type(11){left:65%;animation-delay:2.5s; font-size: 1.5em;}

.snowflake:nth-of-type(n+9) {
  z-index: 9999;
}
</style>
