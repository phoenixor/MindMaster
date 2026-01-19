<template>
  <t-dialog v-model:visible="visible" :header="$t('baseStyle.title')" :footer="false">
    <div class="style-dialog">
      <div class="row">
        <span class="label">{{ $t('theme.title') }}</span>
        <t-select v-model="theme" size="small">
          <t-option
            v-for="item in themeOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </t-select>
      </div>
      <div class="row">
        <span class="label">{{ $t('baseStyle.background') }}</span>
        <input v-model="backgroundColor" class="color-input" type="color" />
      </div>
      <div class="row">
        <span class="label">{{ $t('baseStyle.line') }}</span>
        <input v-model="lineColor" class="color-input" type="color" />
      </div>
      <div class="actions">
        <t-button theme="primary" @click="apply">{{ $t('dialog.confirm') }}</t-button>
        <t-button variant="text" @click="close">{{ $t('dialog.cancel') }}</t-button>
      </div>
    </div>
  </t-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import themeList from "simple-mind-map-plugin-themes/themeList";
import { storeData } from "@/api";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  mindMap: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:visible"]);

const visible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const themeOptions = computed(() => [
  { label: "Default", value: "default" },
  ...themeList.map((item) => ({
    label: item.name,
    value: item.value,
  })),
]);

const theme = ref("default");
const backgroundColor = ref("");
const lineColor = ref("");

const initFromMindMap = () => {
  const map = props.mindMap;
  if (!map) {
    return;
  }
  theme.value = map.getTheme ? map.getTheme() : "default";
  const config = map.getThemeConfig ? map.getThemeConfig() : {};
  backgroundColor.value = config.backgroundColor || "";
  lineColor.value = config.lineColor || "";
};

watch(
  () => props.visible,
  (value) => {
    if (value) {
      initFromMindMap();
    }
  }
);

const buildConfig = (currentConfig) => {
  const config = { ...(currentConfig || {}) };
  if (backgroundColor.value) {
    config.backgroundColor = backgroundColor.value;
  } else {
    delete config.backgroundColor;
  }
  if (lineColor.value) {
    config.lineColor = lineColor.value;
  } else {
    delete config.lineColor;
  }
  return config;
};

const apply = () => {
  const map = props.mindMap;
  if (!map) {
    return;
  }
  const nextTheme = theme.value || "default";
  const currentConfig = map.getThemeConfig ? map.getThemeConfig() : {};
  const config = buildConfig(currentConfig);
  map.setTheme(nextTheme);
  map.setThemeConfig(config);
  storeData({
    theme: {
      template: nextTheme,
      config,
    },
  });
  visible.value = false;
};

const close = () => {
  visible.value = false;
};
</script>

<style lang="less" scoped>
.style-dialog {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  width: 72px;
  color: #606266;
  font-size: 12px;
}

.color-input {
  width: 40px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
}
</style>
