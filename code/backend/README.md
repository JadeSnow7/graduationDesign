# 后端代码 (Backend)

基于 Go 语言的后端服务，提供 RESTful API 和业务逻辑处理。

## 技术栈

- Go 1.21+
- Gin (Web框架)
- GORM (ORM)
- PostgreSQL (数据库)
- Redis (缓存)
- JWT (身份认证)

## 开发环境

```bash
# 安装依赖
go mod download

# 运行开发服务器
go run cmd/server/main.go

# 构建可执行文件
go build -o bin/server cmd/server/main.go
```

## 项目结构

```
internal/
├── auth/          # 身份认证
├── authz/         # 权限控制
├── clients/       # 外部服务客户端
├── config/        # 配置管理
├── db/           # 数据库连接
├── http/         # HTTP处理器
├── middleware/   # 中间件
├── models/       # 数据模型
├── repo/         # 数据访问层
└── service/      # 业务逻辑层
```

## 主要功能

- 用户认证和授权
- 课程管理API
- 企业微信集成
- AI服务代理
- 仿真服务代理

## 数据库迁移

```bash
# 运行迁移
go run cmd/migrate/main.go up

# 回滚迁移
go run cmd/migrate/main.go down
```

## 相关文档

- [API文档](../../docs/api/)
- [数据库设计](../../docs/architecture/database.md)