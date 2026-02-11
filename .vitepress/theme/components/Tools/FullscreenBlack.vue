<!-- .vitepress/theme/components/Tools/SystemBlackScreen.vue -->
<template>
  <div class="system-black-screen">
    <!-- 控制面板 -->
    <div class="control-panel">
      <h2>🖥️ 极致黑屏模式</h2>
      <p class="description">创造无干扰的极致黑屏环境，模拟显示器关闭效果</p>
      
      <div class="warning">
        ⚠️ 浏览器限制：无法真正控制操作系统，但这是最接近系统黑屏的效果
      </div>
      
      <div class="settings">
        <div class="setting-item">
          <label>初始提示：</label>
          <select v-model="tipDuration">
            <option value="0">无提示</option>
            <option value="1000">1秒</option>
            <option value="2000">2秒</option>
            <option value="3000">3秒</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label>黑屏模式：</label>
          <div class="mode-options">
            <span 
              v-for="mode in modes"
              :key="mode.value"
              :class="['mode-option', { active: screenMode === mode.value }]"
              @click="screenMode = mode.value"
              :title="mode.description"
            >
              {{ mode.icon }} {{ mode.name }}
            </span>
          </div>
        </div>
        
        <div class="setting-item">
          <label>激活方式：</label>
          <div class="activation-options">
            <span 
              :class="['activation-option', { active: activationMode === 'immediate' }]"
              @click="activationMode = 'immediate'"
            >
              ⚡ 立即激活
            </span>
            <span 
              :class="['activation-option', { active: activationMode === 'fade' }]"
              @click="activationMode = 'fade'"
            >
              🌙 淡入效果
            </span>
          </div>
        </div>
        
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="hideCursor">
            隐藏鼠标指针
          </label>
        </div>
        
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="disableKeys">
            禁用所有按键（ESC除外）
          </label>
        </div>
      </div>
      
      <div class="actions">
        <button 
          class="btn activate-btn"
          @click="activateBlackScreen"
          :disabled="isActive"
        >
          {{ isActive ? '黑屏进行中...' : '🚀 启动极致黑屏' }}
        </button>
        
        <div class="shortcut-hint">
          推荐：按 <kbd>F11</kbd> + <kbd>F</kbd> 进入全屏专注模式
        </div>
        
        <div class="quick-tips">
          <h4>💡 使用技巧：</h4>
          <ul>
            <li>将浏览器窗口最大化</li>
            <li>按 F11 进入浏览器全屏</li>
            <li>关闭其他显示器（如果有多屏）</li>
            <li>调暗房间灯光效果更佳</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 黑屏层 -->
    <div 
      v-if="isActive"
      class="black-screen-container"
      :class="[screenMode, activationMode]"
      :style="screenStyle"
      @click="handleScreenClick"
    >
      <!-- 初始提示 -->
      <transition name="fade">
        <div 
          v-if="showTip"
          class="initial-tip"
          :class="{ 'fade-out': tipFading }"
        >
          <div class="tip-content">
            <div class="tip-icon">🔒</div>
            <h3 class="tip-title">极致黑屏已激活</h3>
            <p class="tip-message">按 <kbd>ESC</kbd> 键退出</p>
            <p class="tip-submessage">所有界面元素已隐藏</p>
          </div>
        </div>
      </transition>
      
      <!-- 退出提示（鼠标移动时显示） -->
      <transition name="slide-up">
        <div 
          v-if="showExitHint"
          class="exit-hint"
          @click.stop="deactivate"
        >
          <span class="hint-text">点击此处或按 ESC 退出</span>
        </div>
      </transition>
      
      <!-- 状态指示器（可选） -->
      <div 
        v-if="showStatusIndicator"
        class="status-indicator"
        :class="{ 'status-hidden': !showExitHint }"
      >
        <div class="indicator-dot"></div>
        <span class="indicator-text">黑屏模式</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const isActive = ref(false)
const showTip = ref(false)
const tipFading = ref(false)
const showExitHint = ref(false)
const showStatusIndicator = ref(false)

// 配置选项
const tipDuration = ref('3000')
const screenMode = ref('deep-black')
const activationMode = ref('fade')
const hideCursor = ref(true)
const disableKeys = ref(true)

