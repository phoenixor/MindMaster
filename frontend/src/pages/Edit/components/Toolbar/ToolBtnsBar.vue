<template>
  <div class="bar-container">
    <ToolBase v-for="item in btnList" :key="item.name" :icon="item.icon" :name="item.name" :label="item.label"
      :isDisabled="disabledConditions[item.name]" :isActive="item.name === 'painter' ? isInPainter : false"
      @tool-click="(name) => (name === 'painter' ? (isInPainter = !isInPainter) : '')" />
  </div>
</template>

<script setup>
import ToolBase from './ToolBase.vue'
import useToolbarConfig from './useToolbar.js'

const { btnList } = defineProps({
  btnList: {
    type: Array,
    default: [],
  },
})

const {
  // 状态
  activeNodes,
  backEnd,
  forwardEnd,
  isInPainter,
  hasRoot,
  hasGeneralization,
  isReadonly,
  disabledConditions,

  // 方法
  handleToolClick,
  showNodeIconSidebar,
  showFormulaSidebar,
  selectAttachmentFile,
  onSetAnnotation,
  aiCreate,
  setEventHandler,
} = useToolbarConfig(btnList)
</script>

<style lang="less" scoped>
.bar-container {
  display: flex;
  flex-wrap: wrap;
  background-color: transparent;
  gap: 8px;
}
</style>
