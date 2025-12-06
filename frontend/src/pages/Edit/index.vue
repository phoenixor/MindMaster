<template>
  <div class="container" :class="{ activeSidebar: appStore.activeSidebar }">
    <template v-if="show">
      <Toolbar v-if="!appStore.localConfig.isZenMode" />
      <Editor />
    </template>
  </div>
</template>

<script setup>
import Toolbar from './components/Toolbar/index.vue'
import Editor from './components/EditorTest/index.vue'
// import Editor from './components/Editor/index.vue'
import appStore from '@/stores'
import { ref, onMounted } from 'vue'
import { getLocalConfig } from '@/api'
import { showLoading, hideLoading } from '@/utils/loading'

const show = ref(false)
const initLocalConfig = () => {
  let config = getLocalConfig()
  if (config) {
    appStore.setLocalConfig({
      ...appStore.localConfig,
      ...config
    })
  }
}

onMounted(async () => {
  initLocalConfig()
  showLoading()
  show.value = true
  hideLoading()
})
</script>