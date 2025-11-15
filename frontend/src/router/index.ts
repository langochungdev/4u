import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const templateModules = import.meta.glob('@/pages/templates/*/*/index.vue');
const templateRoutes: RouteRecordRaw[] = Object.keys(templateModules).map((path) => {
  const match = path.match(/templates\/(.+?)\/(.+?)\/index\.vue$/);
  const topic = match?.[1] || '';
  const templateId = match?.[2] || '';
  const capitalizedName = templateId.charAt(0).toUpperCase() + templateId.slice(1);
  
  return {
    path: `/${topic}/${templateId}/:id?`,
    name: capitalizedName,
    component: templateModules[path] as any,
    meta: {
      title: `${capitalizedName} - Xem chi tiết`,
      showBackButton: true,
      layout: 'preview', 
    },
  } as RouteRecordRaw;
});

const routes: RouteRecordRaw[] = [
  {
    path: '/input/:id?',
    name: 'Input',
    component: () => import('@/pages/input/index.vue'),
    meta: {
      title: 'Input',
      layout: 'main',
      requiresEmailVerification: true,
    },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/home/Home.vue'),
    meta: {
      title: 'Trang chủ',
      layout: 'main', 
    },
  },
  {
    path: '/result/:id',
    name: 'Result',
    component: () => import('@/pages/input/Result.vue'),
    meta: {
      title: 'Kết quả',
      layout: 'main',
      requiresEmailVerification: true,
    },
  },
  ...templateRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: '404 - Không tìm thấy trang',
      layout: 'empty',
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

import { getCookie } from '@/utils/cookies'

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'My App';
  const requires = to.meta.requiresEmailVerification === true;
  if (requires) {
    const email = getCookie('email')
    if (!email) {
      // redirect to home and include redirect path
      const redirectTo = encodeURIComponent(to.fullPath)
      next({ name: 'Home', query: { redirect: redirectTo } });
      return
    }
  }
  next();
});

export default router;
