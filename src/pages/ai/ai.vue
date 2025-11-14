<template>
  <div id="ai-container">
    <div id="main-container">
      <div id="control-panel" :class="{ collapsed: isControlPanelClosed }" ref="controlPanelRef">
        <div id="button-area">
          <div id="ismismcube-button" @click="goIsmismcube">返回主页</div>
          <div id="return-button" @click="openMoreContent">更多内容</div>
          <div id="save-button" @click="saveChat" :class="{ disabled: taskStatus === 'running' }">保存对话</div>
        </div>
        <div class="divider-line"></div>
        <div id="server-area">
          <div id="connection-status" :class="{
            connected: isWebSocketConnected,
           disconnected: !isWebSocketConnected
          }">{{ isWebSocketConnected ? '服务器已连接' : '服务器连接失败-正在重试' }}</div>
          <div id="queue-info">
            <div id="executed-info">
              <span>已完成:</span>
              <span class="highlight">{{ executedTaskCount == -1 ? '-' : executedTaskCount }}</span>
            </div>
            <div id="waiting-info">
              <span>排队中:</span>
              <span class="highlight">{{ waitingCount == -1 ? '-' : waitingCount }}</span>
            </div>
            <div id="executing-info">
              <span>运行中:</span>
              <span class="highlight">{{ executingCount == -1 ? '-' : executingCount }}</span>
            </div>
          </div>
        </div>
        <div class="divider-line"></div>
        <div id="task-area">
          <div id="task-status">
            <template v-if="taskStatus === 'queue'">
              <div id="queue-status">
                <div id="progress-fill" :style="{ width: waitingProgress + '%' }"></div>
                <div id="progress-text">正在排队</div>
              </div>
            </template>
            <template v-else-if="taskStatus === 'running'">
              <div id="running-status">正在生成对话</div>
            </template>
            <template v-else>
              <div id="none-status">没有排队中的对话</div>
            </template>
          </div>
          <div id="task-info">
            <template v-if="taskStatus === 'queue'">
              <span>排队位置: <span class="highlight">{{ queuePosition===-1 ? waitingCount : queuePosition+1 }}</span> / <span class="highlight">{{ waitingCount===-1 ? '-' : waitingCount }}</span></span>
            </template>
              <template v-else-if="taskStatus === 'running'">
                <div>生成速度: <span class="highlight">{{ tokenSpeed.toFixed(1) }}</span> tokens/秒</div>
              </template>
            <template v-else>
              <div>可用模型:</div>
              <div id="models-list">
                <template v-if="serverConfig.available_models.length == 0">
                  <div class="model-item">-</div>
                </template>
                <template v-else>
                  <div v-for="model in serverConfig.available_models"
                    :key="model"
                    class="model-item"
                    :class="{ selected: selectedModel == model }"
                    @click="selectModel(model)"
                  >
                    {{ model }}
                  </div>
                </template>
              </div>
              <span class="model-link">
                <a href="https://space.bilibili.com/9168596" target="_blank">本地部署ai应用</a>
                <span>与</span>
                <a href="https://3dxt006znrxma34e9ked1jmanp9ljjg.taobao.com" target="_blank">购买ai整机</a>
              </span>
            </template>
          </div>
        </div>
        <div class="divider-line"></div>
        <div id="introduction-area">
          <div class="intro-item">本网页提供AI对话服务，你可以在左侧选择模型，在右侧的输入栏中输入问题并点击发送按钮，发起一个对话任务。</div>
          <div class="intro-item">本网页最多支持<span class="highlight">{{ serverConfig.max_concurrent_tasks == 0 ? '-' : serverConfig.max_concurrent_tasks }}</span>个对话任务同时运行。如果当前运行中的对话数量小于<span class="highlight">{{ serverConfig.max_concurrent_tasks == 0 ? '-' : serverConfig.max_concurrent_tasks }}</span>个，你提交的对话任务会立刻开始运行并生成回答；否则，你发起的对话任务会进入排队状态。</div>
          <div class="intro-item">当你的对话任务正在排队或运行时，你不能发起新的对话。</div>
          <div class="intro-item">每天北京时间凌晨<span class="warning">4</span>点进行服务器维护（维护大约持续2分钟），届时此网页的功能可能暂时无法使用。</div>
        </div>
        <div class="divider-line"></div>
        <div id="notice-area">
          <div class="intro-item">本网站不会储存任何对话记录，刷新/关闭此网页，会导致对话记录全部丢失。如需将对话记录保存到本地，点击左侧“保存对话”按钮。</div>
          <div class="intro-item">当你的对话任务正在排队/运行时，刷新此网页/网络连接断开/浏览器关闭，会导致此排队/运行中的对话任务立即被取消。</div>
        </div>
        <div class="divider-line"></div>
        <div id="warning-area">
          <div class="intro-item">本网站仅作学习探讨之用，请自行辨别回复内容的正确性。</div>
          <div class="intro-item">本网站制作者、模型训练者以及任何相关个人或组织不对回复的内容承担任何责任。</div>
        </div>
        <div class="divider-line"></div>
        <div id="contact-area">
          <div>对本网站有任何改进建议</div>
          <div>请联系本网站制作者B站账号</div>
          <div><a href='https://b23.tv/JACBxVp' target='_blank'>https://b23.tv/JACBxVp</a></div>
          <div><a href='https://github.com/spaceater/ismismcube-frontend' target='_blank'>此网页的Github仓库</a></div>
        </div>
      </div>
      <div id="control-panel-toggle" @click="toggleControlPanel" :class="{ collapsed: isControlPanelClosed }">
        <svg v-if="!isControlPanelClosed" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div id="message-panel" :class="{ widened: isControlPanelClosed }">
        <div id="message-area-wrapper">
          <div id="message-area-overlay">
            <div v-if="isContentOverflowing" id="generating-indicator">
              <span @click="scrollToBottom">↓ 更多内容正在生成中...</span>
            </div>
          </div>
          <div id="message-area" ref="messageAreaRef" @scroll="checkContentOverflow">
            <div v-if="history.length === 0" class="message assistant">
              <div class="content assistant markdown" v-html="renderMarkdown(`你好，我是AI助手。请在左侧选择模型，在下方输入问题并点击发送按钮，向我发起一个对话。`)"></div>
            </div>
            <div v-for="(msg, i) in history" :key="i" class="message" :class="[msg.role, { 'faded': editingIndex !== -1 && i > editingIndex }]">
              <template v-if="msg.role === 'user'">
                <AdaptiveTextarea v-if="editingIndex === i"
                  v-model="editingContent"
                  class="content user editing"
                  max-width="calc(100% - 3rem)"
                  @keydown.enter.prevent="confirmEditing"
                  @keydown.escape.prevent="exitEditing"
                  @vue:mounted="(vnode: any) => selectAndFocus(vnode)"
                  ref="editingElement"
                />
                <div v-else
                  class="content user"
                >{{ msg.content }}</div>
                <template v-if="taskStatus === 'none'">
                  <div v-if="editingIndex !== i" class="edit-icon" @click="startEdit(i)" title="编辑此消息">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div v-else class="edit-buttons">
                    <div class="edit-button cancel-button" @click="exitEditing" title="取消">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="edit-button confirm-button" @click="confirmEditing" title="确认">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </template>
              </template>
              <template v-else>
                <div class="model-label">{{ msg.role }}</div>
                <div class="content assistant markdown" v-html="renderMarkdown(msg.content)"></div>
              </template>
            </div>
          </div>
        </div>
        <div id="input-area">
          <AdaptiveTextarea
            id="input-textarea"
            v-model="inputText"
            @keydown.enter.prevent="sendMessage"
            min-height="3rem"
            max-height="10rem"
            :placeholder="isWebSocketConnected ? '输入你的问题...' : '等待服务器连接...'"
            :disabled="editingIndex !== -1"
            ref="inputRef"
          />
          <div id="send-stop-button" @click="handleSendOrStop" :class="{ disabled: !isWebSocketConnected || editingIndex !== -1, send: taskStatus === 'none', stop: taskStatus !== 'none' }">{{ taskStatus === 'none' ? '发送' : '停止' }}</div>
          <div id="settings-button" @click="openSettingsModal" title="对话设置">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    <!-- 对话设置弹窗 -->
    <div v-if="showSettingsModal" id="settings-modal-overlay" @click="closeSettingsModal">
      <div id="settings-modal" @click.stop>
        <div id="settings-header">
          <h3>对话设置</h3>
          <div id="close-settings" @click="closeSettingsModal">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div id="settings-content">
          <div class="setting-item system-prompt-item">
            <label>系统提示词 (System Prompt):</label>
            <textarea
              v-model="tempChatConfig.prompt"
              class="system-prompt-input"
              placeholder="输入系统提示词..."
            ></textarea>
          </div>
          <div class="setting-item">
            <label>最大上下文Token记忆长度 (Context Size):</label>
            <span class="setting-value readonly-value">{{ serverChatConfig.content_size }}</span>
          </div>
          <div class="setting-item">
            <label>最大生成Token数量 (Number Predict):</label>
            <span class="setting-value readonly-value">{{ serverChatConfig.max_tokens }}</span>
          </div>
          <div class="setting-item">
            <label>温度 (Temperature):</label>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="tempChatConfig.temperature"
                min="0"
                max="1"
                step="0.01"
                class="slider"
              />
              <span class="setting-value">{{ tempChatConfig.temperature.toFixed(2) }}</span>
            </div>
          </div>
          <div class="setting-item">
            <label>Top-p采样 (Top-p Sampling):</label>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="tempChatConfig.top_p"
                min="0"
                max="1"
                step="0.01"
                class="slider"
              />
              <span class="setting-value">{{ tempChatConfig.top_p.toFixed(2) }}</span>
            </div>
          </div>
          <div class="setting-item">
            <label>频率惩罚 (Frequency Penalty):</label>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="tempChatConfig.frequency_penalty"
                min="-2"
                max="2"
                step="0.01"
                class="slider"
              />
              <span class="setting-value">{{ tempChatConfig.frequency_penalty.toFixed(2) }}</span>
            </div>
          </div>
          <div class="setting-item">
            <label>存在惩罚 (Presence Penalty):</label>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="tempChatConfig.presence_penalty"
                min="-2"
                max="2"
                step="0.01"
                class="slider"
              />
              <span class="setting-value">{{ tempChatConfig.presence_penalty.toFixed(2) }}</span>
            </div>
          </div>
          <div class="setting-item">
            <label>重复惩罚 (Repeat Penalty):</label>
            <div class="slider-container">
              <input
                type="range"
                v-model.number="tempChatConfig.repeat_penalty"
                min="0"
                max="2"
                step="0.01"
                class="slider"
              />
              <span class="setting-value">{{ tempChatConfig.repeat_penalty.toFixed(2) }}</span>
            </div>
          </div>
          <div class="settings-actions">
            <button class="settings-button reset" @click="resetSettings">恢复</button>
            <button class="settings-button cancel" @click="closeSettingsModal">取消</button>
            <button class="settings-button save" @click="saveSettings">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AdaptiveTextarea from '@/components/adaptiveTextarea.vue'
