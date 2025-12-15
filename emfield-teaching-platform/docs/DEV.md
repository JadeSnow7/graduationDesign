# 开发说明

## 1. 一键启动（推荐）
```bash
cp deploy/.env.example deploy/.env
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d --build
```

## 2. 访问与演示账号
- 后端：`http://localhost:8080/healthz`
- AI：`http://localhost:8001/healthz`
- 仿真：`http://localhost:8002/healthz`
- 前端开发：`cd frontend && npm install && npm run dev`

默认演示账号（首次启动且数据库为空时自动创建）：
- `admin/admin123`
- `teacher/teacher123`
- `student/student123`

## 3. 上游大模型配置
在 `deploy/.env` 填写：
- `LLM_BASE_URL`：兼容 OpenAI 的 base url（例如 `https://dashscope.aliyuncs.com/compatible-mode`）
- `LLM_API_KEY`：密钥
- `LLM_MODEL`：模型名（例如 `qwen-plus`）

## 4. Go 依赖下载问题（可选）
若 `go mod tidy` 在网络环境下拉取失败，可临时使用：
```bash
export GOSUMDB=off
export GOPROXY=https://goproxy.cn,direct
```

