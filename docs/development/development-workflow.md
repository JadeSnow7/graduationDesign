# 开发工作流

## 1. 分支与提交

- 建议使用功能分支：`feature/<short-desc>` / `fix/<short-desc>`
- 提交信息遵循约定：`feat: ...` / `fix: ...` / `docs: ...` / `refactor: ...`

## 2. 代码评审

- 重要逻辑变更需覆盖单元测试或在 PR 说明替代验证方式
- 涉及 API/数据结构改动必须同步更新 `docs/api/`、`docs/architecture/` 等

## 3. 本地验证清单（建议）

```bash
cd tests && npm test
cd code/backend && go test ./...
cd code/ai_service && pytest -q
cd code/simulation && pytest -q
cd code/frontend-react && npm run build
```

