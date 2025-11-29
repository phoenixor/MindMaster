import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import Watermark from 'simple-mind-map/src/plugins/Watermark.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js'
import ExportXMind from 'simple-mind-map/src/plugins/ExportXMind.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
import Select from 'simple-mind-map/src/plugins/Select.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js'
import NodeImgAdjust from 'simple-mind-map/src/plugins/NodeImgAdjust.js'
import SearchPlugin from 'simple-mind-map/src/plugins/Search.js'
import Painter from 'simple-mind-map/src/plugins/Painter.js'
import ScrollbarPlugin from 'simple-mind-map/src/plugins/Scrollbar.js'
import Formula from 'simple-mind-map/src/plugins/Formula.js'
import RainbowLines from 'simple-mind-map/src/plugins/RainbowLines.js'
import Demonstrate from 'simple-mind-map/src/plugins/Demonstrate.js'
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js'
import MindMapLayoutPro from 'simple-mind-map/src/plugins/MindMapLayoutPro.js'
import NodeBase64ImageStorage from 'simple-mind-map/src/plugins/NodeBase64ImageStorage.js'
import Themes from 'simple-mind-map-plugin-themes'

/**
 * 插件管理 - 负责注册和管理所有插件
 * 采用单例模式，确保插件只注册一次
 */
class PluginManager {
  constructor() {
    this.isInitialized = false
    this.plugins = new Map()
    this.mindMapInstance = null
  }

  /**
   * 初始化插件管理器
   * @param {import('simple-mind-map').default} MindMap - simple-mind-map 类
   */
  initialize(MindMap) {
    if (this.isInitialized) return

    // 注册基础插件
    this.registerBasePlugins(MindMap)
    
    // 注册主题
    this.registerThemes(MindMap)
    
    this.isInitialized = true
  }

  /**
   * 注册基础插件
   */
  registerBasePlugins(MindMap) {
    const plugins = [
      MiniMap,
      Watermark,
      Drag,
      KeyboardNavigation,
      ExportPDF,
      ExportXMind,
      Export,
      Select,
      AssociativeLine,
      NodeImgAdjust,
      TouchEvent,
      SearchPlugin,
      Painter,
      Formula,
      RainbowLines,
      Demonstrate,
      OuterFrame,
      MindMapLayoutPro,
      NodeBase64ImageStorage,
    ]

    plugins.forEach(Plugin => {
      MindMap.usePlugin(Plugin)
      this.plugins.set(Plugin.name, Plugin)
    })
  }

  /**
   * 注册主题
   */
  registerThemes(MindMap) {
    Themes.init(MindMap)
    // 扩展主题列表
    if (typeof MoreThemes !== 'undefined') {
      MoreThemes.init(MindMap)
    }
  }

  /**
   * 设置mindMap实例
   * @param {import('simple-mind-map').default} mindMap - simple-mind-map 实例
   */
  setMindMapInstance(mindMap) {
    this.mindMapInstance = mindMap
  }

  /**
   * 添加富文本插件
   */
  addRichTextPlugin() {
    if (!this.mindMapInstance) return
    this.mindMapInstance.addPlugin(RichText)
  }

  /**
   * 移除富文本插件
   */
  removeRichTextPlugin() {
    if (!this.mindMapInstance) return
    this.mindMapInstance.removePlugin('RichText')
  }

  /**
   * 添加滚动条插件
   */
  addScrollbarPlugin() {
    if (!this.mindMapInstance) return
    this.mindMapInstance.addPlugin(ScrollbarPlugin)
  }

  /**
   * 移除滚动条插件
   */
  removeScrollbarPlugin() {
    if (!this.mindMapInstance) return
    this.mindMapInstance.removePlugin(ScrollbarPlugin)
  }

  /**
   * 初始化条件插件
   * @param {boolean} openNodeRichText - 是否开启节点富文本模式
   * @param {boolean} isShowScrollbar - 是否显示滚动条
   */
  initConditionalPlugins(openNodeRichText, isShowScrollbar) {
    if (openNodeRichText) this.addRichTextPlugin()
    if (isShowScrollbar) this.addScrollbarPlugin()
  }
}

// 创建单例实例
const pluginManager = new PluginManager()

/**
 * 使用插件管理的hook
 * @param {import('simple-mind-map').default} MindMap - simple-mind-map 类
 * @param {Ref<boolean>} openNodeRichText - 是否开启节点富文本模式
 * @param {Ref<boolean>} isShowScrollbar - 是否显示滚动条
 */
export default function usePluginManager(MindMap, openNodeRichText, isShowScrollbar) {
  // 初始化插件管理器
  pluginManager.initialize(MindMap)

  return {
    // 插件管理方法
    addRichTextPlugin: () => pluginManager.addRichTextPlugin(),
    removeRichTextPlugin: () => pluginManager.removeRichTextPlugin(),
    addScrollbarPlugin: () => pluginManager.addScrollbarPlugin(),
    removeScrollbarPlugin: () => pluginManager.removeScrollbarPlugin(),
    
    /**
     * 初始化插件
     * @param {import('simple-mind-map').default} mindMap - simple-mind-map 实例
     */
    initPlugins: (mindMap) => {
      pluginManager.setMindMapInstance(mindMap)
      pluginManager.initConditionalPlugins(openNodeRichText.value, isShowScrollbar.value)
    },
    
    // 获取插件管理器实例（用于高级用法）
    getPluginManager: () => pluginManager,
  }
}