# 端侧学习助手训练方案（Apple M4 + MLX）

## 一、方案概述

### 1.1 核心定位

**端侧学习助手**：专注于课程资源管理和学习状况追踪的轻量级 AI 助手

- **端侧职责**：课程资源检索、学习进度追踪、简单问答、学习建议
- **云端职责**：复杂推理、深度分析、知识密集型任务
- **模型选择**：Qwen3-0.6B-MLX-4bit（Apple Silicon 优化）

### 1.2 设计原则

1. **专注核心场景**：不追求通用能力，只做学习助手
2. **快速响应**：本地处理常见学习任务（<100ms）
3. **智能路由**：复杂任务自动转发云端
4. **资源高效**：4-bit 量化，内存占用 <150MB

## 二、模型与环境配置

### 2.1 模型信息

```yaml
模型名称: Qwen3-0.6B-MLX-4bit
来源: ModelScope (https://modelscope.cn/models/Qwen/Qwen3-0.6B-MLX-4bit)
优化: Apple MLX 框架，4-bit 量化
参数量: 0.6B
内存占用: ~150MB
推理框架: MLX (Apple Silicon 原生)
```

### 2.2 目录结构

```
/Volumes/Data/models/
├── qwen3-0.6b-mlx-4bit/          # 基座模型
│   ├── config.json
│   ├── tokenizer.json
│   └── weights.npz
├── learning-assistant-training/   # 训练工作区
│   ├── data/                      # 训练数据
│   │   ├── course_resources.jsonl
│   │   ├── learning_tracking.jsonl
│   │   └── simple_qa.jsonl
│   ├── checkpoints/               # 训练检查点
│   ├── adapters/                  # LoRA 适配器
│   └── logs/                      # 训练日志
└── learning-assistant-deployed/   # 部署模型
    ├── merged_model/
    └── mlx_optimized/
```

### 2.3 环境准备

```bash
# 安装 MLX 框架
pip install mlx mlx-lm

# 安装训练依赖
pip install transformers datasets peft

# 验证 MLX 可用性
python3 -c "import mlx.core as mx; print(mx.metal.is_available())"
```

## 三、训练数据设计

### 3.1 数据类别

#### 类别 1: 课程资源管理（40%）

**场景**：帮助学生查找、组织课程资料

```json
{
  "instruction": "帮我找一下电磁场第三章的课件",
  "input": "用户课程: 电磁场理论\n当前章节: 第三章 静电场",
  "output": "我找到了第三章的相关资料：\n1. 静电场基本概念.pdf\n2. 静电场例题讲解.pptx\n3. 静电场习题集.pdf\n\n建议先看基本概念，再做例题练习。",
  "task_type": "course_resource",
  "route": "local"
}
```

**数据量**：200 样本

#### 类别 2: 学习状况追踪（30%）

**场景**：记录学习进度，识别薄弱点

```json
{
  "instruction": "我今天学习了什么内容？",
  "input": "学习记录: \n- 2026-02-10 09:00-10:30: 电磁场第三章\n- 完成习题: 3/10\n- 薄弱点: 高斯定理应用",
  "output": "今天你学习了电磁场第三章（1.5小时），完成了3道习题。\n\n发现薄弱点：高斯定理应用\n建议：多做几道高斯定理的例题，重点理解对称性分析。",
  "task_type": "learning_tracking",
  "route": "local"
}
```

**数据量**：150 样本

#### 类别 3: 简单问答（20%）

**场景**：快速回答常见学习问题

```json
{
  "instruction": "什么是电场强度？",
  "input": "",
  "output": "电场强度是描述电场性质的物理量，定义为单位正电荷在电场中受到的力。\n\n公式：E = F/q\n单位：N/C 或 V/m\n\n这是电磁场的基本概念，建议结合课件第一章复习。",
  "task_type": "simple_qa",
  "route": "local"
}
```

**数据量**：100 样本

#### 类别 4: 路由判断（10%）

**场景**：识别需要云端处理的复杂任务

```json
{
  "instruction": "请详细推导麦克斯韦方程组的物理意义",
  "input": "",
  "output": "这是一个复杂的理论推导问题，需要深入分析。我已将您的问题转发给云端 AI，它会提供详细的推导过程和物理解释。",
  "task_type": "complex_reasoning",
  "route": "cloud"
}
```

