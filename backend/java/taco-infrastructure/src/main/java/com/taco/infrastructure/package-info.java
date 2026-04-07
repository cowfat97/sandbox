/**
 * TACO Infrastructure 层
 *
 * 基础设施层职责：
 * - 实现领域层定义的仓储接口
 * - 数据库持久化（Mapper、PO）
 * - 外部服务调用（Client）
 * - 配置类（Config）
 * - 通用组件（工具类、异常处理、响应封装）
 *
 * 设计原则：
 * - 依赖领域层
 * - 技术实现细节
 * - 可替换的具体实现
 */
package com.taco.infrastructure;