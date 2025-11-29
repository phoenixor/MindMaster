/**
 * 应用配置文件 - 集中管理全局环境变量和配置信息
 */
export const appConfig = {
  // 应用名称和版本信息
  appNameCn: import.meta.env.VITE_APP_NAME_CN,
  appNameEn: import.meta.env.VITE_APP_NAME_EN,
  appVer: import.meta.env.VITE_APP_VERSION,
  
  // 作者和部门信息
  author: import.meta.env.VITE_AUTHOR,
  department: import.meta.env.VITE_DEPARTMENT,
  
  // 可以在这里添加更多全局配置项
  baseUrl: import.meta.env.VITE_BASE_URL || '/',
  
  // API相关配置
  api: {
    timeout: 10000,
    retryCount: 3
  }
}