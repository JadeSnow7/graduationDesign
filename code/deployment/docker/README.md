# Docker 配置

本目录包含项目的 Docker 相关配置文件。

## 文件说明

- `docker-compose.dev.yml` - 开发环境配置
- `docker-compose.prod.yml` - 生产环境配置
- `Dockerfile.*` - 各服务的 Docker 镜像构建文件
- `nginx/` - Nginx 反向代理配置
- `monitoring/` - 监控相关配置

## 使用方法

### 开发环境
```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 停止开发环境
docker-compose -f docker-compose.dev.yml down
```

### 生产环境
```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 停止生产环境
docker-compose -f docker-compose.prod.yml down
```

## 健康检查

所有服务都配置了健康检查，可以通过以下命令查看状态：

```bash
docker-compose ps
```