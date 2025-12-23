# 快速开始

本指南将帮助您在几分钟内快速部署和运行电磁场课程智能教学平台。

## 系统要求

### 最低配置
- **CPU**: 2 核心
- **内存**: 4GB RAM
- **磁盘**: 20GB 可用空间
- **操作系统**: Linux (Ubuntu 18.04+) / macOS / Windows 10+

### 推荐配置
- **CPU**: 4 核心
- **内存**: 8GB RAM
- **磁盘**: 50GB 可用空间（SSD 推荐）
- **网络**: 稳定的互联网连接

### 软件依赖
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.0+

## 一键部署

### 1. 安装 Docker

#### Ubuntu/Debian
```bash
# 更新包索引
sudo apt update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install docker-compose-plugin

# 将用户添加到 docker 组
sudo usermod -aG docker $USER
newgrp docker
```

#### macOS
```bash
# 使用 Homebrew 安装
brew install --cask docker

# 或者下载 Docker Desktop
# https://www.docker.com/products/docker-desktop
```

#### Windows
下载并安装 Docker Desktop：
https://www.docker.com/products/docker-desktop

### 2. 克隆项目

```bash
git clone <repository-url>
cd education-project
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp code/.env.example code/.env

# 编辑环境变量文件
nano code/.env
```

**必需配置项**：
```bash
# 数据库配置
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=education_db
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password

# JWT 密钥（请生成一个安全的随机字符串）
JWT_SECRET=your_jwt_secret_key_here

# AI 服务配置（可选，不配置将使用模拟响应）
LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=your_api_key
LLM_MODEL=qwen-plus
```

**可选配置项**：
```bash
# 企业微信配置（如需企业微信登录）
WECOM_CORPID=your_corp_id
WECOM_AGENTID=your_agent_id
WECOM_SECRET=your_secret

# 服务端口配置（如有端口冲突可修改）
BACKEND_PORT=8080
AI_SERVICE_PORT=8001
SIM_SERVICE_PORT=8002
```

### 4. 启动服务

```bash
cd code
docker-compose up -d --build
```

这个命令将：
- 构建所有服务的 Docker 镜像
- 启动 MySQL 数据库
- 启动后端服务
- 启动 AI 服务
- 启动仿真服务
- 在后台运行所有服务

### 5. 验证部署

#### 检查服务状态
```bash
docker-compose ps
```

您应该看到类似以下的输出：
```
NAME                COMMAND                  SERVICE             STATUS              PORTS
code-backend-1      "./backend"              backend             running             0.0.0.0:8080->8080/tcp
code-ai-service-1   "uvicorn app.main:ap…"   ai-service          running             0.0.0.0:8001->8001/tcp
code-sim-service-1  "uvicorn app.main:ap…"   sim-service         running             0.0.0.0:8002->8002/tcp
code-mysql-1        "docker-entrypoint.s…"   mysql               running             0.0.0.0:3306->3306/tcp
```

#### 验证服务健康状态
```bash
# 检查后端服务
curl http://localhost:8080/healthz

# 检查 AI 服务
curl http://localhost:8001/healthz

# 检查仿真服务
curl http://localhost:8002/healthz
```

所有服务都应该返回类似 `{"status": "ok"}` 的响应。

### 6. 访问应用

#### 后端 API
- **地址**: http://localhost:8080
- **健康检查**: http://localhost:8080/healthz
- **API 文档**: http://localhost:8080/swagger/ (如果启用)

#### 前端开发服务器（可选）
如果需要运行前端开发服务器：

```bash
cd code/frontend
npm install
npm run dev
```

前端将在 http://localhost:5173 启动。

## 默认账户

系统首次启动时会自动创建以下演示账户：

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 拥有所有权限 |
| teacher | teacher123 | 教师 | 课程管理和教学权限 |
| student | student123 | 学生 | 学习相关权限 |

**⚠️ 生产环境请务必修改默认密码！**

## 基本功能测试

### 1. 用户登录测试
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 获取用户信息
```bash
# 使用上一步返回的 token
curl -H "Authorization: Bearer <your_token>" \
  http://localhost:8080/api/v1/auth/me
```

### 3. AI 服务测试
```bash
curl -X POST http://localhost:8080/api/v1/ai/chat \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "tutor",
    "messages": [{"role": "user", "content": "什么是电场？"}]
  }'
```

### 4. 仿真服务测试
```bash
curl -X POST http://localhost:8080/api/v1/sim/laplace2d \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nx": 20,
    "ny": 20,
    "v_top": 1,
    "v_bottom": 0,
    "v_left": 0,
    "v_right": 0
  }'
```

## 常见问题

### 端口冲突
如果遇到端口冲突，修改 `.env` 文件中的端口配置：
```bash
BACKEND_PORT=8081
AI_SERVICE_PORT=8003
SIM_SERVICE_PORT=8004
MYSQL_PORT=3307
```

### 服务启动失败
查看服务日志：
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs ai-service
docker-compose logs sim-service
```

### 数据库连接失败
1. 确保 MySQL 服务正常运行：
   ```bash
   docker-compose logs mysql
   ```

2. 检查数据库配置是否正确

3. 等待数据库完全启动（首次启动可能需要几分钟）

### AI 服务响应异常
如果没有配置真实的 LLM API，AI 服务会返回模拟响应，这是正常的。要启用真实的 AI 功能，请配置 `LLM_BASE_URL`、`LLM_API_KEY` 和 `LLM_MODEL`。

## 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止服务并删除数据卷（谨慎使用）
docker-compose down -v
```

## 更新服务

```bash
# 拉取最新代码
git pull

# 重新构建并启动服务
docker-compose up -d --build
```

## 下一步

- 阅读 [环境配置](./environment-setup.md) 了解详细配置选项
- 查看 [API 文档](../api/) 了解接口使用方法
- 参考 [生产部署](./production-deployment.md) 进行生产环境部署
- 配置 [监控运维](./monitoring.md) 确保系统稳定运行

## 获取帮助

如果遇到问题，请：
1. 查看 [故障排查指南](./troubleshooting.md)
2. 检查项目 Issues
3. 联系技术支持团队