<template>
  <div
    class="editor-container"
    @dragenter.stop.prevent="handleDragEnter"
    @dragleave.stop.prevent="handleDragLeave"
    @dragover.stop.prevent="handleDragOver"
    @drop.stop.prevent="handleDrop"
  >
    <div class="mindMapContainer" id="mindMapContainer" ref="mindMapRef"></div>

    <Count v-if="!isZenMode" :mindMap="mindMap" />
    <NavigatorToolbar v-if="!isZenMode" :mindMap="mindMap" />
    <!-- <Navigator v-if="mindMap" :mindMap="mindMap"></Navigator>
    <OutlineSidebar :mindMap="mindMap"></OutlineSidebar>
    <Style v-if="mindMap && !editorState.isZenMode" :mindMap="mindMap"></Style>
    <BaseStyle :data="mindMapData" :configData="mindMapConfig" :mindMap="mindMap"></BaseStyle>
    <AssociativeLineStyle v-if="mindMap" :mindMap="mindMap"></AssociativeLineStyle>
    <Theme v-if="mindMap" :data="mindMapData" :mindMap="mindMap"></Theme>
    <Structure :mindMap="mindMap"></Structure>
    <ShortcutKey></ShortcutKey>
    <Contextmenu v-if="mindMap" :mindMap="mindMap"></Contextmenu>
    <RichTextToolbar v-if="mindMap" :mindMap="mindMap"></RichTextToolbar>
    <NodeNoteContentShow v-if="mindMap" :mindMap="mindMap"></NodeNoteContentShow>
    <NodeImgPreview v-if="mindMap" :mindMap="mindMap"></NodeImgPreview>
    <SidebarTrigger v-if="!editorState.isZenMode"></SidebarTrigger>
    <Search v-if="mindMap" :mindMap="mindMap"></Search>
    <NodeIconSidebar v-if="mindMap" :mindMap="mindMap"></NodeIconSidebar>
    <NodeIconToolbar v-if="mindMap" :mindMap="mindMap"></NodeIconToolbar>
    <OutlineEdit v-if="mindMap" :mindMap="mindMap"></OutlineEdit>
    <Scrollbar v-if="isShowScrollbar && mindMap" :mindMap="mindMap"></Scrollbar>
    <FormulaSidebar v-if="mindMap" :mindMap="mindMap"></FormulaSidebar>
    <NodeOuterFrame v-if="mindMap" :mindMap="mindMap"></NodeOuterFrame>
    <NodeTagStyle v-if="mindMap" :mindMap="mindMap"></NodeTagStyle>
    <Setting :configData="mindMapConfig" :mindMap="mindMap"></Setting>
    <NodeImgPlacementToolbar v-if="mindMap" :mindMap="mindMap"></NodeImgPlacementToolbar>
    <NodeNoteSidebar v-if="mindMap" :mindMap" :mindMap="mindMap"></NodeNoteSidebar>
    <AiCreate v-if="mindMap && editorState.enableAi" :mindMap="mindMap"></AiCreate>
    <AiChat v-if="editorState.enableAi"></AiChat> -->

    <!-- 拖拽遮罩 -->
    <div
      class="dragMask"
      v-if="showDragMask"
      @dragleave.stop.prevent="onDragLeave"
      @dragover.stop.prevent
      @drop.stop.prevent="onDrop"
    >
      <div class="dragTip">{{ $t('edit.dragTip') }}</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref, computed } from 'vue'
import emitter from '@/utils/eventBus.js'
import { showLoading } from '@/utils/loading'
import MindMap from 'simple-mind-map'
import appStore from '@/stores'
import usePluginManager from './hooks/usePluginManager.js'
import useMindMapCore from './hooks/useMindMapCore.js'
import useMindMapActions from './hooks/useMindMapActions.js'
import useDragAndDrop from './hooks/useDragAndDrop.js'
import Count from '@/pages/Edit/components/Count/index.vue'
import NavigatorToolbar from '@/pages/Edit/components/NavigatorToolbar/index.vue'

