import { defineStore } from 'pinia'
import { storeLocalConfig } from '@/api'

const useAppStore = defineStore('app', {
  state: () => ({
    /**
     * @property {boolean} isHandleLocalFile - 是否操作的是本地文件
     */
    isHandleLocalFile: false,

    /**
     * @property {Object} localConfig - 本地配置对象
     * @property {boolean} localConfig.isZenMode - 是否是禅模式
     * @property {boolean} localConfig.openNodeRichText - 是否开启节点富文本
     * @property {boolean} localConfig.useLeftKeySelectionRightKeyDrag - 鼠标行为：左键选中，右键拖动；左键拖动，右键选中
     * @property {boolean} localConfig.isShowScrollbar - 是否显示滚动条
     * @property {boolean} localConfig.enableAi - 是否开启AI功能
     */
    localConfig: {
      isZenMode: false,
      openNodeRichText: true,
      useLeftKeySelectionRightKeyDrag: false,
      isShowScrollbar: false,
      // isDark: false, // 是否是暗黑模式
      enableAi: true,
    },

    /**
     * @property {string} activeSidebar - 当前显示的侧边栏
     */
    activeSidebar: '',

    /**
     * @property {boolean} isOutlineEdit - 是否是大纲编辑模式
     */
    isOutlineEdit: false,

    /**
     * @property {boolean} isReadonly - 是否只读
     */
    isReadonly: false,

    /**
     * @property {boolean} isSourceCodeEdit - 是否是源码编辑模式
     */
    isSourceCodeEdit: false,

    /**
     * @property {string} extraTextOnExport - 导出时底部添加的文字
     */
    extraTextOnExport: '',

    /**
     * @property {boolean} isDragOutlineTreeNode - 当前是否正在拖拽大纲树的节点
     */
    isDragOutlineTreeNode: false,

    /**
     * @property {Object} aiConfig - AI配置对象
     * @property {string} aiConfig.api - AI接口地址
     * @property {string} aiConfig.key - API密钥
     * @property {string} aiConfig.model - AI模型
     * @property {number} aiConfig.port - 端口号
     * @property {string} aiConfig.method - 请求方法
     */
    aiConfig: {
      api: 'http://ark.cn-beijing.volces.com/api/v3/chat/completions',
      key: '',
      model: '',
      port: 3456,
      method: 'POST',
    },

    /**
     * @property {Array} extendThemeGroupList - 扩展主题列表
     */
    extendThemeGroupList: [],

    /**
     * @property {Array} bgList - 内置背景图片列表
     */
    bgList: [],
  }),
  actions: {
    /**
     * 设置操作本地文件标志位
     * @param {boolean} data - 是否操作本地文件的布尔值
     */
    setIsHandleLocalFile(data) {
      this.isHandleLocalFile = data
    },

    /**
     * 设置本地配置
     * @param {Object} data - 配置对象，会根据键名分配到localConfig或aiConfig
     */
    setLocalConfig(data) {
      const aiConfigKeys = Object.keys(this.aiConfig)
      Object.keys(data).forEach((key) => {
        if (aiConfigKeys.includes(key)) {
          this.aiConfig[key] = data[key]
        } else {
          this.localConfig[key] = data[key]
        }
      })
      storeLocalConfig({
        ...this.localConfig,
        ...this.aiConfig,
      })
    },

    /**
     * 设置当前显示的侧边栏
     * @param {string} data - 侧边栏标识符
     */
    setActiveSidebar(data) {
      this.activeSidebar = data
    },

    /**
     * 设置大纲编辑模式
     * @param {boolean} data - 是否启用大纲编辑模式
     */
    setIsOutlineEdit(data) {
      this.isOutlineEdit = data
    },

    /**
     * 设置是否只读
     * @param {boolean} data - 是否只读模式
     */
    setIsReadonly(data) {
      this.isReadonly = data
    },

    /**
     * 设置源码编辑模式
     * @param {boolean} data - 是否启用源码编辑模式
     */
    setIsSourceCodeEdit(data) {
      this.isSourceCodeEdit = data
    },

    /**
     * 设置导出时底部添加的文字
     * @param {string} data - 要添加的文字内容
     */
    setExtraTextOnExport(data) {
      this.extraTextOnExport = data
    },

    /**
     * 设置树节点拖拽状态
     * @param {boolean} data - 是否正在拖拽
     */
    setIsDragOutlineTreeNode(data) {
      this.isDragOutlineTreeNode = data
    },

    /**
     * 设置扩展主题列表
     * @param {Array} data - 主题列表数据
     */
    setExtendThemeGroupList(data) {
      this.extendThemeGroupList = data
    },

    /**
     * 设置背景图片列表
     * @param {Array} data - 背景图片列表数据
     */
    setBgList(data) {
      this.bgList = data
    },
  },
})

const appStore = useAppStore()
export default appStore
