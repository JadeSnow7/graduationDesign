# 架构设计（原型）

## 1. 目标
- 以企业微信内嵌 H5 为统一入口，承载“课程管理 + 作业/签到 + AI 答疑 + 仿真演示”核心流程。
- 采用服务化拆分：教学业务后端统一鉴权与权限控制；AI 与仿真以独立服务提供能力，便于替换与扩展。

## 2. 组件与职责
- `frontend`（Vue H5）：登录、课程列表、AI 对话、仿真演示页面；通过 REST 调用后端。
- `backend`（Gin）：JWT 登录鉴权、RBAC 权限、教学业务 API；转发/调度 AI 与仿真服务并统一返回。
- `ai`（FastAPI）：封装上游大模型（Qwen/兼容 OpenAI API），提供 `/v1/chat`，内置模式化 System Prompt。
- `sim`（FastAPI）：提供电磁场典型模型的参数化仿真接口；原型实现 `laplace2d`，输出 PNG（base64）。
- `mysql`：用户、课程等业务数据存储（原型仅建了 `users/courses` 表，后续按模块扩展）。

## 3. 典型调用链
### 3.1 AI 答疑
前端 → 后端 `/api/v1/ai/chat`（鉴权+权限）→ AI 服务 `/v1/chat` → 上游 LLM `/v1/chat/completions`

### 3.2 仿真演示
前端 → 后端 `/api/v1/sim/laplace2d`（鉴权+权限）→ 仿真服务 `/v1/sim/laplace2d`（计算+绘图）→ 返回 PNG

## 4. 权限模型（RBAC）
原型采用“角色→权限集合”的 RBAC 映射：
- `admin`：全权限
- `teacher`：课程读写、AI/仿真使用
- `assistant`：课程只读、AI/仿真使用
- `student`：课程只读、AI/仿真使用

后续可扩展为：细粒度权限（作业/成绩/资源/讨论）、数据范围（班级/课程维度）、企业微信组织结构映射。

