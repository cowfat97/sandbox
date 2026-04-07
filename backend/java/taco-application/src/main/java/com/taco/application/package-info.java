/**
 * TACO Application 层
 *
 * 应用层职责：
 * - 协调领域对象完成业务流程
 * - 应用服务（Application Service）
 * - 领域对象到 DTO 的转换（Assembler）
 * - 事务管理
 *
 * 设计原则：
 * - 依赖领域层和基础设施层
 * - 不包含业务逻辑（业务逻辑在领域层）
 * - 负责编排和协调
 */
package com.taco.application;