<script setup lang="ts">
import type { WarEvent, Perspective } from '@/types'
import { EVENT_TYPE_LABELS, SEVERITY_LABELS, EVENT_TYPE_COLORS } from '@/types'

const props = defineProps<{
  event: WarEvent
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'perspective-click', data: { eventId: number; perspective: Perspective }): void
}>()
</script>

<template>
  <div
    :class="[
      'p-3 rounded border cursor-pointer transition-all duration-200',
      isSelected
        ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
    ]"
    @click="emit('click')"
  >
    <!-- 标题 + 视角 -->
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-medium text-gray-800 truncate flex-1">{{ event.title }}</h3>
      <!-- 视角按钮（选中时显示） -->
      <div
        v-if="isSelected && event.perspectives && event.perspectives.length > 0"
        class="flex gap-1 shrink-0 animate-fadeIn"
      >
        <button
          v-for="p in event.perspectives"
          :key="p.name"
          class="px-1.5 py-0.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          @click.stop="emit('perspective-click', { eventId: props.event.id, perspective: p })"
        >
          {{ p.name }}
        </button>
      </div>
    </div>

    <!-- 地点 -->
    <p class="text-sm text-gray-500 mt-1">{{ event.locationName }}，{{ event.country }}</p>

    <!-- 类型 + 级别 标签 -->
    <div class="flex items-center gap-2 mt-2">
      <span
        class="px-2 py-0.5 rounded text-xs text-white transition-transform hover:scale-105"
        :style="{ backgroundColor: EVENT_TYPE_COLORS[event.eventType] }"
      >
        {{ EVENT_TYPE_LABELS[event.eventType] }}
      </span>
      <span class="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-600 transition-transform hover:scale-105 hover:bg-gray-300">
        {{ SEVERITY_LABELS[event.severity] }}
      </span>
    </div>

    <!-- 时间 -->
    <p class="text-xs text-gray-400 mt-2">{{ event.eventDate }}</p>
  </div>
</template>