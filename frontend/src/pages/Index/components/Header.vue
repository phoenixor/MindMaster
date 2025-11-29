<template>
  <div class="head-menu-container" :class="{ active: isScrolled }">
    <t-head-menu default-value="index">
      <t-menu-item value="index" href="/"> 首页 </t-menu-item>
      <t-menu-item value="changelog" @Click="visibleChangelog = true"> 更新日志 </t-menu-item>
      <template #logo>
        <t-avatar :image="logoSrc" size="40px" />
        <AppTitle />
      </template>
      <template #operations>
        <t-avatar size="large">{{ username.charAt(0) }}</t-avatar>
        <span>{{ username }}</span>
      </template>
    </t-head-menu>
    <Changelog v-model="visibleChangelog" />
  </div>
</template>

<script setup>
import AppTitle from '@/components/AppTitle.vue'
import Changelog from './Changelog.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import logoSrc from '@/assets/logo.svg' // 正确引入本地图片，获取编译后的路径

const isScrolled = ref(false)
const username = ref('未登录用户')
const visibleChangelog = ref(false)

const onScroll = () => (isScrolled.value = window.scrollY > 0)

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style lang="less" scoped>
.head-menu-container {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw; // 这个元素是fixed布局，宽度如果为100%，会导致弹出t-dialog时宽度变化元素移位
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
      // 菜单按钮容器
      .t-menu {
        margin-left: 30px;
        font: var(--td-font-body-large);
      }
      // 右侧操作容器
      .t-menu__operations {
        font: var(--td-font-title-medium);
        .t-avatar {
          margin-right: 12px;
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
