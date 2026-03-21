# 前端 API 契约设计规范与目标列表（重构基准版）

> 本文档基于前端重构最佳实践，对原版 `openapi.yaml` 提出规范化约束。前端侧的所有 API 调用及类型定义，均应**强制遵循**以下契约规范。此文档作为后端重构与前端重写的**唯一基准**。

---

## 一、 前端契约全局规范 (P0 级强制要求)

### 1. 统一响应壳 (Response Envelope)
前端封装 `apiClient` 必须能够统一拦截处理以下结构，不允许出现“不带壳直接返回 data”的情况。
```typescript
interface ApiResponse<T> {
  code: "0" | string; // 只有 "0" 代表成功响应，其他全为错（不使用 SUCCESS 等随意值）
  message: string;    // 面向用户的明文提示
  data: T | null;     // 核心业务数据，无返回值时约定传 null（如 ApiResponse<null>）
  request_id: string; // 链路追踪 ID，前端上报错误时带上
  timestamp: string;  // 必须使用 ISO 8601 格式
}
```

### 2. 统一分页结构 (Pagination)
所有列表查询必须支持分页，并返回标准分页结构，方便前端提取 `usePaginatedQuery` hook。
```typescript
interface PaginatedResponse<T> {
  items: T[];         // 数据列表
  total: number;      // 总条数
  page: number;       // 当前页码 (1-based)
  page_size: number;  // 每页条数
  total_pages: number;// 明确回传总页数（降低前端计算复杂度）
  has_more: boolean;  // 是否还有下一页 (瀑布流必须)
}
```

