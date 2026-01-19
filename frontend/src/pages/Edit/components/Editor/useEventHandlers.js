import { t } from "@/locales";
import { useAppStore } from "@/stores";
import emitter from "@/utils/eventBus";
import { hideLoading, showLoading } from "@/utils/loading";
import { NotifyPlugin } from "tdesign-vue-next";
import { ref } from "vue";
import { createUid } from "simple-mind-map/src/utils";
import { getConfig, storeConfig } from "@/api";

/**
 * 处理事件绑定与解绑
 * @param {Ref<object>} mindMap
 * @param {Function} manualSave 手动保存函数
 * @returns
 */
export default function useEventHandlers(mindMap, manualSave) {
  const appStore = useAppStore();
  const enableShowLoading = ref(true);
  let pendingFreeNode = null;
  let expandAnchor = null;
  let svgNode = null;
  /** 执行命令，每执行一个命令就会在历史堆栈里添加一条记录用于回退或前进 */
  const execCommand = (...args) => {
    mindMap.value.execCommand(...args);
  };

  /** 修改导出内边距 */
  const onPaddingChange = (data) => {
    mindMap.value.updateConfig(data);
  };

  const getCanvasPoint = (clientX, clientY) => {
    const { x, y } = mindMap.value.toPos(clientX, clientY);
    const { scaleX, scaleY, translateX, translateY } =
      mindMap.value.draw.transform();
    return {
      x: (x - translateX) / scaleX,
      y: (y - translateY) / scaleY,
    };
  };

  const getCanvasCenter = () => {
    const rect = mindMap.value.el.getBoundingClientRect();
    return getCanvasPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  };

  const applyFreeNodeStyle = (node, position) => {
    if (!node) {
      return;
    }
    const left = position.x - node.width / 2;
    const top = position.y - node.height / 2;
    mindMap.value.execCommand("SET_NODE_CUSTOM_POSITION", node, left, top);
    node.setStyle("lineWidth", 0);
    node.setStyle("lineColor", "transparent");
  };

  const onNodeTreeRenderEnd = () => {
    if (!mindMap.value) {
      return;
    }
    if (pendingFreeNode) {
      const { uid, position } = pendingFreeNode;
      const node = mindMap.value.renderer.findNodeByUid(uid);
      applyFreeNodeStyle(node, position);
      pendingFreeNode = null;
    }
    if (expandAnchor) {
      const node = mindMap.value.renderer.findNodeByUid(expandAnchor.uid);
      if (node) {
        const { scaleX, scaleY, translateX, translateY } =
          mindMap.value.draw.transform();
        const nextX = node.left * scaleX + translateX;
        const nextY = node.top * scaleY + translateY;
        const dx = expandAnchor.x - nextX;
        const dy = expandAnchor.y - nextY;
        if (dx || dy) {
          mindMap.value.view.translateXY(dx, dy);
        }
      }
      expandAnchor = null;
    }
  };

  const onExpandBtnClick = (node) => {
    if (!mindMap.value || !node || node.getData?.("isFreeNode")) {
      return;
    }
    const { scaleX, scaleY, translateX, translateY } =
      mindMap.value.draw.transform();
    expandAnchor = {
      uid: node.getData?.("uid") || node.uid,
      x: node.left * scaleX + translateX,
      y: node.top * scaleY + translateY,
    };
  };

  const createFreeNode = (options = {}) => {
    if (!mindMap.value || appStore.isReadonly) {
      return;
    }
    if (!mindMap.value.getConfig("enableFreeDrag")) {
      mindMap.value.updateConfig({ enableFreeDrag: true });
      const config = getConfig() || {};
      storeConfig({
        ...config,
        enableFreeDrag: true,
      });
    }
    const position =
      typeof options.clientX === "number" && typeof options.clientY === "number"
        ? getCanvasPoint(options.clientX, options.clientY)
        : getCanvasCenter();
    const uid = createUid();
    pendingFreeNode = { uid, position };
    const root = mindMap.value.renderer.root;
    mindMap.value.execCommand("INSERT_CHILD_NODE", false, [root], {
      text: t("edit.freeNodeDefaultText"),
      uid,
      isFreeNode: true,
    });
  };

  const onDrawDblclick = (event) => {
    if (!mindMap.value || appStore.isReadonly) {
      return;
    }
    const target = event.target;
    if (target && target.closest && target.closest(".smm-node")) {
      return;
    }
    createFreeNode({
      clientX: event.clientX,
      clientY: event.clientY,
    });
  };

  /** 导出，需要先注册Export插件 */
  const exportMap = async (...args) => {
    try {
      showLoading();
      await mindMap.value.export(...args);
    } catch (error) {
      console.error(error);
    } finally {
      hideLoading();
    }
  };

  /** 动态设置思维导图数据 */
  const setData = (data) => {
    let rootNodeData = null;
    if (data.root) {
      mindMap.value.setFullData(data);
      rootNodeData = data.root;
    } else {
      mindMap.value.setData(data);
      rootNodeData = data;
    }
    mindMap.value.view.reset();
    manualSave();
    // 如果导入的是富文本内容，那么自动开启富文本模式
    if (rootNodeData.data.richText && !appStore.localConfig.openNodeRichText) {
      emitter.emit("toggleOpenNodeRichText", true);
      NotifyPlugin.info({
        title: t("edit.tip"),
        content: t("edit.autoOpenNodeRichTextTip"),
      });
    }
  };
  // 处理文本编辑开始
  const handleStartTextEdit = () => {
    mindMap.value.renderer.startTextEdit();
  };
  // 处理文本编辑结束
  const handleEndTextEdit = () => {
    mindMap.value.renderer.endTextEdit();
  };
  // 处理创建关联线
  const handleCreateLineFromActiveNode = () => {
    mindMap.value.associativeLine.createLineFromActiveNode();
  };
  // 处理启动画笔
  const handleStartPainter = () => {
    mindMap.value.painter.startPainter();
  };
  // 渲染结束后关闭loading
  const handleHideLoading = () => {
    if (enableShowLoading.value) {
      enableShowLoading.value = false;
      hideLoading();
    }
  };
  // 显示loading
  const handleShowLoading = () => {
    enableShowLoading.value = true;
    showLoading();
  };
  // 处理本地存储超出限制
  const onLocalStorageExceeded = () => {
    NotifyPlugin.warning({
      title: t("edit.tip"),
      content: t("edit.localStorageExceededTip"),
    });
  };
  // 处理窗口大小调整
  const handleResize = () => {
    mindMap.value.resize();
  };

  /** 绑定事件 */
  const bindEvents = () => {
    emitter.on("execCommand", execCommand);
    emitter.on("paddingChange", onPaddingChange);
    emitter.on("export", exportMap);
    emitter.on("setData", setData);
    emitter.on("create_free_node", createFreeNode);
    emitter.on("startTextEdit", handleStartTextEdit);
    emitter.on("endTextEdit", handleEndTextEdit);
    emitter.on("createAssociativeLine", handleCreateLineFromActiveNode);
    emitter.on("startPainter", handleStartPainter);
    emitter.on("node_tree_render_end", handleHideLoading);
    emitter.on("node_tree_render_end", onNodeTreeRenderEnd);
    emitter.on("expand_btn_click", onExpandBtnClick);
    emitter.on("showLoading", handleShowLoading);
    emitter.on("localStorageExceeded", onLocalStorageExceeded);
    window.addEventListener("resize", handleResize);
    svgNode = mindMap.value?.svg?.node || null;
    if (svgNode) {
      svgNode.addEventListener("dblclick", onDrawDblclick);
    }
  };

  /** 解绑事件 */
  const unbindEvents = () => {
    emitter.off("execCommand", execCommand);
    emitter.off("paddingChange", onPaddingChange);
    emitter.off("export", exportMap);
    emitter.off("setData", setData);
    emitter.off("create_free_node", createFreeNode);
    emitter.off("startTextEdit", handleStartTextEdit);
    emitter.off("endTextEdit", handleEndTextEdit);
    emitter.off("createAssociativeLine", handleCreateLineFromActiveNode);
    emitter.off("startPainter", handleStartPainter);
    emitter.off("node_tree_render_end", handleHideLoading);
    emitter.off("node_tree_render_end", onNodeTreeRenderEnd);
    emitter.off("expand_btn_click", onExpandBtnClick);
    emitter.off("showLoading", handleShowLoading);
    emitter.off("localStorageExceeded", onLocalStorageExceeded);
    window.removeEventListener("resize", handleResize);
    if (svgNode) {
      svgNode.removeEventListener("dblclick", onDrawDblclick);
      svgNode = null;
    }
  };

  return {
    // handleStartTextEdit,
    // handleEndTextEdit,
    // handleCreateLineFromActiveNode,
    // handleStartPainter,
    // handleResize,
    bindEvents,
    unbindEvents,
  };
}