// 核心状态
// const mindMap = ref(null)
const mindMapRef = ref(null)
// const mindMapData = ref(null)
// const mindMapConfig = ref({})
const isInitialized = ref(false)
// === 状态管理 ===
// 基础配置
const isZenMode = computed(() => appStore.localConfig.isZenMode)
const openNodeRichText = computed(() => appStore.localConfig.openNodeRichText)
const isShowScrollbar = computed(() => appStore.localConfig.isShowScrollbar)
const enableDragImport = computed(() => appStore.localConfig.enableDragImport)
const useLeftKeySelectionRightKeyDrag = computed(
  () => appStore.localConfig.useLeftKeySelectionRightKeyDrag,
)
const extraTextOnExport = computed(() => appStore.extraTextOnExport)
const isDragOutlineTreeNode = computed(() => appStore.isDragOutlineTreeNode)
const enableAi = computed(() => appStore.localConfig.enableAi)

// 初始化插件管理
const {
  addRichTextPlugin,
  removeRichTextPlugin,
  addScrollbarPlugin,
  removeScrollbarPlugin,
  initPlugins,
  getPluginManager,
} = usePluginManager(MindMap, openNodeRichText, isShowScrollbar)

// 初始化思维导图核心功能
const { mindMap, mindMapData, mindMapConfig, getMindMapData, initMindMap, cleanup } =
  useMindMapCore(MindMap, initPlugins, useLeftKeySelectionRightKeyDrag, extraTextOnExport)

// 初始化思维导图操作方法
const {
  // 渲染控制
  reRender,
  handleResize,
  // 命令执行
  execCommand,
  // 数据操作
  manualSave,
  setData,
  // 导出功能
  exportMindMap,
  onPaddingChange,
  // 编辑器操作
  handleStartTextEdit,
  handleEndTextEdit,
  handleCreateLineFromActiveNode,
  handleStartPainter,
  // 加载状态控制
  handleShowLoading,
  handleHideLoading,
  // 错误处理
  onLocalStorageExceeded,
} = useMindMapActions(mindMap, openNodeRichText)

// 初始化拖拽功能
const {
  // 状态
  showDragMask,
  // 文件拖拽
  onDragEnter,
  onDragLeave,
  onDrop,
} = useDragAndDrop(enableDragImport, isDragOutlineTreeNode)

// === 生命周期钩子 ===
onMounted(async () => {
  showLoading()
  getMindMapData()
  const pluginManager = getPluginManager()
  pluginManager.setMindMapInstance(mindMap)
  initMindMap(mindMapRef, manualSave)

  // 监听事件
  emitter.on('execCommand', execCommand)
  emitter.on('paddingChange', onPaddingChange)
  emitter.on('export', exportMindMap)
  emitter.on('setData', setData)
  emitter.on('startTextEdit', handleStartTextEdit)
  emitter.on('endTextEdit', handleEndTextEdit)
  emitter.on('createAssociativeLine', handleCreateLineFromActiveNode)
  emitter.on('startPainter', handleStartPainter)
  emitter.on('node_tree_render_end', handleHideLoading)
  emitter.on('showLoading', handleShowLoading)
  emitter.on('localStorageExceeded', onLocalStorageExceeded)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 移除事件监听
  emitter.off('execCommand', execCommand)
  emitter.off('paddingChange', onPaddingChange)
  emitter.off('export', exportMindMap)
  emitter.off('setData', setData)
  emitter.off('startTextEdit', handleStartTextEdit)
  emitter.off('endTextEdit', handleEndTextEdit)
  emitter.off('createAssociativeLine', handleCreateLineFromActiveNode)
  emitter.off('startPainter', handleStartPainter)
  emitter.off('node_tree_render_end', handleHideLoading)
  emitter.off('showLoading', handleShowLoading)
  emitter.off('localStorageExceeded', onLocalStorageExceeded)
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.editor-container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: aquamarine;

  .dragMask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3999;

    .dragTip {
      pointer-events: none;
      font-weight: bold;
    }
  }

  .mindMapContainer {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
