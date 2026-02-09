# 文档变更摘要（2026-02-09）

## 变更概述

本次文档更新完成了 NPU 部署、模型路由和 Plan 模式协作的文档体系建设，建立了"可查、可执行、可审计"的文档结构。

## 新增文档

### 1. NPU 分层部署策略
- **路径**: `docs/03-how-to-guides/deployment/npu-tiered-deployment.md`
- **内容**:
  - 硬件分层表（8B/1.7B 档位）
  - 模型包与量化建议
  - 配置映射与灰度策略
  - 失败回退与验证清单

### 2. 模型路由策略（权威说明）
- **路径**: `docs/05-explanation/ai/model-routing-policy.md`
- **内容**:
  - 路由决策表（固定规则）
  - Fallback 策略（同家族限定）
  - vLLM 定位与职责边界
  - 配置变量映射（新旧变量）
  - 错误码与开关行为

### 3. Qwen3/Qwen3-VL 迁移基线
- **路径**: `docs/05-explanation/ai/qwen3-vl-migration-baseline-2026-02-09.md`
- **内容**:
  - 迁移前基线状态
  - 变更边界
  - 回滚锚点
  - 验收最小集
  - 文档同步状态矩阵

### 4. Plan 模式协作流程
- **路径**: `docs/06-contributing/plan-mode-workflow.md`
- **内容**:
  - 工作流程（只读探查 → 意图确认 → 实施方案 → 切执行模式）
  - 禁止动作明确边界
  - 输出物要求
  - 协作规范与示例场景

### 5. Plan 模式计划模板
- **路径**: `docs/06-contributing/plan-mode-template.md`
- **内容**:
  - 结构化计划模板
  - 包含目标、改动清单、接口变更、测试策略、回滚方案等

## 更新文档

### 1. 部署指南
- **`docs/03-how-to-guides/deployment/index.md`**: 添加 NPU 分层部署入口
- **`docs/03-how-to-guides/deployment/ai-model-deployment-guide.md`**: 添加相关文档链接
- **`docs/03-how-to-guides/deployment/environment-setup.md`**: 添加 NPU 部署引用
- **`docs/03-how-to-guides/deployment/troubleshooting.md`**: 新增 NPU 部署相关问题排查
- **`docs/03-how-to-guides/deployment/configuration.md`**:
  - 新增配置变量分类（新变量/旧变量）
  - 明确迁移建议

### 2. API 参考
- **`docs/04-reference/api/ai.md`**:
  - 补充路由规则说明
  - 新增错误码表
  - 添加相关文档链接

### 3. 解释层文档
- **`docs/05-explanation/ai/README.md`**:
  - 更新推荐阅读顺序
  - 添加新文档入口

### 4. 贡献指南
- **`docs/06-contributing/index.md`**: 添加 Plan 模式文档入口
- **`docs/06-contributing/code-style.md`**:
  - 新增功能改动需附计划文档要求
  - 添加相关文档链接

### 5. 文档门户
- **`docs/index.md`**:
  - 更新快速入口
  - 更新推荐阅读顺序
- **`docs/README.md`**:
  - 新增文档状态矩阵
  - 链接到迁移基线

### 6. 仓库根目录
- **`README.md`**:
  - 添加在线文档站点链接
  - 添加新文档快速链接

## VitePress 配置更新

### `docs/.vitepress/config.mts`
- **部署指南侧边栏**: 新增独立分组，包含 NPU 分层部署等文档
- **解释层侧边栏**: 新增 "AI 机制" 分组，包含模型路由策略等文档
- **贡献指南侧边栏**: 新增 "协作流程" 分组，包含 Plan 模式文档

## 文档结构改进

### 信息架构优化
- **How-to 层**: 回答"怎么做"（部署步骤、排障、灰度开关）
- **Reference 层**: 回答"契约是什么"（API、字段、配置项、错误码）
- **Explanation 层**: 回答"为什么这样设计"（路由原则、约束、取舍）
- **Contributing 层**: 回答"团队怎么协作"（Plan 模式流程、文档更新门禁）

### 导航改进
- 从文档首页 2 次点击内可到达所有新文档
- 侧边栏按主题分组，便于快速定位
- 相关文档之间建立交叉引用

## 质量验证

### 构建验证
- ✅ `npm run docs:build` 成功
- ✅ 无构建错误或警告（除语法高亮提示）

### 链接检查
- ✅ `npm run docs:check-links` 通过
- ✅ 检查 81 个 markdown 文件，无内部链接错误

### 一致性验证
- ✅ 新变量 `LLM_*_TEXT_*` 在 4 个文档中出现
- ✅ 新变量 `LLM_*_VL_*` 在 5 个文档中出现
- ✅ `model_family` 在 5 个文档中出现（How-to/Reference/Explanation）
- ✅ `/api/v1/ai/chat/multimodal` 在 7 个文档中出现

## 影响范围

### 用户可见变化
- 文档站点新增 5 个主题页面
- 侧边栏导航结构优化
- 文档首页快速入口更新

### 开发者影响
- 新增 Plan 模式协作流程规范
- 配置变量迁移路径明确
- 部署策略文档化

### 运维影响
- NPU 部署策略可查
- 故障排查文档完善
- 配置说明更新

## 后续建议

1. **持续维护**: 随着功能演进，及时更新相关文档
2. **用户反馈**: 收集文档使用反馈，持续优化结构
3. **示例补充**: 为关键流程添加更多实际示例
4. **视频教程**: 考虑为复杂流程制作视频教程

## 相关链接

- [在线文档站点](https://jadesnow7.github.io/graduationDesign/)
- [Qwen3-VL 迁移基线](docs/05-explanation/ai/qwen3-vl-migration-baseline-2026-02-09.md)
- [文档状态矩阵](docs/README.md#文档状态矩阵)

---

**变更日期**: 2026-02-09
**执行人**: Claude Code
**审核状态**: 待审核
