# 代码规范

本文档定义项目统一代码规范。目标是让不同语言与模块在风格、质量与可维护性上保持一致。

## 1. 通用规范

- 优先可读性：命名清晰、函数职责单一、避免过度抽象。
- 保持最小改动：只改与需求直接相关的文件与逻辑。
- 边界显式：配置、权限、超时、错误码都应可追踪。
- 不提交敏感信息：密钥、Token、隐私数据必须通过环境变量管理。
- 所有对外行为变更必须配套文档与测试。

## 2. 提交前检查

- Frontend: `cd code/frontend-react && npm run lint && npm run test -- --run`
- Backend: `cd code/backend && go test ./...`
- AI Service: `cd code/ai_service && pytest -q`
- 文档站点: `npm run docs:build`

## 3. Python（AI Service / Simulation）

- 遵循 PEP 8，函数与变量使用 `snake_case`，类名使用 `PascalCase`。
- 公开函数必须有类型注解，复杂结构使用 `TypedDict`/`dataclass`/Pydantic 模型。
- 异步场景避免阻塞事件循环；外部 I/O 使用异步客户端或线程池包装。
- 错误处理禁止吞异常；API 层返回统一、可定位的错误码。
- 模块结构建议：常量 -> 数据模型 -> 纯函数 -> I/O 逻辑。

## 4. Go（Backend）

- 必须通过 `go test ./...`，并保持 handler/service/repository 分层职责清晰。
- 错误处理使用 `fmt.Errorf("...: %w", err)` 传递上下文。
- 结构体字段命名与 JSON tag 必须稳定，避免无兼容策略的字段重命名。
- 中间件统一处理请求日志、request_id、鉴权与限流。
- 对外 API 变更必须同步更新 OpenAPI 与文档。

## 5. Frontend（React）

- 组件拆分遵循“容器/展示”职责分离，避免超大组件。
- 状态管理优先局部状态，跨页面状态使用统一 store。
- 接口类型优先复用共享类型，避免手写重复类型导致漂移。
- 不直接在组件中硬编码 API 地址与密钥，统一通过配置层注入。
- 页面级功能至少有基础回归测试或关键交互测试。

## 6. API 与契约规范

- 对外契约唯一源：`/Users/huaodong/graduationDesign/docs/04-reference/api/openapi.yaml`。
- `/api/v1/*` 语义变更必须更新 OpenAPI 与对应测试。
- `/v1/*`（AI Service 内部）虽不直接受 `openapi.lock.json` 门禁，但必须保持与对外契约一致。
- 详细边界见：`/Users/huaodong/graduationDesign/docs/04-reference/versioning/api-lock-policy.md`。

## 7. 文档同步规范

- 新增功能：至少更新一处 How-to 或 Explanation 文档。
- 接口变更：必须更新 `04-reference/api` 下对应页面。
- 运行/部署相关变更：必须更新 `03-how-to-guides` 对应页面。
