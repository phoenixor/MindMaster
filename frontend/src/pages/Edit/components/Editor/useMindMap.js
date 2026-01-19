import { getConfig, getData, storeData } from "@/api";
import imgLoadFailSvg from "@/assets/img/imgLoadFailed.svg";
import exampleData from "@/config/exampleData";
import icon from "@/config/icon";
import { useAppStore } from "@/stores";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/files";
import emitter from "@/utils/eventBus";
import handleClipboardText from "@/utils/handleClipboardText";
import MindMap from "simple-mind-map";
import { DialogPlugin, MessagePlugin, NotifyPlugin } from "tdesign-vue-next";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { getFile, updateFileData } from "@/api/files";
import { queueFileSave } from "@/utils/fileSync";

// 注册插件
import Themes from "simple-mind-map-plugin-themes";
import AssociativeLine from "simple-mind-map/src/plugins/AssociativeLine.js";
import Demonstrate from "simple-mind-map/src/plugins/Demonstrate.js";
import Drag from "simple-mind-map/src/plugins/Drag.js";
import Export from "simple-mind-map/src/plugins/Export.js";
import ExportPDF from "simple-mind-map/src/plugins/ExportPDF.js";
import ExportXMind from "simple-mind-map/src/plugins/ExportXMind.js";
import Formula from "simple-mind-map/src/plugins/Formula.js";
import KeyboardNavigation from "simple-mind-map/src/plugins/KeyboardNavigation.js";
import MindMapLayoutPro from "simple-mind-map/src/plugins/MindMapLayoutPro.js";
import MiniMap from "simple-mind-map/src/plugins/MiniMap.js";
import NodeBase64ImageStorage from "simple-mind-map/src/plugins/NodeBase64ImageStorage.js";
import NodeImgAdjust from "simple-mind-map/src/plugins/NodeImgAdjust.js";
import OuterFrame from "simple-mind-map/src/plugins/OuterFrame.js";
import Painter from "simple-mind-map/src/plugins/Painter.js";
import RainbowLines from "simple-mind-map/src/plugins/RainbowLines.js";
import SearchPlugin from "simple-mind-map/src/plugins/Search.js";
import Select from "simple-mind-map/src/plugins/Select.js";
import TouchEvent from "simple-mind-map/src/plugins/TouchEvent.js";
import Watermark from "simple-mind-map/src/plugins/Watermark.js";

// 需要在实例化MindMap前注册插件
MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(Drag)
  .usePlugin(KeyboardNavigation)
  .usePlugin(ExportPDF)
  .usePlugin(ExportXMind)
  .usePlugin(Export)
  .usePlugin(Select)
  .usePlugin(AssociativeLine)
  .usePlugin(NodeImgAdjust)
  .usePlugin(TouchEvent)
  .usePlugin(SearchPlugin)
  .usePlugin(Painter)
  .usePlugin(Formula)
  .usePlugin(RainbowLines)
  .usePlugin(Demonstrate)
  .usePlugin(OuterFrame)
  .usePlugin(MindMapLayoutPro)
  .usePlugin(NodeBase64ImageStorage);

// 注册主题
Themes.init(MindMap);

/**
 * 主要用于思维导图的加载、初始化、数据存储等功能
 * @param {Ref<object>} mindMapRef
 * @returns
 */
