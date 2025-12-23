# 项目仓库整理设计文档

## 概览

本设计文档描述了如何重新组织毕业设计项目仓库，将现有的混杂文件结构转换为清晰、模块化、易于维护的项目结构。设计遵循关注点分离原则，将代码、文档、学术材料和配置文件按功能和用途进行分类组织。

## 架构

### 整体架构设计

```
education-project/
├── README.md                    # 项目总览和导航
├── .gitignore                   # Git忽略规则
├── LICENSE                      # 许可证
├── CHANGELOG.md                 # 变更日志
│
├── code/                        # 代码库
│   ├── README.md               # 代码库说明
│   ├── frontend/              # 前端代码
│   ├── backend/               # 后端代码
│   ├── ai_service/            # AI服务
│   ├── simulation/            # 仿真服务
│   ├── shared/                # 共享资源
│   ├── deployment/             # 部署配置
│   └── scripts/                # 构建和部署脚本
│
├── academic/                    # 学术材料
│   ├── README.md               # 学术材料说明
│   ├── thesis/                 # 毕业论文
│   ├── reports/                # 各类报告
│   ├── literature/             # 相关文献
│   └── presentations/          # 演示材料
│
├── docs/                        # 技术文档
│   ├── README.md               # 文档索引
│   ├── architecture/           # 架构文档
│   ├── api/                    # API文档
│   ├── deployment/             # 部署文档
│   └── development/            # 开发文档
│
└── assets/                      # 静态资源
    ├── README.md               # 资源说明
    ├── images/                 # 图片资源
    ├── diagrams/               # 架构图等
    └── templates/              # 模板文件
```

### 分层设计原则

1. **功能分离**: 代码、文档、学术材料完全分离
2. **模块化**: 每个目录都有独立的README和配置
3. **可导航**: 提供多层次的导航和索引系统
4. **标准化**: 遵循行业标准的目录命名和组织方式
5. **顶层拆分**: code/ 下按前端、后端、AI、仿真进行一级目录拆分

## 组件和接口

### 代码库组件 (code/)

#### 顶层模块结构
```
code/
├── README.md                   # 代码库说明
├── docker-compose.yml         # 开发环境
├── .env.example               # 环境变量模板
│
├── frontend/                   # 前端代码
│   ├── README.md
│   ├── package.json
│   ├── src/
│   ├── public/
│   └── dist/
│
├── backend/                    # 后端代码
│   ├── README.md
│   ├── go.mod
│   ├── cmd/
│   ├── internal/
│   └── migrations/
│
├── ai_service/                 # AI服务
│   ├── README.md
│   └── src/
│
├── simulation/                 # 仿真服务
│   ├── README.md
│   └── src/
│
├── shared/                     # 共享资源
│   ├── README.md
│   ├── configs/               # 配置文件
│   ├── schemas/               # 数据模式
│   └── docs/                  # 内部文档
│
├── deployment/                 # 部署配置
└── scripts/                    # 构建和部署脚本
```

#### 部署配置组件
```
code/deployment/
├── README.md                   # 部署说明（配置文件）
├── docker/                    # Docker配置
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.prod.yml
├── kubernetes/                # K8s配置
├── nginx/                     # 反向代理配置
└── monitoring/                # 监控配置
```

### 学术材料组件 (academic/)

#### 论文组件
```
academic/thesis/
├── README.md                   # 论文说明
├── proposal/                  # 开题报告
│   ├── 开题报告.md
│   └── proposal-slides.pdf
├── draft/                     # 论文草稿
│   ├── src/
│   └── build/
├── final/                     # 最终版本
│   ├── src/
│   │   ├── main.tex
│   │   ├── chapters/
│   │   ├── figures/
│   │   └── references.bib
│   └── build/
│       └── main.pdf
└── defense/                   # 答辩材料
    ├── defense-slides.pdf
    └── demo-script.md
```

#### 文献管理组件
```
academic/literature/
├── README.md                   # 文献索引
├── papers/                    # 原始论文
│   ├── attention-is-all-you-need.pdf
│   └── retrieval-augmented-generation.pdf
├── translations/              # 翻译文档
│   ├── attention-translation.md
│   └── rag-translation.md
├── notes/                     # 阅读笔记
└── bibliography.bib           # 参考文献库
```

### 文档系统组件 (docs/)

#### 架构文档
```
docs/architecture/
├── README.md                   # 架构概览
├── system-overview.md         # 系统总览
├── component-design.md        # 组件设计
├── data-flow.md              # 数据流设计
└── diagrams/                 # 架构图
    ├── system-architecture.mmd
    └── component-diagram.mmd
```

#### API文档
```
docs/api/
├── README.md                   # API概览
├── authentication.md          # 认证接口
├── course-management.md       # 课程管理接口
├── ai-services.md            # AI服务接口
└── openapi.yaml              # OpenAPI规范
```

