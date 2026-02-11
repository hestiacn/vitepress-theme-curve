<!-- .vitepress/theme/components/Tools/AquariumScreensaver.vue -->
<template>
  <div class="aquarium-screensaver">
    <!-- 控制面板 -->
    <div class="control-panel" :class="{ 'panel-hidden': isActive }">
      <h2>🐠 Emoji 水族馆屏保</h2>
      <p class="description">使用 Emoji 打造的梦幻水族馆，轻量无压力</p>
      
      <div class="settings-grid">
        <div class="setting-card">
          <div class="setting-icon">🐟</div>
          <h4>鱼类数量</h4>
          <div class="slider-container">
            <input 
              type="range" 
              v-model.number="settings.fishCount" 
              min="5" 
              max="50" 
              step="1"
              class="slider"
            >
            <span class="value">{{ settings.fishCount }} 条</span>
          </div>
        </div>

        <div class="setting-card">
          <div class="setting-icon">🎐</div>
          <h4>水母数量</h4>
          <div class="slider-container">
            <input 
              type="range" 
              v-model.number="settings.jellyfishCount" 
              min="0" 
              max="20" 
              step="1"
              class="slider"
            >
            <span class="value">{{ settings.jellyfishCount }} 只</span>
          </div>
        </div>

        <div class="setting-card">
          <div class="setting-icon">🐠</div>
          <h4>鱼群种类</h4>
          <div class="select-container">
            <select v-model="settings.fishStyle" class="select">
              <option value="mixed">混合鱼群 🐟🐠🐡</option>
              <option value="tropical">热带鱼 🐠🐟</option>
              <option value="cute">可爱鱼 🐡🐙</option>
              <option value="all">全部生物 🐟🐠🐡🐙🦑🦐🐬</option>
            </select>
          </div>
        </div>

        <div class="setting-card">
          <div class="setting-icon">🌊</div>
          <h4>海底场景</h4>
          <div class="select-container">
            <select v-model="settings.sceneStyle" class="select">
              <option value="reef">珊瑚礁 🪸</option>
              <option value="deep">深海 🌊</option>
              <option value="shipwreck">沉船 ⚓</option>
              <option value="cave">海底洞穴 🕳️</option>
            </select>
          </div>
        </div>

        <div class="setting-card">
          <div class="setting-icon">💨</div>
          <h4>气泡效果</h4>
          <div class="toggle-container">
            <label class="toggle">
              <input type="checkbox" v-model="settings.bubbles">
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">{{ settings.bubbles ? '开启' : '关闭' }}</span>
          </div>
        </div>

        <div class="setting-card">
          <div class="setting-icon">✨</div>
          <h4>闪烁效果</h4>
          <div class="toggle-container">
            <label class="toggle">
              <input type="checkbox" v-model="settings.twinkle">
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">{{ settings.twinkle ? '开启' : '关闭' }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button 
          class="btn primary-btn"
          @click="activateScreensaver"
          :disabled="isActive"
        >
          <span class="btn-icon">🐙</span>
          {{ isActive ? '水族馆运行中...' : '启动 Emoji 水族馆' }}
        </button>
        
        <div class="shortcut-hint">
          <span class="hint-icon">⌨️</span>
          <span>按 <kbd>ESC</kbd> 退出 | <kbd>空格</kbd> 暂停 | <kbd>F11</kbd> 全屏</span>
        </div>
      </div>
    </div>

    <!-- Emoji 水族馆容器 -->
    <div 
      v-if="isActive"
      class="aquarium-container"
      :class="{ 'fade-in': isActive }"
      @click="togglePause"
      @mousemove="handleMouseMove"
    >
      <!-- 海底背景 -->
      <div class="sea-background" :class="settings.sceneStyle">
        <!-- 动态光斑 -->
        <div v-for="i in 8" :key="i" class="light-spot" :style="getLightSpotStyle(i)"></div>
      </div>
      
      <!-- 海底植物 -->
      <div class="sea-floor">
        <div v-for="i in 15" :key="`plant-${i}`" class="seaweed" :style="getSeaweedStyle(i)"></div>
        <div v-for="i in 10" :key="`coral-${i}`" class="coral" :style="getCoralStyle(i)"></div>
      </div>
      
      <!-- Emoji 鱼群 -->
      <div 
        v-for="fish in fishes" 
        :key="fish.id"
        class="fish-emoji"
        :style="{
          left: fish.x + 'px',
          top: fish.y + 'px',
          transform: `scaleX(${fish.direction}) rotate(${fish.angle}deg)`,
          fontSize: fish.size + 'px',
          opacity: fish.opacity,
          filter: `drop-shadow(0 0 ${fish.glow}px rgba(0,200,255,0.3))`,
          animation: `swim ${fish.swimSpeed}s ease-in-out infinite`
        }"
      >
        {{ fish.emoji }}
      </div>
      
      <!-- 水母 -->
      <div 
        v-for="jelly in jellyfishes" 
        :key="jelly.id"
        class="jellyfish-emoji"
        :style="{
          left: jelly.x + 'px',
          top: jelly.y + 'px',
          fontSize: jelly.size + 'px',
          opacity: jelly.opacity,
          filter: `drop-shadow(0 0 ${jelly.glow}px rgba(255,200,255,0.5))`,
          animation: `float ${jelly.floatSpeed}s ease-in-out infinite`
        }"
      >
        🎐
      </div>
      
      <!-- 气泡 -->
      <div 
        v-for="bubble in bubbles" 
        :key="bubble.id"
        v-if="settings.bubbles"
        class="bubble"
        :style="{
          left: bubble.x + 'px',
          top: bubble.y + 'px',
          width: bubble.size + 'px',
          height: bubble.size + 'px',
          opacity: bubble.opacity,
          animation: `rise ${bubble.riseSpeed}s linear infinite`
        }"
      ></div>
      
      <!-- 闪烁星星 -->
      <div 
        v-for="star in stars" 
        :key="star.id"
        v-if="settings.twinkle"
        class="star"
        :style="{
          left: star.x + 'px',
          top: star.y + 'px',
          fontSize: star.size + 'px',
          opacity: star.opacity,
          animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite`
        }"
      >
        ✨
      </div>
      
      <!-- 暂停状态 -->
      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-emoji">⏸️</div>
        <div class="pause-text">已暂停</div>
        <div class="pause-hint">按空格键继续</div>
      </div>
      
      <!-- 退出提示 -->
      <div v-if="showExitHint" class="exit-hint">
        <div class="hint-content">
          <span class="hint-emoji">🐟</span>
          <span class="hint-text">按 ESC 退出水族馆</span>
          <span class="hint-emoji">🐠</span>
        </div>
      </div>
      
      <!-- 水族馆信息 -->
      <div class="aquarium-info">
        <div class="info-item">🐟 {{ fishes.length }}</div>
        <div class="info-item">🎐 {{ jellyfishes.length }}</div>
        <div class="info-item">💧 {{ bubbles.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// 状态
const isActive = ref(false)
const isPaused = ref(false)
const showExitHint = ref(false)

// 设置
const settings = reactive({
  fishCount: 20,
  jellyfishCount: 5,
  fishStyle: 'mixed',
  sceneStyle: 'reef',
  bubbles: true,
  twinkle: true
})

// 数据
const fishes = ref([])
const jellyfishes = ref([])
const bubbles = ref([])
const stars = ref([])

// Emoji 鱼库
const fishEmojis = {
  tropical: ['🐠', '🐟', '🐡', '🐠', '🐟'],
  cute: ['🐡', '🐙', '🦑', '🐚', '🐠'],
  all: ['🐟', '🐠', '🐡', '🐙', '🦑', '🦐', '🐬', '🐳', '🐋', '🦀'],
  mixed: ['🐠', '🐟', '🐡', '🐙', '🦑']
}

// 激活屏保
const activateScreensaver = async () => {
  isActive.value = true
  isPaused.value = false
  
  // 全屏
  await enterFullscreen()
  
  // 初始化
  initAquarium()
  
  // 动画循环
  animate()
}

// 进入全屏
const enterFullscreen = async () => {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen()
    } catch (e) {}
  }
}

// 退出全屏
const exitFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
}

// 初始化水族馆
const initAquarium = () => {
  initFishes()
  initJellyfishes()
  initBubbles()
  initStars()
}

// 初始化鱼类
const initFishes = () => {
  const emojiList = fishEmojis[settings.fishStyle] || fishEmojis.mixed
  const list = []
  
  for (let i = 0; i < settings.fishCount; i++) {
    list.push({
      id: Math.random(),
      emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.7,
      size: Math.random() * 30 + 30,
      speedX: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1),
      speedY: (Math.random() * 1 - 0.5) * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
      angle: 0,
      swimSpeed: Math.random() * 3 + 2,
      opacity: Math.random() * 0.3 + 0.7,
      glow: Math.random() * 5
    })
  }
  
  fishes.value = list
}

// 初始化水母
const initJellyfishes = () => {
  const list = []
  
  for (let i = 0; i < settings.jellyfishCount; i++) {
    list.push({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.8,
      size: Math.random() * 25 + 35,
      speed: Math.random() * 0.3 + 0.2,
      floatSpeed: Math.random() * 4 + 3,
      opacity: Math.random() * 0.3 + 0.5,
      glow: Math.random() * 10 + 5,
      direction: Math.random() > 0.5 ? 1 : -1
    })
  }
  
  jellyfishes.value = list
}

// 初始化气泡
const initBubbles = () => {
  const list = []
  
  for (let i = 0; i < 40; i++) {
    list.push({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 15 + 5,
      opacity: Math.random() * 0.3 + 0.2,
      riseSpeed: Math.random() * 8 + 5
    })
  }
  
  bubbles.value = list
}

// 初始化星星
const initStars = () => {
  const list = []
  
  for (let i = 0; i < 30; i++) {
    list.push({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.3,
      size: Math.random() * 15 + 15,
      opacity: Math.random() * 0.3 + 0.2,
      twinkleSpeed: Math.random() * 2 + 1
    })
  }
  
  stars.value = list
}

// 动画循环
const animate = () => {
  if (!isActive.value || isPaused.value) {
    requestAnimationFrame(animate)
    return
  }
  
  // 移动鱼
  fishes.value.forEach(fish => {
    fish.x += fish.speedX * 0.5
    fish.y += fish.speedY
    
    // 边界检测
    if (fish.x < -50) fish.x = window.innerWidth + 50
    if (fish.x > window.innerWidth + 50) fish.x = -50
    if (fish.y < 50) fish.y = 50
    if (fish.y > window.innerHeight * 0.7) fish.y = window.innerHeight * 0.7
    
    // 方向
    fish.direction = fish.speedX > 0 ? 1 : -1
    fish.angle = fish.speedY * 2
  })
  
  // 移动水母
  jellyfishes.value.forEach(jelly => {
    jelly.y -= jelly.speed * 0.3
    jelly.x += Math.sin(Date.now() * 0.001) * 0.2
    
    if (jelly.y < 50) jelly.y = window.innerHeight - 100
  })
  
  // 移动气泡
  bubbles.value.forEach(bubble => {
    bubble.y -= 0.5
    
    if (bubble.y < -20) {
      bubble.y = window.innerHeight + 20
      bubble.x = Math.random() * window.innerWidth
    }
  })
  
  requestAnimationFrame(animate)
}

// 获取光斑样式
const getLightSpotStyle = (i) => {
  return {
    left: `${Math.sin(Date.now() * 0.001 + i) * 20 + 10 + i * 12}%`,
    top: `${Math.cos(Date.now() * 0.001 + i) * 10 + 20}%`,
    width: `${Math.sin(Date.now() * 0.002 + i) * 50 + 100}px`,
    height: `${Math.cos(Date.now() * 0.002 + i) * 30 + 60}px`,
    opacity: Math.sin(Date.now() * 0.001 + i) * 0.1 + 0.2
  }
}

// 获取海草样式
const getSeaweedStyle = (i) => {
  return {
    left: `${i * 7}%`,
    height: `${Math.sin(i) * 30 + 70}px`,
    animationDelay: `${i * 0.2}s`
  }
}

// 获取珊瑚样式
const getCoralStyle = (i) => {
  return {
    left: `${i * 10 + Math.random() * 5}%`,
    bottom: '0',
    fontSize: `${Math.random() * 20 + 30}px`,
    transform: `scaleX(${Math.random() > 0.5 ? 1 : -1})`
  }
}

// 切换暂停
const togglePause = () => {
  isPaused.value = !isPaused.value
}

// 鼠标移动
const handleMouseMove = () => {
  showExitHint.value = true
  clearTimeout(window.mouseTimer)
  window.mouseTimer = setTimeout(() => {
    showExitHint.value = false
  }, 2000)
}

// 键盘事件
const handleKeydown = (e) => {
  if (!isActive.value) return
  
  switch(e.key) {
    case 'Escape':
      e.preventDefault()
      deactivateScreensaver()
      break
    case ' ':
      e.preventDefault()
      togglePause()
      break
  }
}

// 停用屏保
const deactivateScreensaver = () => {
  isActive.value = false
  isPaused.value = false
  showExitHint.value = false
  exitFullscreen()
}

// 窗口大小改变
const handleResize = () => {
  if (isActive.value) {
    initAquarium()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  deactivateScreensaver()
})
</script>

<style scoped>
.aquarium-screensaver {
  position: relative;
  min-height: 600px;
}

/* 控制面板样式 */
.control-panel {
  background: linear-gradient(135deg, #0b3d5f, #0a4b6e);
  border-radius: 24px;
  padding: 32px;
  color: white;
  transition: opacity 0.5s;
}

.control-panel.panel-hidden {
  opacity: 0;
  pointer-events: none;
}

/* 设置网格 */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.setting-card {
  background: rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

/* 滑块 */
.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 15px #00c8ff;
}

/* 开关 */
.toggle {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.2);
  transition: 0.3s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background: #4CAF50;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* 按钮 */
.primary-btn {
  background: linear-gradient(135deg, #00b4db, #0083b0);
  border: none;
  border-radius: 50px;
  padding: 16px 40px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0,180,219,0.3);
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0,180,219,0.5);
}

/* 水族馆容器 */
.aquarium-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  overflow: hidden;
  background: #031525;
}

/* 海底背景 */
.sea-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.sea-background.reef {
  background: linear-gradient(to bottom, #0a4b6e, #1e6f5c);
}

.sea-background.deep {
  background: linear-gradient(to bottom, #031525, #0a2a44);
}

.sea-background.shipwreck {
  background: linear-gradient(to bottom, #1e3d4a, #4a3c31);
}

.sea-background.cave {
  background: linear-gradient(to bottom, #1a2634, #2c3e50);
}

/* 光斑 */
.light-spot {
  position: absolute;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  filter: blur(30px);
  animation: wave 8s ease-in-out infinite;
}

/* 海底 */
.sea-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(to top, #8b7355, #5d4a36);
  box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
}

/* 海草 */
.seaweed {
  position: absolute;
  bottom: 0;
  width: 8px;
  background: linear-gradient(to top, #2e7d5e, #4caf7a);
  border-radius: 4px;
  animation: sway 4s ease-in-out infinite;
  transform-origin: bottom;
}

/* 珊瑚 */
.coral {
  position: absolute;
  bottom: 0;
  animation: sway 6s ease-in-out infinite;
  transform-origin: bottom;
}

/* Emoji 鱼 */
.fish-emoji {
  position: absolute;
  user-select: none;
  pointer-events: none;
  text-shadow: 0 0 10px rgba(0,200,255,0.3);
  animation: swim 3s ease-in-out infinite;
  filter: drop-shadow(0 0 5px rgba(0,150,255,0.2));
  z-index: 100;
}

/* 水母 */
.jellyfish-emoji {
  position: absolute;
  user-select: none;
  pointer-events: none;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255,200,255,0.5));
  z-index: 90;
}

/* 气泡 */
.bubble {
  position: absolute;
  background: radial-gradient(circle at 30% 30%, white, rgba(255,255,255,0.3));
  border-radius: 50%;
  pointer-events: none;
  animation: rise 6s linear infinite;
  box-shadow: 0 0 10px rgba(255,255,255,0.3);
}

/* 星星 */
.star {
  position: absolute;
  user-select: none;
  pointer-events: none;
  animation: twinkle 3s ease-in-out infinite;
  filter: drop-shadow(0 0 5px rgba(255,255,200,0.5));
}

/* 暂停遮罩 */
.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  z-index: 10000;
}

.pause-emoji {
  font-size: 80px;
  animation: pulse 2s infinite;
  margin-bottom: 20px;
}

.pause-text {
  font-size: 36px;
  color: white;
  margin-bottom: 12px;
}

/* 退出提示 */
.exit-hint {
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 10001;
  animation: slideUp 0.3s;
}

.hint-content {
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
  border-radius: 40px;
  padding: 12px 30px;
  display: flex;
  gap: 15px;
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
}

/* 水族馆信息 */
.aquarium-info {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(5px);
  border-radius: 30px;
  padding: 12px 24px;
  display: flex;
  gap: 20px;
  color: white;
  font-size: 18px;
  z-index: 1000;
  border: 1px solid rgba(255,255,255,0.1);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 动画 */
@keyframes swim {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(2deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes rise {
  from { transform: translateY(0); opacity: 0.6; }
  to { transform: translateY(-100vh); opacity: 0; }
}

@keyframes sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes wave {
  0%, 100% { transform: translateX(-20px); }
  50% { transform: translateX(20px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .primary-btn {
    padding: 14px 30px;
    font-size: 16px;
  }
  
  .pause-emoji {
    font-size: 60px;
  }
  
  .pause-text {
    font-size: 28px;
  }
  
  .aquarium-info {
    font-size: 14px;
    padding: 8px 16px;
  }
}
</style>