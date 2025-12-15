# 毕业设计：电磁场课程智能教学平台

> 基于企业微信 H5、Gin 后端、大模型辅助与仿真服务的教学平台原型设计。

## 设计方案（精简版）
- **整体形态**：企业微信内嵌 H5 前端 → Gin 后端 REST API → AI 服务（Qwen/兼容 OpenAI）与仿真服务（Python 数值计算），数据库用 MySQL。
- **核心功能**：登录与权限（JWT+RBAC）、课程管理、AI 答疑与批改辅助、典型电磁场模型仿真与可视化（Laplace2D 示例）。
- **分层与解耦**：教学业务后端统一鉴权与调度；AI/仿真独立服务，便于替换和扩展；前后端分离。
- **角色与权限**：admin 全权限；teacher 课程读写+AI/仿真；assistant 课程读+AI/仿真；student 课程读+AI/仿真。
- **可扩展点**：接入企业微信 OAuth、RAG/工具调用、安全审计、多课程/班级维度的学情分析、更多仿真案例（同轴线、平行板等）。

## 仓库结构
- `emfield-teaching-platform/`：项目骨架
  - `backend/`：Go + Gin，JWT/RBAC，课程/AI/仿真转发示例
  - `frontend/`：Vue 3 + Vite，登录/课程/AI/仿真页面
  - `services/ai/`：FastAPI，对接上游大模型，模式化 prompt
  - `services/sim/`：FastAPI，电磁场仿真（Laplace2D）输出 PNG
  - `deploy/`：Docker Compose 与环境变量模板
  - `docs/`：架构/API/开发说明
  - `scripts/`：Compose 快捷启动/停止
- `开题报告.md`：完整开题报告文本

## 快速使用
```bash
cd emfield-teaching-platform
cp deploy/.env.example deploy/.env
./scripts/compose-up.sh     # 需本机 Docker 已启动；镜像构建+服务启动
# 前端单独开发：cd frontend && npm install && npm run dev
```
- 默认演示账号（数据库为空时自动创建）：`admin/admin123`、`teacher/teacher123`、`student/student123`
- 访问：后端 `http://localhost:8080/healthz`，AI `http://localhost:8001/healthz`，仿真 `http://localhost:8002/healthz`
- 配置上游大模型：在 `deploy/.env` 填写 `LLM_BASE_URL / LLM_API_KEY / LLM_MODEL`

## 额外说明
- 详见 `emfield-teaching-platform/docs/ARCHITECTURE.md`、`API.md`、`DEV.md`
- 本 README 仅保留设计方案与入口信息；具体实现请查看子目录。

