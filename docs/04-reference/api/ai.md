# AI 服务接口

本文件描述后端对外提供的 AI 接口（`/api/v1/ai/*`）。这些接口由 Go 后端鉴权后转发到 AI Service（`code/ai_service`）。

> 写作课的“写作提交/统计/反馈”属于写作模块接口（如 `/api/v1/courses/{courseId}/writing`），详见 `docs/api/swagger.yaml`。

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

