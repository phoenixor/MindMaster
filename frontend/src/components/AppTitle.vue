<template>
  <span class="title"><span class="mind-text">Mind</span>Master {{ appConfig.appNameCn }}</span>
</template>

<script setup>
import { appConfig } from '@/config'
</script>

<style lang="less" scoped>
.title {
  font-size: 24px;
  font-weight: 500;
  color: #000;
  white-space: nowrap;

  .mind-text {
    color: #ff4d4f;
  }
}
</style>