import { marked } from 'marked'
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // GitHub Flavored Markdown
  pedantic: false, // 不使用严格模式
})
import { buildApiUrl } from '../../config/api.ts'

const buildAiApiUrl = (path: string): string => {
  return buildApiUrl(`/ai${path.startsWith('/') ? '' : '/'}${path}`)
}

interface ServerConfig {
  available_models: string[]
  max_concurrent_tasks: number
}
interface ChatConfig {
  prompt: string
  content_size: number
  max_tokens: number
  temperature: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
  repeat_penalty: number
}

const router = useRouter()
const taskStatus = ref<'none' | 'queue' | 'running'>('none')
const isWebSocketConnected = ref(false)
const serverConfig = ref<ServerConfig>({
  available_models: [],
  max_concurrent_tasks: 0
})
const selectedModel = ref<string>('')
const serverChatConfig = ref<ChatConfig>({
  prompt: '',
  content_size: 0,
  max_tokens: 0,
  temperature: 0,
  top_p: 0,
  frequency_penalty: 0,
  presence_penalty: 0,
  repeat_penalty: 0
})
const userChatConfig = ref<ChatConfig>({
  prompt: '',
  content_size: 0,
  max_tokens: 0,
  temperature: 0,
  top_p: 0,
  frequency_penalty: 0,
  presence_penalty: 0,
  repeat_penalty: 0
})
const history = ref<Array<{ role: string, content: string }>>([])
const controlPanelRef = ref<HTMLDivElement>()
const messageAreaRef = ref<HTMLDivElement>()
const inputText = ref('')
const inputRef = ref<HTMLTextAreaElement>()
const editingElement = ref<InstanceType<typeof AdaptiveTextarea>>()
const editingContent = ref('')
const editingIndex = ref(-1)
const lastBroadcastFlag = ref(-1)
const executedTaskCount = ref(-1)
const waitingCount = ref(-1)
const executingCount = ref(-1)
const queuePosition = ref(-1)
const tokenCount = ref(0)
const tokenSpeedStartTime = ref<number | null>(null)
const tokenSpeed = ref(0.0)
const isContentOverflowing = ref(false)
const showSettingsModal = ref(false)
const isControlPanelClosed = ref(false)
const tempChatConfig = ref<ChatConfig>({
  prompt: '',
  content_size: 0,
  max_tokens: 0,
  temperature: 0,
  top_p: 0,
  frequency_penalty: 0,
  presence_penalty: 0,
  repeat_penalty: 0
})
let broadcastSocket: WebSocket | null = null
let broadcastReconnectTimer: number | null = null
let taskSocket: WebSocket | null = null
let taskReconnectTimer: number | null = null
let taskReconnectStartTime: number | null = null
const TASK_RECONNECT_TIMEOUT = 10000 // 10秒超时

