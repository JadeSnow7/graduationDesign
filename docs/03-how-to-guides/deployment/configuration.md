# 配置项说明

本文档对 `code/.env` 中常见配置项做归类说明，便于部署与排障。

## 1. LLM / GraphRAG

### 1.1 新变量（推荐，支持多模态）

```env
# 文本模型（local/cloud）
LLM_BASE_URL_LOCAL_TEXT=http://localhost:8000/v1
LLM_API_KEY_LOCAL_TEXT=
LLM_MODEL_LOCAL_TEXT=qwen3

LLM_BASE_URL_CLOUD_TEXT=https://api.example.com/v1
LLM_API_KEY_CLOUD_TEXT=sk-xxx
LLM_MODEL_CLOUD_TEXT=qwen3

# 视觉模型（local/cloud）
LLM_BASE_URL_LOCAL_VL=http://localhost:8001/v1
LLM_API_KEY_LOCAL_VL=
LLM_MODEL_LOCAL_VL=qwen3-vl

LLM_BASE_URL_CLOUD_VL=https://api.example.com/v1
LLM_API_KEY_CLOUD_VL=sk-xxx
LLM_MODEL_CLOUD_VL=qwen3-vl
```

### 1.2 旧变量（兼容，仅文本）

```env
# 仅用于纯文本场景，多模态场景需使用新变量
LLM_BASE_URL=http://localhost:8000/v1
LLM_API_KEY=
LLM_MODEL=qwen3
```

**迁移建议：**
- 新部署优先使用 `LLM_*_TEXT_*` / `LLM_*_VL_*`
- 旧变量保留用于向后兼容

### 1.3 开关与功能

- `AI_MULTIMODAL_ENABLED`：是否启用多模态端点 `/api/v1/ai/chat/multimodal`（默认 `false`）
- `RERANKER_ENABLED`：是否启用 reranker（当前建议保持 `false`）
- `GRAPH_RAG_ENABLED`：是否启用 GraphRAG

## 2. 后端与跨域

- `BACKEND_JWT_SECRET`：JWT 密钥
- `BACKEND_CORS_ORIGINS`：允许的前端来源（开发环境一般为 `http://localhost:5173`）

## 相关文档

- [模型路由策略](../../05-explanation/ai/model-routing-policy.md) - 路由规则与配置映射
- [NPU 分层部署策略](./npu-tiered-deployment.md) - 端侧部署配置
- [环境准备](./environment-setup.md) - 环境配置入门
