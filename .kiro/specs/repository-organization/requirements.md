# 项目仓库整理需求文档

## 介绍

本项目需要对现有的毕业设计仓库进行重新组织，将混杂的文件按照功能和类型进行分类整理，创建清晰的项目结构和导航，提升项目的可维护性和可读性。

## 目标范围

- 统一代码、文档与学术材料的归档结构，建立清晰的目录边界
- 提供可发现的导航入口与索引，降低查找成本
- 将部署、配置与运行方式集中管理，便于环境搭建与交付

## 非目标

- 不修改业务逻辑或重写功能代码
- 不替换已有技术栈或引入新的运行依赖
- 不删除历史文件，仅进行归档与整理（必要时保留原路径映射记录）

## 术语表

- **Repository**: 项目仓库，包含所有项目相关文件
- **Code_Base**: 代码库，包含前端、后端、AI服务等可执行代码
- **Documentation**: 文档，包括技术文档、API文档、用户手册等
- **Academic_Papers**: 学术论文，包括开题报告、毕业论文、相关文献等
- **Project_Structure**: 项目结构，指文件和目录的组织方式
- **Navigation_System**: 导航系统，帮助用户快速找到所需内容的索引和链接

## 目录结构草案

```
/
  Code_Base/
    frontend/
    backend/
    ai_service/
    simulation/
    shared/
  Documentation/
    architecture/
    deployment/
    api/
    contributing/
  Academic_Papers/
    proposal/
    thesis/
    progress/
    references/
    slides/
  Configs/
  Scripts/
  Assets/
  README.md
  CHANGELOG.md
```

## 命名规范

- 顶层目录名称与术语保持一致，子目录采用小写+下划线
- 每个一级目录必须包含 `README.md` 或 `index.md` 作为入口
- 文档与脚本使用可读英文名称，必要时追加日期（如 `deployment_guide_2024.md`）

## 迁移与验收流程

1. 盘点现有文件并形成分类清单（记录原路径与新路径映射）
2. 按目录结构草案迁移文件，修复相对路径与文档链接
3. 更新导航入口（根 `README.md` 与 `Documentation/index.md`）
4. 按验收标准逐项检查并形成验收记录

## 阶段计划

- 阶段 1：目录归类与导航入口（README、索引、目录边界）
- 阶段 2：文档完善与规范化（架构、部署、贡献、API）
- 阶段 3：配置、脚本与运维支持（Docker、备份、健康检查）

## 需求

### 需求 1

**用户故事**: 作为项目维护者，我希望将代码按照功能模块分类组织，以便于开发和维护。

#### 验收标准

1. WHEN 查看项目根目录 THEN Repository SHALL 包含 `Code_Base/` 作为独立代码目录
2. WHEN 访问代码目录 THEN Code_Base SHALL 按 `frontend/`、`backend/`、`ai_service/`、`simulation/` 分类组织
3. WHEN 查看每个代码模块 THEN Code_Base SHALL 至少包含 `README.md`、构建/运行说明与配置模板（如 `.env.example`）
4. WHEN 开发者需要定位特定功能 THEN Project_Structure SHALL 保持模块间隔离，跨模块共享代码统一放入 `shared/`
5. WHEN 部署系统 THEN Code_Base SHALL 提供统一的部署入口与脚本位置说明（见 `Documentation/deployment/`）

### 需求 2

**用户故事**: 作为学术研究者，我希望将论文和学术文档独立组织，以便于学术工作的管理。

#### 验收标准

1. WHEN 查看学术内容 THEN Academic_Papers SHALL 包含 `proposal/`、`thesis/`、`progress/` 目录
2. WHEN 查找相关文献 THEN Academic_Papers SHALL 在 `references/` 中区分原文PDF与翻译文档
3. WHEN 撰写论文 THEN Academic_Papers SHALL 将 LaTeX 源码与编译产物分离存放（如 `src/` 与 `build/`）
4. WHEN 追踪研究进展 THEN Academic_Papers SHALL 包含计划与进度记录并按日期归档
5. WHEN 准备答辩 THEN Academic_Papers SHALL 包含 `slides/` 与答辩材料清单

### 需求 3

**用户故事**: 作为项目用户，我希望有清晰的README和导航系统，以便快速了解项目和找到所需内容。

#### 验收标准

1. WHEN 首次访问项目 THEN Navigation_System SHALL 在根 `README.md` 提供项目概览与快速入门
2. WHEN 查找特定内容 THEN Navigation_System SHALL 在 `Documentation/index.md` 提供分类索引与直达链接
3. WHEN 了解项目架构 THEN Documentation SHALL 在 `architecture/` 提供系统架构图与技术说明
4. WHEN 部署项目 THEN Documentation SHALL 在 `deployment/` 提供部署指南与环境配置
5. WHEN 贡献代码 THEN Documentation SHALL 在 `contributing/` 提供开发规范与贡献指南

### 需求 4

**用户故事**: 作为系统管理员，我希望有统一的配置管理和部署脚本，以便于环境搭建和维护。

#### 验收标准

1. WHEN 搭建开发环境 THEN Repository SHALL 在 `Scripts/` 提供可执行的一键环境脚本
2. WHEN 部署到生产环境 THEN Repository SHALL 提供 Docker 相关配置（如 `docker-compose.yml` 或 `Dockerfile`）
3. WHEN 管理配置文件 THEN Repository SHALL 在 `Configs/` 提供环境变量模板与说明文档
4. WHEN 监控系统状态 THEN Repository SHALL 提供健康检查与日志配置说明
5. WHEN 备份和恢复 THEN Repository SHALL 提供备份与恢复脚本及使用说明

### 需求 5

**用户故事**: 作为代码审查者，我希望有清晰的代码组织和文档，以便于理解和审查代码质量。

#### 验收标准

1. WHEN 审查代码结构 THEN Code_Base SHALL 遵循命名规范并在目录入口说明模块职责
2. WHEN 理解业务逻辑 THEN Code_Base SHALL 在 `Documentation/api/` 或模块 `README.md` 中提供 API 与关键说明
3. WHEN 检查代码质量 THEN Code_Base SHALL 具备测试目录与质量检查配置入口（如 `tests/` 与 `lint` 说明）
4. WHEN 追踪变更历史 THEN Repository SHALL 包含 `CHANGELOG.md` 并保持更新
5. WHEN 评估技术债务 THEN Documentation SHALL 包含已知问题与改进计划清单

## 最小交付物

- 根 `README.md` 与 `Documentation/index.md`
- `Code_Base/` 下各模块 `README.md` 与运行/配置说明
- `Academic_Papers/` 分类目录与索引说明
- `Configs/`、`Scripts/`、`CHANGELOG.md` 的基础占位与说明
