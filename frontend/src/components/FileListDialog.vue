<template>
  <t-dialog v-model:visible="visible" header="我的文件" width="640px">
    <div class="file-actions">
      <t-input v-model="newFileName" placeholder="新文件名称" />
      <t-button theme="primary" :loading="loading" @click="handleCreate">
        新建
      </t-button>
      <t-button variant="text" :loading="loading" @click="refresh">
        刷新
      </t-button>
    </div>

    <div v-if="!files.length" class="empty">暂无文件</div>

    <div v-else class="file-list">
      <div v-for="file in files" :key="file.id" class="file-item">
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-time">更新：{{ formatTime(file.updated_at) }}</div>
        </div>
        <div class="file-ops">
          <t-button size="small" variant="text" @click="openFile(file.id)">
            打开
          </t-button>
          <t-button size="small" variant="text" @click="startRename(file)">
            重命名
          </t-button>
          <t-button
            size="small"
            variant="text"
            theme="danger"
            @click="confirmDelete(file)"
          >
            删除
          </t-button>
        </div>
      </div>
    </div>
  </t-dialog>

  <t-dialog
    v-model:visible="renameVisible"
    header="修改文件名"
    :on-confirm="handleRename"
  >
    <t-input v-model="renameName" placeholder="请输入新文件名" />
  </t-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { MessagePlugin, DialogPlugin } from "tdesign-vue-next";
import { useFileStore } from "@/stores/files";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import exampleData from "@/config/exampleData";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const fileStore = useFileStore();
const authStore = useAuthStore();
const router = useRouter();

const visible = ref(props.modelValue);
const loading = ref(false);
const newFileName = ref("");
const renameVisible = ref(false);
const renameName = ref("");
const renameTargetId = ref("");

const files = computed(() => fileStore.files || []);

const refresh = async () => {
  if (!authStore.isLoggedIn) {
    MessagePlugin.warning("请先登录");
    return;
  }
  loading.value = true;
  try {
    await fileStore.fetchFiles();
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;
    if (val) {
      await refresh();
    }
  }
);

watch(visible, (val) => {
  emit("update:modelValue", val);
});

const handleCreate = async () => {
  if (!authStore.isLoggedIn) {
    MessagePlugin.warning("请先登录");
    return;
  }
  const name = newFileName.value.trim() || "未命名文件";
  loading.value = true;
  try {
    const created = await fileStore.createNewFile(name, exampleData);
    newFileName.value = "";
    visible.value = false;
    await router.push(`/mind-master?fileId=${created.id}`);
  } catch (error) {
    MessagePlugin.error(error.message || "创建失败");
  } finally {
    loading.value = false;
  }
};

const openFile = async (fileId) => {
  visible.value = false;
  await router.push(`/mind-master?fileId=${fileId}`);
};

const startRename = (file) => {
  renameTargetId.value = file.id;
  renameName.value = file.name;
  renameVisible.value = true;
};

const handleRename = async () => {
  const name = renameName.value.trim();
  if (!name) {
    MessagePlugin.warning("请输入新文件名");
    return false;
  }
  try {
    await fileStore.renameExistingFile(renameTargetId.value, name);
    MessagePlugin.success("修改成功");
    renameVisible.value = false;
    return true;
  } catch (error) {
    MessagePlugin.error(error.message || "修改失败");
    return false;
  }
};

const confirmDelete = (file) => {
  const dialog = DialogPlugin.confirm({
    header: "删除文件",
    body: `确定删除「${file.name}」吗？`,
    onConfirm: async () => {
      try {
        await fileStore.deleteExistingFile(file.id);
        MessagePlugin.success("已删除");
      } catch (error) {
        MessagePlugin.error(error.message || "删除失败");
      } finally {
        dialog.destroy();
      }
    },
    onClose: () => dialog.destroy(),
  });
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};
</script>

<style lang="less" scoped>
.file-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.empty {
  color: #999;
  padding: 16px 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
}

.file-name {
  font-weight: 600;
}

.file-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.file-ops {
  display: flex;
  gap: 8px;
}
</style>
