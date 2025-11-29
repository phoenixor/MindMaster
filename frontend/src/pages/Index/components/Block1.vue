<template>
  <div class="block1Container" :style="{ height: height + 'px' }">
    <div class="blockContent">
      <div class="infoBox">
        <!-- <div class="blockTitle">Simple mind map</div> -->
        <Split></Split>
        <div class="infoList">
          <p class="infoRow">是一个思维导图编辑器</p>
          <p class="infoRow">也是与 <span class="ai-text">AI</span> 结合的智能体</p>
          <p class="infoRow">简约、强大...</p>
        </div>
        <div class="desc">
          支持逻辑结构图（向左、向右逻辑结构图）、思维导图、组织结构图、目录组织图、时间轴（横向、竖向）、鱼骨图等结构
        </div>
        <t-space>
          <t-button
            size="large"
            variant="text"
            href="/edit"
            style="color: #fff; background-color: #ff4d4f"
          >
            开始使用
          </t-button>
          <t-button variant="outline" size="large">
            <template #icon><PlayCircleIcon /></template>
            演示视频
          </t-button>
        </t-space>
      </div>
      <div class="picBox">
        <div class="animation1"></div>
        <div class="animation2"></div>
        <div class="animation3"></div>
        <div class="pic"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PlayCircleIcon } from 'tdesign-icons-vue-next'
import Split from './Split.vue'

const router = useRouter()
const height = ref(0)

onMounted(() => {
  window.addEventListener('resize', onResize)
  onResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const onResize = () => {
  height.value = window.innerHeight
}

const useOnline = () => {
  router.push('/')
}

const jumpDoc = () => {
  router.push('/doc/zh/')
}
</script>

<style lang="less" scoped>
.block1Container {
  width: 100%;
  background-color: #f0f9fa;
  border-radius: 0 0 0 450px;
  display: flex;
  justify-content: center;
  align-items: center;

  .blockContent {
    width: 100%;
    max-width: 1140px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .infoBox {
      .blockTitle {
        font-size: 16px;
        color: #1e3547;
        margin-bottom: 10px;
      }

      .infoList {
        margin-top: 20px;

        .infoRow {
          font-size: 45px;
          color: #1e3547;
          font-weight: 700;
          margin-bottom: 20px;
          .ai-text {
            font-weight: bold;
            color: #ff4d4f;
            text-shadow: 0 0 8px rgba(255, 77, 79, 0.5);
            position: relative;
            animation: ai-pulse 2s infinite;
            letter-spacing: 1px;
          }
        }
      }

      .desc {
        color: #828f99;
        font-size: 20px;
        line-height: 1.5;
        margin-bottom: 20px;
      }

      .btnBox {
        display: flex;
        align-items: center;
        margin-top: 20px;

        .btn {
          height: 44px;
          padding: 0 20px;
          line-height: 44px;
          cursor: pointer;
          background: #1ea59a;
          border-color: #1ea59a;
          color: #fff;
          font-weight: 600;
          font-size: 15px;
          border-radius: 5px;
          transition: all 0.5s;
          margin-right: 10px;

          &:hover {
            transform: translateY(-4px);
          }

          &.btn2 {
            background-color: #f5828b;
          }
        }
      }
    }

    .picBox {
      position: relative;
      .pic {
        width: 500px;
        height: 500px;
        background-image: url('../../../assets/img/index/block1.png');
        background-size: cover;
      }

      .animation1 {
        width: 38px;
        height: 38px;
        border: 7px solid #f5828b;
        border-radius: 50%;
        position: absolute;
        right: -50px;
        bottom: 86px;
        animation-name: zoom1;
        animation-duration: 3s;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        box-shadow: 0 12px 50px 0 rgba(0, 0, 0, 0.14);
      }

      .animation2 {
        border-radius: 50%;
        background-color: #1ea59a;
        box-shadow: 0 20px 30px 0 rgba(48, 61, 114, 0.4);
        position: absolute;
        width: 25px;
        height: 25px;
        top: -60px;
        right: 60px;
        animation: spin 2s infinite alternate;
        bottom: 60px;
      }

      .animation3 {
        border-radius: 50%;
        background-color: #25233a;
        box-shadow: 0 20px 30px 0 rgba(245, 130, 139, 0.4);
        position: absolute;
        width: 25px;
        height: 25px;
        bottom: 50px;
        left: 0px;
        animation: spin 3s infinite alternate;
      }
    }
  }
}

@keyframes ai-pulse {
  0% {
    text-shadow: 0 0 8px rgba(255, 77, 79, 0.5);
  }
  50% {
    text-shadow: 0 0 12px rgba(255, 77, 79, 0.8);
  }
  100% {
    text-shadow: 0 0 8px rgba(255, 77, 79, 0.5);
  }
}

@keyframes zoom1 {
  0% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1.5);
  }
}

@keyframes spin {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(40px);
  }
}
</style>
