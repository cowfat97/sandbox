# 开发设计文档

## 1. 系统架构

### 1.1 整体架构（第一阶段）

```
┌─────────────────────────────────────────────────────────────────────┐
│                           用户层                                      │
│                     浏览器 / 移动端 Web App                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────┐
│                         前端层 (Vue 3)                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    WarMap (战争沙盘)                           │  │
│  │  - Leaflet 地图可视化                                          │  │
│  │  - 事件列表展示                                                 │  │
│  │  - 文章阅读弹窗                                                 │  │
│  └──────────────────────────────────────────────────────────────┐  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              组件库: 地图 / 事件卡片 / 统计图表                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              状态管理: Pinia Stores                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              API 层: Axios + TypeScript Types                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────┐
│                      后端服务层 (Docker 容器)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Java Spring Boot 服务                             │  │
│  │  Controller:                                                  │  │
│  │    - WarEventApi (事件查询)                                    │  │
│  │    - ArticleApi (文章获取)                                     │  │
│  │    - CrawlConfigApi (采集配置)                                 │  │
│  │  Service:                                                     │  │
│  │    - EventService (事件业务)                                   │  │
│  │    - CrawlService (数据采集)                                   │  │
│  │  定时任务:                                                     │  │
│  │    - CrawlScheduler (爬虫调度，频率可配置)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Python FastAPI 服务 (同容器)                       │  │
│  │  API 路由:                                                    │  │
│  │    - /extract (信息提取)                                       │  │
│  │    - /generate (文章生成)                                      │  │
│  │    - /vectorize (向量化处理)                                   │  │
│  │  服务层:                                                       │  │
│  │    - QwenExtractor (Qwen信息提取)                              │  │
│  │    - ArticleGenerator (文章生成)                               │  │
│  │    - VectorProcessor (向量化)                                  │  │
│  │  模型:                                                         │  │
│  │    - Qwen (本地部署，用于数据提取和生成)                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ 阿里云 RDS         │   │ 阿里云 DashVector  │   │   阿里云 OSS      │
│ PostgreSQL        │   │                   │   │                   │
│                   │   │ 存储:             │   │ 存储:             │
│ 存储:             │   │ - 原始数据向量     │   │ - 生成的文章      │
│ - 地点信息        │   │ - 用于去重检索     │   │ - JSON格式        │
│ - 事件信息        │   │                   │   │ - 原始数据备份     │
│ - 结构化数据      │   │                   │   │                   │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

### 1.2 部署架构

| 组件 | 部署方式 | 说明 |
|------|---------|------|
| **前端 Vue** | Docker 容器 | Nginx 部署静态资源 |
| **Java + Python** | 同一个 Docker 容器 | 共享容器，内部通信 |
| **阿里云 RDS PostgreSQL** | 云服务 | 关系数据库 |
| **阿里云 DashVector** | 云服务 | 向量数据库 |
| **阿里云 OSS** | 云服务 | 对象存储 |
| **Qwen 模型** | 容器内本地部署 | 使用 Ollama/vLLM |

### 1.3 技术栈详情

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端** | Vue 3 | 3.4+ | Composition API |
| | TypeScript | 5.x | 类型安全 |
| | Vite | 5.x | 构建工具 |
| | Pinia | 2.x | 状态管理 |
| | Vue Router | 4.x | 路由管理 |
| | Axios | 1.x | HTTP 客户端 |
| | Leaflet | 1.9+ | 地图组件（开源）|
| | ECharts | 5.x | 图表库 |
| | TailwindCSS | 3.x | 样式框架 |
| **后端 Java** | Spring Boot | 3.2+ | 主框架 |
| | Spring Data JPA | 3.2+ | ORM |
| | Spring Scheduler | - | 定时任务（可配置频率）|
| | Lombok | - | 代码简化 |
| **后端 Python** | FastAPI | 0.109+ | Web 框架 |
| | Pydantic | 2.x | 数据验证 |
| | LangChain | 0.1+ | LLM 框架 |
| | Ollama | - | 本地模型运行 |
| **数据存储** | 阿里云 RDS PostgreSQL | 15+ | 关系数据库 (云服务) |
| | 阿里云 DashVector | - | 向量数据库 (云服务) |
| | 阿里云 OSS | - | 对象存储 (云服务) |
| **部署** | Docker | 24+ | 容器化 |
| | Docker Compose | 2.x | 编排 |

### 1.4 AI 模型架构（第一阶段）

本项目第一阶段使用 2 个 AI 模型：

```
┌─────────────────────────────────────────────────────────────────────┐
│                          模型服务层                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────────────────────┐          │
│  │  向量化模型      │  │        信息提取+文章生成         │          │
│  │                 │  │                                 │          │
│  │ text-embedding  │  │        Qwen-7B/14B              │          │
│  │   -ada-002      │  │                                 │          │
│  │                 │  │  - 信息结构化提取                │          │
│  │ (OpenAI API)    │  │  - 摘要文章生成                  │          │
│  │                 │  │                                 │          │
│  │ Python 调用     │  │        (本地部署)               │          │
│  └─────────────────┘  └─────────────────────────────────┘          │
│         │                          │                                 │
│         ▼                          ▼                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │ 阿里云 DashVector │  │ 阿里云 RDS       │  │   阿里云 OSS    │    │
│  │   存储向量      │  │   PostgreSQL    │  │  存储摘要文章   │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

