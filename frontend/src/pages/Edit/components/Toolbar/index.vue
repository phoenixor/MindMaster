<template>
  <div class="toolbarContainer">
    <div class="toolbar" ref="toolbarRef">
      <!-- 左侧工具组 -->
      <div class="toolbarBlock">
        <ToolBase v-for="item in leftBtnList" :key="item.name" :icon="item.icon" :name="item.name" :label="item.label"
          :isDisabled="item.disabled" :isActive="item.name === 'painter' ? isInPainter : false"
          :handleClick="item.handler" />
      </div>
      <!-- 右侧工具组 -->
      <div class="toolbarBlock">
        <ToolBase v-for="item in rightBtnList" :key="item.name" :icon="item.icon" :name="item.name" :label="item.label"
          :tip="item.tip" :handleClick="item.handler" />
      </div>
    </div>
    <!-- 工具相关子组件 -->
    <ImportFile />
  </div>
</template>

<script setup>
/** 顶部工具栏 */
import { getData } from '@/api'
import appStore from '@/stores'
import emitter from '@/utils/eventBus.js'
import exampleData from 'simple-mind-map/example/exampleData'
import { isMobile as isMobileUtil, throttle } from 'simple-mind-map/src/utils/index'
import { LoadingPlugin, MessagePlugin, NotifyPlugin } from 'tdesign-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import ToolBtnsBar from './ToolBtnsBar.vue'
import ToolBase from './ToolBase.vue'
import useToolbar from './useToolbar.js'

import ImportFile from '../ImportFile/index.vue'

const toolbarRef = ref(null)

const isMobile = ref(isMobileUtil())
const horizontalList = ref([])
const verticalList = ref([])
const showMoreBtn = ref(true)
const popoverShow = ref(false)
const fileTreeProps = ref({
  label: 'name',
  children: 'children',
  isLeaf: 'leaf',
})

const {
  leftBtnList,
  rightBtnList,
  btnList,
  // 状态
  activeNodes,
  backEnd,
  forwardEnd,
  isInPainter,
  hasRoot,
  hasGeneralization,
  annotationRightHasBtn,

  // 方法
  handleToolClick,
  showNodeIconSidebar,
  showFormulaSidebar,
  selectAttachmentFile,
  onSetAnnotation,
  aiCreate,
  setEventHandler,
  removeEventHandler
} = useToolbar()

/** 计算工具按钮如何显示 */
const computeToolbarShow = () => {
  if (!toolbarRef.value) return
  const windowWidth = window.innerWidth - 40
  const all = [...btnList.value]
  let index = 1
  const loopCheck = () => {
    if (index > all.length) return done()
    horizontalList.value = all.slice(0, index)
    nextTick(() => {
      const width = toolbarRef.value.getBoundingClientRect().width
      if (width < windowWidth) {
        index++
        loopCheck()
      } else if (index > 0 && width > windowWidth) {
        index--
        horizontalList.value = all.slice(0, index)
        done()
      }
    })
  }
  const done = () => {
    verticalList.value = all.slice(index)
    showMoreBtn.value = verticalList.value.length > 0
  }
  loopCheck()
}

/** 页面卸载前的处理 */
const onUnload = (e) => {
  if (waitingWriteToLocalFile.value) {
    const msg = '存在未保存的数据'
    e.returnValue = msg
    return msg
  }
}

watch(() => appStore.isHandleLocalFile, (val) => {
  if (!val) {
    MessagePlugin.closeAll()
  }
})
watch(btnList, () => {
  computeToolbarShow()
}, { deep: true })

const computeToolbarShowThrottle = throttle(computeToolbarShow, 300)
onMounted(() => {
  computeToolbarShow()
  window.addEventListener('resize', computeToolbarShowThrottle)
  // emitter.on('lang_change', computeToolbarShowThrottle)
  window.addEventListener('beforeunload', onUnload)
  // emitter.on('node_note_dblclick', onNodeNoteDblclick)
  // emitter.on('write_local_file', onWriteLocalFile)
  setEventHandler()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', computeToolbarShowThrottle)
  // emitter.off('lang_change', computeToolbarShowThrottle)
  window.removeEventListener('beforeunload', onUnload)
  // emitter.off('node_note_dblclick', onNodeNoteDblclick)
  // emitter.off('write_local_file', onWriteLocalFile)
  removeEventHandler()
})
</script>

<style lang="less" scoped>
.toolbarContainer {
  .toolbar {
    position: fixed;
    left: 50%;
    top: 20px;
    transform: translateX(-50%);
    width: max-content;
    display: flex;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    color: rgba(26, 26, 26, 0.8);
    z-index: 2;
    .toolbarBlock {
      display: flex;
      background-color: #fff;
      gap: 4px; // 图标按钮间隔
      padding: 5px 10px;
      border-radius: 6px;
      box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.06);
      margin-right: 20px;
      flex-shrink: 0;
      position: relative;
      &:last-of-type {
        margin-right: 0;
      }
      .fileTreeBox {
        position: absolute;
        left: 0;
        top: 68px;
        width: 100%;
        height: 30px;
        background-color: #fff;
        padding: 12px 5px;
        padding-top: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 5px;
        min-width: 200px;
        box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
        &.expand {
          height: 300px;
          .fileTreeWrap {
            visibility: visible;
          }
        }
        .fileTreeToolbar {
          width: 100%;
          height: 30px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e9e9e9;
          margin-bottom: 12px;
          padding-left: 12px;

          .fileTreeName {}

          .fileTreeActionList {
            .btn {
              font-size: 18px;
              margin-left: 12px;
              cursor: pointer;
            }
          }
        }
        .fileTreeWrap {
          width: 100%;
          height: 100%;
          overflow: auto;
          visibility: hidden;

          .customTreeNode {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            padding-right: 5px;

            .treeNodeInfo {
              display: flex;
              align-items: center;

              .treeNodeIcon {
                margin-right: 5px;
                opacity: 0.7;
              }

              .treeNodeName {
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }

            .treeNodeBtnList {
              display: flex;
              align-items: center;
            }
          }
        }
      }
    }
  }
}
</style>
