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
| 后端 | Java 8 + Spring Boot 2.7 + MyBatis-Plus（DDD 架构） |
| 数据库 | PostgreSQL |
| 对象存储 | 阿里云 OSS |
| AI 模型 | Qwen-Plus（阿里云 DashScope） |
| 数据源 | DuckDuckGo 搜索 API |

## 目录结构

```
war-trump-sandbox/
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── components/     # UI 组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── types/          # TypeScript 类型定义
│   │   ├── api/            # API 调用层
│   │   └── mock/           # 模拟数据
│   ├── tests/              # 单元测试
│   └── e2e/                # E2E 测试
│
├── backend/
│   └── java/               # Java Spring Boot（DDD 架构）
│       ├── taco-api/           # 接口层（Controller、DTO）
│       ├── taco-application/   # 应用层（Service）
│       ├── taco-domain/        # 领域层（Entity、Repository）
│       ├── taco-infrastructure/# 基础设施层（Mapper、Config、Client）
│       └── taco-start/         # 启动模块
│
├── model/                  # 本地模型存储目录
│
├── docs/                   # 文档
│   ├── api-design.md       # 接口设计
│   ├── api.md              # API 文档
│   └── requirements.md     # 需求文档
│
└── README.md               # 本文件
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev     # 启动开发服务器 http://localhost:3000
npm run build   # 构建生产版本
npm run test    # 运行单元测试
```

### 后端

```bash
cd backend/java
mvn clean compile                    # 编译项目
mvn spring-boot:run -pl taco-start   # 启动服务 http://localhost:8080
mvn clean package                    # 构建可执行 JAR
```

**DDD 四层架构：**

| 模块 | 职责 |
|------|------|
| taco-api | REST 控制器、DTO、请求校验 |
| taco-application | 应用服务、领域对象编排 |
| taco-domain | 领域实体、值对象、仓储接口 |
| taco-infrastructure | 持久化实现、配置、外部服务调用 |

**访问地址：**
- API 文档：http://localhost:8080/doc.html
- Druid 监控：http://localhost:8080/druid/

## API 接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 统计 | GET | `/api/v1/war-events/stats` | 首页统计数据 |
| 列表 | GET | `/api/v1/war-events` | 事件分页列表 |
| 地图 | GET | `/api/v1/war-events/map` | 视野范围内标记 |
| 详情 | GET | `/api/v1/war-events/{id}` | 事件完整信息 |

详细接口设计见 [docs/api-design.md](docs/api-design.md)

## 数据模型

### 事件类型

| 值 | 中文 | 颜色 |
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

### 视角结构

每个事件可包含多个视角，每个视角有独立的摘要：

```json
{
  "name": "乌克兰",
  "latitude": 48.0159,
  "longitude": 37.8028,
  "zoom": 6,
  "summary": "该视角的摘要内容..."
}
```

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
| P0 | 后端框架搭建 | ✅ 已完成 |
| P0 | 数据库设计 | ✅ 已完成 |
| P0 | OSS 配置 | ✅ 已完成 |
| P0 | 后端业务 API | 🚧 待开发 |
| P0 | AI 处理流程 | 🚧 待开发 |
| P1 | 部署上线 | 🚧 待开发 |

## 配置说明

### 环境变量

```bash
# 阿里云 OSS
ALIYUN_ACCESS_KEY_ID=your-key-id
ALIYUN_ACCESS_KEY_SECRET=your-key-secret
```

### 数据库初始化

```bash
# PostgreSQL
psql -U postgres -c "CREATE DATABASE taco;"
psql -U postgres -d taco -f backend/java/taco-start/src/main/resources/db/schema.sql
```

## 法律声明

### 项目性质

本项目仅为基于 Gemma 4 本地部署与 Ollama 框架的技术实验工具，旨在演示大模型微调与私有权重的数据处理能力。

### 数据来源

系统展示的所有地理信息及冲突数据均由用户通过自行配置的第三方接口实时检索获取，本程序不内置、不存储、不分发任何敏感地理数据。

### 合规要求

用户在使用本工具进行数据抓取及可视化时，须确保符合《中华人民共和国测绘法》、《网络安全法》等法律法规。任何因用户私自配置、非法标注或公开发布非标准地图导致的后果由用户自行承担。

### AI 研判说明

所有的研判结论由本地 AI 逻辑生成，受模型权重及语料时效性限制，不代表真实立场，亦不构成任何决策建议。

## License

MIT