# 合规性审查报告（2026-02-26）

> 基于仓库静态证据的正式复核版报告，面向“可审计、可追责、可执行”的整改落地。

## 1. 报告头部

| 项 | 内容 |
|---|---|
| 项目 | 端云协同高校 AI 教学平台 |
| 审查日期 | 2026-02-26 |
| 审查角色 | Principal QA Architect（Evidence Review） |
| 代码路径 | `code/` |
| 文档路径 | `docs/`（VitePress） |
| 审查方式 | 静态一致性审查（文档-代码双向对照，不做功能改造） |
| 评分模型 | `Score = round(100 - 2.4*M - 1.6*D - 1.0*G - 6.0*S)` |

---

## 2. 执行摘要

### 2.1 评分结论

| 指标 | 分值 |
|---|---|
| 探针原始分 | `72/100` |
| 本次证据复核分 | `69/100` |
| 差异 | `-3`（新增 S1 + 证据口径修正） |

计数：`M=5`、`D=5`、`G=5`、`S=1`，复算结果为 `69`。

### 2.2 Top 3 风险

1. `M1` 工作台文档宣称“真实轮询”，前端实际为 Mock `setTimeout`，存在“能力虚标”风险。
2. `S1` OpenAPI 声明 `/workspace/*`，但 Go 路由注册未见 workspace 路由组，存在契约可用性风险。
3. `M4` Desktop/Tauri 快速开始命令不可执行（目录无 `package.json`），对新接入开发者造成直接阻塞。

### 2.3 48 小时内必须动作

1. 修正文档阻塞项：`M3`、`M4`、`M5`、`D5`。
2. 对 `M1 + S1` 做统一决策：实现真实接口链路或降级文档为 Demo/WIP。
3. 发布“已知偏差声明”：在工作台与 Desktop 相关文档加醒目告警，避免误导。

---

## 3. 方法与分级

### 3.1 证据策略

- 主证据仅使用当前主干实现：`code/frontend`、`code/backend`、`code/mobile`、`code/shared`、`docs/01|04|05|06`。
- 对“部分已覆盖”条目采用降级措辞：标记为“参考文档未覆盖/覆盖不足”，不使用“完全未文档化”。
- 构建产物（`docs/.vitepress/dist`）不作为证据来源。

### 3.2 严重级别

| 级别 | 判定标准 |
|---|---|
| Critical | 会误导开发决策、阻塞接入或造成 API 契约失真 |
| High | 明显偏离规范，短期不修会扩大维护成本 |
| Medium | 文档覆盖不足或解释不完整，影响认知一致性 |

### 3.3 Finding Card 字段规范

后续自动化审计对接统一字段：

`id / severity / title / evidence_doc / evidence_code / impact / action / acceptance / owner_eta`

---

## 4. 核心发现

## A. Critical Mismatch

### M1

- `id`: `M1`
- `severity`: `Critical`
- `title`: 工作台前端为 Mock UI，未实现文档所述真实轮询
- `evidence_doc`: `docs/04-reference/api/workspace.md:205-230`（明确给出 `api.workspace.getJob` 轮询示例）
- `evidence_code`: `code/frontend/src/pages/Workspace.tsx:98-105`、`code/frontend/src/pages/WorkspaceHubPage.tsx:140-147,249-253`、`code/shared/src/sdk/workspace.ts:4-10`
- `impact`: 开发者会误判可用能力，联调时难以复现实机行为。
- `action`: 二选一并在同一版本完成：实现真实轮询；或在 `workspace.md` 顶部标注 Demo/WIP。
- `acceptance`: 页面运行链路出现真实 `submitSimulation -> getJob` 调用日志，或文档明确标注“未实现”且移除已上线语气。
- `owner_eta`: `FE + Docs / 1d`

### M2

