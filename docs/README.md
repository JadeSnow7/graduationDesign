# 项目文档

欢迎阅读智能教学平台项目文档。

## 快速导航

### 入门指南
- **项目简介**：[Getting Started](./01-getting-started/intro.md)
- [环境要求](./01-getting-started/prerequisites.md)
- [快速开始](./01-getting-started/quick-start.md)
- [用户指南](./01-getting-started/USER_GUIDE.md)

### 操作指南
- [CI/CD 配置](./03-how-to-guides/ci-cd-setup.md)

### 参考手册
- [API 接口文档](./04-reference/api/index.md)

### 概念解释
- [系统设计](./05-explanation/system-design.md)
- [权限模型](./05-explanation/rbac-model.md)
- [AI 流程](./05-explanation/ai-pipeline.md)
- [需求文档](./05-explanation/requirements.md)
- [功能模块](./05-explanation/feature-modules.md)

### 贡献指南
- [文档规范](./06-contributing/doc-style.md)
- [代码规范](./06-contributing/code-style.md)
- [项目规范指南](./06-contributing/项目规范指南.md)

---

## 文档状态矩阵

> 基于 [Qwen3/Qwen3-VL 迁移基线（2026-02-09）](./05-explanation/ai/qwen3-vl-migration-baseline-2026-02-09.md)

| 主题 | 状态 | 文档路径 |
|---|---|---|
| NPU 分层部署 | ✓ 已同步 | [npu-tiered-deployment.md](./03-how-to-guides/deployment/npu-tiered-deployment.md) |
| 模型路由策略 | ✓ 已同步 | [model-routing-policy.md](./05-explanation/ai/model-routing-policy.md) |
| Plan 模式协作 | ✓ 已同步 | [plan-mode-workflow.md](./06-contributing/plan-mode-workflow.md) |
| AI API 参考 | ✓ 已同步 | [ai.md](./04-reference/api/ai.md) |
| 配置参考 | ✓ 已同步 | [configuration.md](./03-how-to-guides/deployment/configuration.md) |

---

## 文档结构

```
docs/
├── 01-getting-started/   # 入门文档
├── 02-tutorials/         # 完整教程
├── 03-how-to-guides/     # 操作指南
├── 04-reference/         # 参考手册
├── 05-explanation/       # 概念解释
├── 06-contributing/      # 贡献指南
├── 07-release-notes/     # 发布记录
└── templates/            # 文档模板
```
