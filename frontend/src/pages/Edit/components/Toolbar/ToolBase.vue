<template>
  <t-tooltip :content="tip" placement="bottom">
    <t-button :class="{ active: !isDisabled && isActive }" shape="square" variant="text" :disabled="isDisabled"
      @click="handleClick">
      <div class="btn-content">
        <component :is="icon" size="20px" :stroke-width="1.5" />
        <span>{{ label }}</span>
      </div>
    </t-button>
  </t-tooltip>
</template>

<script setup>
defineProps({
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
  name: {
    type: String,
    default: '工具英文名',
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
  }
}
</style>
