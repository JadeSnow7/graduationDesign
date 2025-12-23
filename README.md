# 电磁场课程智能教学平台

> 基于微服务架构的智能教学平台，集成AI辅助教学、电磁场仿真计算与可视化功能

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.24+-blue.svg)](https://golang.org/)
[![Vue Version](https://img.shields.io/badge/Vue-3.5+-green.svg)](https://vuejs.org/)
[![Python Version](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org/)

## 📋 项目概览

本项目是一个面向电磁场课程的智能教学平台，旨在通过AI技术和数值仿真提升教学效果。平台采用微服务架构，支持多角色权限管理，提供课程管理、AI答疑、作业批改和电磁场仿真等核心功能。

### 🎯 核心特性

- **🤖 AI 智能辅助**: 基于大语言模型的智能答疑和作业批改
- **🔬 电磁场仿真**: 支持多种电磁场模型的数值计算与可视化
- **👥 多角色管理**: 支持管理员、教师、助教、学生等多种角色
- **📱 移动端适配**: 支持企业微信H5应用集成
- **🔐 安全认证**: JWT + RBAC 权限控制体系
- **📊 学情分析**: 学习数据统计与分析功能

## 🏗️ 项目架构

### 技术栈

| 组件 | 技术选型 | 版本 |
|------|---------|------|
| 前端 | Vue.js + TypeScript + Vite | 3.5+ |
| 后端 | Go + Gin + GORM | 1.24+ |
| AI服务 | Python + FastAPI | 3.9+ |
| 仿真服务 | Python + NumPy + SciPy | 3.9+ |
| 数据库 | MySQL | 8.4+ |
| 容器化 | Docker + Docker Compose | - |

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端API       │    │   AI服务        │
│   Vue.js        │◄──►│   Go + Gin      │◄──►│   FastAPI       │
│   Port: 5173    │    │   Port: 8080    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   数据库        │    │   仿真服务      │
                       │   MySQL         │    │   FastAPI       │
                       │   Port: 3306    │    │   Port: 8002    │
                       └─────────────────┘    └─────────────────┘
```

## 📁 项目结构

```
education-project/
├── 📄 README.md                    # 项目总览和导航
├── 📄 CHANGELOG.md                 # 变更日志
├── 📄 CONTRIBUTING.md              # 贡献指南
├── 📄 TECHNICAL_DEBT.md            # 技术债务跟踪
├── 📄 .gitignore                   # Git忽略规则
│
├── 💻 code/                        # 代码库
│   ├── 🌐 frontend/               # 前端代码 (Vue.js)
│   ├── ⚙️ backend/                # 后端代码 (Go)
│   ├── 🤖 ai_service/             # AI服务 (Python)
│   ├── 🔬 simulation/             # 仿真服务 (Python)
│   ├── 📦 shared/                 # 共享资源
│   ├── 🚀 deployment/             # 部署配置
│   └── 📜 scripts/                # 构建脚本
│
├── 🎓 academic/                    # 学术材料
│   ├── 📖 thesis/                 # 毕业论文
│   ├── 📊 reports/                # 研究报告
│   ├── 📚 literature/             # 相关文献
│   └── 🎤 presentations/          # 演示材料
│
├── 📚 docs/                        # 技术文档
│   ├── 🏗️ architecture/           # 架构文档
│   ├── 🔌 api/                    # API文档
│   ├── 🚀 deployment/             # 部署文档
│   └── 💻 development/            # 开发文档
│
└── 🎨 assets/                      # 静态资源
    ├── 🖼️ images/                 # 图片资源
    ├── 📊 diagrams/               # 架构图
    └── 📋 templates/              # 模板文件
```

## 🚀 快速开始

### 环境要求

- Docker & Docker Compose
- Go 1.24+ (开发环境)
- Node.js 18+ (开发环境)
- Python 3.9+ (开发环境)

### 一键部署

```bash
# 1. 克隆项目
git clone <repository-url>
cd education-project

# 2. 配置环境变量
cp code/.env.example code/.env
# 编辑 code/.env 文件，配置数据库和AI服务参数

# 3. 启动所有服务
cd code
docker-compose up -d

# 4. 验证服务状态
curl http://localhost:8080/healthz  # 后端服务
curl http://localhost:8001/healthz  # AI服务
curl http://localhost:8002/healthz  # 仿真服务
```

### 开发环境搭建

#### 后端开发
```bash
cd code/backend
go mod download
go run cmd/server/main.go
```

#### 前端开发
```bash
cd code/frontend
npm install
npm run dev
```

#### AI服务开发
```bash
cd code/ai_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

#### 仿真服务开发
```bash
cd code/simulation
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

## 🔧 配置说明

### 环境变量配置

主要配置项说明：

```bash
# 数据库配置
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=emfield_platform
MYSQL_USER=emfield_user
MYSQL_PASSWORD=your_password

# 后端配置
BACKEND_JWT_SECRET=your_jwt_secret
BACKEND_CORS_ORIGINS=http://localhost:5173

# AI服务配置
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=your_api_key
LLM_MODEL=gpt-3.5-turbo

# 企业微信配置（可选）
WECOM_CORPID=your_corp_id
WECOM_AGENTID=your_agent_id
WECOM_SECRET=your_secret
```

### 默认账号

系统初始化时会创建以下默认账号：

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 全部权限 |
| 教师 | teacher | teacher123 | 课程管理、AI/仿真 |
| 学生 | student | student123 | 课程查看、AI/仿真 |

## 📖 文档导航

### 🏗️ 架构文档
- [系统架构概览](docs/architecture/system-overview.md)
- [组件设计说明](docs/architecture/component-design.md)

### 🔌 API 文档
- [认证接口](docs/api/authentication.md)
- [课程管理接口](docs/api/course-management.md)
- [AI服务接口](docs/api/ai-services.md)
- [仿真服务接口](docs/api/simulation-services.md)

### 🚀 部署文档
- [快速开始指南](docs/deployment/quick-start.md)
- [生产环境部署](docs/deployment/README.md)

### 💻 开发文档
- [开发环境配置](docs/development/README.md)
- [代码规范](CONTRIBUTING.md)

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详细信息。

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- Go: 遵循 `gofmt` 和 `golint` 规范
- TypeScript: 遵循 ESLint 配置
- Python: 遵循 PEP 8 规范
- 提交信息: 遵循 [Conventional Commits](https://conventionalcommits.org/) 规范

## 📊 项目状态

- ✅ 基础架构搭建完成
- ✅ 用户认证与权限管理
- ✅ 课程管理功能
- ✅ AI答疑服务
- ✅ 电磁场仿真服务
- 🚧 学情分析功能开发中
- 📋 企业微信集成计划中

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者: [项目团队]
- 邮箱: [联系邮箱]
- 项目主页: [项目链接]

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和研究人员。

---

**快速链接**: [代码库](code/) | [学术材料](academic/) | [技术文档](docs/) | [静态资源](assets/) | [更新日志](CHANGELOG.md)

