# 开发文档

本目录包含项目开发相关的所有文档和指南。

## 文档列表

### [开发环境搭建](./development-setup.md)
- 本地开发环境配置
- 开发工具安装
- IDE 配置建议
- 调试环境设置

### [代码规范](./coding-standards.md)
- Go 代码规范
- TypeScript/Vue 代码规范
- Python 代码规范
- 提交信息规范

### [开发工作流](./development-workflow.md)
- Git 工作流程
- 分支管理策略
- 代码审查流程
- 发布流程

### [测试指南](./testing-guide.md)
- 单元测试编写
- 集成测试策略
- API 测试方法
- 性能测试指南

### [调试指南](./debugging-guide.md)
- 后端调试技巧
- 前端调试方法
- 数据库调试
- 服务间调试

### [贡献指南](./contributing.md)
- 如何贡献代码
- Issue 提交规范
- Pull Request 流程
- 社区行为准则

## 技术栈概览

### 后端技术栈
- **语言**: Go 1.21+
- **框架**: Gin Web Framework
- **数据库**: MySQL 8.0+
- **ORM**: GORM
- **认证**: JWT
- **文档**: Swagger/OpenAPI

### 前端技术栈
- **语言**: TypeScript
- **框架**: Vue 3
- **构建工具**: Vite
- **UI 库**: Element Plus / Tailwind CSS
- **状态管理**: Pinia
- **HTTP 客户端**: Axios

### AI 服务技术栈
- **语言**: Python 3.9+
- **框架**: FastAPI
- **AI 库**: LangChain, OpenAI
- **向量数据库**: FAISS/Chroma
- **异步**: asyncio, uvicorn

### 仿真服务技术栈
- **语言**: Python 3.9+
- **框架**: FastAPI
- **科学计算**: NumPy, SciPy
- **可视化**: Matplotlib, Plotly
- **数值计算**: finite difference, finite element

### 基础设施
- **容器化**: Docker, Docker Compose
- **数据库**: MySQL, Redis (可选)
- **监控**: Prometheus, Grafana (可选)
- **日志**: 结构化日志 (JSON)

## 项目结构

```
education-project/
├── code/                           # 代码库
│   ├── frontend/                   # 前端应用
│   │   ├── src/
│   │   │   ├── components/         # Vue 组件
│   │   │   ├── views/              # 页面视图
│   │   │   ├── stores/             # 状态管理
│   │   │   ├── api/                # API 调用
│   │   │   └── utils/              # 工具函数
│   │   ├── public/                 # 静态资源
│   │   └── package.json
│   │
│   ├── backend/                    # 后端服务
│   │   ├── cmd/server/             # 应用入口
│   │   ├── internal/               # 内部包
│   │   │   ├── auth/               # 认证模块
│   │   │   ├── models/             # 数据模型
│   │   │   ├── handlers/           # HTTP 处理器
│   │   │   ├── services/           # 业务逻辑
│   │   │   └── repository/         # 数据访问
│   │   ├── migrations/             # 数据库迁移
│   │   └── go.mod
│   │
│   ├── ai_service/                 # AI 服务
│   │   ├── app/
│   │   │   ├── main.py             # 应用入口
│   │   │   ├── models/             # 数据模型
│   │   │   ├── services/           # 业务逻辑
│   │   │   └── utils/              # 工具函数
│   │   └── requirements.txt
│   │
│   ├── simulation/                 # 仿真服务
│   │   ├── app/
│   │   │   ├── main.py             # 应用入口
│   │   │   ├── solvers/            # 数值求解器
│   │   │   ├── visualization/      # 可视化模块
│   │   │   └── models/             # 物理模型
│   │   └── requirements.txt
│   │
│   ├── shared/                     # 共享资源
│   │   ├── configs/                # 配置文件
│   │   ├── schemas/                # 数据模式
│   │   └── docs/                   # 内部文档
│   │
│   ├── deployment/                 # 部署配置
│   │   ├── docker/                 # Docker 配置
│   │   ├── kubernetes/             # K8s 配置
│   │   └── nginx/                  # 反向代理配置
│   │
│   ├── scripts/                    # 构建和部署脚本
│   │   ├── build.sh                # 构建脚本
│   │   ├── deploy.sh               # 部署脚本
│   │   └── test.sh                 # 测试脚本
│   │
│   ├── docker-compose.yml          # 开发环境编排
│   └── .env.example                # 环境变量模板
│
├── docs/                           # 技术文档
├── academic/                       # 学术材料
├── assets/                         # 静态资源
└── README.md                       # 项目说明
```

