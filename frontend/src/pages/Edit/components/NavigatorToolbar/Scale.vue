<template>
  <div class="scaleContainer" :class="{ isDark: isDark }">
    <t-tooltip content="缩小" placement="top">
      <div class="btn el-icon-minus" @click="narrow"></div>
    </t-tooltip>
    <div class="scaleInfo">
      <input
        ref="inputRef"
        type="text"
        v-model="scaleNum"
        @input="onScaleNumInput"
        @change="onScaleNumChange"
        @focus="onScaleNumInputFocus"
        @keydown.stop
        @keyup.stop
      />%
    </div>
    <t-tooltip content="放大" placement="top">
      <div class="btn el-icon-plus" @click="enlarge"></div>
    </t-tooltip>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

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

// 响应式数据
const scaleNum = ref(100)
const cacheScaleNum = ref(0)
const inputRef = ref(null)

// 监听mindMap变化
watch(() => props.mindMap, (val, oldVal) => {
  if (val && !oldVal) {
    props.mindMap.on('scale', onScale)
    props.mindMap.on('draw_click', onDrawClick)
    scaleNum.value = toPer(props.mindMap.view.scale)
  }
})

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  if (props.mindMap) {
    props.mindMap.off('scale', onScale)
    props.mindMap.off('draw_click', onDrawClick)
  }
})

// 方法
const toPer = (scale) => {
  return (scale * 100).toFixed(0)
}

const narrow = () => {
  props.mindMap.view.narrow()
}

const enlarge = () => {
  props.mindMap.view.enlarge()
}

const onScaleNumInputFocus = () => {
  cacheScaleNum.value = scaleNum.value
}

const onScaleNumInput = () => {
  scaleNum.value = scaleNum.value.replace(/[^0-9]+/g, '')
}

const onScaleNumChange = () => {
  const num = Number(scaleNum.value)
  if (Number.isNaN(num) || num <= 0) {
    scaleNum.value = cacheScaleNum.value
  } else {
    const cx = props.mindMap.width / 2
    const cy = props.mindMap.height / 2
    props.mindMap.view.setScale(scaleNum.value / 100, cx, cy)
  }
}

const onScale = (scale) => {
  scaleNum.value = toPer(scale)
}

const onDrawClick = () => {
  if (inputRef.value) inputRef.value.blur()
}
</script>

<style lang="less" scoped>
.scaleContainer {
  display: flex;
  align-items: center;

  &.isDark {
    .btn {
      color: hsla(0, 0%, 100%, 0.6);
    }

    .scaleInfo {
      color: hsla(0, 0%, 100%, 0.6);

      input {
        color: hsla(0, 0%, 100%, 0.6);
      }
    }
  }

  .btn {
    cursor: pointer;
  }

  .scaleInfo {
    margin: 0 20px;
    display: flex;
    align-items: center;

    input {
      width: 35px;
      text-align: center;
      background-color: transparent;
      border: none;
      outline: none;
    }
  }
}
</style>