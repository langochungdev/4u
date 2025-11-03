import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

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
    component: () => import('@/pages/Home.vue'),
    meta: {
      title: 'Trang chủ',
    },
  },
  {
    path: '/demo/:id?',
    name: 'Demo',
    component: () => import('@/pages/templates/demo/index.vue'),
    meta: {
      title: 'Demo - Xem chi tiết',
    },
  },
  
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
