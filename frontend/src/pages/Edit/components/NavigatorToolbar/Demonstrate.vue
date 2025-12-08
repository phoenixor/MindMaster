<template>
  <div class="demonstrateContainer">
    <!-- 进入演示模式 -->
    <IconBtn
      name="playDemo"
      :content="$t('demonstrate.demonstrate')"
      :icon="PlayDemoIcon"
      :handleClick="enterDemoMode"
    />
    <!-- 退出演示模式 -->
    <teleport defer to="#mindMapContainer" v-if="isEnterDemonstrate">
      <div class="exitDemonstrateBtn">
        <IconBtn
          name="exitDemo"
          size="40"
          :strokeColor="'#fff'"
          :icon="CloseCircleIcon"
          :handleClick="exitDemoMode"
        />
      </div>
    </teleport>
    <!-- 演示步骤控制 -->
    <!-- <teleport to="#mindMapContainer" v-if="isEnterDemonstrate">
      <div class="stepBox">
        <t-pagination
          v-model:current="curStepIndex"
          v-model:pageSize="pageSize"
          :total="totalStep"
          :showPageSize="false"
          :totalContent="false"
          show-jumper
          showFirstAndLastPageBtn
          @current-change="onCurrentChange"
        />
      </div>
    </teleport> -->
    <div
      v-if="isEnterDemonstrate"
      class="stepBox"
      ref="stepBoxRef"
      @mousedown.stop
      @mousemove.stop
      @mouseup.stop
    >
      <div class="jump" @click="prev" :class="{ disabled: curStepIndex <= 0 }">
        <ChevronLeftCircleIcon size="24" />
      </div>
      <div class="step">{{ curStepIndex + 1 }} / {{ totalStep }}</div>
      <div
        class="jump"
        @click="next"
        :class="{ disabled: curStepIndex >= totalStep - 1 }"
      >
        <ChevronRightCircleIcon size="24" />
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
import emitter from "@/utils/eventBus";
import {
  CloseCircleIcon,
  PlayDemoIcon,
  ChevronLeftCircleIcon,
  ChevronRightCircleIcon,
} from "tdesign-icons-vue-next";
import { MessagePlugin } from "tdesign-vue-next";
import { onBeforeMount, onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import IconBtn from "./IconBtn.vue";

// 定义props
const { mindMap } = defineProps({
  mindMap: {
    type: Object,
  },
});

const isEnterDemonstrate = ref(false);
const curStepIndex = ref(0);
const totalStep = ref(0);
const inputStep = ref("");
const pageSize = ref(1);
// const exitDemonstrateBtnRef = ref(null)
const stepBoxRef = ref(null);

onBeforeMount(() => {
  emitter.on('demonstrate_jump', onJump)
  emitter.on('exit_demonstrate', onExit)
});

onBeforeUnmount(() => {
  emitter.off("demonstrate_jump", onJump);
  emitter.off("exit_demonstrate", onExit);
});

const enterDemoMode = () => {
  isEnterDemonstrate.value = true;
  nextTick(() => {
    const el = document.querySelector("#mindMapContainer");
    // el.appendChild(exitDemonstrateBtnRef.value)
    el.appendChild(stepBoxRef.value);
  });
  mindMap.demonstrate.enter();
};

const exitDemoMode = () => {
  isEnterDemonstrate.value = false;
  mindMap.demonstrate.exit();
};
const onCurrentChange = (index, pageInfo) => {
  // MessagePlugin.success(`转到第${index}页`)
  console.log("onCurrentChange", index, pageInfo);
};
const onJump = (index, total) => {
  curStepIndex.value = index;
  totalStep.value = total;
};
const onExit = () => {
  isEnterDemonstrate.value = false;
  curStepIndex.value = 0;
  totalStep.value = 0;
};

const prev = () => {
  mindMap.demonstrate.prev();
};

const next = () => {
  mindMap.demonstrate.next();
};

const onEnter = () => {
  const num = Number(inputStep.value);
  if (Number.isNaN(num)) {
    inputStep.value = "";
  } else if (num >= 1 && num <= totalStep.value) {
    mindMap.demonstrate.jump(num - 1);
  }
};
</script>

<style lang="less" scoped>
.demonstrateContainer {
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
    font-size: 24px;
  }
}

.exitDemonstrateBtn {
  position: fixed;
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
