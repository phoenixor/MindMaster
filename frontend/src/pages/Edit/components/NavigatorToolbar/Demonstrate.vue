<template>
  <div class="demonstrateContainer" :class="{ isDark: isDark }">
    <t-tooltip content="演示模式" placement="top">
      <div class="btn iconfont iconyanshibofang" @click="enterDemoMode"></div>
    </t-tooltip>
    <div
      class="exitDemonstrateBtn"
      @click="exit"
      ref="exitDemonstrateBtnRef"
      v-if="isEnterDemonstrate"
      @mousedown.stop
      @mousemove.stop
      @mouseup.stop
    >
      <span class="icon iconfont iconguanbi"></span>
    </div>
    <div
      class="stepBox"
      ref="stepBoxRef"
      v-if="isEnterDemonstrate"
      @mousedown.stop
      @mousemove.stop
      @mouseup.stop
    >
      <div class="jump" @click="prev" :class="{ disabled: curStepIndex <= 0 }">
        <span class="icon el-icon-back"></span>
      </div>
      <div class="step">{{ curStepIndex + 1 }} / {{ totalStep }}</div>
      <div
        class="jump"
        @click="next"
        :class="{ disabled: curStepIndex >= totalStep - 1 }"
      >
        <span class="icon el-icon-right"></span>
      </div>
      <div class="input">
        <input
          type="text"
          v-model="inputStep"
          @keyup.enter.stop="onEnter"
          @keydown.stop
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

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
const isEnterDemonstrate = ref(false)
const curStepIndex = ref(0)
const totalStep = ref(0)
const inputStep = ref('')
const exitDemonstrateBtnRef = ref(null)
const stepBoxRef = ref(null)

// 组件挂载时添加事件监听
onMounted(() => {
  props.mindMap.bus.$on('demonstrate_jump', onJump)
  props.mindMap.bus.$on('exit_demonstrate', onExit)
})

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  props.mindMap.bus.$off('demonstrate_jump', onJump)
  props.mindMap.bus.$off('exit_demonstrate', onExit)
})

// 方法
const enterDemoMode = () => {
  isEnterDemonstrate.value = true
  nextTick(() => {
    const el = document.querySelector('#mindMapContainer')
    el.appendChild(exitDemonstrateBtnRef.value)
    el.appendChild(stepBoxRef.value)
  })
  props.mindMap.demonstrate.enter()
}

const exit = () => {
  props.mindMap.demonstrate.exit()
}

const onExit = () => {
  isEnterDemonstrate.value = false
  curStepIndex.value = 0
  totalStep.value = 0
}

const onJump = (index, total) => {
  curStepIndex.value = index
  totalStep.value = total
}

const prev = () => {
  props.mindMap.demonstrate.prev()
}

const next = () => {
  props.mindMap.demonstrate.next()
}

const onEnter = () => {
  const num = Number(inputStep.value)
  if (Number.isNaN(num)) {
    inputStep.value = ''
  } else if (num >= 1 && num <= totalStep.value) {
    props.mindMap.demonstrate.jump(num - 1)
  }
}
</script>

<style lang="less" scoped>
.demonstrateContainer {
  display: flex;
  align-items: center;

  &.isDark {
    .btn {
      color: hsla(0, 0%, 100%, 0.6);
    }
  }

  .item {
    margin-right: 12px;

    &:last-of-type {
      margin-right: 0;
    }
  }

  .btn {
    cursor: pointer;
    font-size: 24px;
  }
}

.exitDemonstrateBtn {
  position: absolute;
  right: 40px;
  top: 20px;
  cursor: pointer;
  z-index: 10001;
  pointer-events: all;

  .icon {
    font-size: 28px;
    color: #fff;
  }
}

.stepBox {
  position: absolute;
  right: 40px;
  bottom: 20px;
  pointer-events: all;

  z-index: 10001;
  display: flex;
  align-items: center;

  .step {
    color: #fff;
    margin: 0 12px;
  }

  .jump {
    color: #fff;
    cursor: pointer;

    &.disabled {
      cursor: not-allowed;
      color: #999;
    }
  }

  .input {
    margin-left: 12px;
    display: flex;
    align-items: center;

    input {
      width: 50px;
      height: 30px;
      text-align: center;
      background-color: transparent;
      border: 1px solid #999;
      outline: none;
      color: #fff;
    }
  }
}
</style>