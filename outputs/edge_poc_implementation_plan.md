# 端侧 PoC 实施计划

## 一、实施目标

验证端侧 qwen3-0.6B 模型在 Apple M4 Neural Engine 上的可行性，包括：

1. **功能验证**: 意图分类、Query 改写、Tool 选择
2. **性能验证**: 延迟 < 100ms、内存 < 200MB
3. **精度验证**: 量化后精度损失 < 2%
4. **部署验证**: ONNX 导出与 NPU 推理

## 二、实施阶段

### Phase 1: 环境准备（0.5 天）

**任务清单**:
- [ ] 安装 ms-swift 框架
- [ ] 下载 qwen3-0.6B 基座模型
- [ ] 准备端侧训练数据（意图分类 1000 样本）
- [ ] 配置 Apple M4 开发环境

**验证标准**:
```bash
# 验证 ms-swift 安装
python3 -m swift.cli.sft --help

# 验证模型下载
python3 -c "from transformers import AutoModel; AutoModel.from_pretrained('Qwen/Qwen3-0.6B')"

# 验证数据格式
python3 scripts/validate_edge_data.py
```

### Phase 2: 模型微调（1 天）

**训练配置**:
```yaml
model: Qwen/Qwen3-0.6B
task: intent_classification
lora_config:
  rank: 8
  alpha: 16
  target_modules: [q_proj, v_proj]
  dropout: 0.05
training:
  learning_rate: 2e-4
  epochs: 3
  batch_size: 16
  gradient_accumulation: 4
  max_length: 128
data:
  train: data/edge_intent_train.jsonl
  eval: data/edge_intent_eval.jsonl
  samples: 1000
```

**执行命令**:
```bash
cd /Users/huaodong/graduationDesign/code/ai_service

# 训练
python3 -m swift.cli.sft \
  --model Qwen/Qwen3-0.6B \
  --dataset edge_intent_train.jsonl \
  --lora_rank 8 \
  --lora_alpha 16 \
  --learning_rate 2e-4 \
  --num_train_epochs 3 \
  --per_device_train_batch_size 16 \
  --gradient_accumulation_steps 4 \
  --max_length 128 \
  --output_dir outputs/edge_poc/qwen3-0.6b-intent
```

**验证标准**:
- [ ] 训练完成无错误
- [ ] 验证集准确率 > 90%
- [ ] LoRA 参数量 < 5M

### Phase 3: 模型量化（0.5 天）

**量化流程**:
```python
# 1. LoRA 合并
python3 -m swift.cli.merge \
  --model_path outputs/edge_poc/qwen3-0.6b-intent \
  --output_dir outputs/edge_poc/qwen3-0.6b-intent-merged

# 2. INT8 量化
python3 scripts/quantize_edge_model.py \
  --model_path outputs/edge_poc/qwen3-0.6b-intent-merged \
  --output_dir outputs/edge_poc/qwen3-0.6b-intent-int8 \
  --quantization int8

# 3. 精度验证
python3 scripts/validate_quantization.py \
  --original outputs/edge_poc/qwen3-0.6b-intent-merged \
  --quantized outputs/edge_poc/qwen3-0.6b-intent-int8 \
  --test_data data/edge_intent_test.jsonl
```

**验证标准**:
- [ ] 量化后模型大小 < 250MB
- [ ] 精度损失 < 2%
- [ ] 推理速度提升 > 2x

### Phase 4: ONNX 导出（0.5 天）

**导出流程**:
```python
# ONNX 导出
python3 scripts/export_to_onnx.py \
  --model_path outputs/edge_poc/qwen3-0.6b-intent-int8 \
  --output_path outputs/edge_poc/qwen3-0.6b-intent.onnx \
  --opset_version 14 \
  --optimize

# ONNX 验证
python3 scripts/validate_onnx.py \
  --onnx_path outputs/edge_poc/qwen3-0.6b-intent.onnx \
  --test_data data/edge_intent_test.jsonl
```

**验证标准**:
- [ ] ONNX 导出成功
- [ ] ONNX Runtime 推理一致性 > 99%
- [ ] ONNX 模型大小 < 300MB

### Phase 5: Apple M4 测试（1 天）

