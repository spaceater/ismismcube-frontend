import type { RouteRecordRaw } from 'vue-router'

// 公告短路开关：true 时 SHORT_CIRCUIT 中的路由全部重定向到 /notice；恢复服务时改为 false
export const NOTICE_MODE = false
const SHORT_CIRCUIT = new Set<string | symbol>(['home', 'ai'])

const routes: RouteRecordRaw[] = [
  {
    path: '/notice',
    name: 'notice',
    component: () => import('./pages/notice/notice.vue'),
    meta: { title: '主义主义魔方-服务暂停' }
  },
  {
    path: '/',
    name: 'home',
    component: () => import('./pages/ismismcube/ismismcube.vue'),
    meta: { title: '主义主义魔方' }
  },
  {
    path: '/:ismTag([1-4]|[1-4]-[1-4]|[1-4]-[1-4]-[1-4]|[1-4]-[1-4]-[1-4]-[1-4])',
    name: 'ismDetail',
    component: () => import('./pages/ismismcube/ismismcube.vue'),
    meta: { title: '主义主义魔方' }
  },
  {
    path: '/ai',
    name: 'ai',
    component: () => import('./pages/ai/ai.vue'),
    meta: { title: 'ai对话体验' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('./pages/error/error.vue'),
    meta: { title: '页面不存在' }
  }
]

export const resolvedRoutes: RouteRecordRaw[] = NOTICE_MODE
  ? routes.map((route) =>
      route.name != null && SHORT_CIRCUIT.has(route.name)
        ? ({ path: route.path, name: route.name, redirect: '/notice' } as RouteRecordRaw)
        : route
    )
  : routes
