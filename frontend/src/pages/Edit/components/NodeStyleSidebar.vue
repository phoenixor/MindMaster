<template>
  <t-drawer
    v-model:visible="drawerVisible"
    placement="right"
    size="320px"
    :header="$t('style.title')"
    :footer="false"
  >
    <div class="style-sidebar">
      <template v-if="hasSelection">
        <div class="row">
          <span class="label">{{ $t('style.fontFamily') }}</span>
          <t-select v-model="style.fontFamily" size="small" @change="setFontFamily">
            <t-option
              v-for="item in fontFamilies"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>
        </div>
        <div class="row">
          <span class="label">{{ $t('style.fontSize') }}</span>
          <t-input-number
            v-model="style.fontSize"
            size="small"
            :min="8"
            :max="72"
            :step="1"
            @change="setFontSize"
          />
        </div>
        <div class="row">
          <span class="label">{{ $t('style.text') }}</span>
          <div class="toggle-group">
            <t-checkbox v-model="style.isBold">{{
              $t('style.addFontWeight')
            }}</t-checkbox>
            <t-checkbox v-model="style.isItalic">{{
              $t('style.italic')
            }}</t-checkbox>
          </div>
        </div>
        <div class="row">
          <span class="label">{{ $t('style.color') }}</span>
          <input
            v-model="style.color"
            class="color-input"
            type="color"
            @change="setTextColor($event.target.value)"
          />
        </div>
        <div class="row">
          <span class="label">{{ $t('style.background') }}</span>
          <input
            v-model="style.fillColor"
            class="color-input"
            type="color"
            @change="setFillColor($event.target.value)"
          />
        </div>
      </template>
      <div v-else class="empty">{{ $t('style.selectNodeTip') }}</div>
    </div>
  </t-drawer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useAppStore } from "@/stores";
import emitter from "@/utils/eventBus";

defineProps({
  mindMap: {
    type: Object,
    default: null,
  },
});

const appStore = useAppStore();

const drawerVisible = computed({
  get: () => appStore.activeSidebar === "nodeStyle",
  set: (value) => appStore.setActiveSidebar(value ? "nodeStyle" : ""),
});

const activeNodes = ref([]);
const hasSelection = computed(() => activeNodes.value.length > 0);
let isSyncing = false;

const fontFamilies = [
  { label: "PingFang SC", value: "PingFang SC" },
  { label: "Microsoft YaHei", value: "Microsoft YaHei" },
  { label: "Arial", value: "Arial" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Georgia", value: "Georgia" },
];

const style = ref({
  fontFamily: "",
  fontSize: 14,
  isBold: false,
  isItalic: false,
  color: "#000000",
  fillColor: "#ffffff",
});

const getNodeStyle = (node, key) => {
  if (!node || !node.getStyle) {
    return "";
  }
  return node.getStyle(key, false);
};

const normalizeColor = (value, fallback) => {
  if (typeof value === "string" && value.startsWith("#")) {
    return value;
  }
  return fallback;
};

const syncFromNode = () => {
  if (!hasSelection.value) {
    return;
  }
  isSyncing = true;
  const node = activeNodes.value[0];
  style.value.fontFamily = getNodeStyle(node, "fontFamily") || "";
  style.value.fontSize = Number(getNodeStyle(node, "fontSize")) || 14;
  const fontWeight = getNodeStyle(node, "fontWeight");
  const fontStyle = getNodeStyle(node, "fontStyle");
  style.value.isBold = fontWeight === "bold";
  style.value.isItalic = fontStyle === "italic";
  style.value.color = normalizeColor(getNodeStyle(node, "color"), "#000000");
  style.value.fillColor = normalizeColor(
    getNodeStyle(node, "fillColor"),
    "#ffffff"
  );
  isSyncing = false;
};

const updateNodes = (key, value) => {
  if (!hasSelection.value) {
    return;
  }
  activeNodes.value.forEach((node) => {
    if (node && node.setStyle) {
      node.setStyle(key, value);
    }
  });
};

const setFontFamily = (value) => {
  updateNodes("fontFamily", value);
};

const setFontSize = (value) => {
  updateNodes("fontSize", value);
};

const setTextColor = (value) => {
  updateNodes("color", value);
};

const setFillColor = (value) => {
  updateNodes("fillColor", value);
};

const onNodeActive = (...args) => {
  const list = Array.isArray(args[1])
    ? args[1]
    : Array.isArray(args[0])
    ? args[0]
    : [];
  activeNodes.value = list.filter(Boolean);
  if (drawerVisible.value) {
    syncFromNode();
  }
};

onMounted(() => {
  emitter.on("node_active", onNodeActive);
  emitter.on("node_style_changed", syncFromNode);
});

onBeforeUnmount(() => {
  emitter.off("node_active", onNodeActive);
  emitter.off("node_style_changed", syncFromNode);
});

watch(drawerVisible, (value) => {
  if (value) {
    syncFromNode();
  }
});

watch(
  () => style.value.isBold,
  (value) => {
    if (isSyncing) {
      return;
    }
    updateNodes("fontWeight", value ? "bold" : "normal");
  }
);

watch(
  () => style.value.isItalic,
  (value) => {
    if (isSyncing) {
      return;
    }
    updateNodes("fontStyle", value ? "italic" : "normal");
  }
);
</script>

<style lang="less" scoped>
.style-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  width: 84px;
  color: #606266;
  font-size: 12px;
}

.toggle-group {
  display: flex;
  gap: 12px;
}

.color-input {
  width: 40px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
}

.empty {
  color: #999;
  padding: 12px 0;
}
</style>
