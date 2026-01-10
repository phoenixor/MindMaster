<template>
  <div class="head-menu-container" :class="{ active: isScrolled }">
    <t-head-menu default-value="index">
      <t-menu-item value="index" href="/"> 首页 </t-menu-item>
      <t-menu-item value="changelog" @Click="visibleChangelog = true">
        更新日志
      </t-menu-item>
      <t-menu-item value="files" @Click="fileDialogVisible = true">
        我的文件
      </t-menu-item>
      <template #logo>
        <t-avatar :image="logoSrc" size="40px" />
        <AppTitle />
      </template>
      <template #operations>
        <div class="user-ops">
          <t-avatar size="large">{{ displayName.charAt(0) }}</t-avatar>
          <span>{{ displayName }}</span>
          <t-button
            v-if="!authStore.isLoggedIn"
            theme="primary"
            variant="text"
            @click="openAuthDialog"
          >
            登录/注册
          </t-button>
          <template v-else>
            <t-button variant="text" @click="goAccount">账户设置</t-button>
            <t-button variant="text" @click="handleLogout">退出</t-button>
          </template>
        </div>
      </template>
    </t-head-menu>
    <Changelog v-model="visibleChangelog" />
    <FileListDialog v-model="fileDialogVisible" />
  </div>
</template>

<script setup>
import AppTitle from "@/components/AppTitle.vue";
import Changelog from "./Changelog.vue";
import FileListDialog from "@/components/FileListDialog.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import logoSrc from "@/assets/logo.svg";
import emitter from "@/utils/eventBus";
import { useAuthStore } from "@/stores/auth";

const isScrolled = ref(false);
const authStore = useAuthStore();
const visibleChangelog = ref(false);
const fileDialogVisible = ref(false);
const displayName = computed(() => authStore.username || "未登录用户");

const onScroll = () => (isScrolled.value = window.scrollY > 0);
const openAuthDialog = () => emitter.emit("open_auth_dialog");
const handleLogout = () => authStore.logout();
const goAccount = () => emitter.emit("go_account");

onMounted(() => window.addEventListener("scroll", onScroll));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<style lang="less" scoped>
.head-menu-container {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 76px;
  transition: all 0.5s;
  background-color: transparent;
  z-index: 999;
  .t-head-menu {
    max-width: 1140px;
    height: 100%;
    margin: 0 auto;
    background-color: transparent;
    display: flex;
    align-items: center;
    :deep(.t-head-menu__inner) {
      width: 100%;
      .t-menu {
        margin-left: 30px;
        font: var(--td-font-body-large);
      }
      .t-menu__operations {
        font: var(--td-font-title-medium);
        .t-avatar {
          margin-right: 12px;
        }
        .user-ops {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
  }

  &.active {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 5px 30px -10px rgba(0, 0, 0, 0.1);
  }
}
</style>
