# 监控配置 (Monitoring)

本目录包含项目的监控系统配置文件。

## 监控组件

### Prometheus
- **功能**: 指标收集和存储
- **端口**: 9090
- **配置文件**: `prometheus.yml`
- **数据存储**: 时序数据库

### Grafana
- **功能**: 数据可视化和告警
- **端口**: 3000
- **默认账号**: admin/admin
- **仪表板**: 预配置的监控面板

### AlertManager
- **功能**: 告警管理和通知
- **端口**: 9093
- **配置文件**: `alertmanager.yml`
- **通知渠道**: 邮件、钉钉、企业微信

## 配置文件

### docker-compose.monitoring.yml
监控服务的 Docker Compose 配置：
- Prometheus 服务配置
- Grafana 服务配置
- AlertManager 服务配置
- 网络和存储卷配置

### prometheus.yml
Prometheus 主配置文件：
- 全局配置
- 抓取目标配置
- 告警规则配置
- 服务发现配置

### grafana/
Grafana 相关配置：
- 数据源配置
- 仪表板定义
- 用户和权限配置
- 插件配置

## 使用方法

### 启动监控服务
```bash
# 启动所有监控服务
docker-compose -f docker-compose.monitoring.yml up -d

# 查看服务状态
docker-compose -f docker-compose.monitoring.yml ps

# 查看服务日志
docker-compose -f docker-compose.monitoring.yml logs -f
```

### 访问监控界面
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **AlertManager**: http://localhost:9093

### 停止监控服务
```bash
docker-compose -f docker-compose.monitoring.yml down
```

## 监控指标

### 系统指标
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络流量

### 应用指标
- HTTP 请求数量和延迟
- 数据库连接数
- 缓存命中率
- 错误率统计

### 业务指标
- 用户活跃度
- 功能使用统计
- 性能关键指标
- 自定义业务指标

## 告警规则

### 系统告警
- 服务不可用
- 资源使用率过高
- 磁盘空间不足
- 网络连接异常

### 应用告警
- 响应时间过长
- 错误率过高
- 数据库连接失败
- 缓存服务异常

### 业务告警
- 用户登录失败率高
- 关键功能异常
- 数据同步失败
- 第三方服务异常

## 配置说明

### Prometheus 配置
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8080']
  
  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']
```

### Grafana 数据源
```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    isDefault: true
```

### 告警规则示例
```yaml
groups:
  - name: system
    rules:
      - alert: HighCPUUsage
        expr: cpu_usage > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU usage is high"
```

## 维护指南

### 数据保留
- Prometheus 数据保留 30 天
- Grafana 仪表板定期备份
- 告警历史记录归档
- 定期清理过期数据

### 性能优化
- 调整抓取间隔
- 优化查询语句
- 配置数据压缩
- 监控存储使用

### 安全配置
- 修改默认密码
- 配置访问控制
- 启用 HTTPS
- 定期更新组件

## 故障排查

### 常见问题
1. **Prometheus 无法抓取数据**
   - 检查目标服务是否运行
   - 验证网络连接
   - 检查防火墙设置

2. **Grafana 无法连接数据源**
   - 检查 Prometheus 服务状态
   - 验证数据源配置
   - 检查网络连接

3. **告警不生效**
   - 检查告警规则语法
   - 验证 AlertManager 配置
   - 检查通知渠道设置

### 日志查看
```bash
# 查看 Prometheus 日志
docker-compose logs prometheus

# 查看 Grafana 日志
docker-compose logs grafana

# 查看 AlertManager 日志
docker-compose logs alertmanager
```

## 相关文档

- [Prometheus 官方文档](https://prometheus.io/docs/)
- [Grafana 官方文档](https://grafana.com/docs/)
- [AlertManager 官方文档](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [项目监控指南](../../../../docs/deployment/monitoring.md)