const waitingProgress = computed(() => {
  if (queuePosition.value === -1 || waitingCount.value === 0) return 100
  return Math.max(0, Math.min(100, ((waitingCount.value - 1 - queuePosition.value) / (waitingCount.value - 1)) * 100))
})

const goIsmismcube = () => router.push('/')

const openMoreContent = () => {
  window.open("https://www.maybered.com", "_blank")
}

const selectModel = (model: string) => {
  selectedModel.value = model
}

const toggleControlPanel = () => {
  isControlPanelClosed.value = !isControlPanelClosed.value
}

const openSettingsModal = () => {
  tempChatConfig.value = { ...userChatConfig.value }
  showSettingsModal.value = true
}

const resetSettings = () => {
  userChatConfig.value = { ...serverChatConfig.value }
  tempChatConfig.value = { ...serverChatConfig.value }
}

const closeSettingsModal = () => {
  tempChatConfig.value = { ...userChatConfig.value }
  showSettingsModal.value = false
}

const saveSettings = () => {
  userChatConfig.value.prompt = tempChatConfig.value.prompt
  userChatConfig.value.temperature = tempChatConfig.value.temperature
  userChatConfig.value.top_p = tempChatConfig.value.top_p
  userChatConfig.value.frequency_penalty = tempChatConfig.value.frequency_penalty
  userChatConfig.value.presence_penalty = tempChatConfig.value.presence_penalty
  userChatConfig.value.repeat_penalty = tempChatConfig.value.repeat_penalty
  showSettingsModal.value = false
}

const startEdit = (index: number) => {
  editingIndex.value = index
  editingContent.value = history.value[index].content
}

const renderMarkdown = (content: string) => {
  try {
    // 使用块级HTML元素作为占位符，避免被 marked 包裹在 <p> 标签中
    const thinkStartPlaceholder = '<div class="think-placeholder-start"></div>'
    const thinkEndPlaceholder = '<div class="think-placeholder-end"></div>'

    // 替换 <think> 标签为占位符
    let processedContent = content
      .replace(/<think>/g, thinkStartPlaceholder)
      .replace(/<\/think>/g, thinkEndPlaceholder)

    // 使用 marked 处理 markdown
    let result = marked(processedContent, { async: false }) as string

    // 将占位符替换回 <think> 标签
    result = result
      .replace(/<div class="think-placeholder-start"><\/div>/g, '<think>')
      .replace(/<div class="think-placeholder-end"><\/div>/g, '</think>')

    return result
  } catch (error) {
    console.error('Markdown rendering error:', error)
    return content
  }
}

const selectAndFocus = (vnode: any) => {
  const element = vnode.el
  if (element) {
    element.focus()
    element.select()
  }
}

const exitEditing = () => {
  editingIndex.value = -1
  editingContent.value = ''
}

const confirmEditing = async () => {
  if (editingIndex.value === -1) return
  if (!editingContent.value.trim()) {
    alert('内容不能为空')
    return
  }
  history.value[editingIndex.value].content = editingContent.value.trim()
  history.value = history.value.slice(0, editingIndex.value + 1)
  exitEditing()
  callAI()
}

const scrollToBottom = () => {
  if (!messageAreaRef.value) return
  scrollElement(messageAreaRef.value, messageAreaRef.value.scrollHeight, 1000, 'down')
}

const scrollElement = (element: HTMLElement, target: number, duration: number, direction: 'down' | 'up', onComplete?: () => void) => {
  const start = Date.now()
  const animate = () => {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    const scrollPosition = direction === 'down'
      ? target * ease
      : target * (1 - ease)
    element.scrollTop = scrollPosition
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else if (onComplete) {
      onComplete()
    }
  }
  requestAnimationFrame(animate)
}

