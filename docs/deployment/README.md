# 部署文档

本目录包含项目部署相关的所有文档和配置。

## 文档列表

### [快速开始](./quick-start.md)
- 一键部署指南
- Docker Compose 配置
- 环境变量设置
- 基本验证步骤

### [模型训练与部署（HF + GraphRAG）](./ai-model-deployment-guide.md)
- 基于 `code/ai_service/training/` 的 LoRA/QLoRA 训练流程
- 本地 HF 推理（OpenAI-compatible）接入方式
- GraphRAG 索引构建与启用

### [环境配置](./environment-setup.md)
- 开发环境搭建
- 生产环境配置
- 依赖服务安装
- 系统要求说明

### [Docker 部署](./docker-deployment.md)
- Docker 镜像构建
- 容器编排配置
- 数据卷管理
- 网络配置

### [生产部署](./production-deployment.md)
- 生产环境最佳实践
- 负载均衡配置
- SSL/TLS 证书配置
- 安全加固指南

### [监控运维](./monitoring.md)
- 系统监控配置
- 日志管理
- 性能调优
- 故障排查

### [备份恢复](./backup-recovery.md)
- 数据备份策略
- 自动备份配置
- 灾难恢复流程
- 数据迁移指南

## 部署架构

### 开发环境
```
┌─────────────────────────────────────────────────────────────┐
│                        开发环境                              │
├─────────────────────────────────────────────────────────────┤
│  Frontend (npm run dev)     │  Backend (go run)            │
│  http://localhost:5173      │  http://localhost:8080       │
├─────────────────────────────────────────────────────────────┤
│  AI Service (uvicorn)       │  Sim Service (uvicorn)       │
│  http://localhost:8001      │  http://localhost:8002       │
├─────────────────────────────────────────────────────────────┤
│                    MySQL (Docker)                           │
│                 http://localhost:3306                       │
└─────────────────────────────────────────────────────────────┘
```

### 生产环境
```
┌─────────────────────────────────────────────────────────────┐
│                      负载均衡器                              │
│                   Nginx / HAProxy                          │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                      应用服务器                              │
│  Frontend (静态文件)    │  Backend (多实例)                │
├─────────────────────────────────────────────────────────────┤
│  AI Service (多实例)    │  Sim Service (多实例)            │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                      数据层                                  │
│  MySQL (主从)          │  Redis (集群)                     │
│  文件存储 (NFS/OSS)    │  监控 (Prometheus)               │
└─────────────────────────────────────────────────────────────┘
```

## 快速部署

### 使用 Docker Compose（推荐）

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd education-project
   ```

2. **配置环境变量**
   ```bash
   cp code/deployment/.env.example code/deployment/.env
   # 编辑 .env 文件，配置必要的环境变量
   ```

3. **启动服务**
   ```bash
   cd code
   docker-compose up -d --build
   ```

4. **验证部署**
   ```bash
   # 检查服务状态
   docker-compose ps
   
   # 验证服务可用性
   curl http://localhost:8080/healthz
   curl http://localhost:8001/healthz
   curl http://localhost:8002/healthz
   ```

### 手动部署

详细的手动部署步骤请参考各个具体文档。

## 环境变量配置

### 核心配置
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=education_db
DB_USER=root
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# AI 服务配置
LLM_BASE_URL=https://api.openai.com
LLM_API_KEY=your_api_key
LLM_MODEL=gpt-3.5-turbo

# 企业微信配置（可选）
WECOM_CORPID=your_corp_id
WECOM_AGENTID=your_agent_id
WECOM_SECRET=your_secret
```

### 服务端口配置
```bash
# 服务端口
BACKEND_PORT=8080
AI_SERVICE_PORT=8001
SIM_SERVICE_PORT=8002
FRONTEND_PORT=5173

# 数据库端口
MYSQL_PORT=3306
REDIS_PORT=6379
```

## 部署检查清单

### 部署前检查
- [ ] 服务器资源充足（CPU、内存、磁盘）
- [ ] 网络连通性正常
- [ ] 域名和 SSL 证书准备就绪
- [ ] 数据库和依赖服务已安装
- [ ] 环境变量配置完成
- [ ] 防火墙规则配置正确

### 部署后验证
- [ ] 所有服务正常启动
- [ ] 健康检查接口响应正常
- [ ] 数据库连接正常
- [ ] 前端页面可以正常访问
- [ ] 用户登录功能正常
- [ ] AI 和仿真服务可用
- [ ] 日志输出正常
- [ ] 监控指标正常

## 常见问题

### 服务启动失败
1. 检查端口是否被占用
2. 验证环境变量配置
3. 查看服务日志
4. 检查依赖服务状态

### 数据库连接失败
1. 验证数据库服务状态
2. 检查连接参数配置
3. 确认网络连通性
4. 验证用户权限

### AI 服务不可用
1. 检查上游 API 配置
2. 验证 API 密钥有效性
3. 确认网络访问权限
4. 查看服务日志

## 版本升级

### 升级流程
1. 备份当前数据
2. 停止服务
3. 更新代码
4. 执行数据库迁移
5. 更新配置文件
6. 重启服务
7. 验证功能正常

### 回滚流程
1. 停止新版本服务
2. 恢复代码版本
3. 恢复数据库
4. 恢复配置文件
5. 重启服务
6. 验证功能正常

## 性能调优

### 系统级优化
- 调整系统内核参数
- 优化文件描述符限制
- 配置合适的交换分区
- 启用 CPU 性能模式

### 应用级优化
- 调整数据库连接池大小
- 配置适当的缓存策略
- 优化静态资源缓存
- 启用 Gzip 压缩

### 监控指标
- CPU 使用率
- 内存使用率
- 磁盘 I/O
- 网络带宽
- 响应时间
- 错误率

## 安全配置

### 网络安全
- 配置防火墙规则
- 启用 HTTPS
- 设置安全头
- 限制访问来源

### 应用安全
- 定期更新依赖
- 配置安全扫描
- 启用访问日志
- 实施权限最小化

## 相关资源

- [开发文档](../development/)
- [API 文档](../api/)
- [架构文档](../architecture/)
- [故障排查指南](./troubleshooting.md)
