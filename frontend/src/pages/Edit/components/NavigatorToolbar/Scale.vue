<template>
  <div class="scaleContainer">
    <t-tooltip :content="$t('scale.title')">
      <t-input-number
        v-model="currValue"
        :max="1000"
        :min="20"
        :format="(v) => `${v} %`"
        size="small"
        :allowInputOverLimit="false"
        :step="20"
        auto-width
        @change="handleChange"
        @enter="handleEnter"
        @focus="handleFocus"
      />
    </t-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const { mindMap } = defineProps({
  mindMap: {
    type: Object,
    required: true,
  },
})

const currValue = ref(100)
const prevValue = ref(100) // 上一次的值

/** 值变化事件 */
const handleChange = (value, { type }) => {
  if (type === 'add' || type === 'reduce') {
    mindMap.view.setScale(value / 100)
    prevValue.value = value
  }
  // if (type === 'add') {
  //   enlarge()
  //   prevValue.value = value
  // } else if (type === 'reduce') {
  //   narrow()
  //   prevValue.value = value
  // }
  // else if (context.type === 'input') {
  //   console.log('用户手动输入')
  // } else if (context.type === 'blur') {
  //   console.log('输入框失焦，值可能被修正')
  // } else if (context.type === 'enter') {
  //   console.log('用户按下了回车键')
  // } else if (context.type === 'clear') {
  //   console.log('用户点击了清除按钮')
  // } else if (context.type === 'props') {
  //   console.log('属性值被修改')
  // }
}

const handleEnter = (value) => {
  console.log('用户按下了回车键', prevValue.value, value)
  if (value > prevValue.value) {
    enlarge()
  } else if (value < prevValue.value) {
    narrow()
  }
  prevValue.value = value
}

const handleFocus = (value) => {
  // 输入框focus时记录当前值
  prevValue.value = value.replace(/ %$/, '')
}
const toPer = (scale) => {
  return (scale * 100).toFixed(0)
}
const narrow = () => {
  mindMap.view.narrow()
}
const enlarge = () => {
  mindMap.view.enlarge()
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
</script>

<style lang="less" scoped>
.scaleContainer {
  display: flex;
  align-items: center;
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
