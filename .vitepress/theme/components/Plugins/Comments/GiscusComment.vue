<template>
  <div ref="giscusContainer" class="giscus-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useData } from 'vitepress'

const { theme, isDark } = useData()  // ✅ 引入 isDark
const giscusContainer = ref(null)

const giscusConfig = theme.value.comment?.giscus || {}

const loadGiscus = () => {
  if (!giscusContainer.value) return

  giscusContainer.value.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', giscusConfig.repo)
  script.setAttribute('data-repo-id', giscusConfig.repoId)
  script.setAttribute('data-category', giscusConfig.category)
  script.setAttribute('data-category-id', giscusConfig.categoryId)
  script.setAttribute('data-mapping', giscusConfig.mapping || 'pathname')
  script.setAttribute('data-strict', giscusConfig.strict || '0')
  script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled || '1')
  script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata || '0')
  script.setAttribute('data-input-position', giscusConfig.inputPosition || 'top')
  
  // ✅ 关键修改：根据 isDark 动态设置 theme
  const themeMode = isDark.value ? 'dark' : 'light'
  script.setAttribute('data-theme', giscusConfig.theme === 'preferred_color_scheme' 
    ? themeMode 
    : giscusConfig.theme)
  
  script.setAttribute('data-lang', giscusConfig.lang || 'zh-CN')
  script.setAttribute('data-loading', giscusConfig.loading || 'lazy')
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true

  giscusContainer.value.appendChild(script)
}

onMounted(() => {
  loadGiscus()
  // ✅ 监听深色模式变化，而不是静态配置
  watch(isDark, () => {
    loadGiscus()  // 重新加载使主题生效
  })
})
</script>

<style scoped>
.giscus-wrapper {
  width: 100%;
  margin-top: 1rem;
}
</style>