const scrollControlPanel = () => {
  if (!controlPanelRef.value) return
  const element = controlPanelRef.value
  const target = element.scrollHeight
  scrollElement(element, target, 1000, 'down', () => {
    scrollElement(element, target, 1000, 'up')
  })
}

const checkContentOverflow = () => {
  nextTick(() => {
    if (messageAreaRef.value && taskStatus.value === 'running') {
      const element = messageAreaRef.value
      // 检测是否有溢出内容（scrollHeight > clientHeight）且未滚动到底部
      const hasOverflow = element.scrollHeight > element.clientHeight
      const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 10
      isContentOverflowing.value = hasOverflow && !isAtBottom
    } else {
      isContentOverflowing.value = false
    }
  })
}

const createMessage = () => {
  const lastMessage = history.value[history.value.length - 1]
  const needNewMessage = !lastMessage || lastMessage.role === 'user'
  if (needNewMessage) {
    history.value.push(reactive({ role: selectedModel.value || 'assistant', content: '' }))
  }
}

const saveChat = () => {
  if (history.value.length === 0) {
    alert('没有对话记录可以保存')
    return
  }
  if (taskStatus.value !== 'none') {
    alert('当前对话正在生成中，无法保存对话记录')
    return
  }
  const now = new Date()
  const firstUserMessage = history.value.find(msg => msg.role === 'user')
  let filename = 'chat.txt'
  if (firstUserMessage) {
    const cleanText = firstUserMessage.content.replace(/[\/:*?"<>|]/g, '').trim()
    filename = cleanText.length > 20 ? cleanText.substring(0, 20) + '....txt' : cleanText + '.txt'
  }
  const currentUrl = window.location.href
  let content = `[AI对话记录]\n`
  content += `网址: ${currentUrl}\n`
  const usedModels = [...new Set(history.value.filter(msg => msg.role !== 'user').map(msg => msg.role))]
  const modelInfo = usedModels.length > 0 ? usedModels.join(', ') : '未知模型'
  content += `模型: [${modelInfo}]\n`
  content += `保存时间: ${now.toLocaleString('zh-CN')}\n`
  content += `对话条数: ${history.value.length}\n`
  content += `--------------------------------\n`
  history.value.forEach((msg, index) => {
    content += `[${index + 1}] ${msg.role}:\n`
    content += `${msg.content}\n\n`
  })
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const updateTokenSpeed = () => {
  if (!tokenSpeedStartTime.value) {
    tokenSpeedStartTime.value = Date.now()
  } else {
    tokenCount.value++
    const elapsed = (Date.now() - tokenSpeedStartTime.value) / 1000
    if (elapsed > 0) {
      tokenSpeed.value = tokenCount.value / elapsed
    }
  }
}

const resetTokenStats = () => {
  tokenSpeed.value = 0
  tokenCount.value = 0
  tokenSpeedStartTime.value = null
}

const connectBroadcastSocket = () => {
  try {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${buildAiApiUrl('/chat_broadcast')}`
    broadcastSocket = new WebSocket(wsUrl)
    broadcastSocket.addEventListener("open", () => {
      console.log("WebSocket连接成功")
      isWebSocketConnected.value = true
      if (broadcastReconnectTimer) {
        clearTimeout(broadcastReconnectTimer)
        broadcastReconnectTimer = null
      }
    })
    broadcastSocket.addEventListener("message", (event) => {
      const message = event.data
      if (message.startsWith('broadcast')) {
        try {
          const data = JSON.parse(message.substring(message.indexOf('{')))
          if (data.broadcast_flag !== undefined) {
            if (data.broadcast_flag <= lastBroadcastFlag.value) {
              return
            }
            lastBroadcastFlag.value = data.broadcast_flag
          }
          if (data.waiting_count !== undefined) {
            waitingCount.value = data.waiting_count
          }
          if (data.executing_count !== undefined) {
            executingCount.value = data.executing_count
          }
        } catch (error) {
          console.error("WebSocket JSON解析失败:", message, error)
        }
      }
      else if (message.startsWith('server-config')) {
        try {
          const data = JSON.parse(message.substring(message.indexOf('{')))
          if (data.available_models !== undefined) {
            serverConfig.value.available_models = data.available_models
            if (data.available_models.length > 0 && !selectedModel.value) {
              selectedModel.value = data.available_models[0]
            }
          }
          if (data.max_concurrent_tasks !== undefined) {
            serverConfig.value.max_concurrent_tasks = data.max_concurrent_tasks
          }
        } catch (error) {
          console.error("WebSocket JSON解析失败:", message, error)
        }
      }
      else if (message.startsWith('chat-config')) {
        try {
          const data = JSON.parse(message.substring(message.indexOf('{')))
          if (data.prompt !== undefined) {
            serverChatConfig.value.prompt = data.prompt
          }
          if (data.content_size !== undefined) {
            serverChatConfig.value.content_size = data.content_size
          }
          if (data.max_tokens !== undefined) {
            serverChatConfig.value.max_tokens = data.max_tokens
          }
          if (data.temperature !== undefined) {
            serverChatConfig.value.temperature = data.temperature
          }
          if (data.top_p !== undefined) {
            serverChatConfig.value.top_p = data.top_p
          }
          if (data.frequency_penalty !== undefined) {
            serverChatConfig.value.frequency_penalty = data.frequency_penalty
          }
          if (data.presence_penalty !== undefined) {
            serverChatConfig.value.presence_penalty = data.presence_penalty
          }
          if (data.repeat_penalty !== undefined) {
            serverChatConfig.value.repeat_penalty = data.repeat_penalty
          }
          userChatConfig.value = { ...serverChatConfig.value }
        } catch (error) {
          console.error("WebSocket JSON解析失败:", message, error)
        }
      }
      else {
        console.error("WebSocket消息解析失败:", event.data)
      }
    })
    broadcastSocket.addEventListener("error", (error) => {
      console.error("WebSocket连接错误:", error)
      isWebSocketConnected.value = false
    })
    broadcastSocket.addEventListener("close", (event) => {
      console.log("WebSocket连接关闭:", event.code, event.reason)
      isWebSocketConnected.value = false
      if (event.code !== 1000) {
        console.log("3秒后尝试重连WebSocket")
        broadcastReconnectTimer = setTimeout(() => {
          connectBroadcastSocket()
        }, 3000)
      }
    })
  } catch (error) {
    console.error("WebSocket连接失败:", error)
    isWebSocketConnected.value = false
    broadcastReconnectTimer = setTimeout(() => {
      connectBroadcastSocket()
    }, 3000)
  }
}

const disconnectBroadcastSocket = () => {
  if (broadcastReconnectTimer) {
    clearTimeout(broadcastReconnectTimer)
    broadcastReconnectTimer = null
  }
  if (broadcastSocket) {
    console.log('关闭WebSocket连接')
    broadcastSocket.onopen = null
    broadcastSocket.onmessage = null
    broadcastSocket.onerror = null
    broadcastSocket.onclose = null
    broadcastSocket.close(1000, "页面卸载")
    broadcastSocket = null
  }
}

const connectTaskSocket = (websocketId: string) => {
  if (!taskReconnectStartTime) {
    taskReconnectStartTime = Date.now()
  }
  if (Date.now() - taskReconnectStartTime > TASK_RECONNECT_TIMEOUT) {
    console.error("任务WebSocket重连超时，停止重连")
    disconnectTaskSocket()
    return
  }
  try {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${buildAiApiUrl(`/chat_task?id=${websocketId}`)}`
    taskSocket = new WebSocket(wsUrl)
    taskSocket.addEventListener("open", () => {
      console.log("任务WebSocket连接成功")
      queuePosition.value = waitingCount.value
      taskReconnectStartTime = null
      if (taskReconnectTimer) {
        clearTimeout(taskReconnectTimer)
        taskReconnectTimer = null
      }
    })
    taskSocket.addEventListener("message", (event) => {
      const lines = event.data.split('\n')
      for (let message of lines) {
        if (message.trim() === '') continue
        if (message.startsWith('broadcast')) {
          try {
            const data = JSON.parse(message.substring(message.indexOf('{')))
            if (data.queue_position !== undefined) {
              if (queuePosition.value > data.queue_position) {
                queuePosition.value = data.queue_position
              }
              taskStatus.value = 'queue'
            }
          } catch (error) {
            console.error("任务WebSocket JSON解析失败:", message, error)
          }
        }
        else if (message.startsWith('data')) {
          taskStatus.value = 'running'
          createMessage()
          if (message.trim().endsWith('[DONE]')) {
            disconnectTaskSocket()
            scrollToBottom()
            continue
          }
          try {
            const data = JSON.parse(message.substring(message.indexOf('{')))
            if (data.choices && data.choices.length > 0) {
              const choice = data.choices[0]
              if (choice.finish_reason) {
                disconnectTaskSocket()
                scrollToBottom()
                continue
              }
              if (choice.delta && choice.delta.content) {
                const lastMessage = history.value[history.value.length - 1]
                if (lastMessage && lastMessage.role !== 'user') {
                  lastMessage.content += choice.delta.content
                  updateTokenSpeed()
                  checkContentOverflow()
                  if (tokenCount.value >= serverChatConfig.value.max_tokens-1) {
                    lastMessage.content += '\n\n!!!【最大生成token数量: ' + serverChatConfig.value.max_tokens + '，当前生成内容的长度已经达到最大生成token数量限制，请拆分你的问题或改变系统提示词以减少生成内容的长度】!!!'
                  }
                }
              }
            }
          } catch(error) {
            const lastMessage = history.value[history.value.length - 1]
            if (lastMessage && lastMessage.role !== 'user') {
              lastMessage.content = `服务器错误：${event.data}`
            } else {
              history.value.push({
                role: selectedModel.value || 'assistant',
                content: `服务器错误：${event.data}`
              })
            }
            disconnectTaskSocket()
            scrollToBottom()
            continue
          }
        }
        else {
          console.error("任务WebSocket消息解析失败:", event.data)
        }
      }
    })
    taskSocket.addEventListener("error", (error) => {
      console.error("任务WebSocket连接错误:", error)
    })
    taskSocket.addEventListener("close", (event) => {
      console.log("任务WebSocket连接关闭:", event.code, event.reason)
      // 如果不是正常关闭，尝试重连
      if (event.code !== 1000) {
        taskReconnectTimer = setTimeout(() => {
          connectTaskSocket(websocketId)
        }, 1000)
      }
      else {
        disconnectTaskSocket()
      }
    })
  } catch (error) {
    console.error("任务WebSocket连接失败:", error)
    taskReconnectTimer = setTimeout(() => {
      connectTaskSocket(websocketId)
    }, 1000)
  }
}

const disconnectTaskSocket = () => {
  taskReconnectStartTime = null
  if (taskReconnectTimer) {
    clearTimeout(taskReconnectTimer)
    taskReconnectTimer = null
  }
  if (taskSocket) {
    console.log('关闭任务WebSocket连接')
    taskSocket.onopen = null
    taskSocket.onmessage = null
    taskSocket.onerror = null
    taskSocket.close(1000, "页面卸载")
    taskSocket.onclose = null
    taskSocket = null
  }
  // 重置排队位置和任务状态
  queuePosition.value = -1
  taskStatus.value = 'none'
}

const handleSendOrStop = () => {
  if (!isWebSocketConnected.value) return
  if (taskStatus.value === 'none') {
    sendMessage()
  } else {
    stopTask()
  }
}

const sendMessage = () => {
  if (taskStatus.value !== 'none' || !isWebSocketConnected.value) return
  if (!inputText.value.trim()) {
    alert('请先输入问题')
    return
  }
  history.value.push({ role: 'user', content: inputText.value.trim() })
  inputText.value = ''
  callAI()
}

const stopTask = () => {
  disconnectTaskSocket()
  resetTokenStats()
}

const callAI = async () => {
  queuePosition.value = -1
  taskStatus.value = 'queue'
  taskReconnectStartTime = null
  resetTokenStats()
  if (taskReconnectTimer) {
    clearTimeout(taskReconnectTimer)
    taskReconnectTimer = null
  }
  try {
    const response = await fetch(buildAiApiUrl('/send_chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...(selectedModel.value ? { model: selectedModel.value } : {}),
        messages: [
          ...(userChatConfig.value.prompt ? [{
            role: 'system',
            content: userChatConfig.value.prompt
          }] : []),
          ...history.value.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ],
        temperature: userChatConfig.value.temperature,
        top_p: userChatConfig.value.top_p,
        frequency_penalty: userChatConfig.value.frequency_penalty,
        presence_penalty: userChatConfig.value.presence_penalty,
        repeat_penalty: userChatConfig.value.repeat_penalty,
        stream: true
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const result = await response.json()
    const websocketId = result.websocket_id
    if (!websocketId) {
      throw new Error('未获取到websocket_id')
    }
    connectTaskSocket(websocketId)
  } catch (error) {
    console.error('AI Error:', error)
    history.value.push({
      role: selectedModel.value || 'assistant',
      content: '抱歉，AI服务暂时不可用，请稍后重试。'
    })
    taskStatus.value = 'none'
    resetTokenStats()
  }
}

const fetchExecutedTaskCount = async () => {
  try {
    const response = await fetch(buildAiApiUrl('/executed_task'))
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const result = await response.json()
    if (result.executed_task !== undefined) {
      executedTaskCount.value = result.executed_task
    }
  } catch (error) {
    console.error('获取已执行任务总数失败:', error)
    executedTaskCount.value = -1
  }
}

onMounted(() => {
  document.title = 'AI-VMZ对话体验'
  connectBroadcastSocket()
  fetchExecutedTaskCount()
  setTimeout(() => {
    scrollControlPanel()
  }, 500)
})

onUnmounted(() => {
  disconnectBroadcastSocket()
  disconnectTaskSocket()
})
</script>

<style scoped>

@font-face {
  font-family: "en_font";
  src: local("Times New Roman");
  unicode-range: U+0041-005A, U+0061-007A;
}

@font-face {
  font-family: "other_font";
  src: local("Microsoft YaHei");
  font-style: normal;
}

* {
  font-family: "en_font", "other_font", sans-serif;
}

.highlight {
  color: green;
  font-weight: bold;
}

.warning {
  color:rgb(255,30,30);
  font-weight: bold;
}

#ai-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(100, 100, 100);
  padding: 1rem 4rem;
  box-sizing: border-box;
  overflow: auto;
}

#main-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 50rem;
  min-height: 30rem;
  margin: auto;
  border-radius: 1rem;
  overflow: hidden;
}

#control-panel {
  z-index: 2;
  position: absolute;
  left: 0;
  top: 0;
  width: 15rem;
  height: 100%;
  background-color: rgb(230, 230, 230);
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.2);
  transition: all 1s ease-in-out;
  overflow-y: auto;
}

#control-panel.collapsed {
  left: -15rem;
}

