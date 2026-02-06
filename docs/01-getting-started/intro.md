# 技术文档索引

本目录包含项目的所有技术文档，按功能分类组织。

## 📋 核心文档入口

> **一站式阅读**：下方主设计文档按大厂模板编写，包含完整的项目背景、目标、方案调研、架构设计和关键决策，建议**首先阅读此文档**。

| 文档 | 描述 |
|------|------|
| ⭐ [project-design-document.md](../05-explanation/architecture/project-design-document.md) | **项目设计文档（主文档）**：背景 → 目标 → 需求 → 方案调研 → 架构设计 → 关键决策 → 性能 → 风险 → 验证 |
| [requirements.md](../05-explanation/requirements.md) | 需求规格说明书（SRS）：详细功能与非功能需求 |
| [frontend-api-architecture-interaction.md](../05-explanation/frontend-api-architecture-interaction.md) | 前端、API、架构交互综合速览 |
| [feature-modules.md](../05-explanation/feature-modules.md) | 功能模块化与课程开放策略 |

---

## 文档分类
 
 ### 📐 [架构文档](../05-explanation/architecture/project-design-document.md)
 - **[项目设计文档](../05-explanation/architecture/project-design-document.md)** ⭐ 主文档
 - [系统架构总览](../05-explanation/system-design.md)
 - [组件设计](../05-explanation/architecture/component-design.md)
 - [前端分层架构](../05-explanation/architecture/react-layered-architecture.md)
 - [课程模块门控方案](../05-explanation/architecture/module-gating-plan.md)
 - [API 一致性与组件化改造计划](../05-explanation/architecture/api-alignment-plan.md)
 - [API 模块归属与鉴权矩阵](../05-explanation/rbac-model.md)
 - [Shared Types & SDK 结构草案](../05-explanation/architecture/shared-sdk-structure.md)
 - [功能模块化与课程开放策略](../05-explanation/feature-modules.md)
 
 ### 🧩 [规格与计划 (已归档)](#)
 - [Mini App 技术选型建议](../05-explanation/architecture/mini-app-selection.md)
 
 ### [API 参考](../04-reference/api/)
 - [API 文档索引](../04-reference/api/)
 - [OpenAPI 定义](../04-reference/api/openapi.yaml)
 - [认证接口](../04-reference/api/auth.md)
 - [课程管理](../04-reference/api/course.md)
 - [AI 服务接口](../04-reference/api/ai.md)
 - [仿真服务接口](../04-reference/api/simulation.md)
 
 ### [AI 文档（模型与智能能力）](../05-explanation/ai/)
 - [AI 文档索引（写作课试点）](../05-explanation/ai-pipeline.md)
 - [参考论文列表（Reading List）](../05-explanation/ai/papers.md)
 - [GraphRAG 用法](../05-explanation/ai/graph-rag.md)
 - [引导式学习（guided）](../05-explanation/ai/guided-learning.md)
 - [数据蒸馏（distillation）](../05-explanation/ai/distillation.md)
 - [学习状态分析模块](../05-explanation/ai/learning-analytics.md)
 - [后训练与微调计划](../05-explanation/ai/post-training-finetuning-plan.md)
 - [训练数据规范](../05-explanation/ai/training-data-spec.md)
 - [工具调用（Tool Calling）](../05-explanation/ai/tool-calling.md)
 
 ### 🚀 [部署文档](../02-tutorials/deploy-to-server.md)
 - [部署指南](../02-tutorials/deploy-to-server.md)
 - [快速启动](./quick-start.md)
 
 ### 💻 [开发文档](#)
 - [贡献指南](../06-contributing/项目规范指南.md)
 - [旧版开发笔记](../05-explanation/architecture/legacy-dev.md)
 
 ---
 
 ## 快速导航
 
 | 我想了解... | 阅读文档 |
 |-------------|----------|
 | 项目整体设计思路和技术选型 | [项目设计文档](../05-explanation/architecture/project-design-document.md) ⭐ |
 | 系统如何部署运行 | [快速启动](./quick-start.md) |
| 如何调用后端 API | [API 文档](../04-reference/api/) |
 | 前端代码结构 | [前端分层架构](../05-explanation/architecture/react-layered-architecture.md) |
 | 功能需求明细 | [需求规格说明](../05-explanation/requirements.md) |

---

## 文档维护规范

- ✅ 所有文档应保持与代码同步更新
- ✅ 重要变更需要更新相关文档
- ✅ 遵循 Markdown 格式规范
- ✅ 主设计文档按大厂模板保持 3-5 页篇幅

## 相关资源

- [项目文档首页](../)
- [代码库说明](https://github.com/JadeSnow7/graduationDesign/tree/main/code/README.md)
- [学术材料](https://github.com/JadeSnow7/graduationDesign/tree/main/academic/README.md)
