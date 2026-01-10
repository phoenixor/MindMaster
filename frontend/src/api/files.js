import request from "@/utils/request";

export const listFiles = () => request("/api/files");

export const createFile = (payload) =>
  request("/api/files", {
    method: "POST",
    body: payload,
  });

export const getFile = (fileId) => request(`/api/files/${fileId}`);

export const renameFile = (fileId, payload) =>
  request(`/api/files/${fileId}/rename`, {
    method: "PUT",
    body: payload,
  });

export const updateFileData = (fileId, payload) =>
  request(`/api/files/${fileId}/data`, {
    method: "PUT",
    body: payload,
  });

export const deleteFile = (fileId) =>
  request(`/api/files/${fileId}`, {
    method: "DELETE",
  });
