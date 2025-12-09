<template>
  <div>
    <t-dialog
      class="nodeImportDialog"
      :header="$t('import.title')"
      :visible="dialogVisible"
      :width="500"
      destroyOnClose
      @close="cancel"
    >
      <t-upload
        ref="upload"
        action="x"
        :accept="supportFileStr"
        :files="fileList"
        :autoUpload="false"
        :onChange="onChange"
        :onRemove="onRemove"
        :theme="display"
        draggable
      >
        <t-button
          slot="trigger"
          variant="outline"
          theme="primary"
        >
          {{ $t("import.selectFile") }}
        </t-button>
        <template #tip>
          <div class="t-upload__tip">
            {{ $t("import.support") }}{{ supportFileStr
            }}{{ $t("import.file") }}
          </div>
        </template>
      </t-upload>
      <template #footer>
        <t-button
          variant="outline"
          @click="cancel"
          >{{ $t("dialog.cancel") }}</t-button
        >
        <t-button
          theme="primary"
          @click="confirm"
          >{{ $t("dialog.confirm") }}</t-button
        >
      </template>
    </t-dialog>
    <t-dialog
      class="xmindCanvasSelectDialog"
      :header="$t('import.xmindCanvasSelectDialogTitle')"
      :visible="xmindCanvasSelectDialogVisible"
      :width="300"
      :show-overlay="true"
      :close-on-overlay-click="false"
    >
      <t-radio-group
        v-model="selectCanvas"
        class="canvasList"
      >
        <t-radio
          v-for="(item, index) in canvasList"
          :key="index"
          :value="index"
        >
          {{ item.title }}
        </t-radio>
      </t-radio-group>
      <template #footer>
        <t-button
          theme="primary"
          @click="confirmSelect"
          >{{ $t("dialog.confirm") }}</t-button
        >
      </template>
    </t-dialog>
  </div>
</template>

<script setup>
/** 导入工程文件 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { MessagePlugin } from "tdesign-vue-next";
import { t } from "@/locales";
import { useRouter } from "vue-router";
import xmind from "simple-mind-map/src/parse/xmind.js";
import markdown from "simple-mind-map/src/parse/markdown.js";
import appStore from "@/stores";
import emitter from "@/utils/eventBus";

// 路由实例
const router = useRouter();

// 响应式数据
const dialogVisible = ref(false);
const fileList = ref([]);
const selectPromiseResolve = ref(null);
const xmindCanvasSelectDialogVisible = ref(false);
const selectCanvas = ref("");
const canvasList = ref([]);
const mdStr = ref("");
const upload = ref(null);

// 计算属性
const supportFileStr = computed(() => {
  return ".smm,.json,.xmind,.md";
});

// 监听器
watch(dialogVisible, (val, oldVal) => {
  if (!val && oldVal) {
    fileList.value = [];
  }
});

// 生命周期钩子
onMounted(() => {
  emitter.on("showImport", handleShowImport);
  emitter.on("handle_file_url", handleFileURL);
  emitter.on("importFile", handleImportFile);
});

onBeforeUnmount(() => {
  emitter.off("showImport", handleShowImport);
  emitter.off("handle_file_url", handleFileURL);
  emitter.off("importFile", handleImportFile);
});

// 方法
const getRegexp = () => {
  return new RegExp(`\.(smm|json|xmind|md)$`);
};

// 检查url中是否操作需要打开的文件
const handleFileURL = async () => {
  try {
    const fileURL = router.currentRoute.value.query.fileURL;
    if (!fileURL) return;
    const macth = getRegexp().exec(fileURL);
    if (!macth) {
      return;
    }
    const type = macth[1];
    const res = await fetch(fileURL);
    const file = await res.blob();
    const data = {
      raw: file,
    };
    if (type === "smm" || type === "json") {
      handleSmm(data);
    } else if (type === "xmind") {
      handleXmind(data);
    } else if (type === "md") {
      handleMd(data);
    }
  } catch (error) {
    console.log(error);
  }
};

// 文件选择
const onChange = (file) => {
  if (!getRegexp().test(file.name)) {
    MessagePlugin.error(
      t("import.pleaseSelect") + supportFileStr.value + t("import.file")
    );
    fileList.value = [];
  } else {
    fileList.value.push(file);
  }
};

// 移除文件
const onRemove = (file, files) => {
  fileList.value = files;
};

// 数量超出限制
const onExceed = () => {
  MessagePlugin.error(t("import.maxFileNum"));
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
};

// 确定
const confirm = () => {
  if (fileList.value.length <= 0) {
    return MessagePlugin.error(t("import.notSelectTip"));
  }
  appStore.setIsHandleLocalFile(false);
  let file = fileList.value[0];
  if (/\.(smm|json)$/.test(file.name)) {
    handleSmm(file);
  } else if (/\.xmind$/.test(file.name)) {
    handleXmind(file);
  } else if (/\.md$/.test(file.name)) {
    handleMd(file);
  }
  cancel();
  appStore.setActiveSidebar(null);
};

// 处理.smm文件
const handleSmm = (file) => {
  let fileReader = new FileReader();
  fileReader.readAsText(file.raw);
  fileReader.onload = (evt) => {
    try {
      let data = JSON.parse(evt.target.result);
      if (typeof data !== "object") {
        throw new Error(t("import.fileContentError"));
      }
      emitter.emit("setData", data);
      MessagePlugin.success(t("import.importSuccess"));
    } catch (error) {
      console.log(error);
      MessagePlugin.error(t("import.fileParsingFailed"));
    }
  };
};

// 处理.xmind文件
const handleXmind = async (file) => {
  try {
    let data = await xmind.parseXmindFile(file.raw, (content) => {
      showSelectXmindCanvasDialog(content);
      return new Promise((resolve) => {
        selectPromiseResolve.value = resolve;
      });
    });
    emitter.emit("setData", data);
    MessagePlugin.success(t("import.importSuccess"));
  } catch (error) {
    console.log(error);
    MessagePlugin.error(t("import.fileParsingFailed"));
  }
};

// 显示xmind文件的多个画布选择弹窗
const showSelectXmindCanvasDialog = (content) => {
  canvasList.value = content;
  selectCanvas.value = 0;
  xmindCanvasSelectDialogVisible.value = true;
};

// 确认导入指定的画布
const confirmSelect = () => {
  selectPromiseResolve.value(canvasList.value[selectCanvas.value]);
  xmindCanvasSelectDialogVisible.value = false;
  canvasList.value = [];
  selectCanvas.value = 0;
};

// 处理markdown文件
const handleMd = (file) => {
  let fileReader = new FileReader();
  fileReader.readAsText(file.raw);
  fileReader.onload = async (evt) => {
    try {
      let data = markdown.transformMarkdownTo(evt.target.result);
      emitter.emit("setData", data);
      MessagePlugin.success(t("import.importSuccess"));
    } catch (error) {
      console.log(error);
      MessagePlugin.error(t("import.fileParsingFailed"));
    }
  };
};

// 显示导入对话框
const handleShowImport = () => {
  dialogVisible.value = true;
};

// 导入指定文件
const handleImportFile = (file) => {
  onChange({
    raw: file,
    name: file.name,
  });
  if (fileList.value.length <= 0) return;
  confirm();
};
</script>

<style lang="less" scoped>
.nodeImportDialog {
}

.canvasList {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.t-radio) {
    margin-bottom: 0;
  }
}
</style>