- `id`: `M2`
- `severity`: `Critical`
- `title`: JWT 有效期文档为 24h，代码实际为 7d
- `evidence_doc`: `docs/04-reference/api/auth.md:28,71,232`
- `evidence_code`: `code/backend/internal/http/handlers_auth.go:41,59`
- `impact`: 安全策略与客户端会话预期不一致，影响审计与风控。
- `action`: 文档 `expires_in` 改为 `604800`，并在安全注意事项增加生产环境 TTL 建议。
- `acceptance`: `auth.md` 示例值与说明均为 7 天，且与后端返回一致。
- `owner_eta`: `Docs + BE / 0.5d`

### M3

- `id`: `M3`
- `severity`: `Critical`
- `title`: Quick Start 环境变量示例与 `.env.example` 不一致
- `evidence_doc`: `docs/01-getting-started/quick-start.md:45-47,54`
- `evidence_code`: `code/.env.example:3-4,50,58`
- `impact`: 新开发者按文档配置会出现初始化失败或错误认知。
- `action`: Quick Start 示例改为与 `.env.example` 一致，并将 `LLM_BASE_URL` 标注为兼容旧变量。
- `acceptance`: 文档示例可直接拷贝到 `code/.env` 并通过服务启动检查。
- `owner_eta`: `Docs / 0.5d`

### M4

- `id`: `M4`
- `severity`: `Critical`
- `title`: Desktop/Tauri 文档命令不可执行，当前仅 POC shell
- `evidence_doc`: `docs/01-getting-started/quick-start.md:182-188`
- `evidence_code`: `code/desktop-tauri/README.md:1-15`、`code/desktop-tauri/src-tauri/Cargo.toml`（目录下无 `package.json`）
- `impact`: 新成员会在 Desktop 环节直接阻塞，降低文档可信度。
- `action`: Quick Start Desktop 段标注 POC 状态，启动命令改为 `cd src-tauri && cargo run --features tauri-command`。
- `acceptance`: 文档命令可执行，且“POC 范围”清晰可见。
- `owner_eta`: `Docs / 0.5d`

### M5

- `id`: `M5`
- `severity`: `Critical`
- `title`: SSE 前端接入描述与实际 SDK/适配层实现不一致
- `evidence_doc`: `docs/04-reference/api/ai.md:133-135`
- `evidence_code`: `code/frontend/src/lib/ai-stream.ts:14-33`、`code/shared/src/sdk/ai.ts:33-117`
- `impact`: 前端接入方可能选错技术路径，增加集成成本。
- `action`: 文档改写为“`AsyncGenerator<string>` + `for await...of` + `AbortController`”。
- `acceptance`: `ai.md` 的接入描述与 `ai-stream.ts`/`shared sdk` 对齐。
- `owner_eta`: `Docs + FE / 0.5d`

## B. Spec Deviation

### D1

- `id`: `D1`
- `severity`: `High`
- `title`: `Workspace.tsx` 存在大量硬编码颜色，违反 Design Token 规范
- `evidence_doc`: `docs/06-contributing/code-style.md:173-210`
- `evidence_code`: `code/frontend/src/pages/Workspace.tsx:24-254`（多处 `#xxxxxx`）
- `impact`: 主题一致性与后续换肤能力受损，样式债务快速累积。
- `action`: 迁移至 `var(--*)`；缺失 token 先在主题层定义再替换。
- `acceptance`: `Workspace.tsx` 不再出现硬编码十六进制颜色。
- `owner_eta`: `FE / 1-2d`

### D2

- `id`: `D2`
- `severity`: `High`
- `title`: `GlobalProfileCard.css` 存在散乱非 Token 颜色
- `evidence_doc`: `docs/06-contributing/code-style.md:173-210`
- `evidence_code`: `code/frontend/src/components/GlobalProfileCard.css:18-170`
- `impact`: 页面视觉语义漂移，跨页面配色不可控。
- `action`: 引入语义 token（如 profile accent），统一替换硬编码值。
- `acceptance`: 组件颜色全部来自主题变量或既定 token。
- `owner_eta`: `FE / 1d`

### D3

