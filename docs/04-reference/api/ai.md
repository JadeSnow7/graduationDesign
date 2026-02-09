# AI 服务接口

本文件描述后端对外提供的 AI 接口（`/api/v1/ai/*`）。这些接口由 Go 后端鉴权后转发到 AI Service（`code/ai_service`）。

> 写作课的“写作提交/统计/反馈”属于写作模块接口（如 `/api/v1/courses/{courseId}/writing`），详见 `docs/04-reference/api/openapi.yaml`。

## 权限要求

- `ai:use`（后端中间件校验）

## 对话模式（mode）

`mode` 会透传给 AI Service；支持通过追加 `_rag` 后缀启用 GraphRAG（例如 `tutor_rag`、`grader_rag`）。

常用模式（写作课试点）：

| mode | 说明 | 典型用途 |
|------|------|----------|
| `tutor` | 通用答疑/解释 | 写作规范解释、概念澄清 |
| `grader` | 批改/反馈 | 按 rubric 给出结构化建议（不直接代写） |
| `polish` | 学术英文润色 | 结构化 JSON 输出（便于前端展示与对比） |

课程专属示例模式（可选）：
| mode | 说明 |
|------|------|
| `formula_verify` / `sim_tutor` / `problem_solver` | 仿真/计算类课程示例能力 |

## 1) AI 对话

**接口地址**：`POST /api/v1/ai/chat`

**请求参数**：
```json
{
  "mode": "tutor",
  "messages": [
    { "role": "user", "content": "如何写出清晰的 thesis statement？" }
  ],
  "stream": false
}
```

**响应（非流式）**：
```json
{
  "success": true,
  "data": {
    "reply": "……",
    "model": "qwen-plus"
  }
}
```

### 流式响应（SSE）

当 `stream=true` 时，后端会把 AI Service 的 SSE 数据流原样透传给客户端：
- 每条事件形如：`data: { ...json... }\n\n`
- 客户端应累积 `content` 字段（部分模型可能同时返回 `reasoning` 字段）
- 结束事件通常为：`data: {"type":"done"}`

## 1.5) AI 多模态对话

**接口地址**：`POST /api/v1/ai/chat/multimodal`

> 兼容策略：`/api/v1/ai/chat` 保持不变；多模态能力通过新增端点提供。  
> 该端点默认受 `AI_MULTIMODAL_ENABLED=false` 控制，未启用时返回 `FEATURE_DISABLED`。

**请求参数**：
```json
{
  "mode": "tutor",
  "model_family": "auto",
  "messages": [
    {
      "role": "user",
      "content": "请解释图中结构",
      "parts": [
        { "type": "image_url", "url": "https://example.com/figure.png" }
      ]
    }
  ],
  "stream": false
}
```

`model_family` 取值：
- `auto`：默认；当请求包含 `image_url/video_url` 时自动路由到 `qwen3_vl`
- `qwen3`：强制文本模型
- `qwen3_vl`：强制视觉模型

**路由规则：**
- `model_family=auto` + `needs_vision=true` → `qwen3_vl`
- `model_family=auto` + `needs_vision=false` → `qwen3`
- `model_family=qwen3` + `needs_vision=true` → 返回错误 `MODEL_NOT_SUPPORT_VISION`
- 多模态失败不跨家族回退（详见 [模型路由策略](../../05-explanation/ai/model-routing-policy.md)）

**错误码：**
| 错误码 | 场景 | HTTP 状态码 |
|---|---|---|
| `FEATURE_DISABLED` | `AI_MULTIMODAL_ENABLED=false` | 403 |
| `MODEL_NOT_SUPPORT_VISION` | 文本模型收到视觉请求 | 400 |
| `UPSTREAM_UNAVAILABLE` | 推理服务不可达 | 503 |

**响应（非流式）**：
```json
{
  "success": true,
  "data": {
    "reply": "……",
    "model": "qwen3-vl"
  }
}
```

## 2) AI 对话（带工具调用）

**接口地址**：`POST /api/v1/ai/chat_with_tools`

**请求参数**：
```json
{
  "mode": "tutor",
  "messages": [
    { "role": "user", "content": "请把这段话改成更学术的语气，并指出主要修改点。" }
  ],
  "enable_tools": true,
  "max_tool_calls": 3
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "reply": "……",
    "model": "qwen-plus",
    "tool_calls": [
      { "name": "evaluate_expression", "arguments": { "expression": "..." } }
    ],
    "tool_results": [
      { "name": "evaluate_expression", "success": true, "result": { "value": 1 } }
    ]
  }
}
```

> 工具集合与执行器见 `code/ai_service/app/tools.py`。写作课建议扩展“字数/结构/引用格式检查”等可验证工具（见 `docs/05-explanation/ai/tool-calling.md`）。

## 3) 引导式学习（guided）

**接口地址**：`POST /api/v1/ai/chat/guided`

后端会注入 `user_id`（来自 JWT），客户端无需传入。

**请求参数**：
```json
{
  "session_id": "",
  "topic": "如何写好文献综述的段落结构",
  "course_id": "1",
  "messages": [
    { "role": "user", "content": "我写综述总像在罗列文献，应该怎么改？" }
  ]
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "reply": "……",
    "session_id": "7c3e6f8e-....",
    "current_step": 0,
    "total_steps": 4,
    "progress_percentage": 0,
    "weak_points": ["逻辑连接", "文献综合"],
    "citations": [],
    "tool_results": [],
    "model": "qwen-plus",
    "learning_path": [
      { "step": 1, "title": "……", "description": "……", "completed": false }
    ]
  }
}
```

更多机制说明见 `docs/05-explanation/ai/guided-learning.md`。

## 相关文档

- [模型路由策略](../../05-explanation/ai/model-routing-policy.md) - 路由规则与 fallback 边界
- [NPU 分层部署策略](../../03-how-to-guides/deployment/npu-tiered-deployment.md) - 端侧部署配置
- [OpenAPI 定义](./openapi.yaml) - 完整的 API 契约定义
