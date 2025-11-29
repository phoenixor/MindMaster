import { getConfig, getData, storeData } from '@/api'
import imgLoadFailSvg from '@/assets/img/imgLoadFailed.svg'
import icon from '@/config/icon'
import useTranslation from '@/hooks/useTranslation.js'
import emitter from '@/utils/eventBus.js'
import handleClipboardText from '@/utils/handleClipboardText'
import exampleData from 'simple-mind-map/example/exampleData'
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next'
import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

/**
 * 思维导图核心功能 - 负责初始化和管理mindMap实例
 * 分离关注点，将不同功能拆分为更小的方法
 */
export default function useMindMapCore(
  MindMap,
  initPlugins,
  useLeftKeySelectionRightKeyDrag,
  extraTextOnExport,
) {
  /** @type {import('simple-mind-map').default | null} */
  let mindMap = null
  const router = useRouter()
  const t = useTranslation()
  const mindMapData = ref(null)
  const mindMapConfig = ref({})
  const storeConfigTimer = ref(null)

  /**
   * 获取思维导图数据
   */
  const getMindMapData = () => {
    mindMapData.value = getData()
    mindMapConfig.value = getConfig()
  }

  /**
   * 检查URL中是否存在要打开的文件
   */
  const hasFileURL = () => {
    const fileURL = router.currentRoute.value.query.fileURL
    if (!fileURL) return false
    return /\.(smm|json|xmind|md|xlsx)$/.test(fileURL)
  }

  /**
   * 获取初始数据
   */
  const getInitialData = () => {
    const hasFileURLFlag = hasFileURL()
    let { root, layout, theme, view } = mindMapData.value

    // 如果url中存在要打开的文件，那么思维导图数据、主题、布局都使用默认的
    if (hasFileURLFlag) {
      return {
        root: {
          data: { text: t('edit.root') },
          children: [],
        },
        layout: exampleData.layout,
        theme: exampleData.theme,
        view: null,
      }
    }

    return { root, layout, theme, view }
  }

  /**
   * 创建mindMap配置
   */
  const createMindMapConfig = (config) => {
    return {
      el: null, // 将在init中设置
      data: null, // 将在init中设置
      fit: false,
      layout: null, // 将在init中设置
      theme: null, // 将在init中设置
      themeConfig: null, // 将在init中设置
      viewData: null, // 将在init中设置
      nodeTextEditZIndex: 1000,
      nodeNoteTooltipZIndex: 1000,
      customNoteContentShow: {
        show: (content, left, top, node) => {
          emitter.emit('showNoteContent', content, left, top, node)
        },
        hide: () => emitter.emit('hideNoteContent'),
      },
      openRealtimeRenderOnNodeTextEdit: true,
      enableAutoEnterTextEditWhenKeydown: true,
      demonstrateConfig: { openBlankMode: false },
      ...(config || {}),
      iconList: [...icon],
      useLeftKeySelectionRightKeyDrag: useLeftKeySelectionRightKeyDrag.value,
      customInnerElsAppendTo: null,
      customHandleClipboardText: handleClipboardText,
      defaultNodeImage: imgLoadFailSvg,
      initRootNodePosition: ['center', 'center'],
      handleIsSplitByWrapOnPasteCreateNewNode: () => {},
      errorHandler: createErrorHandler(),
      addContentToFooter: createFooterHandler(),
      expandBtnNumHandler: (num) => (num >= 100 ? '…' : num),
      beforeDeleteNodeImg: createDeleteImageHandler(),
    }
  }

  /**
   * 创建错误处理器
   */
  const createErrorHandler = () => {
    return (code, err) => {
      console.error(err)
      switch (code) {
        case 'export_error':
          MessagePlugin.error(t('edit.exportError'))
          break
        default:
          break
      }
    }
  }

  /**
   * 创建页脚处理器
   */
  const createFooterHandler = () => {
    return () => {
      const text = extraTextOnExport.trim()
      if (!text) return null
      const el = document.createElement('div')
      el.className = 'footer'
      el.innerHTML = text
      const cssText = `.footer { width: 100%; height: 30px; display: flex; justify-content: center; align-items: center; font-size: 12px; color: #979797; }`
      return { el, cssText, height: 30 }
    }
  }

  /**
   * 创建删除图片处理器
   */
  const createDeleteImageHandler = () => {
    return (node) => {
      return new Promise((resolve) => {
        const confirmDialog = DialogPlugin.confirm({
          header: t('edit.deleteNodeImgTip'),
          body: t('edit.tip'),
          confirmBtn: {
            content: t('edit.yes'),
            theme: 'warning',
            loading: true,
          },
          theme: 'warning',
          destroyOnClose: true,
          onConfirm: () => {
            confirmDialog.update({ confirmBtn: { content: '提交中', loading: true } })
            const timer = setTimeout(() => {
              confirmDialog.update({ confirmBtn: { content: '提交', loading: false } })
              confirmDialog.hide()
              clearTimeout(timer)
            }, 500)
            resolve(true)
          },
        })
      })
    }
  }

  /**
   * 绑定保存事件
   */
  const bindSaveEvent = () => {
    emitter.on('data_change', (data) => {
      storeData({ root: data })
    })
    emitter.on('view_data_change', (data) => {
      clearTimeout(storeConfigTimer.value)
      storeConfigTimer.value = setTimeout(() => {
        storeData({ view: data })
      }, 300)
    })
  }

  /**
   * 转发mindMap事件
   */
  const forwardEvents = () => {
    const events = [
      'node_active',
      'data_change',
      'view_data_change',
      'back_forward',
      'node_contextmenu',
      'node_click',
      'draw_click',
      'expand_btn_click',
      'svg_mousedown',
      'mouseup',
      'mode_change',
      'node_tree_render_end',
      'rich_text_selection_change',
      'transforming-dom-to-images',
      'generalization_node_contextmenu',
      'painter_start',
      'painter_end',
      'scrollbar_change',
      'scale',
      'translate',
      'node_attachmentClick',
      'node_attachmentContextmenu',
      'demonstrate_jump',
      'exit_demonstrate',
      'node_note_dblclick',
      'node_mousedown',
    ]
    events.forEach((event) => {
      mindMap.on(event, (...args) => emitter.emit(event, ...args))
    })
  }

  /**
   * 添加快捷键
   */
  const addShortcuts = (manualSave) => {
    mindMap.keyCommand.addShortcut('Control+s', manualSave)
  }

  /**
   * 处理特殊情况
   */
  const handleSpecialCases = () => {
    if (window.takeOverApp) emitter.emit('app_inited', mindMap)
    if (hasFileURL()) emitter.emit('handle_file_url')

    // 提供获取最新数据的方法
    window.getCurrentData = () => {
      const fullData = mindMap.getData(true)
      return { ...fullData }
    }
  }

  /**
   * 初始化协同测试功能
   */
  const initCooperateTest = () => {
    if (mindMap.cooperate && router.currentRoute.value.query.userName) {
      mindMap.cooperate.setProvider(null, {
        roomName: 'demo-room',
        signalingList: ['ws://localhost:4444'],
      })
      mindMap.cooperate.setUserInfo({
        id: Math.random(),
        name: router.currentRoute.value.query.userName,
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'][
          Math.floor(Math.random() * 5)
        ],
        avatar:
          Math.random() > 0.5
            ? 'https://img0.baidu.com/it/u=4270674549,2416627993&fm=253&app=138&size=w931&n=0&f=JPEG&fmt=auto?sec=1696006800&t=4d32871d14a7224a4591d0c3c7a97311'
            : '',
      })
    }
  }

  /**
   * 初始化思维导图
   * @param {ref<HTMLElement>} mindMapRef - 思维导图容器元素的 ref
   * @param {Function} manualSave - 手动保存的回调函数
   */
  const initMindMap = (mindMapRef, manualSave) => {
    const initialData = getInitialData()
    const config = createMindMapConfig(mindMapConfig.value)

    // 设置容器和数据
    config.el = mindMapRef.value
    config.data = initialData.root
    config.layout = initialData.layout
    config.theme = initialData.theme.template
    config.themeConfig = initialData.theme.config
    config.viewData = initialData.view

    // 创建mindMap实例
    mindMap = new MindMap(config)

    // 初始化插件
    initPlugins(mindMap)

    // 添加快捷键
    addShortcuts(manualSave)

    // 转发事件
    forwardEvents()

    // 绑定保存事件
    bindSaveEvent()

    // 处理特殊情况
    handleSpecialCases()

    // 初始化协同测试
    initCooperateTest()
  }

  /**
   * 清理资源
   */
  const cleanup = () => {
    if (mindMap) mindMap.destroy()
    clearTimeout(storeConfigTimer.value)
  }

  return {
    mindMap,
    mindMapData,
    mindMapConfig,
    getMindMapData,
    initMindMap,
    cleanup,
  }
}
