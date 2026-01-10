import request from "@/utils/request";

export const adminListUsers = () => request("/api/admin/users");

export const adminResetPassword = (userId, payload) =>
  request(`/api/admin/users/${userId}/reset-password`, {
    method: "POST",
    body: payload,
  });

export const adminListFiles = () => request("/api/admin/files");

export const adminDeleteFile = (fileId) =>
  request(`/api/admin/files/${fileId}`, {
    method: "DELETE",
  });
