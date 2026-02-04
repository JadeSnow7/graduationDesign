# 前端任务需求、API 文档、项目架构与交互设计综合摘要

> 面向前端/产品/集成的速览文档，整合需求、接口、架构与当前交互实现要点。

## 1. 范围与主要来源

- 需求与功能：`docs/requirements.md`
- API 规范：`docs/api/README.md`、`docs/api/authentication.md`、`docs/api/course-management.md`、`docs/api/ai-services.md`、`docs/api/simulation-services.md`、`docs/api/legacy-api.md`
- 架构设计：`docs/architecture/system-overview.md`、`docs/architecture/component-design.md`、`docs/architecture/README.md`、`docs/architecture/legacy-architecture.md`
- 前端实现参考：`code/frontend-react/`（React + Vite），路由与页面见 `code/frontend-react/src/App.tsx` 与 `code/frontend-react/src/pages/`
- 前端技术栈说明：`docs/development/README.md`

## 2. 前端任务需求（需求层）

> 说明：平台已调整为通用教学平台，学科能力以“课程专属模块”形式启用。下文中的仿真/数值计算为示例模块。

### 2.1 角色与权限边界
- 角色：管理员、教师、助教、学生（RBAC）。
- 权限要点：`course:read`、`course:write`、`ai:use`、`sim:use`、`user:manage`。
- 前端需依据角色展示/禁用功能入口，并处理 401/403 统一跳转与提示。

### 2.2 核心功能模块
- 认证与用户：
  - 账号密码登录（必备），企业微信 OAuth 登录（可选但优先适配企业微信 H5）。
  - Token 管理与自动续期/失效处理。
- 课程管理：
  - 课程列表、详情、创建/编辑/关闭。
  - 成员管理、邀请码加入课程。
  - 课程大纲、公告、教学日历展示。
- 作业与测验：
  - 发布、提交、批改、反馈与成绩统计。
  - 教师/助教端支持批改入口与 AI 预批改结果对照。
- 资源中心：
  - 资料上传、分类浏览、下载与访问记录。
- 考勤签到：
  - 发起签到、学生签到、出勤统计。
- AI 教学辅助：
  - 智能答疑（多轮对话、可选 GraphRAG 引用）。
  - 作业批改辅助（rubrics + 反馈）。
  - 学情总结与教学建议（教师端）。
- 课程专属工具（示例：仿真/数值计算）：
  - 课程模型的参数输入与可视化输出。
  - 结果的图像/图表展示与交互查看。
  - 课程工具的统一入口与权限控制。

### 2.3 非功能与体验要求
- 客户端：企业微信内置 WebView 优先，兼容普通浏览器。
- 性能：常规接口 < 200ms；AI 首字延迟 < 3s；仿真计算 < 5s。
- 交互：AI 支持流式输出（SSE），仿真结果支持图片/图表展示。

## 3. API 文档摘要（接口层）

### 3.1 通用规范
- 基地址：`/api/v1`；请求/响应均为 JSON。
- 认证方式：JWT Bearer Token。
- 统一响应结构：`{ success, data }`；错误结构：`{ success: false, error: { code, message, details } }`。

### 3.2 认证接口（`docs/api/authentication.md`）
- `GET /healthz`：健康检查。
- `POST /auth/login`：账号密码登录。
- `GET /auth/me`：获取当前用户与权限。
- 企微 OAuth：
  - `GET /auth/wecom/oauth-url`
  - `POST /auth/wecom`
  - `POST /auth/wecom/jsconfig`

### 3.3 课程管理接口（`docs/api/course-management.md`）
- 课程：`GET /courses`、`GET /courses/{id}`、`POST /courses`、`PUT /courses/{id}`、`DELETE /courses/{id}`
- 成员：`GET /courses/{id}/members`、`POST /courses/{id}/members`、`DELETE /courses/{id}/members/{user_id}`、`POST /courses/join`
- 作业：`GET /courses/{id}/assignments`、`POST /courses/{id}/assignments`
- 资源：`GET /courses/{id}/resources`、`POST /courses/{id}/resources`

