<template>
  <t-dialog
    v-model:visible="visible"
    width="50%"
    header="更新日志"
    :footer="false"
    :closeBtn="false"
    destroy-on-close
  >
    <template #body>
      <div>我是被挂载到body元素的对话框</div>
      <div>我是内容</div>
      <div>我是内容</div>
      <div>我是内容</div>
      <div>我是内容</div>
    </template>
  </t-dialog>
</template>

<script setup>
const visible = defineModel()
</script>

<style lang="less" scoped></style>
