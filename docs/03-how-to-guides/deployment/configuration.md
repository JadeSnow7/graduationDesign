# 配置项说明

本文档对 `code/.env` 中常见配置项做归类说明，便于部署与排障。

## 1. LLM / GraphRAG

- `LLM_BASE_URL`：上游推理服务地址（建议不包含 `/v1`）
- `LLM_API_KEY`：鉴权密钥
- `LLM_MODEL`：默认模型名
- `GRAPH_RAG_ENABLED`：是否启用 GraphRAG

## 2. 后端与跨域

- `BACKEND_JWT_SECRET`：JWT 密钥
- `BACKEND_CORS_ORIGINS`：允许的前端来源（开发环境一般为 `http://localhost:5173`）

