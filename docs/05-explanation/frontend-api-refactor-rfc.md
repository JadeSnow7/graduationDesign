# [RFC] Web 前端 API 契约设计规范 (重构基准版)

> **状态定义**：FINAL DRAFT / 实施基准  
> **面向对象**：前端架构组、后端 API 研发组  
> **核心目标**：统一前后端对齐的资源模型、强制响应外壳、规范网络状态流转，作为前端 `apiClient`、Query Hooks、UI 状态机的代码生成与手写基准。

---

## 一、 全局传输与响应壳规范 (P0 强制)

### 1.1 精确的响应模型 (Response Envelope)

HTTP 请求的响应体强制包装，前端 `apiClient` 只需处理 `ApiResponse<T>` 和 `PaginatedResponse<T>` 两个基准泛型。

```typescript
// 1. 业务状态码：成功【唯一】合法值为 "0"
type ApiSuccessCode = "0";
type ApiBusinessCode = string; // 其他任意非 "0" 字符串均视为业务错误

// 2. 基础响应壳
interface ApiResponse<T> {
  code: ApiSuccessCode | ApiBusinessCode;
  message: string;          // 面向用户的明文提示 (如 "操作成功", "余额不足")
  data: T | null;           // 核心业务数据。!!! 无业务返回值时强制传 `null`，不允许缺省或空字符串 !!!
  request_id: string;       // 链路追踪 ID，前端全局 Error Boundary 日志需捕获此字段
  timestamp: string;        // ISO 8601 格式，例如 "2026-03-20T19:30:00Z"
}

// 3. 分页响应壳 (默认应用于所有列表接口)
interface PaginatedResponse<T> {
  items: T[];               // 数据列表
  total: number;            // 匹配条件的总条数
  page: number;             // 当前请求页码 (1-based)
  page_size: number;        // 每页大小
  total_pages: number;      // 总页数 (后端计算回传，减轻前端分页器计算负担)
  has_more: boolean;        // 是否还有下一页 (适用于瀑布流)
}
```

### 1.2 RESTful 路径与 HTTP Method

- **REST 资源化**：尽量减少动作后缀。
- **路径风格**：全局强制使用 `kebab-case`，绝对禁止 `snake_case` (如使用 `/ai/chat-with-tools` 而非 `/ai/chat_with_tools`)。
- **动作约束**：
  - `GET`：读取（注意 `PaginatedResponse` 也是借此返回）
  - `POST`：创建资源，或执行不幂等/非等幂业务流
  - `PATCH`：局部更新核心实体（修改草稿、追加批改、甚至保存部分长表单字段）
  - `DELETE`：删除资源，禁止文档中简写为 `DEL`

### 1.3 字段命名与空值约束

- **网络传输层 (API Client)**：JSON 的 Fields 及 Query Params 全局统一为 `snake_case`。  
  > *建议：前端在网络拦截器层进行转换，使 domain/UI 层维持标准的 `camelCase`。*
- **ID 字段命名**：实体内部的 ID 一律定为 `id`，外键引用一律定为 `[entity]_id`（如 `course_id`）。
- **Null 明确性规则**：
  - **请求体 (Request)**：对于可选字段，前端**可以不传** (undefined)。
  - **响应体 (Response)**：凡是 Schema 标记为 `nullable` 的字段，**空值时必须显式返回 `null`，严禁缺省或无意义的 `""`**。这种强约束将保证前端类型系统稳定。

### 1.4 标准 Query 参数约定 (分页与过滤)

默认所有列表接口必须分页；**树结构、枚举集、有限配置集等可声明为非分页资源例外**。其余所有列表返回均强制遵循以下 Query 签名：

```typescript
// 统一列表查询参数
interface BaseListQuery {
  page?: number;        // 默认 1
  page_size?: number;   // 默认 20
  keyword?: string;     // 全局统一的搜索关键字参数，禁止使用 q, search 等别名
  sort_by?: string;     // 排序依据字段，默认为 created_at
  sort_order?: "asc" | "desc"; // 排序方向，全小写，强制此枚举，禁止使用 ascending, DESC 等变体
}
```

