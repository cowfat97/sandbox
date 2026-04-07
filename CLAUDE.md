# TACO - 全球冲突态势感知平台

## 项目概述

TACO 是一个全球冲突事件可视化与分析平台，通过 AI 自动采集新闻、提取事件、生成摘要，在地图上实时展示全球冲突态势。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite + Tailwind CSS + Leaflet |
| 后端 | Java 8 + Spring Boot 2.7 + MyBatis-Plus（DDD 四层架构） |
| 数据库 | PostgreSQL |
| 对象存储 | 阿里云 OSS |
| AI 模型 | Qwen-Plus（阿里云 DashScope） |
| 数据源 | DuckDuckGo 搜索 API |

## 目录结构

```
war-trump-sandbox/
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── views/          # 页面（WarMap）
│   │   ├── components/     # 组件（LeafletMap, EventList, StatsPanel）
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── types/          # TypeScript 类型定义
│   │   ├── mock/           # 模拟数据
│   │   └── api/            # API 调用层
│   ├── tests/              # 单元测试
│   └── e2e/                # E2E 测试
│
├── backend/
│   ├── java/               # Java Spring Boot（DDD 架构）
│   │   ├── taco-api/           # 接口层（Controller、DTO）
│   │   ├── taco-application/   # 应用层（Service）
│   │   ├── taco-domain/        # 领域层（Entity、Repository）
│   │   ├── taco-infrastructure/# 基础设施层（Mapper、Config、Client）
│   │   └── taco-start/         # 启动模块
│   └── python/             # Python 脚本（待开发）
│
├── model/                  # 本地模型存储目录
│
├── docs/                   # 文档
│   ├── api-design.md       # 接口设计
│   ├── api.md              # API 文档
│   └── requirements.md     # 需求文档
│
├── CLAUDE.md               # 本文件
└── README.md               # 项目说明
```

## 开发命令

### 前端

```bash
cd frontend
npm install
npm run dev     # 启动开发服务器 http://localhost:3000
npm run build   # 构建生产版本
npm run test    # 运行单元测试（Vitest）
```

### 后端

```bash
cd backend/java
mvn clean compile                    # 编译项目
mvn spring-boot:run -pl taco-start   # 启动服务 http://localhost:8080
mvn clean package                    # 构建可执行 JAR
```

**API 文档：** http://localhost:8080/doc.html  
**Druid 监控：** http://localhost:8080/druid/

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

### Perspective（视角）

```typescript
interface Perspective {
  name: string       // 视角名称
  latitude: number   // 地图定位纬度
  longitude: number  // 地图定位经度
  zoom?: number      // 缩放级别，默认5
  summary?: string   // 该视角的摘要（存储在 OSS，API 返回时填充）
}
```

## API 接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 统计 | GET | /api/v1/war-events/stats | 首页统计数据 |
| 列表 | GET | /api/v1/war-events | 事件分页列表 |
| 地图 | GET | /api/v1/war-events/map | 视野范围内标记 |
| 详情 | GET | /api/v1/war-events/{id} | 事件完整信息 |

详细接口设计见 `docs/api-design.md`

## 数据库设计

### war_events 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
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
| summary_id | VARCHAR(100) | OSS 摘要 ID |
| perspectives | JSONB | 多视角 JSON（含 summaryId） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted | INT | 逻辑删除 |

初始化脚本：`backend/java/taco-start/src/main/resources/db/schema.sql`

## AI 处理流程

```
每小时定时任务 → DuckDuckGo 搜索新闻 → Qwen-Plus 提取事件 → 去重 → 存数据库 + OSS
```

**Qwen-Plus 功能：**
- 事件提取（标题、地点、类型、严重度等）
- 多视角识别与摘要生成
- 去重判断

详见 `docs/api-design.md`

## 配置说明

### 前端配置

- `vite.config.ts` - Vite 配置，端口 3000，代理 /api 到后端
- `tailwind.config.js` - Tailwind CSS 配置
- `src/types/index.ts` - 类型定义

### 后端配置

- `application.yml` - 主配置（端口 8080、数据库、OSS）
- `application-dev.yml` - 开发环境配置

### 环境变量

```bash
# 阿里云 OSS
ALIYUN_ACCESS_KEY_ID=your-key-id
ALIYUN_ACCESS_KEY_SECRET=your-key-secret
```

## 开发进度

| 优先级 | 任务 | 状态 |
|------|------|------|
| P0 | 前端开发 | ✅ 已完成 |
| P0 | 后端框架搭建 | ✅ 已完成 |
| P0 | 数据库设计 | ✅ 已完成 |
| P0 | OSS 配置 | ✅ 已完成 |
| P0 | 后端业务 API | 🚧 待开发 |
| P0 | AI 处理流程 | 🚧 待开发 |
| P1 | 部署上线 | 🚧 待开发 |

## 测试

### 前端测试

```bash
cd frontend
npm run test        # 单元测试（Vitest）
npm run test:e2e    # E2E 测试（Playwright）
```

### 测试覆盖

- `tests/eventStore.test.ts` - Store 测试
- `tests/types.test.ts` - 类型定义测试
- `tests/EventCard.test.ts` - 组件测试
- `e2e/war-map.spec.ts` - 页面 E2E 测试