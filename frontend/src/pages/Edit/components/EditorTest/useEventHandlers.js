import { t } from "@/locales";
import appStore from "@/stores";
import emitter from "@/utils/eventBus";
import { hideLoading, showLoading } from "@/utils/loading";
import { NotifyPlugin } from "tdesign-vue-next";
import { ref } from "vue";

/**
 * 处理事件绑定与解绑
 * @param {Ref<object>} mindMap
 * @param {Function} manualSave 手动保存函数
 * @returns
 */
export default function useEventHandlers(mindMap, manualSave) {
  const enableShowLoading = ref(true);
  /** 执行命令，每执行一个命令就会在历史堆栈里添加一条记录用于回退或前进 */
  const execCommand = (...args) => {
    mindMap.value.execCommand(...args);
  };

  /** 修改导出内边距 */
  const onPaddingChange = (data) => {
    mindMap.value.updateConfig(data);
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
    emitter.on("startTextEdit", handleStartTextEdit);
    emitter.on("endTextEdit", handleEndTextEdit);
    emitter.on("createAssociativeLine", handleCreateLineFromActiveNode);
    emitter.on("startPainter", handleStartPainter);
    emitter.on("node_tree_render_end", handleHideLoading);
    emitter.on("showLoading", handleShowLoading);
    emitter.on("localStorageExceeded", onLocalStorageExceeded);
    window.addEventListener("resize", handleResize);
  };

  /** 解绑事件 */
  const unbindEvents = () => {
    emitter.off("execCommand", execCommand);
    emitter.off("paddingChange", onPaddingChange);
    emitter.off("export", exportMap);
    emitter.off("setData", setData);
    emitter.off("startTextEdit", handleStartTextEdit);
    emitter.off("endTextEdit", handleEndTextEdit);
    emitter.off("createAssociativeLine", handleCreateLineFromActiveNode);
    emitter.off("startPainter", handleStartPainter);
    emitter.off("node_tree_render_end", handleHideLoading);
    emitter.off("showLoading", handleShowLoading);
    emitter.off("localStorageExceeded", onLocalStorageExceeded);
    window.removeEventListener("resize", handleResize);
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
