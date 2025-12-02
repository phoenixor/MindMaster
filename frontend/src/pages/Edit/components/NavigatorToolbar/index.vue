<template>
  <div class="navigatorContainer customScrollbar">
    <!-- 回到根节点 -->
    <div class="item">
      <IconBtn
        name="backToRoot"
        :content="$t('navigatorToolbar.backToRoot')"
        :icon="FocusIcon"
        :handleClick="handleIconClick"
      />
    </div>
    <!-- 搜索内容 -->
    <div class="item">
      <IconBtn
        name="showSearch"
        :content="$t('navigatorToolbar.showSearch')"
        :icon="SearchIcon"
        :handleClick="handleIconClick"
      />
    </div>
    <!-- 左右键功能切换 -->
    <div class="item">
      <MouseAction :mindMap="mindMap" />
    </div>
    <!-- 小地图 -->
    <div class="item">
      <IconBtn
        name="toggleMiniMap"
        :content="
          openMiniMap ? $t('navigatorToolbar.closeMiniMap') : $t('navigatorToolbar.openMiniMap')
        "
        :icon="openMiniMap ? CompassFilledIcon : CompassIcon"
        :handleClick="handleIconClick"
      />
    </div>
    <!-- 只读/编辑模式切换 -->
    <div class="item">
      <IconBtn
        name="readonlyChange"
        :content="
          appStore.isReadonly ? $t('navigatorToolbar.edit') : $t('navigatorToolbar.readonly')
        "
        :icon="appStore.isReadonly ? BrowseIcon : EditIcon"
        :handleClick="handleIconClick"
      />
    </div>
    <!-- 全屏查看 -->
    <div class="item">
      <IconBtn
        name="fullscreenShow"
        :content="$t('fullscreen.fullscreenShow')"
        :icon="Fullscreen2Icon"
        :handleClick="handleIconClick"
      />
    </div>
    <!-- 全屏编辑 -->
    <div class="item">
      <IconBtn
        name="fullscreenEdit"
        :content="$t('fullscreen.fullscreenEdit')"
        :icon="Fullscreen1Icon"
        :handleClick="handleIconClick"
      />
    </div>
    <!-- 缩放 -->
    <div class="item">
      <Scale :mindMap="mindMap" />
    </div>
    <!-- 
    <div class="item">
      <div
        class="btn iconfont"
        :class="[isDark ? 'iconmoon_line' : 'iconlieri']"
        @click="toggleDark"
      ></div>
    </div>
    <div class="item">
      <Demonstrate :isDark="isDark" :mindMap="mindMap"></Demonstrate>
    </div>
    <div class="item">
      <t-dropdown @command="handleCommand">
        <div class="btn iconfont icongengduo"></div>
        <t-dropdown-menu>
          <t-dropdown-item value="shortcutKey">
            <span class="iconfont iconjianpan"></span>
            快捷键
          </t-dropdown-item>
          <t-dropdown-item value="aiChat">
            <span class="iconfont iconAIshengcheng"></span>
            AI
          </t-dropdown-item>
          <t-dropdown-item value="client">
            <span class="iconfont iconxiazai"></span>
            下载客户端
          </t-dropdown-item>
          <t-dropdown-item value="github">
            <span class="iconfont icongithub"></span>
            Github
          </t-dropdown-item>
          <t-dropdown-item value="site">
            <span class="iconfont iconwangzhan"></span>
            官网
          </t-dropdown-item>
          <t-dropdown-item value="version" disabled> 当前版本v{{ version }} </t-dropdown-item>
        </t-dropdown-menu>
      </t-dropdown>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import appStore from '@/stores'
import Scale from './Scale.vue'
import MouseAction from './MouseAction.vue'
import Demonstrate from './Demonstrate.vue'
import pkg from 'simple-mind-map/package.json'
import {
  FocusIcon,
  SearchIcon,
  CompassIcon,
  CompassFilledIcon,
  EditIcon,
  BrowseIcon,
  Fullscreen2Icon,
  Fullscreen1Icon,
} from 'tdesign-icons-vue-next'
import IconBtn from './IconBtn.vue'
import emitter from '@/utils/eventBus'
import { fullscreenEvent, fullScreen } from '@/utils'

const { mindMap } = defineProps({
  mindMap: {
    type: Object,
    required: true,
  },
})

// 响应式数据
const version = ref(pkg.version)
const openMiniMap = ref(false)

const iconBtnActions = {
  backToRoot: () => {
    mindMap.renderer.setRootNodeCenter()
  },
  showSearch: () => {
    emitter.emit('show_search')
  },
  toggleMiniMap() {
    openMiniMap.value = !openMiniMap.value
    emitter.emit('toggle_mini_map', openMiniMap.value)
  },
  readonlyChange() {
    appStore.setIsReadonly(!appStore.isReadonly)
    mindMap.setMode(appStore.isReadonly ? 'readonly' : 'edit')
  },
  fullscreenShow() {
    fullScreen(mindMap.el)
  },
  fullscreenEdit() {
    fullScreen(document.body)
  },
}

const handleIconClick = (name) => {
  const action = iconBtnActions[name]
  if (action) {
    action()
  } else {
    console.warn(`未知的按钮类型: ${name}`)
  }
}

// 方法
const readonlyChange = () => {
  appStore.setIsReadonly(!isReadonly.value)
  mindMap.setMode(isReadonly.value ? 'readonly' : 'edit')
}

const showSearch = () => {
  mindMap.bus.$emit('show_search')
}

const toggleDark = () => {
  appStore.setLocalConfig({
    isDark: !isDark.value,
  })
}

const handleCommand = (value) => {
  if (value === 'shortcutKey') {
    appStore.setActiveSidebar('shortcutKey')
    return
  } else if (value === 'aiChat') {
    appStore.setActiveSidebar('ai')
    return
  } else if (value === 'client') {
    mindMap.bus.$emit('showDownloadTip', '下载客户端', '支持Windows、Mac、Linux系统')
    return
  }

  let url = ''
  switch (value) {
    case 'github':
      url = 'https://github.com/wanglin2/mind-map'
      break
    case 'helpDoc':
      url = 'https://wanglin2.github.io/mind-map-docs/help/help1.html'
      break
    case 'devDoc':
      url = 'https://wanglin2.github.io/mind-map-docs/start/introduction.html'
      break
    case 'site':
      url = 'https://wanglin2.github.io/mind-map-docs/'
      break
    case 'issue':
      url = 'https://github.com/wanglin2/mind-map/issues/new'
      break
    default:
      break
  }

  if (url) {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.click()
  }
}

onMounted(() => {
  // 组件挂载时添加全屏事件监听
  document[fullscreenEvent] = () => {
    setTimeout(() => {
      props.mindMap.resize()
    }, 1000)
  }
})
</script>

<style lang="less" scoped>
.navigatorContainer {
  padding: 0 12px;
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: hsla(0, 0%, 100%, 0.8);
  border-radius: 5px;
  opacity: 0.8;
  height: 44px;
  font-size: 12px;
  display: flex;
  align-items: center;
  .item {
    cursor: pointer;
    margin-right: 20px;
    &:last-of-type {
      margin-right: 0;
    }
    a {
      color: #303133;
      text-decoration: none;
    }
    .btn {
      cursor: pointer;
      font-size: 18px;
    }
  }
}

@media screen and (max-width: 700px) {
  .navigatorContainer {
    left: 20px;
    overflow-x: auto;
    overflow-y: hidden;
    height: 60px;
  }
}
</style>
