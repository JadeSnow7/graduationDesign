# React 前端分层设计架构（frontend-React）

> 面向面试/答辩：说明当前 React 前端的分层边界、Domain 拆分、API 组织与状态管理方式。

## 1. 范围与入口
- 代码范围：`frontend-React/`
- 入口：`frontend-React/src/main.tsx` → `frontend-React/src/app/router.tsx`
- 技术栈：React + TypeScript + Vite

## 2. 分层总览（依赖方向：上层依赖下层）

```
App/Router（启动与路由）
  └─ Pages（页面/UI 组合）
       └─ Domains（领域逻辑/状态）
            └─ API/Services（接口访问）
                 └─ Lib/Infra（鉴权、HTTP、SSE 等基础设施）
```

跨层说明：
- `Pages` 有时会直接调用 `API`（例如课程/作业页面），属“薄领域”场景。
- `Lib` 为全局能力（鉴权存储、HTTP 拦截、SSE 流等），不依赖业务层。

## 3. 目录与职责映射

- `frontend-React/src/app/`：应用层入口与路由编排
  - `router.tsx`：路由树 + Provider 装配
  - `ProtectedRoute.tsx`：鉴权路由守卫
- `frontend-React/src/pages/`：页面层（UI 组合、局部交互）
- `frontend-React/src/domains/`：领域层（状态/用例/业务流程）
- `frontend-React/src/api/`：API 访问层（类型 + 请求封装）
- `frontend-React/src/services/`：服务层（带 Mock 能力的接口封装，当前以仿真为主）
- `frontend-React/src/lib/`：基础设施层（HTTP Client、JWT 存储、SSE 流）

## 4. Domain 拆分与关键文件

| Domain | 领域状态/逻辑 | API 入口 | 主要页面 |
| --- | --- | --- | --- |
| Auth | `frontend-React/src/domains/auth/useAuth.tsx`（useReducer + Context） | `frontend-React/src/api/auth.ts` | `frontend-React/src/pages/LoginPage.tsx` |
| Course | `frontend-React/src/domains/course/useCourse.tsx`（Context + useEffect） | `frontend-React/src/api/course.ts` | `frontend-React/src/pages/CourseLayout.tsx`, `frontend-React/src/pages/CoursesPage.tsx` |
| Chat | `frontend-React/src/domains/chat/useChat.ts`（Reducer + SSE 流） | `frontend-React/src/lib/ai-stream.ts`（SSE） | `frontend-React/src/pages/ChatPage.tsx` |
| Simulation | `frontend-React/src/domains/simulation/useSimulation.ts`、`frontend-React/src/domains/simulation/useSimStore.ts`（Zustand） | `frontend-React/src/services/sim.ts`、`frontend-React/src/lib/api-client.ts` | `frontend-React/src/pages/SimPage.tsx` |
| Assignment/Resource | 页面内 useState | `frontend-React/src/api/assignment.ts`、`frontend-React/src/api/resource.ts` | `frontend-React/src/pages/AssignmentsPage.tsx`, `frontend-React/src/pages/AssignmentDetailPage.tsx`, `frontend-React/src/pages/ResourcesPage.tsx` |

## 5. API 层设计（API + Services）

**API 统一入口**
- `frontend-React/src/lib/api-client.ts`：Axios client + JWT 注入 + 401/403 处理 + data 解包
- 环境变量：`VITE_API_BASE_URL`（默认 `/api/v1`）

**API 模块**
- `frontend-React/src/api/`：以领域为单位的接口封装与类型定义  
  - `auth.ts`、`course.ts`、`assignment.ts`、`resource.ts`、`ai.ts`

**Services 模块（带 Mock 能力）**
- `frontend-React/src/services/`：封装“服务级别”的调用  
  - `sim.ts` 用于仿真接口，并支持 `VITE_MOCK_API=true`
  - `auth.ts`/`course.ts`/`ai.ts` 为可选/历史层（当前大多未在页面中直接引用）

## 6. 状态管理策略（State）

1) **页面局部状态（UI State）**
- `useState`/`useEffect` 管理表单、加载态、错误提示等  
  - 示例：`frontend-React/src/pages/AssignmentsPage.tsx`

2) **领域状态（Domain State）**
- **Reducer + Context**：更强一致性与可测试性  
  - `useAuth`、`useChat` 将状态转移显式化
- **Context + useEffect**：轻量领域状态  
  - `useCourse` 负责课程详情加载与缓存

3) **全局/复杂交互状态**
- `Zustand`：`frontend-React/src/domains/simulation/useSimStore.ts`  
  - 适合编辑器内容、运行状态、AI 助手等复杂状态组合

4) **持久化状态**
- `frontend-React/src/lib/auth-store.ts`  
  - JWT 存储在 `localStorage`，并进行过期检查与用户解码

## 7. 关键数据流示例（面试可讲）

**登录流程**
1. `LoginPage` 调用 `useAuth.login`
2. `authApi.login` → `apiClient` 发送 `/auth/login`
3. `authStore` 保存 token + 解码 user
4. `AuthProvider` 更新状态，`ProtectedRoute` 放行

**AI 聊天流式输出**
1. `ChatPage` 调用 `useChat.sendMessage`
2. `aiStreamClient` 以 SSE 方式调用 `/ai/chat`
3. reducer 逐 token 追加消息（`APPEND_TOKEN`）

**仿真与代码运行**
1. `SimPage` 调用 `useSimulation`（调用 `simService`）或 `useSimStore`（Zustand）
2. `simService` 走 `/sim/laplace2d` 等接口
3. 代码运行走 `/sim/run_code`，AI 助手走 `/ai/chat`

## 8. 面试/答辩要点（设计动机）

- **分层清晰**：UI 与领域逻辑拆分，API 访问集中封装，便于替换与复用
- **领域聚合**：`domains/` 以业务能力组织，降低跨页面耦合
- **状态可控**：关键流程用 reducer 约束状态转换，复杂编辑交互用 Zustand
- **基础设施复用**：JWT、错误处理、SSE 流式解析统一在 `lib/`