export default function useMindMap(mindMapRef) {
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const fileStore = useFileStore();
  const route = useRoute();
  const mindMap = ref(null);
  const activeNodes = ref([]);
  const mindMapData = ref(null);
  const mindMapConfig = ref({});
  const storeConfigTimer = ref(null);
  const idleSaveTimer = ref(null);
  let isDirty = false;
  const IDLE_SAVE_MS = 20000;

  const onNodeActive = (...args) => {
    const list = Array.isArray(args[1])
      ? args[1]
      : Array.isArray(args[0])
      ? args[0]
      : [];
    activeNodes.value = list.filter(Boolean);
  };

  const toggleBoldStyle = () => {
    if (!activeNodes.value.length || !mindMap.value) {
      return;
    }
    const shouldBold = activeNodes.value.some((node) => {
      const weight = node.getStyle ? node.getStyle("fontWeight", false) : "";
      return weight !== "bold";
    });
    activeNodes.value.forEach((node) => {
      if (node && node.setStyle) {
        node.setStyle("fontWeight", shouldBold ? "bold" : "normal");
      }
    });
    emitter.emit("node_style_changed");
  };

  /** url中是否存在要打开的文件 */
  const hasFileURL = () => {
    const fileURL = route.query.fileURL;
    if (!fileURL) return false;
    // return /\.(smm|json|xmind|md|xlsx)$/.test(fileURL)
    //TODO ImportFile组件中只检查以下四种格式，没有xlsx
    return /\.(smm|json|xmind|md)$/.test(fileURL);
  };
  /**
   * 初始化思维导图。⚠️这里只做思维导图相关的初始化，其他初始化在index.vue的init函数中
   */
  const initMindMap = () => {
    const fileUrlExists = hasFileURL();
    let { root, layout, theme, view } = mindMapData.value;
    const config = mindMapConfig.value;
    // 如果url中存在要打开的文件，那么思维导图数据、主题、布局都使用默认的
    if (fileUrlExists) {
      root = {
        data: {
          text: "根节点",
        },
        children: [],
      };
      layout = exampleData.layout;
      theme = exampleData.theme;
      view = null;
    }

    mindMap.value = new MindMap({
      el: mindMapRef.value,
      data: root,
      fit: false,
      layout: layout,
      theme: theme.template,
      themeConfig: theme.config,
      viewData: view,
      nodeTextEditZIndex: 1000,
      nodeNoteTooltipZIndex: 1000,
      customNoteContentShow: {
        show: (content, left, top, node) => {
          emitter.emit("showNoteContent", content, left, top, node);
        },
        hide: () => emitter.emit("hideNoteContent"),
      },
      openRealtimeRenderOnNodeTextEdit: true,
      enableAutoEnterTextEditWhenKeydown: true,
      beforeDragStart: (nodeList) => {
        return nodeList.some((node) => {
          return !node || !node.getData || !node.getData("isFreeNode");
        });
      },
      demonstrateConfig: {
        openBlankMode: false,
      },
      ...(config || {}),
      iconList: [...icon],
      useLeftKeySelectionRightKeyDrag:
        appStore.localConfig.useLeftKeySelectionRightKeyDrag,
      customInnerElsAppendTo: null,
      customHandleClipboardText: handleClipboardText,
      defaultNodeImage: imgLoadFailSvg,
      initRootNodePosition: ["center", "center"],
      // 粘贴文本的方式创建新节点时，控制是否按换行自动分割节点，即如果存在换行，那么会根据换行创建多个节点，否则只会创建一个节点
      handleIsSplitByWrapOnPasteCreateNewNode: () => {
        return new Promise((resolve, reject) => {
          const confirmDia = DialogPlugin.confirm({
            header: t("edit.tip"),
            body: t("edit.splitByWrap"),
            confirmBtn: t("edit.yes"),
            cancelBtn: t("edit.no"),
            theme: "warning",
            onConfirm: ({ e }) => {
              resolve(true);
              confirmDia.destroy();
            },
            onCancel: ({ e }) => {
              reject(false);
              confirmDia.destroy();
            },
          });
        });
      },
      errorHandler: (code, err) => {
        console.error(err);
        switch (code) {
          case "export_error":
            MessagePlugin.error(t("edit.exportError"));
            break;
          default:
            break;
        }
      },
      // 底部水印文字
      addContentToFooter: () => {
        const text = appStore.extraTextOnExport.trim();
        if (!text) return null;
        const el = document.createElement("div");
        el.className = "footer";
        el.innerHTML = text;
        const cssText = `
          .footer {
            width: 100%;
            height: 50px;
            background-color: transparent;
            display: flex;
            justify-content: center;
            align-items: flex-end;
            font-size: 12px;
            color: #979797;
          }
        `;
        return {
          el,
          cssText,
          height: 50, // 要跟cssText中的height一致
        };
      },
      expandBtnNumHandler: (num) => {
        return num >= 100 ? "…" : num;
      },
      // 拦截节点图片的删除，点击节点图片上的删除按钮删除图片前会调用该函数
      beforeDeleteNodeImg: (node) => {
        return new Promise((resolve) => {
          const confirmDia = DialogPlugin.confirm({
            header: t("edit.tip"),
            body: t("edit.deleteNodeImgTip"),
            confirmBtn: t("edit.yes"),
            cancelBtn: t("edit.no"),
            theme: "warning",
            onConfirm: ({ e }) => {
              resolve(false);
              confirmDia.destroy();
            },
            onCancel: ({ e }) => {
              resolve(true);
              confirmDia.destroy();
            },
          });
        });
      },
    });
    // 绑定快捷键
    mindMap.value.keyCommand.addShortcut("Control+s", () => {
      manualSave();
    });
    mindMap.value.keyCommand.addShortcut("Control+b", () => {
      toggleBoldStyle();
    });

    // mindMap实例事件列表
    // https://wanglin2.github.io/mind-map-docs/api/constructor/constructor-methods.html#on-event-fn
    const events = [
      "node_active",
      "data_change", // 渲染树数据变化，可以监听该方法获取最新数据
      "view_data_change", // 视图变化数据，比如拖动或缩放时会触发
      "back_forward",
      "node_contextmenu",
      "node_click",
      "draw_click",
      "expand_btn_click",
      "svg_mousedown",
      "mouseup",
      "mode_change",
      "node_tree_render_end",
      "rich_text_selection_change",
      "transforming-dom-to-images",
      "generalization_node_contextmenu",
      "painter_start",
      "painter_end",
      "scrollbar_change",
      "scale",
      "translate",
      "node_attachmentClick",
      "node_attachmentContextmenu",
      "demonstrate_jump",
      "exit_demonstrate",
      "node_note_dblclick",
      "node_mousedown",
    ];
    events.forEach((event) => {
      // 监听事件
      mindMap.value.on(event, (...args) => {
        emitter.emit(event, ...args);
      });
    });
    emitter.on("node_active", onNodeActive);
    bindSaveEvent();
    // 处理url中支持格式的文件
    if (fileUrlExists) {
      emitter.emit("handle_file_url");
    }
  };

  /** 加载数据和配置 */
  const loadDataConfig = async () => {
    const fileIdFromRoute = route.query.fileId;
    let targetFileId = fileIdFromRoute || fileStore.currentFileId;
    if (authStore.isLoggedIn && targetFileId) {
      try {
        const fileDetail = await getFile(targetFileId);
        fileStore.setCurrentFileId(fileDetail.id);
        mindMapData.value = fileDetail.data;
      } catch (error) {
        console.error(error);
        mindMapData.value = getData();
      }
    } else {
      mindMapData.value = getData();
    }
    mindMapConfig.value = getConfig() || {};
  };
  /** 监听数据变化，存储数据 */
  const bindSaveEvent = () => {
    const markDirty = () => {
      isDirty = true;
      clearTimeout(idleSaveTimer.value);
      idleSaveTimer.value = setTimeout(async () => {
        if (!isDirty || !mindMap.value) return;
        if (authStore.isLoggedIn && fileStore.currentFileId) {
          try {
            await updateFileData(fileStore.currentFileId, {
              data: mindMap.value.getData(true),
            });
            isDirty = false;
          } catch (error) {
            MessagePlugin.error(error.message || "自动保存失败");
          }
        }
      }, IDLE_SAVE_MS);
    };
    emitter.on("data_change", (data) => {
      storeData({ root: data });
      markDirty();
      if (authStore.isLoggedIn && fileStore.currentFileId) {
        queueFileSave(fileStore.currentFileId, mindMap.value.getData(true));
      }
    });
    emitter.on("view_data_change", (data) => {
      clearTimeout(storeConfigTimer.value);
      storeConfigTimer.value = setTimeout(() => {
        storeData({
          view: data,
        });
        markDirty();
        if (authStore.isLoggedIn && fileStore.currentFileId) {
          queueFileSave(fileStore.currentFileId, mindMap.value.getData(true));
        }
      }, 300);
    });
  };


  /** 手动保存数据 */
  const manualSave = () => {
    storeData(mindMap.value.getData(true));
    isDirty = false;
    if (authStore.isLoggedIn && fileStore.currentFileId) {
      updateFileData(fileStore.currentFileId, {
        data: mindMap.value.getData(true),
      })
        .then(() => {
          NotifyPlugin.success({
            title: "保存成功",
            content: "已同步到云端",
          });
        })
        .catch((error) => {
          MessagePlugin.error(error.message || "保存失败");
        });
    } else {
      MessagePlugin.warning("请先从文件列表创建或打开文件");
    }
  };

  /** 整体重新渲染，会清空画布，节点也会重新创建，性能不好，慎重使用 */
  const reRender = () => {
    mindMap.value.reRender();
  };

  return {
    mindMap,
    mindMapData,
    mindMapConfig,
    loadDataConfig,
    initMindMap,
    manualSave,
    // execCommand,
    // onPaddingChange,
    // exportMap,
    // setData,
    reRender,
  };
}
