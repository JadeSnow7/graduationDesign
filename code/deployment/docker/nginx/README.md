# Nginx 配置 (Nginx Configuration)

本目录包含 Nginx 反向代理和负载均衡的配置文件。

## 配置文件

### nginx.conf
主配置文件，包含：
- 全局配置
- HTTP 配置块
- 服务器配置块
- 位置配置块

### ssl/
SSL 证书相关文件：
- SSL 证书文件
- 私钥文件
- 证书链文件
- DH 参数文件

## 功能特性

### 反向代理
- 前端应用代理
- 后端 API 代理
- AI 服务代理
- 仿真服务代理

### 负载均衡
- 轮询算法
- 加权轮询
- IP 哈希
- 最少连接

### 静态文件服务
- 前端静态资源
- 图片和媒体文件
- 文档和下载文件
- 缓存控制

### SSL/TLS 支持
- HTTPS 重定向
- SSL 证书配置
- 安全头设置
- HTTP/2 支持

## 配置示例

### 基本反向代理
```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### HTTPS 配置
```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://frontend:3000;
        # 其他代理配置...
    }
}
```

### 负载均衡配置
```nginx
upstream backend_servers {
    server backend1:8080 weight=3;
    server backend2:8080 weight=2;
    server backend3:8080 weight=1;
    keepalive 32;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend_servers/;
        # 其他配置...
    }
}
```

### 静态文件服务
```nginx
server {
    listen 80;
    
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1M;
        add_header Cache-Control "public";
    }
}
```

## 性能优化

### 缓存配置
```nginx
# 启用 gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# 启用缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
}
```

### 连接优化
```nginx
# 工作进程数
worker_processes auto;

# 连接数限制
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

# 保持连接
keepalive_timeout 65;
keepalive_requests 100;
```

### 缓冲区优化
```nginx
# 客户端缓冲区
client_body_buffer_size 128k;
client_max_body_size 10m;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;

# 代理缓冲区
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
```

## 安全配置

### 基本安全
```nginx
# 隐藏版本信息
server_tokens off;

# 限制请求方法
if ($request_method !~ ^(GET|HEAD|POST)$ ) {
    return 405;
}

# 防止点击劫持
add_header X-Frame-Options DENY;

# 防止 MIME 类型嗅探
add_header X-Content-Type-Options nosniff;

# XSS 保护
add_header X-XSS-Protection "1; mode=block";
```

### 访问控制
```nginx
# IP 白名单
location /admin/ {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
    
    proxy_pass http://backend:8080/admin/;
}

# 速率限制
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://backend:8080/;
}
```

## 监控和日志

### 访问日志
```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;
```

### 状态监控
```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

## 部署和维护

### Docker 部署
```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY ssl/ /etc/nginx/ssl/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### 配置测试
```bash
# 测试配置文件语法
nginx -t

# 重新加载配置
nginx -s reload

# 查看状态
curl http://localhost/nginx_status
```

### 日志分析
```bash
# 查看访问日志
tail -f /var/log/nginx/access.log

# 分析错误日志
grep "error" /var/log/nginx/error.log

# 统计访问量
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

## 故障排查

### 常见问题

1. **502 Bad Gateway**
   - 检查后端服务是否运行
   - 验证代理配置
   - 检查网络连接

2. **504 Gateway Timeout**
   - 增加代理超时时间
   - 检查后端服务响应时间
   - 优化后端性能

3. **SSL 证书问题**
   - 检查证书文件路径
   - 验证证书有效期
   - 检查证书链完整性

### 调试命令
```bash
# 检查配置语法
nginx -t

# 查看进程状态
ps aux | grep nginx

# 检查端口监听
netstat -tlnp | grep nginx

# 测试连接
curl -I http://localhost
```

## 相关文档

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [SSL 配置指南](https://ssl-config.mozilla.org/)
- [性能优化指南](https://www.nginx.com/blog/tuning-nginx/)
- [项目部署文档](../../../../docs/deployment/)