#button-area {
  position: relative;
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 0 0.5rem;
}

.divider-line {
  height: 1px;
  background-color: black;
  margin: 0.5rem 1rem;
}

#ismismcube-button,
#return-button,
#save-button {
  width: 4rem;
  height: 1.5rem;
  font-size: 0.8rem;
  font-weight: bold;
  line-height: 1.5rem;
  text-align: center;
  white-space: nowrap;
  background-color: rgb(200, 200, 200);
  box-shadow: 0.2rem 0.2rem 0.3rem rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

#save-button.disabled {
  cursor: not-allowed;
}

#ismismcube-button:hover,
#return-button:hover,
#save-button:hover:not(.disabled) {
  background-color: gray;
  transform: translateY(-2px);
  box-shadow: 0.4rem 0.4rem 0.3rem rgba(0, 0, 0, 0.3);
}

#server-area {
  position: relative;
  margin: 0.5rem 0;
  padding: 0;
  cursor: default;
}

#connection-status {
  width: fit-content;
  height: 2rem;
  padding: 0 0.75rem;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  line-height: 2rem;
  text-align: center;
  white-space: nowrap;
  border-radius: 0.5rem;
  margin: 0 auto;
}

#connection-status.connected {
  background-color: green;
}

#connection-status.disconnected {
  background-color: #ff5722;
  animation: pulse 1s infinite;
}

