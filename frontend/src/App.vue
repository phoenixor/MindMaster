<template>
  <router-view></router-view>
  <AuthDialog v-model="authVisible" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import AuthDialog from "@/components/AuthDialog.vue";
import emitter from "@/utils/eventBus";

const authVisible = ref(false);

const openAuthDialog = () => {
  authVisible.value = true;
};

onMounted(() => {
  emitter.on("open_auth_dialog", openAuthDialog);
});

onUnmounted(() => {
  emitter.off("open_auth_dialog", openAuthDialog);
});
</script>
