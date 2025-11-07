import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/ismismcube/ismismcube.vue')
    },
    {
      path: '/:ismTag([1-4]|[1-4]-[1-4]|[1-4]-[1-4]-[1-4]|[1-4]-[1-4]-[1-4]-[1-4])',
      name: 'ismDetail',
      component: () => import('../pages/ismismcube/ismismcube.vue')
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('../pages/ai/ai.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../pages/error/error.vue')
    }
  ]
})

export default router
