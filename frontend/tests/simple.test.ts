import { describe, it, expect } from 'vitest'

describe('简单测试', () => {
  it('1 + 1 = 2', () => {
    expect(1 + 1).toBe(2)
  })

  it('数组包含元素', () => {
    const arr = [1, 2, 3]
    expect(arr).toContain(2)
  })
})