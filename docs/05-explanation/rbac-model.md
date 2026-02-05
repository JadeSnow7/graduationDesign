# API 模块归属与鉴权矩阵

本文档用于统一各端接口契约与权限边界，确保 Web/Mobile/AI 的调用一致，避免同名功能出现不同路径或字段。

---

## 1. 目标

- **接口一致**：所有客户端使用同一套路径与字段。
- **鉴权清晰**：每个接口都标注权限与角色范围。
- **模块归属明确**：每个接口明确归属到后端模块/AI 服务。

---

## 2. 角色与权限（RBAC）

> 权限定义见后端 `code/backend/internal/authz/rbac.go`。

| 权限 | 描述 | 典型角色 |
|------|------|----------|
| `course:read` | 查看课程/章节/资源 | student/assistant/teacher/admin |
| `course:write` | 创建/编辑课程与章节 | teacher/admin |
| `assignment:read` | 查看作业/提交 | student/assistant/teacher/admin |
| `assignment:write` | 发布作业 | teacher/admin |
| `assignment:submit` | 提交作业 | student |
| `assignment:grade` | 批改作业 | teacher/assistant/admin |
| `resource:read` | 查看资源 | student/assistant/teacher/admin |
| `resource:write` | 创建/删除资源 | teacher/admin |
| `quiz:read` | 查看测验/题目 | student/assistant/teacher/admin |
| `quiz:write` | 创建/编辑测验 | teacher/admin |
| `quiz:take` | 参加测验 | student |
| `quiz:grade` | 查看所有测验结果/统计 | teacher/assistant/admin |
| `ai:use` | 使用 AI 接口 | student/assistant/teacher/admin |
| `sim:use` | 使用仿真/数值接口 | student/assistant/teacher/admin |
| `code:run` | 代码执行/沙箱 | student/assistant/teacher/admin |
| `announcement:read` | 查看公告 | student/assistant/teacher/admin |
| `announcement:write` | 发布公告 | teacher/admin |
| `attendance:read` | 查看考勤 | student/assistant/teacher/admin |
| `attendance:write` | 发起/结束考勤 | teacher/admin |
| `attendance:checkin` | 学生签到 | student |
| `attendance:export` | 导出考勤 | teacher/admin |
| `user:stats` | 获取用户统计 | student/assistant/teacher/admin |
| `user:manage` | 用户管理 | admin |

---

## 3. 模块归属（目标态）

| 模块 | 归属服务 | 说明 |
|------|----------|------|
| Auth | backend/auth | 登录/鉴权/企业微信 OAuth |
| Course | backend/course | 课程基础信息与成员访问控制 |
| Chapter | backend/chapter | 章节内容/心跳/学习统计 |
| Assignment | backend/assignment | 作业发布/提交/批改 |
| Quiz | backend/quiz | 测验发布/作答/统计 |
| Resource | backend/resource | 资源管理 |
| AI | backend/ai + ai_service | chat/工具调用/写作分析 |
| Simulation | backend/sim + simulation | 仿真与数值计算 |
| Writing | backend/writing + ai_service | 写作提交与分析 |
| Announcement | backend/announcement | 公告 |
| Attendance | backend/attendance | 考勤 |
| User Stats | backend/user | 用户统计 |
| Admin | backend/admin | 后台管理 |
| Upload | backend/upload | 文件上传 |

---

## 4. 接口矩阵（目标态）

> 以 `/api/v1` 为统一前缀。此处为目标契约，后端将按此收敛。

### Auth
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/auth/login` | public | 登录获取 JWT |
| GET | `/auth/me` | auth | 获取当前用户 |
| POST | `/auth/wecom` | public | 企业微信登录 |
| POST | `/auth/wecom/jsconfig` | public | 企微 JS SDK 配置 |
| GET | `/auth/wecom/oauth-url` | public | 获取 OAuth 地址 |

### Course
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/courses` | `course:read` | 课程列表 |
| GET | `/courses/{courseId}` | `course:read` | 课程详情 |
| POST | `/courses` | `course:write` | 创建课程 |

