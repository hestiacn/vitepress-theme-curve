<!-- .vitepress\theme\components\Aside\Widgets\Hello.vue -->
<template>
  <div class="hello s-card" @mouseleave="resetHello">
    <span class="tip" @click="changeHello">{{ helloText }}</span>
    <div class="content">
      <div class="site-logo">
        <Clock />
      </div>
      <span class="site-desc" v-html="theme.aside.hello.text" />
    </div>
    <div class="info">
      <div class="name">
        <span class="author">{{ theme.siteMeta.author.name }}</span>
        <span class="desc">{{ theme.siteMeta.description }}</span>
      </div>
      <div class="link">
        <a href="https://github.com/hestiacn/" target="_blank" class="social-link">
          <i class="iconfont icon-github"></i>
        </a>
        <a href="mailto:one@mjbox.site" target="_blank" class="social-link">
          <i class="iconfont icon-email"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getGreetings } from "@/utils/helper";

const { site, theme } = useData();

// 问候数据
const helloClick = ref(0);
const helloTimeOut = ref(null);
const helloText = ref(getGreetings());

// 增加更多有趣的问候语
const funnyResponses = [
  { count: 1, text: "点这里干什么？👀" },
  { count: 2, text: "怎么还点？😏" },
  { count: 3, text: "那你点吧！😄" },
  { count: 4, text: "x 1 💪" },
  { count: 5, text: "x 2 ✨" },
  { count: 6, text: "x 3 🚀" },
  { count: 7, text: "x 4 ⭐" },
  { count: 8, text: "x 5 🔥" },
  { count: 9, text: "x 6 🌟" },
  { count: 10, text: "十连击！🎯" },
  { count: 11, text: "成就：点击达人 🏆" },
  { count: 12, text: "您有完没完？🤨" },
  { count: 13, text: "差不多了吧...😅" },
  { count: 14, text: "你是认真的吗？🤔" },
  { count: 15, text: "15次了大哥！😱" },
  { count: 16, text: "手不累吗？💆" },
  { count: 17, text: "请放过这个小按钮 🙏" },
  { count: 18, text: "我报警了！🚔" },
  { count: 19, text: "110吗？这里有人虐按钮 📞" },
  { count: 20, text: "解锁隐藏成就：无聊到爆 🎖️" },
  { count: 25, text: "25次了，你真闲 🤯" },
  { count: 30, text: "30！送你一朵小红花 🌸" },
  { count: 40, text: "点击能量：40% ⚡" },
  { count: 50, text: "点击能量：50% 🔋" },
  { count: 60, text: "点击能量：60% ⚡" },
  { count: 70, text: "点击能量：70% 🔋" },
  { count: 80, text: "点击能量：80% ⚡" },
  { count: 90, text: "点击能量：90% 🔋" },
  { count: 99, text: "要破百了吗？🤯" },
  { count: 100, text: "🎉 100次成就达成！🎉" },
  { count: 101, text: "好了好了，知道你厉害了 😂" },
  { count: 111, text: "光棍节快乐？😏" },
  { count: 123, text: "123木头人！🤫" },
  { count: 150, text: "150...你赢了 🏳️" },
  { count: 200, text: "200！你是机器人吗？🤖" },
  { count: 233, text: "23333 🤣" },
  { count: 250, text: "250次...没错，说的就是你 😜" },
  { count: 300, text: "300次！申请吉尼斯纪录 📝" },
  { count: 333, text: "333，无限循环中 🔄" },
  { count: 404, text: "404 找不到你的理智 🤪" },
  { count: 500, text: "500！服务器被你点爆了 💥" },
  { count: 666, text: "666！恶魔の点击 😈" },
  { count: 777, text: "777！幸运大奖 🎰" },
  { count: 888, text: "888！发发发！💰" },
  { count: 999, text: "999！要成仙了 🧙" },
  { count: 1000, text: "🎊 千次点击大魔王 🎊" },
];

// 特殊彩蛋触发概率
const specialEggs = [
  { text: "发现彩蛋！🥚 送你一个星星 ✨", probability: 0.05 },
  { text: "恭喜！解锁隐藏对话 🗝️", probability: 0.03 },
  { text: "点击能量充满！⚡", probability: 0.04 },
  { text: "随机掉落：爱心 ❤️", probability: 0.06 },
  { text: "系统提示：休息一下吧～ 😴", probability: 0.08 },
];

// 恢复问候语
const resetHello = () => {
  helloClick.value = 0;
  if (isHasUser()) return false;
  helloText.value = getGreetings();
};

