<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>管理员后台</h1>
      <t-button variant="text" @click="handleLogout">退出登录</t-button>
    </div>

    <t-tabs v-model="activeTab">
      <t-tab-panel value="users" label="用户管理">
        <div class="panel-actions">
          <t-button theme="primary" variant="text" @click="loadUsers">
            刷新
          </t-button>
        </div>
        <div v-if="users.length === 0" class="empty">暂无用户</div>
        <div v-else class="list">
          <div v-for="user in users" :key="user.id" class="list-item">
            <div class="info">
              <div class="name">
                {{ user.username }}
                <span v-if="user.is_admin" class="tag">管理员</span>
              </div>
              <div class="meta">文件数：{{ user.file_count }}</div>
            </div>
            <div class="ops">
              <t-button size="small" variant="text" @click="openReset(user)">
                重置密码
              </t-button>
            </div>
          </div>
        </div>
      </t-tab-panel>

      <t-tab-panel value="files" label="文件管理">
        <div class="panel-actions">
          <t-button theme="primary" variant="text" @click="loadFiles">
            刷新
          </t-button>
        </div>
        <div v-if="files.length === 0" class="empty">暂无文件</div>
        <div v-else class="list">
          <div v-for="file in files" :key="file.id" class="list-item">
            <div class="info">
              <div class="name">{{ file.name }}</div>
              <div class="meta">
                用户：{{ file.username }} | 更新：{{ formatTime(file.updated_at) }}
              </div>
            </div>
            <div class="ops">
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
      </t-tab-panel>
    </t-tabs>
  </div>

  <t-dialog
    v-model:visible="resetVisible"
    header="重置密码"
    :on-confirm="handleReset"
  >
    <t-input v-model="resetPassword" type="password" placeholder="请输入新密码" />
  </t-dialog>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { adminDeleteFile, adminListFiles, adminListUsers, adminResetPassword } from "@/api/admin";
import { DialogPlugin, MessagePlugin } from "tdesign-vue-next";
import emitter from "@/utils/eventBus";

const authStore = useAuthStore();
const activeTab = ref("users");
const users = ref([]);
const files = ref([]);
const resetVisible = ref(false);
const resetPassword = ref("");
const resetUserId = ref("");

const loadUsers = async () => {
  try {
    users.value = await adminListUsers();
  } catch (error) {
    if (error.status === 403) {
      MessagePlugin.error("无管理员权限");
      return;
    }
    MessagePlugin.error(error.message || "加载用户失败");
  }
};

const loadFiles = async () => {
  try {
    files.value = await adminListFiles();
  } catch (error) {
    if (error.status === 403) {
      MessagePlugin.error("无管理员权限");
      return;
    }
    MessagePlugin.error(error.message || "加载文件失败");
  }
};

const openReset = (user) => {
  resetUserId.value = user.id;
  resetPassword.value = "";
  resetVisible.value = true;
};

const handleReset = async () => {
  if (!resetPassword.value) {
    MessagePlugin.warning("请输入新密码");
    return false;
  }
  try {
    await adminResetPassword(resetUserId.value, { password: resetPassword.value });
    MessagePlugin.success("已重置密码");
    resetVisible.value = false;
    return true;
  } catch (error) {
    MessagePlugin.error(error.message || "重置失败");
    return false;
  }
};

const confirmDelete = (file) => {
  const dialog = DialogPlugin.confirm({
    header: "删除文件",
    body: `确定删除「${file.name}」吗？`,
    onConfirm: async () => {
      try {
        await adminDeleteFile(file.id);
        MessagePlugin.success("已删除");
        await loadFiles();
      } catch (error) {
        MessagePlugin.error(error.message || "删除失败");
      } finally {
        dialog.destroy();
      }
    },
    onClose: () => dialog.destroy(),
  });
};

const handleLogout = () => authStore.logout();

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleString();
};

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    emitter.emit("open_auth_dialog");
    MessagePlugin.warning("请先登录管理员账号");
  }
  await loadUsers();
  await loadFiles();
});
</script>

<style lang="less" scoped>
.admin-page {
  max-width: 960px;
  margin: 80px auto 60px;
  padding: 0 16px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.empty {
  color: #999;
  padding: 16px 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
}

.name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag {
  font-size: 12px;
  color: #fff;
  background: #2d8cf0;
  padding: 2px 6px;
  border-radius: 4px;
}

.meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