**数据量**：50 样本

### 3.2 数据格式

**统一格式**（Alpaca 风格）：

```json
{
  "instruction": "用户指令",
  "input": "上下文信息（可选）",
  "output": "助手回复",
  "task_type": "任务类型",
  "route": "local/cloud"
}
```

## 四、训练方案

### 4.1 训练配置

```yaml
# LoRA 配置
lora_rank: 8
lora_alpha: 16
lora_dropout: 0.05
target_modules: [q_proj, v_proj, k_proj, o_proj]

# 训练超参数
learning_rate: 2e-4
num_epochs: 3
batch_size: 4
gradient_accumulation_steps: 8
max_length: 512
warmup_ratio: 0.1

# 优化器
optimizer: adamw
weight_decay: 0.01
lr_scheduler: cosine
```

### 4.2 训练流程

#### Phase 1: 数据准备（1 天）

```bash
# 生成训练数据
python3 scripts/generate_learning_assistant_data.py \
  --output_dir /Volumes/Data/models/learning-assistant-training/data \
  --num_samples 500

# 数据验证
python3 scripts/validate_training_data.py \
  --data_dir /Volumes/Data/models/learning-assistant-training/data
```

#### Phase 2: 模型下载（0.5 天）

```bash
# 从 ModelScope 下载模型
modelscope download \
  --model Qwen/Qwen3-0.6B-MLX-4bit \
  --local_dir /Volumes/Data/models/qwen3-0.6b-mlx-4bit
```

#### Phase 3: LoRA 微调（1 天）

```bash
# 使用 MLX 训练
python3 scripts/train_mlx_lora.py \
  --model /Volumes/Data/models/qwen3-0.6b-mlx-4bit \
  --data /Volumes/Data/models/learning-assistant-training/data \
  --output /Volumes/Data/models/learning-assistant-training/adapters \
  --lora_rank 8 \
  --learning_rate 2e-4 \
  --num_epochs 3 \
  --batch_size 4
```

#### Phase 4: 模型合并与优化（0.5 天）

```bash
# 合并 LoRA 适配器
python3 scripts/merge_lora_adapters.py \
  --base_model /Volumes/Data/models/qwen3-0.6b-mlx-4bit \
  --adapter /Volumes/Data/models/learning-assistant-training/adapters \
  --output /Volumes/Data/models/learning-assistant-deployed/merged_model

# MLX 优化
python3 scripts/optimize_for_mlx.py \
  --model /Volumes/Data/models/learning-assistant-deployed/merged_model \
  --output /Volumes/Data/models/learning-assistant-deployed/mlx_optimized
```

#### Phase 5: 性能测试（0.5 天）

```bash
# 推理性能测试
python3 scripts/test_mlx_inference.py \
  --model /Volumes/Data/models/learning-assistant-deployed/mlx_optimized \
  --test_data /Volumes/Data/models/learning-assistant-training/data/test.jsonl \
  --num_runs 100
```

## 五、性能目标

### 5.1 延迟目标

| 任务类型 | 目标延迟（P95） | 说明 |
|---------|----------------|------|
| 课程资源检索 | <50ms | 本地索引查询 |
| 学习进度查询 | <30ms | 简单数据读取 |
| 简单问答 | <80ms | 模板化回复 |
| 路由判断 | <20ms | 快速分类 |

### 5.2 资源目标

| 资源 | 目标值 | 说明 |
|-----|--------|------|
| 内存占用 | <150MB | 4-bit 量化 |
| 模型大小 | <200MB | MLX 优化 |
| 首次加载 | <300ms | 冷启动 |
| 功耗 | <150mW | 推理态 |

### 5.3 质量目标

| 指标 | 目标值 | 说明 |
|-----|--------|------|
| 任务分类准确率 | >90% | 4 类任务 |
| 路由决策准确率 | >85% | local/cloud |
| 用户满意度 | >80% | 主观评价 |

## 六、端云协同机制

### 6.1 路由决策逻辑