// 更改问候语 - 增强版
const changeHello = () => {
  clearTimeout(helloTimeOut.value);
  helloClick.value++;
  
  // 记录最高点击次数到本地存储
  const recordKey = 'hello_click_record';
  const currentRecord = parseInt(localStorage.getItem(recordKey) || '0');
  if (helloClick.value > currentRecord) {
    localStorage.setItem(recordKey, helloClick.value.toString());
  }
  
  // 检查是否有匹配的特定次数响应
  const matchedResponse = funnyResponses.find(r => r.count === helloClick.value);
  
  if (matchedResponse) {
    helloText.value = matchedResponse.text;
  } else {
    // 随机彩蛋（概率触发）
    const randomEgg = specialEggs.find(egg => Math.random() < egg.probability);
    if (randomEgg && helloClick.value > 5) {
      helloText.value = randomEgg.text;
    } else if (helloClick.value > 3 && helloClick.value < 100) {
      // 普通计数显示
      const emojis = ['💫', '✨', '⭐', '🌟', '⚡', '🔥', '💥', '🎯', '🎪', '🎨'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      helloText.value = `点击 ${helloClick.value} 次 ${randomEmoji}`;
    } else if (helloClick.value >= 100) {
      // 超过100次的特殊处理
      const hundreds = Math.floor(helloClick.value / 100);
      const tens = helloClick.value % 100;
      
      if (tens === 0) {
        // 整百次
        const celebrationEmojis = ['🎉', '🎊', '🥳', '🎆', '🎇'];
        const randomCelebration = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
        helloText.value = `${hundreds * 100} 次成就！${randomCelebration}`;
      } else {
        // 非整百次
        const achievementTexts = [
          `距离下次整百还差 ${100 - tens} 次 💪`,
          `${helloClick.value} 次... 继续加油！🚀`,
          `点击次数：${helloClick.value} 🔢`,
        ];
        helloText.value = achievementTexts[Math.floor(Math.random() * achievementTexts.length)];
      }
    }
  }
  
  // 随机恢复时间（3-8秒）
  const randomTimeout = 3000 + Math.random() * 5000;
  helloTimeOut.value = setTimeout(() => {
    resetHello();
  }, randomTimeout);
  
  // 触发震动效果（如果浏览器支持）
  if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50]);
  }
  
  // 每隔10次显示最高记录
  if (helloClick.value % 10 === 0 && helloClick.value > 0) {
    const record = localStorage.getItem(recordKey) || '0';
    setTimeout(() => {
      if (helloClick.value > 0) { // 确保还在点击状态
        helloText.value = `最高记录：${record} 次 🏆 当前：${helloClick.value}`;
      }
    }, 800);
  }
};

// 是否具有用户
const isHasUser = () => {
  // 检查本地存储
  const userData = localStorage.getItem("ArtalkUser");
  if (!userData) return false;
  // 获取用户数据
  const { nick } = JSON.parse(userData);
  const hello = ["很高兴见到你", "好久不见", "欢迎回来"];
  // 随机问候语
  helloText.value = hello[Math.floor(Math.random() * hello.length)] + "，" + nick;
  return true;
};

onMounted(() => {
  isHasUser();
  
  // 初始化时显示最高记录
  const recordKey = 'hello_click_record';
  const record = localStorage.getItem(recordKey);
  if (record && parseInt(record) > 50) {
    setTimeout(() => {
      helloText.value = `历史最高：${record} 次 ⭐`;
      setTimeout(() => {
        if (helloClick.value === 0) {
          helloText.value = getGreetings();
        }
      }, 2000);
    }, 1000);
  }
});

onBeforeUnmount(() => {
  clearTimeout(helloTimeOut.value);
});
</script>

<style lang="scss" scoped>
.hello {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--main-color);
  color: var(--main-card-background);
  border: none;
  cursor: pointer;
  
  .tip {
    display: inline-block;
    min-width: 140px;
    text-align: center;
    padding: 6px 12px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    background-color: var(--main-color-opacity);
    margin-bottom: 12px;
    transition:
      color 0.3s,
      transform 0.3s,
      background-color 0.3s,
      box-shadow 0.3s;
    user-select: none;
    
    &:hover {
      transform: scale(1.1);
      color: var(--main-font-color);
      background-color: var(--main-card-background);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      transform: scale(0.95);
      transition: transform 0.1s;
    }
  }
  
  .content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    
    .site-logo {
      position: absolute;
      width: 210px;
      height: 210px;
      transition:
        transform cubic-bezier(0.69, 0.39, 0, 1.21) 0.3s,
        opacity cubic-bezier(0.69, 0.39, 0, 1.21) 0.3s;
      transform-origin: bottom;
    }
    
    .site-desc {
      display: block;
      height: 100%;
      margin-top: 20px;
      font-size: 1.1rem;
      line-height: 1.5;
      opacity: 0;
      transition: opacity 0.3s;
    }
  }
  
  .info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 20px;
    
    .name {
      display: flex;
      flex-direction: column;
      
      .author {
        font-weight: bold;
        font-size: 20px;
      }
      
      .desc {
        font-size: 12px;
        opacity: 0.6;
      }
    }
    
    .link {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-left: 20px;
      
      .social-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        margin-left: 12px;
        background-color: var(--main-color-opacity);
        border-radius: 50%;
        transition: all 0.3s;
        
        .iconfont {
          font-size: 22px;
          color: var(--main-card-background);
          transition: color 0.3s;
        }
        
        &:first-child {
          margin-left: 0;
        }
        
        &:hover {
          transform: scale(1.1);
          background-color: var(--main-card-background);
          
          .iconfont {
            color: var(--main-font-color);
          }
        }
      }
    }
  }
  
  &:hover {
    .content {
      .site-logo {
        opacity: 0;
        transform: scale(0);
      }
      
      .site-desc {
        opacity: 1;
      }
    }
  }
}

/* 点击动画效果 */
@keyframes clickPulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.click-animation {
  animation: clickPulse 0.2s ease-in-out;
}

/* 成就解锁特效 */
@keyframes achievementGlow {
  0% { box-shadow: 0 0 5px gold; }
  50% { box-shadow: 0 0 20px gold, 0 0 30px gold; }
  100% { box-shadow: 0 0 5px gold; }
}

.achievement-unlocked {
  animation: achievementGlow 1s ease-in-out;
}
</style>