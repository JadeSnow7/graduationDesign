# Frontend API 实现状态矩阵（`code/frontend`）

更新时间：2026-02-26

本表用于冻结 `code/frontend` 迁移期间的 API 事实，避免“前端已接入但后端未实现”或“后端已改动但前端未同步”。

## 约束与结论

- 前端认证主路径固定：`GET /api/v1/auth/me`。
- `/api/v1/users/me` **不作为主调用路径**。
- OpenAPI 使用单文件增量维护：`docs/04-reference/api/openapi.yaml`。

## 状态定义

- `READY`：后端已实现，前端可直接接入。
- `GAP`：后端未实现或契约未冻结，前端仅可占位。
- `IN_PROGRESS`：契约已冻结，正在开发联调。

## 核心接口矩阵

| 域 | 接口 | 状态 | 负责人 | 前端消费页面 | 备注 |
|---|---|---|---|---|---|
| Auth | `POST /api/v1/auth/login` | READY | Backend | Login | 已存在 |
| Auth | `GET /api/v1/auth/me` | READY | Backend | ProtectedRoute / 全局恢复登录 | 主路径 |
| Auth | `POST /api/v1/auth/wecom` | READY | Backend | WeCom callback | 已存在 |
| User | `GET /api/v1/user/stats` | READY | Backend | Profile | 已存在 |
| User | `GET /api/v1/users/me/stats` | READY | Backend | Mobile/Profile 兼容 | 别名，非主路径 |
| Course | `GET /api/v1/courses` | READY | Backend | Courses | 已存在 |
| Course | `GET /api/v1/courses/{courseId}` | READY | Backend | CourseDetail | 已存在 |
| Assignment | `GET /api/v1/courses/{courseId}/assignments` | READY | Backend | CourseDetail/Assignments | 已存在 |
| Resource | `GET /api/v1/courses/{courseId}/resources` | READY | Backend | Resources | 已存在 |
| Attendance | `GET /api/v1/courses/{courseId}/attendance/summary` | READY | Backend | Attendance/CourseDetail | 已存在 |
| Attendance | `POST /api/v1/attendance/{sessionId}/checkin` | READY | Backend | Attendance | 已存在 |
| AI | `POST /api/v1/ai/chat` | READY | Backend | LocalAI/Chat | 已存在，支持 stream |
| AI | `POST /api/v1/ai/chat/guided` | READY | Backend | Learning/CourseDetail | 需前端 SDK 补齐 |
| AI | `POST /api/v1/ai/chat_with_tools` | READY | Backend | Workspace AI | 需前端 SDK 补齐 |
| AI Config | `GET /api/v1/users/me/ai-config` | GAP | Backend | AI Settings | 新增 |
| AI Config | `PATCH /api/v1/users/me/ai-config` | GAP | Backend | AI Settings | 新增 |
| Dashboard | `GET /api/v1/users/me/dashboard` | GAP | Backend | Learning | 新增聚合接口 |
| Workspace | `GET /api/v1/workspace/jobs` | GAP | Backend | Workspace(移动监控) | 新增 |
| Workspace | `GET /api/v1/workspace/jobs/{jobId}` | GAP | Backend | Workspace | 新增 |
| Workspace | `POST /api/v1/workspace/simulations` | GAP | Backend | Workspace | 新增（统一仿真任务入口） |
| KnowledgeBase | `GET /api/v1/users/me/knowledge-bases` | GAP | Backend | Learning | 新增 |
| KnowledgeBase | `POST /api/v1/users/me/knowledge-bases` | GAP | Backend | Learning | 新增 |

## 前端接入门禁

1. 页面层（`src/pages`、`src/domains`）禁止直接 `axios/fetch` 调用业务 API。
2. 所有 API 调用必须经 `@classplatform/shared` SDK 与统一客户端。
3. `GAP` 状态接口仅允许“显式占位态”，禁止隐式失败。