后续阶段: Qwen-Chat (用户对话交互)
```

#### 模型详细说明

| 模型 | 用途 | 部署方式 | 调用方 | 输入 | 输出 |
|------|------|---------|--------|------|------|
| **text-embedding-ada-002** | 文本向量化 | OpenAI API (云端) | Python 服务 | 原始新闻/冲突文本 | 1536维向量 |
| **Qwen-7B/14B** | 信息提取 + 文章生成 | 本地部署 (Ollama) | Python 服务 | 原始文本 + DashVector检索 | 结构化 JSON + 摘要文章 |
| **Qwen-Chat** | 用户对话 | 本地部署 | 后续阶段 | 用户问题 + 事件上下文 | 对话回复 |

#### 模型调用流程

```
原始数据 ──► Python 服务调用 OpenAI API ──► 阿里云 DashVector (向量存储)
                        (text-embedding-ada-002)
                                              │
                                              ▼ (语义检索)
                                        Qwen-7B/14B
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
                  结构化信息 ──► 阿里云 RDS PostgreSQL         摘要文章 ──► 阿里云 OSS
```

#### Qwen-7B/14B 双任务说明

| 任务 | 输入 | 输出 | 目的 | 存储 |
|------|------|------|------|------|
| **信息提取** | DashVector 检索的原始文本 | 结构化 JSON | **前端展示**：地图标记、事件列表 | 阿里云 RDS PostgreSQL |
| **摘要文章生成** | 提取的结构化信息 + 相关历史数据 | JSON 格式摘要文章 | 用户阅读详情 | 阿里云 OSS |

#### 结构化信息字段（前端展示用）

Qwen-7B/14B 提取的结构化信息直接用于前端展示：

| 字段 | 说明 | 前端展示用途 |
|------|------|-------------|
| **事件名称 (title)** | 事件标题 | 事件列表标题、地图标记标题 |
| **地点名称 (location_name)** | 发生地点 | 地图标记位置、事件列表筛选 |
| **经纬度 (latitude/longitude)** | 坐标 | Leaflet 地图标记定位 |
| **事件类型 (event_type)** | 军事冲突/恐怖袭击/政治动荡等 | 事件分类筛选、颜色区分 |
| **严重程度 (severity)** | 1-5 级 | 地图标记大小、热度着色 |
| **发生时间 (event_date)** | 事件时间 | 时间线展示、时间筛选 |
| **参与方 (participants)** | 国家/组织/势力 | 事件详情展示 |
| **伤亡数据 (casualties)** | 死亡/受伤人数 | 统计面板、事件卡片 |

#### 模型配置参数

| 模型 | 参数配置 | 说明 |
|------|---------|------|
| **text-embedding-ada-002** | OPENAI_API_KEY, EMBEDDING_DIM=1536 | Python 服务调用 OpenAI API |
| **Qwen-7B/14B** | MODEL_PATH, MAX_TOKENS=4096, EXTRACT_TEMP=0.1, GENERATE_TEMP=0.3 | 本地部署，双任务 |
| **Qwen-Chat** | 后续阶段部署 | 用户对话功能 |

---

## 2. 数据库设计

### 2.1 ER 图（第一阶段）

```
数据流向:

crontab 定时调用 Python 爬虫脚本
         ↓
    采集数据
         ↓
DashVector (向量化+去重)
         ↓
Qwen 提取 + 生成文章
         ↓
┌─────────────────────────────────┐
│         war_events              │
│   PostgreSQL + 阿里云 OSS       │
└─────────────────────────────────┘
         ↓
      前端展示


┌─────────────────────────────────────┐
│            war_events               │
├─────────────────────────────────────┤
│ id (PK)                             │
│ title (NOT NULL)                    │
│ country (NOT NULL)                  │
│ location_name (NOT NULL)            │
│ latitude (NOT NULL)                 │
│ longitude (NOT NULL)                │
│ event_type (NOT NULL, CHECK)        │
│ severity (NOT NULL, CHECK)          │
│ source (NOT NULL)                   │
│ source_url (NOT NULL, UNIQUE)       │
│ event_date (NOT NULL)               │
│ article_oss_url (NOT NULL)          │ ← OSS 文章路径
│ status (CHECK)                      │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         阿里云 OSS                   │
├─────────────────────────────────────┤
│ 文章 JSON 内容:                      │
│ - title                             │
│ - summary                           │
│ - content.sections                  │
│ - generated_at                      │
└─────────────────────────────────────┘
```

> **设计说明**: 一个事件对应一篇文章，直接在事件表存储 OSS 文章路径，无需单独的文章表。

### 2.2 PostgreSQL 表结构

#### war_events (战争事件表)
```sql
CREATE TABLE war_events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    country VARCHAR(100) NOT NULL,       -- 国家/地区，必填
    location_name VARCHAR(200) NOT NULL, -- 地点名称，必填
    latitude DECIMAL(10, 7) NOT NULL,    -- 纬度，必填
    longitude DECIMAL(10, 7) NOT NULL,   -- 经度，必填
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('military_conflict', 'terrorist_attack', 'political_unrest', 'border_clash', 'other')),  -- 事件类型，必填
    severity INT NOT NULL CHECK (severity BETWEEN 1 AND 5),  -- 严重程度 1-5，必填
    source VARCHAR(100) NOT NULL,        -- 数据来源，必填
    source_url VARCHAR(1000) NOT NULL UNIQUE,  -- 来源链接，必填且唯一
    event_date TIMESTAMP NOT NULL,       -- 事件发生时间，必填
    article_oss_url VARCHAR(1000) NOT NULL,  -- OSS 文章路径，必填
    status VARCHAR(20) DEFAULT 'processed' CHECK (status IN ('pending', 'processed', 'invalid')),  -- 状态约束
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_war_events_country ON war_events(country);
CREATE INDEX idx_war_events_location ON war_events(latitude, longitude);
CREATE INDEX idx_war_events_date ON war_events(event_date);
CREATE INDEX idx_war_events_type ON war_events(event_type);
CREATE INDEX idx_war_events_status ON war_events(status);
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| title | ✅ | 事件标题 |
| country | ✅ | 国家/地区，用于筛选 |
| location_name | ✅ | 具体地点名称 |
| latitude/longitude | ✅ | 经纬度坐标，用于地图标记 |
| event_type | ✅ | 事件类型（见下方枚举定义）|
| severity | ✅ | 严重程度 1-5（见下方级别定义）|
| source | ✅ | 数据来源 |
| source_url | ✅ | 来源链接，唯一标识 |
| event_date | ✅ | 事件发生时间 |
| article_oss_url | ✅ | OSS 文章路径 |

