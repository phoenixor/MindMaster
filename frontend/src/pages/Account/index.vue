<template>
  <div class="account-page">
    <div class="account-header">
      <h1>个人账户</h1>
      <t-button variant="text" @click="handleLogout">退出登录</t-button>
    </div>

    <t-tabs v-model="activeTab">
      <t-tab-panel value="profile" label="账户信息">
        <t-card class="card">
          <div class="row">
            <span class="label">用户名</span>
            <span>{{ authStore.username || "-" }}</span>
          </div>
        </t-card>
      </t-tab-panel>

      <t-tab-panel value="password" label="重置密码">
        <t-card class="card">
          <t-form label-width="100px">
            <t-form-item label="当前密码">
              <t-input
                v-model="form.current_password"
                type="password"
                placeholder="请输入当前密码"
              />
            </t-form-item>
            <t-form-item label="新密码">
              <t-input
                v-model="form.new_password"
                type="password"
                placeholder="请输入新密码"
              />
            </t-form-item>
            <t-form-item label="确认密码">
              <t-input
                v-model="confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
              />
            </t-form-item>
            <t-form-item>
              <t-button theme="primary" :loading="loading" @click="submitReset">
                保存
              </t-button>
            </t-form-item>
          </t-form>
        </t-card>
      </t-tab-panel>

      <t-tab-panel value="files" label="文件列表">
        <t-card class="card">
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
                <div class="meta">更新：{{ formatTime(file.updated_at) }}</div>
              </div>
              <div class="ops">
                <t-button size="small" variant="text" @click="openFile(file.id)">
                  打开
                </t-button>
              </div>
            </div>
          </div>
        </t-card>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { MessagePlugin } from "tdesign-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/files";
import { resetPassword } from "@/api/auth";
import { useRouter } from "vue-router";
import emitter from "@/utils/eventBus";

const authStore = useAuthStore();
const fileStore = useFileStore();
const router = useRouter();
const activeTab = ref("profile");
const loading = ref(false);
const form = ref({
  current_password: "",
  new_password: "",
});
const confirmPassword = ref("");

const files = computed(() => fileStore.files || []);

const loadFiles = async () => {
  try {
    await fileStore.fetchFiles();
  } catch (error) {
    MessagePlugin.error(error.message || "加载文件失败");
  }
};

const openFile = async (fileId) => {
  await router.push(`/mind-master?fileId=${fileId}`);
};

const submitReset = async () => {
  if (!form.value.current_password || !form.value.new_password) {
    MessagePlugin.warning("请完整填写密码");
    return;
  }
  if (form.value.new_password !== confirmPassword.value) {
    MessagePlugin.warning("两次输入的新密码不一致");
    return;
  }
  loading.value = true;
  try {
    await resetPassword(form.value);
    MessagePlugin.success("密码已更新");
    form.value.current_password = "";
    form.value.new_password = "";
    confirmPassword.value = "";
  } catch (error) {
    MessagePlugin.error(error.message || "更新失败");
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleString();
};

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    emitter.emit("open_auth_dialog");
    MessagePlugin.warning("请先登录");
    return;
  }
  await loadFiles();
});
</script>

<style lang="less" scoped>
.account-page {
  max-width: 960px;
  margin: 80px auto 60px;
  padding: 0 16px;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card {
  margin-top: 16px;
}

.row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #666;
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
}

.meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
