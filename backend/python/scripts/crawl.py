#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
爬虫脚本 - DuckDuckGo 搜索
"""
import json
import sys
from ddgs import DDGS

# ============ 配置 ============
QUERY = "战争 冲突 军事 恐怖袭击 最新动态"
MAX_RESULTS = 100
TIMELIMIT = "w"  # d=天, w=周, m=月

# ============ 主逻辑 ============
def crawl():
    """执行爬虫"""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(
                query=QUERY,
                max_results=MAX_RESULTS,
                timelimit=TIMELIMIT
            ))
        return results
    except Exception as e:
        print(f"错误: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    """主函数"""
    print(f"关键词: {QUERY}")
    print(f"时间限制: {TIMELIMIT}")
    print(f"最大结果: {MAX_RESULTS}")
    print("-" * 50)

    results = crawl()
    print(f"爬取到 {len(results)} 条数据\n")
    print(json.dumps(results, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()