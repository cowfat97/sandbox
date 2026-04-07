package com.taco.infrastructure.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 错误码枚举
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    // ========== 通用错误码 1xxx ==========
    SUCCESS(0, "success"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "方法不允许"),
    INTERNAL_ERROR(500, "服务器内部错误"),
    SERVICE_UNAVAILABLE(503, "服务不可用"),

    // ========== 参数校验错误 2xxx ==========
    PARAM_MISSING(2001, "参数缺失"),
    PARAM_INVALID(2002, "参数格式错误"),
    PARAM_RANGE_ERROR(2003, "参数范围错误"),

    // ========== 业务错误码 3xxx ==========
    RESOURCE_NOT_FOUND(3001, "资源不存在"),
    RESOURCE_ALREADY_EXISTS(3002, "资源已存在"),
    OPERATION_FAILED(3003, "操作失败"),
    DATA_INVALID(3004, "数据无效"),

    // ========== 数据库错误码 4xxx ==========
    DB_INSERT_ERROR(4001, "数据插入失败"),
    DB_UPDATE_ERROR(4002, "数据更新失败"),
    DB_DELETE_ERROR(4003, "数据删除失败"),
    DB_QUERY_ERROR(4004, "数据查询失败"),

    // ========== 外部服务错误码 5xxx ==========
    EXTERNAL_SERVICE_ERROR(5001, "外部服务调用失败"),
    AI_MODEL_ERROR(5002, "AI 模型调用失败"),
    OSS_ERROR(5003, "对象存储操作失败");

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 错误消息
     */
    private final String message;
}