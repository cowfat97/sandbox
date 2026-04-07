# TACO 接口设计

## 接口列表

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 统计 | GET | `/api/v1/war-events/stats` | 首页统计数据 |
| 列表 | GET | `/api/v1/war-events` | 事件分页列表 |
| 地图 | GET | `/api/v1/war-events/map` | 视野范围内标记 |
| 详情 | GET | `/api/v1/war-events/{id}` | 事件完整信息 |

---

## 统一响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "参数错误: page 必须大于 0",
  "data": null,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 统计接口

**请求：**
```
GET /api/v1/war-events/stats
```

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
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| totalCount | integer | 总事件数（不含已删除） |
| weeklyCount | integer | 本周新增（周一 00:00 至今） |
| hotRegions | array | 热点国家 Top5 |
| byType | array | 按类型统计 |
| bySeverity | array | 按严重度统计 |

---

## 2. 事件列表

**请求：**
```
GET /api/v1/war-events?page=1&pageSize=20
```

**参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|------|
| page | integer | 否 | 1 | 页码，≥ 1 |
| pageSize | integer | 否 | 20 | 每页条数，1-100 |

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
        "severity": 5,
        "source": "路透社",
        "sourceUrl": "https://example.com/news/1",
        "eventDate": "2024-01-15",
        "status": "processed",
        "summary": "乌克兰军方表示...",
        "perspectives": [
          {
            "name": "乌克兰",
            "latitude": 48.0159,
            "longitude": 37.8028,
            "zoom": 6,
            "summary": "乌克兰视角摘要..."
          }
        ],
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 156,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**items 字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 事件 ID |
| title | string | 标题，最长 200 |
| country | string | 国家，最长 50 |
| locationName | string | 地点名称，最长 100 |
| latitude | number | 纬度，-90 ~ 90 |
| longitude | number | 经度，-180 ~ 180 |
| eventType | string | 事件类型枚举 |
| severity | integer | 严重程度 1-5 |
| source | string | 数据来源，最长 50 |
| sourceUrl | string | 来源链接，最长 500 |
| eventDate | string | 事件日期，yyyy-MM-dd |
| status | string | 状态枚举 |
| summary | string | 事件摘要 |
| perspectives | array | 多视角数组 |
| createdAt | string | 创建时间，ISO 8601 |
| updatedAt | string | 更新时间，ISO 8601 |

---

## 3. 地图标记

**请求：**
```
GET /api/v1/war-events/map?minLat=30&maxLat=50&minLng=30&maxLng=50
```

**参数：**

| 参数 | 类型 | 必填 | 范围 | 说明 |
|------|------|------|------|------|
| minLat | number | 是 | -90 ~ 90 | 视野最小纬度 |
| maxLat | number | 是 | -90 ~ 90 | 视野最大纬度 |
| minLng | number | 是 | -180 ~ 180 | 视野最小经度 |
| maxLng | number | 是 | -180 ~ 180 | 视野最大经度 |

**校验规则：**
- minLat < maxLat
- minLng < maxLng

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "俄乌边境军事冲突",
      "country": "乌克兰",
      "locationName": "顿涅茨克",
      "latitude": 48.0159,
      "longitude": 37.8028,
      "eventType": "military_conflict",
      "severity": 5,
      "source": "路透社",
      "sourceUrl": "https://example.com/news/1",
      "eventDate": "2024-01-15",
      "status": "processed",
      "perspectives": [
        {
          "name": "乌克兰",
          "latitude": 48.0159,
          "longitude": 37.8028,
          "zoom": 6,
          "summary": "乌克兰视角摘要..."
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**与列表接口差异：**
- ❌ 不返回 `summary`（减少传输）
- ✅ 返回 `perspectives[].summary`（视角摘要）

---

## 4. 事件详情

**请求：**
```
GET /api/v1/war-events/1
```

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
    "severity": 5,
    "source": "路透社",
    "sourceUrl": "https://example.com/news/1",
    "eventDate": "2024-01-15",
    "status": "processed",
    "summary": "完整摘要内容...",
    "perspectives": [
      {
        "name": "乌克兰",
        "latitude": 48.0159,
        "longitude": 37.8028,
        "zoom": 6,
        "summary": "乌克兰视角摘要..."
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**与列表接口差异：**
- `summary` 返回完整摘要

---

## 视角结构

**数据库存储（JSONB）：**
```json
{
  "name": "乌克兰",
  "latitude": 48.0159,
  "longitude": 37.8028,
  "zoom": 6,
  "summaryId": "p001-ukraine"
}
```

**API 返回：**
```json
{
  "name": "乌克兰",
  "latitude": 48.0159,
  "longitude": 37.8028,
  "zoom": 6,
  "summary": "乌克兰军方表示..."
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 视角名称 |
| latitude | number | 纬度，-90 ~ 90 |
| longitude | number | 经度，-180 ~ 180 |
| zoom | integer | 缩放级别，默认 5 |
| summaryId | string | OSS 摘要 ID（仅数据库存储） |
| summary | string | 视角摘要（API 返回） |

---

## 事件类型

| 值 | 中文 | 颜色 |
|------|------|------|
| military_conflict | 军事冲突 | #ef4444 |
| terrorist_attack | 恐怖袭击 | #f97316 |
| political_unrest | 政治动荡 | #eab308 |
| border_clash | 边境冲突 | #a855f7 |
| other | 其他 | #6b7280 |

---

## 严重程度

| 值 | 中文 | 标记半径 |
|------|------|------|
| 1 | 轻微 | 8px |
| 2 | 一般 | 11px |
| 3 | 中等 | 14px |
| 4 | 严重 | 17px |
| 5 | 极严重 | 20px |

---

## 事件状态

| 值 | 说明 |
|------|------|
| pending | 待处理 |
| processed | 已处理 |
| invalid | 无效 |

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

---

## 性能说明

| 接口 | 优化措施 |
|------|------|
| 列表 | 分页查询，索引 idx_created_at |
| 地图 | GiST 空间索引，不返回 summary |
| 详情 | 主键查询 |