<template>
  <div class="toolbarContainer">
    <div class="toolbar" ref="toolbarRef">
      <!-- 节点操作 -->
      <div class="toolbarBlock">
        <ToolBtnsBar :btn-list="defaultBtnList" />
      </div>

      <div class="toolbarBlock">
        <ToolBtnsBar :btn-list="defaultBtnList.slice(0, 6)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ToolBtnsBar from './ToolBtnsBar.vue'
import { defaultBtnList } from './const.js'
// 工具栏
// let fileHandle = null
// isMobile: isMobile(),
// horizontalList: [],
// verticalList: [],
// showMoreBtn: true,
// popoverShow: false,
// fileTreeProps: {
// label: 'name',
// children: 'children',
// isLeaf: 'leaf',
// },
// fileTreeVisible: false,
// rootDirName: '',
// fileTreeExpand: true,
// waitingWriteToLocalFile: false,

// computed: {
//     ...mapState({
//         isDark: (state) => state.localConfig.isDark,
//         isHandleLocalFile: (state) => state.isHandleLocalFile,
//         openNodeRichText: (state) => state.localConfig.openNodeRichText,
//         enableAi: (state) => state.localConfig.enableAi,
// }),

// btnLit() {
//     let res = [...defaultBtnList]
//     if (!this.openNodeRichText) {
//     res = res.filter((item) => {
//         return item !== 'formula'
//     })
//     }
//     if (!this.enableAi) {
//     res = res.filter((item) => {
//         return item !== 'ai'
//     })
//     }
//     return res
// },
// },
// watch: {
// isHandleLocalFile(val) {
//     if (!val) {
//     Notification.closeAll()
//     }
// },
// btnLit: {
//     deep: true,
//     handler() {
//     this.computeToolbarShow()
//     },
// },
// },
// created() {
// this.$bus.$on('write_local_file', this.onWriteLocalFile)
// },
// mounted() {
// this.computeToolbarShow()
// this.computeToolbarShowThrottle = throttle(this.computeToolbarShow, 300)
// window.addEventListener('resize', this.computeToolbarShowThrottle)
// this.$bus.$on('lang_change', this.computeToolbarShowThrottle)
// window.addEventListener('beforeunload', this.onUnload)
// this.$bus.$on('node_note_dblclick', this.onNodeNoteDblclick)
// },
// beforeDestroy() {
// this.$bus.$off('write_local_file', this.onWriteLocalFile)
// window.removeEventListener('resize', this.computeToolbarShowThrottle)
// this.$bus.$off('lang_change', this.computeToolbarShowThrottle)
// window.removeEventListener('beforeunload', this.onUnload)
// this.$bus.$off('node_note_dblclick', this.onNodeNoteDblclick)
// },
// methods: {
// // 计算工具按钮如何显示
// computeToolbarShow() {
//     if (!this.$refs.toolbarRef) return
//     const windowWidth = window.innerWidth - 40
//     const all = [...this.btnLit]
//     let index = 1
//     const loopCheck = () => {
//     if (index > all.length) return done()
//     this.horizontalList = all.slice(0, index)
//     this.$nextTick(() => {
//         const width = this.$refs.toolbarRef.getBoundingClientRect().width
//         if (width < windowWidth) {
//         index++
//         loopCheck()
//         } else if (index > 0 && width > windowWidth) {
//         index--
//         this.horizontalList = all.slice(0, index)
//         done()
//         }
//     })
//     }
//     const done = () => {
//     this.verticalList = all.slice(index)
//     this.showMoreBtn = this.verticalList.length > 0
//     }
//     loopCheck()
// },

// // 监听本地文件读写
// onWriteLocalFile(content) {
//     clearTimeout(this.timer)
//     if (fileHandle && this.isHandleLocalFile) {
//     this.waitingWriteToLocalFile = true
//     }
//     this.timer = setTimeout(() => {
//     this.writeLocalFile(content)
//     }, 1000)
// },

// onUnload(e) {
//     if (this.waitingWriteToLocalFile) {
//     const msg = '存在未保存的数据'
//     e.returnValue = msg
//     return msg
//     }
// },

// // 加载本地文件树
// async loadFileTreeNode(node, resolve) {
//     try {
//     let dirHandle
//     if (node.level === 0) {
//         dirHandle = await window.showDirectoryPicker()
//         this.rootDirName = dirHandle.name
//     } else {
//         dirHandle = node.data.handle
//     }
//     const dirList = []
//     const fileList = []
//     for await (const [key, value] of dirHandle.entries()) {
//         const isFile = value.kind === 'file'
//         if (isFile && !/\.(smm|xmind|md|json)$/.test(value.name)) {
//         continue
//         }
//         const enableEdit = isFile && /\.smm$/.test(value.name)
//         const data = {
//         id: key,
//         name: value.name,
//         type: value.kind,
//         handle: value,
//         leaf: isFile,
//         enableEdit,
//         }
//         if (isFile) {
//         fileList.push(data)
//         } else {
//         dirList.push(data)
//         }
//     }
//     resolve([...dirList, ...fileList])
//     } catch (error) {
//     console.log(error)
//     this.fileTreeVisible = false
//     resolve([])
//     if (error.toString().includes('aborted')) {
//         return
//     }
//     this.$message.warning(this.$t('toolbar.notSupportTip'))
//     }
// },