**测试环境**:
- 硬件: MacBook Pro with M4
- 系统: macOS 15.x
- 框架: ONNX Runtime with CoreML EP

**测试脚本**:
```python
# Apple Neural Engine 推理测试
python3 scripts/test_apple_neural_engine.py \
  --onnx_path outputs/edge_poc/qwen3-0.6b-intent.onnx \
  --test_data data/edge_intent_test.jsonl \
  --num_runs 100 \
  --measure_latency \
  --measure_memory \
  --measure_power
```

**测试指标**:
| 指标 | 目标值 | 实测值 |
|-----|--------|--------|
| 推理延迟（P50） | <50ms | TBD |
| 推理延迟（P95） | <100ms | TBD |
| 内存占用 | <200MB | TBD |
| 功耗 | <200mW | TBD |
| 准确率 | >90% | TBD |

### Phase 6: 端到端集成（0.5 天）

**集成测试**:
```python
# 端云协同模拟测试
python3 scripts/test_edge_cloud_integration.py \
  --edge_model outputs/edge_poc/qwen3-0.6b-intent.onnx \
  --cloud_model mock \
  --test_scenarios data/edge_cloud_scenarios.jsonl \
  --measure_routing_accuracy
```

**验证标准**:
- [ ] 路由决策准确率 > 85%
- [ ] 端侧处理率 > 60%
- [ ] 端到端延迟 < 500ms

## 三、数据准备

### 3.1 意图分类数据集

**数据格式**:
```json
{
  "query": "今天天气怎么样？",
  "intent": "weather_query",
  "should_route_to_cloud": false,
  "confidence_threshold": 0.9,
  "expected_output": {
    "intent": "weather_query",
    "confidence": 0.95,
    "route": "local"
  }
}
```

**数据规模**:
- 训练集: 800 样本
- 验证集: 100 样本
- 测试集: 100 样本
- 总计: 1000 样本

**意图类别**:
1. `weather_query` - 天气查询（本地）
2. `time_query` - 时间查询（本地）
3. `simple_qa` - 简单问答（本地）
4. `complex_reasoning` - 复杂推理（云端）
5. `knowledge_qa` - 知识问答（云端）
6. `open_chat` - 开放对话（云端）

### 3.2 数据生成脚本

```python
# scripts/generate_edge_intent_data.py
import json
import random

def generate_intent_samples():
    """生成意图分类训练数据"""

    # 本地意图模板
    local_templates = {
        "weather_query": [
            "今天天气怎么样？",
            "明天会下雨吗？",
            "现在温度多少？"
        ],
        "time_query": [
            "现在几点了？",
            "今天星期几？",
            "现在是什么时间？"
        ],
        "simple_qa": [
            "你好",
            "谢谢",
            "再见"
        ]
    }

    # 云端意图模板
    cloud_templates = {
        "complex_reasoning": [
            "如果明天下雨，我应该带伞还是穿雨衣？",
            "请帮我分析一下这个问题的利弊",
            "为什么会出现这种情况？"
        ],
        "knowledge_qa": [
            "量子计算的原理是什么？",
            "中国的首都是哪里？",
            "人工智能的发展历史"
        ],
        "open_chat": [
            "我今天心情不好，聊聊天吧",
            "你觉得人生的意义是什么？",
            "讲个笑话给我听"
        ]
    }

    samples = []

    # 生成本地意图样本
    for intent, templates in local_templates.items():
        for template in templates:
            samples.append({
                "query": template,
                "intent": intent,
                "should_route_to_cloud": False,
                "confidence_threshold": 0.9
            })

    # 生成云端意图样本
    for intent, templates in cloud_templates.items():
        for template in templates:
            samples.append({
                "query": template,
                "intent": intent,
                "should_route_to_cloud": True,
                "confidence_threshold": 0.7
            })

    return samples
```

## 四、关键脚本

### 4.1 量化脚本

```python
# scripts/quantize_edge_model.py
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def quantize_model(model_path, output_dir, quantization="int8"):
    """量化模型到 INT8"""

    # 加载模型
    model = AutoModelForCausalLM.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)

    # 动态量化
    quantized_model = torch.quantization.quantize_dynamic(
        model,
        {torch.nn.Linear},
        dtype=torch.qint8
    )

    # 保存
    quantized_model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    print(f"Quantized model saved to {output_dir}")
```

