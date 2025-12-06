<template>
  <div class="toolbarContainer">
    <div class="toolbar" ref="toolbarRef">
      <div class="toolbarBlock">
        <!-- <ToolBtnsBar :btn-list="defaultBtnList" /> -->
        <ToolBase v-for="item in defaultBtnList" :key="item.name" :icon="item.icon" :name="item.name"
          :label="item.label" :isDisabled="item.disabled" :isActive="item.name === 'painter' ? isInPainter : false"
          @tool-click="(name) => (name === 'painter' ? (isInPainter = !isInPainter) : '')" />
      </div>

      <div class="toolbarBlock">
        <!-- <ToolBtnsBar :btn-list="defaultBtnList.slice(0, 6)" /> -->
        <ToolBase v-for="item in defaultBtnList.slice(0, 6)" :key="item.name" :icon="item.icon" :name="item.name"
          :label="item.label" :isDisabled="item.disabled" :isActive="item.name === 'painter' ? isInPainter : false"
          @tool-click="(name) => (name === 'painter' ? (isInPainter = !isInPainter) : '')" />
      </div>
    </div>
  </div>
</template>

<script setup>
/** 顶部工具栏 */
import { getData } from '@/api'
import appStore from '@/stores'
import emitter from '@/utils/eventBus.js'
import exampleData from 'simple-mind-map/example/exampleData'
import { isMobile as isMobileUtil, throttle } from 'simple-mind-map/src/utils/index'
import { LoadingPlugin, MessagePlugin, NotifyPlugin } from 'tdesign-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import ToolBtnsBar from './ToolBtnsBar.vue'
import ToolBase from './ToolBase.vue'
import useToolbar from './useToolbar.js'

const toolbarRef = ref(null)

let fileHandle = null
const isMobile = ref(isMobileUtil())
const horizontalList = ref([])
const verticalList = ref([])
const showMoreBtn = ref(true)
const popoverShow = ref(false)
const fileTreeProps = ref({
  label: 'name',
  children: 'children',
  isLeaf: 'leaf',
})
const fileTreeVisible = ref(false)
const rootDirName = ref('')
const fileTreeExpand = ref(true)
const waitingWriteToLocalFile = ref(false)
const isFullDataFile = ref(false)

const {
  defaultBtnList,
  // 状态
  activeNodes,
  backEnd,
  forwardEnd,
  isInPainter,
  hasRoot,
  hasGeneralization,
  annotationRightHasBtn,

  // 方法
  handleToolClick,
  showNodeIconSidebar,
  showFormulaSidebar,
  selectAttachmentFile,
  onSetAnnotation,
  aiCreate,
  setEventHandler,
  removeEventHandler
} = useToolbar()

const btnList = computed(() => {
  let res = defaultBtnList.value.map(item => item.name)
  if (!appStore.localConfig.openNodeRichText) {
    res = res.filter((item) => {
      return item !== 'formula'
    })
  }
  if (!appStore.localConfig.enableAi) {
    res = res.filter((item) => {
      return item !== 'ai'
    })
  }
  return res
})
/** 计算工具按钮如何显示 */
const computeToolbarShow = () => {
  if (!toolbarRef.value) return
  const windowWidth = window.innerWidth - 40
  const all = [...btnList.value]
  let index = 1
  const loopCheck = () => {
    if (index > all.length) return done()
    horizontalList.value = all.slice(0, index)
    nextTick(() => {
      const width = toolbarRef.value.getBoundingClientRect().width
      if (width < windowWidth) {
        index++
        loopCheck()
      } else if (index > 0 && width > windowWidth) {
        index--
        horizontalList.value = all.slice(0, index)
        done()
      }
    })
  }
  const done = () => {
    verticalList.value = all.slice(index)
    showMoreBtn.value = verticalList.value.length > 0
  }
  loopCheck()
}

