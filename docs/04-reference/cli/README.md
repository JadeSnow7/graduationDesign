# CLI 参考手册

本平台包含多个服务，提供了一系列命令行工具用于开发、部署和运维。

## 后端 (Go)

后端服务支持通过 `make` 命令或直接运行二进制文件进行管理。

### 常用命令

| 命令 | 描述 |
|------|------|
| `make run` | 启动开发服务器 (热重载) |
| `make build` | 编译生产环境二进制文件 |
| `make migrate` | 执行数据库迁移 |
| `make test` | 运行单元测试 |

### 数据库迁移

使用 `golang-migrate` 管理数据库变更。

```bash
# 创建新迁移文件
migrate create -ext sql -dir db/migrations -seq create_users_table

# 执行向上迁移
migrate -path db/migrations -database "mysql://root:password@tcp(localhost:3306)/dbname" up

# 回滚最近一次迁移
migrate -path db/migrations -database "mysql://root:password@tcp(localhost:3306)/dbname" down 1
```

## 前端 (React)

即基于 Vite 的标准命令。

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产环境代码 |
| `npm run lint` | 代码风格检查 |
| `npm run preview` | 预览生产构建 |

## AI 服务 (Python)

```bash
# 启动 API 服务
uvicorn app.main:app --reload --port 8001

# 运行测试
pytest
```

## Docker Compose

用于容器化部署和管理。

```bash
# 启动所有服务 (后台模式)
docker-compose up -d

# 查看日志
docker-compose logs -f [service_name]

# 重启指定服务
docker-compose restart backend
```
