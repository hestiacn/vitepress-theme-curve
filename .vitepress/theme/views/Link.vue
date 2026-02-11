<!-- .vitepress/theme/views/Link.vue -->
<template>
  <div class="link">
    <!-- 顶图 -->
    <Banner type="page" title="友情链接" desc="与各位博主无限进步">
      <template v-slot:header-slot>
        <div class="menu">
          <div class="menu-item random" @click="randomJump">
            <i class="iconfont icon-shuffle" />
            <span class="name">随机访问</span>
          </div>
          <div class="menu-item refresh" @click="refreshLinks">
            <i class="iconfont icon-refresh" :class="{ rotating: isRefreshing }" />
            <span class="name">刷新列表</span>
          </div>
          <div class="menu-item add" @click="smoothScrolling('#友情链接申请')">
            <i class="iconfont icon-right-round" />
            <span class="name">申请友链</span>
          </div>
        </div>
      </template>
      
      <!-- 友链徽章展示区 -->
      <div class="link-badges">
        <div class="badge-group">
          <span class="badge total">
            <i class="iconfont icon-link"></i>
            {{ totalLinks }} 个友链
          </span>
          <span class="badge visited">
            <i class="iconfont icon-eye"></i>
            {{ visitedCount }} 次访问
          </span>
          <span class="badge random-badge" @click="randomJump">
            <i class="iconfont icon-shuffle"></i>
            随机前往
          </span>
        </div>
      </div>
    </Banner>

    <!-- 友链分类导航 -->
    <div class="link-categories" v-if="linkData.length > 0">
      <div class="categories-wrapper">
        <span 
          v-for="(category, index) in linkData" 
          :key="index"
          :class="['category-tag', { active: activeCategory === index }]"
          @click="activeCategory = index"
        >
          <i :class="getCategoryIcon(category.title)"></i>
          {{ category.title }}
          <span class="category-count">{{ category.typeList.length }}</span>
        </span>
      </div>
    </div>

    <!-- 友链数据展示 -->
    <div class="link-sections">
      <TransitionGroup name="fade">
        <LinkList 
          v-if="linkData.length > 0"
          :key="activeCategory"
          :listData="[linkData[activeCategory]]" 
          :useFriendsLink="true"
          @visit="handleLinkVisit"
        />
      </TransitionGroup>
    </div>

    <!-- 友链申请区 -->
    <div id="友情链接申请" class="link-apply-section">
      <div class="apply-header">
        <h2 class="apply-title">
          <i class="iconfont icon-edit"></i>
          友情链接申请
        </h2>
        <p class="apply-desc">欢迎交换友链，请按照以下格式申请</p>
      </div>

      <div class="apply-content">
        <!-- 申请要求卡片 -->
        <div class="apply-rules">
          <div class="rule-card">
            <div class="rule-icon">📝</div>
            <h4>申请格式</h4>
            <ul>
              <li><strong>站点名称：</strong>你的博客名称</li>
              <li><strong>站点地址：</strong>https://yourblog.com</li>
              <li><strong>站点图标：</strong>https://yourblog.com/logo.png</li>
              <li><strong>站点描述：</strong>一句话介绍你的博客</li>
            </ul>
          </div>
          <div class="rule-card">
            <div class="rule-icon">✅</div>
            <h4>申请要求</h4>
            <ul>
              <li><i class="iconfont icon-check"></i> 已添加本站友链</li>
              <li><i class="iconfont icon-check"></i> 站点内容积极向上</li>
              <li><i class="iconfont icon-check"></i> 持续更新3个月以上</li>
              <li><i class="iconfont icon-check"></i> 非商业、非采集站</li>
            </ul>
          </div>
          <div class="rule-card">
            <div class="rule-icon">📮</div>
            <h4>联系方式</h4>
            <ul>
            <li>
              <i class="iconfont icon-email"></i> 
              Email: 
              <a href="mailto:hestiacn@tuta.io" class="contact-link">hestiacn@tuta.io</a>
            </li>
            <li>
              <i class="iconfont icon-github"></i> 
              GitHub: 
              <a href="https://github.com/hestiacn" class="contact-link" target="_blank">hestiacn</a>
            </li>
            <li @click="randomFunMessage">
              <i class="iconfont icon-message"></i>
              <span class="interactive-main">{{ currentFunText }}</span>
              <span class="interactive-badge" v-if="funCount > 0">✨ {{ funCount }}</span>
              <div class="interactive-bubble" v-if="showBubble">
                {{ randomBubbleText }}
              </div>
            </li>
            </ul>
          </div>
        </div>

        <!-- 友链状态卡片 -->
        <div class="link-status">
          <div class="status-header">
            <span class="status-label">本站信息</span>
            <span class="status-badge">已部署</span>
          </div>
          <div class="status-content">
            <div class="site-info">
              <img src="/images/logo/logo.webp" alt="本站" class="site-avatar">
              <div class="site-details">
                <h4>{{ siteInfo.name }}</h4>
                <p class="site-desc">{{ siteInfo.desc }}</p>
                <a :href="siteInfo.url" target="_blank" class="site-url">
                  {{ siteInfo.url }}
                  <i class="iconfont icon-link"></i>
                </a>
              </div>
            </div>
            <div class="status-stats">
              <div class="stat-item">
                <span class="stat-value">{{ uptime }}</span>
                <span class="stat-label">运行天数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ totalVisits }}</span>
                <span class="stat-label">友链访问</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ pendingCount }}</span>
                <span class="stat-label">待审友链</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 申请按钮 -->
        <div class="apply-actions">
          <a href="mailto:one@imsyy.top?subject=友情链接申请&body=站点名称：%0D%0A站点地址：%0D%0A站点图标：%0D%0A站点描述：%0D%0A已添加本站：是" 
             class="apply-btn primary">
            <i class="iconfont icon-email"></i>
            邮件申请
          </a>
          <a href="https://github.com/imsyy/imsyy.github.io/issues/new?template=link-request.yml" 
             target="_blank"
             class="apply-btn secondary">
            <i class="iconfont icon-github"></i>
            GitHub申请
          </a>
          <button class="apply-btn copy-btn" @click="copyTemplate">
            <i class="iconfont icon-copy"></i>
            复制模板
          </button>
        </div>
      </div>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { smoothScrolling } from "@/utils/helper"
