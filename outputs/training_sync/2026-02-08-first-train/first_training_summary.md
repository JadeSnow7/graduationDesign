# 2026-02-08 首次训练结果同步摘要（阶段性验证）

## 数据来源
- 首次 `all` 训练：`eval_report_all.json`、`eval_report_all.md`、`predictions_all.jsonl`、`train_all_20260208_211514.tail.log`
- 随机三组回归：`random_test_summary.json`、`random_test_summary.md`

## 首次 all 训练结果（2026-02-08）
- 样本数：`n=5`
- 关键点覆盖率（`key_point_coverage`）：`0.9167`
- 拒答准确率（`refusal_accuracy`）：`0.8000`
- 格式合规率（`response_format`）：`1.0000`
- 工具调用准确率（`tool_call_accuracy`）：`0.0000`

## 随机三组回归结果（2026-02-08）
- 组数：`3`（每组 `n=6`）
- 平均关键点覆盖率：`0.7333`
- 平均拒答准确率：`0.7778`
- 平均格式合规率：`0.8333`
- 平均工具调用准确率：`0.0000`

## 定位与限制
- 本批结果仅用于验证“训练-评测-文档同步”链路可复现。
- 首次 all 的样本规模较小，且随机三组数据为合成随机样本，不能替代真实数据上的正式实验结论。
- 正式实验结论需基于真实 `style/tool/rag` 数据集与固定回归集重新训练并复核。
