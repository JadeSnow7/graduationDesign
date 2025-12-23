# 代码库 (Code Base)

本目录包含项目的所有可执行代码，按功能模块组织。

## 目录结构

- **[frontend/](./frontend/)** - 前端代码 (Vue.js)
- **[backend/](./backend/)** - 后端代码 (Go)
- **[ai_service/](./ai_service/)** - AI服务代码 (Python)
- **[simulation/](./simulation/)** - 仿真服务代码 (Python)
- **[shared/](./shared/)** - 共享资源和配置
- **[deployment/](./deployment/)** - 部署配置文件
- **[scripts/](./scripts/)** - 构建和部署脚本

## 快速开始

1. 查看各模块的 README.md 了解具体使用方法
2. 使用 `docker-compose.yml` 启动开发环境
3. 参考 `deployment/` 目录进行生产部署

## 开发环境

- 前端: Vue.js + TypeScript + Vite
- 后端: Go + Gin + GORM
- AI服务: Python + FastAPI
- 仿真服务: Python + NumPy/SciPy
- 数据库: PostgreSQL
- 缓存: Redis

## 相关文档

- [架构文档](../docs/architecture/)
- [API文档](../docs/api/)
- [部署文档](../docs/deployment/)