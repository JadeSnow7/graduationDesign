# API 锁定策略（API Lock Policy）

本文档定义 API 契约锁定范围、门禁边界与同步责任。

## 1. 唯一契约源

- 对外契约唯一源：`docs/04-reference/api/openapi.yaml`。
- `openapi.lock.json` 用于 CI 校验契约文件是否被未声明地修改。

## 2. 范围与边界

- `AI Service` 内部 API（`/v1/*`）**不受** `openapi.lock.json` 的 CI 门禁直接约束；
- 但其行为**必须与对外契约（/api/v1/*）保持一致**，并通过测试与文档校验；
- 任何可能影响对外语义的内部变更，必须同步更新：
  1. `/Users/huaodong/graduationDesign/docs/04-reference/api/openapi.yaml`（如有外部可见影响）
  2. `/Users/huaodong/graduationDesign/docs/05-explanation/ai/index.md` 与相关 AI 专题页
  3. 对应自动化测试（后端/AI service）。

## 3. 评审与发布要求

- PR 评审需明确判断：变更是否影响 `/api/v1/*` 语义。
- 若影响对外语义，必须更新 OpenAPI 契约与相关测试后方可合并。
- 若仅为内部实现重构，仍需保持行为一致并完成回归测试。
