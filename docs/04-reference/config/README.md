# 配置参考（精简版）

本页给出新人最常用的阻断级配置项。完整配置请查看 [配置索引](./index.md)。

## 数据库（开发 / 生产）

| 变量 | 场景 | 说明 |
|------|------|------|
| `DB_DSN` | 本地开发 | 后端运行时数据库连接串；可用 `sqlite:emfield.db` 快速启动。 |
| `MYSQL_DATABASE` | 生产/容器 | MySQL 数据库名；与 `MYSQL_USER`、`MYSQL_PASSWORD`、`BACKEND_DB_DSN` 配套使用。 |

## 端云协同与网关

| 变量 | 说明 |
|------|------|
| `EDGE_ROUTER_ENGINE` | 端云协同路由引擎（`js` / `rust`），当前推荐 `js`。 |
| `BACKEND_SIM_BASE_URL` | 后端网关转发 Python 仿真服务的目标地址（缺失会导致 `/api/v1/sim/*` 不可用）。 |

## AI 基础上游

| 变量 | 说明 |
|------|------|
| `LLM_BASE_URL` | OpenAI-compatible 上游基础地址（兼容旧版单变量）。 |
| `LLM_API_KEY` | 上游 API Key（兼容旧版单变量）。 |

> 推荐：新部署优先使用分层变量（`LLM_BASE_URL_CLOUD` / `LLM_API_KEY_CLOUD` 与 local/text/vl 组合）。
