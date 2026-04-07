# TACO 接口设计

## 接口列表

| 接口 | 路径 | 说明 |
|------|------|------|
| 统计 | `GET /api/v1/war-events/stats` | 首页统计数据 |
| 列表 | `GET /api/v1/war-events` | 事件分页列表 |
| 地图 | `GET /api/v1/war-events/map` | 视野范围内标记 |
| 详情 | `GET /api/v1/war-events/{id}` | 事件完整信息 |

---

## 1. 统计接口

`GET /api/v1/war-events/stats`

**返回结构：**
```json
{
  "totalCount": 156,
  "weeklyCount": 23,
  "hotRegions": [
    { "name": "乌克兰", "count": 45 },
    { "name": "叙利亚", "count": 32 }
  ],
  "byType": [
    { "type": "military_conflict", "count": 78 },
    { "type": "terrorist_attack", "count": 32 }
  ],
  "bySeverity": [
    { "severity": 5, "count": 12 },
    { "severity": 4, "count": 35 }
  ]
}
```

**字段说明：**
- `totalCount` - 总事件数（不含已删除）
- `weeklyCount` - 本周新增（自然周，周一至周日）
- `hotRegions` - 热点国家 Top5
- `byType` - 按类型统计
- `bySeverity` - 按严重度统计

---

## 2. 事件列表

`GET /api/v1/war-events`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 20，最大 100 |

**返回结构：**
```json
{
  "items": [...],
  "total": 156,
  "page": 1,
  "pageSize": 20
}
```

**items 字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 事件 ID |
| title | string | 标题 |
| country | string | 国家 |
| locationName | string | 地点名称 |
| latitude | number | 纬度 |
| longitude | number | 经度 |
| eventType | string | 事件类型 |
| severity | number | 严重程度 1-5 |
| source | string | 数据来源 |
| sourceUrl | string | 来源链接 |
| eventDate | string | 事件日期 yyyy-MM-dd |
| status | string | 状态 |
| summary | string | 事件摘要 |
| perspectives | Perspective[] | 多视角数组 |
| createdAt | string | 创建时间 ISO 8601 |
| updatedAt | string | 更新时间 ISO 8601 |

---

## 3. 地图标记

`GET /api/v1/war-events/map`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| minLat | number | 是 | 视野最小纬度 |
| maxLat | number | 是 | 视野最大纬度 |
| minLng | number | 是 | 视野最小经度 |
| maxLng | number | 是 | 视野最大经度 |

**返回：** 事件数组（字段同列表接口 items，不含 summary）

**性能优化：**
- 使用 GiST 空间索引
- 不返回 summary 减少传输

---

## 4. 事件详情

`GET /api/v1/war-events/{id}`

**返回：** 事件完整信息（字段同列表接口）

---

## 事件类型

| 值 | 中文 | 颜色 |
|------|------|------|
| military_conflict | 军事冲突 | #ef4444 红 |
| terrorist_attack | 恐怖袭击 | #f97316 橙 |
| political_unrest | 政治动荡 | #eab308 黄 |
| border_clash | 边境冲突 | #a855f7 紫 |
| other | 其他 | #6b7280 灰 |

---

## 严重程度

| 值 | 中文 | 标记大小 |
|------|------|------|
| 1 | 轻微 | radius: 8 |
| 2 | 一般 | radius: 11 |
| 3 | 中等 | radius: 14 |
| 4 | 严重 | radius: 17 |
| 5 | 极严重 | radius: 20 |

---

## 视角结构

```typescript
interface Perspective {
  name: string       // 视角名称
  latitude: number   // 纬度
  longitude: number  // 经度
  zoom?: number      // 缩放级别，默认 5
  summary?: string   // 视角摘要（可选）
}
```

---

## 事件状态

| 值 | 说明 |
|------|------|
| pending | 待处理 |
| processed | 已处理 |
| invalid | 无效 |

---

## 响应格式

```typescript
interface ApiResponse<T> {
  code: number       // 0=成功
  message: string
  data: T
  timestamp: string
}
```

---

## 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 404 | 事件不存在 |
| 500 | 服务器错误 |

---

## 时间格式

| 字段 | 格式 | 示例 |
|------|------|------|
| eventDate | yyyy-MM-dd | 2024-01-15 |
| createdAt | ISO 8601 | 2024-01-15T10:00:00Z |
| updatedAt | ISO 8601 | 2024-01-15T10:00:00Z |

---

## 字段映射

| 数据库 | API |
|------|------|
| location_name | locationName |
| source_url | sourceUrl |
| event_type | eventType |
| event_date | eventDate |
| created_at | createdAt |
| updated_at | updatedAt |