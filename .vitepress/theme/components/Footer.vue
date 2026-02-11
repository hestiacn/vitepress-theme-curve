<template>
  <footer id="main-footer" class="main-footer">
    <div class="footer-content">
      <div class="copyright">
        <span class="time">@ 2019 - {{ thisYear }} By </span>
        <a :href="theme.siteMeta.author.link" class="author link" target="_blank">
          {{ theme.siteMeta.author.name }}
        </a>
        <a
          class="cf link"
          href="https://cloudflare.com"
          target="_blank"
        ><svg role="img" viewBox="0 0 460 271.2" width="30" height="30px" aria-hidden="true" style="vertical-align: middle;" ><path fill="#FBAD41" d="M328.6,125.6c-0.8,0-1.5,0.6-1.8,1.4l-4.8,16.7c-2.1,7.2-1.3,13.8,2.2,18.7    c3.2,4.5,8.6,7.1,15.1,7.4l26.2,1.6c0.8,0,1.5,0.4,1.9,1c0.4,0.6,0.5,1.5,0.3,2.2c-0.4,1.2-1.6,2.1-2.9,2.2l-27.3,1.6    c-14.8,0.7-30.7,12.6-36.3,27.2l-2,5.1c-0.4,1,0.3,2,1.4,2h93.8c1.1,0,2.1-0.7,2.4-1.8c1.6-5.8,2.5-11.9,2.5-18.2    c0-37-30.2-67.2-67.3-67.2C330.9,125.5,329.7,125.5,328.6,125.6z"></path><path fill="#F6821F" d="M292.8,204.4c2.1-7.2,1.3-13.8-2.2-18.7c-3.2-4.5-8.6-7.1-15.1-7.4l-123.1-1.6    c-0.8,0-1.5-0.4-1.9-1s-0.5-1.4-0.3-2.2c0.4-1.2,1.6-2.1,2.9-2.2l124.2-1.6c14.7-0.7,30.7-12.6,36.3-27.2l7.1-18.5    c0.3-0.8,0.4-1.6,0.2-2.4c-8-36.2-40.3-63.2-78.9-63.2c-35.6,0-65.8,23-76.6,54.9c-7-5.2-15.9-8-25.5-7.1    c-17.1,1.7-30.8,15.4-32.5,32.5c-0.4,4.4-0.1,8.7,0.9,12.7c-27.9,0.8-50.2,23.6-50.2,51.7c0,2.5,0.2,5,0.5,7.5    c0.2,1.2,1.2,2.1,2.4,2.1h227.2c1.3,0,2.5-0.9,2.9-2.2L292.8,204.4z"></path></svg>赛博活佛</a>
        <a class="icp link" href="https://icp.gov.moe/?keyword=20260899" target="_blank">
          <img src="https://icp.gov.moe/images/gov.svg?color=%23666" alt="ICP备案" class="icp-icon" width="16" height="16"/>
          {{ theme.icp }}
        </a>
      </div>
      <div class="meta">
        <a class="power link" href="https://vitepress.dev/" target="_blank">
          <span class="by">Powered by</span>
          <span class="name">VitePress</span>
        </a>
        <a class="theme link" href="https://github.com/hestiacn/vitepress-theme-curve" target="_blank">
          <span class="name">主题</span>
        </a>
        <a class="rss link" href="https://blog.mjbox.site/rss.xml" target="_blank">
          <i class="iconfont icon-rss" />
          <span class="name">订阅</span>
        </a>
        <a
          class="cc link"
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"
          target="_blank"
        >
          <i class="iconfont icon-line" />
          <i class="iconfont icon-by-line" />
          <i class="iconfont icon-nc-line" />
          <i class="iconfont icon-nd-line" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";

const store = mainStore();
const { theme } = useData();
const { footerIsShow } = storeToRefs(store);

// 视窗监听器
const observer = ref(null);

// 实时年份
const thisYear = computed(() => new Date().getFullYear());

// 监听页脚视窗
const isShowFooter = () => {
  const footerDom = document.getElementById("main-footer");
  if (!footerDom) return false;
  if (observer.value) observer.value?.disconnect();
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      footerIsShow.value = entry.isIntersecting ? true : false;
    });
  });
  // 添加监视器
  observer.value?.observe(footerDom);
};

onMounted(() => {
  isShowFooter();
});

onBeforeUnmount(() => {
  if (observer.value) observer.value?.disconnect();
});
</script>

<style lang="scss" scoped>
.icp.link img {
  margin-right: 8px;
  vertical-align: middle;
}
.main-footer {
  display: flex;
  margin-top: 1rem;
  padding: 1rem 0;
  background-color: var(--main-card-background);
  border-top: 1px solid var(--main-card-border);
  overflow: hidden;
  animation: show 0.3s backwards;
  transition:
    color 0.3s,
    border 0.3s,
    background-color 0.3s;
  .footer-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
    color: var(--main-font-color);
    line-height: 1;
    min-height: 32px;
    .copyright {
      .icp {
        .iconfont {
          font-size: 20px;
          opacity: 0.6;
        }
      }
      .cf {
        .iconfont {
          font-size: 20px;
          font-weight: normal;
        }
      }
    }
    .meta {
      display: flex;
      flex-direction: row;
      align-items: center;
      .power {
        margin-right: 4px;
        .by {
          font-weight: normal;
          opacity: 0.8;
          margin-right: 6px;
        }
      }
      .rss {
        margin-right: 4px;
        .iconfont {
          font-weight: normal;
          margin-right: 6px;
        }
      }
      .cc {
        .iconfont {
          margin: 0 2px;
          font-weight: normal;
        }
      }
    }
    .link {
      flex-direction: row;
      align-items: center;
      font-weight: bold;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      padding: 8px;
      margin: 0 2px;
      height: 38px;
      border-radius: 12px;
      transition:
        color 0.3s,
        background-color 0.3s;
      cursor: pointer;
      .iconfont {
        font-size: 22px;
        margin-right: 4px;
        transition: color 0.3s;
      }
      &:hover {
        color: var(--main-color);
        background-color: var(--main-color-bg);
        .iconfont {
          color: var(--main-color);
        }
      }
    }
    @media (max-width: 768px) {
      font-size: 14px;
      .meta {
        display: none;
      }
    }
    @media (max-width: 420px) {
      .copyright {
        .icp {
          .iconfont {
            display: none;
          }
        }
      }
    }
  }
}
</style>
