#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TACO - 全球冲突事件提取脚本
- 预处理过滤（关键词、时间、URL）
- 批量调用 Qwen（减少API次数）
- 按地区分组 + 风险分级输出
"""
import json
import sys
import re
from datetime import datetime
from typing import List, Dict, Any
from openai import OpenAI

# ============ 配置 ============
QWEN_API_BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1"
QWEN_API_KEY = "your-api-key-here"  # 替换为实际的 API Key
QWEN_MODEL = "qwen-plus"

BATCH_SIZE = 10  # 每批处理新闻数量
DATE_RANGE_DAYS = 7  # 只保留最近N天的新闻
DEDUP_DATE_TOLERANCE = 3  # 去重时日期容差（天）

# 地区枚举
VALID_REGIONS = ["东欧", "中东", "非洲", "南亚", "东南亚", "东亚", "拉美", "其他"]

# 冲突关键词（预处理过滤）
CONFLICT_KEYWORDS = [
    "战争", "冲突", "军事", "恐怖", "袭击", "爆炸", "炮击", "空袭",
    "边境", "摩擦", "交火", "战斗", "伤亡", "死伤", "难民",
    "入侵", "进攻", "反击", "撤军", "部署", "演习",
    "war", "conflict", "attack", "terror", "military", "bomb"
]

# ============ 提示词（地区分组+分级版） ============
BATCH_EXTRACTION_PROMPT = """你是一个全球军事冲突分析师。请分析以下新闻JSON数据，提取冲突事件并按地区分组，同时评估各地区风险等级。

## 输入新闻数据
{news_json}

## 任务要求

### 1. 事件筛选优先级
按以下优先级筛选冲突事件：
- 优先提取：正在发生的武装冲突、交火、空袭、恐怖袭击
- 其次提取：已发生的重大伤亡事件（伤亡≥10人）
- 次要提取：边境摩擦、小规模冲突、政治动荡导致的暴力事件
- 不提取：军事演习、装备部署、政策声明（除非涉及实际冲突）

### 2. 事件字段提取
- title: 事件简短标题（20-40字，突出关键信息）
- country: 发生国家（中文标准名称）
- sub_region: 子区域（如：俄乌边境、加沙地带、苏丹西部等）
- location_name: 具体地点/城市（如只有国家名则填"境内")
- event_type: 从以下选择：
  * military_conflict - 军事冲突/战争
  * terrorist_attack - 恐怖袭击
  * border_clash - 边境摩擦/交火
  * political_unrest - 政治动荡/内乱
  * other - 其他类型冲突
- severity: 严重程度1-5（判断标准见下）
- casualties: 伤亡人数（明确数字；"数十人"估计填30；无信息填null）
- description: 事件简述（20-30字）
- event_date: 事件日期（从新闻提取；无日期根据"最近"推断；无法推断填null)
- news_index: 对应输入新闻的index值

### 3. severity判断标准
- 5级: 大规模战争、国家级冲突、伤亡≥100人、多城市同时发生
- 4级: 区域冲突、持续交火、伤亡50-99人
- 3级: 局部冲突、边境交火、伤亡10-49人
- 2级: 小规模摩擦、零星冲突、伤亡1-9人
- 1级: 政治抗议、紧张局势升级、暂无实际冲突

### 4. 地区分类
将事件归入以下地区（根据country判断）：
- 东欧: 俄罗斯、乌克兰、巴尔干地区国家
- 中东: 以色列、巴勒斯坦、伊朗、叙利亚、也门、伊拉克、黎巴嫩、沙特、土耳其
- 非洲: 苏丹、刚果、索马里、埃塞俄比亚、尼日利亚、南非、埃及
- 南亚: 印度、巴基斯坦、阿富汗、克什米尔地区
- 东南亚: 缅甸、菲律宾、泰国、印尼、越南
- 东亚: 朝鲜、韩国、日本、中国台海地区
- 拉美: 委内瑞拉、哥伦比亚、墨西哥、巴西
- 其他: 无法归类

### 5. 地区风险分级（优先级从高到低判断）
判断规则（满足任一条件即生效）：
- level=5 高风险: max_severity≥4 或 total_casualties≥100
- level=4 较高风险: max_severity≥3 或 event_count≥3 或 total_casualties≥50
- level=3 中风险: max_severity≥2 或 event_count≥2
- level=2 较低风险: event_count=1 且 max_severity=1
- level=1 低风险: 事件轻微且无伤亡

