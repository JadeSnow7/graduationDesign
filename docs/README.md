# 技术文档索引

本目录包含项目的所有技术文档，按功能分类组织。

## 📋 核心文档入口

> **一站式阅读**：下方主设计文档按大厂模板编写，包含完整的项目背景、目标、方案调研、架构设计和关键决策，建议**首先阅读此文档**。

| 文档 | 描述 |
|------|------|
| ⭐ [project-design-document.md](./architecture/project-design-document.md) | **项目设计文档（主文档）**：背景 → 目标 → 需求 → 方案调研 → 架构设计 → 关键决策 → 性能 → 风险 → 验证 |
| [requirements.md](./requirements.md) | 需求规格说明书（SRS）：详细功能与非功能需求 |
| [frontend-api-architecture-interaction.md](./frontend-api-architecture-interaction.md) | 前端、API、架构交互综合速览 |

---

## 文档分类

### 📐 [架构文档](./architecture/)
- **[项目设计文档](./architecture/project-design-document.md)** ⭐ 主文档
- [系统架构总览](./architecture/system-overview.md)
- [组件设计](./architecture/component-design.md)
- [前端分层架构](./architecture/react-layered-architecture.md)

### 🧩 [规格与计划](./specs/)
- [Mini App 技术选型建议](./specs/mini-app-selection.md)

### 🔌 [API 文档](./api/)
- [认证接口](./api/authentication.md)
- [课程管理接口](./api/course-management.md)
- [AI 服务接口](./api/ai-services.md)
- [仿真服务接口](./api/simulation-services.md)

### [AI 文档（模型与智能能力）](./ai/)
- [GraphRAG 用法](./ai/graph-rag.md)
- [学习状态分析模块](./ai/learning-analytics.md)
- [后训练与微调计划](./ai/post-training-finetuning-plan.md)

### 🚀 [部署文档](./deployment/)
- [部署指南](./deployment/README.md)
- [快速启动](./deployment/quick-start.md)

### 💻 [开发文档](./development/)
- [开发指南](./development/README.md)
- [旧版开发笔记](./development/legacy-dev.md)

---

## 快速导航

| 我想了解... | 阅读文档 |
|-------------|----------|
| 项目整体设计思路和技术选型 | [项目设计文档](./architecture/project-design-document.md) ⭐ |
| 系统如何部署运行 | [快速启动](./deployment/quick-start.md) |
| 如何调用后端 API | [API 文档](./api/README.md) |
| 前端代码结构 | [前端分层架构](./architecture/react-layered-architecture.md) |
| 功能需求明细 | [需求规格说明](./requirements.md) |

---

## 文档维护规范

- ✅ 所有文档应保持与代码同步更新
- ✅ 重要变更需要更新相关文档
- ✅ 遵循 Markdown 格式规范
- ✅ 主设计文档按大厂模板保持 3-5 页篇幅

## 相关资源

- [项目主 README](../README.md)
- [代码库说明](../code/README.md)
- [学术材料](../academic/README.md)
