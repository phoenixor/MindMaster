import { defineStore } from "pinia";
import { createFile, deleteFile, getFile, listFiles, renameFile } from "@/api/files";
import emitter from "@/utils/eventBus";

const STORAGE_KEY = "MINDMASTER_LAST_FILE";

export const useFileStore = defineStore("files", {
  state: () => ({
    files: [],
    currentFileId: localStorage.getItem(STORAGE_KEY) || "",
    loading: false,
  }),
  actions: {
    setCurrentFileId(fileId) {
      this.currentFileId = fileId ? String(fileId) : "";
      if (this.currentFileId) {
        localStorage.setItem(STORAGE_KEY, this.currentFileId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    async fetchFiles() {
      this.loading = true;
      try {
        this.files = await listFiles();
        return this.files;
      } finally {
        this.loading = false;
      }
    },
    async openFile(fileId) {
      const data = await getFile(fileId);
      this.setCurrentFileId(data.id);
      emitter.emit("setData", data.data);
      return data;
    },
    async createNewFile(name, data) {
      const created = await createFile({ name, data });
      this.setCurrentFileId(created.id);
      await this.fetchFiles();
      emitter.emit("setData", created.data);
      return created;
    },
    async renameExistingFile(fileId, name) {
      const updated = await renameFile(fileId, { name });
      await this.fetchFiles();
      return updated;
    },
    async deleteExistingFile(fileId) {
      await deleteFile(fileId);
      if (String(fileId) === this.currentFileId) {
        this.setCurrentFileId("");
      }
      await this.fetchFiles();
    },
  },
});