import linkData from "@/assets/linkData.js"
import { useLocalStorage } from '@vueuse/core'

// 有趣的互动文本库
const funMessages = [
  { emoji: '🎮', text: '来陪博主打游戏', action: '🎯 请求组队' },
  { emoji: '☕', text: '请博主喝奶茶', action: '🧋 点单中...' },
  { emoji: '🐟', text: '给博主投喂小鱼干', action: '🐠 投喂成功！' },
  { emoji: '🎵', text: '分享一首歌给博主', action: '🎧 正在播放' },
  { emoji: '📸', text: '给博主发张照片', action: '📱 快门咔嚓' },
  { emoji: '🎨', text: '给博主画个头像', action: '🖌️ 灵魂画手上线' },
  { emoji: '📚', text: '推荐一本好书', action: '📖 已加入书单' },
  { emoji: '🎂', text: '祝博主生日快乐', action: '🎉 收到祝福！' },
  { emoji: '💡', text: '给博主提个建议', action: '✨ 灵感+1' },
  { emoji: '🔮', text: '给博主占卜运势', action: '🌟 今日运势：大吉' },
  { emoji: '🎪', text: '邀请博主去露营', action: '🏕️ 收拾行囊中' },
  { emoji: '🎭', text: '给博主讲个笑话', action: '😂 笑出鱼尾纹' },
]