## 开发环境快速搭建

### 1. 克隆项目
```bash
git clone <repository-url>
cd education-project
```

### 2. 安装依赖

#### 后端依赖
```bash
cd code/backend
go mod tidy
```

#### 前端依赖
```bash
cd code/frontend
npm install
```

#### AI 服务依赖
```bash
cd code/ai_service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 仿真服务依赖
```bash
cd code/simulation
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. 配置环境变量
```bash
cp code/.env.example code/.env
# 编辑 .env 文件，配置数据库和其他必要参数
```

### 4. 启动数据库
```bash
cd code
docker-compose up -d mysql
```

### 5. 启动服务

#### 后端服务
```bash
cd code/backend
go run cmd/server/main.go
```

#### AI 服务
```bash
cd code/ai_service
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

#### 仿真服务
```bash
cd code/simulation
source venv/bin/activate
uvicorn app.main:app --reload --port 8002
```

#### 前端服务
```bash
cd code/frontend
npm run dev
```

## 开发工具推荐

### IDE/编辑器
- **Go**: GoLand, VS Code with Go extension
- **TypeScript/Vue**: WebStorm, VS Code with Vetur/Volar
- **Python**: PyCharm, VS Code with Python extension

### 调试工具
- **API 测试**: Postman, Insomnia
- **数据库**: MySQL Workbench, DBeaver
- **容器管理**: Docker Desktop, Portainer

### 代码质量工具
- **Go**: golangci-lint, gofmt, go vet
- **TypeScript**: ESLint, Prettier
- **Python**: black, flake8, mypy

## 开发最佳实践

### 代码组织
1. 遵循各语言的标准项目结构
2. 保持模块间的低耦合高内聚
3. 使用依赖注入提高可测试性
4. 编写清晰的接口和文档

### 错误处理
1. 使用结构化的错误类型
2. 提供有意义的错误信息
3. 记录详细的错误日志
4. 实现优雅的错误恢复

### 性能优化
1. 使用数据库索引优化查询
2. 实现适当的缓存策略
3. 避免 N+1 查询问题
4. 使用连接池管理数据库连接

### 安全考虑
1. 输入验证和参数化查询
2. 实现适当的认证和授权
3. 使用 HTTPS 和安全头
4. 定期更新依赖库

## 测试策略

### 单元测试
- 覆盖核心业务逻辑
- 使用 mock 隔离外部依赖
- 保持测试的独立性和可重复性

### 集成测试
- 测试服务间的交互
- 验证数据库操作
- 测试 API 端到端流程

### 性能测试
- 压力测试关键接口
- 监控资源使用情况
- 验证系统扩展性

## 部署流程

### 开发环境
1. 使用 Docker Compose 一键启动
2. 支持热重载和实时调试
3. 模拟生产环境配置

### 测试环境
1. 自动化构建和部署
2. 运行完整的测试套件
3. 性能和安全测试

### 生产环境
1. 蓝绿部署或滚动更新
2. 健康检查和监控
3. 自动回滚机制

## 监控和日志

### 应用监控
- 响应时间和吞吐量
- 错误率和可用性
- 资源使用情况

### 业务监控
- 用户活跃度
- 功能使用统计
- 性能指标

### 日志管理
- 结构化日志格式
- 集中式日志收集
- 日志分析和告警

## 相关资源

- [API 文档](../api/)
- [部署文档](../deployment/)
- [架构文档](../architecture/)
- [项目 Wiki](https://github.com/your-org/education-project/wiki)