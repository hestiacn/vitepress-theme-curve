<template>
  <!-- 全局设置 -->
  <div class="settings">
    <div class="set-btn s-card" @click="store.changeShowStatus('showSeetings')">
      <i class="iconfont icon-style"></i>
      <span class="set-text">个性化配置</span>
    </div>
    <!-- 设置面板 -->
    <Modal
      :show="store.showSeetings"
      title="个性化配置"
      titleIcon="style"
      @mask-click="store.changeShowStatus('showSeetings')"
      @modal-close="store.changeShowStatus('showSeetings')"
    >
      <div class="set-list">
        <span class="title">字体</span>
        <div class="set-item">
          <span class="set-label">全站字体</span>
          <div class="set-options">
            <span
              :class="['options', { choose: fontFamily === 'hmos' }]"
              @click="fontFamily = 'hmos'"
            >
              HarmonyOS Sans
            </span>
            <span
              :class="['options', { choose: fontFamily === 'lxgw' }]"
              @click="fontFamily = 'lxgw'"
            >
              霞鹜文楷
            </span>
          </div>
        </div>
        <div class="set-item">
          <span class="set-label">全站字体大小</span>
          <div class="set-options">
            <span class="options" @click="store.changeFontSize(false)"> - </span>
            <span class="num">{{ fontSize }}</span>
            <span class="options" @click="store.changeFontSize(true)"> + </span>
          </div>
        </div>
        <span class="title">壁纸个性化</span>
        
        <!-- 背景类型选择 -->
        <div class="set-item">
          <span class="set-label">全站背景</span>
          <div class="set-options">
            <span
              :class="['options', { choose: backgroundType === 'close' }]"
              @click="backgroundType = 'close'; clearBackground()"
            >
              关闭
            </span>
            <span
              :class="['options', { choose: backgroundType === 'patterns' }]"
              @click="backgroundType = 'patterns'; clearBackground()"
            >
              纹理
            </span>
            <span
              :class="['options', { choose: backgroundType === 'image' }]"
              @click="selectImageBackground"
            >
              图片
            </span>
          </div>
        </div>
        
        <!-- 图片背景设置 - 简化布局 -->
        <div v-if="backgroundType === 'image'" class="image-settings">
          
          <!-- 简单配置区域 -->
          <div class="simple-config">
            <div class="config-row">
              <span class="config-label">图片分类</span>
              <div class="category-tabs">
                <span
                  v-for="category in categories"
                  :key="category.value"
                  :class="['tab-option', { active: backgroundConfig.category === category.value }]"
                  @click="changeCategory(category.value)"
                  :title="category.description"
                >
                  {{ category.icon }}
                </span>
              </div>
            </div>
            
            <div class="config-row">
              <span class="config-label">显示尺寸</span>
              <div class="device-tabs">
                <span
                  v-for="device in devices"
                  :key="device.value"
                  :class="['tab-option', { active: backgroundConfig.device === device.value }]"
                  @click="changeDevice(device.value)"
                  :title="device.description"
                >
                  {{ device.icon }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 当前设置信息 -->
          <div class="current-setting">
            <span class="setting-text">
              当前: {{ getCategoryLabel(backgroundConfig.category) }} · {{ getDeviceLabel(backgroundConfig.device) }}
            </span>
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button
              class="action-btn primary"
              @click="refreshBackground"
              :disabled="isRefreshingBackground"
            >
              <span v-if="isRefreshingBackground">
                <span class="loading-spinner"></span> 获取中...
              </span>
              <span v-else>
                <span class="btn-icon">🔄</span> 刷新背景
              </span>
            </button>
            
            <button
              class="action-btn secondary"
              @click="useCosBackground"
              :disabled="isRefreshingBackground"
            >
              <span v-if="isRefreshingBackground">
                <span class="loading-spinner"></span> 获取中...
              </span>
              <span v-else>
                <span class="btn-icon">👗</span> CosPlay
              </span>
            </button>
          </div>
          
          <!-- 自定义输入 -->
          <div class="custom-input">
            <div class="input-group">
              <input
                ref="customInput"
                type="url"
                placeholder="粘贴图片链接，按回车应用"
                @keyup.enter="applyCustomBackground"
              />
              <button @click="applyCustomBackground" class="apply-btn" title="应用">
                应用
              </button>
            </div>
            <div class="input-hint">
              <small>支持常见图片格式链接</small>
            </div>
          </div>
        </div>
        
        <!-- 其他设置 -->
        <span class="title">首页样式</span>
        <div class="set-item">
          <span class="set-label">Banner 高度</span>
          <div class="set-options">
            <span
              :class="['options', { choose: bannerType === 'half' }]"
              @click="bannerType = 'half'"
            >
              半屏
            </span>
            <span
              :class="['options', { choose: bannerType === 'full' }]"
              @click="bannerType = 'full'"
            >
              全屏
            </span>
          </div>
        </div>
        
        <span class="title">杂项调整</span>
        <div class="set-item">
          <span class="set-label">额外信息显示位置</span>
          <div class="set-options">
            <span
              :class="['options', { choose: infoPosition === 'normal' }]"
              @click="infoPosition = 'normal'"
            >
              默认位置
            </span>
            <span
              :class="['options', { choose: infoPosition === 'fixed' }]"
              @click="infoPosition = 'fixed'"
            >
              右下角
            </span>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";

const store = mainStore();

// 获取状态
const { themeType, fontFamily, fontSize, infoPosition, backgroundType, bannerType } = storeToRefs(store);

// 计算属性
const backgroundConfig = computed(() => store.backgroundConfig);
const isRefreshingBackground = computed(() => store.isRefreshingBackground);

// 自定义输入框引用
const customInput = ref(null);

// 简化分类选项 - 只保留图标
const categories = [
  { label: '随机', value: 'suiji', icon: '🎲', description: '随机图片' },
  { label: '动漫', value: 'dongman', icon: '🎨', description: '动漫图片' },
  { label: '风景', value: 'fengjing', icon: '🏞️', description: '风景图片' },
  { label: '真人', value: 'meizi', icon: '👩', description: '真人图片' }
];

// 简化设备选项 - 只保留图标
const devices = [
  { label: '自适应', value: 'zsy', icon: '📱', description: '自适应' },
  { label: '手机', value: 'mobile', icon: '📱', description: '手机竖屏' },
  { label: '电脑', value: 'pc', icon: '💻', description: '电脑横屏' }
];

// 方法
const selectImageBackground = () => {
  store.backgroundType = 'image';
  store.themeType = 'dark';
  // 如果当前没有背景，自动获取一个
  if (!store.backgroundUrl) {
    store.refreshBackground();
  }
};

const changeCategory = (category) => {
  store.backgroundConfig.category = category;
  console.log('选择分类:', category);
  store.refreshBackground(category, store.backgroundConfig.device);
};

const changeDevice = (device) => {
  store.backgroundConfig.device = device;
  console.log('选择设备:', device);
  store.refreshBackground(store.backgroundConfig.category, device);
};

const refreshBackground = () => {
  console.log('刷新背景');
  store.refreshBackground();
};

const useCosBackground = () => {
  console.log('使用CosPlay背景');
  store.useCosBackground();
};

const applyCustomBackground = () => {
  if (customInput.value && customInput.value.value) {
    const url = customInput.value.value.trim();
    if (url) {
      console.log('应用自定义背景:', url);
      store.applyCustomBackground(url);
      // 清空输入框
      customInput.value.value = '';
      customInput.value.blur();
    }
  }
};

const clearBackground = () => {
  store.clearBackground();
};

const getCategoryLabel = (value) => {
  const category = categories.find(c => c.value === value);
  return category ? category.label : value;
};

const getDeviceLabel = (value) => {
  const device = devices.find(d => d.value === value);
  return device ? device.label : value;
};
</script>

<style lang="scss" scoped>
.settings {
  .set-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 42px;
    height: 42px;
    padding: 0;
    border-radius: 25px;
    box-shadow: 0 6px 10px -4px var(--main-dark-shadow);
    .iconfont {
      font-size: 22px;
      margin-left: 10px;
      transition: color 0.3s;
    }
    .set-text {
      margin-left: 10px;
      display: inline-flex;
      opacity: 0;
      font-size: 14px;
      line-height: 1;
      overflow: hidden;
      white-space: nowrap;
      transition: opacity 0.3s;
    }
    &:hover {
      width: 140px;
      color: var(--main-card-background);
      border-color: var(--main-color);
      background-color: var(--main-color);
      .iconfont {
        color: var(--main-card-background);
      }
      .set-text {
        opacity: 1;
      }
    }
  }
}

