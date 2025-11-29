import emitter from '@/utils/eventBus.js'
import { ref } from 'vue'

/**
 * 拖拽功能 - 处理拖拽相关功能
 * 分离关注点，将不同类型的拖拽操作分组管理
 * @param {Ref<boolean>} enableDragImport - 是否开启文件拖拽导入
 * @param {Ref<boolean>} isDragOutlineTreeNode - 是否开启大纲树节点拖拽
 */
export default function useDragAndDrop(enableDragImport, isDragOutlineTreeNode) {
  const showDragMask = ref(false)

  // === 文件拖拽导入 ===
  /** 拖拽文件到页面导入 */
  const onDragEnter = () => {
    if (!enableDragImport.value || isDragOutlineTreeNode.value) return
    showDragMask.value = true
  }
  
  /** 拖拽文件离开页面 */
  const onDragLeave = () => {
    showDragMask.value = false
  }

  /** 处理文件拖放 */
  const onDrop = (e) => {
    if (!enableDragImport.value) return

    showDragMask.value = false
    const dt = e.dataTransfer
    const file = dt.files && dt.files[0]
    if (!file) return
    emitter.emit('importFile', file)
  }

  return {
    // 状态
    showDragMask,
    // 文件拖拽
    onDragEnter,
    onDragLeave,
    onDrop,
  }
}