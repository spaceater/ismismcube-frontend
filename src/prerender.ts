import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import ismismcube from './pages/ismismcube/ismismcube.vue'
import ai from './pages/ai/ai.vue'
import error from './pages/error/error.vue'

export async function prerender(data: { url: string }) {
  // 为 SSR 创建内存历史记录路由
  const router = createRouter({
    history: createMemoryHistory('/'),
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
    ],
  })

  // 创建 SSR 应用实例
  const app = createSSRApp(App)
  app.use(router)

  // 设置路由到指定 URL
  router.push(data.url)
  await router.isReady()

  // 渲染为 HTML 字符串
  const html = await renderToString(app)

  return {
    html,
    links: new Set<string>([]),
  }
}
