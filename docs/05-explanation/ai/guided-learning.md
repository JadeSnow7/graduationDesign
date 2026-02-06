# 引导式学习（Guided Learning）

本项目提供 `guided` 引导式学习能力：系统先为一个学习主题生成 3–6 步的学习路径（learning path），随后通过**苏格拉底式提问**引导学生逐步完成每一步；在会话中记录学习进度与薄弱点，并可结合 GraphRAG 引用与工具调用提升可追溯性与可验证性。

> 写作课示例：从“选题与研究问题”开始，引导学生完成 thesis statement、段落结构、证据/引用规范与摘要写作等步骤。

---

## 1. 接口位置

### 1.1 后端网关接口（推荐：带鉴权）

- `POST /api/v1/ai/chat/guided`
- 后端会注入 `user_id`（来自 JWT）并转发到 AI Service。

### 1.2 AI Service 直连接口（开发/联调）

- `POST /v1/chat/guided`

代码入口：`code/ai_service/app/main.py`

---

## 2. 请求/响应（核心字段）

请求关键字段：
- `session_id`：继续已有会话；为空则创建新会话
- `topic`：新会话学习主题（可选；不填会从首条用户消息抽取）
- `messages`：对话历史（至少 1 条 user 消息）
- `course_id`：可选，供 RAG/ACL 使用

响应关键字段：
- `session_id`：会话标识（用于续聊）
- `current_step/total_steps/progress_percentage`：学习路径进度
- `weak_points`：会话内检测到的薄弱点概念（用于学习档案）
- `citations`：结构化引用（当启用 GraphRAG）
- `tool_results`：工具调用结果（当启用工具调用）
- `learning_path`：学习路径结构（用于前端渲染进度条/步骤卡片）

---

## 3. 机制说明（与论文表述对齐）

1. **学习路径生成**：首轮由模型输出 JSON 学习路径（目标/预计时长/steps），系统解析后写入会话状态。
2. **逐步引导**：每轮只提出一个关键问题，避免一次性给出完整答案；学生回答正确则推进下一步。
3. **薄弱点记录**：对 AI 的纠错/提示语句做轻量检测，提取概念薄弱点（写作课可关注“逻辑连接/引用规范/论点展开”等）。
4. **RAG 与引用**：启用 GraphRAG 时将“证据片段 + 引用编号”注入 system message，要求回答标注 `[1][2]` 并在证据不足时追问/拒答。
5. **工具调用（可选）**：当步骤需要精确验证（例如字数/结构要素/格式检查，或仿真/数值计算）时可触发工具调用并回注结果。

---

## 4. 配置建议

- GraphRAG 开关：`GRAPH_RAG_ENABLED=true`
- 索引路径：`GRAPH_RAG_INDEX_PATH=app/data/graphrag_index.json`
- 薄弱点概念域：`WEAK_POINT_DOMAIN=writing`（默认）或 `WEAK_POINT_DOMAIN=emfield`
- 会话 TTL：当前为内存会话（默认 2 小时）；生产环境建议迁移到 Redis/DB（见 `code/ai_service/app/session.py` 注释）。
