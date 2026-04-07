import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventCard from '@/components/EventCard.vue'
import type { WarEvent } from '@/types'

describe('EventCard', () => {
  const mockEvent: WarEvent = {
    id: 1,
    title: '测试事件',
    country: '测试国家',
    locationName: '测试地点',
    latitude: 0,
    longitude: 0,
    eventType: 'military_conflict',
    severity: 4,
    source: 'Test',
    sourceUrl: 'https://test.com',
    eventDate: '2024-01-15',
    status: 'processed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    summary: '测试摘要',
    perspectives: [
      { name: '视角A', latitude: 0, longitude: 0, summary: '视角A摘要' }
    ]
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该显示事件标题', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: false }
    })

    expect(wrapper.text()).toContain('测试事件')
  })

  it('应该显示地点和国家', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: false }
    })

    expect(wrapper.text()).toContain('测试地点')
    expect(wrapper.text()).toContain('测试国家')
  })

  it('应该显示事件日期', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: false }
    })

    expect(wrapper.text()).toContain('2024-01-15')
  })

  it('应该显示事件类型标签', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: false }
    })

    expect(wrapper.text()).toContain('军事冲突')
  })

  it('应该显示严重程度标签', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: false }
    })

    expect(wrapper.text()).toContain('严重')
  })

  it('未选中时不应该显示视角按钮', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: false }
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('选中时应该显示视角按钮', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: true }
    })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('视角A')
  })

  it('选中时应该有高亮样式', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: true }
    })

    expect(wrapper.classes()).toContain('border-blue-500')
    expect(wrapper.classes()).toContain('bg-blue-50')
  })

  it('未选中时应该有普通样式', () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: false }
    })

    expect(wrapper.classes()).toContain('border-gray-200')
    expect(wrapper.classes()).toContain('bg-white')
  })

  it('点击应该触发 click 事件', async () => {
    const wrapper = mount(EventCard, {
      props: { event: mockEvent, isSelected: false }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })
})