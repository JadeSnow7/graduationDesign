# 2026-02-08 文档同步变更说明（一页）

## 变更目标
将“首次 all 训练 + 随机三组回归”结果同步到开题报告与毕业论文（academic/hust 双轨）的源码与成品，统一阶段性结论口径。

## 本次新增/修改内容
- 新增统一事实源：`/Users/huaodong/graduationDesign/docs/05-explanation/ai/training-runs/2026-02-08-first-train.md`
- 新增本地证据目录：`/Users/huaodong/graduationDesign/outputs/training_sync/2026-02-08-first-train/`
  - 包含 `eval_report_all.json/.md`、`predictions_all.jsonl`、`train_all_20260208_211514.tail.log`
  - 包含 `random_test_summary.json/.md`
  - 包含 `first_training_summary.md`

## 源码文档更新
- 开题报告与简版开题：
  - `/Users/huaodong/graduationDesign/academic/thesis/proposal/开题报告.md`
  - `/Users/huaodong/graduationDesign/academic/thesis/proposal/opening-report.md`
  - 新增“2026-02-08 训练结果同步（阶段性验证）”小节、双表格（首次 all + 随机三组均值）
  - 更新后续计划：明确进入真实数据正式实验
- 毕业论文（academic）：
  - `/Users/huaodong/graduationDesign/academic/thesis/src/chapters/chapter2.tex`
  - `/Users/huaodong/graduationDesign/academic/thesis/src/chapters/conclusion.tex`
  - 新增“阶段性训练结果同步（2026-02-08）”小节与表格；结论章补充“已完成阶段性验证，正式实验待真实数据闭环”
- 毕业论文（hust）：
  - `/Users/huaodong/graduationDesign/hust-undergrad-thesis/chapters/chapter5.tex`
  - `/Users/huaodong/graduationDesign/hust-undergrad-thesis/chapters/conclusion.tex`
  - 在“离线评测与回归机制”中新增阶段性结果，不覆盖既有历史回归指标；在结论中补充样本规模与局限

## 固定指标口径（全文件一致）
- 首次 all（n=5）：
  - `key_point_coverage=0.9167`
  - `refusal_accuracy=0.8000`
  - `response_format=1.0000`
  - `tool_call_accuracy=0.0000`
- 随机三组均值（每组 n=6）：
  - `key_point_coverage=0.7333`
  - `refusal_accuracy=0.7778`
  - `response_format=0.8333`
  - `tool_call_accuracy=0.0000`

## 结论口径调整
- 新增：明确“本批结果仅用于阶段性验证（链路可复现）”。
- 删除/避免：将本批结果作为“正式最终效果”的表述。
- 强化：下一步正式实验基于真实 `style/tool/rag` 数据闭环重新训练与评测。