### 3.4 AI 服务接口（`docs/api/ai-services.md`）
- 对话：`POST /ai/chat`（支持 `stream=true` SSE）
- 批改：`POST /ai/grade`
- 历史：`GET /ai/history`、`GET /ai/conversations/{id}`、`DELETE /ai/conversations/{id}`
- 知识库：`POST /ai/search`、`POST /ai/knowledge/rebuild`
- 模式：`tutor`/`grader`/`sim_explain`/`formula_verify`/`sim_tutor`/`problem_solver`，可加 `_rag` 启用 GraphRAG。

### 3.5 课程专属仿真服务接口（`docs/api/simulation-services.md`）
- 静电场：`POST /sim/laplace2d`、`/sim/point_charges`、`/sim/gauss_flux`
- 静磁场：`POST /sim/wire_field`、`/sim/solenoid`、`/sim/ampere_loop`
- 电磁波：`POST /sim/wave_1d`、`/sim/fresnel`
- 任务管理：`GET /sim/history`、`GET /sim/results/{id}`、`DELETE /sim/results/{id}`
- 响应常包含 `png_base64`，前端可直接渲染为图片。

### 3.6 数值计算接口（原型，`docs/api/legacy-api.md`）
- `POST /calc/integrate`、`/calc/differentiate`、`/calc/evaluate`、`/calc/vector_op`
- 说明：该组接口仅在原型文档中出现，当前前端工具页已调用这些接口。

## 4. 项目架构摘要（系统层）

- 客户端：企业微信 H5 + 传统浏览器。
- 前端：React + TypeScript + Vite 应用，负责页面展示与交互。
- 后端：Go + Gin，提供统一鉴权（JWT）、RBAC 权限、课程管理、AI/工具网关、企微 OAuth。
- 能力服务：
  - AI 服务（FastAPI）：对接 LLM，支持 GraphRAG 检索与流式响应。
  - 课程工具服务（FastAPI）：按课程提供仿真/实验/写作等能力。
- 数据层：MySQL（业务数据）、文件存储（附件/图像）、向量索引（GraphRAG）。
- 关键调用链：
  - AI：前端 → `/api/v1/ai/chat` → AI 服务 → 上游 LLM
- 课程工具：前端 → `/api/v1/sim/*` 或 `/api/v1/calc/*` → 课程工具服务
  - 企微登录：前端 → `/api/v1/auth/wecom/oauth-url` → 企业微信授权 → `/api/v1/auth/wecom`

## 5. 交互设计摘要（当前实现 + 需求要点）

### 5.1 全局导航与权限
- 登录后展示导航：概览、课程、AI 答疑、仿真。
- 路由守卫：未登录强制跳转登录；登录后自动加载 `/auth/me`。
- Token 存储在 `localStorage`，登录/退出同步更新状态。

### 5.2 登录流程（企业微信优先）
- 企业微信环境识别后提供 OAuth 登录按钮。
- OAuth 回调携带 `code` 自动换取 JWT，再进入主流程。

### 5.3 AI 答疑交互
- 支持模式切换（讲解/批改），GraphRAG 开关。
- 发送后追加对话记录；当前为非流式响应（SSE 仍需前端接入）。

### 5.4 课程专属工具交互（示例：仿真/数值计算）
- 工具页面按子模块划分为 Tab。
- 参数表单 + 一键运行；结果以图片/指标卡形式返回。
- 具体子模块由课程配置决定。

### 5.5 课程管理交互
- 课程列表展示与创建入口（权限提示：教师/管理员）。
- 详情、作业、资源、签到等流程在需求中定义，但尚需完整 UI 覆盖。

## 6. 待补充与一致性注意

- `docs/api/README.md` 引用的 `calculation-services.md` 在仓库内不存在，数值计算仅在 `docs/api/legacy-api.md` 描述。
- `docs/architecture/README.md` 提到的 `data-architecture.md` 与 `security-architecture.md` 未在仓库中发现。
- 前端已调用 `/calc/*` 原型接口，建议补齐正式 API 文档并统一到 `docs/api/`。
