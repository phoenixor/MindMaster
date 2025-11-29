<template>
  <div class="bar-container">
    <ToolBase
      v-for="item in btnList"
      :key="item.name"
      :icon="item.icon"
      :name="item.name"
      :label="item.label"
      :is-disabled="disabledConditions[item.name]"
      :is-active="item.name === 'painter' ? isInPainter : false"
      @tool-click="(name) => (name === 'painter' ? (isInPainter = !isInPainter) : '')"
    />
  </div>
</template>

<script setup>
import ToolBase from './comps/ToolBase.vue'
import { useToolbarConfig } from './config.js'

defineProps({
  btnList: {
    type: Array,
    default: [],
  },
})

const {
  activeNodes,
  backEnd,
  forwardEnd,
  isInPainter,
  hasRoot,
  hasGeneralization,
  isReadonly,
  disabledConditions,
  showNodeIconSidebar,
  showFormulaSidebar,
  selectAttachmentFile,
  onSetAnnotation,
  aiCreate,
} = useToolbarConfig()
</script>

<style lang="less" scoped>
.bar-container {
  display: flex;
  flex-wrap: wrap;
  background-color: transparent;
  gap: 8px;
}
</style>
