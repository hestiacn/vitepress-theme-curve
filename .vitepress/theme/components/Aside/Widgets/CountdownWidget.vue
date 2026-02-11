<!-- .vitepress\theme\components\Aside\Widgets\CountdownWidget.vue -->
<template>
  <div class="countdown-widget weidgets">
    
    <div class="today-info-simple">
      <div class="date-row">
        <span class="date-label">公历</span>
        <span class="date-value">{{ solarDate }}</span>
        <span class="weekday">{{ weekday }}</span>
      </div>
      <div v-if="lunarInfo" class="date-row lunar-row">
        <span class="date-label">农历</span>
        <span class="date-value">
          {{ lunarInfo.yearInGanZhi }}年 {{ lunarInfo.lunarMonthName }}{{ lunarInfo.lunarDayName }}
          <span class="zodiac-emoji">{{ getZodiacEmoji(lunarInfo.zodiac) }}</span>
        </span>
      </div>
    </div>
    
    <!-- 历史上的今天走马灯 -->
    <div v-if="historyEvents.length > 0" class="history-today">
      <div class="history-header">
        <i class="iconfont icon-history"></i>
        <span class="history-title">历史上的今天</span>
      </div>
      <div class="marquee-container">
        <div 
          class="marquee-content" 
          :style="{ 
            animationDuration: animationDuration,
            animationPlayState: animationPaused ? 'paused' : 'running' 
          }"
          @mouseenter="animationPaused = true"
          @mouseleave="animationPaused = false"
        >
          <span class="marquee-text">{{ marqueeText }}</span>
        </div>
      </div>
    </div>
    
    <!-- 节日倒计时标题 -->
    <div class="title">
      <i class="iconfont icon-date"></i>
      <span class="title-name">节日倒计时</span>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>正在获取节日数据...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <span class="error-icon">❌</span>
      <span>节日数据获取失败</span>
      <button @click="fetchAllData" class="retry-btn">重试</button>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="festivals.length === 0" class="empty">
      <span class="empty-icon">📅</span>
      <span>暂无即将到来的节日</span>
    </div>
    
    <!-- 节日列表 -->
    <div v-else class="countdown-list">
      <div v-for="festival in festivals" :key="festival.date" class="countdown-item">
        <div class="festival-info">
          <div class="festival-name">距离{{ festival.name }}</div>
          <div class="festival-meta">
            <span class="festival-date">{{ formatDate(festival.date) }}</span>
            <span v-if="festival.countryCode" class="festival-country">{{ festival.countryCode }}</span>
          </div>
        </div>
        <div class="countdown-days" :class="getDayClass(festival.days)">
          {{ getDayText(festival.days) }}
        </div>
      </div>
    </div>
    
    <!-- 数据来源 -->
    <div v-if="festivals.length > 0" class="data-source">
      <span>数据来源: Nager.Date & 历史API</span>
      <span class="update-time">更新于: {{ lastUpdate }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { format } from 'date-fns'

const festivals = ref([])
const loading = ref(true)
const error = ref(false)
const lastUpdate = ref('')
const historyEvents = ref([])
const animationPaused = ref(false)
const lunarInfo = ref(null)
const solarDate = ref('')
const weekday = ref('')

// 计算走马灯动画时长
const animationDuration = computed(() => {
  const textLength = marqueeText.value.length
  const duration = textLength * 0.5
  return `${Math.max(duration, 30)}s`
})

// 生成走马灯文本
const marqueeText = computed(() => {
  if (historyEvents.value.length === 0) return ''
  
  const events = historyEvents.value.map(event => {
    return `${event.year}年 ${event.title}`
  })
  
  return `📜 ${events.join('  •  ')}  •  `
})

// 解析历史事件数据
const parseHistoryEvents = (data) => {
  if (!Array.isArray(data)) return []
  
  return data.map(item => {
    const match = item.match(/^(\d{4})年(\d{2})月(\d{2})日\s+(.+)$/)
    if (match) {
      return {
        year: match[1],
        month: parseInt(match[2], 10),
        day: parseInt(match[3], 10),
        title: match[4]
      }
    }
    
    const yearMatch = item.match(/^(\d{4})年/)
    if (yearMatch) {
      const year = yearMatch[1]
      const title = item.replace(yearMatch[0], '').trim()
      return {
        year: year,
        title: title
      }
    }
    
    return null
  }).filter(item => item !== null)
}

// 获取农历信息
const fetchLunarInfo = async () => {
  try {
    console.log('正在获取农历信息...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch('https://api.530.news/api/lunar?date=today&timezone=8', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.code === 200 && data.data) {
      lunarInfo.value = data.data
      
      // 设置公历日期
      const solar = data.data.solar
      solarDate.value = `${solar.year}年${solar.month}月${solar.day}日`
      weekday.value = data.data.weekDay
      
      return true
    }
    
    throw new Error('农历API返回数据格式错误')
  } catch (err) {
    console.warn('农历信息获取失败:', err.message)
    
    // 使用本地日期作为后备
    const now = new Date()
    solarDate.value = format(now, 'yyyy年MM月dd日')
    weekday.value = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][now.getDay()]
    
    // 简单计算农历（作为后备）
    lunarInfo.value = {
      lunarMonthName: '未知',
      lunarDayName: '未知',
      zodiac: getZodiac(now.getFullYear()),
      yearInGanZhi: getGanzhi(now.getFullYear())
    }
    
    return false
  }
}