### 4.2 ONNX 导出脚本

```python
# scripts/export_to_onnx.py
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def export_to_onnx(model_path, output_path, opset_version=14):
    """导出模型到 ONNX 格式"""

    model = AutoModelForCausalLM.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)

    # 准备示例输入
    dummy_input = tokenizer("Hello", return_tensors="pt")

    # 导出
    torch.onnx.export(
        model,
        (dummy_input["input_ids"],),
        output_path,
        opset_version=opset_version,
        input_names=["input_ids"],
        output_names=["logits"],
        dynamic_axes={
            "input_ids": {0: "batch", 1: "sequence"},
            "logits": {0: "batch", 1: "sequence"}
        }
    )

    print(f"ONNX model exported to {output_path}")
```

### 4.3 Apple Neural Engine 测试脚本

```python
# scripts/test_apple_neural_engine.py
import onnxruntime as ort
import numpy as np
import time
import psutil
import os

def test_neural_engine(onnx_path, test_data, num_runs=100):
    """在 Apple Neural Engine 上测试模型"""

    # 创建 ONNX Runtime 会话（使用 CoreML EP）
    providers = ['CoreMLExecutionProvider', 'CPUExecutionProvider']
    session = ort.InferenceSession(onnx_path, providers=providers)

    latencies = []
    memory_usage = []

    for i in range(num_runs):
        # 准备输入
        input_ids = np.random.randint(0, 1000, (1, 128), dtype=np.int64)

        # 测量延迟
        start_time = time.time()
        outputs = session.run(None, {"input_ids": input_ids})
        latency = (time.time() - start_time) * 1000  # ms

        latencies.append(latency)

        # 测量内存
        process = psutil.Process(os.getpid())
        memory_mb = process.memory_info().rss / 1024 / 1024
        memory_usage.append(memory_mb)

    # 统计
    print(f"Latency P50: {np.percentile(latencies, 50):.2f} ms")
    print(f"Latency P95: {np.percentile(latencies, 95):.2f} ms")
    print(f"Memory: {np.mean(memory_usage):.2f} MB")
```

## 五、时间表

| 阶段 | 任务 | 预计时间 | 负责人 |
|-----|------|---------|--------|
| Phase 1 | 环境准备 | 0.5 天 | - |
| Phase 2 | 模型微调 | 1 天 | - |
| Phase 3 | 模型量化 | 0.5 天 | - |
| Phase 4 | ONNX 导出 | 0.5 天 | - |
| Phase 5 | M4 测试 | 1 天 | - |
| Phase 6 | 集成测试 | 0.5 天 | - |
| **总计** | | **4 天** | |

## 六、风险与应对

| 风险 | 概率 | 影响 | 应对措施 |
|-----|------|------|---------|
| 模型下载失败 | 低 | 中 | 使用镜像源 |
| 量化精度损失过大 | 中 | 高 | 调整量化策略 |
| ONNX 导出失败 | 中 | 高 | 使用 TorchScript |
| M4 性能不达标 | 低 | 中 | 优化模型结构 |
| 内存超限 | 中 | 高 | 减少 max_length |

## 七、成功标准

PoC 成功的标准：

- [ ] 模型微调完成，验证集准确率 > 90%
- [ ] 量化后精度损失 < 2%
- [ ] ONNX 导出成功，推理一致性 > 99%
- [ ] M4 推理延迟 P95 < 100ms
- [ ] 内存占用 < 200MB
- [ ] 端到端集成测试通过

## 八、交付物

1. **模型文件**:
   - `qwen3-0.6b-intent-merged/` - 合并后的模型
   - `qwen3-0.6b-intent-int8/` - 量化后的模型
   - `qwen3-0.6b-intent.onnx` - ONNX 模型

2. **测试报告**:
   - `edge_poc_performance_report.md` - 性能测试报告
   - `edge_poc_accuracy_report.md` - 精度测试报告
   - `edge_poc_integration_report.md` - 集成测试报告

3. **论文素材**:
   - 性能对比表格
   - 延迟分布图
   - 内存占用图
   - 路由决策准确率图

4. **代码**:
   - 所有脚本提交到 `scripts/edge_poc/`
   - 配置文件提交到 `configs/edge_poc/`