### 1.5 并发控制与幂等性保证

- **乐观更新支持**：所有核心业务实体必定返回 `updated_at` 字段。
- **冲突控制**：对于编辑操作（如 `PATCH /writing-submissions/{id}`），建议附带请求体参数 `version` 以做版本乐观锁校验。
- **强幂等头**：对创建/结算类敏感接口 (如 作业提交、交卷、仿真任务下发、文件中心上传)，前端需附加 Request Header `Idempotency-Key: <UUID>` 规避弱网重复创建重试带来的幽灵记录。

### 1.6 标准错误异常映射 (HTTP Status)

| Status | 说明 | 前端全局拦截器行为 |
|---|---|---|
| `401 Unauthorized` | 未登录 / Token 彻底失效 / Refresh 失败 | 清空会话并踢回登录页 |
| `403 Forbidden` | 当前角色对目标资源无权限操作 | 弹窗阻断或页面级 403 路由跳转 |
| `404 Not Found` | URL / 目标记录不存在 | 提示该内容已被删除或不存在 |
| `409 Conflict` | 业务状态冲突 (如：已截止的作业仍被强制提交) | 展示具体的业务错误信息 |
| `413 Payload Too Large`| 上传文件超体量限制 | 定向提示 `文件体积过大` |
| `422 Unprocessable` | 表单业务级参数验证未通过 | 高亮相关入参表单 |
| `429 Too Many Requests`| 高频限流拦截 | 提示“操作过于频繁” |

> **鉴权流特例标注**：当 `/auth/login` 等签发的 `access_token` 过期触发局部 401 时，前端 API 适配器**应利用长效 `refresh_token` 自动完成由于调用 `/auth/refresh` 构成的静默重连**，重试原请求，如重签失败才执行踢出清空策略。

---

## 二、 服务端领域分域接口字典

### 2.1 Auth 认证与 Profile (`/auth`, `/me`)

分离当前用户业务与后台管理操作。

| 请求方法 | 路径 | 主要说明 | 入/出关键数据 |
|---|---|---|---|
| `POST` | `/auth/login` | 账号登录换取令牌对 | In: `{ username, password }`<br>Out: `{ access_token, refresh_token, expires_in, user }` |
| `POST` | `/auth/refresh` | **静默刷新令牌对** | In: `{ refresh_token }`<br>Out: 同 Login |
| `POST` | `/auth/logout` | 清理服务端凭据及状态 | Out: `ApiResponse<null>` |
| `GET` | `/me` | 获取我的完整档案与授权 | Out: `{ id, username, avatar_url, role, permissions, ... }` |
| `GET` | `/me/dashboard` | **首页视窗聚合口** | （因产品演进具备增宽风险，只做为页面首屏聚合加载使用。子功能允许逐步独立 API 请求更新） |
| `GET` | `/me/knowledge-bases` | 我的知识库 (支持列表分页) | Out: `PaginatedResponse<KnowledgeBase>` |
| `GET` | `/me/courses` | **面向当前身份与关联状态**的课程列表集 | Query: `?page, page_size, keyword, role, status, semester, sort_by, sort_order` |

### 2.2 Course 教学大纲树 (`/courses`, `/chapters`, `/announcements`)

> 注意 `/courses` 意为不考虑学生从属关系的**公开集/课程发现**市场。教学管理（创建、更新大纲）的入口一并定义于此。

