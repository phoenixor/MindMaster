<!-- pages/Edit/Edit.vue -->
<template>
  <div
    class="editContainer"
    @dragenter.stop.prevent="onDragEnter"
    @dragleave.stop.prevent
    @dragover.stop.prevent
    @drop.stop.prevent
  >
    <div class="mindMapContainer" id="mindMapContainer" ref="mindMapRef"></div>

    <Count v-if="!appStore.localConfig.isZenMode" :mindMap="mindMap" />
    <Navigator v-if="mindMap" :mindMap="mindMap" />
    <NavigatorToolbar
      v-if="!appStore.localConfig.isZenMode"
      :mindMap="mindMap"
    />
    <NodeStyleSidebar :mindMap="mindMap" />
    <Contextmenu v-if="mindMap" :mindMap="mindMap" />

    <!-- 拖拽遮罩 -->
    <div
      class="dragMask"
      v-if="showDragMask"
      @dragleave.stop.prevent="onDragLeave"
      @dragover.stop.prevent
      @drop.stop.prevent="onDrop"
    >
      <div class="dragTip">{{ $t("edit.dragTip") }}</div>
    </div>
  </div>
</template>

<script setup>
  import { useAppStore } from "@/stores";
  import { showLoading, hideLoading } from "@/utils/loading";
  import { onBeforeUnmount, onMounted, ref } from "vue";

  // 导入所有UI组件
  import Count from "../Count/index.vue";
  import Navigator from "../Navigator/index.vue";
  import NavigatorToolbar from "../NavigatorToolbar/index.vue";
  import NodeStyleSidebar from "../NodeStyleSidebar.vue";
  import Contextmenu from "../Contextmenu.vue";
  // import OutlineSidebar from './components/OutlineSidebar.vue'
  // import Style from './components/Style.vue'
  // import BaseStyle from './components/BaseStyle.vue'
  // import AssociativeLineStyle from './components/AssociativeLineStyle.vue'
  // import Theme from './components/Theme.vue'
  // import Structure from './components/Structure.vue'
  // import ShortcutKey from './components/ShortcutKey.vue'
  // import Contextmenu from './components/Contextmenu.vue'
  // import RichTextToolbar from './components/RichTextToolbar.vue'
  // import NodeNoteContentShow from './components/NodeNoteContentShow.vue'
  // import NodeImgPreview from './components/NodeImgPreview.vue'
  // import SidebarTrigger from './components/SidebarTrigger.vue'
  // import Search from './components/Search.vue'
  // import NodeIconSidebar from './components/NodeIconSidebar.vue'
  // import NodeIconToolbar from './components/NodeIconToolbar.vue'
  // import OutlineEdit from './components/OutlineEdit.vue'
  // import Scrollbar from './components/Scrollbar.vue'
  // import FormulaSidebar from './components/FormulaSidebar.vue'
  // import NodeOuterFrame from './components/NodeOuterFrame.vue'
  // import NodeTagStyle from './components/NodeTagStyle.vue'
  // import Setting from './components/Setting.vue'
  // import NodeImgPlacementToolbar from './components/NodeImgPlacementToolbar.vue'
  // import NodeNoteSidebar from './components/NodeNoteSidebar.vue'
  // import AiCreate from './components/AiCreate.vue'
  // import AiChat from './components/AiChat.vue'

  import useDragImport from "./useDragImport";
  import useEventHandlers from "./useEventHandlers";
  import useMindMap from "./useMindMap";
  import usePlugins from "./usePlugins";

  const mindMapRef = ref(null);
  const appStore = useAppStore();

  const {
    mindMap,
    mindMapData,
    mindMapConfig,
    loadDataConfig,
    initMindMap,
    manualSave,
    setData,
    execCommand,
    onPaddingChange,
    exportMap,
    reRender,
  } = useMindMap(mindMapRef);

  const { showDragMask, onDragEnter, onDragLeave, onDrop } = useDragImport();

  const {
    addRichTextPlugin,
    removeRichTextPlugin,
    addScrollbarPlugin,
    removeScrollbarPlugin,
  } = usePlugins(mindMap);
  const {
    // handleStartTextEdit,
    // handleEndTextEdit,
    // handleCreateLineFromActiveNode,
    // handleStartPainter,
    // handleResize,
    bindEvents,
    unbindEvents,
  } = useEventHandlers(mindMap, manualSave);

  const init = () => {
    try {
      initMindMap();
      // 加载插件
      if (appStore.localConfig.openNodeRichText) addRichTextPlugin();
      if (appStore.localConfig.isShowScrollbar) addScrollbarPlugin();
    } catch (error) {
      console.error("初始化思维导图失败:", error);
    }
  };

  onMounted(async () => {
    showLoading();

    await loadDataConfig();
    init();
    usePlugins(mindMap);
    bindEvents();

    hideLoading();
  });

  onBeforeUnmount(() => {
    if (mindMap.value) {
      unbindEvents();
      mindMap.value.destroy();
    }
  });
</script>

<style lang="less" scoped>
  .editContainer {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

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