### 3. 统一错误处理 (Error Scheme)
不要将业务错误混在 `data` 中。HTTP Status 驱动 + 业务 `code` 细分。
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>; // 例如表单校验失败的字段明细 { "title": "必填" }
  request_id: string;
}
```
**基础 HTTP 状态约定：**
- `401 Unauthorized`：未登录或 Token 过期（前端触发登出或静默刷新）
- `403 Forbidden`：权限不足
- `404 Not Found`：资源不存在
- `409 Conflict`：状态冲突（如：作业已截止不允许提交）
- `422 Unprocessable Entity`：参数校验失败
- `429 Too Many Requests`：限流

### 4. 统一命名与格式
- **路径风格**：强制使用 `kebab-case`，杜绝 `snake_case`（即 `/chat-with-tools` 而不是 `/chat_with_tools`）。
- **参数命名**：
  - URL Path 参数：一律 `camelCase` (例如 `/courses/{courseId}`)。
  - JSON 字段与 Query 参数：API 传输层全局统一为 `snake_case`。**特别建议**：前端在 Domain/UI 层维持 `camelCase`，由网络层 API Adapter 负责蛇形/驼峰双向转换。
- **查询、排序与幂等**：
  - 列表接口强制支持排序约束参数：`?sort_by=created_at&sort_order=desc` 等。
  - 搜索参数统一为：`?keyword=XXX`（不要混用 q/search）。
  - 创建或高敏变更接口要求携带 `Idempotency-Key` (UUID)，比如作业提交/结算等场景避免重复提交。
- **ID 字段**：实体内部一律叫 `id`，外键引用一律叫 `[entity]_id`（如 `course_id`）。
- **时间与空值**：
  - 强制所有时间为 ISO 8601（例如 `2026-03-20T19:30:00Z`）。
  - 支持乐观更新实体，默认带 `updated_at` 字段，冲突处理推荐携带 `version` 以协助并发控制。
  - 字段要么不传，要么对空值严格返回并传递 `null`，禁止混用空字符串与缺省。

---

## 二、 核心领域 API 列表 (按前端重构结构划分)

> 规则提示：减少动作后缀，优先采用 RESTful 资源化；嵌套路径用于鉴权归属，RequestBody 中**不再重复传** path 中已包含的 ID。

### 1. Auth 认证与当前用户态 (Auth / Me Profile)

独立出明确的 `/me` 前缀，与后台管理的 `/users` 彻底区分。

| 接口路径 | 方法 | 说明 | 核心 Query / Body | 返回 `data` |
|---|---|---|---|---|
| `/auth/login` | POST | 账号密码登录 | `{ username, password }` | `{ access_token, refresh_token, expires_in, user }` |
| `/auth/refresh` | POST | 刷新 Token | `{ refresh_token }` | `{ access_token, refresh_token, expires_in }` |
| `/auth/logout` | POST | 退出登录 | - | `null` |
| `/me` | GET | 获取当前用户完整画像 | - | `{ id, username, name, avatar_url, role, permissions, org_id... }` |
| `/me/dashboard` | GET | 个人学习看板聚合 | - | 聚合统计（聚合接口，未来随需求可细化接口拆分调用） |
| `/me/knowledge-bases` | GET | 我的知识库列表 | `?page, page_size, keyword, sort_by` | `PaginatedResponse<KnowledgeBase>` |
| `/me/courses` | GET | 面向当前身份关联的课程 | `?role, status, semester` | `PaginatedResponse<Course>` |

### 2. Course 课程与教学单元 (Course / Chapter)

| 接口路径 | 方法 | 说明 | 核心 Query / Body | 返回 `data` |
|---|---|---|---|---|
| `/courses` | GET | 面向全集发现/课程市场 | `?page, page_size, keyword, semester` | `PaginatedResponse<Course>` |
| `/courses` | POST | 创建课程 (教学端) | `{ name, code, semester }` | `Course` |
| `/courses/{courseId}` | PATCH | 更新课程 (教学端) | `{ name, description... }` | `Course` |
| `/courses/{courseId}` | GET | 获取课程元信息 | - | `Course` |
| `/courses/{courseId}/chapters` | GET | 该课程章节树 | - | `Chapter[]` (通常无分页) |
| `/courses/{courseId}/chapters` | POST | 创建章节 (教学端) | `{ title, order_num... }` | `Chapter` |
| `/chapters/{chapterId}` | GET/PATCH/DELETE| 章节操作 | PATCH: `{ title... }` | `Chapter` / `null` |
| `/courses/{courseId}/announcements` | GET/POST| 公告列/发 (教学端) | GET: `?page` POST: `{ title... }` | `PaginatedResponse<Announcement>` / `Announcement` |

### 3. Assignment 核心作业流 (Assignments / Submissions)

修复重构痛点：抽离 Submission 模型，明确状态。
**Assignment 状态**：`draft` \| `published` \| `closed`
**Submission 状态**：`submitted` \| `grading` \| `graded` \| `returned`

| 接口路径 | 方法 | 说明 | 核心 Query / Body | 返回 `data` |
|---|---|---|---|---|
| `/courses/{courseId}/assignments` | GET | 课程作业列表 | `?status=published, keyword` | `PaginatedResponse<Assignment>` |
| `/assignments/{assignmentId}` | GET | 作业详情 | - | `Assignment` |
| `/assignments/{assignmentId}/submissions/me`| GET | **学生端**查自己提交 | - | `Submission` |
| `/assignments/{assignmentId}/submissions`| GET | **教师端**查全班提交 | `?status, page, sort_by` | `PaginatedResponse<Submission>` |
| `/assignments/{assignmentId}/submissions`| POST | 提交作业 (学生) | Header: `Idempotency-Key` (幂等) | `Submission` |
| `/submissions/{submissionId}/grading` | POST/PATCH| 批改作业 (教师) | POST创建，PATCH修改反馈（支持草稿、覆盖打分） | `Submission` |

### 4. Quiz 核心测验流 (Quizzes / Attempts)

采用 Attempt 模型设计，支持断点续答与自动保存。

| 接口路径 | 方法 | 说明 | 核心 Query / Body | 返回 `data` |
|---|---|---|---|---|
| `/courses/{courseId}/quizzes` | GET | 测验列表 | `?status, keyword` | `PaginatedResponse<Quiz>` |
| `/quizzes/{quizId}` | GET | 测验详情 (含题目) | - | `{ quiz, questions[] }` |
| `/quizzes/{quizId}/attempts` | POST | 发起答卷挑战 | - | `Attempt` (含 attempt_id) |
| `/quiz-attempts/{attemptId}` | GET | 恢复答卷详情 | - | `{ attempt, answers, elapsed_time }` |
| `/quiz-attempts/{attemptId}/answers` | PATCH | （自动）保存答案片段 | `{ answers: { qID: ans } }` (局部覆盖，非全量覆盖) | `null` 或简略状态 |
| `/quiz-attempts/{attemptId}/submit` | POST | 最终交卷 | Header: `Idempotency-Key` | `{ score, max_score, attempt }` |

### 5. AI Native 服务流 (Session / Runs)

废弃散落的 `/chat` 端点，采用标准 Agent Session 协议建模，前端更容易管理会话生命周期与流式状态。
**流式规范**：强制采用 `text/event-stream` (SSE)，标准事件定义如下（这对于前端实现流式阅读器极为关键）：
```typescript
type AiStreamEvent = 
  | { event: "token"; data: { text: string } }
  | { event: "tool_call"; data: { tool_name: string, arguments: Record<string, any>, call_id: string } }
  | { event: "error"; data: { code: string, message: string } }
  | { event: "done"; data: { run_id: string, usage?: { prompt_tokens: number, completion_tokens: number } } };