// 随机彩蛋文本
const bubbleMessages = [
  '👀 抓到一只野生博主',
  '🦑 博主正在摸鱼',
  '💤 博主睡着了 zZ',
  '⚡ 博主秒回了！',
  '🎣 钓到博主啦',
  '🏃 博主跑走了',
  '📨 消息飞鸽传书中',
  '🎲 掷出了6点，触发彩蛋',
  '🌟 恭喜！获得博主回复+1',
  '🎁 打开盲盒：博主表情包一张',
  '🍵 博主正在喝茶',
  '💻 博主正在写 bug',
  '🐞 博主正在修 bug',
  '☕ 咖啡续命中...'
]

const currentFunText = ref('📬 戳一戳博主')
const showBubble = ref(false)
const randomBubbleText = ref('')
const funCount = ref(0)

// 随机有趣互动
const randomFunMessage = () => {
  funCount.value++
  
  // 随机选择一条消息
  const randomIndex = Math.floor(Math.random() * funMessages.length)
  const message = funMessages[randomIndex]
  
  // 更新显示文本
  currentFunText.value = `${message.emoji} ${message.text}`
  
  // 显示气泡彩蛋
  randomBubbleText.value = bubbleMessages[Math.floor(Math.random() * bubbleMessages.length)]
  showBubble.value = true
  
  // 根据不同互动显示不同反馈
  switch(message.emoji) {
    case '🐟':
      $message?.success('🐠 小鱼干 +1，博主很开心！')
      break
    case '☕':
      $message?.info('🧋 奶茶甜度刚好，谢谢~')
      break
    case '🎮':
      $message?.warning('🎯 游戏邀请已发送，5分钟后开黑')
      break
    case '🎵':
      $message?.success('🎧 已加入歌单，正在播放')
      break
    default:
      $message?.success(`${message.action} ✨`)
  }
  
  // 3秒后恢复默认文本
  setTimeout(() => {
    if (funCount.value % 3 === 0) {
      // 每3次换一个趣味默认文本
      const defaultTexts = [
        '📬 戳一戳博主',
        '🖱️ 点我有惊喜',
        '🎯 来互动呀',
        '✨ 试试手气',
        '🎪 发现彩蛋'
      ]
      currentFunText.value = defaultTexts[funCount.value % defaultTexts.length]
    } else {
      currentFunText.value = '📬 戳一戳博主'
    }
    showBubble.value = false
  }, 2000)
}
// 状态管理
const activeCategory = ref(0)
const isRefreshing = ref(false)
const visitedCount = useLocalStorage('link-visited-count', 0)
const visitedLinks = useLocalStorage('link-visited-links', [])
const pendingCount = ref(3) // 模拟待审友链数量

// 站点信息
const siteInfo = {
  name: "宇宙中的尘埃",
  desc: "专注于前端开发与用户体验",
  url: "https://blog.imsyy.top"
}

// 计算属性
const totalLinks = computed(() => {
  return linkData.reduce((total, category) => {
    return total + (category.typeList?.length || 0)
  }, 0)
})

const totalVisits = computed(() => visitedCount.value)

const uptime = computed(() => {
  const startDate = new Date('2024-01-01')
  const today = new Date()
  const diffTime = Math.abs(today - startDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// 全部友链
const allLinkData = computed(() => {
  return linkData.flatMap((item) => item.typeList || [])
})

// 获取分类图标
const getCategoryIcon = (title) => {
  const iconMap = {
    '友情链接': 'icon-link',
    '推荐站点': 'icon-star',
    '个人博客': 'icon-blog',
    '技术社区': 'icon-community',
    '设计灵感': 'icon-design',
    '工具资源': 'icon-tools'
  }
  return `iconfont ${iconMap[title] || 'icon-link'}`
}

// 随机跳转
const randomJump = () => {
  try {
    const friendList = allLinkData.value
    if (friendList.length === 0) {
      $message?.error('暂无友链数据')
      return
    }
    
    const randomItem = friendList[Math.floor(Math.random() * friendList.length)]
    
    $message?.warning(
      `您即将前往 ${randomItem?.name || '未知站点'}，请注意链接是否安全`,
      {
        close: true,
        duration: 3000,
        showConfirm: true,
        confirmText: '立即前往',
        cancelText: '取消'
      },
      () => {
        if (randomItem?.url) {
          window.open(randomItem.url, '_blank')
          visitedCount.value++
          visitedLinks.value.push({
            name: randomItem.name,
            url: randomItem.url,
            time: new Date().toLocaleString()
          })
        }
      }
    )
  } catch (error) {
    console.error("友链随机访问时出错：", error)
    $message?.error("友链随机访问时出错，请重试")
  }
}

// 刷新友链
const refreshLinks = async () => {
  isRefreshing.value = true
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800))
    $message?.success('友链列表已刷新')
  } catch (error) {
    $message?.error('刷新失败，请重试')
  } finally {
    isRefreshing.value = false
  }
}

