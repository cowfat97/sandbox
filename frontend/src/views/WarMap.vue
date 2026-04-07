<script setup lang="ts">
import { ref } from 'vue'
import { useEventStore } from '@/stores/eventStore'
import LeafletMap from '@/components/LeafletMap.vue'
import EventList from '@/components/EventList.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import type { Perspective } from '@/types'

const eventStore = useEventStore()

const selectedEventId = ref<number | null>(null)
const mapRef = ref<{
  flyToRegion: (name: string) => void
  flyToPerspective: (lat: number, lng: number, zoom?: number) => void
  openPerspectivePopup: (eventId: number, perspective: { name: string; summary?: string; latitude: number; longitude: number }) => void
} | null>(null)

// 地图-列表联动
const handleMarkerClick = (eventId: number) => {
  selectedEventId.value = eventId
}

const handleEventClick = (eventId: number) => {
  selectedEventId.value = eventId
}

// 热点区域点击 → 定位地图（事件列表自动根据视野更新）
const handleRegionClick = (regionName: string) => {
  mapRef.value?.flyToRegion(regionName)
}

// 视角点击 → 定位地图 + 弹窗显示视角摘要
const handlePerspectiveClick = (data: { eventId: number; perspective: Perspective }) => {
  // 先定位地图到视角位置
  mapRef.value?.flyToPerspective(
    data.perspective.latitude,
    data.perspective.longitude,
    data.perspective.zoom
  )
  // 在视角位置创建标记并打开弹窗
  mapRef.value?.openPerspectivePopup(data.eventId, {
    name: data.perspective.name,
    summary: data.perspective.summary,
    latitude: data.perspective.latitude,
    longitude: data.perspective.longitude
  })
}

// 关闭错误提示
const handleCloseError = () => {
  eventStore.clearError()
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 错误提示 -->
    <div
      v-if="eventStore.error"
      class="bg-red-100 border-b border-red-200 px-4 py-2 flex items-center justify-between"
    >
      <span class="text-red-700 text-sm">{{ eventStore.error }}</span>
      <button
        @click="handleCloseError"
        class="text-red-500 hover:text-red-700"
      >
        ✕
      </button>
    </div>

    <!-- 地图 + 事件列表 -->
    <div class="flex-1 flex" style="min-height: 0;">
      <!-- 地图区域 -->
      <div class="flex-1 map-container">
        <LeafletMap ref="mapRef" @marker-click="handleMarkerClick" :selected-id="selectedEventId" />
      </div>

      <!-- 事件列表 -->
      <div class="w-[350px] border-l bg-white overflow-y-auto">
        <EventList
          @event-click="handleEventClick"
          @perspective-click="handlePerspectiveClick"
          :selected-id="selectedEventId"
        />
      </div>
    </div>

    <!-- 统计面板 -->
    <div class="h-[80px] border-t bg-gray-50">
      <StatsPanel @region-click="handleRegionClick" />
    </div>
  </div>
</template>