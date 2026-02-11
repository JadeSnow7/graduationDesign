# 端侧训练联测整理（2026-02-10）

## 本次结论

- 已完成 `ms-swift` 本机 LoRA 微调闭环：`数据转换 -> 训练 -> deploy -> 网关联调 -> 客户端联测`。
- 训练最佳检查点为 `checkpoint-100`，已用于后续部署与联测。
- 12 条固定联测用例全部返回非空回复，复杂推理场景“转发云端”语义命中 2/2。

## 关键指标

### 数据转换（edge_swift_v1）

| 指标 | 数值 |
|---|---:|
| train | 400 |
| valid | 50 |
| test | 50 |
| 总计 | 500 |
| 解析成功率 | 100% |

### 训练（LoRA / Apple MPS）

| 节点 | train loss | eval loss | eval token_acc |
|---|---:|---:|---:|
| step 50 | 0.2503 | 0.2368 | 0.9529 |
| step 100 | 0.0334 | **0.0245** | **0.9957** |
| step 150 | 0.0170 | - | - |

### 联测（Backend API 路径）

| 指标 | 数值 |
|---|---:|
| 总用例 | 12 |
| 非空回复 | 12 |
| 非空成功率 | 100% |
| 复杂推理用例 | 2 |
| 复杂推理“转发云端”命中 | 2 |

## 产物索引

- 数据转换校验：`/Users/huaodong/graduationDesign/outputs/edge_poc/reports/edge_swift_data_check_20260210.json`
- 模型准备报告：`/Users/huaodong/graduationDesign/outputs/edge_poc/reports/model_prepare_qwen3_0p6b_instruct_20260210.json`
- 训练日志：`/Users/huaodong/graduationDesign/outputs/edge_poc/reports/swift_train_edge_v1_20260210.log`
- 训练摘要：`/Users/huaodong/graduationDesign/outputs/edge_poc/reports/swift_train_edge_v1_20260210_summary.md`
- 部署日志：`/Users/huaodong/graduationDesign/outputs/edge_poc/reports/swift_deploy_edge_v1_20260210.log`
- 网关冒烟：`/Users/huaodong/graduationDesign/outputs/edge_poc/reports/edge_gateway_smoke_20260210.md`
- 客户端联测：`/Users/huaodong/graduationDesign/outputs/edge_poc/reports/client_web_e2e_edge_v1_20260210.md`

## 论文同步状态

已完成端侧训练/微调结果同步：

- `/Users/huaodong/graduationDesign/academic/thesis/src/chapters/chapter2.tex`
- `/Users/huaodong/graduationDesign/academic/thesis/src/chapters/abstract.tex`
- `/Users/huaodong/graduationDesign/academic/thesis/src/chapters/abstract-en.tex`
- `/Users/huaodong/graduationDesign/academic/thesis/src/chapters/conclusion.tex`
- `/Users/huaodong/graduationDesign/academic/thesis/src/chapter_5_edge_cloud_architecture.md`
- `/Users/huaodong/graduationDesign/academic/thesis/src/docx_source.md`

## 风险与备注

- 训练末段出现过本机磁盘临时空间不足告警；但关键指标、最优 checkpoint 与联测均已完成，不影响本次结果有效性。
- 本轮未执行 ONNX/ANE/INT8 完整性能闭环，仍属于后续阶段任务。