**event_type 枚举定义：**

| 值 | 中文名 | 说明 | 地图标记颜色 |
|----|-------|------|-------------|
| `military_conflict` | 军事冲突 | 国家/组织间的武装冲突、战争 | 红色 |
| `terrorist_attack` | 恐怖袭击 | 恐怖组织发起的袭击事件 | 橙色 |
| `political_unrest` | 政治动荡 | 政变、抗议、暴乱等 | 黄色 |
| `border_clash` | 边境冲突 | 边境地区的武装摩擦 | 紫色 |
| `other` | 其他 | 无法归类的冲突事件 | 灰色 |

**severity 级别定义：**

| 级别 | 严重程度 | 说明 | 地图标记大小 |
|----|---------|------|-------------|
| 1 | 轻微 | 小规模摩擦，伤亡<10人 | 小圆点 |
| 2 | 一般 | 局部冲突，伤亡10-50人 | 中小圆点 |
| 3 | 中等 | 区域冲突，伤亡50-200人 | 中等圆点 |
| 4 | 严重 | 大规模冲突，伤亡200-1000人 | 大圆点 |
| 5 | 极严重 | 重大战争/灾难，伤亡>1000人 | 最大圆点 |

**OSS 文章 JSON 结构：**
```json
{
  "title": "俄乌边境军事冲突动态汇总",
  "summary": "2024年1月15日，乌克兰东部地区发生...",
  "content": {
    "sections": [
      {"heading": "事件概述", "text": "..."},
      {"heading": "参与方", "text": "..."},
      {"heading": "影响分析", "text": "..."}
    ]
  },
  "generated_at": "2024-01-15T10:30:00Z",
  "model_version": "qwen-7b"
}
```

### 2.3 爬虫配置管理

采用 **crontab + 配置文件** 方式管理爬虫任务：

```bash
# crontab 示例
# 每30分钟执行一次新闻采集
*/30 * * * * cd /app && python scripts/crawl_news.py >> /var/log/crawl.log 2>&1

# 每小时执行一次冲突数据采集
0 * * * * cd /app && python scripts/crawl_conflict.py >> /var/log/crawl.log 2>&1
```

**配置文件示例** (`config/crawl.yaml`):
```yaml
news_api:
  api_key: ${NEWS_API_KEY}
  base_url: https://newsapi.org/v2
  keywords:
    - war
    - conflict
    - military

acled:
  api_key: ${ACLED_API_KEY}
  base_url: https://api.acleddata.com/acled/read

oss:
  raw_bucket: warsandbox-raw-data
  article_bucket: warsandbox-articles

dashvector:
  api_key: ${DASHVECTOR_API_KEY}
  endpoint: ${DASHVECTOR_ENDPOINT}
```

### 2.3 阿里云 DashVector 集合设计

#### 设计原则

**简洁设计，只做去重：**

```
爬虫采集 → DashVector (向量化+去重) → Qwen提取 → PostgreSQL (结构化事件)
```

- DashVector 只存储向量 + 来源信息，用于去重
- 去重后的数据直接交给 Qwen 提取
- 提取结果存入 PostgreSQL

#### 集合结构

| 集合名称 | 用途 | 向量维度 | 元数据字段 |
|---------|------|---------|-----------|
| `news_vectors` | 新闻文本向量 | 1536 | source, published_at |
| `conflict_vectors` | 冲突事件向量 | 1536 | event_type, location |

#### 创建集合

```python
import dashvector

# 初始化客户端
client = dashvector.Client(
    api_key='your_api_key',
    endpoint='your_endpoint'
)

# 创建新闻向量集合
news_collection = client.create_collection(
    name='news_vectors',
    dimension=1536,              # text-embedding-ada-002 输出维度
    metric='cosine',             # 余弦相似度
    fields_schema={
        'source': str,
        'published_at': str
    }
)

# 创建冲突事件向量集合
conflict_collection = client.create_collection(
    name='conflict_vectors',
    dimension=1536,
    metric='cosine',
    fields_schema={
        'event_type': str,
        'location': str
    }
)
```

#### 去重检查流程

