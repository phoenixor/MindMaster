<template>
  <div class="block2Container">
    <div class="blockContent">
      <div class="blockTitle">MindMaster功能一览</div>
      <!-- 使用TDesign的Grid布局 -->
      <!-- 使用新的二维数组按行渲染功能列表 -->
      <t-row align="middle" :gutter="[32, 20]">
        <t-col v-for="(item, i) in featureList" :key="i" :span="4">
          <div class="featureItem">
            <!-- 动态显示图标：如果是组件引用则使用component动态渲染，否则使用t-icon -->
            <component :is="item.icon" size="45" :stroke-width="1.5" stroke-color="#FF4D4F" />
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="desc">{{ item.desc }}</div>
            </div>
          </div>
        </t-col>
      </t-row>
    </div>
  </div>
</template>

<script setup>
import {
  Filter3Icon,
  TreeRoundDotIcon,
  KeyboardIcon,
  TextformatUnderlineIcon,
  ImageIcon,
  GridAddIcon,
  CrookedSmileIcon,
  LinkIcon,
  File1Icon,
  TagIcon,
  MapConnectionIcon,
  MouseIcon,
  MapNavigationIcon,
  FileExportIcon,
  Fingerprint2Icon,
  ArrowLeftRight2Icon,
  BulletpointIcon,
  SettingIcon,
} from 'tdesign-icons-vue-next'

// 功能列表
const featureList = [
  {
    icon: Filter3Icon,
    name: '主题',
    desc: '内置多种主题，允许高度自定义样式，支持注册新主题。',
  },
  {
    icon: TreeRoundDotIcon,
    name: '结构',
    desc: '支持常见的逻辑结构图、思维导图、组织结构图、目录组织图、时间轴、鱼骨图结构。',
  },
  {
    icon: KeyboardIcon,
    name: '快捷键',
    desc: '常用操作支持快捷键，方便使用。',
  },
  {
    icon: TextformatUnderlineIcon,
    name: '富文本',
    desc: '节点支持普通文本和富文本两种类型，通过富文本可以创建样式丰富的节点文本内容。',
  },
  {
    icon: ImageIcon,
    name: '图片',
    desc: '选中任一节点，选择上传图片，让内容达到图文并茂。',
  },
  {
    icon: GridAddIcon,
    name: '概要',
    desc: '补充表述几个节点之间的关系。',
  },
  {
    icon: CrookedSmileIcon,
    name: '图标',
    desc: '通过添加图标来让节点内容更丰富。',
  },
  {
    icon: LinkIcon,
    name: '超链接',
    desc: '节点可插入超链接，鼠标点击即可实现跳转。',
  },
  {
    icon: File1Icon,
    name: '备注',
    desc: '详细的内容可以放在备注中，节点内显得更简单明了。',
  },
  {
    icon: TagIcon,
    name: '标签',
    desc: '如果添加带颜色的标签，来突出要表达的重点。',
  },
  {
    icon: MapConnectionIcon,
    name: '关联线',
    desc: '通过添加关联线来表明节点之间的关联关系。',
  },
  {
    icon: MouseIcon,
    name: '拖动',
    desc: '画布和节点都可以进行拖动。',
  },
  {
    icon: MapNavigationIcon,
    name: '导航器',
    desc: '通过导航器可以方便知道当前画布处于思维导图的哪个部分。',
  },
  {
    icon: FileExportIcon,
    name: '导入导出',
    desc: '支持多种文件格式的导入和导出。',
  },
  {
    icon: Fingerprint2Icon,
    name: '水印',
    desc: '内置支持水印功能，防止隐私泄露。',
  },
  {
    icon: ArrowLeftRight2Icon,
    name: '前进后退',
    desc: '不小心误操作删除或修改内容支持一键撤回或恢复。',
  },
  {
    icon: BulletpointIcon,
    name: '大纲',
    desc: '根据大纲编辑思维导图，让内容更详细也不容易出错。',
  },
  {
    icon: SettingIcon,
    name: '丰富的设置',
    desc: '提供了丰富的功能设置，可以选择合适你的操作行为。',
  },
]
</script>

<style scoped>
.block2Container {
  padding: 40px 0;
  background-color: #ffffff;
}

.blockContent {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.blockTitle {
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

.featureItem {
  display: flex;
  align-items: center;
  height: 120px;
  padding: 10px;
}

.info {
  flex: 1;
  margin-left: 16px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
}

.desc {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}
</style>
