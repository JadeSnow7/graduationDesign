#!/usr/bin/env python3
"""
生成学习助手训练数据

用途: 为端侧学习助手生成训练数据
输出: course_resources.jsonl, learning_tracking.jsonl, simple_qa.jsonl, routing.jsonl
"""

import json
import random
from pathlib import Path
from typing import List, Dict

# 设置随机种子
random.seed(42)

# ========== 类别 1: 课程资源管理 ==========
COURSE_RESOURCE_TEMPLATES = [
    {
        "instruction": "帮我找一下{course}第{chapter}章的{resource_type}",
        "input": "用户课程: {course}\n当前章节: 第{chapter}章 {chapter_name}",
        "output": "我找到了第{chapter}章的相关资料：\n1. {chapter_name}基本概念.pdf\n2. {chapter_name}例题讲解.pptx\n3. {chapter_name}习题集.pdf\n\n建议先看基本概念，再做例题练习。",
        "task_type": "course_resource",
        "route": "local"
    },
    {
        "instruction": "我需要{course}的{resource_type}",
        "input": "用户课程: {course}",
        "output": "为您找到{course}的{resource_type}：\n- 课程大纲.pdf\n- 教学视频合集\n- 历年试题.pdf\n\n建议按照大纲顺序学习。",
        "task_type": "course_resource",
        "route": "local"
    },
    {
        "instruction": "有没有关于{topic}的学习资料？",
        "input": "用户课程: {course}",
        "output": "找到{topic}相关资料：\n1. {topic}理论讲解.pdf\n2. {topic}应用实例.pptx\n3. {topic}练习题.pdf\n\n这些资料涵盖了{topic}的核心内容。",
        "task_type": "course_resource",
        "route": "local"
    },
]

# ========== 类别 2: 学习状况追踪 ==========
LEARNING_TRACKING_TEMPLATES = [
    {
        "instruction": "我今天学习了什么内容？",
        "input": "学习记录: \n- {date} {time_start}-{time_end}: {course}第{chapter}章\n- 完成习题: {completed}/{total}\n- 薄弱点: {weak_point}",
        "output": "今天你学习了{course}第{chapter}章（{duration}小时），完成了{completed}道习题。\n\n发现薄弱点：{weak_point}\n建议：多做几道{weak_point}的例题，重点理解核心概念。",
        "task_type": "learning_tracking",
        "route": "local"
    },
    {
        "instruction": "我的学习进度怎么样？",
        "input": "课程进度: {course}\n已完成: {completed_chapters}/{total_chapters}章\n平均分数: {avg_score}分",
        "output": "您的{course}学习进度：\n- 已完成 {completed_chapters}/{total_chapters} 章（{progress}%）\n- 平均分数：{avg_score}分\n\n{feedback}",
        "task_type": "learning_tracking",
        "route": "local"
    },
    {
        "instruction": "我在{topic}方面有什么问题吗？",
        "input": "薄弱点分析: {topic}\n错题数: {error_count}\n正确率: {accuracy}%",
        "output": "您在{topic}方面的表现：\n- 正确率：{accuracy}%\n- 错题数：{error_count}道\n\n{suggestion}",
        "task_type": "learning_tracking",
        "route": "local"
    },
]

# ========== 类别 3: 简单问答 ==========
SIMPLE_QA_TEMPLATES = [
    {
        "instruction": "什么是{concept}？",
        "input": "",
        "output": "{concept}是{definition}\n\n公式：{formula}\n单位：{unit}\n\n这是{course}的基本概念，建议结合课件复习。",
        "task_type": "simple_qa",
        "route": "local"
    },
    {
        "instruction": "{concept}的定义是什么？",
        "input": "",
        "output": "{concept}定义：{definition}\n\n关键点：\n1. {point1}\n2. {point2}\n\n建议查看课件第{chapter}章了解更多。",
        "task_type": "simple_qa",
        "route": "local"
    },
    {
        "instruction": "如何理解{concept}？",
        "input": "",
        "output": "理解{concept}的要点：\n1. {point1}\n2. {point2}\n3. {point3}\n\n建议通过例题加深理解。",
        "task_type": "simple_qa",
        "route": "local"
    },
]

