<template>
  <div class="countContainer">
    <div class="item">
      <span class="name">{{ $t('count.words') }}</span>
      <span class="value">{{ words }}</span>
    </div>
    <div class="item">
      <span class="name">{{ $t('count.nodes') }}</span>
      <span class="value">{{ num }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * @fileoverview 字数及节点数量统计组件
 * @description 用于统计思维导图的字数和节点数量，显示在页面左下角
 * @component Count
 * @example
 * <Count :mindMap="mindMapInstance" />
 */
import emitter from '@/utils/eventBus.js'
import { onMounted, onUnmounted, ref } from 'vue'

// 定义props
const { mindMap } = defineProps({
  mindMap: {
    type: Object,
  },
})

// 响应式数据
const textStr = ref('')
const words = ref(0)
const num = ref(0)

/**
 * 遍历数据，统计字数和节点数量
 * @param {Object} data - 思维导图数据
 */
const walk = (data) => {
  if (!data) return
  num.value++
  // htmlStr是所有节点的html字符串内容，需要解析出纯文本内容来统计字数
  // 例如：<p>根节点</p><p><span>二级节点</span></p><p><span>分支主题</span></p><p><span>分支主题</span></p>
  const htmlStr = String(data.data.text) || ''
  // 使用DOMParser解析HTML，提取纯文本内容
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlStr, 'text/html')
  textStr.value += doc.body.textContent
  if (data.children && data.children.length > 0) {
    data.children.forEach((item) => {
      walk(item)
    })
  }
}

const onDataChange = (data) => {
  textStr.value = ''
  words.value = 0
  num.value = 0
  walk(data)
  words.value = textStr.value.length
}

onMounted(() => {
  emitter.on('data_change', onDataChange)
  if (mindMap) {
    onDataChange(mindMap.getData())
  }
})
onUnmounted(() => {
  emitter.off('data_change', onDataChange)
})
</script>

<style lang="less" scoped>
.countContainer {
  padding: 0 12px;
  position: fixed;
  left: 20px;
  bottom: 20px;
  background: hsla(0, 0%, 100%, 0.8);
  border-radius: 2px;
  opacity: 0.8;
  height: 22px;
  line-height: 22px;
  font-size: 13px;
  display: flex;
  .item {
    color: #000;
    margin-right: 15px;
    &:last-of-type {
      margin-right: 0;
    }
    .name {
      font-weight: bold;
      margin-right: 5px;
    }
  }
}

@media screen and (max-width: 900px) {
  .countContainer {
    display: none;
  }
}
</style>
