# 2026-02-08 首次训练结果（统一事实源）

## 结论口径
本页用于统一“第一次训练结果同步”口径。以下数值均为**阶段性验证结果**，不作为最终正式实验结论。

## 首次 all 训练（2026-02-08）
- 样本数：`n=5`
- `key_point_coverage=0.9167`
- `refusal_accuracy=0.8000`
- `response_format=1.0000`
- `tool_call_accuracy=0.0000`

## 随机三组回归（2026-02-08）
- 组数：`3`，每组样本 `n=6`
- 平均 `key_point_coverage=0.7333`
- 平均 `refusal_accuracy=0.7778`
- 平均 `response_format=0.8333`
- 平均 `tool_call_accuracy=0.0000`

## 数据来源
- `/Users/huaodong/graduationDesign/outputs/training_sync/2026-02-08-first-train/eval_report_all.json`
- `/Users/huaodong/graduationDesign/outputs/training_sync/2026-02-08-first-train/random_test_summary.json`

## 使用约束
- 该批结果仅说明链路已跑通并具备可复现性。
- 正式实验需在真实数据与扩展回归集上重新训练与评估。
