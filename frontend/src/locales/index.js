import { createI18n } from 'vue-i18n'
import zhCN from './zh_cn'
// import enUS from './en_us'

// 定义语言映射
const messages = {
  'zh-CN': zhCN,
  // 'en-US': enUS
}

// 默认语言（中文）
const defaultLocale = 'zh-CN'

// 创建 i18n 实例
const i18n = createI18n({
  locale: defaultLocale,  // 当前语言
  fallbackLocale: 'zh-CN', // 语言切换失败时的 fallback
  messages,
  legacy: false,  // 使用 Composition API 必须设为 false
  globalInjection: true  // 全局注入 $t 方法
})

export default i18n