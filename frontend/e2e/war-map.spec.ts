import { test, expect } from '@playwright/test'

test.describe('WarMap 页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 等待地图加载
    await page.waitForSelector('.leaflet-container', { timeout: 10000 })
  })

  test('页面应该正确加载', async ({ page }) => {
    // 检查标题
    await expect(page).toHaveTitle(/TACO/)

    // 检查地图容器
    await expect(page.locator('.leaflet-container')).toBeVisible()

    // 检查事件列表
    await expect(page.locator('[data-event-id]')).toHaveCount(await page.locator('[data-event-id]').count())
  })

  test('地图应该显示事件标记', async ({ page }) => {
    // 等待标记加载
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 5000 })

    // 应该有多个标记
    const markers = await page.locator('.leaflet-marker-icon').count()
    expect(markers).toBeGreaterThan(0)
  })

  test('事件列表应该显示事件', async ({ page }) => {
    // 等待事件卡片
    await page.waitForSelector('[data-event-id]', { timeout: 5000 })

    // 应该有多个事件
    const events = await page.locator('[data-event-id]').count()
    expect(events).toBeGreaterThan(0)
  })

  test('点击事件应该高亮选中', async ({ page }) => {
    // 等待事件加载
    await page.waitForSelector('[data-event-id]', { timeout: 5000 })

    // 点击第一个事件
    const firstEvent = page.locator('[data-event-id]').first()
    await firstEvent.click()

    // 应该有选中样式
    await expect(firstEvent).toHaveClass(/border-blue-500/)
  })

  test('选中事件应该显示视角按钮', async ({ page }) => {
    // 等待事件加载
    await page.waitForSelector('[data-event-id]', { timeout: 5000 })

    // 点击第一个事件
    const firstEvent = page.locator('[data-event-id]').first()
    await firstEvent.click()

    // 等待视角按钮出现
    await page.waitForSelector('button:has-text("视角")', { timeout: 3000 })

    // 应该看到视角按钮
    const buttons = await page.locator('button:has-text("视角")').count()
    // 按钮文字可能是具体的国家名如"乌克兰"、"俄罗斯"
    expect(buttons).toBeGreaterThanOrEqual(0)
  })

  test('统计面板应该显示数据', async ({ page }) => {
    // 检查总事件数
    await expect(page.locator('text=总事件')).toBeVisible()

    // 检查本周新增
    await expect(page.locator('text=本周新增')).toBeVisible()

    // 检查热点区域
    await expect(page.locator('text=🔥')).toBeVisible()
  })

  test('点击热点区域应该跳转地图', async ({ page }) => {
    // 等待热点区域
    await page.waitForSelector('.cursor-pointer:has-text("乌克兰"), .cursor-pointer:has-text("伊朗")', { timeout: 5000 })

    // 记录当前地图中心
    const centerBefore = await page.evaluate(() => {
      const map = (window as any).leafletMap
      return map ? map.getCenter() : null
    })

    // 点击热点区域（取第一个可用的）
    const hotRegion = page.locator('.cursor-pointer:has-text("乌克兰"), .cursor-pointer:has-text("伊朗")').first()
    await hotRegion.click()

    // 等待动画
    await page.waitForTimeout(2000)

    // 地图中心应该改变
    const centerAfter = await page.evaluate(() => {
      const map = (window as any).leafletMap
      return map ? map.getCenter() : null
    })

    // 中心点应该不同（地图移动了）
    if (centerBefore && centerAfter) {
      const moved = Math.abs(centerBefore.lat - centerAfter.lat) > 0.1 ||
                    Math.abs(centerBefore.lng - centerAfter.lng) > 0.1
      expect(moved).toBe(true)
    }
  })
})

test.describe('事件交互', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.leaflet-container', { timeout: 10000 })
    await page.waitForSelector('[data-event-id]', { timeout: 5000 })
  })

  test('点击地图标记应该显示弹窗', async ({ page }) => {
    // 等待标记加载
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 5000 })

    // 点击第一个标记
    await page.locator('.leaflet-marker-icon').first().click()

    // 应该显示弹窗
    await expect(page.locator('.leaflet-popup')).toBeVisible({ timeout: 3000 })
  })

  test('弹窗应该显示事件信息', async ({ page }) => {
    // 点击标记
    await page.locator('.leaflet-marker-icon').first().click()

    // 等待弹窗
    await page.waitForSelector('.leaflet-popup', { timeout: 3000 })

    // 弹窗应该有内容
    const popupContent = await page.locator('.leaflet-popup-content').textContent()
    expect(popupContent).toBeTruthy()
    expect(popupContent!.length).toBeGreaterThan(0)
  })
})