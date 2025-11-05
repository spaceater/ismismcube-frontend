import { createRouter, createWebHistory } from 'vue-router'
import ismismcube from '../pages/ismismcube/ismismcube.vue'
import ai from '../pages/ai/ai.vue'
import error from '../pages/error/error.vue'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ismismcube
    },
    {
      path: '/:ismTag([1-4]|[1-4]-[1-4]|[1-4]-[1-4]-[1-4]|[1-4]-[1-4]-[1-4]-[1-4])',
      name: 'ismDetail',
      component: ismismcube
    },
    {
      path: '/ai',
      name: 'ai',
      component: ai
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: error
    }
  ]
})

export default router