.set-list {
  .title {
    display: block;
    width: 100%;
    margin: 1rem 0;
    font-size: 16px;
    font-weight: bold;
    border-left: 4px solid var(--main-color);
    border-radius: 4px 8px 8px 4px;
    background-color: var(--main-border-shadow);
    padding: 6px 0 6px 12px;
    &:first-child {
      margin-top: 0;
    }
  }
  
  .set-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .set-options {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 40px;
      border-radius: 8px;
      
      .options {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9375rem;
        border-radius: 8px;
        margin: 4px 8px;
        padding: 6px 8px;
        min-width: 30px;
        background-color: var(--main-card-border);
        transition:
          color 0.3s,
          background-color 0.3s;
        
        &.choose,
        &:hover {
          color: var(--main-card-background);
          background-color: var(--main-color);
          box-shadow: 0 8px 16px -4px var(--main-border-shadow);
        }
        
        &:last-child {
          margin-right: 0;
        }
      }
      
      .num {
        margin: 0 4px;
      }
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    @media (max-width: 512px) {
      flex-direction: column;
      align-items: flex-start;
      
      .set-options {
        margin-top: 8px;
        
        .options {
          &:first-child {
            margin-left: 0;
          }
        }
      }
    }
  }
}

/* 简化版图片设置 */
.image-settings {
  margin-top: 12px;
  padding: 16px;
  background: var(--main-card-bg);
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
}

