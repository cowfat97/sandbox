/**
 * TACO API 层
 *
 * 接口层职责：
 * - REST 控制器（Controller）
 * - 数据传输对象（DTO）
 * - 请求参数校验
 * - DTO 转换（Assembler）
 *
 * 设计原则：
 * - 依赖应用层
 * - 仅处理 HTTP 请求/响应
 * - 不包含业务逻辑
 * - 调用应用层服务
 */
package com.taco.api;