#queue-info {
  display: flex;
  margin: 0.5rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

#executed-info, #waiting-info, #executing-info {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  gap: 0.3rem;
}

#executed-info span, #waiting-info span, #executing-info span {
  display: inline-block;
  vertical-align: middle;
}

#task-area {
  margin: 0.5rem 0;
  cursor: default;
}

#task-status {
  width: fit-content;
  height: 2rem;
  font-weight: bold;
  font-size: 1rem;
  line-height: 2rem;
  text-align: center;
  white-space: nowrap;
  border-radius: 0.5rem;
  margin: 0 auto;
  overflow: hidden;
  background-color: rgb(200, 200, 200);
}

#queue-status {
  position: relative;
  width: 6rem;
  height: 100%;
}

#progress-fill {
  position: absolute;
  height: 100%;
  background: green;
  transition: width 0.3s ease;
}

#progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3)
  );
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0%);
  }
}

#progress-text {
  z-index: 1;
  position: absolute;
  left: 0;
  right: 0;
  height: 100%;
  font-size: 1rem;
  color: white;
}

#running-status {
  background-color: green;
  padding: 0 0.75rem;
  color: white;
}

#none-status {
  padding: 0 0.75rem;
}

#task-info {
  margin: 0.5rem 0;
  text-align: center;
  font-size: 0.8rem;
}

#models-list {
  margin: 0.2rem 1rem;
  background-color: white;
  border-radius: 0.2rem;
  font-weight: bold;
  overflow: hidden;
}

