<template>
  <div class="app-container">
        <router-view v-slot="{ Component, route }">
            <component :is="getLayout(route.meta.layout)">
                <component :is="Component" />
            </component>
        </router-view>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const layoutModules = import.meta.glob('@/pages/layout/*.vue');
const layouts: Record<string, any> = {};

Object.keys(layoutModules).forEach(path => {
  const layoutName = path.match(/\/([^\/]+)\.vue$/)?.[1];
  if (layoutName) {
    layouts[layoutName] = defineAsyncComponent(layoutModules[path] as any);
  }
});

const getLayout = (layout?: string) => {
  const layoutName = layout || 'main';
  return layouts[layoutName] || layouts.main;
};

// Update meta tags dynamically based on route
const updateMetaTags = () => {
  const currentUrl = window.location.href;
  const isEcardPage = route.path.includes('/') && route.path !== '/';
  
  // Update og:url
  let metaUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
  if (!metaUrl) {
    metaUrl = document.createElement('meta');
    metaUrl.setAttribute('property', 'og:url');
    document.head.appendChild(metaUrl);
  }
  metaUrl.content = currentUrl;
  
  // Update og:title
  let metaTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
  if (!metaTitle) {
    metaTitle = document.createElement('meta');
    metaTitle.setAttribute('property', 'og:title');
    document.head.appendChild(metaTitle);
  }
  metaTitle.content = isEcardPage ? 'Xem thiệp của bạn - STORY4U' : 'STORY4U';
  
  // Update og:description
  let metaDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('property', 'og:description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = isEcardPage 
    ? 'Ai đó đã gửi cho bạn một thiệp điện tử đặc biệt. Nhấn vào để xem ngay!' 
    : 'Create and send custom interactive e-cards in seconds';
  
  // Update page title
  document.title = isEcardPage ? 'Xem thiệp của bạn - STORY4U' : 'STORY4U';
};

// Lock orientation to portrait on mount
onMounted(() => {
  // TypeScript doesn't recognize .lock() but it exists on some browsers
  const orientation = screen.orientation as any;
  if (orientation && typeof orientation.lock === 'function') {
    orientation.lock('portrait').catch(() => {
      // Silently fail if not supported
    });
  }
  
  // Update meta tags on initial mount
  updateMetaTags();
});

// Watch route changes and update meta tags
watch(() => route.path, () => {
  updateMetaTags();
});
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
}
</style>

<style>
/* Force light mode globally - prevent dark mode auto-switching */
:root {
  color-scheme: light only;
}

html, body {
  color-scheme: light only;
  background-color: #ffffff;
  color: #000000;
}
</style>
