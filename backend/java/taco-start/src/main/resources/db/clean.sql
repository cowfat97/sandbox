-- TACO 数据库清空脚本（开发测试用）
-- 谨慎执行：会删除所有数据

-- 清空事件表数据
TRUNCATE TABLE war_events RESTART IDENTITY CASCADE;