let timer = null
/** 监听本地文件读写 */
const onWriteLocalFile = (content) => {
  clearTimeout(timer)
  if (fileHandle && appStore.isHandleLocalFile) {
    waitingWriteToLocalFile.value = true
  }
  timer = setTimeout(() => {
    writeLocalFile(content)
  }, 1000)
}
/** 页面卸载前的处理 */
const onUnload = (e) => {
  if (waitingWriteToLocalFile.value) {
    const msg = '存在未保存的数据'
    e.returnValue = msg
    return msg
  }
}
/** 加载本地文件树 */
const loadFileTreeNode = async (node, resolve) => {
  try {
    let dirHandle
    if (node.level === 0) {
      dirHandle = await window.showDirectoryPicker()
      rootDirName.value = dirHandle.name
    } else {
      dirHandle = node.data.handle
    }
    const dirList = []
    const fileList = []
    for await (const [key, value] of dirHandle.entries()) {
      const isFile = value.kind === 'file'
      if (isFile && !/\.(smm|xmind|md|json)$/.test(value.name)) {
        continue
      }
      const enableEdit = isFile && /\.smm$/.test(value.name)
      const data = {
        id: key,
        name: value.name,
        type: value.kind,
        handle: value,
        leaf: isFile,
        enableEdit
      }
      if (isFile) {
        fileList.push(data)
      } else {
        dirList.push(data)
      }
    }
    resolve([...dirList, ...fileList])
  } catch (error) {
    console.error(error)
    fileTreeVisible.value = false
    resolve([])
    if (error.toString().includes('aborted')) {
      return
    }
    MessagePlugin.warning(t('toolbar.notSupportTip'))
  }
}
/** 扫描本地文件夹 */
const openDirectory = () => {
  fileTreeVisible.value = false
  fileTreeExpand.value = true
  rootDirName.value = ''
  nextTick(() => {
    fileTreeVisible.value = true
  })
}
/** 编辑本地文件 */
const editLocalFile = (data) => {
  if (data.handle) {
    fileHandle = data.handle
    readFile()
  }
}
/** 导入指定文件 */
const importLocalFile = async (data) => {
  try {
    const file = await data.handle.getFile()
    ImportRef.value.onChange({
      raw: file,
      name: file.name
    })
    ImportRef.value.confirm()
  } catch (error) {
    console.error(error)
  }
}
/** 打开本地文件 */
const openLocalFile = async () => {
  try {
    let [_fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: '',
          accept: {
            'application/json': ['.smm']
          }
        }
      ],
      excludeAcceptAllOption: true,
      multiple: false
    })
    if (!_fileHandle) {
      return
    }
    fileHandle = _fileHandle
    if (fileHandle.kind === 'directory') {
      MessagePlugin.warning(t('toolbar.selectFileTip'))
      return
    }
    readFile()
  } catch (error) {
    console.error(error)
    if (error.toString().includes('aborted')) {
      return
    }
    MessagePlugin.warning(t('toolbar.notSupportTip'))
  }
}
/** 读取本地文件 */
const readFile = async () => {
  let file = await fileHandle.getFile()
  let fileReader = new FileReader()
  fileReader.onload = async () => {
    appStore.setIsHandleLocalFile(true)
    setData(fileReader.result)
    NotifyPlugin.closeAll()
    NotifyPlugin.info({
      title: t('toolbar.tip'),
      content: `${t('toolbar.editingLocalFileTipFront')}${file.name
        }${t('toolbar.editingLocalFileTipEnd')}`,
      duration: 0,
      closeBtn: true
    })
  }
  fileReader.readAsText(file)
}
/** 渲染读取的数据 */
const setData = (str) => {
  try {
    let data = JSON.parse(str)
    if (typeof data !== 'object') {
      throw new Error(t('toolbar.fileContentError'))
    }
    if (data.root) {
      isFullDataFile.value = true
    } else {
      isFullDataFile.value = false
      data = {
        ...exampleData,
        root: data
      }
    }
    emitter.emit('setData', data)
  } catch (error) {
    console.error(error)
    MessagePlugin.error(t('toolbar.fileOpenFailed'))
  }
}
/** 写入本地文件 */
const writeLocalFile = async (content) => {
  if (!fileHandle || !appStore.isHandleLocalFile) {
    waitingWriteToLocalFile.value = false
    return
  }
  if (!isFullDataFile.value) {
    content = content.root
  }
  let string = JSON.stringify(content)
  const writable = await fileHandle.createWritable()
  await writable.write(string)
  await writable.close()
  waitingWriteToLocalFile.value = false
}
/** 创建本地文件 */
const createNewLocalFile = async () => {
  await createLocalFile(exampleData)
}
/** 另存为 */
const saveLocalFile = async () => {
  let data = getData()
  await createLocalFile(data)
}
/** 创建本地文件 */
const createLocalFile = async (content) => {
  try {
    let _fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: '',
          accept: { 'application/json': ['.smm'] }
        }
      ],
      suggestedName: t('toolbar.defaultFileName')
    })
    if (!_fileHandle) {
      return
    }
    const loading = LoadingPlugin({
      text: t('toolbar.creatingTip')
    })
    fileHandle = _fileHandle
    appStore.setIsHandleLocalFile(true)
    isFullDataFile.value = true
    await writeLocalFile(content)
    await readFile()
    loading.hide()
  } catch (error) {
    console.error(error)
    if (error.toString().includes('aborted')) {
      return
    }
    MessagePlugin.warning(t('toolbar.notSupportTip'))
  }
}
/** 节点备注双击处理 */
const onNodeNoteDblclick = (node, e) => {
  e.stopPropagation()
  emitter.emit('showNodeNote', node)
}

