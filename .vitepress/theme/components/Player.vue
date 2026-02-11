<!-- 全局播放器 -->
<template>
  <div v-if="playerShow" :class="['player', { playing: playState }]" @click="player?.toggle()">
    <div ref="playerDom" class="player-content" />
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import "aplayer/dist/APlayer.min.css";

const store = mainStore();
const { theme } = useData();
const { enable } = theme.value.music;
const { playerShow, playerVolume, playState, playerData } = storeToRefs(store);

// APlayer
const player = ref(null);
const playerDom = ref(null);

// 音乐列表 - 只定义名称和URL，封面动态分配
const musicList = [
  { name: "天空之城", url: "https://peiyin.com/music/SKYCITY.ogg" },
  { name: "临江烟波雨", url: "https://peiyin.com/music/LJYBY.ogg" },
  { name: "人生若只如初见", url: "https://peiyin.com/music/RSZCJ.ogg" },
  { name: "墨缘", url: "https://peiyin.com/music/MOYUAN.ogg" },
  { name: "姬高云-空山静", url: "https://peiyin.com/music/KONGSHAN.ogg" },
  { name: "康美之恋", url: "https://peiyin.com/music/KANGMEI.ogg" },
  { name: "想你的时候问月亮", url: "https://peiyin.com/music/MISSMOON.ogg" },
  { name: "曾志豪-水岸风堤", url: "https://peiyin.com/music/SAFD.ogg" },
  { name: "月之门-万花谷", url: "https://peiyin.com/music/YUEWAN.ogg" },
  { name: "江上清风游-毛小贝", url: "https://peiyin.com/music/JIANGYOU.ogg" },
  { name: "沏茶敬茶", url: "https://peiyin.com/music/QICHA.ogg" },
  { name: "清音菩提", url: "https://peiyin.com/music/QINGPU.ogg" },
  { name: "友情そして爱", url: "https://peiyin.com/music/yqai.ogg" },
  { name: "潇湘子", url: "https://peiyin.com/music/XIAOXI.ogg" },
  { name: "远古的梦~苏尔格", url: "https://peiyin.com/music/ANCDR.ogg" },
  { name: "陈林-回家", url: "https://peiyin.com/music/CHENHOME.ogg" },
  { name: "顺流逆流", url: "https://peiyin.com/music/FLOW.ogg" }
];

// 随机封面图库 - 每次播放随机分配
const coverImages = [
  "https://p2.music.126.net/m8BMzRWR53lMu2uaMYV2mA==/109951166609630672.jpg",
  "https://p1.music.126.net/6y-UleORITEDbvrOLw0Qkw==/5639395138885805.jpg",
  "https://p1.music.126.net/zflI1-sFmX9MQIbfWKKtNw==/109951165975953309.jpg",
  "https://p1.music.126.net/PH2j1QZcSUL6UL3aqrS10g==/109951164209780223.jpg",
  "https://p1.music.126.net/VnZiMcyE2L84FkqB1W6TAg==/18660370048681141.jpg",
  "https://p1.music.126.net/-D2nFP1m0Cj9jvJh-GARsQ==/109951165740746248.jpg",
  "https://p1.music.126.net/-_yLCQY2d5xRKZP1rQZ8ng==/109951166098576447.jpg",
  "/images/logo/logo.webp",
  "https://p1.music.126.net/8FZq5Z7TkZm9ZZnZ8ZqZqQ==/109951165740746248.jpg",
  "https://p1.music.126.net/9GZq5Z7TkZm9ZZnZ8ZqZqQ==/109951165740746249.jpg"
];

// 获取随机封面
const getRandomCover = () => {
  return coverImages[Math.floor(Math.random() * coverImages.length)];
};

// 初始化播放器
const initAPlayer = async () => {
  try {
    // 随机打乱播放顺序
    const shuffledList = [...musicList].sort(() => Math.random() - 0.5);
    
    // 动态分配随机封面 - 每首歌随机分配一个封面
    const audioList = shuffledList.map(song => ({
      name: song.name,
      artist: "纯音乐",
      url: song.url,
      cover: getRandomCover() // 每首歌随机分配封面
    }));
    
    console.log(`🎵 准备播放 ${audioList.length} 首曲目，封面已随机分配`);
    
    const module = await import("aplayer");
    const APlayer = module.default;
    
    player.value = new APlayer({
      container: playerDom.value,
      volume: playerVolume.value,
      lrcType: 0,
      listFolded: true,
      order: "random",     // 随机播放顺序
      loop: "all",         // 全部循环
      preload: "auto",     // 自动预加载
      audio: audioList,
    });
    
    console.info("🎵 播放器挂载完成，共", musicList.length, "首曲目");
    
    // 播放器事件
    player.value?.on("play", () => {
      playState.value = true;
      getMusicData();
    });
    
    player.value?.on("pause", () => {
      playState.value = false;
    });
    
    player.value?.on("ended", () => {
      // 切歌时更新信息
      setTimeout(() => {
        getMusicData();
      }, 100);
    });
    
    // 挂载播放器到全局
    window.$player = player.value;
    
  } catch (error) {
    console.error("初始化播放器出错：", error);
    $message?.error("音乐播放器初始化失败");
  }
};