// 模式选项
const modes = [
  { 
    name: '深度黑', 
    value: 'deep-black', 
    icon: '⚫',
    description: '纯黑色，模拟OLED关闭'
  },
  { 
    name: '影院模式', 
    value: 'cinema', 
    icon: '🎬',
    description: '深灰色，适合观影环境'
  },
  { 
    name: '专注模式', 
    value: 'focus', 
    icon: '🎯',
    description: '暗蓝色，减少眼睛疲劳'
  },
  { 
    name: '夜间模式', 
    value: 'night', 
    icon: '🌙',
    description: '暖黑色，保护视力'
  }
]

// 计算屏幕样式
const screenStyle = computed(() => {
  const styles = {
    'deep-black': { backgroundColor: '#000000' },
    'cinema': { backgroundColor: '#0a0a0a' },
    'focus': { backgroundColor: '#001122' },
    'night': { backgroundColor: '#0a0806' }
  }
  return styles[screenMode.value] || styles['deep-black']
})

// 存储原始状态
let originalBodyStyle = ''
let originalHtmlStyle = ''
let hiddenElements = []

// 极致隐藏：隐藏页面所有非黑屏内容
const hideEverything = () => {
  console.log('开始极致隐藏...')
  
  // 保存原始样式
  originalBodyStyle = document.body.style.cssText
  originalHtmlStyle = document.documentElement.style.cssText
  
  // 1. 隐藏整个页面内容
  const contentSelectors = [
    '#app',
    '#__nuxt',
    '#__next',
    'main',
    '.content',
    '.container',
    '.wrapper',
    '.VPContent',
    '.VPDoc'
  ]
  
  contentSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(el => {
      if (el && getComputedStyle(el).display !== 'none') {
        hiddenElements.push({ element: el, display: el.style.display })
        el.style.display = 'none'
      }
    })
  })
  
  // 2. 隐藏所有可见元素（除了黑屏层）
  document.querySelectorAll('body > *:not(.black-screen-container):not(script):not(style)').forEach(el => {
    if (el && getComputedStyle(el).display !== 'none') {
      hiddenElements.push({ element: el, display: el.style.display })
      el.style.display = 'none'
    }
  })
  
  // 3. 设置body和html为黑屏样式
  document.body.style.cssText = `
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    background: black !important;
    width: 100vw !important;
    height: 100vh !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
  `
  
  document.documentElement.style.cssText = `
    overflow: hidden !important;
    width: 100% !important;
    height: 100% !important;
    background: black !important;
  `
  
  // 4. 隐藏鼠标指针
  if (hideCursor.value) {
    document.body.style.cursor = 'none'
    document.documentElement.style.cursor = 'none'
  }
  
  // 5. 禁止文本选择
  document.body.style.userSelect = 'none'
  document.body.style.webkitUserSelect = 'none'
  document.body.style.mozUserSelect = 'none'
  document.body.style.msUserSelect = 'none'
  
  // 6. 禁止触摸操作
  document.body.style.touchAction = 'none'
  document.body.style.webkitTouchCallout = 'none'
  
  console.log('极致隐藏完成，隐藏了', hiddenElements.length, '个元素')
}

// 恢复所有内容
const restoreEverything = () => {
  console.log('开始恢复内容...')
  
  // 1. 恢复隐藏的元素
  hiddenElements.forEach(({ element, display }) => {
    if (element && element.style) {
      element.style.display = display
    }
  })
  
  // 2. 恢复body和html样式
  document.body.style.cssText = originalBodyStyle
  document.documentElement.style.cssText = originalHtmlStyle
  
  // 3. 清空数组
  hiddenElements = []
  
  console.log('内容恢复完成')
}

// 进入全屏模式
const enterFullscreen = async () => {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen()
      console.log('进入全屏成功')
    } catch (err) {
      console.warn('全屏失败:', err)
      // 如果全屏失败，至少最大化窗口
      document.documentElement.style.width = '100vw'
      document.documentElement.style.height = '100vh'
    }
  }
}

