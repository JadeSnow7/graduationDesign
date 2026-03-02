# 环境配置

本项目主要通过 `code/.env` 管理运行时配置。

## 1. 生成配置文件

```bash
cp code/.env.example code/.env
```

## 2. 关键变量（示例）

- 数据库：`MYSQL_*`、`BACKEND_DB_DSN`（容器）或 `DB_DSN`（本地 SQLite）
- 后端：`BACKEND_JWT_SECRET`、`BACKEND_CORS_ORIGINS`
- 仿真网关：`BACKEND_SIM_BASE_URL`（后端转发到 Python 仿真服务）
- 边缘路由：`EDGE_ROUTER_ENGINE`
- LLM：`LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`（兼容旧版）或 `LLM_BASE_URL_CLOUD`、`LLM_API_KEY_CLOUD`
- GraphRAG（可选）：`GRAPH_RAG_*`

### 新人最容易遗漏的 4 项

1. `MYSQL_DATABASE` / `DB_DSN`：开发环境常用 `DB_DSN=sqlite:emfield.db`，生产请使用 MySQL。
2. `EDGE_ROUTER_ENGINE`：端云协同路由引擎，推荐 `js`。
3. `BACKEND_SIM_BASE_URL`：缺失会导致 `/api/v1/sim/*` 无法经网关转发到 Python 仿真服务。
4. `LLM_BASE_URL` + `LLM_API_KEY`：作为基础上游配置（或使用 cloud/local 分层变量）。

## 3. 相关文档

- [配置说明](./configuration.md) - 完整的环境变量与配置项说明
- [NPU 分层部署策略](./npu-tiered-deployment.md) - 端侧 NPU 部署配置
- [AI 模型部署](./ai-model-deployment-guide.md) - AI 模型训练与部署指南
