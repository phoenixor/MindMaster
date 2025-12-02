// composables/usePlugins.js
import { watch } from 'vue'
import appStore from '@/stores'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import ScrollbarPlugin from 'simple-mind-map/src/plugins/Scrollbar.js'

/**
 * 主要用于动态添加或移除插件
 * @param {Ref<object>} mindMap
 * @returns
 */
export default function usePlugins(mindMap) {
  // 加载富文本插件
  const addRichTextPlugin = () => {
    if (mindMap.value) {
      mindMap.value.addPlugin(RichText)
    }
  }

  // 移除富文本插件
  const removeRichTextPlugin = () => {
    if (mindMap.value) {
      mindMap.value.removePlugin(RichText)
    }
  }

  // 加载滚动条插件
  const addScrollbarPlugin = () => {
    if (mindMap.value) {
      mindMap.value.addPlugin(ScrollbarPlugin)
    }
  }

  // 移除滚动条插件
  const removeScrollbarPlugin = () => {
    if (mindMap.value) {
      mindMap.value.removePlugin(ScrollbarPlugin)
    }
  }

  watch(
    () => appStore.localConfig.openNodeRichText,
    (newVal) => (newVal ? addRichTextPlugin() : removeRichTextPlugin()),
  )
  watch(
    () => appStore.localConfig.isShowScrollbar,
    (newVal) => (newVal ? addScrollbarPlugin() : removeScrollbarPlugin()),
  )

  return {
    addRichTextPlugin,
    removeRichTextPlugin,
    addScrollbarPlugin,
    removeScrollbarPlugin,
  }
}
