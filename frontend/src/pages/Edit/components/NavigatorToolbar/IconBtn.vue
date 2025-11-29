<template>
  <t-tooltip :content="content">
    <component
      :is="icon"
      :size="size"
      :stroke-width="strokeWidth"
      @click="() => handleClick(name)"
    />
  </t-tooltip>
</template>

<script setup>
/**
 * 右下角图标按钮模板组件
 */
defineProps({
  content: {
    type: String,
    default: '',
  },
  icon: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: '20',
  },
  strokeWidth: {
    type: Number,
    default: 1.5,
  },
  // 添加一个标识符属性，用于标识按钮类型
  name: {
    type: String,
    required: true,
  },
  handleClick: {
    type: Function,
    required: true,
  },
})
</script>

<style lang="less" scoped></style>
