// composables/useDragImport.js
import { ref } from 'vue'
import emitter from '@/utils/eventBus'
import appStore from '@/stores'

/**
 * 拖拽导入hooks
 * @returns 
 */
export default function useDragImport() {
  const showDragMask = ref(false)  
  /** 拖拽进入 */
  const onDragEnter = () => {
    if (!appStore.localConfig.enableDragImport || appStore.isDragOutlineTreeNode) return
    showDragMask.value = true
  }
  
  /** 拖拽离开 */
  const onDragLeave = () => {
    showDragMask.value = false
  }
  
  /** 拖拽放置文件 */
  const onDrop = (e) => {
    if (!appStore.localConfig.enableDragImport) return
    showDragMask.value = false
    const dt = e.dataTransfer
    const file = dt.files && dt.files[0]
    if (!file) return
    emitter.emit('importFile', file)
  }
  
  return {
    showDragMask,
    onDragEnter,
    onDragLeave,
    onDrop
  }
}