- `id`: `D3`
- `severity`: `High`
- `title`: 规范对 `ConfigProvider.token` 与 CSS 变量关系表述不清
- `evidence_doc`: `docs/06-contributing/code-style.md:171-199,206-209`
- `evidence_code`: `code/frontend/src/ThemeProvider.tsx:49-60`
- `impact`: 开发者难以判断 Ant Token 是否允许十六进制常量，导致执行口径不一致。
- `action`: 在规范中补充“Ant Token 可为语义对齐的常量值，但须与主题变量语义同步”。
- `acceptance`: 规范文本可解释 `ThemeProvider.tsx` 的当前实现边界。
- `owner_eta`: `Docs + FE / 0.5d`

### D4

- `id`: `D4`
- `severity`: `High`
- `title`: Mobile 端无网络状态感知，不符合文档“端侧路由”叙述
- `evidence_doc`: `docs/05-explanation/system-design.md:101-164`
- `evidence_code`: `code/mobile/package.json`（无 NetInfo 依赖）、`code/mobile/src/config.ts:7`、`code/mobile/src/api.ts:35-39`
- `impact`: 文档将策略能力归于客户端，实际仅有超时失败，预期管理失真。
- `action`: 文档明确“移动端依赖服务端路由与错误码”，客户端网络感知作为后续议题。
- `acceptance`: `system-design.md` 与移动端现状一致，不再暗示客户端主动路由。
- `owner_eta`: `Docs / 0.5d`

### D5

- `id`: `D5`
- `severity`: `High`
- `title`: Quick Start 必填变量缺失 `BACKEND_SIM_BASE_URL`
- `evidence_doc`: `docs/01-getting-started/quick-start.md:40-66`
- `evidence_code`: `code/.env.example:15`
- `impact`: 仿真代理链路在新环境中容易配置不全。
- `action`: Quick Start 必填配置表补充 `BACKEND_SIM_BASE_URL` 与用途。
- `acceptance`: Quick Start 与 `.env.example` 的后端必填项一一对应。
- `owner_eta`: `Docs / 0.5d`

## C. Documentation Gap

### G1

- `id`: `G1`
- `severity`: `Medium`
- `title`: 前端本地 LLM Runtime 缺少架构级文档说明
- `evidence_doc`: `docs/05-explanation/system-design.md`（未覆盖本地 runtime 模块职责）
- `evidence_code`: `code/frontend/src/runtime/local-ai/index.ts:23-55`、`code/frontend/src/pages/LocalAIHubPage.tsx:7`
- `impact`: 难以理解“本地推理路径”与云端 API 的职责边界。
- `action`: 新增本地 runtime 文档并在系统设计中链接。
- `acceptance`: 文档包含队列机制、运行前提、与云端链路关系。
- `owner_eta`: `Docs + FE / 1d`

### G2（部分覆盖）

- `id`: `G2`
- `severity`: `Medium`
- `title`: `/v1/writing/analyze` 在 API Reference 未覆盖，仅在部署指南有简要示例
- `evidence_doc`: `docs/03-how-to-guides/deployment/ai-model-deployment-guide.md:294-303`、`docs/04-reference/api/ai.md`（未列写作分析端点）
- `evidence_code`: `code/ai_service/app/main.py:2441-2515`
- `impact`: 端点可用但缺少权威契约页，不利于调用方标准化接入。
- `action`: 在 `docs/04-reference/api/ai.md` 增加写作分析端点定义与示例。
- `acceptance`: API 参考页可直接查到请求/响应结构、错误处理和鉴权要求。
- `owner_eta`: `Docs + AI / 1d`

### G3

- `id`: `G3`
- `severity`: `Medium`
- `title`: Mobile API 客户端与存储约束说明不足
- `evidence_doc`: `docs/01-getting-started/quick-start.md:168-180`
- `evidence_code`: `code/mobile/src/config.ts:2-4,21`、`code/mobile/src/storage.ts:35-37`
- `impact`: 移动端接入者容易忽略 `EXPO_PUBLIC_API_BASE_URL` 与历史消息裁剪行为。
- `action`: 在 Mobile 章节补充配置差异、会话存储策略和 `MAX_HISTORY=50`。
- `acceptance`: Mobile 启动文档具备“可配置、可验证、可排障”的最小闭环。
- `owner_eta`: `Docs + Mobile / 0.5-1d`

### G4（部分覆盖）