// 获取生肖Emoji
const getZodiacEmoji = (zodiac) => {
  const emojiMap = {
    '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
    '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐑',
    '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷'
  }
  return emojiMap[zodiac] || '🐉'
}

// 根据年份获取生肖（后备函数）
const getZodiac = (year) => {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
  const startYear = 1900
  const index = (year - startYear) % 12
  return zodiacs[index < 0 ? index + 12 : index]
}

// 根据年份获取干支（后备函数）
const getGanzhi = (year) => {
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  
  // 公元4年是甲子年
  const startYear = 4
  const stemIndex = (year - startYear) % 10
  const branchIndex = (year - startYear) % 12
  
  return heavenlyStems[stemIndex < 0 ? stemIndex + 10 : stemIndex] + 
         earthlyBranches[branchIndex < 0 ? branchIndex + 12 : branchIndex]
}

// 获取历史事件
const fetchHistoryEvents = async () => {
  try {
    console.log('正在获取历史事件...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch('https://v2.xxapi.cn/api/history', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.code === 200 && Array.isArray(data.data)) {
      const parsedEvents = parseHistoryEvents(data.data)
      historyEvents.value = parsedEvents.slice(0, 8)
      return true
    }
    
    throw new Error('历史事件API返回数据格式错误')
  } catch (err) {
    console.warn('历史事件获取失败:', err.message)
    historyEvents.value = []
    return false
  }
}

// 获取节假日数据
const fetchHolidays = async () => {
  try {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    
    console.log(`正在获取 ${currentYear}-${nextYear} 年节日数据...`)
    
    const [currentYearResponse, nextYearResponse] = await Promise.all([
      fetchHolidayData(currentYear),
      fetchHolidayData(nextYear)
    ])
    
    if (!currentYearResponse.success && !nextYearResponse.success) {
      throw new Error('两年数据获取均失败')
    }
    
    const allHolidays = [
      ...(currentYearResponse.data || []),
      ...(nextYearResponse.data || [])
    ]
    
    console.log(`共获取到 ${allHolidays.length} 个节日数据`)
    processHolidays(allHolidays)
    return true
  } catch (err) {
    console.error('节日数据获取失败:', err)
    festivals.value = []
    return false
  }
}

