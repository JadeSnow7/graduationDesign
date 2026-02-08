# 2026-02-08 同步批次交付报告

生成时间：2026-02-08 22:08:23 CST

## 1. 证据同步完整性
本地证据目录：`/Users/huaodong/graduationDesign/outputs/training_sync/2026-02-08-first-train/`

已同步文件：
- `eval_report_all.json`
- `eval_report_all.md`
- `predictions_all.jsonl`
- `train_all_20260208_211514.tail.log`
- `random_test_summary.json`
- `random_test_summary.md`
- `first_training_summary.md`

## 2. docx 同步与备份
已备份：
- `/Users/huaodong/graduationDesign/academic/thesis/proposal/开题报告.docx.bak-20260208`
- `/Users/huaodong/graduationDesign/academic/thesis/src/毕业论文.docx.bak-20260208`
- `/Users/huaodong/graduationDesign/hust-undergrad-thesis/毕业论文.docx.bak-20260208`

已回写：
- `/Users/huaodong/graduationDesign/academic/thesis/proposal/开题报告.docx`
- `/Users/huaodong/graduationDesign/academic/thesis/src/毕业论文.docx`
- `/Users/huaodong/graduationDesign/hust-undergrad-thesis/毕业论文.docx`

一致性抽检（由最终 docx 反抽文本）：
- proposal docx：包含“2026-02-08 训练结果同步（阶段性验证）”与全部 8 个指标值。
- academic thesis docx：包含阶段性训练结果表（首次 all + 随机三组均值）与阶段性结论语句。
- hust thesis docx：包含阶段性训练结果小节与“样本规模局限”条目。

## 3. PDF 成品刷新
- 开题报告 PDF：`/Users/huaodong/graduationDesign/academic/thesis/proposal/开题报告.pdf`（成功）
- academic 论文 PDF：`/Users/huaodong/graduationDesign/academic/thesis/src/main.pdf`（成功）
- hust 论文 PDF：`/Users/huaodong/graduationDesign/hust-undergrad-thesis/main.pdf`（成功）

## 4. 编译日志与告警
日志目录：`/Users/huaodong/graduationDesign/outputs/training_sync/2026-02-08-first-train/build_logs/`

- `proposal_pdf_build.log`：0 条 warning 关键字
- `academic_thesis_latexmk.log`：首次失败（字体 `STHeiti` 不存在）
- `academic_thesis_xelatex_fontset.log`：26 条 warning 关键字（主要为排版 over/underfull）
- `academic_thesis_xelatex_pass2.log`：7 条 warning 关键字
- `academic_thesis_xelatex_pass3.log`：4 条 warning 关键字
- `hust_thesis_latexmk.log`：80 条 warning 关键字（主要为 over/underfull）

说明：academic 论文最终通过 `\PassOptionsToClass{fontset=fandol}{ctexbook}` 方式编译通过，未修改源码字体配置。

## 5. docx 结构校验
- 官方校验脚本：`/Users/huaodong/.cc-switch/skills/docx/scripts/office/validate.py`
- 执行受阻：本机缺少 `defusedxml` 与 `lxml`，且环境离线无法安装依赖。
- fallback 校验：`/Users/huaodong/graduationDesign/outputs/training_sync/2026-02-08-first-train/docx_validation_fallback.md`
  - 结果：3/3 PASS（ZIP 完整、关键条目存在、XML 可解析）

## 6. 验收结论
- 证据同步：通过
- 文档一致性（核心指标与阶段性口径）：通过
- 口径正确性（非最终结论）：通过
- 成品可用性（pdf/docx 可生成）：通过
- 可追溯性（文档结果可回溯到本地证据）：通过
