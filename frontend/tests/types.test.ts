import { describe, it, expect } from 'vitest'
import {
  EVENT_TYPE_LABELS,
  SEVERITY_LABELS,
  EVENT_TYPE_COLORS,
  SEVERITY_RADIUS,
  type EventType,
  type Severity
} from '@/types'

describe('类型定义', () => {
  describe('EVENT_TYPE_LABELS', () => {
    it('应该包含所有事件类型', () => {
      const types: EventType[] = ['military_conflict', 'terrorist_attack', 'political_unrest', 'border_clash', 'other']

      types.forEach(type => {
        expect(EVENT_TYPE_LABELS[type]).toBeDefined()
      })
    })

    it('标签应该是中文', () => {
      expect(EVENT_TYPE_LABELS.military_conflict).toBe('军事冲突')
      expect(EVENT_TYPE_LABELS.terrorist_attack).toBe('恐怖袭击')
      expect(EVENT_TYPE_LABELS.political_unrest).toBe('政治动荡')
      expect(EVENT_TYPE_LABELS.border_clash).toBe('边境冲突')
      expect(EVENT_TYPE_LABELS.other).toBe('其他')
    })
  })

  describe('SEVERITY_LABELS', () => {
    it('应该包含严重程度 1-5', () => {
      const severities: Severity[] = [1, 2, 3, 4, 5]

      severities.forEach(severity => {
        expect(SEVERITY_LABELS[severity]).toBeDefined()
      })
    })

    it('标签应该是中文', () => {
      expect(SEVERITY_LABELS[1]).toBe('轻微')
      expect(SEVERITY_LABELS[2]).toBe('一般')
      expect(SEVERITY_LABELS[3]).toBe('中等')
      expect(SEVERITY_LABELS[4]).toBe('严重')
      expect(SEVERITY_LABELS[5]).toBe('极严重')
    })
  })

  describe('EVENT_TYPE_COLORS', () => {
    it('应该为每种类型定义颜色', () => {
      const types: EventType[] = ['military_conflict', 'terrorist_attack', 'political_unrest', 'border_clash', 'other']

      types.forEach(type => {
        expect(EVENT_TYPE_COLORS[type]).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('军事冲突应该是红色', () => {
      expect(EVENT_TYPE_COLORS.military_conflict).toBe('#ef4444')
    })

    it('恐怖袭击应该是橙色', () => {
      expect(EVENT_TYPE_COLORS.terrorist_attack).toBe('#f97316')
    })
  })

  describe('SEVERITY_RADIUS', () => {
    it('严重程度越高半径越大', () => {
      expect(SEVERITY_RADIUS[1]).toBeLessThan(SEVERITY_RADIUS[2])
      expect(SEVERITY_RADIUS[2]).toBeLessThan(SEVERITY_RADIUS[3])
      expect(SEVERITY_RADIUS[3]).toBeLessThan(SEVERITY_RADIUS[4])
      expect(SEVERITY_RADIUS[4]).toBeLessThan(SEVERITY_RADIUS[5])
    })

    it('半径范围应该在 8-20 之间', () => {
      const severities: Severity[] = [1, 2, 3, 4, 5]

      severities.forEach(severity => {
        expect(SEVERITY_RADIUS[severity]).toBeGreaterThanOrEqual(8)
        expect(SEVERITY_RADIUS[severity]).toBeLessThanOrEqual(20)
      })
    })
  })
})