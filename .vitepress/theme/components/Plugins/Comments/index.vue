<!-- 评论 -->
<template>
  <div
    v-if="theme.comment.enable"
    :key="router.route.path"
    ref="mainCommentRef"
    id="main-comment"
    class="comment"
  >
    <div v-if="!fill" class="title">
      <span class="name">
        <i class="iconfont icon-chat"></i>
        评论
      </span>
      <span class="tool" @click="router.go('/pages/privacy')"> 隐私政策 </span>
    </div>
    <!-- 区分评论系统 -->
    <Artalk v-if="theme.comment.type === 'artalk'" :fill="fill" />
    <Twikoo v-else-if="theme.comment.type === 'twikoo'" :fill="fill" />
    <!-- 👇 新增 giscus 分支 -->
    <Giscus v-else-if="theme.comment.type === 'giscus'" :fill="fill" />
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import { useRouter } from 'vitepress'
import { ref } from 'vue'

// 👇 记得引入 Giscus 组件
import Artalk from './ArtalkComment.vue'
import Twikoo from './TwikooComment.vue'
import Giscus from './GiscusComment.vue'  // 新增

const { theme } = useData()
const router = useRouter()
console.log('【评论调试】完整 theme.comment:', theme.value.comment)
console.log('【评论调试】enable:', theme.value.comment?.enable)
console.log('【评论调试】type:', theme.value.comment?.type)
console.log('【评论调试】giscus 配置:', theme.value.comment?.giscus)
const props = defineProps({
  // 填充评论区
  fill: {
    type: [Boolean, String],
    default: false,
  },
})

const mainCommentRef = ref(null)

// 滚动至评论
const scrollToComments = () => {
  if (!mainCommentRef.value) return false
  const elementRect = mainCommentRef.value.getBoundingClientRect()
  const elementTop = elementRect.top + window.scrollY
  window.scrollBy({ top: elementTop - 80, behavior: 'smooth' })
}

defineExpose({ scrollToComments })
</script>

<style lang="scss" scoped>
.comment {
  margin-top: 2rem;
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 3rem 0 1rem 0;
    padding: 0 6px;
    .name {
      display: flex;
      align-items: center;
      font-size: 24px;
      font-weight: bold;
      .iconfont {
        font-size: 26px;
        font-weight: normal;
        margin-right: 8px;
      }
    }
    .tool {
      opacity: 0.6;
      font-size: 14px;
      cursor: pointer;
      transition:
        opacity 0.3s,
        color 0.3s;
      &:hover {
        opacity: 1;
        color: var(--main-color);
      }
    }
  }
}
</style>