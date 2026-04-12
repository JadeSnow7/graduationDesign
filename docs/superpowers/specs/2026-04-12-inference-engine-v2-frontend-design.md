# Inference Engine V2 — 前端完整实现设计

**日期**：2026-04-12  
**状态**：已批准  
**范围**：`inference-engine-v2/frontend/`（新建）+ `inference-engine-v2/backend/`（新增 auth 端点）

---

## 1. 背景与目标

为 inference-engine-v2 独立推理引擎配套生产级前端界面。目标用户为 HUST 集成电路/微电子本科生，核心场景为开题报告生成、文献综述、段落润色。

约束：
- Windows 88.7%，校园网环境，无需移动端适配
- 延迟容忍度高（10–15s），需精心设计加载态
- 用校园教育邮箱（`@hust.edu.cn` / `@stu.hust.edu.cn`）注册，仅校验域名，不发送验证邮件

---

## 2. 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 18 + TypeScript 5 |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3（仅预设类）|
| 组件库 | shadcn/ui（Dialog、Badge、Button、Tabs 按需安装）|
| 状态 | Zustand 4 + immer 中间件 |
| Markdown | react-markdown 9 + remark-gfm 4 |
| SSE | fetch + ReadableStream（不用原生 EventSource）|
| 路由 | React Router v6 |

---

## 3. 目录结构

```
inference-engine-v2/
├── backend/
│   ├── api/
│   │   ├── auth.py          # 现有：JWT 工具函数（不改动）
│   │   ├── chat.py          # 现有：SSE 聊天端点（不改动）
│   │   └── users.py         # 新增：register + login
│   └── store/
│       └── redis_store.py   # 新增 UserStore
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── main.tsx
        ├── App.tsx                  # BrowserRouter + ProtectedRoute
        ├── pages/
        │   ├── LoginPage.tsx        # 登录/注册双 tab
        │   └── ChatPage.tsx         # 主界面（渲染 Shell）
        ├── api/
        │   ├── client.ts            # fetch 封装 + JWT 注入 + 401 跳转
        │   └── sse.ts               # SSE 连接管理（fetch + ReadableStream）
        ├── store/
        │   ├── user.ts              # token、profile、persist 到 localStorage
        │   ├── chat.ts              # messages[]、isStreaming、streamingId
        │   ├── pipeline.ts          # currentStage、stageHistory[]
        │   └── sidebar.ts           # papers[]、gaps[]、activeTab
        ├── components/
        │   ├── layout/
        │   │   ├── Shell.tsx        # 三栏固定布局（100vh）
        │   │   ├── Header.tsx       # Logo + 场景 badge + 用户名
        │   │   └── ProtectedRoute.tsx
        │   ├── chat/
        │   │   ├── ChatPanel.tsx    # 消息列表容器
        │   │   ├── MessageBubble.tsx
        │   │   ├── StreamingBubble.tsx
        │   │   ├── InputBar.tsx
        │   │   ├── StageIndicator.tsx
        │   │   └── EmptyState.tsx   # 首屏三个快速启动按钮
        │   ├── sidebar/
        │   │   ├── PanelTabs.tsx
        │   │   ├── LiteraturePanel.tsx
        │   │   └── GapsPanel.tsx
        │   └── onboarding/
        │       ├── OnboardingModal.tsx
        │       └── SurveyStep.tsx
        ├── hooks/
        │   ├── useSSE.ts
        │   ├── useAutoScroll.ts
        │   └── useProfile.ts
        ├── types/
        │   └── events.ts            # SSEEvent、PaperItem、GapItem、Message
        └── utils/
            ├── token.ts
            └── scene.ts
```

---

## 4. 路由

| 路径 | 组件 | 保护 |
|------|------|------|
| `/login` | `LoginPage` | 公开（已登录自动跳 `/`）|
| `/` | `ChatPage` | `ProtectedRoute`（无 token → `/login`）|

---

## 5. Auth 设计

### 前端（LoginPage）

双 tab（登录 / 注册）：
- **注册**：邮箱（前端正则校验 `@hust.edu.cn` 或 `@stu.hust.edu.cn`）+ 密码（≥8位）+ 确认密码 → `POST /api/auth/register`
- **登录**：邮箱 + 密码 → `POST /api/auth/login` → 返回 `{ token }` → 存入 `user` store（persist 到 localStorage）→ 跳转 `/`

