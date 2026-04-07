import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WarEvent, PageParams, StatsData, MapBounds } from '@/types'
import { mockEvents, mockStats } from '@/mock/events'

export const useEventStore = defineStore('event', () => {
  const events = ref<WarEvent[]>([])
  const allEvents = ref<WarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pageParams = ref<PageParams>({})
  const stats = ref<StatsData>(mockStats)
  const selectedRegion = ref<string | null>(null)
  const mapBounds = ref<MapBounds | null>(null)

  // 计算属性
  const totalCount = computed(() => stats.value.totalCount)
  const weeklyCount = computed(() => stats.value.weeklyCount)
  const hotRegions = computed(() => stats.value.hotRegions)
  const byType = computed(() => stats.value.byType)
  const bySeverity = computed(() => stats.value.bySeverity)

  // 加载事件列表（使用模拟数据）
  const loadEvents = async () => {
    loading.value = true
    error.value = null
    try {
      // TODO: 后端创建后替换为真实 API
      // const response = await fetchEvents(pageParams.value)
      // events.value = response.items

      // 使用模拟数据
      events.value = mockEvents
      allEvents.value = mockEvents
    } catch (e) {
      error.value = '加载事件失败'
      console.error('加载事件失败:', e)
      events.value = mockEvents
      allEvents.value = mockEvents
    } finally {
      loading.value = false
    }
  }

  // 加载地图标记（视野范围）
  const loadMapMarkers = async (bounds: MapBounds) => {
    mapBounds.value = bounds
    try {
      // TODO: 后端创建后替换为真实 API
      // events.value = await fetchMapMarkers(bounds)

      // 使用模拟数据（过滤视野范围内的事件）
      events.value = mockEvents.filter(e =>
        e.latitude >= bounds.minLat &&
        e.latitude <= bounds.maxLat &&
        e.longitude >= bounds.minLng &&
        e.longitude <= bounds.maxLng
      )
    } catch (e) {
      console.error('加载地图标记失败:', e)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      // TODO: 后端创建后替换为真实 API
      // stats.value = await fetchStats()

      // 使用模拟数据
      stats.value = mockStats
    } catch (e) {
      console.error('加载统计失败:', e)
    }
  }

  // 更新分页参数
  const updatePageParams = async (newParams: PageParams) => {
    pageParams.value = newParams
    await loadEvents()
  }

  // 设置选中的热点区域
  const setSelectedRegion = (region: string | null) => {
    selectedRegion.value = region
  }

  // 清除错误
  const clearError = () => {
    error.value = null
  }

  return {
    events,
    allEvents,
    loading,
    error,
    pageParams,
    stats,
    totalCount,
    weeklyCount,
    hotRegions,
    byType,
    bySeverity,
    selectedRegion,
    mapBounds,
    loadEvents,
    loadMapMarkers,
    loadStats,
    updatePageParams,
    setSelectedRegion,
    clearError
  }
})