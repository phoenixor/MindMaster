# MindMaster | 思维导图大师

一个基于 Vue3 + FastAPI 的现代化在线思维导图应用，支持实时保存与丰富的自定义样式。

---

## 🧠 项目简介

MindMaster（思维导图大师）是一款轻量级、高性能的 Web 思维导图工具  

前端采用 **Vue3 组合式 API + Vite + Pinia + Vue-Router + VueUse** 等最新技术栈  

后端基于 **FastAPI**  

核心渲染引擎依赖开源库 [wanglin2/mind-map](https://github.com/wanglin2/mind-map)，[官方文档](https://wanglin2.github.io/mind-map-docs/) 

---

## 🚀 功能特性

| 功能           | 状态 | 备注                            |
| -------------- | ---- | ------------------------------- |
| 基础节点增删改 | ✅    | 支持快捷键                      |
| 拖拽排序       | ✅    | 无限层级                        |
| 富文本节点     | ✅    | 加粗、斜体、链接、颜色          |
| 主题切换       | ✅    | 内置 10+ 主题                   |
| 导入/导出      | ✅    | JSON、XMind、Markdown、PNG、PDF |
| 多人实时协作   | 🚧    | WebSocket 方案开发中            |
| 本地自动保存   | ✅    | 每 5 秒自动写 IndexedDB         |
| 云端同步       | 🚧    | 需登录，开发中                  |
| 快捷键提示面板 | ✅    | `Ctrl + /` 呼出                 |

---

## 🛠️ 技术栈

### 前端
- **框架**：Vue 3.5（Composition API）
- **构建工具**：Vite 7
- **状态管理**：Pinia
- **路由**：Vue-Router 4
- **工具库**：VueUse、Axios等
- **UI 组件库**：TDesign Web Vue Next（[官方文档](https://tdesign.tencent.com/vue-next/components/overview)）
- **思维导图核心**：[wanglin2/mind-map](https://github.com/wanglin2/mind-map)
- **代码规范**：Prettier

### 后端
- **框架**：FastAPI 0.110
- **数据库**：PostgreSQL 15（SQLAlchemy 2.0）
- **缓存**：Redis 7
- **认证**：JWT + OAuth2（GitHub / Google 登录）
- **文件存储**：本地 / 阿里云 OSS 可切换
- **API 文档**：自动生成 Swagger / ReDoc

---

## 📦 快速开始

### 1. 克隆项目
