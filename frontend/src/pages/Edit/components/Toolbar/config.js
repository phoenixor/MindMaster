import appStore from '@/stores'
import emitter from '@/utils/eventBus.js'
import { computed, onMounted, onUnmounted, ref } from 'vue'
/**
 * 工具栏配置的Composable函数
 * 封装工具栏按钮的状态管理、事件处理和禁用条件逻辑
 */
export function useToolbarConfig() {
  // 状态管理
  const activeNodes = ref([])
  const backEnd = ref(true)
  const forwardEnd = ref(true)
  const isInPainter = ref(false) // 格式刷
  const isReadonly = computed(() => appStore.isReadonly)

  const hasRoot = computed(() => {
    return activeNodes.value.findIndex((node) => node.isRoot) !== -1
  })

  const hasGeneralization = computed(() => {
    return activeNodes.value.findIndex((node) => node.isGeneralization) !== -1
  })

  /**
   * 禁用条件配置 - 使用对象映射每个按钮的禁用逻辑
   * @property {Function} back - 回退按钮禁用条件
   * @property {Function} forward - 前进按钮禁用条件
   * @property {Function} painter - 格式刷按钮禁用条件
   * @property {Function} siblingNode - 同级节点按钮禁用条件
   * @property {Function} childNode - 子节点按钮禁用条件
   * @property {Function} deleteNode - 删除节点按钮禁用条件
   * @property {Function} image - 插入图片按钮禁用条件
   * @property {Function} icon - 插入图标按钮禁用条件
   * @property {Function} link - 插入链接按钮禁用条件
   * @property {Function} note - 插入注释按钮禁用条件
   * @property {Function} tag - 插入标签按钮禁用条件
   * @property {Function} summary - 插入摘要按钮禁用条件
   * @property {Function} associativeLine - 关联线按钮禁用条件
   * @property {Function} formula - 插入公式按钮禁用条件
   * @property {Function} attachment - 插入附件按钮禁用条件
   * @property {Function} outerFrame - 插入外框按钮禁用条件
   * @property {Function} ai - 插入AI按钮禁用条件
   */
  const disabledConditions = {
    back: isReadonly.value || backEnd.value,
    forward: isReadonly.value || forwardEnd.value,
    painter: activeNodes.value.length <= 0 || hasGeneralization.value,
    siblingNode: activeNodes.value.length <= 0 || hasRoot.value || hasGeneralization.value,
    childNode: activeNodes.value.length <= 0 || hasGeneralization.value,
    deleteNode: activeNodes.value.length <= 0,
    image: activeNodes.value.length <= 0,
    icon: activeNodes.value.length <= 0,
    link: activeNodes.value.length <= 0,
    note: activeNodes.value.length <= 0,
    tag: activeNodes.value.length <= 0,
    summary: activeNodes.value.length <= 0 || hasRoot.value || hasGeneralization.value,
    associativeLine: activeNodes.value.length <= 0 || hasGeneralization.value,
    formula: activeNodes.value.length <= 0 || hasGeneralization.value,
    attachment: activeNodes.value.length <= 0 || hasGeneralization.value,
    outerFrame: activeNodes.value.length <= 0 || hasGeneralization.value,
    // annotation: false,
    ai: hasGeneralization.value,
  }

  /**
   * 按钮点击事件处理器
   * @param {string} btnKey - 按钮的键名
   */
  const handleToolClick = (btnKey) => {
    switch (btnKey) {
      case 'back':
        emitter.emit('execCommand', 'BACK')
        break
      case 'forward':
        emitter.emit('execCommand', 'FORWARD')
        break
      case 'painter':
        emitter.emit('startPainter')
        break
      case 'siblingNode':
        emitter.emit('execCommand', 'INSERT_NODE')
        break
      case 'childNode':
        emitter.emit('execCommand', 'INSERT_CHILD_NODE')
        break
      case 'deleteNode':
        emitter.emit('execCommand', 'REMOVE_NODE')
        break
      case 'image':
        emitter.emit('showNodeImage')
        break
      case 'icon':
        emitter.emit('close_node_icon_toolbar')
        appStore.setActiveSidebar('nodeIconSidebar')
        break
      case 'link':
        emitter.emit('showNodeLink')
        break
      case 'note':
        emitter.emit('showNodeNote')
        break
      case 'tag':
        emitter.emit('showNodeTag')
        break
      case 'summary':
        emitter.emit('execCommand', 'ADD_GENERALIZATION')
        break
      case 'associativeLine':
        emitter.emit('createAssociativeLine')
        break
      case 'formula':
        appStore.setActiveSidebar('formulaSidebar')
        break
      case 'attachment':
        emitter.emit('selectAttachment', activeNodes.value)
        break
      case 'outerFrame':
        emitter.emit('execCommand', 'ADD_OUTER_FRAME')
        break
      case 'ai':
        emitter.emit('ai_create_all')
        break
      default:
        console.error(`未知的工具按钮: ${btnKey}`)
    }
  }

  // 获取按钮的禁用状态
  //   const getBtnDisabled = (btnKey) => {
  //     return disabledConditions[btnKey] ? disabledConditions[btnKey]() : false
  //   }

  //   // 处理按钮列表，添加禁用状态
  //   const processBtnList = (btnList) => {
  //     return btnList.map((btn) => ({
  //       ...btn,
  //       isDisabled: getBtnDisabled(btn.name),
  //     }))
  //   }
  /** 显示节点图标侧边栏 */
  const showNodeIconSidebar = () => {
    emitter.emit('close_node_icon_toolbar')
    appStore.setActiveSidebar('nodeIconSidebar')
  }
  /** 打开公式侧边栏 */
  const showFormulaSidebar = () => appStore.setActiveSidebar('formulaSidebar')
  /** 选择附件 */
  const selectAttachmentFile = () => emitter.emit('selectAttachment', activeNodes.value)
  /** 设置标记 */
  const onSetAnnotation = (...args) =>
    emitter.emit('execCommand', 'SET_NOTATION', activeNodes.value, ...args)
  /** AI生成整体 */
  const aiCreate = () => emitter.emit('ai_create_all')

  /**
   * 设置事件监听器并返回清理函数
   * @returns {Function} 清理函数，用于移除事件监听器
   */
  const setupEventListeners = () => {
    /**
     * 监听模式切换
     * @param {string} mode - 模式名称，'readonly' 或其他
     */
    const onModeChange = (mode) => appStore.setIsReadonly(mode === 'readonly')
    /**
     * 监听节点激活
     * @param {Array} args - 事件参数，包含激活的节点数组
     */
    const onNodeActive = (...args) => (activeNodes.value = [...args[1]])

    /**
     * 监听前进后退
     * @param {number} index - 当前索引
     * @param {number} len - 总长度
     */
    const onBackForward = (index, len) => {
      backEnd.value = index <= 0
      forwardEnd.value = index >= len - 1
    }
    /** 开始格式刷 */
    const onPainterStart = () => (isInPainter.value = true)
    /** 结束格式刷 */
    const onPainterEnd = () => (isInPainter.value = false)
    onMounted(() => {
      emitter.on('mode_change', onModeChange)
      emitter.on('node_active', onNodeActive)
      emitter.on('back_forward', onBackForward)
      emitter.on('painter_start', onPainterStart)
      emitter.on('painter_end', onPainterEnd)
    })
    onUnmounted(() => {
      emitter.off('mode_change', onModeChange)
      emitter.off('node_active', onNodeActive)
      emitter.off('back_forward', onBackForward)
      emitter.off('painter_start', onPainterStart)
      emitter.off('painter_end', onPainterEnd)
    })
  }

  // 暴露需要的值和方法
  return {
    // 状态
    activeNodes,
    backEnd,
    forwardEnd,
    isInPainter,
    hasRoot,
    hasGeneralization,
    isReadonly,
    disabledConditions,

    // 方法
    handleToolClick,
    showNodeIconSidebar,
    showFormulaSidebar,
    selectAttachmentFile,
    onSetAnnotation,
    aiCreate,
    setupEventListeners,
  }
}