### 后端新增（`api/users.py`，≤50 行）

```python
POST /api/auth/register
  body: { email, password }
  校验: email 后缀必须是 @hust.edu.cn 或 @stu.hust.edu.cn
  存储: Redis HSET users:{email} { password_hash, created_at }
  响应: { ok: true } | 409 邮箱已注册

POST /api/auth/login
  body: { email, password }
  校验: bcrypt verify
  响应: { token } | 401 邮箱或密码错误
```

`UserStore` 新增于 `store/redis_store.py`，使用 Redis Hash，key 为 `users:{email}`。

---

## 6. 类型定义（`src/types/events.ts`）

与后端 `core/events.py` 完全对齐：

```typescript
export type EventType = 'stage' | 'papers' | 'gaps' | 'token' | 'done' | 'error'

export interface SSEEvent {
  type: EventType
  content?: string
  stage?: string
  data?: PaperItem[] | GapItem[]
}

export interface PaperItem {
  id: string; title: string; year: number; score: number
}

export interface GapItem {
  id: string; description: string
  severity: 'high' | 'medium' | 'low'
  addressed_by: number; score: number
}

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string; role: MessageRole; content: string
  isStreaming: boolean; timestamp: number; scene?: string
}
```

---

## 7. 状态管理

### `store/user.ts`
- state：`token`, `userId`, `profile`（teachingStyle、feedbackVerbosity、writingStage、hasCompletedOnboarding）
- 持久化：`persist` 中间件，key `edu_user`
- `logout()`：清空 state + localStorage，跳转 `/login`

### `store/chat.ts`
- state：`messages[]`, `isStreaming`, `streamingId`
- `startAssistantMessage()`：插入 `{ isStreaming: true, content: '' }`，返回 id
- `appendToken(id, token)`：`content += token`，用 immer 不可变更新
- `finalizeMessage(id)`：`isStreaming = false`

### `store/pipeline.ts`
- state：`currentStage`, `stageHistory[]`
- `setStage(stage)`：同时追加到 `stageHistory`

### `store/sidebar.ts`
- state：`papers[]`, `gaps[]`, `activeTab`
- `setPapers()`：自动切换 `activeTab = 'papers'`
- `setGaps()`：不自动切换 tab（由用户手动切换）

---

## 8. SSE 连接（`api/sse.ts`）

- 使用 `fetch + ReadableStream + AbortController`，不用原生 `EventSource`
- Buffer 拼接：`buffer += chunk`，按 `\n\n` 分割，末尾不完整行留到下次
- 识别 `data: ` 前缀后 JSON.parse，解析失败静默跳过
- 组件卸载 / 新请求发起时调用 `abort()`

---

## 9. 关键组件行为

### Shell（三栏固定布局）
- 全局：`flex flex-col h-screen`
- 主区：`flex flex-1 overflow-hidden`
- ChatPanel：`flex-1 overflow-y-auto`
- Sidebar：`w-80 shrink-0 border-l`（`hidden lg:flex`）
- InputBar：`sticky bottom-0 bg-white border-t`

### Header
场景 badge 颜色映射：`proposal`→蓝、`review`→绿、`paragraph`→紫、`format`→灰，无场景不显示。

### StageIndicator
- `isStreaming` 为 false 时 `opacity-0`（不用 `display:none`，避免高度抖动）
- 预设顺序：`['路由中','意图解析','文献检索中','研究空白分析','大纲生成','审核修订']`
- 若 stageHistory 含预设外的阶段，直接展示 stageHistory，不对齐预设列表

### useAutoScroll
- 仅当距底部 < 120px 时才自动滚动，不打断用户上翻查看历史

### GapsPanel
- `severity=high` + `addressed_by=0`：红色左边框 + 提示「可作为研究切入点」
- `severity=high` + `addressed_by>0`：橙色
- `severity=medium`：黄色；`low`：灰色

### OnboardingModal
- 有 token 且 `!hasCompletedOnboarding` 时显示
- 三步：带教风格（Q13）→ 反馈详略（Q14）→ 写作阶段（Q9）
- 完成后调用 `POST /api/profile/init`，写 store，`hasCompletedOnboarding = true`

---

## 10. 完整数据流

