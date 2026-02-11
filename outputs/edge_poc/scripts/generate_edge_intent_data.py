#!/usr/bin/env python3
"""
生成端侧意图分类训练数据

用途: 为端侧 qwen3-0.6B 模型生成意图分类训练数据
输出: edge_intent_train.jsonl, edge_intent_eval.jsonl, edge_intent_test.jsonl
"""

import json
import random
from pathlib import Path
from typing import List, Dict

# 设置随机种子
random.seed(42)

# 本地意图模板（端侧可处理）
LOCAL_TEMPLATES = {
    "weather_query": [
        "今天天气怎么样？",
        "明天会下雨吗？",
        "现在温度多少？",
        "这周末天气如何？",
        "需要带伞吗？",
        "今天冷不冷？",
        "明天气温多少度？",
        "今天有雾霾吗？",
        "今天适合出门吗？",
        "今天会下雪吗？",
    ],
    "time_query": [
        "现在几点了？",
        "今天星期几？",
        "现在是什么时间？",
        "今天几号？",
        "现在是上午还是下午？",
        "今天是周末吗？",
        "现在是几月份？",
        "今年是哪一年？",
        "今天是什么日子？",
        "现在是什么季节？",
    ],
    "simple_qa": [
        "你好",
        "谢谢",
        "再见",
        "早上好",
        "晚安",
        "你是谁？",
        "你叫什么名字？",
        "你能做什么？",
        "帮我",
        "好的",
    ],
    "tool_select": [
        "打开计算器",
        "设置闹钟",
        "查看日历",
        "打开相机",
        "播放音乐",
        "发送消息",
        "拨打电话",
        "查看通知",
        "打开设置",
        "查看地图",
    ],
    "safety_check": [
        "这个网站安全吗？",
        "这条信息是真的吗？",
        "这个链接可以点击吗？",
        "这个文件有病毒吗？",
        "这个应用安全吗？",
        "这个号码是诈骗吗？",
        "这个邮件是钓鱼邮件吗？",
        "这个二维码安全吗？",
        "这个下载链接可靠吗？",
        "这个广告是真的吗？",
    ],
}

# 云端意图模板（需要云端处理）
CLOUD_TEMPLATES = {
    "complex_reasoning": [
        "如果明天下雨，我应该带伞还是穿雨衣？",
        "请帮我分析一下这个问题的利弊",
        "为什么会出现这种情况？",
        "这两个方案哪个更好？",
        "如何解决这个复杂的问题？",
        "请给我一些建议",
        "这个决策应该怎么做？",
        "如何平衡工作和生活？",
        "这个现象背后的原因是什么？",
        "如何提高工作效率？",
    ],
    "knowledge_qa": [
        "量子计算的原理是什么？",
        "中国的首都是哪里？",
        "人工智能的发展历史",
        "什么是区块链技术？",
        "相对论的基本概念",
        "如何学习编程？",
        "什么是机器学习？",
        "太阳系有几颗行星？",
        "DNA 的结构是什么？",
        "什么是深度学习？",
    ],
    "open_chat": [
        "我今天心情不好，聊聊天吧",
        "你觉得人生的意义是什么？",
        "讲个笑话给我听",
        "我们聊聊天吧",
        "你有什么兴趣爱好？",
        "你喜欢什么电影？",
        "你觉得什么是幸福？",
        "我们谈谈理想吧",
        "你对未来有什么看法？",
        "你觉得爱情是什么？",
    ],
    "long_generation": [
        "请写一篇关于人工智能的文章",
        "帮我写一封求职信",
        "请总结一下这篇长文档",
        "帮我写一个产品介绍",
        "请写一个故事",
        "帮我写一份报告",
        "请写一段代码",
        "帮我写一首诗",
        "请写一个演讲稿",
        "帮我写一个方案",
    ],
}


def generate_sample(query: str, intent: str, is_local: bool) -> Dict:
    """生成单个训练样本"""
    return {
        "query": query,
        "response": json.dumps({
            "intent": intent,
            "route": "local" if is_local else "cloud",
            "confidence": random.uniform(0.85, 0.99) if is_local else random.uniform(0.60, 0.80)
        }, ensure_ascii=False),
        "system": "你是一个意图分类助手，负责判断用户查询应该在本地处理还是发送到云端。",
        "history": []
    }


def generate_dataset():
    """生成完整数据集"""
    samples = []

    # 生成本地意图样本
    for intent, templates in LOCAL_TEMPLATES.items():
        for template in templates:
            samples.append(generate_sample(template, intent, is_local=True))

    # 生成云端意图样本
    for intent, templates in CLOUD_TEMPLATES.items():
        for template in templates:
            samples.append(generate_sample(template, intent, is_local=False))

    # 打乱数据
    random.shuffle(samples)

    # 划分数据集 (80% train, 10% eval, 10% test)
    total = len(samples)
    train_size = int(total * 0.8)
    eval_size = int(total * 0.1)

    train_data = samples[:train_size]
    eval_data = samples[train_size:train_size + eval_size]
    test_data = samples[train_size + eval_size:]

    return train_data, eval_data, test_data


def save_jsonl(data: List[Dict], filepath: Path):
    """保存为 JSONL 格式"""
    with open(filepath, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')
    print(f"Saved {len(data)} samples to {filepath}")


def main():
    """主函数"""
    output_dir = Path("/Users/huaodong/graduationDesign/outputs/edge_poc/data")
    output_dir.mkdir(parents=True, exist_ok=True)

    # 生成数据集
    train_data, eval_data, test_data = generate_dataset()

    # 保存数据
    save_jsonl(train_data, output_dir / "edge_intent_train.jsonl")
    save_jsonl(eval_data, output_dir / "edge_intent_eval.jsonl")
    save_jsonl(test_data, output_dir / "edge_intent_test.jsonl")

    # 打印统计信息
    print(f"\nDataset Statistics:")
    print(f"  Train: {len(train_data)} samples")
    print(f"  Eval:  {len(eval_data)} samples")
    print(f"  Test:  {len(test_data)} samples")
    print(f"  Total: {len(train_data) + len(eval_data) + len(test_data)} samples")

    # 统计意图分布
    print(f"\nIntent Distribution (Train):")
    intent_counts = {}
    for sample in train_data:
        response = json.loads(sample["response"])
        intent = response["intent"]
        intent_counts[intent] = intent_counts.get(intent, 0) + 1

    for intent, count in sorted(intent_counts.items()):
        print(f"  {intent}: {count}")


if __name__ == "__main__":
    main()
