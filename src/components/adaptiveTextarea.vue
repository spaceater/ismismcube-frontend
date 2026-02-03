<template>
  <textarea
    ref="textareaRef"
    v-model="inputValue"
    rows="1"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :class="['adaptive-textarea', { 'disabled': disabled, 'readonly': readonly }]"
    :style="textareaStyle"
    v-bind="attrs"
    @input="handleInput"
    @focus="(e) => emit('focus', e)"
    @blur="(e) => emit('blur', e)"
    @keydown="(e) => emit('keydown', e)"
  ></textarea>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, useAttrs } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  minWidth?: string
  maxWidth?: string
  minHeight?: string
  maxHeight?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  minWidth: '0px',
  maxWidth: '100%',
  minHeight: '0px',
  maxHeight: '100%'
})

const emit = defineEmits<Emits>()

const attrs = useAttrs()
const textareaRef = ref<HTMLTextAreaElement>()
const inputValue = ref(props.modelValue)
let resizeRafId: number | null = null

const textareaStyle = computed(() => {
  return {
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
    minHeight: props.minHeight,
    maxHeight: props.maxHeight
  }
})

// 监听外部元素对组件modelValue的修改
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
  scheduleResize()
})

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
  emit('input', newValue)
})

// 使用 Canvas 进行文本宽度测量，避免频繁创建 DOM
let canvasContext: CanvasRenderingContext2D | null = null
const getMeasureCanvas = (): CanvasRenderingContext2D => {
  if (canvasContext) return canvasContext
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  return (canvasContext = ctx)
}

// 将任意 CSS 长度转换为像素，复用单一测量元素以降低开销
let measureDiv: HTMLDivElement | null = null
const getMeasureDiv = (container: HTMLElement): HTMLDivElement => {
  if (measureDiv && measureDiv.parentElement === container) return measureDiv
  if (measureDiv && measureDiv.parentNode) {
    measureDiv.parentNode.removeChild(measureDiv)
    measureDiv = null
  }
  const el = document.createElement('div')
  el.style.position = 'absolute'
  el.style.visibility = 'hidden'
  el.style.left = '-99999px'
  el.style.top = '0'
  el.style.height = '0'
  el.style.border = '0'
  el.style.padding = '0'
  el.style.margin = '0'
  container.appendChild(el)
  measureDiv = el
  return el
}

const toPx = (val: string, container: HTMLElement): number => {
  if (!val) return 0
  if (val.endsWith('px')) return parseFloat(val)
  const el = getMeasureDiv(container)
  el.style.width = val
  const width = el.getBoundingClientRect().width
  el.style.height = '0'
  return width
}

const resizeTextarea = () => {
  const textarea = textareaRef.value
  if (!textarea) return
  const textareaStyle = getComputedStyle(textarea)
  // 测量宽度
  const measureCanvas = getMeasureCanvas()
  measureCanvas.font = textareaStyle.font
  const raw = (textarea.value || textarea.placeholder || '').split('\n')
  let maxLineWidth = 0
  // const horizontalPadding = parseFloat(textareaStyle.paddingLeft) + parseFloat(textareaStyle.paddingRight)
  for (const line of raw) {
    const lineWidth = measureCanvas.measureText(line || ' ').width
    // maxLineWidth = Math.max(maxLineWidth, lineWidth + horizontalPadding)
    maxLineWidth = Math.max(maxLineWidth, lineWidth)
  }
  const container = textarea.parentElement || document.body
  const minWidth = toPx(props.minWidth, container)
  const maxWidth = toPx(props.maxWidth, container)
  const newWidth = Math.min(Math.max(maxLineWidth, minWidth), maxWidth)
  textarea.style.width = `${newWidth}px`
  // 计算高度
  const minHeight = toPx(props.minHeight, container)
  const maxHeight = toPx(props.maxHeight, container)
  textarea.style.height = 'auto'
  const verticalPadding = parseFloat(textareaStyle.paddingTop) + parseFloat(textareaStyle.paddingBottom)
  const contentHeight = Math.max(0, textarea.scrollHeight - verticalPadding)
  let newHeight = Math.max(contentHeight, minHeight)
  if (newHeight > maxHeight) {
    newHeight = maxHeight
    textarea.style.overflowY = 'auto'
  } else {
    textarea.style.overflowY = 'hidden'
  }
  textarea.style.height = `${newHeight}px`
}

const scheduleResize = () => {
  // 前一次执行还没有完成，直接取消前一次执行
  if (resizeRafId !== null) cancelAnimationFrame(resizeRafId)
  resizeRafId = requestAnimationFrame(() => {
    // 执行完成后设置为null
    resizeRafId = null
    resizeTextarea()
  })
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  inputValue.value = target.value
  scheduleResize()
}

onMounted(() => {
  scheduleResize()
})

onUnmounted(() => {
  if (resizeRafId !== null) cancelAnimationFrame(resizeRafId)
  if (measureDiv && measureDiv.parentNode) {
    measureDiv.parentNode.removeChild(measureDiv)
    measureDiv = null
  }
})
</script>

<style scoped>
.adaptive-textarea {
  border: none;
  resize: none;
  overflow: hidden;
  font: inherit;
}

.adaptive-textarea:disabled {
  cursor: not-allowed;
}

</style>
