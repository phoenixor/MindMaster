<template>
  <div class="fullscreenContainer" :class="{ isDark: isDark }">
    <t-tooltip content="全屏查看" placement="top">
      <div class="btn iconfont iconquanping" @click="toFullscreenShow"></div>
    </t-tooltip>
    <t-tooltip content="全屏编辑" placement="top">
      <div class="btn iconfont iconquanping1" @click="toFullscreenEdit"></div>
    </t-tooltip>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { fullscrrenEvent, fullScreen } from '@/utils'

// 定义props
const props = defineProps({
  mindMap: {
    type: Object,
    required: true
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

// 组件挂载时添加全屏事件监听
onMounted(() => {
  document[fullscrrenEvent] = () => {
    setTimeout(() => {
      props.mindMap.resize()
    }, 1000)
  }
})

// 方法
const toFullscreenShow = () => {
  fullScreen(props.mindMap.el)
}

const toFullscreenEdit = () => {
  fullScreen(document.body)
}
</script>

<style lang="less" scoped>
.fullscreenContainer {
  display: flex;
  align-items: center;

  &.isDark {
    .btn {
      color: hsla(0,0%,100%,.6);
    }
  }

  .item {
    margin-right: 12px;

    &:last-of-type {
      margin-right: 0;
    }
  }

  .btn {
    cursor: pointer;
  }
}
</style>