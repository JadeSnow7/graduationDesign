# NPU 分层部署策略（8B / 1.7B）

> 面向不同端侧 NPU 能力，给出固定模型分层、配置映射、灰度与回滚策略。

## 1. 适用范围

- 仅覆盖部署策略与配置映射，不修改运行时代码。
- 模型业务路由仍由 AI Service 决策，本文只定义“端侧默认模型档位”。
- 本策略与 `AI_MULTIMODAL_ENABLED`、`model_family`、`privacy/route` 机制并行生效。

## 2. 硬件分层（锁定）

| 端侧平台 | 默认模型档位 | 推荐用途 |
|---|---|---|
| Apple M4 | 8B | 高质量文本生成、多轮对话 |
| Intel Core Ultra 388H | 8B | PC 端本地推理 |
| AMD AI H395 | 8B | PC 端本地推理 |
| 天玑 9500 | 1.7B | 移动端低时延问答 |
| 骁龙 8E Gen5 | 1.7B | 移动端低功耗推理 |

> 本表为当前阶段固定策略，不在运行时自动识别芯片型号。

## 3. 模型包与量化建议

| 档位 | 建议量化 | 目标 |
|---|---|---|
| 8B | 4-bit/8-bit（按平台工具链） | 兼顾质量与端上可运行性 |
| 1.7B | 4-bit 优先 | 优先首 token 时延与能耗 |

补充建议：

- 多模态需要视觉模型时，优先使用同档位 `qwen3_vl`。
- 端上资源不足时，不跨家族降级成文本模型直接作答，避免语义漂移。

## 4. 配置映射（`code/.env`）

```env
# 文本模型（local/cloud）
LLM_BASE_URL_LOCAL_TEXT=
LLM_API_KEY_LOCAL_TEXT=
LLM_MODEL_LOCAL_TEXT=qwen3
LLM_BASE_URL_CLOUD_TEXT=
LLM_API_KEY_CLOUD_TEXT=
LLM_MODEL_CLOUD_TEXT=qwen3

# 视觉模型（local/cloud）
LLM_BASE_URL_LOCAL_VL=
LLM_API_KEY_LOCAL_VL=
LLM_MODEL_LOCAL_VL=qwen3-vl
LLM_BASE_URL_CLOUD_VL=
LLM_API_KEY_CLOUD_VL=
LLM_MODEL_CLOUD_VL=qwen3-vl

# 开关
AI_MULTIMODAL_ENABLED=false
RERANKER_ENABLED=false
```

## 5. 失败与回退策略

1. 多模态端点中，视觉请求失败时不自动切文本模型给最终答案。
2. 仅允许同模型家族 `local -> cloud` fallback。
3. `public/cloud/auto` 仍受可信网关限制：`X-AI-Gateway-Token` + `AI_GATEWAY_SHARED_TOKEN`。

## 6. 灰度上线建议

1. 先合入配置与文档，保持 `AI_MULTIMODAL_ENABLED=false`。
2. 开发环境开启多模态，验证 `qwen3`/`qwen3_vl` 路由命中。
3. 预发布按设备池分批验证 8B/1.7B 档位。
4. 生产小流量开启，监控错误率与延迟。
5. 异常时先关 `AI_MULTIMODAL_ENABLED`，不需要回滚代码。

## 7. 验证清单

- 纯文本请求：`/api/v1/ai/chat/multimodal` 路由 `qwen3`。
- 含 `image_url/video_url`：路由 `qwen3_vl`。
- 多模态失败：不跨家族降级成功返回。
- 审计字段齐全：`model_family_requested`、`model_family_resolved`、`needs_vision`。

## 相关文档

- [模型路由权威说明](../../05-explanation/ai/model-routing-policy.md)
- [AI 模型训练与部署指南](./ai-model-deployment-guide.md)
- [配置说明](./configuration.md)