.simple-config {
  .config-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .config-label {
      font-size: 14px;
      font-weight: 500;
      min-width: 70px;
      color: var(--main-font-color);
    }
    
    .category-tabs,
    .device-tabs {
      flex: 1;
      display: flex;
      gap: 8px;
    }
    
    .tab-option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      font-size: 20px;
      border: 2px solid var(--main-card-border);
      border-radius: 8px;
      background: var(--main-bg);
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--main-color-light);
        background: var(--main-card-hover);
      }
      
      &.active {
        border-color: var(--main-color);
        background: var(--main-color);
        color: var(--main-card-background);
        transform: scale(1.05);
      }
    }
  }
}

.current-setting {
  margin: 12px 0;
  padding: 8px 12px;
  background: var(--main-border-shadow);
  border-radius: 6px;
  text-align: center;
  
  .setting-text {
    font-size: 13px;
    color: var(--main-font-color-light);
    font-weight: 500;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin: 16px 0;
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    
    &.primary {
      background: var(--main-color);
      color: var(--main-card-background);
      
      &:hover:not(:disabled) {
        background: var(--main-color-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(var(--main-color-rgb), 0.3);
      }
    }
    
    &.secondary {
      background: var(--main-card-border);
      color: var(--main-font-color);
      
      &:hover:not(:disabled) {
        background: var(--main-color-light);
        color: var(--main-card-background);
        transform: translateY(-1px);
      }
    }
    
    .btn-icon {
      font-size: 16px;
    }
  }
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.custom-input {
  .input-group {
    display: flex;
    gap: 8px;
    
    input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--main-card-border);
      border-radius: 6px;
      background: var(--main-bg);
      color: var(--main-font-color);
      font-size: 13px;
      font-family: var(--main-font-family);
      
      &:focus {
        outline: none;
        border-color: var(--main-color);
        box-shadow: 0 0 0 2px rgba(var(--main-color-rgb), 0.1);
      }
      
      &::placeholder {
        color: var(--main-font-color-light);
        font-size: 13px;
      }
    }
    
    .apply-btn {
      padding: 0 16px;
      border: none;
      border-radius: 6px;
      background: var(--main-card-border);
      color: var(--main-font-color);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--main-color-light);
        color: var(--main-card-background);
      }
    }
  }
  
  .input-hint {
    margin-top: 6px;
    text-align: center;
    
    small {
      color: var(--main-font-color-light);
      font-size: 11px;
    }
  }
}
</style>