```
InputBar.handleSubmit()
  → useSSE.send(message)
    → addUserMessage() + startAssistantMessage() → assistantId
    → pipelineStore.clearStages() + sidebarStore.clear()
    → connectSSE(message, handlers)

SSE 事件：
  stage  → pipelineStore.setStage()
  papers → sidebarStore.setPapers()   ← 自动切到文献 tab
  gaps   → sidebarStore.setGaps()
  token  → chatStore.appendToken(assistantId, token)
  done   → finalizeMessage() + setStreaming(false)
  error  → appendToken("> ⚠ msg") + finalize + setStreaming(false)
```

---

## 11. 错误处理

| 场景 | 处理 |
|------|------|
| SSE `error` 事件 | blockquote 追加到消息，正常 finalize |
| AbortError | 静默忽略 |
| 网络中断（非 Abort）| `onError('连接中断，请重试')` |
| 401 Unauthorized | `apiFetch` 抛错 → 自动跳转 `/login` |
| 注册重复邮箱 | 409 → 前端显示「邮箱已注册」 |
| 登录密码错误 | 401 → 前端显示「邮箱或密码错误」 |

---

## 12. 后端改动范围

**新增文件**：
- `backend/api/users.py`（register + login，≤50 行）

**修改文件**：
- `backend/store/redis_store.py`（新增 `UserStore` class）
- `backend/main.py`（include users router）

**不改动**：`core/`、`pipelines/`、`api/chat.py`、`api/auth.py`（JWT 工具）

---

## 13. V3 工程约束（强制）

### A. SSE 流解码

必须使用 `TextDecoder('utf-8', { stream: true })` 流式解码，禁止直接拼接 `Uint8Array`，防止中文乱码：

```ts
const decoder = new TextDecoder('utf-8')
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  buffer += decoder.decode(value, { stream: true })

  let boundary = buffer.indexOf('\n\n')
  while (boundary !== -1) {
    const raw = buffer.slice(0, boundary)
    buffer = buffer.slice(boundary + 2)
    if (raw.startsWith('data: ')) {
      try { handleEvent(JSON.parse(raw.slice(6))) } catch { /* 忽略脏数据 */ }
    }
    boundary = buffer.indexOf('\n\n')
  }
}
```

- JSON.parse 失败必须静默忽略，不中断流
- 必须容忍半包/脏数据

### B. SSE 并发与生命周期控制

防止多请求流污染，模块级维护单例 controller：

```ts
let currentController: AbortController | null = null

function startSSE() {
  currentController?.abort()
  const controller = new AbortController()
  currentController = controller
  return controller
}
```

- 新请求必须 abort 旧请求
- 每条消息绑定独立 `assistantId`
- `done`/`error` 只作用于当前流的 `assistantId`

### C. 状态一致性重置

每次新请求开始前必须执行：

```ts
chatStore.resetStreaming()
pipelineStore.clearStages()
sidebarStore.clear()
```

防止上一轮文献残留、阶段错乱。

### D. 后端 Auth 依赖

`backend/requirements.txt` 追加：

```
passlib[bcrypt]>=1.7.4
```

使用方式：

```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

### E. 统一 API 请求封装

`apiFetch` 必须实现 401 自动跳转：

```ts
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
  if (res.status === 401) {
    useUserStore.getState().logout()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
```

### F. 邮箱校验正则

```ts
/^[a-zA-Z0-9._%+-]+@(stu\.)?hust\.edu\.cn$/
```

### G. 消息 ID 生成

```ts
function genId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}
```

### H. SSE 错误兜底

```ts
onError(err) {
  appendToken(id, `\n\n> ⚠ ${err.message || '连接异常'}`)
  finalizeMessage(id)
}
```

### I. 组件卸载必须中断请求

```ts
useEffect(() => () => { controller.abort() }, [])
```

### J. 流式渲染性能（建议）

- 使用 `React.memo(StreamingBubble)`
- token 更新节流 30–50ms 或 `requestAnimationFrame`

---

## 14. 答辩验收标准

1. **开题报告生成**：StageIndicator 依次经历 6 个阶段，sidebar 出现文献和研究空白，主区流式渲染 Markdown 大纲
2. **Onboarding**：首次使用弹出三步问卷，刷新后不再显示
3. **带教风格差异**：不同 teachingStyle 设置影响 AI 回复风格（由后端 prompt 控制，前端正确透传）
4. **Auth**：非 hust 邮箱注册被拒，正确注册后登录跳主界面，刷新保持登录态
5. **中文无乱码**：长文本流式输出不出现乱码、JSON 崩溃或流污染