// 激活黑屏
const activateBlackScreen = async () => {
  if (isActive.value) return
  
  console.log('激活极致黑屏...')
  isActive.value = true
  showTip.value = tipDuration.value !== '0'
  tipFading.value = false
  
  // 进入全屏
  await enterFullscreen()
  
  // 极致隐藏所有内容
  hideEverything()
  
  // 显示初始提示
  if (showTip.value) {
    setTimeout(() => {
      tipFading.value = true
      setTimeout(() => {
        showTip.value = false
        tipFading.value = false
      }, 1000)
    }, parseInt(tipDuration.value))
  }
  
  // 显示状态指示器
  showStatusIndicator.value = true
  setTimeout(() => {
    if (isActive.value) showStatusIndicator.value = false
  }, 5000)
  
  console.log('极致黑屏激活完成')
}

// 停用黑屏
const deactivate = () => {
  if (!isActive.value) return
  
  console.log('停用极致黑屏...')
  isActive.value = false
  showTip.value = false
  showExitHint.value = false
  tipFading.value = false
  
  // 恢复所有内容
  restoreEverything()
  
  // 退出全屏
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
  
  console.log('极致黑屏已停用')
}

// 处理屏幕点击
const handleScreenClick = (e) => {
  if (!showExitHint.value) {
    showExitHint.value = true
    setTimeout(() => {
      if (isActive.value) showExitHint.value = false
    }, 3000)
  } else {
    deactivate()
  }
}

// 键盘事件处理
const handleKeydown = (e) => {
  if (!isActive.value) return
  
  // ESC总是可以退出
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    deactivate()
    return
  }
  
  // 如果禁用按键，阻止其他所有按键
  if (disableKeys.value) {
    e.preventDefault()
    e.stopPropagation()
    
    // 允许一些必要的系统快捷键
    const allowedKeys = ['F11', 'F12', 'Control', 'Alt', 'Meta', 'Shift']
    if (!allowedKeys.includes(e.key)) {
      return false
    }
  }
  
  // F键显示退出提示
  if (e.key === 'f' || e.key === 'F') {
    e.preventDefault()
    showExitHint.value = true
    setTimeout(() => {
      if (isActive.value) showExitHint.value = false
    }, 3000)
  }
}

// 鼠标移动处理
let mouseMoveTimer = null
const handleMouseMove = () => {
  if (isActive.value) {
    showExitHint.value = true
    showStatusIndicator.value = true
    
    clearTimeout(mouseMoveTimer)
    mouseMoveTimer = setTimeout(() => {
      if (isActive.value) {
        showExitHint.value = false
        showStatusIndicator.value = false
      }
    }, 2000)
  }
}

// 防止右键菜单
const handleContextMenu = (e) => {
  if (isActive.value) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}

// 确保清理
const ensureCleanup = () => {
  if (isActive.value) {
    deactivate()
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  if (!document.fullscreenElement && isActive.value) {
    // 如果意外退出全屏，重新进入
    setTimeout(() => {
      if (isActive.value && !document.fullscreenElement) {
        enterFullscreen()
      }
    }, 100)
  }
}

// 初始化
onMounted(() => {
  document.addEventListener('keydown', handleKeydown, true)
  document.addEventListener('mousemove', handleMouseMove, true)
  document.addEventListener('contextmenu', handleContextMenu, true)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  window.addEventListener('beforeunload', ensureCleanup)
  window.addEventListener('pagehide', ensureCleanup)
})

// 清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown, true)
  document.removeEventListener('mousemove', handleMouseMove, true)
  document.removeEventListener('contextmenu', handleContextMenu, true)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  
  window.removeEventListener('beforeunload', ensureCleanup)
  window.removeEventListener('pagehide', ensureCleanup)
  
  ensureCleanup()
})
</script>

<style scoped>
.system-black-screen {
  position: relative;
  z-index: 1;
}

/* 控制面板样式 */
.control-panel {
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid var(--vp-c-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-bottom: 30px;
}

.description {
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 15px;
}

.warning {
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 10px;
  padding: 14px;
  margin: 24px 0;
  color: #ff8c00;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.settings {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 24px;
  margin: 28px 0;
  border: 1px solid var(--vp-c-border);
}

.setting-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  min-width: 100px;
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 14px;
}

.setting-item select {
  padding: 10px 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  min-width: 140px;
  font-size: 14px;
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  flex: 1;
}

.mode-option {
  padding: 12px;
  border: 2px solid var(--vp-c-border);
  border-radius: 10px;
  background: var(--vp-c-bg);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  font-weight: 500;
}

