import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/input/index.vue'),
    meta: {
      title: 'Trang chủ',
    },
  },
  {
    path: '/tp1/:id',
    name: 'Template1',
    component: () => import('@/pages/templates/tp1/index.vue'),
    meta: {
      title: 'Template 1',
    },
  },
  // Template 2 route (nếu có)
  // {
  //   path: '/templates/tp2/:id',
  //   name: 'Template2',
  //   component: () => import('./pages/templates/tp2/index.vue'),
  //   meta: {
  //     title: 'Template 2',
  //   },
  // },
  
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
  const title = to.meta.title as string || 'My App';
  document.title = title;
  
  // Có thể thêm logic authentication ở đây
  // const isAuthenticated = checkAuth();
  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   next('/login');
  // } else {
  //   next();
  // }
  
  next();
});

router.afterEach((_to, _from) => {
  // Có thể log analytics ở đây
  // console.log(`Navigated from ${_from.path} to ${_to.path}`);
});

export default router;