```python
def check_duplicate(collection, text, embedding, threshold=0.95):
    """
    检查内容是否重复
    返回: is_duplicate (是否重复)
    """
    # 查询相似向量
    results = collection.query(
        vector=embedding,
        top_k=1
    )

    # 判断是否重复 (相似度阈值 0.95)
    if results and results[0].score >= threshold:
        return True  # 重复

    return False  # 不重复


def process_new_data(collection, text):
    """
    处理新数据流程
    """
    # 1. 调用 OpenAI 获取向量
    embedding = get_embedding_from_openai(text)

    # 2. 检查是否重复
    if check_duplicate(collection, text, embedding):
        print("数据重复，跳过")
        return None

    # 3. 不重复，存入向量库
    collection.insert(
        ids=[f'vec_{uuid.uuid4().hex[:12]}'],
        vectors=[embedding],
        fields=[{
            'source': 'NewsAPI',
            'published_at': '2024-01-15'
        }]
    )

    # 4. 交给 Qwen 提取信息
    extracted_info = qwen_extract(text)

    # 5. 存入 PostgreSQL
    save_to_database(extracted_info)

    return extracted_info
```

#### DashVector 优势

| 特性 | 说明 |
|------|------|
| 全托管 | 无需运维，自动扩缩容 |
| 高性能 | 毫秒级检索响应 |
| 集成简单 | Python SDK 开箱即用 |
| 阿里云生态 | 与 OSS、RDS 无缝集成 |

### 2.4 阿里云 OSS 分桶设计

#### Bucket 1: warsandbox-raw-data (原始数据桶)

| 目录结构 | 说明 |
|---------|------|
| `/news/{year}/{month}/{day}/{source}/{id}.json` | 新闻原始数据 |
| `/conflict/{source}/{date}/{id}.json` | 冲突数据库原始数据 |

#### Bucket 2: warsandbox-articles (文章桶)

| 目录结构 | 说明 |
|---------|------|
| `/events/{year}/{month}/{event_id}.json` | 事件摘要文章 |

#### Python OSS 客户端示例

```python
import oss2

# 原始数据桶
raw_bucket = oss2.Bucket(
    oss2.Auth(access_key_id, access_key_secret),
    endpoint, 'warsandbox-raw-data'
)

# 文章桶
article_bucket = oss2.Bucket(
    oss2.Auth(access_key_id, access_key_secret),
    endpoint, 'warsandbox-articles'
)

# 存储原始数据
raw_bucket.put_object(
    f'news/2024/01/15/newsapi/{news_id}.json',
    json.dumps(news_data)
)

# 存储生成文章
article_bucket.put_object(
    f'events/2024/01/{event_id}.json',
    json.dumps(article_data)
)
```

---

## 3. API 设计

### 3.1 RESTful API 规范

**基础路径**: `/api/v1`

**响应格式**:
```json
{
    "code": 200,
    "message": "success",
    "data": { ... },
    "timestamp": "2024-01-15T10:30:00Z"
}
```

**错误响应**:
```json
{
    "code": 400,
    "message": "Invalid parameter",
    "error": "VALIDATION_ERROR",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3.2 Java 服务 API 端点

#### 战争事件 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/war-events` | 获取事件列表（分页、筛选）|
| GET | `/war-events/{id}` | 获取事件详情 |
| GET | `/war-events/map` | 获取地图标记数据 |
| GET | `/war-events/stats` | 获取统计数据 |

**请求示例**:
```
GET /api/v1/war-events?start_date=2024-01-01&end_date=2024-01-31&severity=3&page=1&page_size=20
```

**响应示例**:
```json
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": 1,
                "title": "俄乌冲突最新进展",
                "location_name": "乌克兰",
                "latitude": 50.4501,
                "longitude": 30.5234,
                "event_type": "军事冲突",
                "severity": 4,
                "casualties_dead": 120,
                "event_date": "2024-01-15T08:00:00Z"
            }
        ],
        "total": 100,
        "page": 1,
        "page_size": 20
    }
}
```

#### 文章 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/articles/{eventId}` | 获取事件相关文章 |
| GET | `/articles/oss/{ossUrl}` | 从 OSS 获取文章内容 |

#### 采集配置 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/crawl-config` | 获取采集配置列表 |
| PUT | `/crawl-config/{id}` | 更新采集配置（频率、启用状态等）|
| POST | `/crawl-config/trigger` | 手动触发采集 |