.mode-option:hover {
  border-color: var(--vp-c-brand-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mode-option.active {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand);
  color: white;
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(var(--vp-c-brand-rgb), 0.3);
}

.activation-options {
  display: flex;
  gap: 12px;
  flex: 1;
}

.activation-option {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--vp-c-border);
  border-radius: 10px;
  background: var(--vp-c-bg);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  font-weight: 500;
}

.activation-option:hover {
  border-color: var(--vp-c-brand-light);
  transform: translateY(-2px);
}

.activation-option.active {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand);
  color: white;
}

.setting-item input[type="checkbox"] {
  margin-right: 10px;
  width: 18px;
  height: 18px;
  accent-color: var(--vp-c-brand);
}

.actions {
  text-align: center;
  margin-top: 32px;
}

.activate-btn {
  padding: 18px 48px;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #2c3e50, #1a1a2e);
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.4s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.activate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1a1a2e, #000000);
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.activate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #555, #333);
}

.shortcut-hint {
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin: 15px 0 25px;
}

kbd {
  padding: 3px 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: var(--vp-c-text-1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quick-tips {
  background: rgba(var(--vp-c-brand-rgb), 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-top: 25px;
  text-align: left;
  border: 1px solid rgba(var(--vp-c-brand-rgb), 0.1);
}

.quick-tips h4 {
  margin: 0 0 12px 0;
  color: var(--vp-c-brand);
  font-size: 15px;
}

.quick-tips ul {
  margin: 0;
  padding-left: 20px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.quick-tips li {
  margin-bottom: 6px;
}

/* 黑屏容器 */
.black-screen-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 2147483647 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

/* 模式样式 */
.black-screen-container.deep-black {
  background-color: #000000 !important;
}

.black-screen-container.cinema {
  background-color: #0a0a0a !important;
}

.black-screen-container.focus {
  background-color: #001122 !important;
}

.black-screen-container.night {
  background-color: #0a0806 !important;
}

/* 激活动画 */
.black-screen-container.immediate {
  animation: immediate-appear 0.1s ease-out;
}

.black-screen-container.fade {
  animation: fade-in 1.5s ease-out;
}

@keyframes immediate-appear {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in {
  from { 
    opacity: 0;
    backdrop-filter: blur(20px);
  }
  to { 
    opacity: 1;
    backdrop-filter: blur(0);
  }
}

/* 初始提示 */
.initial-tip {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2147483648;
  backdrop-filter: blur(10px);
}

.initial-tip.fade-out {
  opacity: 0;
  transition: opacity 1s ease;
}

.tip-content {
  text-align: center;
  background: rgba(30, 30, 30, 0.9);
  border-radius: 20px;
  padding: 40px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: tip-pulse 2s infinite;
  max-width: 500px;
}

.tip-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: icon-float 3s ease-in-out infinite;
}

.tip-title {
  font-size: 28px;
  color: white;
  margin-bottom: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}

.tip-message {
  font-size: 18px;
  color: #ccc;
  margin-bottom: 10px;
  line-height: 1.5;
}

.tip-submessage {
  font-size: 14px;
  color: #888;
  margin-top: 15px;
}

@keyframes tip-pulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
  50% { 
    transform: scale(1.02);
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.7);
  }
}

@keyframes icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 退出提示 */
.exit-hint {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 2147483648;
}

.hint-text {
  display: inline-block;
  background: rgba(0, 0, 0, 0.7);
  color: rgba(255, 255, 255, 0.7);
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.hint-text:hover {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

/* 状态指示器 */
.status-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2147483648;
  transition: opacity 0.5s;
}

.status-indicator.status-hidden {
  opacity: 0;
  pointer-events: none;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  background: #4CAF50;
  border-radius: 50%;
  animation: indicator-pulse 2s infinite;
}

.indicator-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 500;
}

@keyframes indicator-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease !important;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0 !important;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s ease !important;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0 !important;
  transform: translateY(20px) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-panel {
    padding: 20px;
  }
  
  .mode-options {
    grid-template-columns: 1fr;
  }
  
  .activate-btn {
    padding: 16px 32px;
    font-size: 18px;
  }
  
  .tip-content {
    padding: 30px;
    margin: 0 20px;
  }
  
  .tip-title {
    font-size: 24px;
  }
  
  .tip-message {
    font-size: 16px;
  }
}
</style>