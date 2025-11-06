import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// Tự động import tất cả template configs
const templateModules = import.meta.glob('@/pages/templates/*/index.vue');

// Tạo routes động cho templates
const templateRoutes: RouteRecordRaw[] = Object.keys(templateModules).map((path) => {
  const templateName = path.match(/templates\/(.+?)\/index\.vue$/)?.[1] || '';
  const capitalizedName = templateName.charAt(0).toUpperCase() + templateName.slice(1);
  
  return {
    path: `/${templateName}/:id?`,
    name: capitalizedName,
    component: templateModules[path] as any,
    meta: {
      title: `${capitalizedName} - Xem chi tiết`,
      showBackButton: true,
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
    },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/home/Home.vue'),
    meta: {
      title: 'Trang chủ',
    },
  },
  {
    path: '/result/:id',
    name: 'Result',
    component: () => import('@/pages/input/Result.vue'),
    meta: {
      title: 'Kết quả',
    },
  },
  ...templateRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: '404 - Không tìm thấy trang',
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

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'My App';
  next();
});

export default router;
