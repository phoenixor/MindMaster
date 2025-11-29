<template>
  <div class="mouseActionContainer">
    <t-tooltip
      class="item"
      :content="useLeftKeySelectionRightKeyDrag ? $t('mouseAction.tip2') : $t('mouseAction.tip1')"
    >
      <IconfontBtn
        :name="useLeftKeySelectionRightKeyDrag ? 'iconmouseR' : 'iconmouseL'"
        :handleClick="toggleAction"
      />
    </t-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import appStore from '@/stores'
import IconfontBtn from './IconfontBtn.vue'

const { mindMap } = defineProps({
  mindMap: {
    type: Object,
    required: true,
  },
})

const useLeftKeySelectionRightKeyDrag = computed(
  () => appStore.localConfig.useLeftKeySelectionRightKeyDrag,
)

const toggleAction = () => {
  const val = !useLeftKeySelectionRightKeyDrag.value
  mindMap.updateConfig({
    useLeftKeySelectionRightKeyDrag: val,
  })
  appStore.setLocalConfig({
    useLeftKeySelectionRightKeyDrag: val,
  })
}
</script>

<style lang="less" scoped>
.mouseActionContainer {
  display: flex;
  align-items: center;
  .item {
    margin-right: 12px;
    &:last-of-type {
      margin-right: 0;
    }
  }
  .btn {
    cursor: pointer;
    font-size: 18px;
  }
}
</style>
