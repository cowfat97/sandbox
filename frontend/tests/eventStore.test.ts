import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEventStore } from '@/stores/eventStore'

describe('EventStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('events 应该是空数组', () => {
      const store = useEventStore()
      expect(store.events).toEqual([])
    })

    it('loading 应该是 false', () => {
      const store = useEventStore()
      expect(store.loading).toBe(false)
    })

    it('error 应该是 null', () => {
      const store = useEventStore()
      expect(store.error).toBeNull()
    })
  })

  describe('loadEvents', () => {
    it('应该加载模拟数据', async () => {
      const store = useEventStore()
      await store.loadEvents()

      expect(store.allEvents.length).toBeGreaterThan(0)
      expect(store.allEvents[0]).toHaveProperty('id')
      expect(store.allEvents[0]).toHaveProperty('title')
      expect(store.allEvents[0]).toHaveProperty('country')
    })

    it('加载后 events 应该有数据', async () => {
      const store = useEventStore()
      await store.loadEvents()

      expect(store.events.length).toBeGreaterThan(0)
    })
  })

  describe('loadStats', () => {
    it('应该加载统计数据', async () => {
      const store = useEventStore()
      await store.loadStats()

      expect(store.stats).toHaveProperty('totalCount')
      expect(store.stats).toHaveProperty('weeklyCount')
      expect(store.stats).toHaveProperty('hotRegions')
      expect(store.stats).toHaveProperty('byType')
      expect(store.stats).toHaveProperty('bySeverity')
    })
  })

  describe('loadMapMarkers', () => {
    it('应该过滤视野范围内的事件', async () => {
      const store = useEventStore()
      await store.loadEvents()

      // 设置一个小的视野范围（顿涅茨克附近）
      const bounds = {
        minLat: 47.5,
        maxLat: 48.5,
        minLng: 37.0,
        maxLng: 38.5
      }

      await store.loadMapMarkers(bounds)

      // 应该只返回视野内的事件
      store.events.forEach(event => {
        expect(event.latitude).toBeGreaterThanOrEqual(bounds.minLat)
        expect(event.latitude).toBeLessThanOrEqual(bounds.maxLat)
        expect(event.longitude).toBeGreaterThanOrEqual(bounds.minLng)
        expect(event.longitude).toBeLessThanOrEqual(bounds.maxLng)
      })
    })

    it('视野范围外应该返回空数组', async () => {
      const store = useEventStore()
      await store.loadEvents()

      // 设置一个没有事件的视野范围（太平洋中间）
      const bounds = {
        minLat: 0,
        maxLat: 1,
        minLng: 150,
        maxLng: 151
      }

      await store.loadMapMarkers(bounds)

      expect(store.events.length).toBe(0)
    })
  })

  describe('setSelectedRegion', () => {
    it('应该设置选中的热点区域', () => {
      const store = useEventStore()

      store.setSelectedRegion('乌克兰')

      expect(store.selectedRegion).toBe('乌克兰')
    })

    it('应该清除选中的热点区域', () => {
      const store = useEventStore()

      store.setSelectedRegion('乌克兰')
      store.setSelectedRegion(null)

      expect(store.selectedRegion).toBeNull()
    })
  })

  describe('clearError', () => {
    it('应该清除错误信息', () => {
      const store = useEventStore()
      store.error = '测试错误'

      store.clearError()

      expect(store.error).toBeNull()
    })
  })

  describe('计算属性', () => {
    it('totalCount 应该返回统计总数', async () => {
      const store = useEventStore()
      await store.loadStats()

      expect(store.totalCount).toBe(store.stats.totalCount)
    })

    it('weeklyCount 应该返回本周新增', async () => {
      const store = useEventStore()
      await store.loadStats()

      expect(store.weeklyCount).toBe(store.stats.weeklyCount)
    })
  })
})