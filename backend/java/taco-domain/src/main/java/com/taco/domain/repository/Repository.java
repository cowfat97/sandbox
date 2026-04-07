package com.taco.domain.repository;

import java.util.List;
import java.util.Optional;

/**
 * 仓储接口基类（领域层定义）
 *
 * @param <T>  领域实体类型
 * @param <ID> 主键类型
 */
public interface Repository<T, ID> {

    /**
     * 保存实体
     */
    T save(T entity);

    /**
     * 批量保存
     */
    List<T> saveAll(List<T> entities);

    /**
     * 根据 ID 查找
     */
    Optional<T> findById(ID id);

    /**
     * 查找所有
     */
    List<T> findAll();

    /**
     * 根据 ID 删除
     */
    void deleteById(ID id);

    /**
     * 删除实体
     */
    void delete(T entity);

    /**
     * 统计数量
     */
    long count();
}