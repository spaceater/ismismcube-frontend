<template>
  <iframe
    src="/static/error/error.html"
    style="border:none; width:100%; height:100%; display:block;"
    ref="errorFrame"></iframe>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref} from 'vue'

const errorFrame = ref<HTMLIFrameElement | null>(null)

function handleLoad() {
  try {
    const title = errorFrame.value?.contentDocument?.title
    if (title) {
      document.title = title
    }
  } catch (error) {
    document.title = '页面不存在'
  }
}

onMounted(() => {
  errorFrame.value?.addEventListener('load', handleLoad)
})

onBeforeUnmount(() => {
  errorFrame.value?.removeEventListener('load', handleLoad)
})
</script>