// 封装节假日API调用
const fetchHolidayData = async (year) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/CN`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      data: data.map(holiday => ({
        date: holiday.date,
        name: holiday.localName || holiday.name,
        countryCode: holiday.countryCode,
        fixed: holiday.fixed,
        global: holiday.global,
        types: holiday.types
      }))
    }
  } catch (err) {
    console.warn(`获取 ${year} 年节日数据失败:`, err.message)
    return {
      success: false,
      data: []
    }
  }
}

// 处理节假日数据
const processHolidays = (holidays) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 去重
  const uniqueHolidays = Array.from(
    new Map(holidays.map(item => [item.date, item])).values()
  )
  
  // 处理API返回的节日
  let festivalList = uniqueHolidays
    .map(holiday => {
      const targetDate = new Date(holiday.date)
      targetDate.setHours(0, 0, 0, 0)
      const timeDiff = targetDate.getTime() - today.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
      
      return {
        ...holiday,
        days: daysDiff,
        isToday: daysDiff === 0,
        isPast: daysDiff < 0,
        timestamp: targetDate.getTime()
      }
    })
    .filter(holiday => !holiday.isPast && holiday.days <= 180)
  
  // ----- 从春节推断除夕（春节前一天）-----
  // 找出列表中的春节
  const springFestivals = festivalList.filter(f => f.name.includes('春节') || f.name.includes('Spring'))
  
  springFestivals.forEach(spring => {
    // 春节前一天就是除夕
    const eveDate = new Date(spring.date)
    eveDate.setDate(eveDate.getDate() - 1)
    eveDate.setHours(0, 0, 0, 0)
    
    const daysDiff = Math.ceil((eveDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    // 确保除夕还没过，且没有重复添加
    if (daysDiff >= 0) {
      const exists = festivalList.some(f => 
        f.name === '除夕' && f.date === format(eveDate, 'yyyy-MM-dd')
      )
      
      if (!exists) {
        festivalList.push({
          date: format(eveDate, 'yyyy-MM-dd'),
          name: '除夕',
          countryCode: 'CN',
          days: daysDiff,
          isToday: daysDiff === 0,
          isPast: false,
          timestamp: eveDate.getTime()
        })
      }
    }
  })
  
  // 排序并限制数量
  festivals.value = festivalList
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 8)
}

// 获取天数显示的CSS类
const getDayClass = (days) => {
  if (days === 0) return 'today'
  if (days <= 3) return 'soon'
  if (days <= 7) return 'week'
  return 'future'
}

// 获取天数显示文本
const getDayText = (days) => {
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days === 2) return '后天'
  return `${days}天`
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return format(date, 'MM月dd日')
}

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  error.value = false
  
  try {
    const [lunarSuccess, historySuccess, holidaySuccess] = await Promise.all([
      fetchLunarInfo(),
      fetchHistoryEvents(),
      fetchHolidays()
    ])
    
    console.log('数据获取结果:', {
      lunar: lunarSuccess ? '成功' : '失败',
      history: historySuccess ? '成功' : '失败',
      holiday: holidaySuccess ? '成功' : '失败'
    })
    
    lastUpdate.value = format(new Date(), 'HH:mm:ss')
  } catch (err) {
    console.error('数据获取失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAllData()
  
  const intervalId = setInterval(() => {
    if (!loading.value) {
      fetchAllData()
    }
  }, 30 * 60 * 1000)
  
  onUnmounted(() => {
    clearInterval(intervalId)
  })
})
</script>

<style scoped>
.countdown-widget {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--vp-c-border);
  position: relative;
}

/* 今天的日期信息 - 简化版 */
.today-info-simple {
  background: linear-gradient(135deg, var(--vp-c-brand-soft), var(--vp-c-brand));
  color: white;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(var(--vp-c-brand-rgb), 0.2);
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 12px;
  padding: 6px 0;
}

.date-row.lunar-row {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 8px;
  padding-top: 12px;
}

.date-label {
  font-size: 14px;
  opacity: 0.9;
  min-width: 32px;
  text-align: right;
}

.date-value {
  font-weight: 500;
  letter-spacing: 0.5px;
  flex: 1;
  text-align: center;
}

.weekday {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  min-width: 44px;
  text-align: center;
}

.zodiac-emoji {
  margin-left: 8px;
  font-size: 16px;
}

/* 历史上的今天样式 */
.history-today {
  background: linear-gradient(135deg, rgba(var(--vp-c-brand-rgb), 0.05), rgba(var(--vp-c-brand-rgb), 0.1));
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(var(--vp-c-brand-rgb), 0.2);
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--vp-c-brand);
  font-weight: 600;
  font-size: 14px;
}

.history-header .iconfont {
  font-size: 16px;
}

.marquee-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  height: 28px;
  background: rgba(var(--vp-c-bg-rgb), 0.8);
  border-radius: 6px;
  padding: 4px 8px;
}

.marquee-content {
  display: inline-block;
  white-space: nowrap;
  padding-left: 100%;
  animation-name: marquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.marquee-text {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

/* 标题样式 */
.title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: var(--vp-c-text-1);
  font-size: 18px;
  font-weight: 600;
}

.title .iconfont {
  font-size: 20px;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--vp-c-border);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--vp-c-text-2);
}

.error-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

.retry-btn {
  margin-top: 12px;
  padding: 6px 16px;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s;
}

.retry-btn:hover {
  opacity: 0.9;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--vp-c-text-2);
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 12px;
}

/* 节日列表 */
.countdown-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.countdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--vp-c-bg);
  border-radius: 10px;
  border-left: 4px solid var(--vp-c-border);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.countdown-item:hover {
  transform: translateX(4px);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.festival-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.festival-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-size: 15px;
}

.festival-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.festival-date {
  color: var(--vp-c-text-2);
  opacity: 0.8;
}

.festival-country {
  background: var(--vp-c-border);
  color: var(--vp-c-text-2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

/* 倒计时天数 */
.countdown-days {
  font-weight: bold;
  font-size: 15px;
  padding: 6px 12px;
  border-radius: 20px;
  min-width: 60px;
  text-align: center;
  transition: all 0.3s;
}

.countdown-days.today {
  background: rgba(255, 77, 79, 0.15);
  color: #ff4d4f;
  animation: pulse 2s infinite;
}

.countdown-days.soon {
  background: rgba(255, 150, 50, 0.15);
  color: #ff9632;
}

.countdown-days.week {
  background: rgba(50, 200, 150, 0.15);
  color: #32c896;
}

.countdown-days.future {
  background: rgba(100, 150, 255, 0.15);
  color: #6496ff;
}

@keyframes pulse {
  0% { opacity: 0.9; }
  50% { opacity: 1; }
  100% { opacity: 0.9; }
}

/* 数据来源 */
.data-source {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-border);
  font-size: 12px;
  color: var(--vp-c-text-3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.update-time {
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .countdown-widget {
    padding: 16px;
  }
  
  .today-info-simple {
    padding: 14px;
  }
  
  .date-row {
    font-size: 14px;
    gap: 8px;
  }
  
  .date-label {
    min-width: 28px;
    font-size: 13px;
  }
  
  .weekday {
    font-size: 12px;
    min-width: 40px;
    padding: 3px 6px;
  }
  
  .countdown-item {
    padding: 12px;
  }
  
  .festival-name {
    font-size: 14px;
  }
  
  .countdown-days {
    font-size: 14px;
    padding: 5px 10px;
    min-width: 55px;
  }
  
  .history-today {
    padding: 12px;
  }
  
  .marquee-container {
    height: 26px;
  }
  
  .marquee-text {
    font-size: 12px;
    line-height: 18px;
  }
  
  .data-source {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .today-info-simple {
    background: linear-gradient(135deg, rgba(var(--vp-c-brand-rgb), 0.8), rgba(var(--vp-c-brand-rgb), 0.9));
  }
  
  .marquee-container {
    background: rgba(var(--vp-c-bg-rgb), 0.6);
  }
  
  .marquee-text {
    color: var(--vp-c-text-1);
  }
}
</style>