# ========== 类别 4: 路由判断（需要云端） ==========
ROUTING_TEMPLATES = [
    {
        "instruction": "请详细推导{topic}的数学原理",
        "input": "",
        "output": "这是一个复杂的理论推导问题，需要深入分析。我已将您的问题转发给云端 AI，它会提供详细的推导过程和物理解释。",
        "task_type": "complex_reasoning",
        "route": "cloud"
    },
    {
        "instruction": "为什么{phenomenon}会发生？请深入分析",
        "input": "",
        "output": "这个问题涉及深层次的物理机制，需要云端 AI 进行详细分析。正在为您连接...",
        "task_type": "complex_reasoning",
        "route": "cloud"
    },
    {
        "instruction": "请证明{theorem}",
        "input": "",
        "output": "这是一个数学证明问题，需要严密的逻辑推理。我已将问题转发给云端 AI，它会提供完整的证明过程。",
        "task_type": "complex_reasoning",
        "route": "cloud"
    },
]

# 数据填充值
COURSES = ["电磁场理论", "量子力学", "固体物理", "电路分析", "信号与系统"]
CHAPTERS = ["一", "二", "三", "四", "五", "六", "七", "八"]
CHAPTER_NAMES = {
    "电磁场理论": ["静电场", "恒定电场", "恒定磁场", "电磁感应", "麦克斯韦方程组"],
    "量子力学": ["波函数", "薛定谔方程", "算符理论", "角动量", "微扰理论"],
}
RESOURCE_TYPES = ["课件", "习题", "视频", "讲义", "试卷"]
TOPICS = ["高斯定理", "安培定律", "法拉第定律", "麦克斯韦方程", "波动方程"]
CONCEPTS = {
    "电场强度": {
        "definition": "描述电场性质的物理量，定义为单位正电荷在电场中受到的力",
        "formula": "E = F/q",
        "unit": "N/C 或 V/m",
        "course": "电磁场理论"
    },
    "磁感应强度": {
        "definition": "描述磁场性质的物理量，定义为运动电荷在磁场中受到的洛伦兹力",
        "formula": "B = F/(qv)",
        "unit": "T (特斯拉)",
        "course": "电磁场理论"
    },
}


def fill_template(template: Dict, **kwargs) -> Dict:
    """填充模板"""
    result = {}
    for key, value in template.items():
        if isinstance(value, str):
            result[key] = value.format(**kwargs)
        else:
            result[key] = value
    return result


def generate_course_resource_samples(num_samples: int = 200) -> List[Dict]:
    """生成课程资源管理样本"""
    samples = []

    for i in range(num_samples):
        template = random.choice(COURSE_RESOURCE_TEMPLATES)
        course = random.choice(COURSES)
        chapter = random.choice(CHAPTERS)
        chapter_name = random.choice(CHAPTER_NAMES.get(course, ["基础知识"]))
        resource_type = random.choice(RESOURCE_TYPES)
        topic = random.choice(TOPICS)

        sample = fill_template(
            template,
            course=course,
            chapter=chapter,
            chapter_name=chapter_name,
            resource_type=resource_type,
            topic=topic
        )
        samples.append(sample)

    return samples


def generate_learning_tracking_samples(num_samples: int = 150) -> List[Dict]:
    """生成学习状况追踪样本"""
    samples = []

    for i in range(num_samples):
        template = random.choice(LEARNING_TRACKING_TEMPLATES)
        course = random.choice(COURSES)
        chapter = random.choice(CHAPTERS)
        completed = random.randint(3, 8)
        total = 10
        weak_point = random.choice(TOPICS)
        completed_chapters = random.randint(1, 5)
        total_chapters = 8
        avg_score = random.randint(70, 95)
        progress = int(completed_chapters / total_chapters * 100)
        error_count = random.randint(2, 8)
        accuracy = random.randint(70, 95)
        duration = round(random.uniform(1.0, 2.5), 1)

        feedback = "进度良好，继续保持！" if progress > 50 else "建议加快学习进度"
        suggestion = "建议重点复习错题" if accuracy < 80 else "掌握较好，可以进入下一阶段"

        sample = fill_template(
            template,
            course=course,
            chapter=chapter,
            completed=completed,
            total=total,
            weak_point=weak_point,
            completed_chapters=completed_chapters,
            total_chapters=total_chapters,
            avg_score=avg_score,
            progress=progress,
            error_count=error_count,
            accuracy=accuracy,
            duration=duration,
            feedback=feedback,
            suggestion=suggestion,
            date="2026-02-10",
            time_start="09:00",
            time_end="10:30",
            topic=weak_point
        )
        samples.append(sample)

    return samples