.model-item {
  position: relative;
  margin: 0 auto;
  padding: 0.2rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.model-item:hover {
  background-color: rgb(200, 200, 200);
}

.model-item.selected {
  width: fit-content;
  border-radius: 0.2rem;
  color: white;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    background-color: green;
  }
  50% {
    background-color: rgba(0, 128, 0, 0.5);
  }
}

.model-item.selected::after {
  content: '✔';
  position: absolute;
  right: -1rem;
  color: green;
  font-size: 1rem;
}

.model-link {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.8rem;
  font-style: italic;
}

#introduction-area, #notice-area, #warning-area {
  padding: 0 1rem;
  font-size: 0.8rem;
  text-indent: 1em;
  text-align: justify;
}

#notice-area {
  font-weight: bold;
}

#warning-area {
  color:rgb(255,30,30);
  font-weight: bold;
}

.intro-item {
  position: relative;
}

.intro-item + .intro-item {
  margin-top: 0.2rem;
}

.intro-item::before {
  content: "•";
  position: absolute;
  left: -0.5rem;
  font-weight: bold;
}

#contact-area {
  padding: 0 1rem;
  font-size: 0.8rem;
  text-align: center;
  font-style: italic;
}

#control-panel-toggle {
  position: absolute;
  top: 1rem;
  left: 15rem;
  width: 1.5rem;
  height: 1.5rem;
  background-color: rgb(230, 230, 230);
  border-radius: 0 0.5rem 0.5rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: left 1s ease-in-out;
  box-shadow: 0.1rem 0.1rem 0.1rem rgba(0, 0, 0, 0.3);
  z-index: 3;
}

#control-panel-toggle.collapsed {
  left: 0;
}

#control-panel-toggle:hover {
  background-color:rgb(200, 200, 200);
  width: calc(1.5rem + 3px);
}

#control-panel-toggle svg {
  width: 1rem;
  height: 1rem;
  color: black;
  stroke: black;
}

#message-panel {
  z-index: 1;
  position: absolute;
  left: 15rem;
  width: calc(100% - 15rem);
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  /* 确保flex容器不会被其中的子元素撑开撑开 */
  min-width: 0;
  min-height: 0;
  transition: all 1s ease-in-out;
}

#message-panel.widened {
  left: 0;
  width: 100%;
}

#message-area-wrapper {
  flex: 1;
  position: relative;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  margin: 0.5rem 1rem;
  min-height: 0;
}

#message-area-overlay {
  z-index: 2;
  grid-row: 1;
  grid-column: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  pointer-events: none;
  position: relative;
  box-shadow: inset 0 0 2px 2px rgba(0, 0, 0, 0.1);
}

#generating-indicator {
  z-index: 1;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding: 1rem 0 0.2rem 0;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8), 1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8);
  pointer-events: auto;
}

#generating-indicator span {
  cursor: pointer;
  user-select: none;
}

#generating-indicator::before {
  z-index: -1;
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(100, 100, 100, 1), rgba(100, 100, 100, 0));
  animation: pulse-opacity 1.5s ease-in-out infinite;
}

@keyframes pulse-opacity {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.9;
  }
}

#message-area {
  z-index: 1;
  grid-row: 1;
  grid-column: 1;
  overflow: auto;
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: rgb(250, 250, 250);
}

.message {
  position: relative;
  width: 100%;
  display: flex;
}

.message.user {
  flex-direction: row-reverse;
}

.message.faded {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.content {
  max-width: calc(100% - 3rem);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: pre-wrap;
}

.content.assistant {
  border-bottom-left-radius: 0.25rem;
}

.model-label{
  position: absolute;
  font-size: 0.7rem;
  color: gray;
  top: -1rem;
  left: 1rem;
}

/* Markdown 样式 */
.markdown {
  white-space: normal !important;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown :deep(think) {
  display: block;
  font-size: 0.9em;
  font-style: italic;
  padding: 0.2em 0.3em;
  background-color: rgba(128, 128, 128, 0.2);
  border-left: 0.3em solid rgba(128, 128, 128, 0.5);
  border-radius: 0.3em;
}

.markdown :deep(ul),
.markdown :deep(ol) {
  padding-left: 0.5em;
}

.markdown :deep(h1),
.markdown :deep(h2),
.markdown :deep(h3),
.markdown :deep(h4),
.markdown :deep(h5),
.markdown :deep(h6) {
  font-weight: bold;
}

.markdown :deep(h1) {
  font-size: 1.5em;
}

.markdown :deep(h2) {
  font-size: 1.3em;
}

.markdown :deep(h3) {
  font-size: 1.15em;
}

.markdown :deep(h4) {
  font-size: 1em;
}

.markdown :deep(code) {
  background-color: rgba(128, 128, 128, 0.1);
  padding: 0.2em;
  border-radius: 0.3em;
  font-family: 'Consolas', 'Monaco', 'Courier New', Courier, monospace;
  font-size: 0.9em;
  color: darkgreen;
}

.markdown :deep(pre) {
  background-color: rgba(128, 128, 128, 0.1);
  padding: 0.2em 0.8em;
  border-radius: 0.3em;
  border: 1px solid black;
}

.markdown :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
  display: block;
}

.markdown :deep(blockquote) {
  padding: 0.5em 1em;
  border-left: 0.3em solid rgba(128, 128, 128, 0.5);
  background-color: rgba(128, 128, 128, 0.1);
  color: rgb(100, 100, 100);
}

.markdown :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.markdown :deep(table th),
.markdown :deep(table td) {
  border: 1px solid black;
  padding: 0.3em;
  text-align: center;
}

.markdown :deep(table th) {
  background-color: rgba(128, 128, 128, 0.1);
  font-weight: bold;
}

.markdown :deep(table tr:nth-child(even)) {
  background-color: rgba(128, 128, 128, 0.1);
}

.markdown :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
}

