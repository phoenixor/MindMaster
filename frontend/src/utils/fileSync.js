import { updateFileData } from "@/api/files";
import { MessagePlugin } from "tdesign-vue-next";

let saveTimer = null;

export const queueFileSave = (fileId, data) => {
  if (!fileId) {
    return;
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await updateFileData(fileId, { data });
    } catch (error) {
      MessagePlugin.error(error.message || "云端保存失败");
    }
  }, 1200);
};
