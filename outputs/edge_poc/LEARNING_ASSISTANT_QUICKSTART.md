# 学习助手训练方案 - 快速参考

## 🎯 方案概述

**目标**: 在 Apple M4 上训练端侧学习助手，专注于课程资源管理和学习状况追踪

**模型**: Qwen3-0.6B-MLX-4bit（Apple Silicon 优化，4-bit 量化）

**训练位置**: `/Volumes/Data/models/`

**预计时间**: 3.5 天

## 📊 核心数据

### 训练数据分布

| 类别 | 样本数 | 占比 | 路由 |
|-----|--------|------|------|
| 课程资源管理 | 200 | 40% | 本地 |
| 学习状况追踪 | 150 | 30% | 本地 |
| 简单问答 | 100 | 20% | 本地 |
| 路由判断 | 50 | 10% | 云端 |
| **总计** | **500** | **100%** | - |

### 性能目标

| 指标 | 目标值 | 说明 |
|-----|--------|------|
| 推理延迟（P95） | <100ms | 端侧 MLX |
| 内存占用 | <150MB | 4-bit 量化 |
| 模型大小 | <200MB | MLX 优化 |
| 任务准确率 | >90% | 4 类任务 |
| 路由准确率 | >85% | local/cloud |

## 🚀 快速开始

### 1. 运行快速启动脚本

```bash
cd /Users/huaodong/graduationDesign
bash outputs/edge_poc/scripts/quickstart.sh
```

**脚本功能**:
- ✅ 检查环境（Python, MLX）
- ✅ 创建目录结构
- ✅ 生成训练数据（500 样本）
- ⚠️ 提示下载模型

### 2. 下载基座模型

```bash
# 方法 1: 使用 modelscope CLI
modelscope download \
  --model Qwen/Qwen3-0.6B-MLX-4bit \
  --local_dir /Volumes/Data/models/qwen3-0.6b-mlx-4bit

# 方法 2: 手动下载
# 访问: https://modelscope.cn/models/Qwen/Qwen3-0.6B-MLX-4bit
```

### 3. 查看生成的数据

```bash
# 查看训练数据
head -n 3 /Volumes/Data/models/learning-assistant-training/data/train.jsonl

# 查看数据统计
wc -l /Volumes/Data/models/learning-assistant-training/data/*.jsonl
```

### 4. 开始训练（待实现）

```bash
# MLX LoRA 训练（脚本待实现）
python3 scripts/train_mlx_lora.py \
  --model /Volumes/Data/models/qwen3-0.6b-mlx-4bit \
  --data /Volumes/Data/models/learning-assistant-training/data \
  --output /Volumes/Data/models/learning-assistant-training/adapters \
  --lora_rank 8 \
  --learning_rate 2e-4 \
  --num_epochs 3
```

## 📁 目录结构

```
/Volumes/Data/models/
├── qwen3-0.6b-mlx-4bit/              # 基座模型
│   ├── config.json
│   ├── tokenizer.json
│   └── weights.npz
├── learning-assistant-training/       # 训练工作区
│   ├── data/                          # ✅ 已生成
│   │   ├── train.jsonl               # 400 样本
│   │   ├── eval.jsonl                # 50 样本
│   │   ├── test.jsonl                # 50 样本
│   │   ├── course_resources.jsonl    # 200 样本
│   │   ├── learning_tracking.jsonl   # 150 样本
│   │   ├── simple_qa.jsonl           # 100 样本
│   │   └── routing.jsonl             # 50 样本
│   ├── checkpoints/                   # 训练检查点
│   ├── adapters/                      # LoRA 适配器
│   └── logs/                          # 训练日志
└── learning-assistant-deployed/       # 部署模型
    ├── merged_model/
    └── mlx_optimized/
```

## 🎓 训练数据示例

### 课程资源管理

```json
{
  "instruction": "帮我找一下电磁场理论第三章的课件",
  "input": "用户课程: 电磁场理论\n当前章节: 第三章 静电场",
  "output": "我找到了第三章的相关资料：\n1. 静电场基本概念.pdf\n2. 静电场例题讲解.pptx\n3. 静电场习题集.pdf\n\n建议先看基本概念，再做例题练习。",
  "task_type": "course_resource",
  "route": "local"
}
```

### 学习状况追踪

```json
{
  "instruction": "我今天学习了什么内容？",
  "input": "学习记录: \n- 2026-02-10 09:00-10:30: 电磁场理论第三章\n- 完成习题: 3/10\n- 薄弱点: 高斯定理应用",
  "output": "今天你学习了电磁场理论第三章（1.5小时），完成了3道习题。\n\n发现薄弱点：高斯定理应用\n建议：多做几道高斯定理的例题，重点理解核心概念。",
  "task_type": "learning_tracking",
  "route": "local"
}
```

### 简单问答