// // 扫描本地文件夹
// openDirectory() {
//     this.fileTreeVisible = false
//     this.fileTreeExpand = true
//     this.rootDirName = ''
//     this.$nextTick(() => {
//     this.fileTreeVisible = true
//     })
// },

// // 编辑指定文件
// editLocalFile(data) {
//     if (data.handle) {
//     fileHandle = data.handle
//     this.readFile()
//     }
// },

// // 导入指定文件
// async importLocalFile(data) {
//     try {
//     const file = await data.handle.getFile()
//     this.$refs.ImportRef.onChange({
//         raw: file,
//         name: file.name,
//     })
//     this.$refs.ImportRef.confirm()
//     } catch (error) {
//     console.log(error)
//     }
// },

// // 打开本地文件
// async openLocalFile() {
//     try {
//     let [_fileHandle] = await window.showOpenFilePicker({
//         types: [
//         {
//             description: '',
//             accept: {
//             'application/json': ['.smm'],
//             },
//         },
//         ],
//         excludeAcceptAllOption: true,
//         multiple: false,
//     })
//     if (!_fileHandle) {
//         return
//     }
//     fileHandle = _fileHandle
//     if (fileHandle.kind === 'directory') {
//         this.$message.warning(this.$t('toolbar.selectFileTip'))
//         return
//     }
//     this.readFile()
//     } catch (error) {
//     console.log(error)
//     if (error.toString().includes('aborted')) {
//         return
//     }
//     this.$message.warning(this.$t('toolbar.notSupportTip'))
//     }
// },

// // 读取本地文件
// async readFile() {
//     let file = await fileHandle.getFile()
//     let fileReader = new FileReader()
//     fileReader.onload = async () => {
//     this.$store.commit('setIsHandleLocalFile', true)
//     this.setData(fileReader.result)
//     Notification.closeAll()
//     Notification({
//         title: this.$t('toolbar.tip'),
//         message: `${this.$t('toolbar.editingLocalFileTipFront')}${
//         file.name
//         }${this.$t('toolbar.editingLocalFileTipEnd')}`,
//         duration: 0,
//         showClose: true,
//     })
//     }
//     fileReader.readAsText(file)
// },

// // 渲染读取的数据
// setData(str) {
//     try {
//     let data = JSON.parse(str)
//     if (typeof data !== 'object') {
//         throw new Error(this.$t('toolbar.fileContentError'))
//     }
//     if (data.root) {
//         this.isFullDataFile = true
//     } else {
//         this.isFullDataFile = false
//         data = {
//         ...exampleData,
//         root: data,
//         }
//     }
//     this.$bus.$emit('setData', data)
//     } catch (error) {
//     console.log(error)
//     this.$message.error(this.$t('toolbar.fileOpenFailed'))
//     }
// },

// // 写入本地文件
// async writeLocalFile(content) {
//     if (!fileHandle || !this.isHandleLocalFile) {
//     this.waitingWriteToLocalFile = false
//     return
//     }
//     if (!this.isFullDataFile) {
//     content = content.root
//     }
//     let string = JSON.stringify(content)
//     const writable = await fileHandle.createWritable()
//     await writable.write(string)
//     await writable.close()
//     this.waitingWriteToLocalFile = false
// },

// // 创建本地文件
// async createNewLocalFile() {
//     await this.createLocalFile(exampleData)
// },

// // 另存为
// async saveLocalFile() {
//     let data = getData()
//     await this.createLocalFile(data)
// },

// // 创建本地文件
// async createLocalFile(content) {
//     try {
//     let _fileHandle = await window.showSaveFilePicker({
//         types: [
//         {
//             description: '',
//             accept: { 'application/json': ['.smm'] },
//         },
//         ],
//         suggestedName: this.$t('toolbar.defaultFileName'),
//     })
//     if (!_fileHandle) {
//         return
//     }
//     const loading = this.$loading({
//         lock: true,
//         text: this.$t('toolbar.creatingTip'),
//         spinner: 'el-icon-loading',
//         background: 'rgba(0, 0, 0, 0.7)',
//     })
//     fileHandle = _fileHandle
//     this.$store.commit('setIsHandleLocalFile', true)
//     this.isFullDataFile = true
//     await this.writeLocalFile(content)
//     await this.readFile()
//     loading.close()
//     } catch (error) {
//     console.log(error)
//     if (error.toString().includes('aborted')) {
//         return
//     }
//     this.$message.warning(this.$t('toolbar.notSupportTip'))
//     }
// },

// onNodeNoteDblclick(node, e) {
//     e.stopPropagation()
//     this.$bus.$emit('showNodeNote', node)
// },
// },
// }
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
    z-index: 2;

    .toolbarBlock {
      display: flex;
      background-color: #fff;
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

          .fileTreeName {
          }

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
