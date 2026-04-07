-- TACO 数据库初始化脚本
-- 数据库: PostgreSQL

-- 创建数据库（如果不存在）
-- 注意: PostgreSQL 不支持 IF EXISTS 创建数据库，需要手动创建或使用脚本
-- CREATE DATABASE taco;

-- =====================================================
-- 1. 表结构
-- =====================================================

-- 战争事件表
CREATE TABLE IF NOT EXISTS war_events (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    country         VARCHAR(50) NOT NULL,
    location_name   VARCHAR(100),
    latitude        DECIMAL(10, 6),
    longitude       DECIMAL(10, 6),
    event_type      VARCHAR(20) NOT NULL,
    severity        INT NOT NULL DEFAULT 3,
    source          VARCHAR(50),
    source_url      VARCHAR(500),
    event_date      DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    summary_id      VARCHAR(100),
    summary         TEXT,                          -- 摘要内容（可选存储）
    perspectives    JSONB,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted         INT NOT NULL DEFAULT 0,

    -- CHECK 约束：严重程度范围
    CONSTRAINT chk_severity CHECK (severity >= 1 AND severity <= 5),

    -- CHECK 约束：事件类型枚举
    CONSTRAINT chk_event_type CHECK (event_type IN (
        'military_conflict',
        'terrorist_attack',
        'political_unrest',
        'border_clash',
        'other'
    )),

    -- CHECK 约束：状态枚举
    CONSTRAINT chk_status CHECK (status IN (
        'pending',
        'processed',
        'invalid'
    )),

    -- CHECK 约束：经纬度范围
    CONSTRAINT chk_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    CONSTRAINT chk_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),

    -- CHECK 约束：逻辑删除值
    CONSTRAINT chk_deleted CHECK (deleted IN (0, 1))
);

-- 添加注释
COMMENT ON TABLE war_events IS '战争冲突事件表';
COMMENT ON COLUMN war_events.id IS '主键ID';
COMMENT ON COLUMN war_events.title IS '事件标题';
COMMENT ON COLUMN war_events.country IS '国家';
COMMENT ON COLUMN war_events.location_name IS '地点名称';
COMMENT ON COLUMN war_events.latitude IS '纬度 (-90 ~ 90)';
COMMENT ON COLUMN war_events.longitude IS '经度 (-180 ~ 180)';
COMMENT ON COLUMN war_events.event_type IS '事件类型: military_conflict, terrorist_attack, political_unrest, border_clash, other';
COMMENT ON COLUMN war_events.severity IS '严重程度 1-5';
COMMENT ON COLUMN war_events.source IS '数据来源';
COMMENT ON COLUMN war_events.source_url IS '来源链接';
COMMENT ON COLUMN war_events.event_date IS '事件日期';
COMMENT ON COLUMN war_events.status IS '状态: pending-待处理, processed-已处理, invalid-无效';
COMMENT ON COLUMN war_events.summary_id IS 'OSS摘要文件ID';
COMMENT ON COLUMN war_events.summary IS '摘要内容（可选，用于缓存）';
COMMENT ON COLUMN war_events.perspectives IS '多视角JSON数组';
COMMENT ON COLUMN war_events.created_at IS '创建时间';
COMMENT ON COLUMN war_events.updated_at IS '更新时间';
COMMENT ON COLUMN war_events.deleted IS '逻辑删除标记 0-未删除 1-已删除';

-- =====================================================
-- 2. 索引
-- =====================================================

-- GiST 空间索引（地图视野查询优化）
-- 使用 point 类型进行空间索引，比复合索引更高效
CREATE INDEX IF NOT EXISTS idx_location_gist ON war_events USING GIST (
    point(longitude, latitude)
);

-- 事件日期索引（列表排序）
CREATE INDEX IF NOT EXISTS idx_event_date ON war_events(event_date DESC);

-- 国家索引（热点区域统计）
CREATE INDEX IF NOT EXISTS idx_country ON war_events(country);

-- 事件类型索引（类型统计）
CREATE INDEX IF NOT EXISTS idx_event_type ON war_events(event_type);

-- 事件类型+国家复合索引（组合筛选）
CREATE INDEX IF NOT EXISTS idx_event_type_country ON war_events(event_type, country);