// 获取当前播放歌曲信息
const getMusicData = () => {
  try {
    if (!playerDom.value) return false;
    
    const songInfo = playerDom.value.querySelector(".aplayer-info");
    if (!songInfo) return;
    
    const songName = songInfo.querySelector(".aplayer-title")?.innerText || "未知曲目";
    const songArtist = songInfo.querySelector(".aplayer-author")?.innerText?.replace(" - ", "") || "纯音乐";
    
    // 更新信息
    playerData.value = {
      name: songName,
      artist: songArtist,
    };
    
    // 更新媒体会话
    initMediaSession(songName, songArtist);
    
  } catch (error) {
    console.error("获取播放信息出错：", error);
  }
};

// 初始化媒体会话控制
const initMediaSession = (title, artist) => {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ 
      title, 
      artist,
      album: "peiyin.com 配乐"
    });
    
    navigator.mediaSession.setActionHandler("play", () => player.value?.play());
    navigator.mediaSession.setActionHandler("pause", () => player.value?.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => player.value?.skipBack());
    navigator.mediaSession.setActionHandler("nexttrack", () => player.value?.skipForward());
  }
};

// 监听播放器开启状态
watch(
  () => playerShow.value,
  (val) => {
    if (!val) {
      player.value?.destroy();
    } else {
      // 延迟初始化，确保DOM已挂载
      setTimeout(() => {
        initAPlayer();
      }, 100);
    }
  },
);

// 监听播放器音量变化
watch(
  () => playerVolume.value,
  (val) => {
    player.value?.volume(val, true);
  },
);

onMounted(() => {
  if (window.innerWidth >= 768 && playerShow.value && enable) {
    initAPlayer();
  }
});

onBeforeUnmount(() => {
  player.value?.destroy();
});
</script>

<style lang="scss" scoped>
.player {
  height: 42px;
  margin-top: 12px;
  transition: transform 0.3s;
  cursor: pointer;
  
  .player-content {
    margin: 0;
    width: fit-content;
    border-radius: 50px;
    overflow: hidden;
    color: var(--main-font-color);
    font-family: var(--main-font-family);
    background-color: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    box-shadow: 0 6px 10px -4px var(--main-dark-shadow);
    transition: all 0.3s;
    
    :deep(.aplayer-body) {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 6px;
      padding-right: 12px;
      pointer-events: none;
      
      .aplayer-pic {
        width: 30px;
        height: 30px;
        min-width: 30px;
        border-radius: 50%;
        margin-right: 8px;
        outline: 1px solid var(--main-card-border);
        animation: rotate 20s linear infinite;
        animation-play-state: paused;
        z-index: 2;
        
        .aplayer-button {
          display: none;
        }
      }
      
      .aplayer-info {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: auto;
        margin: 0;
        padding: 0;
        border: none;
        
        .aplayer-music {
          margin: 0;
          padding: 0;
          height: auto;
          display: flex;
          line-height: normal;
          z-index: 2;
          
          .aplayer-title {
            line-height: normal;
            display: inline-block;
            white-space: nowrap;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .aplayer-author {
            display: none;
          }
        }
        
        .aplayer-lrc {
          margin: 0;
          opacity: 0;
          margin-left: 12px;
          width: 0;
          z-index: 2;
          transition: width 0.3s, opacity 0.3s;
          
          &::before,
          &::after {
            display: none;
          }
          
          .aplayer-lrc-contents {
            p {
              text-align: center;
              color: var(--main-card-background);
              filter: blur(0.8px);
              transition: filter 0.3s, opacity 0.3s;
              
              &.aplayer-lrc-current {
                filter: blur(0);
              }
            }
          }
        }
        
        .aplayer-controller {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          
          .aplayer-time {
            display: none;
          }
          
          .aplayer-bar-wrap {
            margin: 0;
            padding: 0;
            opacity: 0;
            transition: opacity 0.3s;
            
            .aplayer-bar {
              height: 100%;
              background: transparent;
              
              .aplayer-loaded {
                display: none;
              }
              
              .aplayer-played {
                height: 100%;
                background: var(--main-color-white) !important;
                transition: width 0.3s;
              }
            }
          }
        }
      }
      
      .aplayer-notice,
      .aplayer-miniswitcher {
        display: none;
      }
    }
    
    :deep(.aplayer-list) {
      display: none;
    }
    
    &::after {
      content: "播放音乐";
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 14px;
      opacity: 0;
      color: var(--main-card-background);
      background-color: var(--main-color);
      pointer-events: none;
      transition: opacity 0.3s;
      z-index: 3;
    }
    
    &:hover {
      border-color: var(--main-color);
      box-shadow: 0 8px 16px -4px var(--main-color-bg);
      
      &::after {
        opacity: 1;
      }
    }
  }
  
  &.playing {
    .player-content {
      color: var(--main-card-background);
      background-color: var(--main-color);
      border: 1px solid var(--main-color);
      
      :deep(.aplayer-body) {
        .aplayer-pic {
          animation-play-state: running;
        }
        
        .aplayer-info {
          .aplayer-lrc {
            opacity: 1;
            width: 200px;
          }
          
          .aplayer-controller {
            .aplayer-bar-wrap {
              opacity: 1;
            }
          }
        }
      }
      
      &::after {
        opacity: 0;
      }
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>