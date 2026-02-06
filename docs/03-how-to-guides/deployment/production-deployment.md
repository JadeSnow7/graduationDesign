# 生产部署

本项目提供基于 Docker Compose 的生产形态示例（含 Nginx 入口）。

## 1. 启动

```bash
cd code
./scripts/prod-up.sh
```

## 2. 验证

- Web：`http://localhost/`
- API：`http://localhost/api/`（由 Nginx 反代到后端）

