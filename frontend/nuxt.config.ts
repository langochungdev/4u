// https://nuxt.com/docs/api/configuration/nuxt-config
import 'dotenv/config'

const disableDevtools = process.env.VITE_DISABLE_DEVTOOLS === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/image'],
  css: ['~/assets/style.css'],
  runtimeConfig: {
    public: {
      backendUrl: process.env.VITE_BACKEND_URL || 'http://localhost:8080/api/',
      firestore: process.env.VITE_FIRESTORE || '',
      cloudinaryCloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME || '',
      cloudinaryUploadPreset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
      disableDevtools: process.env.VITE_DISABLE_DEVTOOLS === 'true',
      ecardLimit: parseInt(process.env.VITE_ECARD_LIMIT || '15'),
      otpBypass: process.env.VITE_OTP_BYPASS === 'true',
      maxImages: parseInt(process.env.VITE_MAX_IMAGES || '10'),
      maxVideos: parseInt(process.env.VITE_MAX_VIDEOS || '1'),
      maxAudios: parseInt(process.env.VITE_MAX_AUDIOS || '1'),
      firebaseApiKey: process.env.VITE_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      firebaseDatabaseUrl: process.env.VITE_FIREBASE_DATABASE_URL || '',
      firebaseProjectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.VITE_FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || '',
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'vi'
      },
      title: 'STORY4U - Thiệp điện tử',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, viewport-fit=cover'
        },
        {
          name: 'description',
          content: 'Tạo và gửi thiệp điện tử tương tác độc đáo chỉ trong vài giây'
        },
        { name: 'google-site-verification', content: 'VoSByWgOc_njDDOxWdM1w5WJYbTfTdtZdc62kKheBAI' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'color-scheme', content: 'light only' },
        
        // Open Graph / Facebook / Zalo
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'STORY4U' },
        { property: 'og:locale', content: 'vi_VN' },
        { property: 'og:title', content: 'STORY4U - Thiệp điện tử' },
        { property: 'og:description', content: 'Tạo và gửi thiệp điện tử tương tác độc đáo chỉ trong vài giây' },
        { property: 'og:image', content: 'https://story4u.online/meta-img.webp' },
        { property: 'og:image:secure_url', content: 'https://story4u.online/meta-img.webp' },
        { property: 'og:image:type', content: 'image/webp' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '900' },
        { property: 'og:image:alt', content: 'STORY4U - Tạo thiệp điện tử' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'STORY4U - Thiệp điện tử' },
        { name: 'twitter:description', content: 'Tạo và gửi thiệp điện tử tương tác độc đáo chỉ trong vài giây' },
        { name: 'twitter:image', content: 'https://story4u.online/meta-img.webp' },
        { name: 'twitter:image:alt', content: 'STORY4U - Tạo thiệp điện tử' },
        
        { name: 'robots', content: 'index, follow' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "STORY4U",
                "url": "https://story4u.online",
                "logo": "https://story4u.online/logo.webp"
              },
              {
                "@type": "WebSite",
                "name": "STORY4U",
                "url": "https://story4u.online",
                "description": "Tạo và gửi thiệp điện tử tương tác độc đáo chỉ trong vài giây",
                "publisher": { "@type": "Organization", "name": "STORY4U" }
              },
              {
                "@type": "WebApplication",
                "name": "STORY4U",
                "url": "https://story4u.online",
                "applicationCategory": "Multimedia",
                "operatingSystem": "All",
                "browserRequirements": "Requires a modern browser with JavaScript enabled",
                "description": "Tạo và gửi thiệp điện tử tương tác độc đáo chỉ trong vài giây"
              }
            ]
          })
        },
        ...(disableDevtools ? [{
          innerHTML: `
            (function() {
              // Skip on mobile devices
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              if (isMobile) return;
              
              let devtoolsOpen = false;
              let debuggerInterval = null;
              
              // Disable right click
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
              });
              
              // Disable F12 shortcut
              document.addEventListener('keydown', function(e) {
                if (e.key === 'F12') {
                  e.preventDefault();
                  alert('Developer tools are disabled for security reasons.');
                  return false;
                }
              });
              
              // Function to detect if devtools is open
              const detectDevtools = () => {
                let start = performance.now();
                debugger; // This will pause if devtools is open
                let end = performance.now();
                return end - start > 100; // If pause > 100ms, devtools is likely open
              };
              
              // Check periodically
              setInterval(() => {
                if (detectDevtools()) {
                  if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    alert('Developer tools detected. Page will be slowed down.');
                    // Start continuous debugger to slow down the page
                    debuggerInterval = setInterval(() => {
                      debugger;
                    }, 100); // Continuous debugger every 100ms
                  }
                } else {
                  if (devtoolsOpen) {
                    devtoolsOpen = false;
                    if (debuggerInterval) {
                      clearInterval(debuggerInterval);
                      debuggerInterval = null;
                    }
                  }
                }
              }, 1000); // Check every 1s
            })();
          `
        }] : [])
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://story4u.online/' },
        { rel: 'preconnect', href: 'https://res.cloudinary.com' },
        { rel: 'dns-prefetch', href: 'https://res.cloudinary.com' },
        { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net' },
      ]
    }
  },
  
  // Vite optimizations for production
  vite: {
    build: {
      // Code splitting strategy
      rollupOptions: {
        output: {
          manualChunks: {
            'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
            'vendor': ['vue', 'vue-router'],
          }
        }
      },
      // Minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        }
      },
      // Chunk size warning
      chunkSizeWarningLimit: 500,
      cssCodeSplit: true
    },
    optimizeDeps: {
      include: ['vue', 'pinia']
    }
    // Ensure `vue` is bundled for SSR (no external left as ESM import),
    // this prevents runtime errors like "The requested module 'vue' does not provide an export named 'default'"
    ,
    ssr: {
      noExternal: ['vue', 'pinia', 'vue-router']
    }
  },
  
  // Nitro optimizations
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true,
    minify: true,
    errorHandler: 'server/error.ts'
    ,
    // Inline certain dependencies to avoid platform-specific ESM mismatch
    externals: {
      inline: ['vue', 'pinia', 'vue-router']
    }
  },

  routeRules: {
    '/': { ssr: true },
    '/home': { ssr: true },
    '/input/**': { ssr: true },
    '/result/**': { ssr: true },
    '/**': { ssr: true }
  },
  
  // Experimental features for better performance
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    viewTransition: false
  },
  
  devtools: { enabled: true }
})

