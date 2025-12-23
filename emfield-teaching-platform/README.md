# 电磁场课程智能教学平台（企业微信 + 大模型 + 仿真）

本仓库为毕业设计原型项目骨架，目标是实现“教学业务管理 + AI 助教 + 电磁场仿真可视化”的一体化平台，前端运行于企业微信内嵌 H5。

## 架构概览
- `frontend/`：H5 前端（Vue 3 + Vite）
- `backend/`：教学业务后端（Go + Gin，JWT + RBAC）
- `services/ai/`：AI 服务（FastAPI），对接 Qwen/兼容 OpenAI 接口
- `services/sim/`：仿真服务（FastAPI），提供典型电磁场数值计算与可视化
- `docs/`：开题报告、设计说明等文档
- `deploy/`：本地/容器化部署配置（Docker Compose）

## 快速开始（Docker Compose）
1. 复制环境变量：
   - `cp deploy/.env.example deploy/.env`
2. 启动依赖与服务：
   - `docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d --build`
   - 或使用脚本：`./scripts/compose-up.sh`
3. 访问：
   - 后端健康检查：`http://localhost:8080/healthz`
   - AI 服务：`http://localhost:8001/healthz`
   - 仿真服务：`http://localhost:8002/healthz`

## 本地开发（不使用 Docker）
- 后端：`cd backend && go run ./cmd/server`
- AI：`cd services/ai && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8001`
- 仿真：`cd services/sim && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8002`
- 前端：`cd frontend && npm install && npm run dev`

## 说明
- AI 默认提供“未配置上游模型”的安全降级提示；如需真实调用，请在 `deploy/.env` 配置 `LLM_*` 变量。
- 仿真服务内置 `laplace2d` 示例，用于演示“参数化计算 + 可视化输出”闭环。
- 企业微信 OAuth 登录为可选能力：在 `deploy/.env` 配置 `WECOM_*` 后即可在企业微信内置浏览器使用授权登录。

## 文档
- 架构：`docs/ARCHITECTURE.md`
- API：`docs/API.md`
- 开发：`docs/DEV.md`
- GraphRAG：`docs/GRAPH_RAG.md`
