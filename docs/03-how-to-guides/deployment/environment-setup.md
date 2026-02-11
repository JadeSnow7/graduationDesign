# 环境配置

本项目主要通过 `code/.env` 管理运行时配置。

## 1. 生成配置文件

```bash
cp code/.env.example code/.env
```

## 2. 关键变量（示例）

- 数据库：`MYSQL_*`、`BACKEND_DB_DSN`
- 后端：`BACKEND_JWT_SECRET`、`BACKEND_CORS_ORIGINS`
- LLM：`LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`
- GraphRAG（可选）：`GRAPH_RAG_*`

## 3. 相关文档

- [配置说明](./configuration.md) - 完整的环境变量与配置项说明
- [NPU 分层部署策略](./npu-tiered-deployment.md) - 端侧 NPU 部署配置
- [AI 模型部署](./ai-model-deployment-guide.md) - AI 模型训练与部署指南

