# 文档规范体系建设与迁移实施方案

**方案编制日期**: 2026-02-06
**版本**: v1.0
**状态**: 待审核

---

## 一、目标与原则

### 1.1 建设目标
- 建立符合互联网大厂标准的三级文档体系
- 实现文档与代码的同步演进
- 提供清晰、一致、可维护的技术文档

### 1.2 设计原则 (参考 Google Developer Documentation Style Guide)

| 原则 | 说明 |
|------|------|
| **最小可行文档** | 宁可少而精，不要多而废 |
| **单一信息源** | 避免重复，使用链接引用 |
| **代码即文档** | API 文档由代码注释自动生成 |
| **持续维护** | 文档随代码同步更新 |
| **用户视角** | 按读者需求组织内容 |

---

## 二、文档层级结构

### 2.1 三级分类体系

```
docs/
├── 01-getting-started/       # L1: 入门文档
│   ├── README.md             # 项目简介
│   ├── quick-start.md        # 快速开始
│   └── prerequisites.md      # 环境要求
│
├── 02-tutorials/             # L1: 教程文档
│   ├── first-course.md       # 创建第一门课程
│   └── deploy-to-server.md   # 部署到服务器
│
├── 03-how-to-guides/         # L2: 操作指南
│   ├── authentication.md     # 配置认证
│   ├── add-ai-model.md       # 添加 AI 模型
│   └── backup-database.md    # 备份数据库
│
├── 04-reference/             # L2: 参考手册
│   ├── api/                  # API 参考
│   │   ├── openapi.yaml      # OpenAPI 定义 (生成源)
│   │   └── endpoints.md      # 端点说明 (自动生成)
│   ├── architecture/         # 架构参考
│   ├── config/               # 配置参考
│   └── cli/                  # CLI 参考
│
├── 05-explanation/           # L3: 概念解释
│   ├── system-design.md      # 系统设计
│   ├── rbac-model.md         # 权限模型
│   └── ai-pipeline.md        # AI 流程
│
├── 06-contributing/          # L3: 贡献指南
│   ├── CONTRIBUTING.md       # 贡献流程
│   ├── code-style.md         # 代码规范
│   ├── doc-style.md          # 文档规范 (新建)
│   └── testing-guide.md      # 测试指南
│
├── 07-release-notes/         # 发布记录
│   └── CHANGELOG.md
│
└── templates/                # 模板库
    ├── how-to-template.md
    ├── api-endpoint-template.md
    └── adr-template.md       # 架构决策记录
```

### 2.2 文档类型说明

| 类型 | 目的 | 示例 |
|------|------|------|
| **Getting Started** | 让新用户快速上手 | quick-start.md |
| **Tutorials** | 手把手完成完整任务 | deploy-to-server.md |
| **How-to Guides** | 解决特定问题 | backup-database.md |
| **Reference** | 查阅技术细节 | api/endpoints.md |
| **Explanation** | 理解设计决策 | rbac-model.md |
| **Contributing** | 指导开发者贡献 | code-style.md |

---

## 三、文档模板规范

### 3.1 通用模板结构

```markdown
# 标题 (动词开头，如"部署到生产环境")

> 一句话简介

## 前提条件
- 必要环境/权限

## 步骤
### 1. 第一步
具体操作...

### 2. 第二步
具体操作...

## 验证
如何验证成功

## 常见问题
- **问题1**: 解答
- **问题2**: 解答

## 相关文档
- [链接1](path)
- [链接2](path)
```

### 3.2 API 文档模板

```markdown
# [HTTP方法] [路径]

## 描述
简要说明

## 权限
- 所需权限: `permission:name`

## 请求
### 路径参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|

### 请求体
```json
{
  "field": "value"
}
```

## 响应
### 成功 (200)
```json
{
  "success": true,
  "data": {}
}
```

### 错误码
| 错误码 | 说明 |
|--------|------|
```

---

## 四、现有文档迁移清单

### 4.1 迁移映射表

| 原路径 | 新路径 | 操作 | 优先级 |
|--------|--------|------|--------|
| `docs/README.md` | `docs/01-getting-started/README.md` | 迁移 | P0 |
| `docs/deployment/quick-start.md` | `docs/01-getting-started/quick-start.md` | 迁移 | P0 |
| `docs/deployment/README.md` | `docs/02-tutorials/deploy-to-server.md` | 重构 | P1 |
| `docs/api/course-management.md` | `docs/04-reference/api/course.md` | 重构 | P1 |
| `docs/api/authentication.md` | `docs/04-reference/api/auth.md` | 迁移 | P1 |
| `docs/api/swagger.yaml` | `docs/04-reference/api/openapi.yaml` | 迁移 | P0 |
| `docs/architecture/system-overview.md` | `docs/05-explanation/system-design.md` | 迁移 | P1 |
| `docs/architecture/api-permission-matrix.md` | `docs/05-explanation/rbac-model.md` | 合并 | P2 |
| `docs/ai/README.md` | `docs/05-explanation/ai-pipeline.md` | 迁移 | P1 |
| `docs/DOCUMENTATION_CATALOG.md` | 删除 (由目录结构替代) | 删除 | P2 |
| `docs/contributing/` | `docs/06-contributing/` | 迁移 | P1 |
| `docs/deployment/backup-recovery.md` | `docs/03-how-to-guides/backup-database.md` | **补全** | P1 |
| `docs/deployment/monitoring.md` | `docs/03-how-to-guides/setup-monitoring.md` | **补全** | P2 |
| `docs/deployment/docker-deployment.md` | `docs/03-how-to-guides/docker-deploy.md` | **补全** | P1 |

### 4.2 需新建文档

| 文档 | 路径 | 优先级 |
|------|------|--------|
| 环境要求 | `docs/01-getting-started/prerequisites.md` | P0 |
| 文档规范 | `docs/06-contributing/doc-style.md` | P0 |
| 测试指南 | `docs/06-contributing/testing-guide.md` | P1 |
| CLI 参考 | `docs/04-reference/cli/README.md` | P2 |

---

## 五、实施计划

### Phase 1: 基础设施 (1 周)
1. 创建新目录结构
2. 编写 `doc-style.md` 文档规范
3. 创建文档模板 (`templates/`)
4. 迁移 P0 优先级文档

### Phase 2: 核心迁移 (2 周)
1. 迁移 API 参考文档
2. 迁移架构说明文档
3. 补全关键 How-to 指南
4. 更新所有内部链接

### Phase 3: 质量提升 (1 周)
1. 内容审查与校对
2. 删除废弃文档
3. 验证所有链接有效
4. 添加搜索索引 (可选)

---

## 六、验证方式

### 6.1 自动化检查
```bash
# 链接检查 (需安装 markdown-link-check)
npx markdown-link-check docs/**/*.md

# 格式检查 (需安装 markdownlint)
npx markdownlint docs/**/*.md
```

### 6.2 人工审查
- [ ] 每个目录有 README.md
- [ ] 所有模板已创建
- [ ] P0 文档已迁移
- [ ] 内部链接有效

---

## 七、User Review Required

> [!IMPORTANT]
> 请审核以下关键决策：
> 1. **目录结构**: 是否接受 01-07 编号前缀?
> 2. **删除文档**: `DOCUMENTATION_CATALOG.md` 将被删除，改用目录结构自描述
> 3. **语言策略**: 保持中文为主，技术术语使用英文
