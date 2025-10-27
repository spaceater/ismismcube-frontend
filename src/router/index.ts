import { createRouter, createWebHistory } from 'vue-router'
import ismismcube from '../pages/ismismcube/ismismcube.vue'
import ai from '../pages/ai/ai.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ismismcube
    },
    {
      path: '/ai',
      name: 'ai',
      component: ai
    },
    {
      path: '/:ismTag([1-4]|[1-4]-[1-4]|[1-4]-[1-4]-[1-4]|[1-4]-[1-4]-[1-4]-[1-4])',
      name: 'ismDetail',
      component: ismismcube
    }
  ]
})

export default router
