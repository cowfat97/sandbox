<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import L from 'leaflet'
import type { WarEvent, EventType, MapBounds } from '@/types'
import { EVENT_TYPE_COLORS, SEVERITY_RADIUS } from '@/types'
import { useEventStore } from '@/stores/eventStore'

const emit = defineEmits<{
  (e: 'marker-click', eventId: number): void
}>()

const props = defineProps<{
  selectedId: number | null
}>()

const mapRef = ref<HTMLDivElement | null>(null)
const map = ref<L.Map | null>(null)
const markers = ref<Map<number, L.CircleMarker>>(new Map())
const perspectiveMarker = ref<L.CircleMarker | null>(null) // 视角临时标记
const openPopupEventId = ref<number | null>(null)
const isSwitchingPopup = ref(false)
let moveEndTimer: ReturnType<typeof setTimeout> | null = null

const eventStore = useEventStore()
const { selectedRegion, events } = storeToRefs(eventStore)

// 根据 eventType 获取标记颜色
const getMarkerColor = (eventType: EventType): string => {
  return EVENT_TYPE_COLORS[eventType]
}

// 根据 severity 获取标记大小
const getMarkerRadius = (severity: number): number => {
  return SEVERITY_RADIUS[severity as 1 | 2 | 3 | 4 | 5] || 8
}

// 创建地图标记
const createMarkers = (eventList: WarEvent[]) => {
  // 记录当前打开弹窗的事件ID
  markers.value.forEach((marker, id) => {
    if (marker.isPopupOpen()) {
      openPopupEventId.value = id
    }
  })

  // 清除旧标记
  markers.value.forEach(marker => marker.remove())
  markers.value.clear()

  eventList.forEach(event => {
    if (!map.value) return

    const marker = L.circleMarker([event.latitude, event.longitude], {
      radius: getMarkerRadius(event.severity),
      fillColor: getMarkerColor(event.eventType),
      color: '#fff',
      weight: 2,
      fillOpacity: 0.8
    })

    // 构建弹窗内容（包含摘要）
    const popupContent = `
      <div class="p-2 max-w-[280px]">
        <h3 class="font-bold text-base mb-1">${event.title}</h3>
        <p class="text-sm text-gray-600 mb-2">${event.locationName}，${event.country} · ${event.eventDate}</p>
        <p class="text-sm text-gray-700 leading-relaxed">${event.summary || '暂无摘要'}</p>
      </div>
    `

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      minWidth: 200,
      autoClose: false,
      closeOnClick: false
    })

    marker.on('click', () => {
      openPopupEventId.value = event.id
      emit('marker-click', event.id)
    })

    // hover 效果
    marker.on('mouseover', () => {
      if (!openPopupEventId.value || openPopupEventId.value !== event.id) {
        marker.setStyle({ weight: 3, fillOpacity: 0.9 })
      }
    })

    marker.on('mouseout', () => {
      if (!openPopupEventId.value || openPopupEventId.value !== event.id) {
        marker.setStyle({ weight: 2, fillOpacity: 0.8 })
      }
    })

    // 监听弹窗关闭事件
    marker.on('popupclose', () => {
      // 如果是切换弹窗，不触发视野过滤
      if (isSwitchingPopup.value) return

      openPopupEventId.value = null
      // 弹窗关闭后触发视野过滤
      const bounds = getMapBounds()
      if (bounds) {
        eventStore.loadMapMarkers(bounds)
      }
    })

    marker.addTo(map.value as any)
    markers.value.set(event.id, marker)

    // 恢复之前打开的弹窗
    if (openPopupEventId.value === event.id) {
      marker.openPopup()
    }
  })
}

// 获取当前视野边界
const getMapBounds = (): MapBounds | null => {
  if (!map.value) return null
  const bounds = map.value.getBounds()
  return {
    minLat: bounds.getSouth(),
    maxLat: bounds.getNorth(),
    minLng: bounds.getWest(),
    maxLng: bounds.getEast()
  }
}

// 地图移动结束后加载数据
const onMapMoveEnd = () => {
  // 如果有弹窗打开，不进行视野过滤
  if (openPopupEventId.value !== null) return

  const bounds = getMapBounds()
  if (bounds) {
    eventStore.loadMapMarkers(bounds)
  }
}

// 高亮选中的标记
watch(() => props.selectedId, (newId) => {
  if (!newId || !map.value) return

  // 如果有旧弹窗，先关闭（设置切换标志避免触发视野过滤）
  if (openPopupEventId.value !== null && openPopupEventId.value !== newId) {
    isSwitchingPopup.value = true
    const oldMarker = markers.value.get(openPopupEventId.value)
    if (oldMarker) {
      oldMarker.closePopup()
      oldMarker.setStyle({ weight: 2, fillOpacity: 0.8 })
    }
  }

  openPopupEventId.value = newId

  const marker = markers.value.get(newId)
  if (!marker) return

  marker.setStyle({ weight: 4, fillOpacity: 1 })
  marker.openPopup()
  map.value.setView(marker.getLatLng(), 6)

  // 重置切换标志
  isSwitchingPopup.value = false
})

