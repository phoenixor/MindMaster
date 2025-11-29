import { storeData } from '@/api'
import useTranslation from '@/hooks/useTranslation.js'
import emitter from '@/utils/eventBus.js'
import { hideLoading, showLoading } from '@/utils/loading'
import { NotifyPlugin } from 'tdesign-vue-next'
import { ref } from 'vue'

/**
 * 思维导图操作 - 负责处理各种操作功能
 * 分离关注点，将不同类型的操作分组管理
 * @param {import('simple-mind-map').default} mindMap - simple-mind-map 实例
 * @param {Ref<boolean>} openNodeRichText - 是否开启节点富文本编辑
 */
export default function useMindMapActions(mindMap, openNodeRichText) {
  const t = useTranslation()
  const enableShowLoading = ref(true)

  // === 渲染控制 ===
  /** 重新渲染 */
  const reRender = () => mindMap.reRender()
  
  /** 处理窗口大小变化 */
  const handleResize = () => mindMap.resize()

  // === 命令执行 ===
  /** 执行命令 */
  const execCommand = (...args) => mindMap.execCommand(...args)

  // === 数据操作 ===
  /** 手动保存 */
  const manualSave = () => storeData(mindMap.getData(true))

  /** 动态设置思维导图数据 */
  const setData = (data) => {
    handleShowLoading()
    let rootNodeData = null
    if (data.root) {
      mindMap.setFullData(data)
      rootNodeData = data.root
    } else {
      mindMap.setData(data)
      rootNodeData = data
    }
    mindMap.view.reset()
    manualSave()
    
    // 如果导入的是富文本内容，那么自动开启富文本模式
    if (rootNodeData.data.richText && !openNodeRichText.value) {
      emitter.emit('toggleOpenNodeRichText', true)
      NotifyPlugin.info({ title: t('edit.tip'), content: t('edit.autoOpenNodeRichTextTip') })
    }
  }

  // === 导出功能 ===
  /** 导出思维导图 */
  const exportMindMap = async (...args) => {
    try {
      showLoading()
      await mindMap.export(...args)
      hideLoading()
    } catch (error) {
      console.error(error)
      hideLoading()
    }
  }

  /** 修改导出内边距 */
  const onPaddingChange = (data) => mindMap.updateConfig(data)

  // === 编辑器操作 ===
  const handleStartTextEdit = () => mindMap.renderer.startTextEdit()
  const handleEndTextEdit = () => mindMap.renderer.endTextEdit()
  const handleCreateLineFromActiveNode = () =>
    mindMap.associativeLine.createLineFromActiveNode()
  const handleStartPainter = () => mindMap.painter.startPainter()

  // === 加载状态控制 ===
  const handleShowLoading = () => {
    enableShowLoading.value = true
    showLoading()
  }

  const handleHideLoading = () => {
    if (enableShowLoading.value) {
      enableShowLoading.value = false
      hideLoading()
    }
  }

  // === 错误处理 ===
  /** localStorage超出时处理 */
  const onLocalStorageExceeded = () => {
    NotifyPlugin.warning({ title: t('edit.tip'), content: t('edit.localStorageExceededTip') })
  }

  return {
    // 渲染控制
    reRender,
    handleResize,
    // 命令执行
    execCommand,
    // 数据操作
    manualSave,
    setData,
    // 导出功能
    exportMindMap,
    onPaddingChange,
    // 编辑器操作
    handleStartTextEdit,
    handleEndTextEdit,
    handleCreateLineFromActiveNode,
    handleStartPainter,
    // 加载状态控制
    handleShowLoading,
    handleHideLoading,
    // 错误处理
    onLocalStorageExceeded,
  }
}