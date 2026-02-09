# 故障排查

## 1. 服务无法启动

- 检查端口占用
- 检查 `code/.env` 配置是否完整
- 查看容器日志：`docker compose logs -f <service>`

## 2. AI 服务不可用

- 检查 `LLM_BASE_URL/LLM_API_KEY` 是否正确
- 检查网络连通性与上游限流

## 3. NPU 部署相关问题

### 3.1 模型加载失败
- 检查硬件是否支持目标模型档位（参考 [NPU 分层部署策略](./npu-tiered-deployment.md)）
- 验证量化格式与平台工具链兼容性
- 检查内存预算是否充足

### 3.2 多模态请求失败
- 确认 `AI_MULTIMODAL_ENABLED=true`
- 检查 `LLM_*_VL_*` 配置是否正确
- 验证 `model_family` 参数是否为 `qwen3_vl` 或 `auto`

### 3.3 路由回退异常
- 确认仅同模型家族支持 local -> cloud fallback
- 检查 `X-AI-Gateway-Token` 与 `AI_GATEWAY_SHARED_TOKEN` 配置

## 4. 相关文档

- [NPU 分层部署策略](./npu-tiered-deployment.md)
- [配置说明](./configuration.md)
- [AI 模型部署](./ai-model-deployment-guide.md)