- `id`: `G4`
- `severity`: `Medium`
- `title`: `ai-stream.ts` 在架构文档仅路径级提及，缺少接入契约说明
- `evidence_doc`: `docs/05-explanation/architecture/react-layered-architecture.md:41`、`docs/04-reference/api/ai.md:133-135`
- `evidence_code`: `code/frontend/src/lib/ai-stream.ts:4-35`
- `impact`: 开发者不易获知 `StreamOptions` 回调与中断语义，容易重复造轮子。
- `action`: 在 API 参考增加前端接入节，补 `StreamOptions` 与推荐用法。
- `acceptance`: 文档明确 `onStart/onMessage/onFinish/onError/signal` 的行为与示例。
- `owner_eta`: `Docs + FE / 0.5-1d`

### G5（部分覆盖）

- `id`: `G5`
- `severity`: `Medium`
- `title`: Edge Router 引擎变量存在零散提及，配置参考未形成权威入口
- `evidence_doc`: `docs/05-explanation/architecture/rust-enhancement-poc-plan-2026-02-11.md:196-198`、`docs/04-reference/config/index.md:1-9`
- `evidence_code`: `code/.env.example:31-32`、`code/mobile/src/config.ts:12-13`
- `impact`: 变量存在但认知入口分散，导致端侧行为差异难排查。
- `action`: 在配置参考中补 `EDGE_ROUTER_ENGINE` 与 `EXPO_PUBLIC_EDGE_ROUTER_ENGINE` 说明并交叉链接。
- `acceptance`: 配置参考页可一站式查到变量作用、可选值、默认值和适用端。
- `owner_eta`: `Docs / 0.5d`

## D. Supplemental Finding

### S1（新增）

- `id`: `S1`
- `severity`: `Critical`
- `title`: OpenAPI 声明了 workspace 端点，但后端路由注册未见对应路由组
- `evidence_doc`: `docs/04-reference/api/openapi.yaml:1981-2063`
- `evidence_code`: `code/backend/internal/http/router.go:38-55`（未注册 workspace routes）
- `impact`: 契约层与服务层可用性不一致，联调方会遭遇“文档有、服务无”。
- `action`: 二选一：补齐后端 workspace 路由；或从 OpenAPI 与参考文档下线相关端点并标注计划状态。
- `acceptance`: `/api/v1/workspace/*` 能返回可用响应，或文档契约与实现一致撤回。
- `owner_eta`: `BE + Docs + QA / 1d`

---

## 5. 修复清单（P0 / P1 / P2）

### P0（阻塞认知或直接影响可用性）

| 任务 | 来源 | Owner | ETA | 验收 |
|---|---|---|---|---|
| 对齐 Quick Start 与 `.env.example`（数据库 + LLM 兼容变量） | M3 | Docs | 0.5d | 启动文档可直接按示例配置 |
| 修正 Desktop/Tauri 章节为 POC 命令 | M4 | Docs | 0.5d | 文档命令可执行 |
| 修正 AI 流式接入描述为 Async Generator | M5 | Docs+FE | 0.5d | 文档与 SDK 一致 |
| 明确工作台状态（实现轮询或文档降级） | M1 | FE+Docs | 1d | 文档与实现同口径 |
| 处理 OpenAPI 与路由不一致 | S1 | BE+Docs+QA | 1d | 契约与路由对齐 |

### P1（规范偏离与维护成本）

| 任务 | 来源 | Owner | ETA | 验收 |
|---|---|---|---|---|
| 修正 JWT TTL 文档为 7 天并加安全注记 | M2 | Docs+BE | 0.5d | `expires_in` 与代码一致 |
| 补充 `BACKEND_SIM_BASE_URL` | D5 | Docs | 0.5d | 必填项清单完整 |
| 迁移 `Workspace.tsx` 硬编码颜色 | D1 | FE | 1-2d | 无十六进制硬编码 |
| 迁移 `GlobalProfileCard.css` 硬编码颜色 | D2 | FE | 1d | 全量 token 化 |
| 明确 Ant Token 与 CSS Token 协同规则 | D3 | Docs+FE | 0.5d | 规范无歧义 |
| 明确移动端路由判定现状 | D4 | Docs | 0.5d | 系统设计不再误导 |

