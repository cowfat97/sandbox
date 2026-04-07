package com.taco.infrastructure.client;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.OSSObject;
import com.taco.infrastructure.config.OssProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * OSS 文件存储客户端
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OssClient {

    private final OSS ossClient;
    private final OssProperties ossProperties;

    /**
     * 获取文件内容
     *
     * @param summaryId 摘要 ID
     * @return 文件内容，不存在返回 null
     */
    public String getContent(String summaryId) {
        String key = ossProperties.getPrefix() + summaryId + ".txt";
        try {
            OSSObject object = ossClient.getObject(ossProperties.getBucketName(), key);
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(object.getObjectContent(), StandardCharsets.UTF_8))) {
                return reader.lines().collect(Collectors.joining("\n"));
            }
        } catch (Exception e) {
            log.warn("获取 OSS 文件失败: key={}, error={}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 上传文件内容
     *
     * @param summaryId 摘要 ID
     * @param content   文件内容
     * @return 是否成功
     */
    public boolean uploadContent(String summaryId, String content) {
        String key = ossProperties.getPrefix() + summaryId + ".txt";
        try {
            ossClient.putObject(ossProperties.getBucketName(), key,
                    content.getBytes(StandardCharsets.UTF_8));
            log.info("上传 OSS 文件成功: key={}", key);
            return true;
        } catch (Exception e) {
            log.error("上传 OSS 文件失败: key={}, error={}", key, e.getMessage(), e);
            return false;
        }
    }

    /**
     * 删除文件
     *
     * @param summaryId 摘要 ID
     * @return 是否成功
     */
    public boolean deleteContent(String summaryId) {
        String key = ossProperties.getPrefix() + summaryId + ".txt";
        try {
            ossClient.deleteObject(ossProperties.getBucketName(), key);
            log.info("删除 OSS 文件成功: key={}", key);
            return true;
        } catch (Exception e) {
            log.error("删除 OSS 文件失败: key={}, error={}", key, e.getMessage(), e);
            return false;
        }
    }

    /**
     * 测试连通性
     *
     * @return 是否连通
     */
    public boolean testConnection() {
        try {
            return ossClient.doesBucketExist(ossProperties.getBucketName());
        } catch (Exception e) {
            log.error("OSS 连接测试失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 获取访问 URL
     *
     * @param summaryId 摘要 ID
     * @return 访问 URL
     */
    public String getUrl(String summaryId) {
        if (ossProperties.getDomain() != null && !ossProperties.getDomain().isEmpty()) {
            return ossProperties.getDomain() + "/" + ossProperties.getPrefix() + summaryId + ".txt";
        }
        return "https://" + ossProperties.getBucketName() + "." +
                ossProperties.getEndpoint().replace("https://", "").replace("http://", "") +
                "/" + ossProperties.getPrefix() + summaryId + ".txt";
    }
}