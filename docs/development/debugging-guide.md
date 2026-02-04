# 调试指南

## 1. 后端（Go）

- 日志：优先在关键链路（鉴权、AI 网关、仿真网关）增加结构化日志
- 本地运行：`go run cmd/server/main.go`
- 常用检查：`/healthz`、数据库连通性、CORS

## 2. Web 前端（React）

- 使用浏览器 DevTools（Network/Console/Performance）
- 本地运行：`npm -w frontend-react run dev`
- 重点关注：鉴权 token、SSE 流式输出、跨域与代理

## 3. AI/仿真服务（Python）

- 本地运行：`uvicorn app.main:app --reload --port 8001/8002`
- 重点关注：请求 schema 校验、工具调用入参、错误堆栈与超时

