# API 一致性与组件化改造计划

本计划用于将 Web/Mobile/AI 的接口收敛为统一契约，同时推动模块化与权限归属清晰化。

---

## 1. 目标

- **接口一致**：各端共用同一套路径与字段。
- **组件化**：UI/Domain/Service 分层，后端 handler/service/repo 分层。
- **鉴权明确**：每个接口都能追踪权限与归属模块。
- **可迁移**：通过兼容层与灰度避免一次性大改。

---

## 2. 分阶段计划

### 阶段 1：统一契约与权限矩阵

**目标**：形成“目标态接口 + 权限矩阵 + 响应规范”。

**产出**：
- `docs/architecture/api-permission-matrix.md`
- 统一响应结构与错误码规范
- OpenAPI 目标草案（若未完成，至少列出关键路径）

**验收**：
- 关键路径接口均在矩阵中标注权限与模块归属

---

### 阶段 2：后端接口对齐

**目标**：路由/字段与目标契约一致，提供兼容层。

**重点修复**：
- `/courses/{id}` 缺失
- `/chapters/{id}/heartbeat` 与移动端路径不一致
- `/user/stats` 与 `/users/me/stats` 统一
- 作业创建路径统一为 `/courses/{courseId}/assignments`
- AI 接口响应统一 `{ reply }`

**兼容策略**：
- 旧路径保留 1 个版本周期（或通过重定向/别名）

---

### 阶段 3：前端 SDK 与模型统一

**目标**：Web/Mobile 共享 API client 与 types。

**措施**：
- 建立 `shared/types` 或 `shared/sdk`
- Web/Mobile 使用同一套路径与数据模型
- 移除重复 axios client 与孤立的 fetch 调用

---

### 阶段 4：组件化与解耦

**后端**：
- handler → service → repo 分层
- 领域内数据校验和权限校验下沉到 service

**前端**：
- UI 与业务逻辑分离
- 页面只组合 domain 组件与 service 数据

**AI**：
- 拆分 chat / rag / writing / skills 模块
- 减少全局状态与大型单文件

---

### 阶段 5：测试与迁移

**目标**：通过契约测试和回归清单保证稳定。

**措施**：
- OpenAPI schema 校验
- `docs/testing/api-regression-checklist.md` 落档
- E2E 核心路径复测

---

## 3. 交付物清单

- API 权限矩阵与模块归属
- OpenAPI 目标契约（逐步完善）
- 前后端统一 SDK 与类型定义
- 契约测试/回归清单

---

## 4. 关键风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 一次性接口变更过大 | 客户端崩溃 | 分阶段灰度 + 兼容层 |
| 字段不一致 | UI 异常 | 统一 types 与适配层 |
| 权限不清晰 | 越权/误拒绝 | 权限矩阵与代码注释同步 |

