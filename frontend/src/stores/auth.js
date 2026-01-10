import { defineStore } from "pinia";
import { loginUser, registerUser, fetchMe } from "@/api/auth";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, setAuthToken, setAuthUser } from "@/utils/request";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(AUTH_TOKEN_KEY) || "",
    username: localStorage.getItem(AUTH_USER_KEY) || "",
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setSession(token, username) {
      this.token = token || "";
      this.username = username || "";
      setAuthToken(this.token);
      setAuthUser(this.username);
    },
    clearSession() {
      this.setSession("", "");
    },
    async login(payload) {
      this.loading = true;
      try {
        const data = await loginUser(payload);
        this.setSession(data.token, data.username);
        return data;
      } finally {
        this.loading = false;
      }
    },
    async register(payload) {
      this.loading = true;
      try {
        const data = await registerUser(payload);
        this.setSession(data.token, data.username);
        return data;
      } finally {
        this.loading = false;
      }
    },
    async refreshUser() {
      if (!this.token) {
        return null;
      }
      try {
        const data = await fetchMe();
        this.username = data.username;
        setAuthUser(this.username);
        return data;
      } catch (error) {
        this.clearSession();
        throw error;
      }
    },
    logout() {
      this.clearSession();
    },
  },
});