| 请求方法 | 路径 | 主要说明 | 备注 |
|---|---|---|---|
| `GET` | `/courses` | 公开域寻课 | Query 加入 `?keyword, semester, page...` |
| `GET` | `/courses/{courseId}` | 课程主资料与元信息详情 | - |
| `POST` | `/courses` | **[教学端]** 新录入一门课 | 仅限创建者角色的使用 |
| `PATCH` | `/courses/{courseId}` | **[教学端]** 更新课程描述 | 支持细粒度 `version` 并发更新 |
| `GET` | `/courses/{courseId}/chapters` | 章节全树 (树形集合，无分页) | - |
| `POST` | `/courses/{courseId}/chapters` | **[教学端]** 新录入章节 | 不再从 Body 里塞 `course_id` |
| `GET/PATCH/DELETE`| `/chapters/{chapterId}` | 读取或修改章节节点 | PATCH 支持调整 `order_num` 排序 |
| `GET` | `/courses/{courseId}/announcements`| 课程内公告通知列 | `PaginatedResponse<Announcement>` |
| `POST` | `/courses/{courseId}/announcements`| **[教学端]** 发布公告 | 返回具体发布的 `Announcement` 记录本身 |

### 2.3 Assignment 作业与流程控制

核心明确 `Assignment` (`draft|published|closed`) 与其对应关联提交 `Submission` (`submitted|grading|graded|returned`) 的双轨机制。

| 请求方法 | 路径 | 主要说明 | 备注意见 |
|---|---|---|---|
| `GET` | `/courses/{courseId}/assignments` | 作业流列 | Query: `?status=published&sort_by=deadline` |
| `POST` | `/courses/{courseId}/assignments` | **[教学端]** 颁布作业 | `Idempotency-Key` 保护 |
| `PATCH/DELETE`| `/assignments/{assignmentId}` | **[教学端]** 变更或作废 | 并发修改校验 |
| `GET` | `/assignments/{assignmentId}` | 查收一项具体作业要求 | - |
| `GET` | `/assignments/{assignmentId}/submissions/me` | **[学生端]** 读取本人当前针对该作业的最高次提交 | Out: `Submission` |
| `POST` | `/assignments/{assignmentId}/submissions` | **[学生端]** 上传并提交 | 强制幂等，In: `{ content, file_ids }` |
| `GET` | `/assignments/{assignmentId}/submissions` | **[教师端]** 查全班作答 | 支持按 `status` 及 `keyword` 查询分页 |
| `POST` | `/submissions/{submissionId}/grading` | **[教师端] 创建初评记录** | 首次触发计分流程 |
| `PATCH` | `/submissions/{submissionId}/grading` | **[教师端] 复改/追修打分** | 支持批阅暂存草稿能力。允许调整 rubric 回传。 |

### 2.4 Quiz 考试与测验尝试模型

弃用基于 Quiz 和 Question 散置的状态流转，完全转向基于 `Attempt` 的考试控制以保证数据连续性并引入单题切片保存模型。

| 请求方法 | 路径 | 主要说明 | 入出核心 |
|---|---|---|---|
| `GET` | `/courses/{courseId}/quizzes` | 根据课程取列 | Query: `?status=published` |
| `POST` | `/courses/{courseId}/quizzes` | **[教学端]** 组卷录入 | 包含限时、展示模式约束 |
| `GET/PATCH` | `/quizzes/{quizId}` | 管理考试/查看规则说明 | - |
| `POST` | `/quizzes/{quizId}/attempts` | **发起/恢复一轮真题作答** | 返回新的或现已存活尚未结束的 `Attempt` |
| `GET` | `/quiz-attempts/{attemptId}` | 断线进入答题页查回当前卷进度 | `{ attempt, answers(已存局部), elapsed_time }` |
| `PATCH` | `/quiz-attempts/{attemptId}/answers` | **局部碎片化暂存(节约防灾)** | **仅实施 merge 追加覆盖操作。不得清空 Payload 未发送的已存题目答案**。In: `{ answers: [{ question_id: string, answer: any }] }`。Out: `ApiResponse<null>` |
| `POST` | `/quiz-attempts/{attemptId}/submit` | 交卷 | 强制 `Idempotency-Key` |

*关于答题切片数据类型推演，在后续实现中允许统一映射为对象字典(Map `{[qID: string]: Answer}`) 或标准数组包裹对象(Array `[{question_id, answer}]`)，以后者为扩展上限最优推荐。*

### 2.5 AI 原生互动控制流 (Session / Runs / SSE)

