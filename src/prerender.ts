import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { resolvedRoutes } from './routes'

export async function prerender(data: { url: string }) {
  // 为 SSR 创建内存历史记录路由
  const router = createRouter({
    history: createMemoryHistory('/'),
    routes: resolvedRoutes
  })

  // 创建 SSR 应用实例
  const app = createSSRApp(App)
  app.use(router)

  // 设置路由到指定 URL
  router.push(data.url)
  await router.isReady()

  // 渲染为 HTML 字符串
  const html = await renderToString(app)

  // 标题取最终解析到的路由（重定向后即为目标页）的 meta.title
  const title = router.currentRoute.value.meta.title

  return {
    html,
    links: new Set<string>([]),
    head: {
      title: typeof title === 'string' ? title : ''
    }
  }
}
