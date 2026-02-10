# Edge-Side PoC Implementation

## 概述

本 PoC 验证端侧 qwen3-0.6B 模型在 Apple M4 Neural Engine 上的可行性，包括模型微调、量化、ONNX 导出和性能测试。

## 目录结构

```
edge_poc/
├── data/                           # 训练数据
│   ├── edge_intent_train.jsonl    # 训练集 (72 samples)
│   ├── edge_intent_eval.jsonl     # 验证集 (9 samples)
│   └── edge_intent_test.jsonl     # 测试集 (9 samples)
├── scripts/                        # 实现脚本
│   ├── generate_edge_intent_data.py    # 数据生成
│   ├── quantize_edge_model.py          # 模型量化
│   ├── export_to_onnx.py               # ONNX 导出
│   └── test_apple_neural_engine.py     # M4 性能测试
├── models/                         # 模型文件
│   ├── qwen3-0.6b-intent-merged/  # 合并后的模型
│   ├── qwen3-0.6b-intent-int8/    # 量化模型
│   └── qwen3-0.6b-intent.onnx     # ONNX 模型
└── reports/                        # 测试报告
    ├── quantization_report.json
    ├── onnx_export_report.json
    └── m4_performance_report.json
```

## 快速开始

### 1. 环境准备

```bash
# 安装依赖
pip install torch transformers onnx onnxruntime psutil

# 验证 ONNX Runtime 支持 CoreML
python3 -c "import onnxruntime as ort; print(ort.get_available_providers())"
```

### 2. 生成训练数据

```bash
python3 scripts/generate_edge_intent_data.py
```

**输出**:
- `data/edge_intent_train.jsonl` - 72 训练样本
- `data/edge_intent_eval.jsonl` - 9 验证样本
- `data/edge_intent_test.jsonl` - 9 测试样本

**意图类别**:
- **本地意图** (5 类): weather_query, time_query, simple_qa, tool_select, safety_check
- **云端意图** (4 类): complex_reasoning, knowledge_qa, open_chat, long_generation

### 3. 模型微调（使用 ms-swift）

```bash
# 注意: 这一步需要先训练模型，这里假设已有训练好的模型
# 实际训练命令:
# python3 -m swift.cli.sft \
#   --model Qwen/Qwen3-0.6B \
#   --dataset data/edge_intent_train.jsonl \
#   --lora_rank 8 \
#   --lora_alpha 16 \
#   --learning_rate 2e-4 \
#   --num_train_epochs 3 \
#   --output_dir models/qwen3-0.6b-intent
```

### 4. 模型量化

```bash
python3 scripts/quantize_edge_model.py \
  --model_path models/qwen3-0.6b-intent-merged \
  --output_dir models/qwen3-0.6b-intent-int8 \
  --validate \
  --test_data data/edge_intent_test.jsonl
```

**验证标准**:
- ✅ 量化后模型大小 < 250MB
- ✅ 精度损失 < 2%
- ✅ 推理速度提升 > 2x

### 5. ONNX 导出

```bash
python3 scripts/export_to_onnx.py \
  --model_path models/qwen3-0.6b-intent-int8 \
  --output_path models/qwen3-0.6b-intent.onnx \
  --opset_version 14 \
  --max_length 128 \
  --validate \
  --test_data data/edge_intent_test.jsonl
```

**验证标准**:
- ✅ ONNX 导出成功
- ✅ ONNX Runtime 推理一致性 > 99%
- ✅ ONNX 模型大小 < 300MB

### 6. Apple M4 性能测试

```bash
python3 scripts/test_apple_neural_engine.py \
  --onnx_path models/qwen3-0.6b-intent.onnx \
  --test_data data/edge_intent_test.jsonl \
  --num_runs 100 \
  --output_dir reports
```

**测试指标**:
| 指标 | 目标值 | 实测值 |
|-----|--------|--------|
| 推理延迟（P50） | <50ms | TBD |
| 推理延迟（P95） | <100ms | TBD |
| 内存占用 | <200MB | TBD |
| 功耗 | <200mW | TBD |
| 准确率 | >90% | TBD |

## 数据格式

### 训练数据格式

```json
{
  "query": "今天天气怎么样？",
  "response": "{\"intent\": \"weather_query\", \"route\": \"local\", \"confidence\": 0.95}",
  "system": "你是一个意图分类助手，负责判断用户查询应该在本地处理还是发送到云端。",
  "history": []
}
```

### 意图分类输出格式

```json
{
  "intent": "weather_query",
  "route": "local",
  "confidence": 0.95
}
```

## 性能目标

### 延迟目标

| 场景 | 目标延迟 | 说明 |
|-----|---------|------|
| 意图分类 | <50ms | P95 |
| Query 改写 | <80ms | P95 |
| 本地摘要 | <100ms | P95 |
| Tool 选择 | <50ms | P95 |
| 安全过滤 | <30ms | P95 |

### 资源目标

| 资源 | 目标值 | 说明 |
|-----|--------|------|
| 内存占用 | <200MB | 峰值 |
| 模型大小 | <250MB | 压缩后 |
| 功耗 | <200mW | 推理态 |
| 首次加载 | <500ms | 冷启动 |

### 质量目标

| 指标 | 目标值 | 说明 |
|-----|--------|------|
| 意图分类准确率 | >90% | 测试集 |
| 路由决策准确率 | >85% | 端云协同 |
| 量化精度损失 | <2% | INT8 |
| ONNX 一致性 | >99% | vs PyTorch |

## 实施进度

- [x] Phase 1: 环境准备
- [x] Phase 2: 数据生成
- [ ] Phase 3: 模型微调
- [ ] Phase 4: 模型量化
- [ ] Phase 5: ONNX 导出
- [ ] Phase 6: M4 性能测试
- [ ] Phase 7: 论文撰写

## 已知问题

1. **模型微调**: 需要先训练 qwen3-0.6B 模型，当前脚本假设模型已存在
2. **CoreML 支持**: 需要确认 ONNX Runtime 是否支持 CoreML Execution Provider
3. **功耗测试**: 需要 sudo 权限才能使用 powermetrics 命令

## 下一步计划

1. 完成模型微调（使用 ms-swift）
2. 运行量化和 ONNX 导出流程
3. 在 Apple M4 上进行性能测试
4. 收集实验数据并更新论文
5. 撰写 Chapter 6: 端侧模型工程化

## 参考文档

- [Edge-Cloud Architecture (Chapter 5)](../../academic/thesis/src/chapter_5_edge_cloud_architecture.md)
- [PoC Implementation Plan](../edge_poc_implementation_plan.md)
- [MS-Swift Documentation](https://github.com/modelscope/swift)
- [ONNX Runtime Documentation](https://onnxruntime.ai/)

## 联系方式

如有问题，请参考实施计划文档或查看相关脚本的注释。
