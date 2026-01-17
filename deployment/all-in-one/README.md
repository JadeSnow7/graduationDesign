# EMField Teaching Platform - All-in-One Deployment

一键部署包含 Go 后端 + AI 服务 + 仿真服务的单一 Docker 镜像。

## 快速开始

```bash
# 1. 复制环境配置
cp .env.example .env

# 2. 编辑 .env 填入必要配置
#    - DB_DSN (数据库连接)
#    - LLM_API_KEY (AI 功能需要)
#    - JWT_SECRET (生产环境必改)

# 3. 构建并启动
docker-compose up -d --build

# 4. 查看日志
docker-compose logs -f app
```

## 架构

```
┌────────────────────────────────────┐
│          emfield-app               │
│  ┌────────────┐  ┌──────────────┐  │
│  │ Go Backend │  │  AI Service  │  │
│  │   :8080    │←→│   :8001      │  │
│  └────────────┘  └──────────────┘  │
│        ↑          ┌────────────┐  │
│        └──────────│  Sim Svc   │  │
│                   │   :8002    │  │
│                   └────────────┘  │
│         supervisord                │
└───────────────┬────────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
  MySQL      MinIO      LLM API
 (外部)      (外部)     (外部)
```

## 端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 8080 | 后端 API | 对外暴露 |
| 8001 | AI 服务 | 仅内部通信 |
| 8002 | 仿真服务 | 仅内部通信 |

## 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `DB_DSN` | ✅ | 数据库连接字符串 |
| `LLM_API_KEY` | ✅* | AI 功能需要 |
| `JWT_SECRET` | ✅ | JWT 签名密钥 |
| `AI_ENABLED` | ❌ | 是否启用 AI (默认 true) |
| `SIM_ENABLED` | ❌ | 是否启用仿真服务 (默认 true) |
| `SIM_BASE_URL` | ❌ | 后端访问仿真服务地址 |
| `MINIO_*` | ❌ | 文件存储配置 |

## 禁用 AI 服务

```bash
AI_ENABLED=false docker-compose up -d
```

## 禁用仿真服务

```bash
SIM_ENABLED=false docker-compose up -d
```

## 使用外部数据库

修改 `docker-compose.yml`，移除 `mysql` 服务，并更新 `DB_DSN`。

## 健康检查

```bash
curl http://localhost:8080/healthz
```
