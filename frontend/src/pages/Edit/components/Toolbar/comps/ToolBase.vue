<template>
  <t-button
    :class="{ active: !isDisabled && isActive }"
    shape="square"
    variant="text"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <div class="btn-content">
      <component :is="icon" size="20px" :stroke-width="1.5" />
      <span>{{ label }}</span>
    </div>
  </t-button>
</template>

<script setup>
const { name } = defineProps({
  icon: {
    type: Object,
    default: null,
  },
  name: {
    type: String,
    default: '工具英文名',
  },
  label: {
    type: String,
    default: '工具中文名',
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
})
const emit = defineEmits(['toolClick'])
const handleClick = () => {
  emit('toolClick', name)
}
</script>

<style lang="less" scoped>
.t-button {
  height: 55px;
  min-width: 50px;
  width: auto;
  padding: 0 5px;
  border: 1px solid transparent; /* 默认透明边框，防止hover时布局跳动 */
  transition: border-color 0.2s ease; /* 添加过渡效果 */

  // &:hover:not(:disabled) {
  //   border-color: var(--td-border-level-1-color, #e7e7e7); /* hover时显示边框 */
  // }
  &.active {
    background-color: var(--td-bg-color-container-active);
    border-color: #d0d0d0;
  }

  .btn-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
</style>
