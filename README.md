# TACO - 全球冲突态势感知平台

一个全球冲突事件可视化与分析平台，通过 AI 自动采集新闻、提取事件、生成摘要，在地图上实时展示全球冲突态势。

## 功能特性

- **战争沙盘**：Leaflet 地图展示全球冲突事件，按类型着色、按严重度调整大小
- **事件列表**：右侧展示事件列表，支持选中高亮联动地图
- **多视角切换**：支持不同视角查看事件（如俄乌冲突可切换乌克兰/俄罗斯视角）
- **统计面板**：总事件数、本周新增、热点国家 Top5、类型/严重度统计

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
│   │   ├── views/      # 页面组件
│   │   ├── components/ # UI 组件
│   │   ├── stores/     # Pinia 状态管理
│   │   ├── types/      # TypeScript 类型定义
│   │   └── mock/       # 模拟数据
│   └── package.json
│
├── backend/            # 后端（待开发）
│   └── python/         # Python 脚本
│
├── docs/               # 文档
│   ├── api-design.md   # 接口设计
│   ├── api.md          # API 文档
│   └── requirements.md # 需求文档
│
└── README.md           # 本文件
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev    # 启动开发服务器 http://localhost:3000
npm run build  # 构建生产版本
npm run test   # 运行单元测试
```

### 后端（待开发）

```bash
cd backend
# TODO: Spring Boot 项目初始化
```

## API 接口

| 接口 | 路径 | 说明 |
|------|------|------|
| 统计 | `GET /api/v1/war-events/stats` | 首页统计数据 |
| 列表 | `GET /api/v1/war-events` | 事件分页列表 |
| 地图 | `GET /api/v1/war-events/map` | 视野范围内标记 |
| 详情 | `GET /api/v1/war-events/{id}` | 事件完整信息 |

详细接口设计见 [docs/api-design.md](docs/api-design.md)

## 数据模型

### 事件类型

| 类型 | 中文 | 颜色 |
|------|------|------|
| military_conflict | 军事冲突 | 红色 |
| terrorist_attack | 恐怖袭击 | 橙色 |
| political_unrest | 政治动荡 | 黄色 |
| border_clash | 边境冲突 | 紫色 |
| other | 其他 | 灰色 |

### 严重程度

| 级别 | 中文 | 标记大小 |
|------|------|------|
| 1 | 轻微 | radius: 8 |
| 2 | 一般 | radius: 11 |
| 3 | 中等 | radius: 14 |
| 4 | 严重 | radius: 17 |
| 5 | 极严重 | radius: 20 |

## AI 处理流程

```
每小时定时任务 → DuckDuckGo 搜索新闻 → Qwen-Plus 提取事件 → 去重 → 存数据库 + OSS
```

- **事件提取**：标题、地点、类型、严重度、多视角
- **摘要生成**：200-300 字事件概述
- **去重判断**：基于已知事件列表（最近 7 天）

## 开发进度

| 优先级 | 任务 | 状态 |
|------|------|------|
| P0 | 前端开发 | ✅ 已完成 |
| P0 | 后端 API | 🚧 待开发 |
| P0 | AI 处理流程 | 🚧 待开发 |
| P1 | 部署上线 | 🚧 待开发 |

## 配置说明

### 待配置（后端）

- 阿里云 DashScope API Key
- 阿里云 OSS Bucket
- PostgreSQL 数据库连接
- DuckDuckGo 搜索 API

## License

MIT