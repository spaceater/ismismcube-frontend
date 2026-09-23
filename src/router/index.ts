import { createRouter, createWebHistory } from 'vue-router'
import { resolvedRoutes } from '../routes'

const router = createRouter({
  history: createWebHistory('/'),
  routes: resolvedRoutes
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') {
    document.title = title
  }
})

export default router