def generate_simple_qa_samples(num_samples: int = 100) -> List[Dict]:
    """生成简单问答样本"""
    samples = []

    for i in range(num_samples):
        template = random.choice(SIMPLE_QA_TEMPLATES)
        concept_name = random.choice(list(CONCEPTS.keys()))
        concept_data = CONCEPTS[concept_name]

        sample = fill_template(
            template,
            concept=concept_name,
            definition=concept_data["definition"],
            formula=concept_data.get("formula", ""),
            unit=concept_data.get("unit", ""),
            course=concept_data["course"],
            chapter="一",
            point1="核心概念清晰",
            point2="公式推导严密",
            point3="应用场景广泛"
        )
        samples.append(sample)

    return samples


def generate_routing_samples(num_samples: int = 50) -> List[Dict]:
    """生成路由判断样本"""
    samples = []

    for i in range(num_samples):
        template = random.choice(ROUTING_TEMPLATES)
        topic = random.choice(TOPICS)
        phenomenon = random.choice(["电磁感应", "波的干涉", "量子纠缠"])
        theorem = random.choice(["高斯定理", "斯托克斯定理", "格林定理"])

        sample = fill_template(
            template,
            topic=topic,
            phenomenon=phenomenon,
            theorem=theorem
        )
        samples.append(sample)

    return samples


def save_jsonl(data: List[Dict], filepath: Path):
    """保存为 JSONL 格式"""
    with open(filepath, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')
    print(f"Saved {len(data)} samples to {filepath}")


def main():
    """主函数"""
    output_dir = Path("/Volumes/Data/models/learning-assistant-training/data")
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Generating learning assistant training data...")

    # 生成各类数据
    course_resource_data = generate_course_resource_samples(200)
    learning_tracking_data = generate_learning_tracking_samples(150)
    simple_qa_data = generate_simple_qa_samples(100)
    routing_data = generate_routing_samples(50)

    # 合并所有数据
    all_data = (
        course_resource_data +
        learning_tracking_data +
        simple_qa_data +
        routing_data
    )

    # 打乱数据
    random.shuffle(all_data)

    # 划分数据集 (80% train, 10% eval, 10% test)
    total = len(all_data)
    train_size = int(total * 0.8)
    eval_size = int(total * 0.1)

    train_data = all_data[:train_size]
    eval_data = all_data[train_size:train_size + eval_size]
    test_data = all_data[train_size + eval_size:]

    # 保存数据
    save_jsonl(train_data, output_dir / "train.jsonl")
    save_jsonl(eval_data, output_dir / "eval.jsonl")
    save_jsonl(test_data, output_dir / "test.jsonl")

    # 分类保存（用于分析）
    save_jsonl(course_resource_data, output_dir / "course_resources.jsonl")
    save_jsonl(learning_tracking_data, output_dir / "learning_tracking.jsonl")
    save_jsonl(simple_qa_data, output_dir / "simple_qa.jsonl")
    save_jsonl(routing_data, output_dir / "routing.jsonl")

    # 打印统计信息
    print(f"\nDataset Statistics:")
    print(f"  Train: {len(train_data)} samples")
    print(f"  Eval:  {len(eval_data)} samples")
    print(f"  Test:  {len(test_data)} samples")
    print(f"  Total: {total} samples")

    print(f"\nTask Distribution:")
    print(f"  Course Resources: {len(course_resource_data)} (40%)")
    print(f"  Learning Tracking: {len(learning_tracking_data)} (30%)")
    print(f"  Simple QA: {len(simple_qa_data)} (20%)")
    print(f"  Routing: {len(routing_data)} (10%)")

    print(f"\nData saved to: {output_dir}")


if __name__ == "__main__":
    main()