### Chapter
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/courses/{courseId}/chapters` | `course:read` | 章节列表 |
| GET | `/chapters/{id}` | `course:read` | 章节详情 |
| POST | `/chapters` | `course:write` | 创建章节 |
| PUT | `/chapters/{id}` | `course:write` | 更新章节 |
| DELETE | `/chapters/{id}` | `course:write` | 删除章节 |
| POST | `/chapters/{id}/heartbeat` | `course:read` | 学习时长心跳 |
| GET | `/chapters/{id}/my-stats` | `course:read` | 个人章节统计 |
| GET | `/chapters/{id}/class-stats` | `course:write` | 班级章节统计 |

### Assignment
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/courses/{courseId}/assignments` | `assignment:read` | 作业列表 |
| POST | `/courses/{courseId}/assignments` | `assignment:write` | 创建作业 |
| GET | `/assignments/{id}` | `assignment:read` | 作业详情 |
| POST | `/assignments/{id}/submit` | `assignment:submit` | 提交作业 |
| GET | `/assignments/{id}/submissions` | `assignment:grade` | 作业提交列表 |
| POST | `/submissions/{submissionId}/grade` | `assignment:grade` | 批改作业 |
| POST | `/submissions/{submissionId}/ai-grade` | `assignment:grade` | AI 批改建议 |

### Quiz
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/courses/{courseId}/quizzes` | `quiz:read` | 测验列表 |
| POST | `/quizzes` | `quiz:write` | 创建测验 |
| GET | `/quizzes/{id}` | `quiz:read` | 测验详情 |
| PUT | `/quizzes/{id}` | `quiz:write` | 更新测验 |
| DELETE | `/quizzes/{id}` | `quiz:write` | 删除测验 |
| POST | `/quizzes/{id}/start` | `quiz:take` | 开始测验 |
| POST | `/quizzes/{id}/submit` | `quiz:take` | 提交测验 |
| GET | `/quizzes/{id}/result` | `quiz:read` | 测验结果 |

### Resource
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/courses/{courseId}/resources` | `resource:read` | 资源列表 |
| POST | `/resources` | `resource:write` | 创建资源 |
| DELETE | `/resources/{id}` | `resource:write` | 删除资源 |

### AI / Writing
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/ai/chat` | `ai:use` | AI 对话 |
| POST | `/ai/chat_with_tools` | `ai:use` | 工具调用对话 |
| POST | `/ai/chat/guided` | `ai:use` | 引导式学习对话 |
| POST | `/courses/{courseId}/writing` | `assignment:submit` | 写作提交 |
| GET | `/courses/{courseId}/writing` | `assignment:read` | 写作列表 |
| GET | `/writing/{id}` | `assignment:read` | 写作详情 |
| PUT | `/writing/{id}/feedback` | `assignment:grade` | 写作反馈更新 |

### Simulation
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/sim/*` | `sim:use` | 仿真接口统一前缀 |
| POST | `/calc/*` | `sim:use` | 数值计算接口统一前缀 |
| POST | `/sim/run_code` | `code:run` | 代码执行 |

### User Stats / Admin
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/user/stats` | `user:stats` | 用户统计 |
| GET | `/admin/stats` | `user:manage` | 系统统计 |
| GET | `/admin/users` | `user:manage` | 用户列表 |
| POST | `/admin/users` | `user:manage` | 创建用户 |
| PUT | `/admin/users/{id}` | `user:manage` | 更新用户 |
| DELETE | `/admin/users/{id}` | `user:manage` | 删除用户 |

---

## 5. 统一响应规范（目标态）

```json
{
  "success": true,
  "data": { }
}
```

```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "错误说明" }
}
```

---

## 6. 课程归属与鉴权规则

- 课程内资源（章节/作业/测验/资源/写作）默认要求用户为课程成员。
- 写操作必须验证“课程教师/管理员”身份。
- 助教仅具备读与部分批改权限，不具备创建课程/章节的权限。

