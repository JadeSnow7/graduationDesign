# Qwen3/Qwen3-VL 迁移基线（2026-02-09）

用于记录本次迁移的初始状态、变更边界与回滚锚点。

## 1. 迁移前基线

- 对外接口仅有文本聊天：`POST /api/v1/ai/chat`
- AI Service 内部仅有文本聊天：`POST /v1/chat`
- 路由策略：`privacy + route + trusted gateway`，默认 `private + local`
- GraphRAG：关键词 / 混合检索已上线；未接入 reranker 抽象
- 配置：仅 `LLM_BASE_URL_* / LLM_MODEL_*` 单组模型变量

## 2. 本次变更边界

- 新增多模态独立端点：`/api/v1/ai/chat/multimodal` 与 `/v1/chat/multimodal`
- 保持 `/api/v1/ai/chat` 与 `/v1/chat` 行为不变
- 新增模型族路由：`qwen3` / `qwen3_vl` / `auto`
- 新增开关：`AI_MULTIMODAL_ENABLED`、`RERANKER_ENABLED`
- 新增配置组：`LLM_*_TEXT_*` 与 `LLM_*_VL_*`
- reranker 仅预留接口，不改变检索排序

## 3. 回滚锚点

1. 立即回滚：将 `AI_MULTIMODAL_ENABLED=false`
2. 部分回滚：保留代码，撤销路由入口 `/api/v1/ai/chat/multimodal`
3. 数据与索引：本次迁移不涉及 DB schema 与向量索引格式变更

## 4. 验收最小集

- 旧接口回归：`/api/v1/ai/chat` 正常
- 新接口文本请求路由 `qwen3`
- 新接口视觉请求路由 `qwen3_vl`
- 多模态 fallback 仅同模型家族 local->cloud

## 5. 文档同步状态

本基线作为历史锚点，后续文档更新追溯至此。

| 文档类型 | 状态 | 说明 |
|---|---|---|
| NPU 分层部署 | ✓ 已同步 | `npu-tiered-deployment.md` |
| 模型路由策略 | 🔄 进行中 | `model-routing-policy.md` |
| Plan 模式协作 | 🔄 进行中 | `plan-mode-workflow.md` |
| API 参考更新 | 🔄 进行中 | `ai.md`, `openapi.yaml` |
| 配置文档更新 | 🔄 进行中 | `configuration.md` |
| 导航与索引 | 🔄 进行中 | `config.mts`, `index.md`, `README.md` |

最后更新：2026-02-09
