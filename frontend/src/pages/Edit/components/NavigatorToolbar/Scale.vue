<template>
  <div class="scaleContainer">
    <t-tooltip :content="$t('scale.title')">
      <t-input-number
        v-model="currValue"
        :max="inputMax"
        :min="inputMin"
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
import { onBeforeUnmount, ref, watch } from 'vue';

const { mindMap } = defineProps({
  mindMap: {
    type: Object,
  },
})

const currValue = ref(100)
const prevValue = ref(100) // 上一次的值
const inputMax = 400
const inputMin = 20

watch(
  () => mindMap,
  (val, oldVal) => {
    // 只在 mindMap 从 null 变为实际对象（初始化后）时执行逻辑
    if (val && !oldVal) {
      currValue.value = toFixedNum(mindMap.view.scale)
      // 画布放大缩小事件
      mindMap.on('scale', onScale)
      // 画布的单击事件
      // mindMap.on('draw_click', onDrawClick)
    }
  },
)

onBeforeUnmount(() => {
  if (mindMap) {
    mindMap.off('scale', onScale)
    // mindMap.off('draw_click', onDrawClick)
  }
})

/** 缩放地图并回到中心 */
const scaleToCenter = (num) => {
  mindMap.view.setScale(num / 100)
  mindMap.renderer.setRootNodeCenter()
}
/** 值变化事件 */
const handleChange = (value, { type }) => {
  if (type === 'add' || type === 'reduce') {
    scaleToCenter(value)
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
  // 如果输入小数，自动保留整数部分
  currValue.value = Math.floor(value)
  if (currValue.value < inputMin || currValue.value > inputMax) {
    // 输入非法值，恢复之前的值
    currValue.value = prevValue.value
  } else {
    // const cx = mindMap.width / 2
    // const cy = mindMap.height / 2
    scaleToCenter(currValue.value)
  }
}
const handleFocus = (value) => {
  // 输入框focus时记录当前值
  prevValue.value = value.replace(/ %$/, '')
}
/** 缩放倍数*100再四舍五入到整数 */
const toFixedNum = (scale) => {
  return Number((scale * 100).toFixed(0))
}
const onScale = (scale) => {
  currValue.value = toFixedNum(scale)
}
// const onDrawClick = () => {
//   console.log('画布被单击了')
// }
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