### 3.3 Python AI 服务 API（内部调用）

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/ai/extract` | 信息提取（地点/事件/时间等）|
| POST | `/ai/generate` | 文章生成 |
| POST | `/ai/vectorize` | 数据向量化 |
| POST | `/ai/check-duplicate` | 去重检查 |

**信息提取请求示例**:
```json
POST /ai/extract
{
    "raw_data": "新闻原文内容...",
    "source": "NewsAPI"
}
```

**信息提取响应示例**:
```json
{
    "extracted_info": {
        "title": "俄乌边境发生军事冲突",
        "location_name": "顿涅茨克",
        "latitude": 48.0159,
        "longitude": 37.8028,
        "event_type": "军事冲突",
        "event_date": "2024-01-15T08:00:00Z",
        "casualties_dead": 50,
        "casualties_injured": 120,
        "participants": ["乌克兰军队", "俄罗斯军队"],
        "severity_estimate": 4
    }
}
```

**文章生成响应示例**:
```json
{
    "article": {
        "title": "俄乌边境军事冲突动态汇总",
        "summary": "2024年1月15日...",
        "content": {
            "sections": [
                {"heading": "事件概述", "text": "..."},
                {"heading": "参与方", "text": "..."},
                {"heading": "影响分析", "text": "..."}
            ]
        }
    }
}
```

---

## 4. 前端设计

### 4.1 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Main Content                      │   │
│  │                  (战争沙盘页面)                        │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: 数据更新时间 | 统计信息 | Copyright                 │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 战争沙盘页面 (WarMap.vue)

```
┌─────────────────────────────────────────────────────────────┐
│  筛选栏: 时间范围 | 国家 | 事件类型 | 严重程度 | 刷新按钮       │
├─────────────────────────────────────────────────────────────┤
│                                            │               │
│                                            │  事件列表     │
│              地图区域                       │  ┌─────────┐  │
│           (Leaflet)                        │  │ 事件1   │  │
│                                            │  │ 事件2   │  │
│           点击标记 → 文章弹窗               │  │ 事件3   │  │
│                                            │  └─────────┘  │
│                                            │               │
│   [地图与列表联动]                          │               │
│   - 点击地图标记 → 列表滚动到对应事件        │               │
│   - 点击列表事件 → 地图定位到对应标记        │               │
│                                            │               │
├─────────────────────────────────────────────────────────────┤
│  统计面板: 总事件数 | 本周新增 | 热点区域 Top5                │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 组件树

```
App
├── Header
│   └── Logo
│
├── RouterView
│   └── WarMap
│       ├── MapFilter
│       ├── LeafletMap
│       │   ├── EventMarker
│       │   └── ArticlePopup
│       ├── EventList
│       │   └── EventCard
│       └── StatsPanel
│           ├── EventCount
│           ├── WeeklyTrendChart
│           └── HotRegionsList
│
└── Footer
    ├── LastUpdateTime
    └── Copyright
```

### 4.4 地图-列表联动机制

| 触发动作 | 响应行为 |
|---------|---------|
| 点击地图标记 | 事件列表滚动到对应事件卡片，高亮显示 |
| 点击列表事件卡片 | 地图定位到对应标记，放大显示，弹出详情 |
| 筛选条件变更 | 地图标记和事件列表同步更新 |

### 4.5 筛选栏功能

| 筛选项 | 类型 | 说明 |
|-------|------|------|
| 时间范围 | DatePicker | 选择起止日期 |
| 国家 | Select | 下拉选择国家/地区 |
| 事件类型 | Select | military_conflict / terrorist_attack / political_unrest / border_clash / other |
| 严重程度 | Select | 1-5 级 |
| 刷新按钮 | Button | 手动刷新数据 |

---

## 5. 后端设计

### 5.1 Java 项目结构

```
backend/java/
├── src/main/java/com/warsandbox/
│   ├── WarsandboxApplication.java
│   │
│   ├── config/
│   │   ├── ScheduleConfig.java         # 定时任务配置
│   │   ├── CorsConfig.java
│   │   └── OpenApiConfig.java
│   │
│   ├── controller/
│   │   ├── WarEventController.java     # 事件查询 API
│   │   ├── ArticleController.java      # 文章 API
│   │   └── CrawlConfigController.java  # 采集配置 API
│   │
│   ├── service/
│   │   ├── WarEventService.java        # 事件业务逻辑
│   │   ├── CrawlService.java           # 数据采集服务
│   │   └── PythonClientService.java    # Python 服务调用
│   │
│   ├── repository/
│   │   ├── WarEventRepository.java
│   │   ├── ArticleRepository.java
│   │   └── CrawlConfigRepository.java
│   │
│   ├── model/
│   │   ├── entity/
│   │   │   ├── WarEvent.java
│   │   │   ├── Article.java
│   │   │   └── CrawlConfig.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   └── enums/
│   │
│   ├── scheduler/
│   │   └── CrawlScheduler.java         # 爬虫定时调度
│   │
│   └── client/
│       ├── NewsApiClient.java          # 新闻 API 客户端
│       ├── ConflictDbClient.java       # 冲突数据库客户端
│       └── OssClient.java              # 阿里云 OSS 客户端
│
├── src/main/resources/
│   ├── application.yml
│   └── application-prod.yml
│
└── pom.xml
```

### 5.2 Python 项目结构（同容器）

```
backend/python/
├── app/
│   ├── main.py                         # FastAPI 入口
│   ├── config.py                       # 配置
│   │
│   ├── api/
│   │   ├── extract.py                  # 信息提取接口
│   │   ├── generate.py                 # 文章生成接口
│   │   └── vectorize.py                # 向量化接口
│   │
│   ├── models/
│   │   ├── qwen_loader.py              # Qwen 模型加载
│   │   └── schemas.py                  # Pydantic 模型
│   │
│   ├── services/
│   │   ├── extractor.py                # 信息提取服务
│   │   ├── generator.py                # 文章生成服务
│   │   └── vector_processor.py        # 向量化处理
│   │
│   ├── prompts/
│   │   ├── extract_template.txt        # 提取提示词模板
│   │   └── generate_template.txt       # 生成提示词模板
│   │
│   └── clients/
│       ├── dashvector_client.py       # 阿里云 DashVector 客户端
│       └── oss_client.py               # 阿里云 OSS 客户端
│
├── requirements.txt
└── README.md
```

### 5.3 爬虫脚本设计

#### 5.3.1 架构图