.markdown :deep(br) {
  display: block;
  content: "";
  margin: 0.5em 0;
}

.markdown > *:first-child {
  margin-top: 0;
}

.markdown > *:last-child {
  margin-bottom: 0;
}

.content.user {
  background-color: green;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.edit-icon {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  color: gray;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-icon:hover {
  color: black;
}

.edit-icon svg {
  width: 1rem;
  height: 1rem;
}

.edit-buttons {
  position: relative;
  left: -0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.edit-button {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.edit-button svg {
  width: 0.8rem;
  height: 0.8rem;
}

.cancel-button {
  color: #ff5722;
  background-color: rgba(255, 87, 34, 0.1);
}

.cancel-button:hover {
  background-color: rgba(255, 87, 34, 0.2);
  transform: scale(1.1);
}

.confirm-button {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}

.confirm-button:hover {
  background-color: rgba(76, 175, 80, 0.2);
  transform: scale(1.1);
}

#input-area {
  position: relative;
  padding: 0.5rem 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

#input-textarea {
  flex: 1;
  padding: 0.5rem;
  background-color: rgb(250, 250, 250);
  font-size: 0.9rem;
  line-height: 1.5;
  font-family: inherit;
  border-radius: 0.5rem;
  box-shadow: inset 0 0 2px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

#input-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

#settings-button {
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0.2rem 0.2rem 0.3rem rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(200, 200, 200);
  flex-shrink: 0;
}

#settings-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

#settings-button:hover {
  background-color: gray;
  transform: translateY(-2px);
  box-shadow: 0.4rem 0.4rem 0.3rem rgba(0, 0, 0, 0.3);
}

#send-stop-button {
  width: 4rem;
  height: 2.5rem;
  cursor: pointer;
  font-weight: bold;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0.2rem 0.2rem 0.3rem rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

#send-stop-button.send {
  background-color: green;
}

#send-stop-button.stop {
  background-color: rgb(255,30,30);
}

#send-stop-button.disabled {
  background-color: rgb(200, 200, 200);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

#send-stop-button:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0.4rem 0.4rem 0.3rem rgba(0, 0, 0, 0.3);
}

#send-stop-button.send:hover:not(.disabled) {
  background-color: darkgreen;
}

#send-stop-button.stop:hover:not(.disabled) {
  background-color: darkred;
}

#settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

#settings-modal {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

#settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background-color: rgb(230, 230, 230);
  box-shadow: 0 -2px 6px black;
}

#settings-header h3 {
  font-size: 1rem;
}

#close-settings {
  cursor: pointer;
  margin-right: 1.25rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

#close-settings svg {
  width: 1rem;
  height: 1rem;
}

#close-settings:hover {
  background-color: white
}

#settings-content {
  padding: 0.5rem 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgb(230, 230, 230);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item label {
  font-size: 0.9rem;
  font-weight: bold;
  flex: 1;
}

.setting-value {
  font-size: 0.8rem;
  font-weight: bold;
  color: green;
  min-width: 4rem;
  text-align: center;
}

.setting-value.readonly-value {
  color: black;
}
.system-prompt-item {
  flex-direction: column;
}

.system-prompt-item label {
  margin-bottom: 0.5rem;
  align-self: flex-start;
}

.system-prompt-input {
  width: 100%;
  min-height: 6rem;
  padding: 0.5rem;
  background-color: rgb(250, 250, 250);
  border-radius: 0.5rem;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  resize: vertical;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.slider {
  flex: 1;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: rgb(230, 230, 230);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: green;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: darkgreen;
  transform: scale(1.2);
}

.slider::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: green;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: darkgreen;
  transform: scale(1.2);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 0 0.5rem 0;
  border-top: 1px solid rgb(230, 230, 230);
  margin-top: 0.5rem;
}

.settings-button {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0.2rem 0.2rem 0.3rem rgba(0, 0, 0, 0.3);
}

.settings-button.reset {
  background-color: rgb(255, 30, 30);
  color: white;
}

.settings-button.reset:hover {
  background-color: darkred;
  transform: translateY(-2px);
  box-shadow: 0.4rem 0.4rem 0.3rem rgba(0, 0, 0, 0.3);
}

.settings-button.cancel {
  background-color: rgb(200, 200, 200);
  color: black;
}

.settings-button.cancel:hover {
  background-color: gray;
  transform: translateY(-2px);
  box-shadow: 0.4rem 0.4rem 0.3rem rgba(0, 0, 0, 0.3);
}

.settings-button.save {
  background-color: green;
  color: white;
}

.settings-button.save:hover {
  background-color: darkgreen;
  transform: translateY(-2px);
  box-shadow: 0.4rem 0.4rem 0.3rem rgba(0, 0, 0, 0.3);
}

/* 竖屏优化 */
@media (orientation: portrait) {
  #ai-container {
    padding: 0;
  }

  #main-container{
    min-width: 0;
    border-radius: 0;
  }

  #control-panel {
    top: 70%;
    width: 100%;
    height: 30%;
  }

  #control-panel.collapsed {
    left: 0;
    top: 100%;
  }

  #message-panel {
    left: 0;
    width: 100%;
    height: 70%;
  }

  #message-panel.widened {
    height: 100%;
  }

  #control-panel-toggle {
    left: 0.5rem;
    top: auto;
    bottom: 30%;
    transform: rotate(-90deg);
    transition: bottom 1s ease-in-out;
    box-shadow: none;
  }

  #control-panel-toggle.collapsed {
    left: 0.5rem;
    bottom: 0;
  }

  #control-panel-toggle:hover {
    width: 1.5rem;
    height: calc(1.5rem + 3px);
  }

  #message-area-wrapper {
    margin: 0;
  }

  #message-area-overlay {
    border-radius: 0;
  }

  #input-textarea {
    margin-left: 1.5rem;
  }
}

/* 小视窗优化 */
@media (max-height: 32rem), (max-width: 58rem) {
  #ai-container {
    padding: 0;
  }
}

</style>
