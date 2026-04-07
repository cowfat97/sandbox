package com.taco.api.controller;

import com.taco.infrastructure.client.OssClient;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 健康检查控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Api(tags = "健康检查")
public class HealthController {

    private final DataSource dataSource;
    private final OssClient ossClient;

    /**
     * 综合健康检查
     */
    @GetMapping
    @ApiOperation("综合健康检查")
    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "UP");
        result.put("timestamp", System.currentTimeMillis());
        result.put("components", checkAll());
        return result;
    }

    /**
     * 数据库连接测试
     */
    @GetMapping("/db")
    @ApiOperation("数据库连接测试")
    public Map<String, Object> checkDatabase() {
        Map<String, Object> result = new LinkedHashMap<>();
        long start = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection()) {
            boolean valid = conn.isValid(5);
            long cost = System.currentTimeMillis() - start;
            result.put("status", valid ? "UP" : "DOWN");
            result.put("database", conn.getCatalog());
            result.put("driver", conn.getMetaData().getDatabaseProductName());
            result.put("version", conn.getMetaData().getDatabaseProductVersion());
            result.put("costMs", cost);
            log.info("数据库连接测试成功: cost={}ms", cost);
        } catch (Exception e) {
            long cost = System.currentTimeMillis() - start;
            result.put("status", "DOWN");
            result.put("error", e.getMessage());
            result.put("costMs", cost);
            log.error("数据库连接测试失败: {}", e.getMessage(), e);
        }
        return result;
    }

    /**
     * OSS 连接测试
     */
    @GetMapping("/oss")
    @ApiOperation("OSS 连接测试")
    public Map<String, Object> checkOss() {
        Map<String, Object> result = new LinkedHashMap<>();
        long start = System.currentTimeMillis();
        try {
            boolean connected = ossClient.testConnection();
            long cost = System.currentTimeMillis() - start;
            result.put("status", connected ? "UP" : "DOWN");
            result.put("costMs", cost);
            log.info("OSS 连接测试: status={}, cost={}ms", connected ? "成功" : "失败", cost);
        } catch (Exception e) {
            long cost = System.currentTimeMillis() - start;
            result.put("status", "DOWN");
            result.put("error", e.getMessage());
            result.put("costMs", cost);
            log.error("OSS 连接测试失败: {}", e.getMessage(), e);
        }
        return result;
    }

    /**
     * 检查所有组件
     */
    private Map<String, Object> checkAll() {
        Map<String, Object> components = new LinkedHashMap<>();
        components.put("database", checkDatabase());
        components.put("oss", checkOss());
        return components;
    }
}