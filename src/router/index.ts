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

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || 'My App';
  next();
});

export default router;
