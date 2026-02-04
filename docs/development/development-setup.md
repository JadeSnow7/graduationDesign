# 开发环境搭建

本文档描述本项目在本地的推荐开发环境与启动方式。项目采用 Monorepo（npm workspaces），Web 前端使用 React + TypeScript + Vite，后端使用 Go（Gin），AI/仿真服务使用 Python（FastAPI）。

## 1. 前置依赖

- Node.js 18+（建议 18/20 LTS）
- Go 1.24+（以仓库 `code/backend/go.mod` 为准）
- Python 3.9+（AI/仿真服务建议使用虚拟环境）
- Docker & Docker Compose（可选但推荐，用于 MySQL/MinIO 以及一键启动服务）

## 2. 代码依赖安装（Monorepo）

在 `code/` 目录执行：

```bash
cd code
npm install --workspaces
```

## 3. 环境变量

推荐从模板生成：

```bash
cp code/.env.example code/.env
```

按需修改 `code/.env` 中的数据库、LLM、GraphRAG、CORS 等配置。

## 4. 启动方式

### 4.1 推荐：Docker 启动依赖 + 本地开发服务

1) 启动依赖（MySQL/MinIO 等）与后端/AI/仿真（可选）：

```bash
cd code
docker compose up -d --build
```

2) Web 前端（本地开发服务器，热更新）：

```bash
cd code
npm -w frontend-react run dev
```

### 4.2 使用脚本（可选）

```bash
cd code
./scripts/setup-env.sh
./scripts/dev-up.sh
```

## 5. 验证健康状态

```bash
curl http://localhost:8080/healthz  # 后端
curl http://localhost:8001/healthz  # AI 服务
curl http://localhost:8002/healthz  # 仿真服务
```

