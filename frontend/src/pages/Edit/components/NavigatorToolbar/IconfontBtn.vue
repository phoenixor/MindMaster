<template>
  <i :class="['iconfont', name]" @click="() => handleClick(name)"></i>
</template>

<script setup>
/**
 * 离线使用本地iconfont图标的封装
 */
defineProps({
  name: {
    type: String,
    required: true,
  },
  handleClick: {
    type: Function,
    required: true,
  },
})
</script>

<style lang="less" scoped>
.iconfont {
  font-size: 20px;
}
</style>