```json
{
  "instruction": "什么是电场强度？",
  "input": "",
  "output": "电场强度是描述电场性质的物理量，定义为单位正电荷在电场中受到的力。\n\n公式：E = F/q\n单位：N/C 或 V/m\n\n这是电磁场理论的基本概念，建议结合课件复习。",
  "task_type": "simple_qa",
  "route": "local"
}
```

### 路由判断（云端）

```json
{
  "instruction": "请详细推导麦克斯韦方程组的数学原理",
  "input": "",
  "output": "这是一个复杂的理论推导问题，需要深入分析。我已将您的问题转发给云端 AI，它会提供详细的推导过程和物理解释。",
  "task_type": "complex_reasoning",
  "route": "cloud"
}
```

## 🔧 端云协同机制

### 路由决策逻辑

```python
def should_route_to_cloud(query: str) -> bool:
    """判断是否需要云端处理"""

    # 规则 1: 关键词匹配
    cloud_keywords = ["详细推导", "深入分析", "为什么", "原理", "证明"]
    if any(kw in query for kw in cloud_keywords):
        return True

    # 规则 2: 查询长度
    if len(query) > 100:
        return True

    # 规则 3: 默认本地处理
    return False
```

### 任务分类

| 任务类型 | 处理位置 | 延迟目标 | 示例 |
|---------|---------|---------|------|
| course_resource | 本地 | <50ms | "找第三章课件" |
| learning_tracking | 本地 | <30ms | "我的学习进度" |
| simple_qa | 本地 | <80ms | "什么是电场强度" |
| complex_reasoning | 云端 | 1-3s | "推导麦克斯韦方程" |

## 📈 优势分析

### 为什么选择 MLX-4bit？

| 维度 | MLX-4bit | 标准 INT8 | 优势 |
|-----|----------|-----------|------|
| 内存占用 | ~150MB | ~200MB | ✅ 25% 更小 |
| 推理速度 | 原生优化 | 通用优化 | ✅ 更快 |
| Apple 集成 | 完美 | 一般 | ✅ 原生支持 |
| 精度损失 | <1% | <2% | ✅ 更高精度 |

### 为什么专注学习助手？

1. **场景明确**: 课程资源 + 学习追踪，边界清晰
2. **数据可控**: 可以生成高质量训练数据
3. **用户价值**: 直接解决学生痛点
4. **技术可行**: 0.6B 模型足够处理这些任务

## ⏱️ 实施时间表

| 阶段 | 任务 | 预计时间 | 状态 |
|-----|------|---------|------|
| Phase 1 | 数据准备 | 1 天 | ✅ 完成 |
| Phase 2 | 模型下载 | 0.5 天 | ⏳ 待执行 |
| Phase 3 | LoRA 微调 | 1 天 | ⏳ 待执行 |
| Phase 4 | 模型合并与优化 | 0.5 天 | ⏳ 待执行 |
| Phase 5 | 性能测试 | 0.5 天 | ⏳ 待执行 |
| **总计** | | **3.5 天** | |

## ✅ 当前进度

- [x] 创建实施计划文档
- [x] 创建数据生成脚本
- [x] 创建快速启动脚本
- [x] 生成训练数据（500 样本）
- [ ] 下载基座模型
- [ ] 实现 MLX 训练脚本
- [ ] 执行 LoRA 微调
- [ ] 性能测试
- [ ] 论文撰写

## 📚 相关文档

- [详细实施计划](LEARNING_ASSISTANT_PLAN.md)
- [Edge-Cloud 架构](../academic/thesis/src/chapter_5_edge_cloud_architecture.md)
- [原始 PoC 计划](edge_poc_implementation_plan.md)

## 🆘 常见问题

### Q1: /Volumes/Data 目录不存在怎么办？

**A**: 修改脚本中的 `BASE_DIR` 变量，改为本地目录：
```bash
BASE_DIR="/Users/huaodong/models"
```

### Q2: MLX 安装失败怎么办？

**A**: 确保使用 Apple Silicon Mac，然后：
```bash
pip3 install --upgrade pip
pip3 install mlx mlx-lm
```

### Q3: 模型下载太慢怎么办？

**A**: 使用镜像源或手动下载后放到指定目录

### Q4: 如何验证数据生成成功？

**A**: 检查文件和样本数：
```bash
ls -lh /Volumes/Data/models/learning-assistant-training/data/
wc -l /Volumes/Data/models/learning-assistant-training/data/*.jsonl
```

## 🎯 成功标准

- [ ] 训练完成，损失收敛
- [ ] 课程资源检索准确率 > 85%
- [ ] 学习追踪任务准确率 > 90%
- [ ] 路由决策准确率 > 85%
- [ ] 推理延迟 P95 < 100ms
- [ ] 内存占用 < 150MB
- [ ] 用户体验测试通过

---

**文档版本**: v1.0
**创建时间**: 2026-02-10
**目标平台**: Apple M4 (MLX)
**状态**: 数据准备完成，待下载模型
