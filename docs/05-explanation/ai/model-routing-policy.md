# 模型路由策略（权威说明）

> 本文档定义 AI Service 的模型路由规则、fallback 边界与 vLLM 定位，作为唯一权威参考。

## 1. 路由决策表（固定规则）

| 场景 | `model_family` 参数 | `needs_vision` | 路由结果 |
|---|---|---|---|
| 纯文本请求 | `qwen3` | false | qwen3 文本模型 |
| 纯文本请求 | `qwen3_vl` | false | qwen3-vl 视觉模型（可处理纯文本） |
| 纯文本请求 | `auto` | false | qwen3 文本模型 |
| 多模态请求 | `qwen3` | true | **错误**：qwen3 不支持视觉 |
| 多模态请求 | `qwen3_vl` | true | qwen3-vl 视觉模型 |
| 多模态请求 | `auto` | true | qwen3-vl 视觉模型 |

**关键约束：**
- `needs_vision=true` 时，必须路由到支持视觉的模型（qwen3-vl）
- 多模态失败**不跨家族回退**（不会降级到纯文本模型返回答案）
- `model_family=auto` 时，根据 `needs_vision` 自动选择同家族模型

## 2. Fallback 策略（同家族限定）

### 2.1 允许的 Fallback

仅支持**同模型家族**内的 `local -> cloud` 回退：

```
qwen3 (local) 失败 -> qwen3 (cloud)
qwen3-vl (local) 失败 -> qwen3-vl (cloud)
```

### 2.2 禁止的 Fallback

以下回退**不会发生**：

```
❌ qwen3-vl -> qwen3（跨能力降级）
❌ qwen3 -> qwen3-vl（跨能力升级）
❌ qwen3 -> 其他家族模型
```

### 2.3 Fallback 触发条件

- 上游推理服务不可达（连接超时、5xx 错误）
- 模型加载失败（OOM、模型文件损坏）
- **不包括**：业务逻辑错误（4xx）、内容安全拒绝

## 3. vLLM 定位与职责边界

### 3.1 vLLM 的角色

vLLM 是**推理引擎**，负责：
- 模型加载与推理加速
- OpenAI-compatible API 暴露
- 批处理与并发管理

### 3.2 vLLM 不负责

- ❌ 业务路由决策（由 AI Service 决定）
- ❌ 多模态能力检测（由 AI Service 根据 `needs_vision` 判断）
- ❌ Fallback 逻辑（由 AI Service 管理）

### 3.3 部署建议

如果同时部署 qwen3 和 qwen3-vl：

```env
# 文本模型
LLM_BASE_URL_LOCAL_TEXT=http://vllm-text:8000/v1
LLM_MODEL_LOCAL_TEXT=qwen3

# 视觉模型
LLM_BASE_URL_LOCAL_VL=http://vllm-vl:8001/v1
LLM_MODEL_LOCAL_VL=qwen3-vl
```

使用**独立的 vLLM 实例**和**不同的模型名映射**，避免单实例混合部署。

## 4. 配置变量映射

### 4.1 新变量（推荐）

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
```

### 4.2 旧变量（兼容）

```env
# 仅用于纯文本场景，多模态场景需使用新变量
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
```

**迁移建议：**
- 新部署优先使用 `LLM_*_TEXT_*` / `LLM_*_VL_*`
- 旧变量保留用于向后兼容，但不支持多模态路由

## 5. 错误码与开关行为

### 5.1 多模态开关

```env
AI_MULTIMODAL_ENABLED=false  # 默认关闭
```

- `false`：`/api/v1/ai/chat/multimodal` 返回 `FEATURE_DISABLED`
- `true`：启用多模态端点与路由

### 5.2 常见错误码

| 错误码 | 场景 | 说明 |
|---|---|---|
| `FEATURE_DISABLED` | `AI_MULTIMODAL_ENABLED=false` | 多模态功能未启用 |
| `MODEL_NOT_SUPPORT_VISION` | `model_family=qwen3` + `needs_vision=true` | 模型不支持视觉 |
| `UPSTREAM_UNAVAILABLE` | 推理服务不可达 | 触发 fallback（如配置） |
| `MODEL_LOAD_FAILED` | 模型加载失败 | 触发 fallback（如配置） |

## 6. 审计字段

每次请求记录以下字段用于追踪：

```json
{
  "model_family_requested": "auto",
  "model_family_resolved": "qwen3_vl",
  "needs_vision": true,
  "route": "local",
  "fallback_occurred": false
}
```

## 7. 相关文档

- [NPU 分层部署策略](../../03-how-to-guides/deployment/npu-tiered-deployment.md)
- [AI API 参考](../../04-reference/api/ai.md)
- [配置说明](../../03-how-to-guides/deployment/configuration.md)
- [Qwen3/Qwen3-VL 迁移基线](./qwen3-vl-migration-baseline-2026-02-09.md)
