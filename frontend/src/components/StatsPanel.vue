<script setup lang="ts">
import { useEventStore } from '@/stores/eventStore'
import { EVENT_TYPE_LABELS, SEVERITY_LABELS } from '@/types'

const eventStore = useEventStore()

const emit = defineEmits<{
  (e: 'region-click', regionName: string): void
}>()

// 点击热点区域，定位地图到该区域
const handleRegionClick = (regionName: string) => {
  emit('region-click', regionName)
}
</script>

<template>
  <div class="flex items-center justify-center gap-6 px-6 py-2 h-full">
    <!-- 总事件数 -->
    <div class="flex items-center gap-2">
      <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-all hover:scale-110 hover:bg-gray-200">
        <span class="text-lg font-bold text-gray-700">{{ eventStore.totalCount }}</span>
      </div>
      <span class="text-sm text-gray-600">总事件</span>
    </div>

    <!-- 本周新增 -->
    <div class="flex items-center gap-2">
      <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center transition-all hover:scale-110 hover:bg-blue-100">
        <span class="text-lg font-bold text-blue-600">{{ eventStore.weeklyCount }}</span>
      </div>
      <span class="text-sm text-gray-600">本周新增</span>
    </div>

    <!-- 热点区域 -->
    <div class="flex items-center gap-2">
      <span class="text-sm">🔥</span>
      <div class="flex gap-1">
        <span
          v-for="region in eventStore.hotRegions.slice(0, 5)"
          :key="region.name"
          class="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded cursor-pointer transition-all hover:bg-red-100 hover:text-red-600 hover:scale-105"
          @click="handleRegionClick(region.name)"
        >
          {{ region.name }} {{ region.count }}
        </span>
      </div>
    </div>

    <!-- 按类型统计 -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500">类型:</span>
      <div class="flex gap-1">
        <span
          v-for="item in eventStore.byType.filter(i => i.count > 0)"
          :key="item.type"
          class="text-xs px-2 py-1 rounded transition-all hover:scale-105"
          :style="{ backgroundColor: item.type === 'military_conflict' ? '#fef2f2' : item.type === 'terrorist_attack' ? '#fff7ed' : item.type === 'political_unrest' ? '#fefce8' : item.type === 'border_clash' ? '#faf5ff' : '#f3f4f6' }"
        >
          {{ EVENT_TYPE_LABELS[item.type] }}: {{ item.count }}
        </span>
      </div>
    </div>

    <!-- 按严重程度统计 -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500">级别:</span>
      <div class="flex gap-1">
        <span
          v-for="item in eventStore.bySeverity.filter(i => i.count > 0)"
          :key="item.severity"
          class="text-xs bg-gray-100 px-2 py-1 rounded transition-all hover:scale-105 hover:bg-gray-200"
        >
          {{ SEVERITY_LABELS[item.severity] }}: {{ item.count }}
        </span>
      </div>
    </div>
  </div>
</template>