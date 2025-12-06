import {
  RollbackIcon,
  RollfrontIcon,
  BrushIcon,
  TreeSquareDotVerticalIcon,
  GitMergeIcon,
  DeleteIcon,
  ImageIcon,
  CrookedSmileIcon,
  LinkIcon,
  PenIcon,
  TagIcon,
  AppIcon,
  MapConnectionIcon,
  PiIcon,
  AttachIcon,
  Transform1Icon,
  TextboxIcon,
  LogoAdobeIllustrateIcon,
} from "tdesign-icons-vue-next";
import emitter from "@/utils/eventBus.js";
/**
 * 默认按钮列表
 */
export const defaultBtnList = [
  {
    name: "back",
    icon: RollbackIcon,
    label: "回退",
    handler: () => emitter.emit("execCommand", "BACK"),
  },
  {
    name: "forward",
    icon: RollfrontIcon,
    label: "前进",
    handler: () => emitter.emit("execCommand", "FORWARD"),
  },
  {
    name: "painter",
    icon: BrushIcon,
    label: "格式刷",
    handler: () => emitter.emit("startPainter"),
  },
  {
    name: "siblingNode",
    icon: TreeSquareDotVerticalIcon,
    label: "同级节点",
    handler: () => emitter.emit("execCommand", "INSERT_NODE"),
  },
  {
    name: "childNode",
    icon: GitMergeIcon,
    label: "子节点",
    handler: () => emitter.emit("execCommand", "INSERT_CHILD_NODE"),
  },
  {
    name: "deleteNode",
    icon: DeleteIcon,
    label: "删除节点",
    handler: () => emitter.emit("execCommand", "REMOVE_NODE"),
  },
  {
    name: "image",
    icon: ImageIcon,
    label: "图片",
    handler: () => emitter.emit("showNodeImage"),
  },
  {
    name: "icon",
    icon: CrookedSmileIcon,
    label: "图标",
    handler: () => showNodeIcon,
  },
  {
    name: "link",
    icon: LinkIcon,
    label: "超链接",
  },
  {
    name: "note",
    icon: PenIcon,
    label: "备注",
  },
  {
    name: "tag",
    icon: TagIcon,
    label: "标签",
  },
  {
    name: "summary",
    icon: AppIcon,
    label: "概要",
  },
  {
    name: "associativeLine",
    icon: MapConnectionIcon,
    label: "关联线",
  },
  {
    name: "formula",
    icon: PiIcon,
    label: "公式",
  },
  {
    name: "attachment",
    icon: AttachIcon,
    label: "附件",
  },
  {
    name: "outerFrame",
    icon: Transform1Icon,
    label: "外框",
  },
  {
    name: "annotation",
    icon: TextboxIcon,
    label: "注释",
  },
  {
    name: "ai",
    icon: LogoAdobeIllustrateIcon,
    label: "AI",
  },
];