## 数据模型

### 文件组织模型

```yaml
FileOrganization:
  root_directory: "education-project"
  categories:
    - name: "code"
      type: "executable"
      subcategories: ["frontend", "backend", "ai_service", "simulation", "shared", "deployment", "scripts"]
    - name: "academic"
      type: "document"
      subcategories: ["thesis", "reports", "literature", "presentations"]
    - name: "docs"
      type: "documentation"
      subcategories: ["architecture", "api", "deployment", "development"]
    - name: "assets"
      type: "resource"
      subcategories: ["images", "diagrams", "templates"]
```

### 导航模型

```yaml
NavigationStructure:
  levels:
    - level: 1
      file: "README.md"
      scope: "project_overview"
    - level: 2
      files: ["code/README.md", "academic/README.md", "docs/README.md", "assets/README.md"]
      scope: "category_overview"
    - level: 3
      pattern: "*/*/README.md"
      scope: "module_specific"
```

## 正确性属性

*属性是应该在系统的所有有效执行中保持为真的特征或行为——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性反思

在分析所有可测试属性后，我发现了一些可以合并的冗余属性：

- 属性1.1、1.2、1.3可以合并为一个综合的"代码目录结构完整性"属性
- 属性2.1-2.5可以合并为"学术材料组织完整性"属性  
- 属性3.1-3.5可以合并为"文档系统完整性"属性
- 属性4.1-4.5可以合并为"配置管理完整性"属性
- 属性5.1-5.5可以合并为"代码质量支持完整性"属性

这样可以减少冗余，每个属性提供独特的验证价值。

### 核心属性

**属性 1: 代码目录结构完整性**
*对于任何* 项目仓库，`code/` 目录应该包含 `frontend/`、`backend/`、`ai_service/`、`simulation/` 顶层子目录，并提供 `shared/`、`deployment/`、`scripts/` 的统一入口
**验证需求: 1.1, 1.2, 1.3, 1.5**

**属性 2: 学术材料组织完整性**
*对于任何* 学术目录，应该包含论文、报告、文献、演示材料的分类子目录，且LaTeX源码与编译产物分离存储（如 `src/` 与 `build/`）
**验证需求: 2.1, 2.2, 2.3, 2.4, 2.5**

**属性 3: 文档系统完整性**
*对于任何* 文档目录，应该包含架构文档、API文档、部署指南、开发规范，且每个目录都有README索引
**验证需求: 3.1, 3.2, 3.3, 3.4, 3.5**

**属性 4: 配置管理完整性**
*对于任何* 项目仓库，应该包含环境配置脚本、Docker配置、环境变量模板、监控配置、备份脚本，并在 `code/scripts/` 与 `code/deployment/` 提供清晰入口
**验证需求: 4.1, 4.2, 4.3, 4.4, 4.5**

**属性 5: 代码质量支持完整性**
*对于任何* 代码库，应该遵循统一的命名规范，包含API文档、测试配置、变更日志、技术债务文档
**验证需求: 5.1, 5.2, 5.3, 5.4, 5.5**

## 错误处理

### 文件迁移错误处理

1. **文件冲突处理**: 当目标位置已存在同名文件时，创建备份并记录冲突
2. **权限错误处理**: 检查文件读写权限，提供清晰的错误信息
3. **路径长度限制**: 处理操作系统路径长度限制，提供路径缩短建议
4. **编码问题处理**: 处理文件名编码问题，确保跨平台兼容性

### 结构验证错误处理

1. **缺失目录处理**: 自动创建缺失的目录结构
2. **配置文件缺失**: 从模板自动生成缺失的配置文件
3. **链接失效处理**: 检查并修复README中的失效链接
4. **格式验证错误**: 提供格式修复建议和自动修复选项

## 测试策略

### 双重测试方法

本项目将采用单元测试和属性测试相结合的方法：

- **单元测试**: 验证特定的文件操作、目录创建、配置生成等具体功能
- **属性测试**: 验证整体结构完整性、命名规范一致性等通用属性

### 单元测试覆盖

- 文件迁移操作的正确性
- README生成的内容完整性
- 配置文件模板的有效性
- 目录结构创建的准确性

### 属性测试配置

- **测试框架**: 使用适合文件系统操作的属性测试库
- **测试迭代**: 每个属性测试运行最少100次迭代
- **属性标记**: 每个属性测试都标记对应的设计文档属性编号
- **测试格式**: 使用格式 '**Feature: repository-organization, Property {number}: {property_text}**'

### 测试数据生成

- 生成各种文件名和路径组合
- 模拟不同的项目结构场景
- 创建边界条件测试用例（空目录、特殊字符等）
- 跨平台兼容性测试数据

### 集成测试

- 完整的仓库重组流程测试
- 多步骤操作的事务性验证
- 回滚机制的有效性测试
- 用户工作流的端到端验证
