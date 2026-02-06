# 配置参考总览

本目录用于汇总服务配置与环境变量。

## 核心配置入口

- 后端配置：`code/.env.example` 中 `BACKEND_*` 项
- AI 服务配置：`code/.env.example` 中 `LLM_*`、`GRAPH_RAG_*` 项
- 部署注入：`code/docker-compose.yml` 的 `environment` 区块
