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

## 4. 企业微信 OAuth 登录（可选）
在 `deploy/.env` 配置以下变量，并重启后端：
- `WECOM_CORPID`
- `WECOM_AGENTID`
- `WECOM_SECRET`

前端在企业微信内置浏览器中会显示“企业微信授权登录”入口；授权成功后，后端会按 `wecom_user_id` 自动创建本地用户（默认 `student` 角色，可在数据库中调整）。

> 提示：企业微信侧需要配置应用与授权回调域名（redirect_uri 白名单）；原型阶段也可直接使用账号密码登录，不依赖企业微信配置。

## 5. Go 依赖下载问题（可选）
若 `go mod tidy` 在网络环境下拉取失败，可临时使用：
```bash
export GOSUMDB=off
export GOPROXY=https://goproxy.cn,direct
```