```
┌──────────────┐
│ Python 脚本  │  crontab 定时执行
│ (爬虫)       │
└──────┬───────┘
       │ HTTP POST
       ▼
┌──────────────┐
│ Java API     │  /api/v1/events/import
│ (存储服务)   │
└──────┬───────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│PostgreSQL│   │   OSS    │   │DashVector│
└──────────┘   └──────────┘   └──────────┘
```

#### 5.3.2 数据源对比

| 项目 | Tavily | DuckDuckGo |
|------|--------|------------|
| **API Key** | 需要 | 不需要 |
| **免费额度** | 1000次/月 | 无限制（有速率限制） |
| **返回内容** | 搜索结果 + 摘要 + 原文 | 搜索结果 + 摘要 |
| **时间限制** | `days` 参数 | `timelimit` 参数 |
| **适合场景** | 生产环境 | 开发测试 |
| **Python 库** | `tavily-python` | `duckduckgo-search` |

#### 5.3.3 爬虫脚本实现

**目录结构：**
```
backend/python/scripts/
├── crawl.py              # 爬虫主脚本
├── crawlers/
│   ├── __init__.py
│   ├── base.py           # 基类
│   ├── tavily_crawler.py # Tavily 爬虫
│   └── duck_crawler.py   # DuckDuckGo 爬虫
└── config.py             # 配置
```

**基类定义：**
```python
# crawlers/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class NewsItem:
    title: str
    url: str
    content: str
    source: str
    published_at: Optional[str] = None

class BaseCrawler(ABC):
    @abstractmethod
    def search(self, query: str, max_results: int = 20, days: int = 7) -> List[NewsItem]:
        pass
```

**Tavily 爬虫：**
```python
# crawlers/tavily_crawler.py
from tavily import TavilyClient
from .base import BaseCrawler, NewsItem

class TavilyCrawler(BaseCrawler):
    def __init__(self, api_key: str):
        self.client = TavilyClient(api_key=api_key)

    def search(self, query: str, max_results: int = 20, days: int = 7) -> List[NewsItem]:
        response = self.client.search(
            query=query,
            max_results=max_results,
            days=days,
            include_raw_content=True
        )
        return [
            NewsItem(
                title=r["title"],
                url=r["url"],
                content=r["content"],
                source="tavily"
            )
            for r in response["results"]
        ]
```

**DuckDuckGo 爬虫：**
```python
# crawlers/duck_crawler.py
from duckduckgo_search import DDGS
from .base import BaseCrawler, NewsItem

class DuckCrawler(BaseCrawler):
    def search(self, query: str, max_results: int = 20, days: int = 7) -> List[NewsItem]:
        # DuckDuckGo 时间限制映射
        timelimit = "w" if days <= 7 else "m" if days <= 30 else "y"

        with DDGS() as ddgs:
            results = ddgs.text(
                keywords=query,
                max_results=max_results,
                timelimit=timelimit
            )

        return [
            NewsItem(
                title=r["title"],
                url=r["href"],
                content=r["body"],
                source="duckduckgo"
            )
            for r in results
        ]
```

**主脚本：**
```python
# scripts/crawl.py
import requests
from crawlers.tavily_crawler import TavilyCrawler
from crawlers.duck_crawler import DuckCrawler
from config import Config

def get_crawler(source: str):
    """获取爬虫实例"""
    if source == "tavily":
        return TavilyCrawler(api_key=Config.TAVILY_API_KEY)
    else:
        return DuckCrawler()

def send_to_java(news_items: list) -> dict:
    """发送到 Java 接口"""
    response = requests.post(
        f"{Config.JAVA_API_URL}/api/v1/events/import",
        json={"items": [item.__dict__ for item in news_items]},
        timeout=30
    )
    return response.json()

def main():
    # 1. 获取爬虫
    crawler = get_crawler(Config.CRAWLER_SOURCE)

    # 2. 爬取数据
    print(f"开始爬取 (source={Config.CRAWLER_SOURCE})...")
    news_items = crawler.search(
        query=Config.CRAWL_QUERY,
        max_results=Config.CRAWL_MAX_RESULTS,
        days=Config.CRAWL_DAYS
    )
    print(f"爬取到 {len(news_items)} 条数据")

    # 3. 发送到 Java 接口
    print("发送到 Java 接口...")
    result = send_to_java(news_items)
    print(f"结果: {result}")

if __name__ == "__main__":
    main()
```

**配置文件：**
```python
# scripts/config.py
import os

class Config:
    # 爬虫配置
    CRAWLER_SOURCE = os.getenv("CRAWLER_SOURCE", "duckduckgo")  # tavily / duckduckgo
    CRAWL_QUERY = os.getenv("CRAWL_QUERY", "战争 冲突 军事 恐怖袭击 最新动态")
    CRAWL_MAX_RESULTS = int(os.getenv("CRAWL_MAX_RESULTS", "20"))
    CRAWL_DAYS = int(os.getenv("CRAWL_DAYS", "7"))

    # Tavily API Key
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

    # Java API
    JAVA_API_URL = os.getenv("JAVA_API_URL", "http://localhost:8080")
```

#### 5.3.4 Java 接口定义

**接口：**
```
POST /api/v1/events/import
```

**请求体：**
```json
{
  "items": [
    {
      "title": "俄乌冲突最新进展",
      "url": "https://example.com/news/1",
      "content": "2024年1月15日...",
      "source": "duckduckgo"
    }
  ]
}
```

