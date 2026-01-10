import exampleData from "@/config/exampleData";
import { simpleDeepClone } from "simple-mind-map/src/utils/index";
import emitter from "@/utils/eventBus.js";
import { useLocalStorage } from "@vueuse/core";
// import { useAppStore } from '@/stores'

const MINDMASTER_DATA = "MINDMASTER_DATA";
const MINDMASTER_CONFIG = "MINDMASTER_CONFIG";
// const MINDMASTER_LANG = 'MINDMASTER_LANG'
const MINDMASTER_LOCAL_CONFIG = "MINDMASTER_LOCAL_CONFIG";
const MINDMASTER_CLOUD_META = "MINDMASTER_CLOUD_META";

const dataStorage = useLocalStorage(MINDMASTER_DATA, null);
// const langStorage = useLocalStorage(MINDMASTER_LANG, 'zh')
const localConfigStorage = useLocalStorage(MINDMASTER_LOCAL_CONFIG, null);
const configStorage = useLocalStorage(MINDMASTER_CONFIG, null);

/**
 * @description: 获取缓存的思维导图数据
 * @return {*}
 */
export const getData = () => {
  let store = dataStorage.value;
  if (store === null) {
    return simpleDeepClone(exampleData);
  } else {
    try {
      return JSON.parse(store);
    } catch (error) {
      return simpleDeepClone(exampleData);
    }
  }
};

/**
 * @description: 存储思维导图数据
 * @param {*} data 思维导图数据
 * @return {*}
 */
export const storeData = (data) => {
  try {
    let originData = getData();
    if (!originData) {
      originData = {};
    }
    originData = {
      ...originData,
      ...data,
    };
    emitter.emit("write_local_file", originData);
    dataStorage.value = JSON.stringify(originData);
    updateLocalUpdatedAt();
  } catch (error) {
    console.error(error);
    if ("exceeded") {
      emitter.emit("localStorageExceeded");
    }
  }
};

/**
 * @description: 获取缓存的思维导图配置数据
 * @return {*}
 */
export const getConfig = () => {
  const config = configStorage.value;
  if (config) {
    return JSON.parse(config);
  }
  return null;
};

/**
 * @description: 存储思维导图配置数据
 * @param {*} config 思维导图配置数据
 * @return {*}
 */
export const storeConfig = (config) => {
  try {
    configStorage.value = JSON.stringify(config);
  } catch (error) {
    console.error(error);
  }
};

// 存储语言
// export const storeLang = lang => {
//   if (window.takeOverApp) {
//     window.takeOverAppMethods.saveLanguage(lang)
//     return
//   }
//   langStorage.value = lang
// }

// 获取存储的语言
// export const getLang = () => {
//   if (window.takeOverApp) {
//     return window.takeOverAppMethods.getLanguage() || 'zh'
//   }
//   let lang = langStorage.value
//   if (lang) {
//     return lang
//   }
//   storeLang('zh')
//   return 'zh'
// }

/**
 * @description: 存储本地配置
 * @param {*} config 本地配置数据
 * @return {*}
 */
export const storeLocalConfig = (config) => {
  localConfigStorage.value = JSON.stringify(config);
};

/**
 * @description: 获取本地配置
 * @return {*}
 */
export const getLocalConfig = () => {
  const config = localConfigStorage.value;
  if (config) {
    return JSON.parse(config);
  }
  return null;
};

export const replaceData = (data) => {
  try {
    emitter.emit("write_local_file", data);
    dataStorage.value = JSON.stringify(data);
    updateLocalUpdatedAt();
  } catch (error) {
    console.error(error);
  }
};

export const getCloudMeta = () => {
  const meta = localStorage.getItem(MINDMASTER_CLOUD_META);
  if (meta) {
    try {
      return JSON.parse(meta);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export const setCloudMeta = (meta) => {
  localStorage.setItem(MINDMASTER_CLOUD_META, JSON.stringify(meta));
};

export const updateLocalUpdatedAt = () => {
  const now = Date.now();
  const meta = getCloudMeta() || {};
  setCloudMeta({
    ...meta,
    local_updated_at: now,
  });
};
