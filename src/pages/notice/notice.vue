<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { buildApiUrl } from '../../config/api.ts'

const pageView = ref(-1)

onMounted(async () => {
  document.title = '主义主义魔方-服务暂停'
  try {
    // 仅读取累计访问数（GET 只读，浏览公告不会新增访问）
    const response = await fetch(buildApiUrl('/ismismcube/page_view'), { method: 'GET' })
    if (response.ok) {
      const data = await response.json()
      pageView.value = data.page_view
    }
  } catch (error) {
    console.error('Failed to load page view:', error)
  }
})
</script>

<template>
  <main class="notice-page">
    <div class="notice-box">
      <div class="cube-mark" aria-hidden="true"></div>

      <h1 class="site-title">
        <span class="title-cn">主义主义魔方</span>
        <span class="title-en">ISMISMCUBE</span>
      </h1>

      <p class="notice-text">本网站原主要提供「主义主义魔方」与「AI 对话」两个功能，经由刘司墨（未明子）本人联系，要求下架网站，<br>特此公告。</p>

      <hr class="divider" aria-hidden="true">

      <p class="visit-line">
        网站已累计访问 <span class="visit-number">{{ pageView === -1 ? '-' : pageView.toLocaleString() }}</span> 次，感谢你一直以来的关注。<br>
        更多内容：<a class="more-url" href="https://www.maybered.com" target="_blank" rel="noopener noreferrer">https://www.maybered.com</a>
      </p>

      <div class="github-block">
        <p class="github-label">本网站源代码及相关数据已在 GitHub 开源：</p>
        <a
          class="github-link"
          href="https://github.com/spaceater/ismismcube-frontend"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="github-url">https://github.com/spaceater/ismismcube-frontend</span>
        </a>
      </div>
    </div>
  </main>
</template>

<style scoped>
.notice-page {
  box-sizing: border-box;
  min-height: 100%;
  min-width: fit-content;
  display: flex;
  padding: 2.5rem 1.25rem;
  background-color: rgb(200, 200, 200);
}

.notice-box {
  box-sizing: border-box;
  width: 34rem;
  height: 34rem;
  margin: auto;
  padding: 1.5rem 3rem;
  border: solid black 0.0625rem;
  background: rgb(240, 240, 240);
  text-align: center;
  overflow: hidden;
}

/* 内容块内所有元素禁止显示滚动条 */
.notice-box,
.notice-box * {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.notice-box *::-webkit-scrollbar {
  display: none;
}

/* —— 呼应「4×4×4 立方体」的装饰性点阵（纯 CSS，无外部资源） —— */
.cube-mark {
  width: 2.5rem;
  height: 2.5rem;
  /* 补偿标题行盒（line-height 1.3）在文字上方多出的 (1.3-1)/2 × 字号 空间，使上下视觉间距对称 */
  margin: 0.3rem auto 1.365rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect x='3' y='3' width='4' height='4' fill='%23646464'/%3E%3C/svg%3E");
  background-size: 0.625rem 0.625rem;
}

.site-title {
  font-size: 2.9rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.08em;
  color: #000;
}

.title-en {
  display: block;
  margin-top: 0.35rem;
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: 0.55em;
  font-weight: 400;
  letter-spacing: 0.24em;
  color: rgb(100, 100, 100);
}

.notice-text {
  margin-top: 1.3rem;
  font-size: 1.1rem;
  line-height: 1.9;
  color: #000;
}

.divider {
  width: 100%;
  border: none;
  border-top: solid black 0.0625rem;
  margin: 1.2rem auto;
}

.visit-line {
  margin-top: 0.6rem;
  font-size: 1.1rem;
  line-height: 1.9;
  color: #000;
}

.visit-number {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: #000;
}

.more-url {
  font-style: italic;
  color: black;
  text-decoration: underline;
  word-break: break-all;
}

.github-block {
  margin-top: 1.6rem;
  max-width: 100%;
  overflow: hidden;
}

.github-label {
  margin-bottom: 0.3rem;
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  color: rgb(100, 100, 100);
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  white-space: nowrap;
  font-style: italic;
  font-size: 1.1rem;
  line-height: 1.6;
  letter-spacing: 0.02em;
  color: rgb(100, 100, 100);
  text-decoration: underline;
}

.github-link:focus-visible {
  outline: 0.125rem solid #3366cc;
  outline-offset: 0.1875rem;
}

/* 竖屏：不固定 34×34，无背景无边框，正文直接铺满屏幕 */
@media (orientation: portrait) {
  .notice-page {
    min-width: 0;
    padding: 0;
    background: none;
  }

  .notice-box {
    width: 100%;
    height: auto;
    min-height: 100vh;
    margin: 0;
    padding: 1.5rem 2.5rem;
    border: none;
    background: none;
  }
}
</style>
