<template>
  <div id="ismismcube-container">
    <div id="left_part" :class="{ collapsed: isLeftPartClosed }">
      <div id="page_view" title="此网页的总访量">
        <img src="@/assets/page_view_icon.svg" alt="page_view">
        <b>{{ pageView == -1 ? '-' : pageView }}</b>
      </div>
      <div id="online_count" title="当前在线数">
        <p>在线:</p>
        <b>{{ onlineCount == -1 ? '-' : onlineCount }}</b>
      </div>
      <div id="ai_button" @click="goToAI">AI 未明子</div>
      <div id="return_button" @click="openMoreContent">更多内容</div>
      <div id="download_button" @click="downloadIsmJson">下载文件</div>
      <input
        id="search_input"
        type="text"
        placeholder="键入检索词"
        v-model="searchText"
      >
      <div id="ismism_main_cube">
        <div id="show_cube">
          <template v-for="x in 4" :key="`show-${x}`">
            <div
              v-for="y in 4"
              :key="`${5-x}-${y}`"
              class="show_xy ism"
              :style="{ '--x': 5-x, '--y': y, '--a': x == 1 ? 1 : 0.5, '--b': y == 4 ? 1 : 0.5 }"
              :ism_tag="`${5-x}-${y}`"
              :class="getIsmClass(`${5-x}-${y}`)"
              @mouseenter="selectISM(`${5-x}-${y}`)"
              @mouseleave="unselectISM()"
              @click="pinISM(`${5-x}-${y}`)"
            ></div>
          </template>
        </div>
        <div id="show_cube_name">
          <template v-for="x in 4" :key="`show-name-${x}`">
            <div
              v-for="y in 4"
              :key="`show-name-${x}-${y}`"
              class="show_xy_name"
            >
              <p
                class="ism_name"
                :class="{ no_data: ismData && ismData[`${5-x}-${y}`] && ismData[`${5-x}-${y}`].en_name === '' }"
                :style="{ fontSize: getIsmNameFontSize(getIsmName(`${5-x}-${y}`)) }">{{ getIsmName(`${5-x}-${y}`) }}
              </p>
            </div>
          </template>
        </div>
        <div
          v-for="x in 4"
          :key="`line-x-${x}`"
          class="line_x"
          :style="{ '--x': x }"
        >
          <p>{{ x }}</p>
        </div>
        <div
          v-for="y in 4"
          :key="`line-y-${y}`"
          class="line_y"
          :style="{ '--y': y }"
        >
          <p>{{ y }}</p>
        </div>
        <div id="show_cube_x">
          <div
            v-for="i in 4"
            :key="`${i}`"
            class="show_x ism"
            :ism_tag="`${5-i}`"
            :class="getIsmClass(`${5-i}`)"
            @mouseenter="selectISM(`${5-i}`)"
            @mouseleave="unselectISM()"
            @click="pinISM(`${5-i}`)"
          >
            <p
              class="ism_name"
              :class="{ no_data: ismData && ismData[`${5-i}`] && ismData[`${5-i}`].en_name === '' }"
              :style="{ fontSize: getIsmNameFontSize(getIsmName(`${5-i}`)) }">{{ getIsmName(`${5-i}`) }}
            </p>
          </div>
        </div>
        <div id="axis_x"></div>
        <div id="axis_y"></div>
        <div id="axis_z"></div>
      </div>
      <div id="axis_label">
        <p id="axis_label_x">场域论</p>
        <p id="axis_label_y">本体论</p>
        <p id="axis_label_z">认识论</p>
        <p id="axis_label_i">目的论</p>
      </div>
      <div id="ism_info_wrapper">
        <div id="ism_info">
          <div id="increase_fontsize_button" @click="increaseFontSize"></div>
          <div id="decrease_fontsize_button" @click="decreaseFontSize"></div>
          <div id="ism_info_content" v-html="content"></div>
        </div>
        <div id="ism_info_overlay"></div>
      </div>
      <div id="size_adjuster">
        <div
          id="size_indicator"
          @mousedown="setIndicatorActive"
          :style="{ top: sizeIndicatorRatio * 100 + '%' }"
        >
        </div>
      </div>
    </div>

    <div id="right_part" :class="{ widened: isLeftPartClosed }">
      <div id="ismism_cube_box" :style="{ transform: `scale(${1 + sizeIndicatorRatio * 1.5})` }">
        <div
          v-for="x in 4"
          :key="`${x}`"
          class="ism_x"
          :style="{ '--x': 4-x }"
        >
          <div
            v-for="y in 4"
            :key="`${x}-${y}`"
            class="ism_xy"
          >
            <div id="i"></div>
            <div id="z"></div>
            <div
              v-for="z in 4"
              :key="`${x}-${y}-${z}`"
              class="ism_xyz ism"
              :style="{ '--z': z }"
              :ism_tag="`${x}-${y}-${5-z}`"
              :class="getIsmClass(`${x}-${y}-${5-z}`)"
              @mouseover="selectISM(`${x}-${y}-${5-z}`)"
              @mouseout="unselectISM()"
              @click="pinISM(`${x}-${y}-${5-z}`)"
            >
              <p
                class="ism_name"
                :class="{ no_data: ismData && ismData[`${x}-${y}-${5-z}`] && ismData[`${x}-${y}-${5-z}`].en_name === '' }"
                :style="{ fontSize: getIsmNameFontSize(getIsmName(`${x}-${y}-${5-z}`)) }">{{ getIsmName(`${x}-${y}-${5-z}`) }}
              </p>
              <div id="ism_xyz_label_column">{{ 5-z }}</div>
              <div
                v-for="i in 4"
                :key="`${x}-${y}-${5-z}-${i}`"
                class="ism_xyzi ism"
                :style="{ '--i': i }"
                :ism_tag="`${x}-${y}-${5-z}-${5-i}`"
                :class="getIsmClass(`${x}-${y}-${5-z}-${5-i}`)"
                @mouseover.stop="selectISM(`${x}-${y}-${5-z}-${5-i}`)"
                @mouseout.stop="unselectISM()"
                @click.stop="pinISM(`${x}-${y}-${5-z}-${5-i}`)"
              >
                <p
                  class="ism_name"
                  :class="{ no_data: ismData && ismData[`${x}-${y}-${5-z}-${5-i}`] && ismData[`${x}-${y}-${5-z}-${5-i}`].en_name === '' }"
                  :style="{ fontSize: getIsmNameFontSize(getIsmName(`${x}-${y}-${5-z}-${5-i}`)) }">{{ getIsmName(`${x}-${y}-${5-z}-${5-i}`) }}
                </p>
                <div id="ism_xyz_label_row">{{ 5-i }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buildStaticUrl } from '../../config/static.ts'
