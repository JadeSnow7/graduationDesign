# Docker 部署

## 1. 本地一键启动（推荐）

```bash
cd code
docker compose up -d --build
```

## 2. 生产形态（含 Nginx）

参考 `code/deployment/docker/docker-compose.prod.yml` 与 `code/deployment/docker/nginx/`。