```python
def should_route_to_cloud(query: str, context: dict) -> bool:
    """判断是否需要云端处理"""

    # 规则 1: 关键词匹配
    cloud_keywords = [
        "详细推导", "深入分析", "为什么",
        "原理", "证明", "复杂", "困难"
    ]
    if any(kw in query for kw in cloud_keywords):
        return True

    # 规则 2: 查询长度
    if len(query) > 100:
        return True

    # 规则 3: 上下文复杂度
    if context.get("requires_reasoning", False):
        return True

    # 规则 4: 历史失败记录
    if context.get("previous_failed", False):
        return True

    return False
```

### 6.2 端侧处理流程

```python
def handle_query_locally(query: str, context: dict) -> dict:
    """端侧处理流程"""

    # Step 1: 任务分类
    task_type = classify_task(query)

    # Step 2: 路由决策
    if should_route_to_cloud(query, context):
        return {
            "response": "正在为您连接云端 AI...",
            "route": "cloud",
            "task_type": task_type
        }

    # Step 3: 本地处理
    if task_type == "course_resource":
        return handle_course_resource(query, context)
    elif task_type == "learning_tracking":
        return handle_learning_tracking(query, context)
    elif task_type == "simple_qa":
        return handle_simple_qa(query, context)
    else:
        return {
            "response": "正在为您连接云端 AI...",
            "route": "cloud"
        }
```

## 七、实施时间表

| 阶段 | 任务 | 预计时间 | 负责人 |
|-----|------|---------|--------|
| Phase 1 | 数据准备 | 1 天 | - |
| Phase 2 | 模型下载 | 0.5 天 | - |
| Phase 3 | LoRA 微调 | 1 天 | - |
| Phase 4 | 模型合并与优化 | 0.5 天 | - |
| Phase 5 | 性能测试 | 0.5 天 | - |
| **总计** | | **3.5 天** | |

## 八、关键脚本

### 8.1 数据生成脚本

```python
# scripts/generate_learning_assistant_data.py
# 生成 500 个学习助手训练样本
# 输出: course_resources.jsonl, learning_tracking.jsonl, simple_qa.jsonl
```

### 8.2 MLX 训练脚本

```python
# scripts/train_mlx_lora.py
# 使用 MLX 框架进行 LoRA 微调
# 支持 Apple Silicon 加速
```

### 8.3 推理测试脚本

```python
# scripts/test_mlx_inference.py
# 测试 MLX 模型推理性能
# 输出: 延迟、内存、准确率报告
```

## 九、优势分析

### 9.1 为什么选择 MLX-4bit？

| 维度 | MLX-4bit | 标准 INT8 | 优势 |
|-----|----------|-----------|------|
| 内存占用 | ~150MB | ~200MB | ✅ 25% 更小 |
| 推理速度 | 原生优化 | 通用优化 | ✅ 更快 |
| Apple 集成 | 完美 | 一般 | ✅ 原生支持 |
| 精度损失 | <1% | <2% | ✅ 更高精度 |

### 9.2 为什么专注学习助手？

1. **场景明确**：课程资源 + 学习追踪，边界清晰
2. **数据可控**：可以生成高质量训练数据
3. **用户价值**：直接解决学生痛点
4. **技术可行**：0.6B 模型足够处理这些任务

## 十、风险与应对

| 风险 | 概率 | 影响 | 应对措施 |
|-----|------|------|---------|
| MLX 兼容性问题 | 低 | 高 | 准备 PyTorch 备选方案 |
| 训练数据不足 | 中 | 中 | 增加数据生成规则 |
| 性能不达标 | 低 | 中 | 优化模型结构 |
| 路由决策不准 | 中 | 中 | 增加规则和样本 |

## 十一、下一步行动

### 立即执行

1. **创建目录结构**
   ```bash
   mkdir -p /Volumes/Data/models/{qwen3-0.6b-mlx-4bit,learning-assistant-training/{data,checkpoints,adapters,logs},learning-assistant-deployed/{merged_model,mlx_optimized}}
   ```

2. **生成训练数据**
   ```bash
   python3 scripts/generate_learning_assistant_data.py
   ```

3. **下载模型**
   ```bash
   modelscope download --model Qwen/Qwen3-0.6B-MLX-4bit --local_dir /Volumes/Data/models/qwen3-0.6b-mlx-4bit
   ```

4. **开始训练**
   ```bash
   python3 scripts/train_mlx_lora.py
   ```

## 十二、成功标准

PoC 成功的标准：

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
