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
- `totalCount` - 总事件数
- `weeklyCount` - 本周新增（自然周）
- `hotRegions` - 热点国家 Top5
- `byType` - 按类型统计
- `bySeverity` - 按严重度统计

---

## 2. 事件列表

`GET /api/v1/war-events`

**参数：**
| 参数 | 说明 |
|------|------|
| page | 页码，默认1 |
| pageSize | 每页条数，默认20，最大100 |

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
- `id`, `title`, `country`, `locationName`
- `latitude`, `longitude`
- `eventType`, `severity`
- `source`, `sourceUrl`
- `eventDate`, `status`
- `summary` - 文章摘要（后端从对象存储获取）
- `perspectives`
- `createdAt`, `updatedAt`

---

## 3. 地图标记

`GET /api/v1/war-events/map`

**参数：**
| 参数 | 必填 | 说明 |
|------|------|------|
| minLat | 是 | 视野最小纬度 |
| maxLat | 是 | 视野最大纬度 |
| minLng | 是 | 视野最小经度 |
| maxLng | 是 | 视野最大经度 |

**返回：** 事件数组（字段同列表接口 items）

---

## 4. 事件详情

`GET /api/v1/war-events/{id}`

**返回：** 事件完整信息（字段同列表接口）

---

## 事件状态

| 值 | 说明 |
|------|------|
| pending | 待处理 |
| processed | 已处理 |
| invalid | 无效 |

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
  name: string       // 视角名称，如"美国"、"以色列"
  latitude: number   // 地图定位
  longitude: number
  zoom?: number      // 缩放级别，默认5
}
```

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

## 数据库表设计

### war_events 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| title | VARCHAR(200) | 标题 |
| country | VARCHAR(50) | 国家 |
| location_name | VARCHAR(100) | 地点名称 |
| latitude | DECIMAL(10,6) | 纬度 |
| longitude | DECIMAL(10,6) | 经度 |
| event_type | VARCHAR(20) | 事件类型 |
| severity | INT | 严重程度 1-5 |
| source | VARCHAR(50) | 数据来源 |
| source_url | VARCHAR(500) | 来源链接 |
| event_date | DATE | 事件日期 |
| status | VARCHAR(20) | 状态 |
| summary_id | VARCHAR(100) | 对象存储中的文章摘要ID |
| perspectives | JSON | 视角数组 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**索引：**
```sql
INDEX idx_location (latitude, longitude)  -- 地图视野查询
INDEX idx_event_date (event_date)         -- 列表排序
```

**字段映射（数据库 → API）：**
```
location_name → locationName
source_url    → sourceUrl
event_type    → eventType
created_at    → createdAt
updated_at    → updatedAt
```

**特殊处理：**
- `summary_id`（数据库）→ 后端用此 ID 从阿里云 OSS 查询摘要内容 → `summary`（API 返回）

---

## 对象存储（阿里云 OSS）

**用途：** 存储事件文章摘要

**存储路径：** `summaries/{summary_id}.txt`

**后端处理流程：**
1. 数据库查询获取 `summary_id`
2. 调用 OSS SDK 获取文件内容
3. 返回 `summary` 字段给前端

**OSS 配置：**
```
bucket: taco-summaries
endpoint: oss-cn-hangzhou.aliyuncs.com
path: summaries/{id}.txt
```

---

## 模型处理流程

### 模型配置

| 模型 | 用途 |
|------|------|
| Qwen-Plus | 事件提取 + 摘要生成 |

### 数据采集

**数据源：** DuckDuckGo 搜索 API

**搜索关键词：** `战争 冲突 军事 恐怖袭击`

**采集频率：** 每小时

**数量限制：** 每次最多 20 条新闻

**输入限制：** 每条新闻截取前 2000 字

### 处理流程

```
新闻搜索 → Qwen-Plus 提取并生成摘要 → 结构化数据存数据库 + 摘要存 OSS
```

### Qwen-Plus 输入

**输入内容：**
- 新闻文本
- 已知事件列表（最近 7 天）

**输出：** JSON 数组（新事件，已去重）

**提取字段：**
- title: 事件标题
- country: 国家
- location: 地点名称
- latitude, longitude: 经纬度
- eventType: 事件类型
- severity: 严重程度 1-5
- eventDate: 事件日期（yyyy-MM-dd）
- source: 来源名称
- sourceUrl: 来源链接
- perspectives: 各方视角
- summary: 事件摘要（200-300字）

**Prompt：**
```
当前时间：{current_time}

从以下新闻中提取战争冲突事件。

已知事件列表（用于去重判断）：
{existing_events}

规则：
1. 只提取 eventDate 在最近 24 小时内的事件
2. 如果新闻中的事件与已知事件重复（同一地点、同一天、相似内容），跳过
3. 返回 JSON 数组格式：
[
  {
    "title": "事件标题",
    "country": "国家",
    "location": "地点",
    "latitude": 数字,
    "longitude": 数字,
    "eventType": "military_conflict|terrorist_attack|political_unrest|border_clash|other",
    "severity": 1-5,
    "eventDate": "yyyy-MM-dd",
    "source": "来源名称",
    "sourceUrl": "来源链接",
    "perspectives": [{"name": "视角名", "latitude": 数字, "longitude": 数字}],
    "summary": "事件摘要（200-300字，包含事件概述、参与方、影响分析）"
  }
]

如果没有新事件，返回空数组 []。
新闻：{news_content}
```

**传入已知事件格式：**
```
国家 | 事件日期 | 事件标题
乌克兰 | 2024-01-15 | 俄乌边境冲突
伊朗 | 2024-01-14 | 美伊冲突
```

**传入已知事件：** 最近 7 天的事件（country + eventDate + title）

### 存储流程

1. 查询最近 7 天已知事件
2. Qwen-Plus 返回 JSON 数组（已去重）
3. 事件数据存 `war_events` 表
4. 摘要存 OSS，获得 `summary_id`
5. 更新数据库 `summary_id` 字段

### 错误处理

| 错误类型 | 处理方式 |
|------|------|
| 模型返回非 JSON | 记录日志，跳过该新闻 |
| JSON 格式错误 | 记录日志，跳过该新闻 |
| 必填字段缺失 | 使用默认值或跳过 |
| coordinates 缺失 | 跳过该事件（地图无法定位） |
| OSS 存储失败 | 记录日志，事件状态设为 pending |

### 定时任务

**实现方式：** Spring @Scheduled

**执行频率：** 每小时（cron: `0 0 * * * *`）

**并发处理：** 顺序处理（每条新闻单独调用模型，避免超限）

**任务流程：**
```
1. DuckDuckGo 搜索最新新闻（最多 20 条）
2. 查询最近 7 天已知事件
3. 遍历新闻，调用 Qwen-Plus 提取事件（含去重）
4. 存储新事件
```

---

## 错误码定义

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

## 开发优先级

| 优先级 | 接口 |
|------|------|
| P0 | 统计、列表、地图、详情 |