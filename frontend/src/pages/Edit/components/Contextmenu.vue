<template>
  <div
    v-if="isShow"
    ref="menuRef"
    class="contextmenu"
    :style="{ left: `${left}px`, top: `${top}px` }"
    @mousedown.stop
    @contextmenu.prevent
  >
    <div
      class="item"
      :class="{ disabled: isFreeNode || !canToggle }"
      @click="convertToFree"
    >
      {{ $t("contextmenu.convertToFreeNode") }}
    </div>
    <div
      class="item"
      :class="{ disabled: !isFreeNode || !canToggle }"
      @click="convertToNormal"
    >
      {{ $t("contextmenu.convertToNormalNode") }}
    </div>
  </div>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
  import { useAppStore } from "@/stores";
  import emitter from "@/utils/eventBus";
  import { getConfig, storeConfig } from "@/api";

  const props = defineProps({
    mindMap: {
      type: Object,
      required: true,
    },
  });

  const appStore = useAppStore();
  const isShow = ref(false);
  const left = ref(0);
  const top = ref(0);
  const menuRef = ref(null);
  const nodeRef = ref(null);

  const isFreeNode = computed(() => {
    return !!nodeRef.value?.getData?.("isFreeNode");
  });
  const canToggle = computed(() => {
    const node = nodeRef.value;
    return !!node && !node.isRoot && !node.isGeneralization;
  });

  const getShowPosition = (x, y) => {
    const menu = menuRef.value;
    if (!menu) {
      return { x, y };
    }
    const rect = menu.getBoundingClientRect();
    let nextX = x;
    let nextY = y;
    if (nextX + rect.width > window.innerWidth) {
      nextX = window.innerWidth - rect.width - 8;
    }
    if (nextY + rect.height > window.innerHeight) {
      nextY = window.innerHeight - rect.height - 8;
    }
    return { x: nextX, y: nextY };
  };

  const show = (e, node) => {
    if (!node) {
      return;
    }
    e?.preventDefault?.();
    isShow.value = true;
    nodeRef.value = node;
    nextTick(() => {
      const { x, y } = getShowPosition(e.clientX + 8, e.clientY + 8);
      left.value = x;
      top.value = y;
    });
  };

  const hide = () => {
    isShow.value = false;
    nodeRef.value = null;
  };

  const ensureFreeDragEnabled = () => {
    if (!props.mindMap?.getConfig("enableFreeDrag")) {
      props.mindMap.updateConfig({ enableFreeDrag: true });
      const config = getConfig() || {};
      storeConfig({ ...config, enableFreeDrag: true });
    }
  };

  const convertToFree = () => {
    if (!nodeRef.value || !canToggle.value || isFreeNode.value || appStore.isReadonly) {
      hide();
      return;
    }
    ensureFreeDragEnabled();
    const node = nodeRef.value;
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach((child) => {
        const updates = {};
        const overrideKeys = [];
        const lineColor = child.getSelfStyle?.("lineColor");
        const lineWidth = child.getSelfStyle?.("lineWidth");
        const lineDasharray = child.getSelfStyle?.("lineDasharray");
        if (lineColor === undefined) {
          updates.lineColor = child.getStyle?.("lineColor", true);
          overrideKeys.push("lineColor");
        }
        if (lineWidth === undefined) {
          updates.lineWidth = child.getStyle?.("lineWidth", true);
          overrideKeys.push("lineWidth");
        }
        if (lineDasharray === undefined) {
          updates.lineDasharray = child.getStyle?.("lineDasharray", true);
          overrideKeys.push("lineDasharray");
        }
        if (Object.keys(updates).length > 0) {
          updates._freeLineOverride = overrideKeys;
          props.mindMap.execCommand("SET_NODE_DATA", child, updates);
        }
      });
    }
    props.mindMap.execCommand("SET_NODE_DATA", node, { isFreeNode: true });
    props.mindMap.execCommand(
      "SET_NODE_CUSTOM_POSITION",
      node,
      node.left,
      node.top
    );
    node.setStyle("lineWidth", 0);
    node.setStyle("lineColor", "transparent");
    props.mindMap.render();
    hide();
  };

  const convertToNormal = () => {
    if (!nodeRef.value || !canToggle.value || !isFreeNode.value || appStore.isReadonly) {
      hide();
      return;
    }
    const node = nodeRef.value;
    props.mindMap.execCommand("SET_NODE_DATA", node, { isFreeNode: false });
    props.mindMap.execCommand("SET_NODE_CUSTOM_POSITION", node, undefined, undefined);
    node.setStyle("lineWidth", undefined);
    node.setStyle("lineColor", undefined);
    if (node.nodeData?.data) {
      delete node.nodeData.data.lineColor;
      delete node.nodeData.data.lineWidth;
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach((child) => {
        const override = child.getData?.("_freeLineOverride");
        if (!override) {
          return;
        }
        const keysToClear = Array.isArray(override)
          ? override
          : ["lineColor", "lineWidth", "lineDasharray"];
        const updates = { _freeLineOverride: undefined };
        keysToClear.forEach((key) => {
          updates[key] = undefined;
        });
        props.mindMap.execCommand("SET_NODE_DATA", child, updates);
        if (child.nodeData?.data) {
          keysToClear.forEach((key) => {
            delete child.nodeData.data[key];
          });
          delete child.nodeData.data._freeLineOverride;
        }
      });
    }
    props.mindMap.render();
    hide();
  };

  const onGlobalMouseDown = (event) => {
    if (!isShow.value) return;
    const menu = menuRef.value;
    if (menu && menu.contains(event.target)) {
      return;
    }
    hide();
  };

  onMounted(() => {
    emitter.on("node_contextmenu", show);
    emitter.on("node_click", hide);
    emitter.on("draw_click", hide);
    emitter.on("translate", hide);
    emitter.on("scale", hide);
    window.addEventListener("resize", hide);
    document.addEventListener("mousedown", onGlobalMouseDown, true);
  });

  onBeforeUnmount(() => {
    emitter.off("node_contextmenu", show);
    emitter.off("node_click", hide);
    emitter.off("draw_click", hide);
    emitter.off("translate", hide);
    emitter.off("scale", hide);
    window.removeEventListener("resize", hide);
    document.removeEventListener("mousedown", onGlobalMouseDown, true);
  });
</script>

<style lang="less" scoped>
  .contextmenu {
    position: fixed;
    z-index: 4000;
    min-width: 180px;
    padding: 8px 0;
    background: #ffffff;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    color: #1f1f1f;
    font-size: 14px;
    user-select: none;
  }

  .item {
    padding: 8px 14px;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background: #f2f3f5;
    }

    &.disabled {
      color: #a0a0a0;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
</style>
