import request from "@/utils/request";

export const pullMindMap = () => request("/api/sync/pull");

export const pushMindMap = (payload) =>
  request("/api/sync/push", {
    method: "POST",
    body: payload,
  });
