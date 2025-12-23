# 部署配置 (Deployment)

包含项目的部署配置文件和相关脚本。

## 目录结构

```
deployment/
├── docker/              # Docker配置
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── Dockerfile.ai
│   ├── Dockerfile.simulation
│   └── docker-compose.prod.yml
├── kubernetes/          # Kubernetes配置
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── deployment.yaml
│   └── service.yaml
├── nginx/              # Nginx配置
│   ├── nginx.conf
│   └── ssl/
└── monitoring/         # 监控配置
    ├── prometheus.yml
    ├── grafana/
    └── alertmanager.yml
```

## 部署环境

### 开发环境
```bash
# 使用 docker-compose 启动所有服务
docker-compose -f docker-compose.dev.yml up -d
```

### 生产环境
```bash
# 使用生产配置部署
docker-compose -f docker/docker-compose.prod.yml up -d

# 或使用 Kubernetes
kubectl apply -f kubernetes/
```

## 配置说明

### Docker 配置
- 多阶段构建优化镜像大小
- 健康检查和重启策略
- 环境变量和卷挂载

### Kubernetes 配置
- 命名空间隔离
- ConfigMap 和 Secret 管理
- 服务发现和负载均衡
- 水平扩展配置

### Nginx 配置
- 反向代理和负载均衡
- SSL/TLS 终端
- 静态文件服务
- 缓存策略

## 监控和日志

- Prometheus 指标收集
- Grafana 可视化面板
- ELK 日志聚合
- 告警规则配置

## 相关文档

- [部署指南](../../docs/deployment/)
- [监控配置](../../docs/deployment/monitoring.md)