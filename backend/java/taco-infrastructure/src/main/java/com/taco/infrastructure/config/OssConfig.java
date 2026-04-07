package com.taco.infrastructure.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OSS 客户端配置
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class OssConfig {

    private final OssProperties ossProperties;

    @Bean
    public OSS ossClient() {
        log.info("初始化 OSS 客户端: endpoint={}, bucket={}",
                ossProperties.getEndpoint(), ossProperties.getBucketName());

        return new OSSClientBuilder().build(
                ossProperties.getEndpoint(),
                ossProperties.getAccessKeyId(),
                ossProperties.getAccessKeySecret()
        );
    }
}