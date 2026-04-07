<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useEventStore } from '@/stores/eventStore'
import EventCard from '@/components/EventCard.vue'
import type { Perspective } from '@/types'

const emit = defineEmits<{
  (e: 'event-click', eventId: number): void
  (e: 'perspective-click', data: { eventId: number; perspective: Perspective }): void
}>()

const props = defineProps<{
  selectedId: number | null
}>()

const eventStore = useEventStore()
const { events } = storeToRefs(eventStore) // 使用视野范围内的事件
const listRef = ref<HTMLDivElement | null>(null)

// 点击事件卡片
const handleClick = (eventId: number) => {
  emit('event-click', eventId)
}

// 点击视角
const handlePerspectiveClick = (data: { eventId: number; perspective: Perspective }) => {
  emit('perspective-click', data)
}

// 选中事件时滚动到对应位置
watch(() => props.selectedId, async (newId) => {
  if (newId && listRef.value) {
    await nextTick()
    const card = listRef.value.querySelector(`[data-event-id="${newId}"]`)
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})
</script>

<template>
  <div ref="listRef" class="p-4">
    <div class="mb-2 text-sm text-gray-500">
      当前视野: {{ events.length }} 个事件
    </div>

    <div class="space-y-2">
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        :is-selected="event.id === props.selectedId"
        :data-event-id="event.id"
        @click="handleClick(event.id)"
        @perspective-click="handlePerspectiveClick"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="eventStore.loading" class="py-8 text-center">
      <div class="inline-flex items-center gap-2">
        <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-400">加载中...</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!eventStore.loading && events.length === 0" class="py-12 text-center">
      <div class="text-4xl mb-2">🌍</div>
      <p class="text-gray-400">当前视野无事件</p>
      <p class="text-xs text-gray-300 mt-1">拖动地图到其他区域查看</p>
    </div>
  </div>
</template>