// 跳转到指定区域（放大跟随）
const flyToRegion = (regionName: string) => {
  if (!map.value) return

  // 关闭弹窗，允许视野过滤
  openPopupEventId.value = null
  markers.value.forEach(marker => marker.closePopup())

  // 从完整事件列表中查找
  const regionEvent = eventStore.allEvents.find(e => e.country === regionName)

  if (regionEvent) {
    // 放大到 zoom 7，带动画效果
    map.value.flyTo([regionEvent.latitude, regionEvent.longitude], 7, {
      duration: 1
    })
  }
}

// 跳转到指定视角
const flyToPerspective = (lat: number, lng: number, zoom: number = 5) => {
  if (!map.value) return
  map.value.flyTo([lat, lng], zoom, { duration: 1 })
}

// 打开视角弹窗
const openPerspectivePopup = (eventId: number, perspective: { name: string; summary?: string; latitude: number; longitude: number }) => {
  if (!map.value) return

  const event = eventStore.allEvents.find(e => e.id === eventId)
  if (!event) return

  // 关闭之前的弹窗
  openPopupEventId.value = null
  markers.value.forEach(marker => marker.closePopup())

  // 清除之前的视角标记
  if (perspectiveMarker.value) {
    perspectiveMarker.value.remove()
  }

  // 在视角位置创建临时标记
  const marker = L.circleMarker([perspective.latitude, perspective.longitude], {
    radius: 14,
    fillColor: '#3b82f6',
    color: '#fff',
    weight: 3,
    fillOpacity: 0.9
  })

  // 构建视角弹窗内容
  const popupContent = `
    <div class="p-3 max-w-[300px]">
      <h3 class="font-bold text-base mb-1">${event.title}</h3>
      <p class="text-xs text-blue-600 mb-2 font-medium border-b pb-2">${perspective.name}视角</p>
      <p class="text-sm text-gray-700 leading-relaxed">${perspective.summary || '暂无该视角摘要'}</p>
    </div>
  `

  marker.bindPopup(popupContent, {
    maxWidth: 350,
    minWidth: 250,
    autoClose: false,
    closeOnClick: false
  })

  marker.addTo(map.value as any)
  perspectiveMarker.value = marker

  // 延迟打开弹窗（等动画结束）
  setTimeout(() => {
    marker.openPopup()
  }, 1100)
}

// 暴露方法给外部调用
defineExpose({
  flyToRegion,
  flyToPerspective,
  openPerspectivePopup
})

// 监听热点区域点击
watch(selectedRegion, (regionName) => {
  if (regionName) {
    flyToRegion(regionName)
  }
})

// 监听事件数据变化
watch(events, (newEvents) => {
  createMarkers(newEvents)
}, { deep: true })

onMounted(async () => {
  if (!mapRef.value) return

  await nextTick()

  map.value = L.map(mapRef.value, {
    center: [30, 100],
    zoom: 3,
    zoomControl: true
  })

  // 使用谷歌地图瓦片（中文）
  L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=zh-CN&x={x}&y={y}&z={z}', {
    attribution: '© Google Maps',
    maxZoom: 20
  }).addTo(map.value as any)

  // 监听地图移动事件（防抖）
  map.value.on('moveend', () => {
    if (moveEndTimer) clearTimeout(moveEndTimer)
    moveEndTimer = setTimeout(onMapMoveEnd, 300)
  })

  // 点击地图空白处关闭弹窗
  map.value.on('click', (e) => {
    // 如果点击的是marker或popup，不处理
    if ((e as any).originalEvent?.target?.closest('.leaflet-popup') ||
        (e as any).originalEvent?.target?.closest('.leaflet-marker-icon')) {
      return
    }
    openPopupEventId.value = null
    markers.value.forEach(marker => marker.closePopup())
  })

  // 初始加载
  await eventStore.loadEvents()
  await eventStore.loadStats()

  // 定位到热度最高地区
  if (events.value.length > 0) {
    const hottestEvent = events.value.reduce((max, event) =>
      event.severity > max.severity ? event : max
    , events.value[0])
    map.value.setView([hottestEvent.latitude, hottestEvent.longitude], 5)
  }

  // 强制重新计算尺寸
  setTimeout(() => {
    if (map.value) {
      map.value.invalidateSize()
    }
  }, 100)
})

// 清理资源
onUnmounted(() => {
  if (moveEndTimer) {
    clearTimeout(moveEndTimer)
  }
  if (map.value) {
    map.value.off('moveend')
    map.value.off('click')
    map.value.remove()
    map.value = null
  }
  markers.value.clear()
  if (perspectiveMarker.value) {
    perspectiveMarker.value.remove()
    perspectiveMarker.value = null
  }
})
</script>

<template>
  <div ref="mapRef" class="w-full h-full"></div>
</template>