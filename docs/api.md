# TACO 后端 API 接口文档

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `/api/v1` |
| 响应格式 | JSON |
| 编码 | UTF-8 |

---

## 通用响应结构

```typescript
interface ApiResponse<T> {
  code: number        // 0=成功, 其他=错误码
  message: string     // 响应消息
  data: T            // 响应数据
  timestamp: string   // 时间戳
}
```

## 错误码定义

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 事件统计接口

**GET `/war-events/stats`**

获取统计数据

**请求参数：** 无

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalCount": 156,
    "weeklyCount": 23,
    "hotRegions": [
      { "name": "乌克兰", "count": 45 },
      { "name": "叙利亚", "count": 32 },
      { "name": "苏丹", "count": 28 },
      { "name": "伊朗", "count": 21 },
      { "name": "以色列", "count": 18 }
    ],
    "byType": [
      { "type": "military_conflict", "count": 78 },
      { "type": "terrorist_attack", "count": 32 },
      { "type": "political_unrest", "count": 25 },
      { "type": "border_clash", "count": 15 },
      { "type": "other", "count": 6 }
    ],
    "bySeverity": [
      { "severity": 5, "count": 12 },
      { "severity": 4, "count": 35 },
      { "severity": 3, "count": 48 },
      { "severity": 2, "count": 38 },
      { "severity": 1, "count": 23 }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**字段说明：**

| 字段 | 说明 |
|------|------|
| totalCount | 总事件数 |
| weeklyCount | 本周新增（自然周：周一至周日） |
| hotRegions | 热点区域 Top5 |
| byType | 按事件类型统计 |
| bySeverity | 按严重程度统计 |

---

## 2. 事件列表接口

**GET `/war-events`**

分页获取事件列表

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | int | 否 | 页码，默认 1 |
| `pageSize` | int | 否 | 每页条数，默认 20，最大 100 |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "俄乌边境军事冲突",
        "country": "乌克兰",
        "locationName": "顿涅茨克",
        "latitude": 48.0159,
        "longitude": 37.8028,
        "eventType": "military_conflict",
        "severity": 4,
        "source": "NewsAPI",
        "sourceUrl": "https://example.com/news/1",
        "eventDate": "2024-01-15",
        "status": "processed",
        "summary": "俄乌冲突持续升级，顿涅茨克地区成为主要战场...",
        "perspectives": [
          { "name": "乌克兰", "latitude": 48.0, "longitude": 37.5, "zoom": 6 },
          { "name": "俄罗斯", "latitude": 55.75, "longitude": 37.6, "zoom": 4 }
        ],
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 156,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**排序规则：** 默认按事件时间倒序（最新的在前）

---

## 3. 地图标记接口

**GET `/war-events/map`**

获取地图视野范围内的事件坐标数据

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `minLat` | decimal | 是 | 视野最小纬度 |
| `maxLat` | decimal | 是 | 视野最大纬度 |
| `minLng` | decimal | 是 | 视野最小经度 |
| `maxLng` | decimal | 是 | 视野最大经度 |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "俄乌边境军事冲突",
      "latitude": 48.0159,
      "longitude": 37.8028,
      "eventType": "military_conflict",
      "severity": 4,
      "country": "乌克兰",
      "locationName": "顿涅茨克",
      "eventDate": "2024-01-15",
      "summary": "俄乌冲突持续升级...",
      "perspectives": [
        { "name": "乌克兰", "latitude": 48.0, "longitude": 37.5, "zoom": 6 },
        { "name": "俄罗斯", "latitude": 55.75, "longitude": 37.6, "zoom": 4 }
      ]
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**说明：** 前端根据地图缩放/拖动事件，传入当前视野边界坐标，后端只返回视野范围内的事件。

---

## 4. 事件详情接口

**GET `/war-events/{id}`**

获取单个事件详细信息，包含文章内容

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | long | 是 | 事件ID |

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "title": "俄乌边境军事冲突",
    "country": "乌克兰",
    "locationName": "顿涅茨克",
    "latitude": 48.0159,
    "longitude": 37.8028,
    "eventType": "military_conflict",
    "severity": 4,
    "source": "NewsAPI",
    "sourceUrl": "https://example.com/news/1",
    "eventDate": "2024-01-15",
    "status": "processed",
    "summary": "俄乌冲突持续升级，顿涅茨克地区成为主要战场...",
    "perspectives": [
      { "name": "乌克兰", "latitude": 48.0, "longitude": 37.5, "zoom": 6 },
      { "name": "俄罗斯", "latitude": 55.75, "longitude": 37.6, "zoom": 4 }
    ],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**说明：** 返回事件完整信息，`summary` 为后端从对象存储获取的摘要内容。

---

## 数据类型定义

### WarEvent

```typescript
interface WarEvent {
  id: number
  title: string
  country: string
  locationName: string
  latitude: number
  longitude: number
  eventType: EventType
  severity: Severity
  source: string
  sourceUrl: string
  eventDate: string
  status: EventStatus
  summary?: string
  perspectives?: Perspective[]
  createdAt: string
  updatedAt: string
}
```

### Perspective

```typescript
interface Perspective {
  name: string      // 视角名称，如"乌克兰"、"俄罗斯"
  latitude: number
  longitude: number
  zoom?: number     // 地图缩放级别，默认5
}
```

### EventType

| 值 | 中文 | 地图颜色 |
|----|------|---------|
| military_conflict | 军事冲突 | 红色 #ef4444 |
| terrorist_attack | 恐怖袭击 | 橙色 #f97316 |
| political_unrest | 政治动荡 | 黄色 #eab308 |
| border_clash | 边境冲突 | 紫色 #a855f7 |
| other | 其他 | 灰色 #6b7280 |

### Severity

| 值 | 中文 | 伤亡范围 | 地图标记大小 |
|----|------|---------|-------------|
| 1 | 轻微 | <10人 | radius: 8 |
| 2 | 一般 | 10-50人 | radius: 11 |
| 3 | 中等 | 50-200人 | radius: 14 |
| 4 | 严重 | 200-1000人 | radius: 17 |
| 5 | 极严重 | >1000人 | radius: 20 |

---

## 接口汇总

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 事件统计 | GET | `/war-events/stats` | 总数、本周、热点区域、类型/级别分布 |
| 事件列表 | GET | `/war-events` | 分页列表 |
| 地图标记 | GET | `/war-events/map` | 视野范围内的坐标数据 |
| 事件详情 | GET | `/war-events/{id}` | 事件完整信息 |

---

## 开发优先级

| 优先级 | 接口 | 状态 |
|--------|------|------|
| P0 | GET /war-events | 待开发 |
| P0 | GET /war-events/stats | 待开发 |
| P0 | GET /war-events/map | 待开发 |
| P0 | GET /war-events/{id} | 待开发 |