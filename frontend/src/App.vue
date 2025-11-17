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
import { defineAsyncComponent } from 'vue';

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
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
}
</style>