-- 状态索引（筛选）
CREATE INDEX IF NOT EXISTS idx_status ON war_events(status) WHERE deleted = 0;

-- 严重程度索引（严重事件查询）
CREATE INDEX IF NOT EXISTS idx_severity ON war_events(severity) WHERE severity >= 4;

-- 创建时间索引（分页查询）
CREATE INDEX IF NOT EXISTS idx_created_at ON war_events(created_at DESC);

-- 来源链接索引（去重查询）
CREATE INDEX IF NOT EXISTS idx_source_url ON war_events(source_url);

-- =====================================================
-- 3. 触发器
-- =====================================================

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_war_events_updated_at ON war_events;
CREATE TRIGGER update_war_events_updated_at
    BEFORE UPDATE ON war_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- perspectives JSON 结构校验触发器（可选）
CREATE OR REPLACE FUNCTION validate_perspectives()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.perspectives IS NOT NULL THEN
        -- 校验是否为数组
        IF jsonb_typeof(NEW.perspectives) != 'array' THEN
            RAISE EXCEPTION 'perspectives must be a JSON array';
        END IF;
        -- 校验每个元素是否包含必需字段
        IF EXISTS (
            SELECT 1 FROM jsonb_array_elements(NEW.perspectives) elem
            WHERE elem ? 'name' = false
               OR elem ? 'latitude' = false
               OR elem ? 'longitude' = false
        ) THEN
            RAISE EXCEPTION 'each perspective must have name, latitude, longitude fields';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS validate_war_events_perspectives ON war_events;
CREATE TRIGGER validate_war_events_perspectives
    BEFORE INSERT OR UPDATE ON war_events
    FOR EACH ROW
    EXECUTE FUNCTION validate_perspectives();

-- =====================================================
-- 4. 初始化数据（示例）
-- =====================================================

INSERT INTO war_events (title, country, location_name, latitude, longitude, event_type, severity, source, source_url, event_date, status, perspectives) VALUES
('俄乌边境军事冲突', '乌克兰', '顿涅茨克', 48.0159, 37.8028, 'military_conflict', 5, '路透社', 'https://example.com/news/1', CURRENT_DATE - INTERVAL '2 days', 'processed',
 '[{"name": "乌克兰", "latitude": 48.0159, "longitude": 37.8028, "zoom": 6}, {"name": "俄罗斯", "latitude": 55.7558, "longitude": 37.6173, "zoom": 5}]'::jsonb),

('叙利亚恐怖袭击事件', '叙利亚', '大马士革', 33.5138, 36.2765, 'terrorist_attack', 4, 'BBC', 'https://example.com/news/2', CURRENT_DATE - INTERVAL '3 days', 'processed',
 '[{"name": "叙利亚政府", "latitude": 33.5138, "longitude": 36.2765, "zoom": 6}]'::jsonb),

('伊朗政治动荡', '伊朗', '德黑兰', 35.6892, 51.3890, 'political_unrest', 3, 'CNN', 'https://example.com/news/3', CURRENT_DATE - INTERVAL '4 days', 'processed',
 '[{"name": "伊朗政府", "latitude": 35.6892, "longitude": 51.3890, "zoom": 5}]'::jsonb),

('印巴边境冲突', '印度', '克什米尔', 34.1526, 74.5765, 'border_clash', 4, '新华社', 'https://example.com/news/4', CURRENT_DATE - INTERVAL '5 days', 'processed',
 '[{"name": "印度", "latitude": 34.1526, "longitude": 74.5765, "zoom": 6}, {"name": "巴基斯坦", "latitude": 33.6844, "longitude": 73.0479, "zoom": 6}]'::jsonb),

('以色列军事行动', '以色列', '加沙地带', 31.3547, 34.3088, 'military_conflict', 5, '美联社', 'https://example.com/news/5', CURRENT_DATE - INTERVAL '6 days', 'processed',
 '[{"name": "以色列", "latitude": 31.3547, "longitude": 34.3088, "zoom": 7}, {"name": "巴勒斯坦", "latitude": 31.3547, "longitude": 34.3088, "zoom": 7}]'::jsonb)
ON CONFLICT DO NOTHING;