彻底整顿散设于系统各处的 AI 问对接口。聚合封装为基于会话、多模下发、且支持工具回调处理的主通道。

- **`SSE` 通道事件字典协定**
  ```typescript
  // 所有 Server Sent Events 监听分发载荷需依循下述联合态定义：
  type AiStreamEvent = 
    | { event: "token"; data: { text: string } }
    | { event: "message"; data: { message_id: string, role: "assistant", content: string } } // 段落生成闭包信息补充
    | { event: "tool_call"; data: { tool_name: string, arguments: Record<string, any>, call_id: string } }
    | { event: "run_status"; data: { status: "queued" | "running" | "completed" | "failed" } }
    | { event: "error"; data: { code: string, message: string } }
    | { event: "done"; data: { run_id: string, usage?: { prompt_tokens: number, completion_tokens: number } } };
  ```

| 请求方法 | 路径 | 主要说明 | 核心 Query / Body |
|---|---|---|---|
| `POST` | `/ai/sessions` | 构建 AI 隔离视窗 | In: `{ mode, overridden_system_prompt }` |
| `GET` | `/ai/sessions/{sessionId}/messages` | 调阅某窗口记忆消息历史 | Query 走 cursor 控制：`?cursor, limit` |
| `POST` | `/ai/sessions/{sessionId}/runs` | 发起推断指令与思考过程启动 | In: `{ input: Message[], tools?: ToolSpec[], stream: true }`，响应即握手 **`text/event-stream`** |

### 2.6 Writing 写作台工作流

学术写作系统不仅是一个提交网关表单。而是支持多草稿变更、AI批阅下发的流水线工作站。
**核心状态**：`draft` \| `submitted` \| `reviewed`。

| 请求方法 | 路径 | 主要说明 | Payload 与要求 |
|---|---|---|---|
| `POST` | `/courses/{courseId}/writing-submissions` | 新启稿件底盘 | In: `{ title, writing_type }` |
| `GET/PATCH` | `/writing-submissions/{id}` | 读取/并实施文字实时保存修改 | Out 详见 `WritingSubmission` |
| `POST` | `/writing-submissions/{id}/ai-feedback` | 提交给 LLM 分级定评提取反馈 | 强制详细化 JSON Out: `{ overall_score, summary, dimensions: [{ key, label, score, comment, suggestions }], inline_suggestions }` |
| `GET` | `/writing-submissions/{id}/revisions` | 留档历史版本拉取对比 (差分计算基期) | `PaginatedResponse<Revision>` |

### 2.7 Simulation 工作台异步 Jobs 基础

将大量等待超长的引擎或数值计算收敛入 Job 任务池进行客户端渐进状态轮询更新：

| 请求方法 | 路径 | 主要说明 | 响应实体协定 (Status) |
|---|---|---|---|
| `POST` | `/simulations` | 下发重度引擎计算指令 | Out: 新建立 Job，状态被设为 `queued` 或 `running` |
| `GET` | `/jobs/{jobId}` | 定时监控执行生命流转期 | Out 包含 `{ id: string, status: "queued"\|"running"\|"succeeded"\|"failed"\|"cancelled", progress: number(0-100), error: {code: string, message: string}\|null, result: Record<string,any>\|null, created_at, started_at\|null, finished_at\|null }` |

### 2.8 基底外围设施 (Config/Upload/Track)

| 请求方法 | 路径 | 主要说明 | 备注准则 |
|---|---|---|---|
| `GET/PATCH` | `/me/ai-config` | 调节私人 NPU 或大模型切换策略 | 读取/呈现不可见私钥本体 (has_api_key 代替)。 |
| `POST` | `/uploads` | 单一泛用文件直传服务 (需鉴 413 与扫毒报错响应处理) | Out 通用化: `{ file_id, file_name, file_size, mime_type, url }` |
| `POST` | `/tracking/events` | 行为追踪分析落库（声明非业务主体本身的数据表留存） | Out: `ApiResponse<null>` |
