import { useAppStore } from "@/stores";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/files";
import emitter from "@/utils/eventBus.js";
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  HomeIcon,
  RollbackIcon,
  RollfrontIcon,
  BrushIcon,
  TreeSquareDotVerticalIcon,
  GitMergeIcon,
  DeleteIcon,
  ImageIcon,
  CrookedSmileIcon,
  LinkIcon,
  PenIcon,
  TagIcon,
  AppIcon,
  MapConnectionIcon,
  PiIcon,
  AttachIcon,
  Transform1Icon,
  TextboxIcon,
  LogoAdobeIllustrateIcon,
  SaveIcon,
  FileImportIcon,
  FileExportIcon,
  UploadIcon,
  DownloadIcon,
} from "tdesign-icons-vue-next";
import { getData } from "@/api";
import { LoadingPlugin, NotifyPlugin, MessagePlugin } from "tdesign-vue-next";
import { t } from "@/locales";
import exampleData from "@/config/exampleData";
import { useRouter } from "vue-router";
import { getFile, updateFileData } from "@/api/files";

/**
 * 工具栏相关信息hooks
 * 封装工具栏按钮的状态管理、事件处理和禁用条件逻辑
 */
export default function useToolbar() {
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const fileStore = useFileStore();
  const router = useRouter();
  const activeNodes = ref([]);
  const backEnd = ref(true);
  const forwardEnd = ref(true);
  const readonly = ref(false);
  const isInPainter = ref(false); // 格式刷

  const fileTreeVisible = ref(false);
  const rootDirName = ref("");
  const fileTreeExpand = ref(true);
  const waitingWriteToLocalFile = ref(false);
  const isFullDataFile = ref(false);

  let fileHandle = null;

  /** 左侧按钮列表 */
  const leftBtnList = computed(() => [
    {
      name: "index",
      icon: HomeIcon,
      label: "首页",
      handler: () => router.replace("/"),
    },
    {
      name: "back",
      icon: RollbackIcon,
      label: "回退",
      disabled: appStore.isReadonly || backEnd.value,
      handler: () => emitter.emit("execCommand", "BACK"),
    },
    {
      name: "forward",
      icon: RollfrontIcon,
      label: "前进",
      disabled: appStore.isReadonly || forwardEnd.value,
      handler: () => emitter.emit("execCommand", "FORWARD"),
    },
    {
      name: "painter",
      icon: BrushIcon,
      label: "格式刷",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      active: isInPainter.value,
      handler: () => emitter.emit("startPainter"),
    },
    {
      name: "siblingNode",
      icon: TreeSquareDotVerticalIcon,
      label: "同级节点",
      disabled:
        activeNodes.value.length <= 0 ||
        hasRoot.value ||
        hasGeneralization.value,
      handler: () => emitter.emit("execCommand", "INSERT_NODE"),
    },
    {
      name: "childNode",
      icon: GitMergeIcon,
      label: "子节点",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      handler: () => emitter.emit("execCommand", "INSERT_CHILD_NODE"),
    },
    {
      name: "deleteNode",
      icon: DeleteIcon,
      label: "删除节点",
      disabled: activeNodes.value.length <= 0,
      handler: () => emitter.emit("execCommand", "REMOVE_NODE"),
    },
    // {
    //   name: "image",
    //   icon: ImageIcon,
    //   label: "图片",
    //   disabled: activeNodes.value.length <= 0,
    //   handler: () => emitter.emit("showNodeImage"),
    // },
    // {
    //   name: "icon",
    //   icon: CrookedSmileIcon,
    //   label: "图标",
    //   disabled: activeNodes.value.length <= 0,
    //   handler: () => showNodeIconSidebar,
    // },
    // {
    //   name: "link",
    //   icon: LinkIcon,
    //   label: "超链接",
    //   disabled: activeNodes.value.length <= 0,
    //   handler: () => emitter.emit("showNodeLink"),
    // },
    // {
    //   name: "note",
    //   icon: PenIcon,
    //   label: "备注",
    //   disabled: activeNodes.value.length <= 0,
    //   handler: () => emitter.emit("showNodeNote"),
    // },
    // {
    //   name: "tag",
    //   icon: TagIcon,
    //   label: "标签",
    //   disabled: activeNodes.value.length <= 0,
    //   handler: () => emitter.emit("showNodeTag"),
    // },
    {
      name: "summary",
      icon: AppIcon,
      label: "概要",
      disabled:
        activeNodes.value.length <= 0 ||
        hasRoot.value ||
        hasGeneralization.value,
      handler: () => emitter.emit("execCommand", "ADD_GENERALIZATION"),
    },
    {
      name: "associativeLine",
      icon: MapConnectionIcon,
      label: "关联线",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      handler: () => emitter.emit("createAssociativeLine"),
    },
    // {
    //   name: "formula",
    //   icon: PiIcon,
    //   label: "公式",
    //   disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
    //   handler: () => showFormulaSidebar,
    // },
    // {
    //   name: "attachment",
    //   icon: AttachIcon,
    //   label: "附件",
    //   disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
    //   handler: () => selectAttachmentFile,
    // },
    {
      name: "outerFrame",
      icon: Transform1Icon,
      label: "外框",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      handler: () => emitter.emit("execCommand", "ADD_OUTER_FRAME"),
    },
    // {
    //   name: "annotation",
    //   icon: TextboxIcon,
    //   label: "注释",
    //   handler: () => onSetAnnotation,
    // },
    // {
    //   name: "ai",
    //   icon: LogoAdobeIllustrateIcon,
    //   label: "AI",
    //   disabled: hasGeneralization.value,
    //   //TODO ai功能待实现
    //   handler: () => {},
    // },
  ]);

  /** 右侧按钮列表 */
  const rightBtnList = computed(() => [
    {
      name: "cloudPush",
      icon: UploadIcon,
      label: "云端同步",
      tip: "将当前数据同步到云端",
      handler: async () => {
        if (!authStore.isLoggedIn) {
          emitter.emit("open_auth_dialog");
          return;
        }
        if (!fileStore.currentFileId) {
          MessagePlugin.warning("请先从文件列表创建或打开文件");
          return;
        }
        try {
          await updateFileData(fileStore.currentFileId, {
            data: getData(),
          });
          NotifyPlugin.success({
            title: "云端同步",
            content: "同步成功",
          });
        } catch (error) {
          NotifyPlugin.error({
            title: "云端同步失败",
            content: error.message || "请稍后重试",
          });
        }
      },
    },
    {
      name: "cloudPull",
      icon: DownloadIcon,
      label: "云端拉取",
      tip: "从云端拉取最新数据",
      handler: async () => {
        if (!authStore.isLoggedIn) {
          emitter.emit("open_auth_dialog");
          return;
        }
        if (!fileStore.currentFileId) {
          MessagePlugin.warning("请先从文件列表创建或打开文件");
          return;
        }
        try {
          const res = await getFile(fileStore.currentFileId);
          emitter.emit("setData", res.data);
          NotifyPlugin.success({
            title: "云端同步",
            content: "已拉取云端数据",
          });
        } catch (error) {
          NotifyPlugin.error({
            title: "云端同步失败",
            content: error.message || "请稍后重试",
          });
        }
      },
    },
    {
      name: "saveLocalFile",
      icon: SaveIcon,
      label: "保存工程",
      tip: "保存当前工程文件到本地，以便下次继续编辑",
      handler: saveLocalFile,
    },
    {
      name: "showImport",
      icon: FileImportIcon,
      label: "导入",
      tip: "从本地导入smm、json、xmind、md格式文件",
      handler: () => emitter.emit("showImport"),
    },
    {
      name: "showExport",
      icon: FileExportIcon,
      label: "导出",
      tip: "支持导出为图片、xmind、markdown等多种格式",
      handler: () => emitter.emit("showExport"),
    },
  ]);

  const hasRoot = computed(() => {
    return activeNodes.value.findIndex((node) => node.isRoot) !== -1;
  });
  // 概要
  const hasGeneralization = computed(() => {
    return activeNodes.value.findIndex((node) => node.isGeneralization) !== -1;
  });

  const btnList = computed(() => {
    let res = leftBtnList.value.map((item) => item.name);
    if (!appStore.localConfig.openNodeRichText) {
      res = res.filter((item) => {
        return item !== "formula";
      });
    }
    if (!appStore.localConfig.enableAi) {
      res = res.filter((item) => {
        return item !== "ai";
      });
    }
    return res;
  });

  // 注释
  const annotationRightHasBtn = computed(() => {
    const index = btnList.findIndex((item) => {
      return item === "annotation";
    });
    return index !== -1 && index < btnList.length - 1;
  });
  /** 显示节点图标侧边栏 */
  const showNodeIconSidebar = () => {
    emitter.emit("close_node_icon_toolbar");
    appStore.setActiveSidebar("nodeIconSidebar");
  };
  /** 打开公式侧边栏 */
  const showFormulaSidebar = () => appStore.setActiveSidebar("formulaSidebar");
  /** 选择附件 */
  const selectAttachmentFile = () =>
    emitter.emit("selectAttachment", activeNodes.value);
  /** 设置标记 */
  const onSetAnnotation = (...args) =>
    emitter.emit("execCommand", "SET_NOTATION", activeNodes.value, ...args);
  /** AI生成整体 */
  const aiCreate = () => emitter.emit("ai_create_all");

  /**
   * 监听模式切换
   * @param {string} mode - 模式名称，'readonly' 或其他
   */
  const onModeChange = (mode) => appStore.setIsReadonly(mode === "readonly");
  /**
   * 监听节点激活
   * !官方vue2版本中这个回调接收两个参数，vue3中只接收到第二个，并且未激活时是[null]，官方是[]
   * @param {Array} args - 事件参数，this（节点实例）、activeNodeList（当前激活的所有节点列表）
   */
  const onNodeActive = (...args) => {
    activeNodes.value = args[0] === null ? [] : args;
  };

  /**
   * 监听前进后退
   * @param {number} index - activeHistoryIndex（当前在历史数据数组里的索引）
   * @param {number} len - length（当前历史数据数组的长度）
   */
  const onBackForward = (index, len) => {
    backEnd.value = index <= 0;
    forwardEnd.value = index >= len - 1;
  };
  /** 开始格式刷 */
  const onPainterStart = () => (isInPainter.value = true);
  /** 结束格式刷 */
  const onPainterEnd = () => (isInPainter.value = false);

  /** 写入本地文件 */
  const writeLocalFile = async (content) => {
    if (!fileHandle || !appStore.isHandleLocalFile) {
      waitingWriteToLocalFile.value = false;
      return;
    }
    if (!isFullDataFile.value) {
      content = content.root;
    }
    let string = JSON.stringify(content);
    const writable = await fileHandle.createWritable();
    await writable.write(string);
    await writable.close();
    waitingWriteToLocalFile.value = false;
  };
  /** 另存为 */
  const saveLocalFile = async () => await createLocalFile(getData());
  /** 创建本地文件 */
  const createLocalFile = async (content) => {
    try {
      let _fileHandle = await window.showSaveFilePicker({
        types: [
          {
            description: "",
            accept: { "application/json": [".smm"] },
          },
        ],
        suggestedName: t("toolbar.defaultFileName"),
      });
      if (!_fileHandle) {
        return;
      }
      const loading = LoadingPlugin({
        text: t("toolbar.creatingTip"),
      });
      fileHandle = _fileHandle;
      appStore.setIsHandleLocalFile(true);
      isFullDataFile.value = true;
      await writeLocalFile(content);
      await readFile();
      loading.hide();
    } catch (error) {
      console.error(error);
      if (error.toString().includes("aborted")) {
        return;
      }
      MessagePlugin.warning(t("toolbar.notSupportTip"));
    }
  };

  /** 加载本地文件树 */
  const loadFileTreeNode = async (node, resolve) => {
    try {
      let dirHandle;
      if (node.level === 0) {
        dirHandle = await window.showDirectoryPicker();
        rootDirName.value = dirHandle.name;
      } else {
        dirHandle = node.data.handle;
      }
      const dirList = [];
      const fileList = [];
      for await (const [key, value] of dirHandle.entries()) {
        const isFile = value.kind === "file";
        if (isFile && !/\.(smm|xmind|md|json)$/.test(value.name)) {
          continue;
        }
        const enableEdit = isFile && /\.smm$/.test(value.name);
        const data = {
          id: key,
          name: value.name,
          type: value.kind,
          handle: value,
          leaf: isFile,
          enableEdit,
        };
        if (isFile) {
          fileList.push(data);
        } else {
          dirList.push(data);
        }
      }
      resolve([...dirList, ...fileList]);
    } catch (error) {
      console.error(error);
      fileTreeVisible.value = false;
      resolve([]);
      if (error.toString().includes("aborted")) {
        return;
      }
      MessagePlugin.warning(t("toolbar.notSupportTip"));
    }
  };
  /** 扫描本地文件夹 */
  const openDirectory = () => {
    fileTreeVisible.value = false;
    fileTreeExpand.value = true;
    rootDirName.value = "";
    nextTick(() => {
      fileTreeVisible.value = true;
    });
  };
  /** 编辑本地文件 */
  const editLocalFile = (data) => {
    if (data.handle) {
      fileHandle = data.handle;
      readFile();
    }
  };
  /** 导入指定文件 */
  const importLocalFile = async (data) => {
    try {
      const file = await data.handle.getFile();
      ImportRef.value.onChange({
        raw: file,
        name: file.name,
      });
      ImportRef.value.confirm();
    } catch (error) {
      console.error(error);
    }
  };
  /** 打开本地文件 */
  const openLocalFile = async () => {
    try {
      let [_fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "",
            accept: {
              "application/json": [".smm"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      });
      if (!_fileHandle) {
        return;
      }
      fileHandle = _fileHandle;
      if (fileHandle.kind === "directory") {
        MessagePlugin.warning(t("toolbar.selectFileTip"));
        return;
      }
      readFile();
    } catch (error) {
      console.error(error);
      if (error.toString().includes("aborted")) {
        return;
      }
      MessagePlugin.warning(t("toolbar.notSupportTip"));
    }
  };
  /** 读取本地文件 */
  const readFile = async () => {
    let file = await fileHandle.getFile();
    let fileReader = new FileReader();
    fileReader.onload = async () => {
      appStore.setIsHandleLocalFile(true);
      setData(fileReader.result);
      NotifyPlugin.closeAll();
      NotifyPlugin.info({
        title: t("toolbar.tip"),
        content: `${t("toolbar.editingLocalFileTipFront")}${
          file.name
        }${t("toolbar.editingLocalFileTipEnd")}`,
        closeBtn: true,
      });
    };
    fileReader.readAsText(file);
  };
  /** 渲染读取的数据 */
  const setData = (str) => {
    try {
      let data = JSON.parse(str);
      if (typeof data !== "object") {
        throw new Error(t("toolbar.fileContentError"));
      }
      if (data.root) {
        isFullDataFile.value = true;
      } else {
        isFullDataFile.value = false;
        data = {
          ...exampleData,
          root: data,
        };
      }
      emitter.emit("setData", data);
    } catch (error) {
      console.error(error);
      MessagePlugin.error(t("toolbar.fileOpenFailed"));
    }
  };
  /** 创建本地文件 */
  const createNewLocalFile = async () => {
    await createLocalFile(exampleData);
  };
  /** 节点备注双击处理 */
  const onNodeNoteDblclick = (node, e) => {
    e.stopPropagation();
    emitter.emit("showNodeNote", node);
  };

  let timer = null;
  /** 监听本地文件读写 */
  const onWriteLocalFile = (content) => {
    clearTimeout(timer);
    if (fileHandle && appStore.isHandleLocalFile) {
      waitingWriteToLocalFile.value = true;
    }
    timer = setTimeout(() => {
      writeLocalFile(content);
    }, 1000);
  };

  const setEventHandler = () => {
    emitter.on("mode_change", onModeChange);
    emitter.on("node_active", onNodeActive);
    emitter.on("back_forward", onBackForward);
    emitter.on("painter_start", onPainterStart);
    emitter.on("painter_end", onPainterEnd);
    emitter.on("node_note_dblclick", onNodeNoteDblclick);
    emitter.on("write_local_file", onWriteLocalFile);
  };
  const removeEventHandler = () => {
    emitter.off("mode_change", onModeChange);
    emitter.off("node_active", onNodeActive);
    emitter.off("back_forward", onBackForward);
    emitter.off("painter_start", onPainterStart);
    emitter.off("painter_end", onPainterEnd);
    emitter.off("node_note_dblclick", onNodeNoteDblclick);
    emitter.off("write_local_file", onWriteLocalFile);
  };

  // 暴露需要的值和方法
  return {
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
    showNodeIconSidebar,
    showFormulaSidebar,
    selectAttachmentFile,
    onSetAnnotation,
    aiCreate,
    setEventHandler,
    removeEventHandler,
  };
}
