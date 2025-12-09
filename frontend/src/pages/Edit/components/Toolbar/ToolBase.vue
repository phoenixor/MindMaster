<template>
  <t-tooltip :content="tip" placement="bottom">
    <t-button :class="{ active: !isDisabled && isActive }" shape="square" variant="text" size="small"
      :disabled="isDisabled" @click="handleClick">
      <div class="btn-content">
        <component :is="icon" size="20px" :stroke-width="1.5" :stroke-color="myColor" />
        <span :style="{ color: myColor }">{{ label }}</span>
      </div>
    </t-button>
  </t-tooltip>
</template>

<script setup>
import { computed } from 'vue';

const { isDisabled, label } = defineProps({
  tip: {
    type: String,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  // 激活状态（格式刷按钮有点击保持选中状态）
  isActive: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: Object,
    default: null,
  },
  // 唯一键名
  name: {
    type: String,
    required: true,
  },
  // 按钮显示中文名
  label: {
    type: String,
    required: true,
  },
  handleClick: {
    type: Function,
    required: true,
  },
})

const myColor = computed(() => {
  // 如果禁用，使用默认颜色
  if (isDisabled) {
    return '';
  }
  // 如果是AI图标且未禁用，使用红色
  if (label === 'AI') {
    return '#FF4D4F';
  }
  // 其他情况使用黑色
  return '#000';
});
</script>

<style lang="less" scoped>
.t-button {
  height: 55px;
  min-width: 50px;
  width: auto;
  padding: 0 5px;
  // 默认透明边框，防止hover时布局跳动
  border: 1px solid transparent;
  // 过渡效果
  transition: border-color 0.2s ease;

  // 非禁用时的hover效果
  &:hover:not(.t-is-disabled) {
    background-color: #d0d0d0;
    // border-color: #e0e0e0;
  }

  &.active {
    background-color: #d0d0d0;
    border-color: #d0d0d0;
  }

  .btn-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
  }
}
</style>
