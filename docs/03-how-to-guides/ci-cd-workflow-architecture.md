# CI/CD Workflow 架构与门禁边界

本文档说明当前仓库 CI/CD 工作流的职责分层与契约门禁边界。

## 1. 工作流分层

- `ci.yml`：基础构建、单元测试、覆盖率产物。
- `code-quality.yml`：静态质量与依赖审查。
- `e2e.yml`：端到端回归。
- `deploy-docs.yml`：文档构建与发布。
- `release.yml` / `cd.yml`：发布与部署。

## 2. OpenAPI 契约门禁边界

- OpenAPI 契约门禁仅覆盖对外接口 `/api/v1/*`。
- `AI Service` 内部接口 `/v1/*` 不直接受 `openapi.lock.json` CI 门禁约束。
- 内部接口仍必须通过“行为一致性 + 测试 + 文档”约束，保证不破坏对外契约语义。

## 3. 关联文档

- [API 参考入口](../04-reference/api/index.md)
- [API 锁定策略](../04-reference/versioning/api-lock-policy.md)
- [AI 文档索引](../05-explanation/ai/index.md)
