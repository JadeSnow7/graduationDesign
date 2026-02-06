# 数据蒸馏（Distillation）与链路验证

本项目的“蒸馏”主要指**数据/指令蒸馏（Instruction Distillation）**：通过规则抽取、教师模型生成与筛选，把“多轮对话/写作反馈”转换成可训练的样本；并通过 smoke 训练/评测快速验证数据与指标输出链路可用。

> 说明：这里不做 logits-level 的知识蒸馏（teacher logits → student logits）。如果后续需要，可在训练脚本层单独引入。

---

## 1. 为什么需要蒸馏

- **对齐运行时协议**：运行时是 chat messages（可能含 tool_calls/RAG context），训练侧既要保持结构一致，也要便于做快速 sanity check。
- **可控的数据质量**：写作课场景的高价值样本往往来自教师反馈、rubric 标注与高质量改写示例；蒸馏步骤用于格式统一与过滤。
- **快速回归**：在进行昂贵的 LoRA/QLoRA 训练前，用轻量 smoke 指标（如 token-level 统计、困惑度等）验证“数据→指标→报告”的链路稳定性。

---

## 2. 两条蒸馏路径

### 2.1 规则蒸馏：chat-style → prompt/response（用于 smoke / 快速验收）

脚本：`scripts/ai/distill_data.py`

输入：chat-style JSONL（遵循 `docs/05-explanation/ai/training-data-spec.md`，包含 `messages`）  
输出：prompt/response JSONL（更适合做轻量语言模型 smoke 与数据去重统计）

示例：
```bash
python3 scripts/ai/distill_data.py \
  --input assets/training_samples/processed/style_sft_sample.jsonl \
  --output outputs/distilled/style_sft_distilled.jsonl \
  --report outputs/distillation_report.json
```

产物：
- `outputs/distilled/*.jsonl`：蒸馏后的 prompt/response
- `outputs/distillation_report*.json`：输入/输出条数、去重与丢弃原因统计

### 2.2 指令蒸馏：教师模型生成/改写（用于扩充 SFT 数据）

脚本：`code/ai_service/training/generate_synthetic_data.py`  
用途：用“更强的上游模型”生成写作反馈/引导式对话样本，作为 SFT 的补充覆盖面（需人工抽检与过滤）。

---

## 3. Smoke 训练：验证数据与指标输出链路

脚本：`scripts/ai/train_smoke.py`  
方法：用蒸馏后的 prompt/response 构建一个极简语言模型（token 统计 + Laplace smoothing），并输出困惑度等指标；它不代表最终模型效果，仅用于链路验证。

示例：
```bash
python3 scripts/ai/train_smoke.py \
  --train outputs/distilled/style_sft_distilled.jsonl \
  --eval outputs/distilled/benchmark_distilled.jsonl \
  --metrics outputs/smoke_train_metrics.json
```

产物：
- `outputs/smoke_train_metrics.json`：样本数、token 数、PPL 等 smoke 指标

> 建议把 smoke 指标作为“训练前置门禁”：当数据格式错误、重复/空样本激增、文本异常（大量乱码/HTML）时，能在分钟级发现问题。

---

## 4. 与 LoRA/QLoRA 的关系

- **蒸馏与 smoke**：解决“数据是否能用、链路是否可复现”的工程风险。
- **LoRA/QLoRA**：解决“模型在写作课 rubric / 引导风格 / RAG 引用规范上的稳定性”。

训练入口参考：`docs/03-how-to-guides/deployment/ai-model-deployment-guide.md` 与 `code/ai_service/training/README.md`。