**响应体：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "imported": 15,
    "duplicates": 5
  }
}
```

**Java 处理流程：**
```
1. 接收爬虫数据
2. 调用 Python 向量化服务 (去重检查)
3. 调用 Python Qwen 服务 (信息提取 + 文章生成)
4. 存储: PostgreSQL + OSS + DashVector
```

#### 5.3.5 crontab 配置

```bash
# 编辑 crontab
crontab -e

# 每30分钟执行一次
*/30 * * * * cd /app/scripts && python crawl.py >> /var/log/crawl.log 2>&1
```

#### 5.3.6 查询参数说明

| 参数 | Tavily | DuckDuckGo | 说明 |
|------|--------|------------|------|
| 时间范围 | `days=7` | `timelimit="w"` | Tavily精确到天，DuckDuckGo粒度较粗 |
| 最大结果 | `max_results=20` | `max_results=20` | 一次返回的最大条数 |
| 关键词 | `query="战争 冲突..."` | `keywords="战争 冲突..."` | 搜索关键词，空格分隔 |

**时间限制对照表：**

| 需求 | Tavily | DuckDuckGo |
|------|--------|------------|
| 最近1天 | `days=1` | `timelimit="d"` |
| 最近7天 | `days=7` | `timelimit="w"` |
| 最近30天 | `days=30` | `timelimit="m"` |

---

## 6. 数据流设计

### 6.1 第一阶段核心数据链路

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              数据采集层                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│   │ 冲突数据库   │    │   新闻 API   │    │  自定义源    │                     │
│   │ ACLED/UCDP  │    │  NewsAPI    │    │   RSS等     │                     │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                     │
│          │                  │                   │                          │
│          └──────────┬───────┴───────────────────┘                          │
│                     │                                                       │
│                     ▼                                                       │
│          ┌─────────────────────────┐                                       │
│          │   Java 爬虫服务          │                                       │
│          │   - 定时调度采集          │                                       │
│          │   - 数据清洗去重          │                                       │
│          │   - 原始数据入库          │                                       │
│          └────────────┬────────────┘                                       │
│                                                                             │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              向量存储层                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│          ┌─────────────────────────┐                                       │
│          │   阿里云 DashVector      │                                       │
│          │   存储: 原始数据向量      │                                       │
│          │   - 新闻文本 Embedding   │                                       │
│          │   - 冲突数据 Embedding   │                                       │
│          │   用途: 语义检索、去重    │                                       │
│          └────────────┬────────────┘                                       │
│                                                                             │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI 处理层                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│          ┌─────────────────────────┐                                       │
│          │   Python + Qwen         │                                       │
│          │   信息提取服务           │                                       │
│          │   - 提取地点/坐标        │                                       │
│          │   - 提取事件类型         │                                       │
│          │   - 提取时间/参与方      │                                       │
│          │   - 提取伤亡数据         │                                       │
│          └────────────┬────────────┘                                       │
│                     │                                                       │
│                     ▼                                                       │
│          ┌─────────────────────────┐                                       │
│          │   Python + Qwen         │                                       │
│          │   文章生成服务           │                                       │
│          │   - 整合多源信息         │                                       │
│          │   - 生成事件摘要文章     │                                       │
│          │   - JSON 格式输出        │                                       │
│          └────────────┬────────────┘                                       │
│                                                                             │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              数据存储层                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌───────────────────┐        ┌───────────────────┐                       │
│    │   阿里云 OSS       │        │ 阿里云 RDS         │                       │
│    │                    │        │   PostgreSQL      │                       │
│    │   存储:            │        │                    │                       │
│    │   - 生成的文章     │        │   存储:            │                       │
│    │   - 事件摘要       │        │   - 地点信息       │                       │
│    │   - 原始数据备份   │        │   - 事件信息       │                       │
│    │   - JSON 格式      │        │   - 时间数据       │                       │
│    └───────────────────┘        └───────────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              前端展示层                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│          ┌─────────────────────────┐                                       │
│          │   Vue 3 前端            │                                       │
│          │   - Leaflet 地图可视化   │                                        │
│          │   - 事件列表展示         │                                        │
│          │   - 文章阅读弹窗         │                                        │
│          └─────────────────────────┘                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 数据流转详细流程

| 步骤 | 处理环节 | 输入 | 输出 | 存储位置 |
|------|---------|------|------|---------|
| 1 | 爬虫采集 | 新闻/冲突数据源 URL | 原始文本数据 | - |
| 2 | 向量化 | 原始文本 | Embedding 向量 | 阿里云 DashVector |
| 3 | 去重检查 | 新数据向量 | 是否重复判定 | 阿里云 DashVector |
| 4 | 信息提取 | 原始文本 | 结构化信息（地点/事件/时间）| 阿里云 RDS PostgreSQL |
| 5 | 文章生成 | 多源数据 + 提取信息 | JSON 格式文章 | 阿里云 OSS |
| 6 | 前端展示 | 数据库数据 | 可视化页面 | - |

### 6.3 各存储组件职责

| 存储组件 | 数据类型 | 主要用途 | 数据流向 |
|---------|---------|---------|---------|
| **阿里云 DashVector** | 原始数据向量 | 去重、语义检索 | 爬虫 → DashVector → Qwen提取 |
| **阿里云 RDS PostgreSQL** | 地点、事件信息 | 结构化查询、关联分析 | Qwen提取 → PostgreSQL |
| **阿里云 OSS** | 生成的文章 | 文章存储、前端展示 | Qwen生成 → OSS |

### 6.4 Qwen 模型任务分解

| 任务 | 输入 | 输出 | 频率 |
|------|------|------|------|
| **信息提取** | DashVector 向量检索结果 | 结构化 JSON（地点/事件/时间/参与方）| 每条新数据 |
| **文章生成** | 提取信息 + 相关历史数据 | JSON 格式文章 | 每条新数据 |
| **去重判定** | 新数据向量 vs 已有向量 | 相似度分数、是否重复 | 每条新数据 |

> **注意**: Qwen 信息提取的具体字段需要在开发过程中调试优化，初步字段包括：
> - 地点名称、经纬度坐标
> - 事件类型、事件描述
> - 发生时间、持续时间
> - 参与方（国家/组织/势力）
> - 伤亡数据（死亡/受伤人数）
> - 事件来源、可信度评分

### 6.5 爬虫采集配置

| 配置项 | 说明 | 默认值 |
|-------|------|--------|
| `crawl.interval` | 采集间隔时间（分钟）| 30 |
| `crawl.sources` | 启用的数据源列表 | ACLED, NewsAPI |
| `crawl.batch_size` | 每次采集数据条数上限 | 100 |
| `crawl.retry_times` | 失败重试次数 | 3 |
| `crawl.timeout` | 单次请求超时时间（秒）| 10 |

> **说明**: 所有采集参数可通过配置文件或管理界面动态调整

---

## 7. 部署设计

### 7.1 Docker Compose

```yaml
version: '3.8'

