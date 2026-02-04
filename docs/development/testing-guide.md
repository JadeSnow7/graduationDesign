# 测试指南

本仓库包含仓库级结构测试与各服务的单元/集成测试入口。

## 1. 仓库级测试（强烈建议每次改动后执行）

```bash
cd tests
npm test
```

## 2. 后端（Go）

```bash
cd code/backend
go test ./...
```

## 3. AI 服务（Python）

```bash
cd code/ai_service
pytest -q
```

## 4. 仿真服务（Python）

```bash
cd code/simulation
pytest -q
```

## 5. Web 前端（React）

```bash
cd code/frontend-react
npm run test
npm run build
```

