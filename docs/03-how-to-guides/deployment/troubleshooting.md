# 故障排查

## 1. 服务无法启动

- 检查端口占用
- 检查 `code/.env` 配置是否完整
- 查看容器日志：`docker compose logs -f <service>`

## 2. AI 服务不可用

- 检查 `LLM_BASE_URL/LLM_API_KEY` 是否正确
- 检查网络连通性与上游限流

