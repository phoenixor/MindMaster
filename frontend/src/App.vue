<template>
  <router-view></router-view>
  <AuthDialog v-model="authVisible" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import AuthDialog from "@/components/AuthDialog.vue";
import emitter from "@/utils/eventBus";
import { useRouter } from "vue-router";

const authVisible = ref(false);
const router = useRouter();

const openAuthDialog = () => {
  authVisible.value = true;
};

const goAccount = () => {
  router.push("/account");
};

onMounted(() => {
  emitter.on("open_auth_dialog", openAuthDialog);
  emitter.on("go_account", goAccount);
});

onUnmounted(() => {
  emitter.off("open_auth_dialog", openAuthDialog);
  emitter.off("go_account", goAccount);
});
</script>