### P2（文档完备性提升）

| 任务 | 来源 | Owner | ETA | 验收 |
|---|---|---|---|---|
| 新增本地 LLM Runtime 架构说明 | G1 | Docs+FE | 1d | 模块职责清晰 |
| 在 API 参考补写作分析端点 | G2 | Docs+AI | 1d | 参考页可直接调用 |
| 补充 Mobile 配置与存储差异 | G3 | Docs+Mobile | 0.5-1d | 文档可指导接入 |
| 补 ai-stream 前端接入契约 | G4 | Docs+FE | 0.5-1d | 回调与中断语义清楚 |
| 完善 Edge Router 变量手册 | G5 | Docs | 0.5d | 配置入口统一 |

---

## 6. 风险收敛路线图

### Day 1

- 完成 P0 文档修正项：`M3/M4/M5`、`D5`。
- 对 `M1 + S1` 形成单一口径（实现或降级）。

### Day 3

- 完成 P1 中文档类修正：`M2/D3/D4`。
- 启动 `D1/D2` 颜色 token 化改造并给出 PR。

### Day 7

- 完成 P2 文档补齐：`G1~G5`。
- 进行二次一致性回归，输出“整改完成复核记录”。

---

## 7. 公共 API / 接口 / 类型变更说明

- 运行时 API：无变更（本报告为审查交付，不做功能实现）。
- 代码接口类型：无变更。
- 文档接口新增：采用统一 Finding Card 字段集合  
  `id/severity/title/evidence_doc/evidence_code/impact/action/acceptance/owner_eta`。

---

## 8. 假设与默认值

- 假设：当前工作区为审查基线，结论以当前文件快照为准。
- 假设：静态证据优先于历史叙述或口头说明。
- 默认：时间基准为 `2026-02-26`。
- 默认：优先级沿用 `P0/P1/P2`。
- 默认：本轮不实施业务修复，仅交付正式报告与整改路线。

---

## 9. 附录

### 9.1 证据命令（可复现）

```bash
rg -n "setTimeout|api\\.workspace|getJob" code/frontend/src/pages/Workspace.tsx code/frontend/src/pages/WorkspaceHubPage.tsx
rg -n "listJobs|getJob|submitSimulation" code/shared/src/sdk/workspace.ts
rg -n "86400|24 小时|expires_in" docs/04-reference/api/auth.md
rg -n "loginTTL" code/backend/internal/http/handlers_auth.go
rg -n "MYSQL_DATABASE|MYSQL_USER|LLM_BASE_URL|BACKEND_SIM_BASE_URL" docs/01-getting-started/quick-start.md code/.env.example
rg -n "EventSource|ReadableStream|AsyncIterable" docs/04-reference/api/ai.md
rg -n "for await|AsyncGenerator|parseSSE" code/frontend/src/lib/ai-stream.ts code/shared/src/sdk/ai.ts
rg -n "#[0-9A-Fa-f]{3,8}" code/frontend/src/pages/Workspace.tsx code/frontend/src/components/GlobalProfileCard.css code/frontend/src/ThemeProvider.tsx
rg -n "EDGE_ROUTER_ENGINE|EXPO_PUBLIC_EDGE_ROUTER_ENGINE" code/.env.example docs/04-reference/config docs/05-explanation/architecture
rg -n "/workspace/jobs|/workspace/simulations" docs/04-reference/api/openapi.yaml
rg -n "Register.*Routes" code/backend/internal/http/router.go
```

### 9.2 术语表

| 术语 | 含义 |
|---|---|
| M | Critical Mismatch（关键契约脱节） |
| D | Spec Deviation（规范偏离） |
| G | Documentation Gap（文档覆盖不足） |
| S | Supplemental Finding（新增附加发现） |

---

## 10. 相关文档

- [发布说明总览](/07-release-notes/)
- [API 参考总览](/04-reference/api/)
- [配置参考总览](/04-reference/config/)
- [系统设计](/05-explanation/system-design)

