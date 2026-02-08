# 快速开始指南

## 文件说明

### 新生成的文件 (2026-02-08)
- `processed/style_sft_extended.jsonl` - 25条训练样本
- `eval/benchmark_extended.jsonl` - 9条评估样本
- `README_EXTENDED.md` - 详细说明文档
- `GENERATION_REPORT.md` - 生成报告
- `QUICK_START.md` - 本文件

## 快速验证

```bash
# 1. 验证JSON格式
python3 -c "import json; [json.loads(line) for line in open('processed/style_sft_extended.jsonl')]"

# 2. 查看样本数量
wc -l processed/style_sft_extended.jsonl eval/benchmark_extended.jsonl

# 3. 查看第一个样本
head -1 processed/style_sft_extended.jsonl | python3 -m json.tool
```

## 直接使用

```bash
# 使用新生成的数据训练
python train.py \
  --train_file assets/training_samples/processed/style_sft_extended.jsonl \
  --eval_file assets/training_samples/eval/benchmark_extended.jsonl
```

## 合并使用

```bash
# 合并所有数据
cat processed/style_sft_sample.jsonl processed/style_sft_extended.jsonl > processed/all_train.jsonl
cat eval/benchmark_sample.jsonl eval/benchmark_extended.jsonl > eval/all_eval.jsonl

# 使用合并后的数据训练
python train.py \
  --train_file assets/training_samples/processed/all_train.jsonl \
  --eval_file assets/training_samples/eval/all_eval.jsonl
```

## 数据统计

| 数据集 | 原始 | 新增 | 总计 |
|--------|------|------|------|
| 训练集 | 3条  | 25条 | 28条 |
| 评估集 | 2条  | 9条  | 11条 |

## 内容覆盖

- ✅ 静电场基础 (ch1)
- ✅ 电磁感应与介质 (ch2)
- ✅ 电磁波 (ch3)
- ✅ 拒答场景 (general)

## 难度分布

- Easy: 8条 (24%)
- Medium: 16条 (47%)
- Hard: 10条 (29%)

## 下一步

1. 使用新数据进行训练
2. 评估模型性能
3. 根据结果决定是否需要更多数据

详细信息请查看 `GENERATION_REPORT.md`
