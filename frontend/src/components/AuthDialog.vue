<template>
  <t-dialog
    v-model:visible="visible"
    header="账号"
    :footer="false"
    width="420px"
  >
    <t-tabs v-model="activeTab">
      <t-tab-panel value="login" label="登录">
        <t-form label-width="80px">
          <t-form-item label="用户名">
            <t-input v-model="loginForm.username" placeholder="请输入用户名" />
          </t-form-item>
          <t-form-item label="密码">
            <t-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
            />
          </t-form-item>
          <t-form-item>
            <t-button
              theme="primary"
              :loading="authStore.loading"
              @click="handleLogin"
            >
              登录
            </t-button>
          </t-form-item>
        </t-form>
      </t-tab-panel>
      <t-tab-panel value="register" label="注册">
        <t-form label-width="80px">
          <t-form-item label="用户名">
            <t-input v-model="registerForm.username" placeholder="请输入用户名" />
          </t-form-item>
          <t-form-item label="密码">
            <t-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
            />
          </t-form-item>
          <t-form-item>
            <t-button
              theme="primary"
              :loading="authStore.loading"
              @click="handleRegister"
            >
              注册并登录
            </t-button>
          </t-form-item>
        </t-form>
      </t-tab-panel>
    </t-tabs>
  </t-dialog>
</template>

<script setup>
import { MessagePlugin } from "tdesign-vue-next";
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const authStore = useAuthStore();
const visible = ref(props.modelValue);
const activeTab = ref("login");
const loginForm = ref({ username: "", password: "" });
const registerForm = ref({ username: "", password: "" });

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
  }
);

watch(visible, (val) => {
  emit("update:modelValue", val);
});

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    MessagePlugin.warning("请输入用户名和密码");
    return;
  }
  try {
    await authStore.login(loginForm.value);
    MessagePlugin.success("登录成功");
    visible.value = false;
  } catch (error) {
    MessagePlugin.error(error.message || "登录失败");
  }
};

const handleRegister = async () => {
  if (!registerForm.value.username || !registerForm.value.password) {
    MessagePlugin.warning("请输入用户名和密码");
    return;
  }
  try {
    await authStore.register(registerForm.value);
    MessagePlugin.success("注册成功");
    visible.value = false;
  } catch (error) {
    MessagePlugin.error(error.message || "注册失败");
  }
};
</script>