watch(() => appStore.isHandleLocalFile, (val) => {
  if (!val) {
    MessagePlugin.closeAll()
  }
})
watch(btnList, () => {
  computeToolbarShow()
}, { deep: true })

const computeToolbarShowThrottle = throttle(computeToolbarShow, 300)
onMounted(() => {
  computeToolbarShow()
  window.addEventListener('resize', computeToolbarShowThrottle)
  // emitter.on('lang_change', computeToolbarShowThrottle)
  window.addEventListener('beforeunload', onUnload)
  emitter.on('node_note_dblclick', onNodeNoteDblclick)
  emitter.on('write_local_file', onWriteLocalFile)
  setEventHandler()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', computeToolbarShowThrottle)
  // emitter.off('lang_change', computeToolbarShowThrottle)
  window.removeEventListener('beforeunload', onUnload)
  emitter.off('node_note_dblclick', onNodeNoteDblclick)
  emitter.off('write_local_file', onWriteLocalFile)
  removeEventHandler()
})
</script>

<style lang="less" scoped>
.toolbarContainer {
  .toolbar {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: 20px;
    width: max-content;
    display: flex;
    font-size: 12px;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: rgba(26, 26, 26, 0.8);
    z-index: 6666;

    .toolbarBlock {
      display: flex;
      background-color: transparent;
      gap: 4px; // 图标按钮间隔
      padding: 10px 20px;
      border-radius: 6px;
      box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.06);
      margin-right: 20px;
      flex-shrink: 0;
      position: relative;

      &:last-of-type {
        margin-right: 0;
      }

      .fileTreeBox {
        position: absolute;
        left: 0;
        top: 68px;
        width: 100%;
        height: 30px;
        background-color: #fff;
        padding: 12px 5px;
        padding-top: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 5px;
        min-width: 200px;
        box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);

        &.expand {
          height: 300px;

          .fileTreeWrap {
            visibility: visible;
          }
        }

        .fileTreeToolbar {
          width: 100%;
          height: 30px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e9e9e9;
          margin-bottom: 12px;
          padding-left: 12px;

          .fileTreeName {}

          .fileTreeActionList {
            .btn {
              font-size: 18px;
              margin-left: 12px;
              cursor: pointer;
            }
          }
        }

        .fileTreeWrap {
          width: 100%;
          height: 100%;
          overflow: auto;
          visibility: hidden;

          .customTreeNode {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            padding-right: 5px;

            .treeNodeInfo {
              display: flex;
              align-items: center;

              .treeNodeIcon {
                margin-right: 5px;
                opacity: 0.7;
              }

              .treeNodeName {
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }

            .treeNodeBtnList {
              display: flex;
              align-items: center;
            }
          }
        }
      }
    }

    .toolbarBtn {
      display: flex;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      margin-right: 20px;

      &:last-of-type {
        margin-right: 0;
      }

      &:hover {
        &:not(.disabled) {
          .icon {
            background: #f5f5f5;
          }
        }
      }

      &.active {
        .icon {
          background: #f5f5f5;
        }
      }

      &.disabled {
        color: #bcbcbc;
        cursor: not-allowed;
        pointer-events: none;
      }

      .icon {
        display: flex;
        height: 26px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #e9e9e9;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        padding: 0 5px;
      }

      .text {
        margin-top: 3px;
      }
    }
  }
}
</style>
