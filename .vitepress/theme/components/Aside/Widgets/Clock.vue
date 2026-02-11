<template>
  <div class="clock">
    <div class="clock-content">
      <!-- 分钟刻度（60个小刻度） -->
      <div class="minute-marks">
        <div v-for="mark in 60" :key="'minute-' + mark" class="minute-mark"
             :style="getMinuteMarkStyle(mark)">
        </div>
      </div>
      
      <!-- 小时刻度（12个大刻度） -->
      <div class="hour-marks">
        <div v-for="mark in 12" :key="'hour-' + mark" class="hour-mark"
             :style="getHourMarkStyle(mark)">
        </div>
      </div>
      
      <!-- 小时数字 -->
      <div class="clock-numbers">
        <div v-for="num in 12" :key="num" class="clock-number" 
             :style="getNumberStyle(num)">
          {{ num === 0 ? 12 : num }}
        </div>
      </div>
      
      <div :style="{ transform: ` rotate(${hourRotate}deg)` }" class="pointer hour" />
      <div :style="{ transform: ` rotate(${minuteRotate}deg)` }" class="pointer minute" />
      <div :style="{ transform: ` rotate(${secondRotate}deg)` }" class="pointer second" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 指针数据
const hourRotate = ref(0);
const minuteRotate = ref(0);
const secondRotate = ref(0);
const pointerInterval = ref(null);

// 计算指针旋转角度
const updatePointer = () => {
  // 计算角度
  const calculateRotation = (time, total) => {
    return (time / total) * 360;
  };
  
  // 更改样式
  const changeStyle = () => {
    const now = new Date();
    const hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();
    
    // 时针需要更平滑的移动，包括分钟的影响
    hourRotate.value = calculateRotation(hour, 12) + calculateRotation(minute, 60) / 12;
    minuteRotate.value = calculateRotation(minute, 60) + calculateRotation(second, 60) / 60;
    secondRotate.value = calculateRotation(second, 60);
  };
  
  // 每秒更新
  changeStyle();
  pointerInterval.value = setInterval(changeStyle, 1000);
};

onMounted(() => {
  updatePointer();
});

onBeforeUnmount(() => {
  clearInterval(pointerInterval.value);
});

// 新增：计算刻度位置的方法
const getMinuteMarkStyle = (mark) => {
  const angle = mark * 6; // 每6度一个刻度，从0度开始
  return {
    transform: `rotate(${angle}deg)`,
  };
};

const getHourMarkStyle = (mark) => {
  const angle = mark * 30; // 每30度一个大刻度，从0度开始
  return {
    transform: `rotate(${angle}deg)`,
  };
};

const getNumberStyle = (num) => {
  const angle = (num - 3) * 30 * (Math.PI / 180); // 转换为弧度
  const radius = 70; // 数字离中心的距离
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  
  return {
    transform: `translate(${x}px, ${y}px)`,
  };
};
</script>

<style lang="scss" scoped>
.clock {
  width: 210px;
  height: 210px;
  border-radius: 50%;
  border: 6px solid var(--main-card-background);
  box-shadow: 0 8px 16px -4px var(--main-border-shadow);
  background-image: linear-gradient(to bottom, #505152, #2e2f30);
  overflow: hidden;
  
  .clock-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: inset 0 0 16px -6px #191a1b;
    
    .minute-marks {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 0;
      
      .minute-mark {
        position: absolute;
        left: 50%;
        top: 0;
        width: 2px;
        height: 8px;
        margin-left: -1px;
        background-color: rgba(228, 228, 228, 0.6);
        transform-origin: center 100px; // 中心点在表盘中心
      }
    }
    
    .hour-marks {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 1;
      
      .hour-mark {
        position: absolute;
        left: 50%;
        top: 0;
        width: 4px;
        height: 12px;
        margin-left: -2px;
        background-color: #e4e4e4;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
        transform-origin: center 100px; // 中心点在表盘中心
      }
    }
    
    .clock-numbers {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 2;
      
      .clock-number {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 24px;
        height: 24px;
        margin-left: -12px;
        margin-top: -12px;
        color: #e4e4e4;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        line-height: 24px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
      }
    }
    
    .pointer {
      position: absolute;
      left: 50%;
      top: 50%;
      transform-origin: center bottom;
      box-shadow: 0 0 10px 0 #191a1b;
      border-radius: 25px;
      z-index: 3;
      
      &.hour {
        width: 8px;
        height: 50px;
        margin-left: -4px;
        margin-top: -50px;
        background-color: #e4e4e4;
        transform-origin: center 50px; // 旋转中心在指针底部
      }
      
      &.minute {
        width: 6px;
        height: 70px;
        margin-left: -3px;
        margin-top: -70px;
        background-color: #d2d2d2;
        transform-origin: center 70px; // 旋转中心在指针底部
        z-index: 4;
      }
      
      &.second {
        width: 3px;
        height: 85px;
        margin-left: -1.5px;
        margin-top: -85px;
        background-color: #a51b1d;
        transform-origin: center 85px; // 旋转中心在指针底部
        z-index: 5;
        
        &::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 3px;
          height: 15px;
          background-color: #a51b1d;
          border-radius: 25px;
        }
      }
    }
    
    &::after {
      content: "";
      position: absolute;
      width: 12px;
      height: 12px;
      background-color: #a51b1d;
      border-radius: 50%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 6;
    }
  }
}
</style>