import { buildApiUrl } from '../../config/api.ts'

// 响应式数据
const ismData = ref<any>(null)
const axisColor = ["red", "green", "blue", "darkorange"]
const ismInfoFontSize = ref(1.0)
const pageView = ref(-1)
const onlineCount = ref(-1)
const searchText = ref('')
const sizeIndicatorRatio = ref(0)
const content = ref('')
const isLeftPartClosed = ref(false)

// WebSocket连接
let socket: WebSocket | null = null
let reconnectTimer: number | null = null

// 路由
const route = useRoute()
const router = useRouter()

// WebSocket连接管理
const connectWebSocket = () => {
  try {
    // 根据当前页面协议自动选择 WebSocket 协议
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${buildApiUrl('/ismismcube/online')}`
    socket = new WebSocket(wsUrl)
    socket.addEventListener("open", () => {
      console.log("WebSocket连接成功")
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    })
    socket.addEventListener("message", (event) => {
      const message = event.data
      if (message.startsWith('broadcast')) {
        try {
          const data = JSON.parse(message.substring(message.indexOf('{')))
          if (data.online !== undefined) {
            onlineCount.value = data.online
          }
        } catch (error) {
          console.error("WebSocket JSON解析失败:", message, error)
        }
      } else {
        console.error("WebSocket消息解析失败:", message)
      }
    })
    socket.addEventListener("error", (error) => {
      console.error("WebSocket连接错误:", error)
    })
    socket.addEventListener("close", (event) => {
      console.log("WebSocket连接关闭:", event.code, event.reason)
      if (event.code !== 1000) {
        reconnectTimer = setTimeout(() => {
          connectWebSocket()
        }, 3000)
      }
    })
  } catch (error) {
    console.error("WebSocket连接失败:", error)
    reconnectTimer = setTimeout(() => {
      connectWebSocket()
    }, 3000)
  }
}

const disconnectWebSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (socket) {
    console.log('关闭WebSocket连接')
    // 移除所有事件监听器，防止触发重连
    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null
    socket.close(1000, "页面卸载")
    socket = null
  }
}

// 计算属性
const getIsmClass = (ismTag: string) => {
  const classes = []
  const currentIsmTag = route.params.ismTag as string
  if (currentIsmTag && ismTag.startsWith(currentIsmTag)) {
    classes.push('pinned')
  }
  if (searchText.value && isSearchResult(ismTag)) {
    classes.push('searched')
  }
  return classes
}

const getIsmName = (ismTag: string) => {
  if (!ismData.value || !ismData.value[ismTag]) return ''
  const name = ismData.value[ismTag].ch_name.split('/')[0].replace('"', '"').replace('"', '"')
  return name
}

const getIsmNameFontSize = (text: string) => {
  return text.length > 4 ? '0.75rem' : '1rem'
}

// 总初始化
const initial = async () => {
  try {
    const response = await fetch(buildStaticUrl('/ism.json'))
    if (response.ok) {
      ismData.value = await response.json()
      handleRoute()
    } else {
      content.value = "<div style='text-align: center;'>数据加载失败\n\n请检测网络后重试\n或\n强制重新加载此页面(windows快捷键 Ctrl + F5)</div>"
    }
  } catch (error) {
    console.error('Failed to load ism.json:', error)
    content.value = "<div style='text-align: center;'>数据加载失败\n\n请检测网络后重试\n或\n强制重新加载此页面(windows快捷键 Ctrl + F5)</div>"
  }

  try {
    const response = await fetch(buildApiUrl('/ismismcube/page_view'))
    if (response.ok) {
      const data = await response.json()
      pageView.value = data.page_view
    }
  } catch (error) {
    console.error('Failed to load page view:', error)
  }
}

const handleRoute = () => {
  const ismTag = route.params.ismTag as string
  if (!ismTag || ismTag === '') {
    document.title = "主义主义魔方"
    showIntroduction()
  } else if (ismData.value && ismData.value[ismTag]) {
    document.title = "主义主义魔方-" + ismData.value[ismTag].ch_name
    setISMInfo(ismTag)
  }
}

const selectISM = (ismTag: string) => {
  setISMInfo(ismTag)
  const ismNodes = document.querySelectorAll('.ism')
  for (const ismNode of ismNodes) {
    const nodeIsmTag = ismNode.getAttribute('ism_tag')
    if (nodeIsmTag && nodeIsmTag.startsWith(ismTag)) {
      ismNode.classList.add('selected')
    }
  }
}

const unselectISM = () => {
  const ismNodes = document.querySelectorAll('.ism')
  for (const ismNode of ismNodes) {
    ismNode.classList.remove('selected')
  }
  handleRoute()
}

const pinISM = (ismTag: string) => {
  const currentIsmTag = route.params.ismTag as string
  if (currentIsmTag === ismTag) {
    router.push('/')
  } else {
    router.push('/' + ismTag)
  }
}

const setISMInfo = (ismTag: string) => {
  if (!ismData.value || !ismData.value[ismTag]) return
  const ismTagData = ismData.value[ismTag]
  const ismTagfontSize = 1.1*ismInfoFontSize.value;
  let contentHtml = `<div style='text-align: center; font-size: ${ismInfoFontSize.value}rem;'>`
  if (ismTag.length >= 1) {
    contentHtml += `<p style='display: inline-block;width:${ismTagfontSize}rem;height:${ismTagfontSize}rem;line-height:${ismTagfontSize}rem;color:red;border:solid black ${ismTagfontSize/10}rem;'><b>${ismTag[0]}</b></p>`
  }
  if (ismTag.length >= 3) {
    contentHtml += `-<p style='display: inline-block;width:${ismTagfontSize}rem;height:${ismTagfontSize}rem;line-height:${ismTagfontSize}rem;color:green;border:solid black ${ismTagfontSize/10}rem;'><b>${ismTag[2]}</b></p>`
  }
  if (ismTag.length >= 5) {
    contentHtml += `-<p style='display: inline-block;width:${ismTagfontSize}rem;height:${ismTagfontSize}rem;line-height:${ismTagfontSize}rem;color:blue;border:solid black ${ismTagfontSize/10}rem;'><b>${ismTag[4]}</b></p>`
  }
  if (ismTag.length >= 7) {
    contentHtml += `-<p style='display: inline-block;width:${ismTagfontSize}rem;height:${ismTagfontSize}rem;line-height:${ismTagfontSize}rem;color:darkorange;border:solid black ${ismTagfontSize/10}rem;'><b>${ismTag[6]}</b></p>`
  }
  contentHtml += `\n<b>${ismTagData.ch_name}\n${ismTagData.en_name}</b></div>`
  const axisListData = ismTagData.axis_list
  contentHtml += `<div style='line-height: 1.4;'>`
  let colorCount = 0
  for (const i of axisListData) {
    contentHtml += `<b style='color:${axisColor[colorCount++]}'>${i.slice(0,3)}</b><p style='display:inline-block;text-align: center;width:${1.1*ismInfoFontSize.value}rem;height:${1.1*ismInfoFontSize.value}rem;line-height:${1.1*ismInfoFontSize.value}rem;border:solid black ${0.1*ismInfoFontSize.value}rem;'><b>${i.slice(3,4)}</b></p>${i.slice(4)}\n`
  }
  contentHtml += `</div><div style='line-height: 1.4;'>`
  const featureListData = ismTagData.feature_list
  for (const i of featureListData) {
    if (i !== '') {
      contentHtml += `<b>${i.slice(0,1)}</b>${i.slice(1)}\n`
    }
  }
  contentHtml += `</div><div style='text-align: center; line-height: 1.4;'>`
  const relatedListData = ismTagData.related_list
  for (const i of relatedListData) {
    if (i !== '') {
      const splitIndex = i.indexOf('：') + 1
      if (i.search("http") === -1) {
        contentHtml += `<b>${i.slice(0,splitIndex)}</b>${i.slice(splitIndex)}\n`
      } else {
        contentHtml += `<b>${i.slice(0,splitIndex)}</b><a href='${i.slice(splitIndex)}' target='_blank'>${i.slice(splitIndex)}</a>\n`
      }
    }
  }
  contentHtml += `</div>`
  content.value = contentHtml

  if (searchText.value !== '') {
    renewInfo(searchText.value)
  }
}

const renewInfo = (target: string) => {
  const reg = new RegExp(target, 'gi')
  content.value = content.value.replace(reg, "<span style='background-color:rgb(225, 172, 39);'>$&</span>")
}

const isSearchResult = (ismTag: string) => {
  if (!ismData.value || !ismData.value[ismTag] || searchText.value === '') return false
  const ismTagData = ismData.value[ismTag]
  const reg = new RegExp(searchText.value, 'i')
  if (ismTagData.ch_name.search(reg) !== -1 || ismTagData.en_name.search(reg) !== -1) {
    return true
  }
  const axisListData = ismTagData.axis_list
  for (const i of axisListData) {
    if (i.search(reg) !== -1) {
      return true
    }
  }
  const featureListData = ismTagData.feature_list
  for (const i of featureListData) {
    if (i.search(reg) !== -1) {
      return true
    }
  }
  const relatedListData = ismTagData.related_list
  for (const i of relatedListData) {
    if (i.search(reg) !== -1) {
      return true
    }
  }
  return false
}

const showIntroduction = () => {
  if (!ismData.value || !ismData.value.introduction) return
  const introduction = ismData.value.introduction
  let contentHtml = `<div style='line-height: 1.4;'>`
  for (const i of introduction) {
    contentHtml += i
  }
  contentHtml += `\n<HR><p style='text-align:center'><a href='https://beian.miit.gov.cn/' target='_blank' style='font-style:normal;text-decoration:none'>京ICP备2024067574号-1</a>\n<a href='https://beian.mps.gov.cn/#/query/webSearch?code=11010802044945' target='_blank' style='font-style:normal;text-decoration:none'>京公网安备11010802044945</a><p>`
  contentHtml += `</div>`
  content.value = contentHtml
}

const increaseFontSize = () => {
  ismInfoFontSize.value += 0.1
  document.getElementById('ism_info')!.style.fontSize = ismInfoFontSize.value + 'rem'
  const currentIsmTag = route.params.ismTag as string
  if (currentIsmTag && currentIsmTag !== '') {
    setISMInfo(currentIsmTag)
  }
}

const decreaseFontSize = () => {
  ismInfoFontSize.value -= 0.1
  document.getElementById('ism_info')!.style.fontSize = ismInfoFontSize.value + 'rem'
  const currentIsmTag = route.params.ismTag as string
  if (currentIsmTag && currentIsmTag !== '') {
    setISMInfo(currentIsmTag)
  }
}

const openMoreContent = () => {
  window.open("https://www.maybered.com", "_blank")
}

const downloadIsmJson = () => {
  try {
    if (!ismData.value) {
      alert("数据加载失败，请检查网络后重试")
      return
    }
    const jsonString = JSON.stringify(ismData.value, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ism.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading ism.json:', error)
    alert("下载失败，请重试")
  }
}

const goToAI = () => {
  router.push('/ai')
}

const setIndicatorActive = () => {
  document.body.style.userSelect = "none"
  document.body.style.pointerEvents = "none"
  document.documentElement.style.cursor = "pointer"
  document.getElementById('size_indicator')!.style.pointerEvents = "auto"
  document.getElementById('size_indicator')!.style.backgroundColor = "gray"
  window.addEventListener("mouseup", setOverview)
  window.addEventListener("mousemove", changeSize)
  window.addEventListener("mouseup", closeIndicator)
}

const setOverview = () => {
  document.body.style.userSelect = ""
  document.body.style.pointerEvents = ""
  document.documentElement.style.cursor = ""
  document.getElementById('size_indicator')!.style.backgroundColor = ""
  window.removeEventListener("mouseup", setOverview)
  window.removeEventListener("mousemove", changeSize)
  window.removeEventListener("mouseup", closeIndicator)
  isLeftPartClosed.value = !isLeftPartClosed.value
}

const changeSize = (event: MouseEvent) => {
  window.removeEventListener("mouseup", setOverview)
  const max = document.getElementById('size_adjuster')!.offsetHeight
  sizeIndicatorRatio.value += event.movementY / max
  if (sizeIndicatorRatio.value < 0) sizeIndicatorRatio.value = 0
  else if (sizeIndicatorRatio.value > 1) sizeIndicatorRatio.value = 1
}

const closeIndicator = () => {
  document.body.style.userSelect = ""
  document.body.style.pointerEvents = ""
  document.documentElement.style.cursor = ""
  document.getElementById('size_indicator')!.style.backgroundColor = ""
  window.removeEventListener("mouseup", setOverview)
  window.removeEventListener("mousemove", changeSize)
  window.removeEventListener("mouseup", closeIndicator)
}

// 监听路由变化
watch(() => route.params.ismTag, () => {
  handleRoute()
}, { immediate: true })

// 生命周期
onMounted(() => {
  document.documentElement.style.fontSize = Math.max(screen.width, screen.height) / 96 + "px"
  initial()
  connectWebSocket()
})

onUnmounted(() => {
  document.documentElement.style.fontSize = ""
  disconnectWebSocket()
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

#ismismcube-container {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.ism {
  cursor: pointer;
}

/* 基础色 */
.show_x,
.show_xy,
.ism_xyz::before {
  background-color: rgb(170, 170, 170);
}

.show_xy::before,
.ism_xyz {
  background-color: gray;
}

.show_xy::after,
.ism_xyz::after,
.ism_xyzi {
  background-color: rgb(200, 200, 200);
}

/* searched状态颜色优先级最低 */
.show_x.searched,
.show_xy.searched,
.ism_xyz.searched::before {
  background-color: rgb(201, 149, 15);
}

.show_xy.searched::before,
.ism_xyz.searched {
  background-color: darkgoldenrod;
}

.show_xy.searched::after,
.ism_xyz.searched::after,
.ism_xyzi.searched {
  background-color: rgb(225, 172, 39);
}

.show_x.pinned,
.show_xy.pinned,
.ism_xyz.pinned::before {
  background-color: rgb(11, 167, 167);
}

.show_xy.pinned::before,
.ism_xyz.pinned {
  background-color: darkcyan;
}

.show_xy.pinned::after,
.ism_xyz.pinned::after,
.ism_xyzi.pinned {
    background-color: rgb(17, 188, 188);
}

.show_x.selected,
.show_xy.selected,
.ism_xyz.selected::before {
    background-color: rgb(182, 53, 53);
}

.show_xy.selected::before,
.ism_xyz.selected {
    background-color: brown;
}

.show_xy.selected::after,
.ism_xyz.selected::after,
.ism_xyzi.selected {
  background-color: rgb(218, 73, 73);
}

/* 名称 */
.ism_name {
  width: 2.5rem;
  max-height: 3rem;
  font-size: 0.75em;
  line-height: 1.3;
  text-align: center;
  word-break: normal;
  overflow: hidden;
  text-wrap: balance;
  color: black;
}

.show_x .ism_name.no_data,
.show_xy_name .ism_name.no_data {
  color: rgb(100, 100, 100);
}

.ism_xyz .ism_name.no_data {
  color: rgb(68,68,68);
}

.ism_xyzi .ism_name.no_data {
  color: rgb(130, 130, 130);
}

#left_part {
  z-index: 1;
  position: absolute;
  left: 0;
  top: 0;
  width: 40rem;
  height: 100%;
  min-height: 40rem;
  background-color: rgb(230, 230, 230);
  box-shadow: -1rem 0 1rem 1rem black;
  transition: all 1s ease-in-out;
}

#left_part.collapsed {
  left: -40rem;
}

#page_view {
  position: absolute;
  left: 1rem;
  top: 0;
  width: 4rem;
  height: 1.5rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  cursor: default;
}

#page_view img {
  width: 1rem;
  height: 1rem;
}

#online_count {
  position: absolute;
  right: 31.5rem;
  top: 0;
  width: 3.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: right;
  cursor: default;
}

#online_count b {
  color: green;
}

#ai_button {
  position: absolute;
  left: 1rem;
  top: 1.5rem;
  width: 7.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  line-height: 1.5rem;
  text-align: center;
  white-space: nowrap;
  background-color: rgb(200, 200, 200);
  border: solid black 1px;
  overflow: hidden;
  cursor: pointer;
}

#return_button {
  position: absolute;
  left: 1rem;
  top: 3.5rem;
  width: 3.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  line-height: 1.5rem;
  text-align: center;
  white-space: nowrap;
  background-color: rgb(200, 200, 200);
  border: solid black 1px;
  overflow: hidden;
  cursor: pointer;
}

#download_button {
  position: absolute;
  left: 5rem;
  top: 3.5rem;
  width: 3.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  line-height: 1.5rem;
  text-align: center;
  white-space: nowrap;
  background-color: rgb(200, 200, 200);
  border: solid black 1px;
  overflow: hidden;
  cursor: pointer;
}

#ai_button:hover,
#return_button:hover,
#download_button:hover {
  background-color: gray;
}

#search_input {
  position: absolute;
  left: 1rem;
  top: 5.5rem;
  width: 7.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  line-height: 1.5rem;
  text-align: center;
  border: solid black 1px;
}

#ismism_main_cube {
  position: absolute;
  left: 10rem;
  top: 3.8rem;
  transform: skewY(-15deg);
}

#show_cube {
  z-index: -1;
  position: absolute;
  display: grid;
  grid-template-columns: repeat(4, 2.5rem);
  grid-template-rows: repeat(4, 3rem);
  gap: 0;
  width: 20rem;
  height: 17.8rem;
  contain: strict;
  overflow: hidden;
  transform: skewY(30deg);
  clip-path: polygon(0% 100%, calc(50% - 1px) 100%, 100% 68%, 100% 0%, calc(50% - 1px) 0%, 0% 32%);
}

.show_xy {
  z-index: var(--x);
  position: relative;
  top: 5.8rem;
  width: 2.5rem;
  height: 3rem;
  transform-origin: right;
  box-sizing: border-box;
  border: solid black 1px;
  display: flex;
}

.show_xy.selected,
.show_xy.pinned,
.show_xy.searched {
  z-index: calc(100 + var(--x));
}

.show_xy::before {
  z-index: -1;
  content: "";
  position: absolute;
  left: calc(2.5rem - 1px);
  top: -1px;
  width: 10rem;
  height: 3rem;
  box-sizing: border-box;
  border: solid black 1px;
  display: flex;
  transform-origin: left;
  transform: skewY(-30deg);
  opacity: var(--b);
  pointer-events: none;
}

.show_xy[style*="--y: 4"]::before {
  pointer-events: auto;
}

.show_xy::after {
  z-index: 1;
  content: "";
  position: absolute;
  left: -2px;
  top: calc(-5.9rem + 1px);
  width: 2.5rem;
  height: calc(5.9rem - 1px);
  box-sizing: border-box;
  border: solid black 1px;
  transform-origin: bottom;
  transform: skewX(-60deg);
  opacity: var(--a);
  pointer-events: none;
}

.show_xy[style*="--x: 4"]::after {
  pointer-events: auto;
}

#show_cube_name {
  z-index: 1;
  position: absolute;
  top: 2.9rem;
  display: grid;
  grid-template-columns: repeat(4, 2.5rem);
  grid-template-rows: repeat(4, 3rem);
  gap: 0;
  transform: skewY(30deg);
  pointer-events: none;
}

.show_xy_name {
  position: relative;
  width: 2.5rem;
  height: 3rem;
  display: flex;
  align-items: center;
}

.line_x {
  position: absolute;
  left: 10rem;
  top: calc(12rem - calc(var(--x)*3rem));
  width: 10rem;
  height: 0;
  border-bottom: 1px dashed black;
  transform-origin: left;
  transform: skewY(30deg);
  pointer-events: none;
}

.line_x[style*="--x: 4"] {
  border-bottom: none;
}

.line_x p {
  position: relative;
  left:12.5rem;
  height: 3rem;
  display: flex;
  align-items: center;
  color: red;
}

.line_y {
  position: absolute;
  left: calc(10rem + calc(var(--y)*2.5rem) - 1px);
  top: calc(calc(var(--y)*calc(1.5rem - 1px)) + 1px);
  width: 0;
  height: calc(12rem - 1px);
  border-right: 1px dashed black;
  transform: skewY(30deg);
  pointer-events: none;
}

.line_y[style*="--y: 4"] {
  border-bottom: none;
}

.line_y p {
  position: relative;
  left:-2.5rem;
  top: -1.3rem;
  width: 2.5rem;
  height: 1.5rem;
  color: green;
  text-align: center;
}

#show_cube_x {
  position: absolute;
  left: calc(20rem - 1px);
  top: 6.5rem;
  transform: skewY(30deg);
}

.show_x {
  position: relative;
  list-style: none;
  width: 2.5rem;
  height: 3rem;
  box-sizing: border-box;
  border:solid black 1px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.show_x p {
  position: absolute;
  width: 2.5rem;
  max-height: 3rem;
  text-align: center;
  word-break: normal;
  overflow: hidden;
  text-wrap: balance;
  pointer-events: none;
}

#axis_x {
  z-index: 10;
  position: absolute;
  left: calc(10rem - 1px);
  top: calc(1rem - 1px);
  height: 11rem;
  border-right: 3px dashed red;
  transform-origin: left;
  transform: skewY(30deg);
  pointer-events: none;
}

#axis_x::before {
  content: "";
  position: absolute;
  left: -3px;
  top: -2rem;
  border-style: solid;
  border-width: 1rem 4px 1rem 4px;
  border-color: transparent transparent red transparent;
}

#axis_y {
  z-index: 9;
  position: absolute;
  left:10rem;
  top: calc(12rem - 1px);
  width: 9rem;
  border-bottom: 3px dashed green;
  transform-origin: left;
  transform: skewY(30deg);
  pointer-events: none;
}

#axis_y::before {
  content: "";
  position: absolute;
  left: 9rem;
  top: -3px;
  border-style: solid;
  border-width: 4px 1rem 4px 1rem;
  border-color: transparent transparent transparent green;
}

#axis_z {
  z-index: 8;
  position: absolute;
  left: 1rem;
  top: calc(12rem - 1px);
  width: 9rem;
  border-bottom: 3px dashed blue;
  transform-origin: top;
  pointer-events: none;
}

#axis_z::before {
  content: "";
  position: absolute;
  left: -2rem;
  top: -3px;
  border-style: solid;
  border-width: 4px 1rem 4px 1rem;
  border-color: transparent blue transparent transparent;
}

#axis_label {
  position: absolute;
  right: 0;
  top: 0.5rem;
  width: 4.5rem;
  height: 8rem;
}

#axis_label p {
  position: relative;
  line-height: 1.5rem;
  text-align: left;
}

#axis_label p::before {
  content: "";
  position: absolute;
  left: -1rem;
  bottom: 0.3rem;
  width: 0.75rem;
  height:0.75rem;
  border:solid black 0.05rem;
}

#axis_label_x::before {
  background-color: red;
}

#axis_label_y::before {
  background-color: green;
}

#axis_label_z::before {
  background-color: blue;
}

#axis_label_i::before {
  background-color: darkorange;
}

#ism_info_wrapper {
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  top: 19.5rem;
  border-radius: 1rem;
  overflow: hidden;
  height: calc(100% - 20rem);
}

#ism_info {
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgb(200, 200, 200);
  border-radius: 1rem;
  overflow: auto;
}

#increase_fontsize_button {
  z-index: 1;
  position: absolute;
  left: 1rem;
  top: 0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 0.5rem;
  background-color: rgb(200,200,200);
  border:solid rgb(170, 170, 170) 0.2rem;
}

#increase_fontsize_button:hover {
  background-color: rgb(170, 170, 170);
}

#increase_fontsize_button::before {
  content: "";
  position: absolute;
  left: 0.1rem;
  top: 0.4rem;
  width: 0.8rem;
  height: 0.2rem;
  background-color: black;
}

#increase_fontsize_button::after {
  content: "";
  position: absolute;
  left: 0.4rem;
  top: 0.1rem;
  width: 0.2rem;
  height: 0.8rem;
  background-color: black;
}

#decrease_fontsize_button {
  z-index: 1;
  position: absolute;
  left: 3rem;
  top: 0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 0.5rem;
  background-color: rgb(200,200,200);
  border:solid rgb(170, 170, 170) 0.2rem;
}

#decrease_fontsize_button:hover {
  background-color: rgb(170, 170, 170);
}

#decrease_fontsize_button::before {
  content: "";
  position: absolute;
  left: 0.1rem;
  top: 0.4rem;
  width: 0.8rem;
  height: 0.2rem;
  background-color: black;
}

#ism_info_content {
  position: relative;
  padding: 0.5rem 1rem;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

#ism_info_overlay {
  z-index: 2;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  box-shadow: inset 0 0 3px 3px gray;
  pointer-events: none;
}

#size_adjuster {
  position: absolute;
  left: 40rem;
  height: calc(100% - 4rem);
}

#size_indicator {
  position: absolute;
  width: 1rem;
  height: 4rem;
  background: rgb(200,200,200) url('@/assets/size_indicator.svg') center/contain no-repeat;
  box-sizing: border-box;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
}

#size_indicator:hover {
  background-color: gray;
  cursor: pointer;
}

#right_part {
  z-index: 0;
  position: absolute;
  left: 40rem;
  width: calc(100% - 40rem);
  min-width: 30rem;
  height: 100%;
  overflow: auto;
  transition: all 1s ease-in-out;
}

#right_part.widened {
  left: 0;
  width: 100%;
}

#ismism_cube_box {
  position: absolute;
  left: 2rem;
  right: 0;
  max-width: 60rem;
  display: flex;
  transform-origin: left;
  overflow: visible;
}

.ism_x {
  position: absolute;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  top: calc(0.5rem + var(--x) * 18rem);
}

.ism_xy {
  position: relative;
  width: 12.5rem;
  height: 18rem;
  contain: strict;
  overflow: hidden;
  transform: skewY(-15deg);
}

.ism_xy p {
  width: 2.5rem;
  max-height: 3rem;
  font-size: 0.75em;
  line-height: 1.3;
  text-align: center;
  pointer-events: none;
}

.ism_xy #i {
  z-index: 1;
  position: absolute;
  left: calc(10rem + 1px);
  top: 2.5rem;
  height: 11rem;
  border-right: 3px dashed darkorange;
  pointer-events: none;
}

.ism_xy #i::before {
  content: "";
  position: absolute;
  left: -3px;
  top: -2rem;
  border-style: solid;
  border-width: 1rem 4px 1rem 4px;
  border-color: transparent transparent darkorange transparent;
}

.ism_xy #z {
  z-index: 1;
  position: absolute;
  left: 1rem;
  top: calc(13.5rem + 1px);
  width: 9rem;
  border-bottom: 3px dashed blue;
  pointer-events: none;
}

.ism_xy #z::before {
  content: "";
  position: absolute;
  left: -2rem;
  top: -3px;
  border-style: solid;
  border-width: 4px 1rem 4px 1rem;
  border-color: transparent blue transparent transparent;
}

.ism_xyz {
  position: absolute;
  left: calc(var(--z) * 2.5rem);
  top: 15rem;
  width: 2.5rem;
  height: 3rem;
  box-sizing: border-box;
  border: solid black 1px;
  display: flex;
  align-items: center;
}

.ism_xyz::before {
  z-index: -2;
  content: "";
  position: absolute;
  left: -2.5rem;
  top: -1px;
  width: 2.5rem;
  height: 3rem;
  box-sizing: border-box;
  border: solid black 1px;
  transform-origin: right;
  transform: skewY(31deg);
}

.ism_xyz::after {
  z-index: -1;
  content: "";
  position: absolute;
  left: 0;
  top: -1.5rem;
  width: 2.5rem;
  height: 1.5rem;
  box-sizing: border-box;
  border: solid black 1px;
  transform-origin: bottom;
  transform: skewX(59deg);
}

#ism_xyz_label_column {
  position: absolute;
  left: -2.5rem;
  top: -14.7rem;
  width: 2.5rem;
  height: 1.5rem;
  color: blue;
  text-align: center;
  pointer-events: none;
}

#ism_xyz_label_row {
  position: absolute;
  left: 2.7rem;
  height: 3rem;
  color: darkorange;
  display: flex;
  align-items: center;
  pointer-events: none;
 }

.ism_xyzi {
  position: absolute;
  left: -2.5rem;
  top: calc(-16.5rem + var(--i) * 3rem);
  width: 2.5rem;
  height: 3rem;
  box-sizing: border-box;
  border: solid black 1px;
  display: flex;
  align-items: center;
}
</style>
