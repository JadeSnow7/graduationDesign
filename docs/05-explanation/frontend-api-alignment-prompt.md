# 前端 API 对齐重构 Prompt (API Alignment Edition)

**角色设定**
你是一个资深前端架构师和全栈工程师，负责将已经构建好的前端 UI 组件库与最新的后端 API 契约进行严格对齐。

**背景上下文**
我们已经完成了 EduGraph 教学平台的纯 UI 重建（页面包括 Dashboard, Courses, KnowledgeGraph, WritingStudio, AIAssistant, Quiz, Simulations 等），UI 层面已经预留了各种业务状态（加载中、空状态、骨架屏、状态标签等）。
最新的后端 API 契约已经设计落定。你需要基于最新的契约文档修改前端网络层、API 适配层以及页面组件的数据获取逻辑，使前端能够真实、精准地与真实后端通信。

**参考基准文档**
请在执行前，先读取并严格遵循以下两份文档的全部约束：
1. `docs/05-explanation/frontend-api-refactor-rfc.md` （全局响应壳、分布规范、错误机理）
2. `docs/05-explanation/frontend-api-refactor-list.md` （具体路由及输入输出）

---

## 你的任务拆解

请按以下顺序系统性地对前端代码进行重构：

### 阶段 1：网络层与类型桩重建 (Network & Types)
1. **全局类型定义 (`src/types/api.ts`)**
   - 必须定义标准泛型 `ApiResponse<T>` 和 `PaginatedResponse<T>`。
   - 必须定义标准分页查询参数基类 `BaseListQuery`（包含 `page, page_size, keyword, sort_by, sort_order`）。
2. **Axios/Fetch 拦截器重构 (`src/lib/apiClient.ts`)**
   - 请求拦截：自动注入 `Authorization: Bearer`。对于 POST/PATCH 且为核心创建的提交，在需要时注入 `Idempotency-Key`。
   - 响应拦截：**提取并校验 `code === "0"`**。如果非 "0"，自动抛出业务错误并抛给全局 Toast/报错层处理。
   - 错误处理：按照 RFC 拦截 401（无感刷新 Token 或踢回登录状态）、403、404、422 等 HTTP 状态码。

### 阶段 2：分域 API 适配器重写 (Domain API Clients)
将之前端中零散的 API 函数，根据路由拆分为以下标准模块（例如放在 `src/api/*.ts` 中）：
- `authApi.ts` (`/auth/*`, `/me/*`)
- `courseApi.ts` (`/courses/*`, `/chapters/*`)
- `assignmentApi.ts` (`/assignments/*`, `/submissions/*`)
- `quizApi.ts` (`/quizzes/*`, `/quiz-attempts/*`)
- `writingApi.ts` (`/writing-submissions/*`)
- `simApi.ts` (`/simulations/*`, `/jobs/*`)

**【核心强约束】**：所有 API 请求的 URL 必须是 `kebab-case`。提交给后端的 Payload 必须是 `snake_case`。如果 UI 使用了 `camelCase`，请在这一层完成显式映射，不要将 snake_case 泄露到 UI 层（如果嫌麻烦，必须在类型体操中定义清晰）。

### 阶段 3：特殊复杂流对齐 (Special Workflows)
这部分是重构的核心难点，请逐一改造对应页面：
1. **AI Chat 流式处理 (`AIAssistant.tsx` / `WritingStudio.tsx`)**
   - 废弃旧的 `/chat` 接口。
   - 流程：先 POST `/ai/sessions` 创建会话，获取 `session_id`。
   - 触发对话时调用 POST `/ai/sessions/{id}/runs`，并**严格根据 SSE 事件** (`AiStreamEvent`：如 `token`, `tool_call`, `error`, `done`) 解析 `text/event-stream` 写回 React 状态。
2. **测验与尝试 (`Quiz.tsx`)**
   - 废弃直接提交整个试卷的逻辑。
   - 流程：GET 获取试卷 -> POST `/quizzes/{id}/attempts` 创建尝试获取 `attemptId`。
   - 答题过程中：调用 PATCH `/quiz-attempts/{id}/answers` 执行局部题目暂存。
   - 最后点击交卷：POST `/quiz-attempts/{id}/submit`。
3. **仿真轮询 (`Simulations.tsx`)**
   - POST 发起任务，获得 `job_id`。
   - 每隔 3-5 秒 GET `/jobs/{id}` 轮询，直到 status 变为 `succeeded` 或 `failed`，并更新进度指示器。

### 阶段 4：页面状态对接 (UI State Integration)
- 使用 React Query / SWR / React 19 `use` / 原生 useEffect 等状态管理方式改写组件。
- 确保所有的 `SkeletonLoader`（骨架屏）在 `isLoading` 时挂载。
- 确保 `EmptyState`（空状态）在 `items.length === 0` 时挂载。
- 确保后端抛出异常时（请求失败），能够自动通过拦截器或主动 try-catch 阻断操作，恢复按钮的 loading 状态。

---

## 执行口令
如果你理解了上述要求并且已阅读完 API 文档，请回答：“**我已准备好，请指示要优先重构哪一个模块（如 Network 层，或具体的 Quiz 域等），我会严格按照 API 契约输出代码。**”
