package com.taco.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.taco.infrastructure.persistence.po.BasePO;

/**
 * Mapper 基类
 *
 * @param <T> PO 类型
 */
public interface BaseMapper<T extends BasePO> extends BaseMapper<T> {

}