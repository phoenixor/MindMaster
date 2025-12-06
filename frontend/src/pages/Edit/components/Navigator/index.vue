<template>
    <div v-if="showMiniMap" class="navigatorBox" ref="navigatorRef" :style="{ width: width + 'px' }"
        @mousedown="onMousedown" @mousemove="onMousemove">
        <div class="svgBox" ref="svgRef" :style="{
            transform: `scale(${svgBoxScale})`,
            left: svgBoxLeft + 'px',
            top: svgBoxTop + 'px'
        }">
            <img :src="mindMapImg" @mousedown.prevent />
        </div>
        <div class="windowBox" :style="viewBoxStyle" :class="{ withTransition: withTransition }"
            @mousedown.stop="onViewBoxMousedown" @mousemove="onViewBoxMousemove"></div>
    </div>
</template>

<script setup>
/** 导航容器，小地图 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import emitter from '@/utils/eventBus';

const { mindMap } = defineProps({
    mindMap: {
        type: Object,
    }
})

const showMiniMap = ref(false)
const boxWidth = ref(0)
const boxHeight = ref(0)
const svgBoxScale = ref(1)
const svgBoxLeft = ref(0)
const svgBoxTop = ref(0)
const viewBoxStyle = ref({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0
})
const mindMapImg = ref('')
const setSizeTimer = ref(null)
const withTransition = ref(true)
const navigatorRef = ref(null)
const svgRef = ref(null)

const width = ref(0)
const timer = ref(null)

/** 切换显示小地图 */
const toggleMiniMap = (show) => {
    showMiniMap.value = show
    nextTick(() => {
        if (navigatorRef.value) {
            setContainerSize()
        }
        if (svgRef.value) {
            drawMiniMap()
        }
    })
}

/** 思维导图数据改变，更新小地图 */
const dataChange = () => {
    if (!showMiniMap.value) {
        return
    }
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        drawMiniMap()
    }, 500)
}

/** 设置容器宽高并绘制小地图 */
const render = () => {
    clearTimeout(setSizeTimer.value)
    setSizeTimer.value = setTimeout(() => {
        width.value = Math.min(window.innerWidth - 80, 370)
        nextTick(() => {
            if (showMiniMap.value) {
                setContainerSize()
                drawMiniMap()
            }
        })
    }, 300)
}

/** 设置导航容器宽高 */
const setContainerSize = () => {
    const { width, height } = navigatorRef.value.getBoundingClientRect()
    boxWidth.value = width
    boxHeight.value = height
}

/** 小地图渲染 */
const drawMiniMap = () => {
    const {
        getImgUrl,
        viewBoxStyle: newViewBoxStyle,
        miniMapBoxScale,
        miniMapBoxLeft,
        miniMapBoxTop
    } = mindMap.miniMap.calculationMiniMap(boxWidth.value, boxHeight.value)
    // 渲染到小地图
    getImgUrl(img => {
        mindMapImg.value = img
    })
    viewBoxStyle.value = newViewBoxStyle
    svgBoxScale.value = miniMapBoxScale
    svgBoxLeft.value = miniMapBoxLeft
    svgBoxTop.value = miniMapBoxTop
}

// 小地图鼠标按下事件
const onMousedown = (e) => {
    mindMap.miniMap.onMousedown(e)
}

// 小地图鼠标移动事件
const onMousemove = (e) => {
    mindMap.miniMap.onMousemove(e)
}

// 鼠标松开事件，最好绑定要window
const onMouseup = (e) => {
    if (!withTransition.value) {
        withTransition.value = true
    }
    if (mindMap.miniMap) mindMap.miniMap.onMouseup(e)
}

// 视口框的鼠标按下事件
const onViewBoxMousedown = (e) => {
    mindMap.miniMap.onViewBoxMousedown(e)
}

// 视口框的鼠标移动事件
const onViewBoxMousemove = (e) => {
    mindMap.miniMap.onViewBoxMousemove(e)
}

// 视口框的位置大小改变了，需要更新
const onViewBoxPositionChange = ({ left, right, top, bottom }) => {
    withTransition.value = false
    viewBoxStyle.left = left
    viewBoxStyle.right = right
    viewBoxStyle.top = top
    viewBoxStyle.bottom = bottom
}

onMounted(() => {
    render()
    window.addEventListener('resize', render)
    emitter.on('toggle_mini_map', toggleMiniMap)
    emitter.on('data_change', dataChange)
    emitter.on('view_data_change', dataChange)
    emitter.on('node_tree_render_end', dataChange)
    window.addEventListener('mouseup', onMouseup)
    mindMap.on(
        'mini_map_view_box_position_change',
        onViewBoxPositionChange
    )
})

onUnmounted(() => {
    window.removeEventListener('resize', render)
    emitter.off('toggle_mini_map', toggleMiniMap)
    emitter.off('data_change', dataChange)
    emitter.off('view_data_change', dataChange)
    emitter.off('node_tree_render_end', dataChange)
    window.removeEventListener('mouseup', onMouseup)
    mindMap.off(
        'mini_map_view_box_position_change',
        onViewBoxPositionChange
    )
    clearTimeout(timer.value)
    clearTimeout(setSizeTimer.value)
})
</script>

<style lang="less" scoped>
.navigatorBox {
    position: absolute;
    height: 220px;
    background-color: #fff;
    bottom: 80px;
    right: 70px;
    box-shadow: 0 0 16px #989898;
    border-radius: 4px;
    border: 1px solid #eee;
    cursor: pointer;
    user-select: none;

    .svgBox {
        position: absolute;
        left: 0;
        transform-origin: left top;
    }

    .windowBox {
        position: absolute;
        border: 2px solid rgb(238, 69, 69);
        background-color: rgba(238, 69, 69, 0.2);

        &.withTransition {
            transition: all 0.3s;
        }
    }
}
</style>
