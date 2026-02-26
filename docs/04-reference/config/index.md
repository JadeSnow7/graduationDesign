# 配置参考总览

本目录汇总所有服务的环境变量与配置项。完整变量列表见 `code/.env.example`，Docker 部署时通过 `code/docker-compose.yml` 的 `environment` 区块注入。

## 核心配置入口

| 配置分组 | 变量前缀 | 说明 |
|---------|---------|------|
| 数据库 | `MYSQL_*` | MySQL 连接信息 |
| 后端 | `BACKEND_*` | JWT、CORS、DSN、服务地址 |
| AI 服务 | `LLM_*` | 模型路由、本地/云端上游 |
| GraphRAG | `GRAPH_RAG_*` | 知识库索引配置 |
| 对象存储 | `MINIO_*`（docker-compose 内） | 文件上传存储 |
| 路由引擎 | `EDGE_ROUTER_ENGINE`、`EXPO_PUBLIC_EDGE_ROUTER_ENGINE` | 见下节 |

---

## Edge Router 引擎配置

Edge Router 决定**客户端侧**（Web Desktop / Mobile）用于路由判断的引擎实现。当前支持两种实现，通过环境变量切换：

### 变量说明

| 变量名 | 适用端 | 默认值 | 可选值 | 定义位置 |
|--------|--------|--------|--------|---------|
| `EDGE_ROUTER_ENGINE` | AI Service（服务端） | `js` | `js` \| `rust` | `code/.env.example:31` |
| `EXPO_PUBLIC_EDGE_ROUTER_ENGINE` | Mobile（Expo React Native） | `js` | `js` \| `rust` | `code/.env.example:32`、`code/mobile/src/config.ts:12` |

### 可选值语义

| 值 | 说明 | 当前状态 |
|----|------|---------|
| `js` | 纯 JavaScript/TypeScript 实现的路由逻辑 | ✅ 默认，稳定可用 |
| `rust` | Rust core POC 实现（`code/rust-core/`），通过 WASM 或 IPC 调用 | ⚠️ POC 阶段，需额外构建 |

### 配置示例

**AI Service（`code/.env`）：**
```bash
EDGE_ROUTER_ENGINE=js        # 服务端路由引擎，默认 js
```

**Mobile（`code/mobile/.env.local`）：**
```bash
EXPO_PUBLIC_EDGE_ROUTER_ENGINE=js   # 客户端路由引擎，默认 js
```

### Mobile 端读取逻辑

`code/mobile/src/config.ts` 中的解析逻辑：

```typescript
const edgeRouterEngineRaw = (process.env.EXPO_PUBLIC_EDGE_ROUTER_ENGINE || 'js').trim().toLowerCase();
export const EDGE_ROUTER_ENGINE: 'js' | 'rust' = edgeRouterEngineRaw === 'rust' ? 'rust' : 'js';
```

- 未设置或无效值时，**自动回退为 `js`**
- 区分大小写不敏感（已 `toLowerCase()`）

::: warning POC 限制
`rust` 值仅在配合 `code/rust-core/` 完整构建且 Tauri/Electron 壳层集成时生效。当前移动端与 Web 端选择 `rust` 不会有功能差异，路由逻辑仍走 JS 路径。
:::

---

## 变量速查（按分组）

### 数据库

| 变量 | 示例值 | 说明 |
|------|--------|------|
| `MYSQL_ROOT_PASSWORD` | `your_root_pw` | MySQL root 密码 |
| `MYSQL_DATABASE` | `teaching_platform` | 数据库名 |
| `MYSQL_USER` | `teaching_platform` | 应用数据库用户 |
| `MYSQL_PASSWORD` | `teaching_platform_pass` | 应用数据库密码 |
| `MYSQL_HOST` | `mysql` | Docker 内服务名 |
| `MYSQL_PORT` | `3306` | 端口 |

### 后端

| 变量 | 示例值 | 说明 |
|------|--------|------|
| `BACKEND_JWT_SECRET` | `change_me_in_prod` | JWT 签名密钥，至少 32 字符 |
| `BACKEND_CORS_ORIGINS` | `http://localhost:5173` | 允许的 CORS 来源 |
| `BACKEND_DB_DSN` | `user:pass@tcp(mysql:3306)/db` | GORM 数据库连接字符串 |
| `BACKEND_AI_BASE_URL` | `http://ai:8001` | AI Service 内部地址 |
| `BACKEND_SIM_BASE_URL` | `http://sim:8002` | 仿真服务内部地址 |
| `AI_GATEWAY_SHARED_TOKEN` | `change_me_gateway_token` | 后端→AI Service 内部鉴权令牌 |

### AI 服务路由

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LLM_ROUTING_POLICY` | `local_first` | `local_first` \| `cloud_only` \| `auto` |
| `LLM_LOCAL_TIMEOUT_SEC` | `30` | 本地推理超时（秒） |
| `LLM_CLOUD_TIMEOUT_SEC` | `60` | 云端推理超时（秒） |
| `LLM_ENABLE_CLOUD_FALLBACK_NONPROD` | `false` | 非生产环境是否允许 fallback |

### AI 服务上游（云端）

| 变量 | 说明 |
|------|------|
| `LLM_BASE_URL_CLOUD` | 云端 OpenAI-compatible API 基础地址（推荐） |
| `LLM_API_KEY_CLOUD` | 云端 API Key |
| `LLM_MODEL_CLOUD` | 云端文本模型名称 |
| `LLM_BASE_URL` | 兼容旧版单变量（可选，与 `LLM_BASE_URL_CLOUD` 二选一） |

### 功能开关

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `AI_MULTIMODAL_ENABLED` | `false` | 多模态（图文）对话开关 |
| `GRAPH_RAG_ENABLED` | `false` | GraphRAG 知识库检索开关 |
| `RERANKER_ENABLED` | `false` | 检索结果重排序开关 |
| `SIM_ENGINE` | `python` | 仿真引擎实现 |

---

## 相关文档

- [快速开始](/01-getting-started/quick-start) — 必填变量配置示例
- [模型路由策略](/05-explanation/ai/model-routing-policy) — `LLM_ROUTING_POLICY` 详细规则
- [系统设计](/05-explanation/system-design) — 端云协同架构与 Edge Router 定位
- [Rust 增强 POC 计划](/05-explanation/architecture/rust-enhancement-poc-plan-2026-02-11) — `EDGE_ROUTER_ENGINE=rust` 背景
