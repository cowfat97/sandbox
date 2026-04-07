# TACO - 全球冲突态势感知平台

## 项目概述

TACO 是一个全球冲突事件可视化与分析平台，通过 AI 自动采集新闻、提取事件、生成摘要，在地图上实时展示全球冲突态势。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite + Tailwind CSS + Leaflet |
| 后端 | Java Spring Boot（待开发） |
| AI 模型 | Qwen-Plus（阿里云 DashScope） |
| 数据库 | PostgreSQL |
| 对象存储 | 阿里云 OSS |
| 数据源 | DuckDuckGo 搜索 API |

## 目录结构

```
war-trump-sandbox/
├── frontend/           # Vue 3 前端
│   ├── src/
│   │   ├── views/      # 页面（WarMap）
│   │   ├── components/ # 组件（LeafletMap, EventList, StatsPanel）
│   │   ├── stores/     # Pinia 状态管理
│   │   ├── types/      # TypeScript 类型定义
│   │   └── mock/       # 模拟数据
│   └── package.json
│
├── backend/            # 后端（待开发）
│   └── python/         # Python 脚本
│
├── docs/               # 文档
│   ├── api-design.md   # 接口设计（最新）
│   ├── api.md          # API 文档
│   └── requirements.md # 需求文档
│
└── CLAUDE.md           # 本文件
```

## 开发命令

```bash
# 前端
cd frontend
npm install
npm run dev    # 启动开发服务器 http://localhost:3000
npm run build  # 构建

# 后端（待开发）
cd backend
```

## 核心功能

### 1. 战争沙盘（WarMap）
- Leaflet 地图展示全球冲突事件
- 事件标记按类型着色，按严重度调整大小
- 点击标记显示事件摘要
- 多视角切换（如俄乌冲突可切换乌克兰/俄罗斯视角）

### 2. 事件列表
- 右侧显示事件列表
- 支持选中高亮联动地图
- 显示事件视角按钮

### 3. 统计面板
- 总事件数、本周新增
- 热点国家 Top5
- 按类型、严重度统计

## 数据模型

### WarEvent

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 事件 ID |
| title | string | 标题 |
| country | string | 国家 |
| locationName | string | 地点名称 |
| latitude | number | 纬度 |
| longitude | number | 经度 |
| eventType | EventType | 事件类型 |
| severity | 1-5 | 严重程度 |
| eventDate | string | 事件日期 |
| source | string | 来源名称 |
| sourceUrl | string | 来源链接 |
| summary | string | 事件摘要 |
| perspectives | Perspective[] | 多视角 |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

### EventType

| 值 | 中文 | 颜色 |
|------|------|------|
| military_conflict | 军事冲突 | #ef4444 红 |
| terrorist_attack | 恐怖袭击 | #f97316 橙 |
| political_unrest | 政治动荡 | #eab308 黄 |
| border_clash | 边境冲突 | #a855f7 紫 |
| other | 其他 | #6b7280 灰 |

### Perspective

```typescript
interface Perspective {
  name: string       // 视角名称
  latitude: number   // 地图定位
  longitude: number
  zoom?: number      // 缩放级别，默认5
}
```

## API 接口

| 接口 | 路径 | 说明 |
|------|------|------|
| 统计 | GET /api/v1/war-events/stats | 统计数据 |
| 列表 | GET /api/v1/war-events | 事件分页列表 |
| 地图 | GET /api/v1/war-events/map | 视野范围内标记 |
| 详情 | GET /api/v1/war-events/{id} | 事件详情 |

详见 `docs/api-design.md`

## AI 处理流程

```
每小时定时任务 → DuckDuckGo 搜索新闻 → Qwen-Plus 提取事件 → 去重 → 存数据库 + OSS
```

**Qwen-Plus 功能：**
- 事件提取（标题、地点、类型、严重度等）
- 多视角识别
- 摘要生成
- 去重判断

详见 `docs/api-design.md` 模型处理流程

## 配置说明

### 前端配置

- `vite.config.ts` - Vite 配置，端口 3000
- `tailwind.config.js` - Tailwind CSS 配置
- `src/types/index.ts` - 类型定义

### 待配置（后端）

- 阿里云 DashScope API Key
- 阿里云 OSS 配置
- PostgreSQL 数据库连接
- DuckDuckGo 搜索 API

## 开发优先级

| 优先级 | 任务 |
|------|------|
| P0 | 前端完成（已完成） |
| P0 | 后端 API 开发 |
| P0 | AI 处理流程开发 |
| P1 | 部署上线 |