// 处理友链访问
const handleLinkVisit = (link) => {
  visitedCount.value++
  visitedLinks.value.push({
    name: link.name,
    url: link.url,
    time: new Date().toLocaleString()
  })
}

// 复制申请模板
const copyTemplate = async () => {
  const template = `站点名称：\n站点地址：\n站点图标：\n站点描述：\n已添加本站：是`
  
  try {
    await navigator.clipboard.writeText(template)
    $message?.success('申请模板已复制到剪贴板')
  } catch (err) {
    $message?.error('复制失败，请手动复制')
  }
}

// 初始化
onMounted(() => {
  // 检查是否有hash锚点
  if (window.location.hash === '#友情链接申请') {
    setTimeout(() => {
      smoothScrolling('#友情链接申请')
    }, 300)
  }
})

// 监听分类变化
watch(activeCategory, () => {
  $message?.info(`已切换到 ${linkData[activeCategory.value]?.title || '友链'} 分类`)
})
</script>

<style lang="scss" scoped>

/* 互动条目样式 */
.interactive-item {
  position: relative;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30"><circle cx="12" cy="12" r="10" fill="%23ff6b6b" opacity="0.8"/><text x="12" y="18" font-size="14" text-anchor="middle" fill="white">🐟</text></svg>') 12 12, auto !important;
  padding: 8px 12px !important;
  border-radius: 30px !important;
  background: linear-gradient(120deg, rgba(255,215,0,0.1), rgba(255,182,193,0.1)) !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  margin: 8px 0 !important;
  border: 1px solid rgba(255,215,0,0.3) !important;
}

.interactive-item:hover {
  background: linear-gradient(120deg, rgba(255,215,0,0.2), rgba(255,182,193,0.2)) !important;
  transform: scale(1.02) translateX(5px);
  border-color: #ffd700 !important;
  box-shadow: 0 4px 15px rgba(255,215,0,0.2);
}

.interactive-main {
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-left: 8px;
  transition: all 0.3s;
}

.interactive-item:hover .interactive-main {
  color: #ff6b6b;
}

.interactive-badge {
  display: inline-block;
  margin-left: 10px;
  padding: 2px 8px;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  animation: bounce 1s infinite;
}

/* 气泡彩蛋 */
.interactive-bubble {
  position: absolute;
  top: -30px;
  right: -20px;
  background: white;
  color: #333;
  padding: 8px 16px;
  border-radius: 20px 20px 20px 4px;
  font-size: 13px;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid #ffd700;
  z-index: 10;
}

.interactive-bubble::before {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 10px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .interactive-bubble {
    white-space: normal;
    right: -10px;
    font-size: 12px;
    padding: 6px 12px;
  }
}

