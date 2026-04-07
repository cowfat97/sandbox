package com.taco.infrastructure.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * OSS 配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "aliyun.oss")
public class OssProperties {

    /**
     * 地域节点
     */
    private String endpoint;

    /**
     * AccessKey ID
     */
    private String accessKeyId;

    /**
     * AccessKey Secret
     */
    private String accessKeySecret;

    /**
     * 存储桶名称
     */
    private String bucketName;

    /**
     * 访问域名（可选）
     */
    private String domain;

    /**
     * 存储路径前缀
     */
    private String prefix = "summaries/";
}