```

| 接口路径 | 方法 | 说明 | 核心 Query / Body | 返回 `data` |
|---|---|---|---|---|
| `/ai/sessions` | POST | 创建新 AI 会话 | `{ mode, system_prompt_overrides }` | `{ session_id, ... }` |
| `/ai/sessions/{sessionId}/messages` | GET | 历史消息记录 | `?cursor, limit` | `PaginatedResponse<Message>` |
| `/ai/sessions/{sessionId}/runs` | POST | 发起对话/调用流 | `{ input: Message[], tools: ToolSpec[], stream: true }` | **SSE Stream** |

### 6. Writing 智能写作流 (Writing-Submissions / Revisions)

增加草稿与 AI 版本控制，支撑起完整的学术写作工作台产品体验。
**状态**：`draft` \| `submitted` \| `reviewed`

| 接口路径 | 方法 | 说明 | 核心 Query / Body | 返回 `data` |
|---|---|---|---|---|
| `/courses/{courseId}/writing-submissions`| POST | 开始一篇新写作 | `{ title, writing_type }` | `WritingSubmission` |
| `/writing-submissions/{id}` | GET/PATCH | 读取/自动保存草稿 | `{ content, word_count }` | `WritingSubmission` |
| `/writing-submissions/{id}/ai-feedback`| POST | 主动发起 AI 批阅 | `{ target_dimensions }` | `{ overall_score, summary, dimensions: [{ key, label, score, comment, suggestions }], inline_suggestions }` |
| `/writing-submissions/{id}/revisions` | GET | 历史版本对比 | `?page, page_size` | `PaginatedResponse<Revision>` |

### 7. Global 基础设施 (Uploads / Config / Tracking)

| 接口路径 | 方法 | 说明 | 核心 Query / Body | 返回 `data` |
|---|---|---|---|---|
| `/uploads` | POST | 统一文件上传中心 | FormData (`file`), `?scope=course\|assignment` | `{ file_id, file_name, file_size, mime_type, url, created_at }` |
| `/me/ai-config` | GET/PATCH | 用户 AI 偏好 | PATCH: `{ default_mode... }` | `{ default_mode, model_family, has_api_key }` (不回传明文Key)|
| `/tracking/events` | POST | 前端行为埋点 (非业务资源) | `{ actor_id, event_type, target_type, target_id, occurred_at, payload }` | `null` |

### 8. Simulation 仿真工作台 (Jobs)
废除前端同步透传，高频仿真计算实体化，采用标准异步 Job 轮询。
**Job 状态**：`queued` \| `running` \| `succeeded` \| `failed` \| `cancelled`

| 接口路径 | 方法 | 说明 | 核心 Query / Body | 返回 `data` |
|---|---|---|---|---|
| `/simulations` | POST | 发起仿真计算 | `{ type, grid_resolution, ... }` | `{ job_id, status }` |
| `/jobs/{jobId}` | GET | 查询任务进度 | - | `{ id, status, progress, error, result: {} }` |

---

## 三、 重构落地建议 (Next Steps)

1. **类型生成**：前端应依据本约束结构（特别是 `ApiResponse` 与 `PaginatedResponse` 泛型），重写或配置 `openapi-typescript` 等生成工具。
2. **拦截器调整**：前端 Axios/Fetch 响应拦截器，统一 `res.data.code !== "0"` 的错误 Toast 提示逻辑。
3. **Mock Server 升级**：针对 `Assignment` 和 `Quiz`，应建立带状态机的 Mock 数据流，以便 UI 完成全部闭环开发。