.link {
  margin-bottom: 4rem;
  
  .banner-page {
    min-height: auto;
    position: relative;
    
    .menu {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: flex-start;
      margin-bottom: auto;
      gap: 16px;
      
      .menu-item {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 46px;
        padding: 12px 18px;
        border-radius: 8px;
        background-color: var(--main-card-second-background);
        border: 1px solid var(--main-card-border);
        box-shadow: 0 8px 16px -4px var(--main-border-shadow);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        
        .iconfont {
          font-size: 18px;
          margin-right: 8px;
          transition: all 0.3s;
        }
        
        &.random {
          color: var(--main-color);
          .iconfont {
            color: var(--main-color);
          }
        }
        
        &.refresh {
          color: #4CAF50;
          .iconfont {
            color: #4CAF50;
          }
          .rotating {
            animation: rotate 1s linear infinite;
          }
        }
        
        &.add {
          color: var(--main-card-second-background);
          background-color: var(--main-font-color);
          
          .iconfont {
            font-size: 22px;
            margin-right: 6px;
            color: var(--main-card-second-background);
          }
        }
        
        &:hover {
          color: #fff;
          background-color: var(--main-color);
          box-shadow: 0 8px 20px -4px var(--main-color-bg);
          transform: translateY(-2px);
          
          .iconfont {
            color: #fff;
          }
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
    
    .link-badges {
      margin-top: 30px;
      
      .badge-group {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          font-size: 14px;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
          
          .iconfont {
            margin-right: 6px;
            font-size: 16px;
          }
          
          &.total {
            background: rgba(66, 184, 131, 0.2);
            border-color: rgba(66, 184, 131, 0.3);
          }
          
          &.visited {
            background: rgba(64, 158, 255, 0.2);
            border-color: rgba(64, 158, 255, 0.3);
          }
          
          &.random-badge {
            cursor: pointer;
            
            &:hover {
              background: var(--main-color);
              border-color: var(--main-color);
              transform: scale(1.05);
            }
          }
        }
      }
    }
  }
  
  /* 友链分类导航 */
  .link-categories {
    margin: 30px 0 20px;
    padding: 0 20px;
    
    .categories-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      
      .category-tag {
        display: inline-flex;
        align-items: center;
        padding: 8px 18px;
        background: var(--vp-c-bg-soft);
        border: 1px solid var(--vp-c-border);
        border-radius: 30px;
        font-size: 14px;
        color: var(--vp-c-text-1);
        cursor: pointer;
        transition: all 0.3s;
        
        .iconfont {
          margin-right: 6px;
          font-size: 16px;
        }
        
        .category-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          margin-left: 8px;
          padding: 0 6px;
          background: var(--vp-c-border);
          border-radius: 11px;
          font-size: 12px;
        }
        
        &:hover {
          background: var(--vp-c-brand-light);
          color: white;
          border-color: var(--vp-c-brand-light);
          
          .category-count {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }
        }
        
        &.active {
          background: var(--vp-c-brand);
          color: white;
          border-color: var(--vp-c-brand);
          font-weight: 500;
          
          .category-count {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }
        }
      }
    }
  }
  
  /* 友链申请区 */
  .link-apply-section {
    margin-top: 60px;
    padding: 40px;
    background: var(--vp-c-bg-soft);
    border-radius: 24px;
    border: 1px solid var(--vp-c-border);
    
    .apply-header {
      text-align: center;
      margin-bottom: 40px;
      
      .apply-title {
        font-size: 28px;
        font-weight: 600;
        color: var(--vp-c-text-1);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        
        .iconfont {
          font-size: 32px;
          color: var(--vp-c-brand);
        }
      }
      
      .apply-desc {
        color: var(--vp-c-text-2);
        font-size: 16px;
      }
    }
    
    .apply-content {
      max-width: 1200px;
      margin: 0 auto;
      
      .apply-rules {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 40px;
        
        .rule-card {
          background: var(--vp-c-bg);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          border: 1px solid var(--vp-c-border);
          transition: all 0.3s;
          
          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
            border-color: var(--vp-c-brand);
          }
          
          .rule-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          
          h4 {
            font-size: 18px;
            font-weight: 600;
            color: var(--vp-c-text-1);
            margin-bottom: 16px;
          }
          
          ul {
            text-align: left;
            list-style: none;
            padding: 0;
            
            li {
              color: var(--vp-c-text-2);
              margin-bottom: 10px;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 8px;
              
              .iconfont {
                color: var(--vp-c-brand);
                font-size: 16px;
              }
              
              strong {
                color: var(--vp-c-text-1);
                min-width: 80px;
              }
            }
          }
        }
      }
      
      .link-status {
        background: var(--vp-c-bg);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 30px;
        border: 1px solid var(--vp-c-border);
        
        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          
          .status-label {
            font-size: 16px;
            font-weight: 600;
            color: var(--vp-c-text-1);
          }
          
          .status-badge {
            padding: 4px 12px;
            background: var(--vp-c-brand);
            color: white;
            border-radius: 20px;
            font-size: 12px;
          }
        }
        
        .status-content {
          display: flex;
          align-items: center;
          gap: 30px;
          
          .site-info {
            display: flex;
            align-items: center;
            gap: 20px;
            flex: 1;
            
            .site-avatar {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              border: 2px solid var(--vp-c-border);
            }
            
            .site-details {
              h4 {
                font-size: 18px;
                font-weight: 600;
                color: var(--vp-c-text-1);
                margin-bottom: 6px;
              }
              
              .site-desc {
                color: var(--vp-c-text-2);
                font-size: 14px;
                margin-bottom: 6px;
              }
              
              .site-url {
                color: var(--vp-c-brand);
                font-size: 13px;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                
                &:hover {
                  text-decoration: underline;
                }
              }
            }
          }
          
          .status-stats {
            display: flex;
            gap: 30px;
            
            .stat-item {
              text-align: center;
              
              .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: var(--vp-c-text-1);
                display: block;
                margin-bottom: 4px;
              }
              
              .stat-label {
                font-size: 12px;
                color: var(--vp-c-text-2);
              }
            }
          }
        }
      }
      
      .apply-actions {
        display: flex;
        justify-content: center;
        gap: 20px;
        
        .apply-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 32px;
          border-radius: 40px;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          
          .iconfont {
            font-size: 18px;
          }
          
          &.primary {
            background: var(--vp-c-brand);
            color: white;
            
            &:hover {
              background: var(--vp-c-brand-dark);
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(var(--vp-c-brand-rgb), 0.3);
            }
          }
          
          &.secondary {
            background: #24292e;
            color: white;
            
            &:hover {
              background: #2c3e50;
              transform: translateY(-2px);
            }
          }
          
          &.copy-btn {
            background: var(--vp-c-bg);
            color: var(--vp-c-text-1);
            border: 1px solid var(--vp-c-border);
            
            &:hover {
              background: var(--vp-c-bg-soft);
              border-color: var(--vp-c-brand);
            }
          }
        }
      }
    }
  }
}

/* 动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .link {
    .banner-page {
      .menu {
        justify-content: center;
        margin-top: 20px;
        
        .menu-item {
          padding: 10px 16px;
          height: 40px;
          
          .name {
            display: none;
          }
          
          .iconfont {
            margin-right: 0;
            font-size: 20px;
          }
        }
      }
      
      .link-badges {
        .badge-group {
          justify-content: center;
        }
      }
    }
    
    .link-categories {
      .categories-wrapper {
        justify-content: center;
      }
    }
    
    .link-apply-section {
      padding: 24px;
      
      .apply-title {
        font-size: 24px;
      }
      
      .apply-rules {
        grid-template-columns: 1fr;
      }
      
      .status-content {
        flex-direction: column;
        align-items: flex-start !important;
        
        .status-stats {
          width: 100%;
          justify-content: space-around;
        }
      }
      
      .apply-actions {
        flex-direction: column;
        
        .apply-btn {
          width: 100%;
        }
      }
    }
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .link-status {
    background: var(--vp-c-bg-soft) !important;
  }
  
  .rule-card {
    background: var(--vp-c-bg-soft) !important;
  }
}
</style>