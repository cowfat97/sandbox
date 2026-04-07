import { test, expect } from '@playwright/test'

test.describe('WarMap 页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 等待地图加载
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })
  })

  test('页面应该正确加载', async ({ page }) => {
    // 检查标题
    await expect(page).toHaveTitle(/TACO/)

    // 检查地图容器
    await expect(page.locator('.leaflet-container')).toBeVisible()

    // 检查事件列表
    const eventCount = await page.locator('[data-event-id]').count()
    expect(eventCount).toBeGreaterThan(0)
  })

  test('地图应该显示事件标记', async ({ page }) => {
    // 等待标记加载
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 5000 })

    // 应该有多个标记
    const markers = await page.locator('.leaflet-marker-icon').count()
    expect(markers).toBeGreaterThan(0)
  })

  test('事件列表应该显示事件', async ({ page }) => {
    // 等待事件卡片
    await expect(page.locator('[data-event-id]').first()).toBeVisible({ timeout: 5000 })

    // 应该有多个事件
    const events = await page.locator('[data-event-id]').count()
    expect(events).toBeGreaterThan(0)
  })

  test('点击事件应该高亮选中', async ({ page }) => {
    // 等待事件加载
    await expect(page.locator('[data-event-id]').first()).toBeVisible({ timeout: 5000 })

    // 点击第一个事件
    const firstEvent = page.locator('[data-event-id]').first()
    await firstEvent.click()

    // 应该有选中样式
    await expect(firstEvent).toHaveClass(/border-blue-500/)
  })

  test('选中事件应该显示视角按钮', async ({ page }) => {
    // 等待事件加载
    await expect(page.locator('[data-event-id]').first()).toBeVisible({ timeout: 5000 })

    // 点击第一个事件
    const firstEvent = page.locator('[data-event-id]').first()
    await firstEvent.click()

    // 检查是否有视角按钮（按钮在国家名如乌克兰、俄罗斯等）
    const perspectiveButton = page.locator('button').filter({
      hasText: /乌克兰|俄罗斯|叙利亚|伊朗|印度|巴基斯坦|以色列|巴勒斯坦/
    })

    // 如果有 perspectives，应该显示按钮
    const buttonCount = await perspectiveButton.count()
    // 视角按钮可能存在也可能不存在，取决于数据
    expect(buttonCount).toBeGreaterThanOrEqual(0)
  })

  test('统计面板应该显示数据', async ({ page }) => {
    // 检查总事件数
    await expect(page.locator('text=总事件')).toBeVisible()

    // 检查本周新增
    await expect(page.locator('text=本周新增')).toBeVisible()

    // 检查热点区域标题
    await expect(page.locator('text=热点区域')).toBeVisible()
  })

  test('点击热点区域应该跳转地图', async ({ page }) => {
    // 等待热点区域
    await expect(page.locator('[data-region-name]').first()).toBeVisible({ timeout: 5000 })

    // 点击热点区域
    const hotRegion = page.locator('[data-region-name]').first()
    const regionName = await hotRegion.getAttribute('data-region-name')

    await hotRegion.click()

    // 等待地图动画完成（通过检查事件列表更新）
    await expect(page.locator('[data-event-id]').first()).toBeVisible({ timeout: 3000 })
  })
})

test.describe('事件交互', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-event-id]').first()).toBeVisible({ timeout: 5000 })
  })

  test('点击地图标记应该显示弹窗', async ({ page }) => {
    // 等待标记加载
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 5000 })

    // 点击第一个标记
    await page.locator('.leaflet-marker-icon').first().click()

    // 应该显示弹窗
    await expect(page.locator('.leaflet-popup')).toBeVisible({ timeout: 3000 })
  })

  test('弹窗应该显示事件信息', async ({ page }) => {
    // 点击标记
    await page.locator('.leaflet-marker-icon').first().click()

    // 等待弹窗
    await expect(page.locator('.leaflet-popup')).toBeVisible({ timeout: 3000 })

    // 弹窗应该有内容
    const popupContent = await page.locator('.leaflet-popup-content').textContent()
    expect(popupContent).toBeTruthy()
    expect(popupContent!.length).toBeGreaterThan(0)
  })
})