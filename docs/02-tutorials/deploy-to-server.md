# 部署到服务器

> 本教程将指导您将智能教学平台部署到 Ubuntu 服务器。

## 前提条件

- Ubuntu 22.04+ 服务器
- Docker 和 Docker Compose 已安装
- 域名 (可选，用于 HTTPS)

## 步骤

### 1. 克隆项目

```bash
git clone https://github.com/JadeSnow7/graduationDesign.git
cd graduationDesign/code
```

### 2. 配置环境变量

```bash
cp deployment/.env.example .env
```

编辑 `.env` 文件：

```bash
# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_NAME=education_db
DB_USER=root
DB_PASSWORD=your_secure_password

# JWT 密钥 (请使用随机生成的强密钥)
JWT_SECRET=your_jwt_secret_here

# AI 服务配置
LLM_BASE_URL=https://api.openai.com
LLM_API_KEY=your_openai_api_key
LLM_MODEL=gpt-4o-mini
```

### 3. 启动服务

```bash
docker-compose up -d --build
```

### 4. 验证部署

```bash
# 检查服务状态
docker-compose ps

# 验证后端健康检查
curl http://localhost:8080/healthz

# 验证 AI 服务
curl http://localhost:8001/healthz
```

### 5. 配置反向代理 (可选)

使用 Nginx 配置 HTTPS：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
    }
}
```

## 常见问题

### 端口被占用

```bash
# 检查端口占用
lsof -i :8080

# 修改 docker-compose.yml 中的端口映射
```

### 数据库连接失败

1. 确认 MySQL 容器已启动: `docker-compose ps`
2. 检查环境变量配置
3. 查看日志: `docker-compose logs mysql`

## 下一步

- [配置监控](../03-how-to-guides/deployment/monitoring.md)
- [配置备份](../03-how-to-guides/deployment/backup-recovery.md)
