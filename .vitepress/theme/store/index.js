import { defineStore } from "pinia";

export const mainStore = defineStore("main", {
  state: () => {
    return {
      // 主题类别
      themeType: "auto",
      themeValue: "light",
      // banner
      bannerType: "half",
      // 加载状态
      loadingStatus: true,
      // 滚动高度
      scrollData: {
        // 滚动高度
        height: 0,
        // 滚动百分比
        percentage: 0,
        // 滚动方向
        direction: "down",
      },
      // 页脚可见性
      footerIsShow: false,
      // 中控台显示
      controlShow: false,
      // 搜索框显示
      searchShow: false,
      // 个性化配置显示
      showSeetings: false,
      // 播放器数据
      playState: false,
      playerShow: true,
      playerVolume: 0.7,
      playerData: {
        name: "未知曲目",
        artist: "未知艺术家",
      },
      // 移动端菜单显示
      mobileMenuShow: false,
      // 使用自定义右键菜单
      useRightMenu: true,
      // 背景模糊
      backgroundBlur: false,
      // 全站字体
      fontFamily: "hmos",
      // 全站字体大小
      fontSize: 16,
      // 信息显示位置
      infoPosition: "fixed",
      // 上次滚动位置
      lastScrollY: 0,
      // 站点背景
      backgroundType: "patterns",
      backgroundUrl: "",
      isRefreshingBackground: false,
      
      // 背景配置
      backgroundConfig: {
        category: "suiji", // 默认随机
        device: "zsy", // 默认自适应
      }
    };
  },
  getters: {},
  actions: {
        async refreshBackground(category = null, device = null) {
      this.isRefreshingBackground = true;
      
      try {
        // 使用提供的参数或默认值
        const selectedCategory = category || this.backgroundConfig.category;
        const selectedDevice = device || this.backgroundConfig.device;
        
        console.log('正在更换背景图片...', { selectedCategory, selectedDevice });
        
        // 构建API URL
        const apiUrl = this.buildBackgroundUrl(selectedCategory, selectedDevice);
        console.log('请求URL:', apiUrl);
        
        // 获取图片URL
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('API返回:', data);
        
        if (data.code === "200" && data.imgurl) {
          // 直接更新背景URL
          this.backgroundUrl = data.imgurl;
          console.log('背景图片已更换:', data.imgurl);
          
        } else {
          console.error('API返回格式错误:', data);
          // 使用直接图片URL作为备用
          this.backgroundUrl = `https://imgapi.cn/api.php?fl=${selectedCategory}&zd=${selectedDevice}&gs=images`;
        }
      } catch (error) {
        console.error("更换背景失败:", error);
        // 使用最简单的备用方案
        const category = category || this.backgroundConfig.category;
        const device = device || this.backgroundConfig.device;
        this.backgroundUrl = `https://imgapi.cn/api.php?fl=${category}&zd=${device}&gs=images`;
      } finally {
        this.isRefreshingBackground = false;
      }
    },
    
    // 构建API URL
    buildBackgroundUrl(category, device) {
      const baseUrl = "https://imgapi.cn/api.php";
      const params = new URLSearchParams();
      
      if (device && device !== "zsy") {
        params.append("zd", device);
      }
      
      if (category && category !== "suiji") {
        params.append("fl", category);
      }
      
      params.append("gs", "json");
      
      return `${baseUrl}?${params.toString()}`;
    },
    
    // 使用CosPlay背景
    async useCosBackground() {
      this.isRefreshingBackground = true;
      
      try {
        console.log('正在更换CosPlay背景...');
        
        // 使用CosPlay API
        const cosApiUrl = 'https://imgapi.cn/cos.php?return=json';
        
        const response = await fetch(cosApiUrl);
        const data = await response.json();
        
        if (data && data.imgurl) {
          // 直接更新背景URL
          this.backgroundUrl = data.imgurl;
          console.log('CosPlay背景已更换:', data.imgurl);
        } else {
          console.error('CosPlay API返回格式错误');
          // 如果cosplay API失败，使用普通API
          await this.refreshBackground();
        }
      } catch (error) {
        console.error('更换CosPlay背景失败:', error);
        await this.refreshBackground();
      } finally {
        this.isRefreshingBackground = false;
      }
    },
    
    // 应用自定义背景
    applyCustomBackground(url) {
      if (url) {
        this.backgroundUrl = url;
        console.log('自定义背景已应用:', url);
      }
    },
    
    // 清除背景
    clearBackground() {
      this.backgroundUrl = "";
      this.backgroundType = "patterns";
    },
    // 切换应用状态
    changeShowStatus(value, blur = true) {
      this[value] = !this[value];
      // 阻止滚动
      document.body.style.overflowY = this[value] ? "hidden" : "";
      // 全局模糊
      const globalApp = document.getElementById("app");
      this[value] && this.backgroundBlur && blur
        ? globalApp.classList.add("blur")
        : globalApp.classList.remove("blur");
    },
    // 更改字体大小
    changeFontSize(isAdd = false) {
      if (isAdd) {
        if (this.fontSize < 20) {
          this.fontSize++;
        }
      } else {
        if (this.fontSize > 14) {
          this.fontSize--;
        }
      }
      const htmlElement = document.documentElement;
      htmlElement.style.fontSize = this.fontSize + "px";
    },
    // 切换明暗模式
    changeThemeType() {
      // 禁止壁纸模式切换
      if (this.backgroundType === "image") {
        $message.warning("无法在壁纸模式下切换明暗模式", {
          duration: 1500,
        });
        return false;
      }
      this.themeType === "auto"
        ? (this.themeType = "dark")
        : this.themeType === "dark"
          ? (this.themeType = "light")
          : (this.themeType = "auto");
      // 弹窗提示
      if (typeof $message !== "undefined") {
        const text =
          this.themeType === "light"
            ? "浅色模式"
            : this.themeType === "dark"
              ? "深色模式"
              : "跟随系统";
        $message.info("当前主题为" + text, {
          duration: 1500,
        });
      }
    },
  },
  persist: (() => {
  if (typeof window === 'undefined') {
    return false;
  }
  return {
    key: "siteData",
    paths: [
      "themeType",
      "bannerType",
      "useRightMenu",
      "playerShow",
      "playerVolume",
      "backgroundBlur",
      "backgroundType",
      "fontFamily",
      "fontSize",
      "infoPosition",
      "backgroundUrl",
      "backgroundConfig",
      ],
    };
  })(),
});
