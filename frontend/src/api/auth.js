import request from "@/utils/request";

export const registerUser = (payload) =>
  request("/api/auth/register", {
    method: "POST",
    body: payload,
  });

export const loginUser = (payload) =>
  request("/api/auth/login", {
    method: "POST",
    body: payload,
  });

export const fetchMe = () => request("/api/auth/me");

export const resetPassword = (payload) =>
  request("/api/auth/reset-password", {
    method: "POST",
    body: payload,
  });
