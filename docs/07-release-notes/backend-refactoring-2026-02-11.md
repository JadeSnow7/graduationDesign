# 后端重构与架构升级（2026-02-11）

## 变更概述

本次更新完成了后端核心架构的重构，从单体文件结构迁移至分层架构（Layered Architecture）。通过拆分模型、路由，并引入 Repository 和 Service 层，显著提升了代码的可维护性、可测试性和扩展性。

## 核心变更

### 1. 架构分层
实现了完整的四层架构体系：
- **Router Layer (`internal/http/routes/`)**: 负责路由注册与中间件绑定
- **Handler Layer (`internal/http/`)**: 负责 HTTP 请求处理与参数解析
- **Service Layer (`internal/services/`)**: 负责业务逻辑与事务管理
- **Repository Layer (`internal/repositories/`)**: 负责数据访问与持久化

### 2. 模型拆分 (Model Splitting)
将原有的单体 `models.go` (224行) 拆分为 10 个领域模型文件：
- `user.go`: 用户与鉴权
- `course.go`: 课程核心
- `chapter.go`: 章节与进度
- `assignment.go`: 作业与提交
- `quiz.go`: 测验与题目
- `resource.go`: 课程资源
- `announcement.go`: 公告系统
- `attendance.go`: 考勤管理
- `writing.go`: 写作分析
- `learning_event.go`: 学情事件

### 3. 路由重构 (Router Refactoring)
将 `router.go` (565行) 拆分为 15 个独立文件，代码量减少 84%：
- 按业务领域拆分（如 `auth_routes.go`, `course_routes.go` 等）
- 统一中间件管理 (`routes/middleware.go`)
- 保持了 API 接口的完全兼容

### 4. 依赖注入 (Dependency Injection)
- **Client Interfaces**: 为 AIClient 和 MinIOClient 引入接口定义，解耦外部依赖。
- **Service/Repo Interfaces**: 全面采用接口与实现分离的模式，便于单元测试 mock。

## 代码统计

- **新增文件**: 45 个 (Routes: 14, Services: 11, Repositories: 8, Models: 10, Interfaces: 2)
- **重构代码量**: 约 2000 行
- **测试覆盖**: 现有 28 个测试用例全部通过，零破坏性变更。

## 文档更新

### 1. 架构文档
- **`docs/05-explanation/architecture/component-design.md`**: 更新了后端组件设计部分，反映了新的分层架构、`context.Context` 的使用以及 `uint` ID 类型变更。

### 2. 部署与维护
- 此次重构不影响部署流程，数据库 Schema 保持即有兼容性。

## 后续计划
- **Batch C**: 将 Handler 中的业务逻辑完全迁移至 Service 层。
- **Batch D**: 统一错误处理与响应封装。