services:
  # 前端
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  # 后端服务 (Java + Python 同容器)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"    # Java API
      - "8000:8000"    # Python FastAPI (内部)
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      # 阿里云 RDS PostgreSQL
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      # 阿里云 DashVector
      - DASHVECTOR_API_KEY=${DASHVECTOR_API_KEY}
      - DASHVECTOR_ENDPOINT=${DASHVECTOR_ENDPOINT}
      # 阿里云 OSS
      - OSS_ENDPOINT=${OSS_ENDPOINT}
      - OSS_ACCESS_KEY=${OSS_ACCESS_KEY}
      - OSS_SECRET_KEY=${OSS_SECRET_KEY}
      - OSS_RAW_BUCKET=${OSS_RAW_BUCKET}
      - OSS_ARTICLE_BUCKET=${OSS_ARTICLE_BUCKET}
      # OpenAI
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./models:/app/models  # Qwen 模型文件
```

> **说明**: 数据库、向量库、缓存均使用阿里云托管服务，仅需部署前端和后端容器。

### 7.2 环境变量

```env
# 阿里云 RDS PostgreSQL
DB_HOST=rm-xxx.pg.rds.aliyuncs.com
DB_PORT=5432
DB_NAME=warsandbox
DB_USER=admin
DB_PASSWORD=your_password

# 阿里云 DashVector
DASHVECTOR_API_KEY=your_dashvector_api_key
DASHVECTOR_ENDPOINT=your_dashvector_endpoint

# 阿里云 OSS (分桶存储)
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY=your_access_key
OSS_SECRET_KEY=your_secret_key
OSS_RAW_BUCKET=warsandbox-raw-data      # 原始数据桶
OSS_ARTICLE_BUCKET=warsandbox-articles  # 文章桶

# OpenAI (向量化模型 - Python 调用)
OPENAI_API_KEY=your_openai_api_key
EMBEDDING_MODEL=text-embedding-ada-002
EMBEDDING_DIM=1536

# Qwen 模型配置 (信息提取 + 文章生成)
QWEN_MODEL_PATH=/app/models/qwen
QWEN_MODEL_SIZE=7b                       # 7b 或 14b
QWEN_MAX_TOKENS=4096
QWEN_EXTRACT_TEMPERATURE=0.1             # 信息提取 - 低温度保证准确性
QWEN_GENERATE_TEMPERATURE=0.3            # 文章生成 - 适中温度

# 新闻 API
NEWS_API_KEY=your_news_api_key
NEWS_API_URL=https://newsapi.org/v2

# 冲突数据库
ACLED_API_KEY=your_acled_key
```

---

## 8. 开发计划

### Sprint 1 (Week 1-2): 项目框架
- [ ] 创建 Vue 3 前端项目
- [ ] 创建 Spring Boot 后端项目
- [ ] 创建 Python FastAPI 项目（同容器配置）
- [ ] 配置 Docker Compose
- [ ] 阿里云 RDS PostgreSQL 表结构初始化
- [ ] 阿里云 DashVector 集合创建
- [ ] 阿里云 OSS 分桶配置

### Sprint 2 (Week 3-4): 数据采集
- [ ] Java 爬虫服务开发
- [ ] 定时调度配置（可配置频率）
- [ ] NewsAPI 客户端
- [ ] ACLED 数据源接入
- [ ] Python 向量化服务（调用 OpenAI API）
- [ ] DashVector 去重逻辑

### Sprint 3 (Week 5-6): AI 处理
- [ ] Qwen 模型本地部署
- [ ] 信息提取服务开发
- [ ] 文章生成服务开发
- [ ] 提取字段调试优化
- [ ] OSS 文章存储

### Sprint 4 (Week 7-8): 前端展示
- [ ] Leaflet 地图组件
- [ ] 事件标记和弹窗
- [ ] 文章阅读组件
- [ ] 统计图表展示

### Sprint 5 (Week 9-10): 优化部署
- [ ] 性能优化
- [ ] 采集配置管理界面
- [ ] 错误处理完善
- [ ] 生产环境部署