### 6. summary字段格式
50字以内，包含：主要冲突方 + 冲突类型 + 近期趋势
示例："以哈持续交火，加沙人道危机加剧；黎巴嫩边境零星冲突"

## 输出格式要求
返回纯JSON数组，按level从高到低排序：
[
  {{
    "region": "中东",
    "level": 5,
    "level_desc": "高风险",
    "event_count": 3,
    "max_severity": 4,
    "total_casualties": 120,
    "summary": "以哈持续交火，加沙人道危机加剧；黎巴嫩边境零星冲突",
    "events": [
      {{
        "title": "以色列空袭加沙城造成50余人伤亡",
        "country": "以色列",
        "sub_region": "加沙地带",
        "location_name": "加沙城",
        "event_type": "military_conflict",
        "severity": 4,
        "casualties": 50,
        "description": "以军对加沙城发动大规模空袭",
        "event_date": "2024-01-15",
        "news_index": 0
      }}
    ]
  }},
  {{
    "region": "东欧",
    "level": 4,
    "level_desc": "较高风险",
    "event_count": 2,
    "max_severity": 4,
    "total_casualties": 80,
    "summary": "俄乌顿涅茨克前线激烈交火，双方伤亡惨重",
    "events": [...]
  }}
]

## 注意事项
1. 只输出有冲突事件的地区，无事件地区不输出
2. news_index必须与输入新闻的index完全对应
3. 不要输出markdown标记，只输出纯JSON
4. 按level从高到低排序
"""


# ============ 预处理函数 ============

def filter_by_keywords(news_items: List[Dict]) -> List[Dict]:
    """关键词过滤：标题必须含冲突相关词"""
    filtered = []
    for news in news_items:
        title = news.get("title", "").lower()
        body = news.get("body", "").lower()
        text = title + " " + body

        # 检查是否包含冲突关键词
        has_keyword = any(kw.lower() in text for kw in CONFLICT_KEYWORDS)
        if has_keyword:
            filtered.append(news)

    print(f"关键词过滤: {len(news_items)} → {len(filtered)} 条")
    return filtered


def filter_by_url(news_items: List[Dict]) -> List[Dict]:
    """URL去重：相同链接只保留一条"""
    seen_urls = set()
    filtered = []
    for news in news_items:
        url = news.get("href", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            filtered.append(news)

    print(f"URL去重: {len(news_items)} → {len(filtered)} 条")
    return filtered


def preprocess(news_items: List[Dict]) -> List[Dict]:
    """预处理流程"""
    print("\n" + "=" * 50)
    print("预处理阶段")
    print("=" * 50)

    # 1. URL去重
    filtered = filter_by_url(news_items)

    # 2. 关键词过滤
    filtered = filter_by_keywords(filtered)

    print(f"\n预处理完成: 原始 {len(news_items)} → 过滤后 {len(filtered)} 条")
    return filtered


# ============ Qwen 提取函数 ============

class EventExtractor:
    """事件提取器"""

    def __init__(self, api_key: str = None):
        self.client = OpenAI(
            api_key=api_key or QWEN_API_KEY,
            base_url=QWEN_API_BASE
        )
        self.model = QWEN_MODEL

    def extract_batch(self, news_items: List[Dict], batch_offset: int = 0) -> List[Dict]:
        """批量提取事件（返回地区分组数组）"""
        # 构建结构化JSON格式新闻数据
        news_data = []
        for i, news in enumerate(news_items):
            news_data.append({
                "index": i,  # 批次内索引（从0开始）
                "title": news.get("title", ""),
                "content": news.get("body", "")[:300],
                "source": news.get("href", "").split("/")[-2] if news.get("href") else "未知来源"
            })

        news_json = json.dumps(news_data, ensure_ascii=False)
        prompt = BATCH_EXTRACTION_PROMPT.format(news_json=news_json)

        result_text = ""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=4000
            )

            result_text = response.choices[0].message.content.strip()

            # 清理 markdown 标记
            if result_text.startswith("```"):
                result_text = re.sub(r'^```json?\s*', '', result_text)
                result_text = re.sub(r'\s*```$', '', result_text)

            # 解析地区数组
            regions = json.loads(result_text)

            # 为每个事件添加原始链接，并修正索引偏移
            for region_data in regions:
                for event in region_data.get("events", []):
                    # 批次内索引转全局索引
                    local_idx = event.get("news_index", 0)
                    global_idx = local_idx + batch_offset

                    if local_idx < len(news_items):
                        event["source_url"] = news_items[local_idx].get("href", "")
                        event["source_title"] = news_items[local_idx].get("title", "")
                    # 更新为全局索引（可选，用于后续追溯）
                    event["global_news_index"] = global_idx

            return regions

        except json.JSONDecodeError as e:
            print(f"JSON解析失败: {e}", file=sys.stderr)
            print(f"原始响应: {result_text[:500]}", file=sys.stderr)
            return []
        except Exception as e:
            print(f"批量提取失败: {e}", file=sys.stderr)
            if result_text:
                print(f"原始响应: {result_text[:500]}", file=sys.stderr)
            return []

    def extract_all(self, news_items: List[Dict]) -> List[Dict]:
        """分批提取所有事件（返回地区分组数组）"""
        print("\n" + "=" * 50)
        print("Qwen提取阶段")
        print("=" * 50)

        all_regions = {}  # {region_name: region_data}
        total_batches = (len(news_items) + BATCH_SIZE - 1) // BATCH_SIZE

        for batch_num in range(total_batches):
            start_idx = batch_num * BATCH_SIZE
            end_idx = min(start_idx + BATCH_SIZE, len(news_items))
            batch = news_items[start_idx:end_idx]

            print(f"\n处理批次 {batch_num + 1}/{total_batches} ({len(batch)} 条新闻)")
            print(f"  索引范围: {start_idx}-{end_idx - 1}")
            print(f"  新闻标题: {[n.get('title', '')[:30] + '...' for n in batch[:3]]}")

            regions = self.extract_batch(batch, batch_offset=start_idx)

            if regions:
                print(f"  ✓ 提取到 {len(regions)} 个地区")
                for region_data in regions:
                    region_name = region_data.get("region", "")
                    event_count = len(region_data.get("events", []))
                    level = region_data.get("level", 0)
                    print(f"    - {region_name}(风险{level}): {event_count}个事件")

                    # 合并到总结果
                    if region_name in all_regions:
                        # 合同地区的事件
                        all_regions[region_name]["events"].extend(region_data.get("events", []))
                        # 更新统计数据
                        all_regions[region_name]["event_count"] += event_count
                        all_regions[region_name]["max_severity"] = max(
                            all_regions[region_name].get("max_severity", 0),
                            region_data.get("max_severity", 0)
                        )
                        all_regions[region_name]["total_casualties"] += region_data.get("total_casualties", 0) or 0
                        # 更新summary（合并）
                        old_summary = all_regions[region_name].get("summary", "")
                        new_summary = region_data.get("summary", "")
                        if old_summary and new_summary:
                            all_regions[region_name]["summary"] = old_summary[:25] + "；" + new_summary[:25]
                    else:
                        all_regions[region_name] = region_data

        # 转为数组并重新计算风险等级（基于合并后的数据）
        regions_list = list(all_regions.values())

        # 重新计算每个地区的风险等级
        for region_data in regions_list:
            events = region_data.get("events", [])
            region_data["event_count"] = len(events)
            region_data["max_severity"] = max((e.get("severity", 0) for e in events), default=0)
            region_data["total_casualties"] = sum(e.get("casualties", 0) or 0 for e in events)

            # 按量化规则重新计算level
            max_sev = region_data["max_severity"]
            event_cnt = region_data["event_count"]
            casualties = region_data["total_casualties"]

            if max_sev >= 4 or casualties >= 100:
                level = 5
            elif max_sev >= 3 or event_cnt >= 3 or casualties >= 50:
                level = 4
            elif max_sev >= 2 or event_cnt >= 2:
                level = 3
            elif event_cnt == 1 and max_sev == 1:
                level = 2
            else:
                level = 1

            region_data["level"] = level
            region_data["level_desc"] = {
                5: "高风险",
                4: "较高风险",
                3: "中风险",
                2: "较低风险",
                1: "低风险"
            }.get(level, "低风险")

        # 按level从高到低排序
        regions_list.sort(key=lambda x: x.get("level", 0), reverse=True)

        total_events = sum(len(r.get("events", [])) for r in regions_list)
        print(f"\n提取完成: 共 {len(regions_list)} 个地区，{total_events} 个冲突事件")

        return regions_list


# ============ 去重函数 ============

def deduplicate_in_region(events: List[Dict]) -> List[Dict]:
    """同一地区内的事件去重"""
    unique_events = []
    seen_keys = set()

    for event in events:
        country = event.get("country", "")
        location = event.get("location_name", "")
        date_str = event.get("event_date", "")

        try:
            event_date = datetime.strptime(date_str, "%Y-%m-%d") if date_str else datetime.now()
        except:
            event_date = datetime.now()

        # 去重键：country + location + date
        key = (country, location, event_date.strftime("%Y-%m-%d"))

        if key not in seen_keys:
            seen_keys.add(key)
            unique_events.append(event)

    return unique_events


def deduplicate_regions(regions: List[Dict]) -> List[Dict]:
    """各地区内部去重，并更新统计"""
    print("\n" + "=" * 50)
    print("去重阶段")
    print("=" * 50)

    for region_data in regions:
        events = region_data.get("events", [])
        if events:
            unique_events = deduplicate_in_region(events)
            dup_count = len(events) - len(unique_events)

            if dup_count > 0:
                print(f"  {region_data.get('region', '')}: 去重 {dup_count} 条")

            region_data["events"] = unique_events
            region_data["event_count"] = len(unique_events)

            # 更新统计
            if unique_events:
                region_data["max_severity"] = max(e.get("severity", 0) for e in unique_events)
                casualties = sum(e.get("casualties", 0) or 0 for e in unique_events)
                region_data["total_casualties"] = casualties

    total_events = sum(len(r.get("events", [])) for r in regions)
    print(f"\n去重完成: 共 {total_events} 个唯一事件")

    return regions


# ============ 输出函数 ============

def print_result(regions: List[Dict]) -> None:
    """打印结果"""
    print("\n" + "=" * 50)
    print("地区风险分析结果")
    print("=" * 50)

    for region_data in regions:
        region = region_data.get("region", "")
        level = region_data.get("level", 1)
        level_desc = region_data.get("level_desc", "低风险")
        event_count = region_data.get("event_count", 0)
        max_severity = region_data.get("max_severity", 0)
        casualties = region_data.get("total_casualties", 0)
        summary = region_data.get("summary", "")

        print(f"\n【{region}】风险等级: {level} ({level_desc})")
        print(f"  事件数: {event_count} | 最高严重度: {max_severity} | 总伤亡: {casualties}")
        if summary:
            print(f"  概要: {summary}")

        events = region_data.get("events", [])
        for evt in events:
            print(f"  • {evt.get('country', '')} - {evt.get('location_name', '')}")
            print(f"    {evt.get('title', '')}")
            print(f"    类型: {evt.get('event_type', '')} | 严重度: {evt.get('severity', '')} | 日期: {evt.get('event_date', '')}")

    print("\n" + "=" * 50)
    print("JSON 输出:")
    print(json.dumps(regions, ensure_ascii=False, indent=2))


# ============ 主流程 ============

def process(news_items: List[Dict], api_key: str = None) -> List[Dict]:
    """完整处理流程"""
    # 1. 预处理
    filtered_news = preprocess(news_items)

    if not filtered_news:
        print("预处理后无有效新闻，退出")
        return []

    # 2. Qwen批量提取（返回地区分组数组）
    extractor = EventExtractor(api_key)
    regions = extractor.extract_all(filtered_news)

    if not regions:
        print("未提取到冲突事件")
        return []

    # 3. 去重
    regions = deduplicate_regions(regions)

    return regions


def main():
    """主函数"""
    # 读取输入
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            news_items = json.load(f)
    else:
        print("请输入爬虫输出的 JSON 数据（Ctrl+D 结束）:")
        try:
            news_items = json.load(sys.stdin)
        except:
            print("错误：无法解析输入数据", file=sys.stderr)
            sys.exit(1)

    print(f"输入: {len(news_items)} 条新闻")

    # 处理
    regions = process(news_items)

    # 输出
    if regions:
        print_result(regions)


if __name__ == "__main__":
    main()