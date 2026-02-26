# 快速开始

本指南涵盖所有端的本地开发启动方式，以及 Docker 一键部署全栈的完整步骤。

## 系统要求

### 软件依赖

| 工具 | 最低版本 | 说明 |
|------|----------|------|
| **Docker** | 20.10+ | 全栈容器化部署必需 |
| **Docker Compose** | 2.0+ | 多服务编排 |
| **Go** | 1.24+ | 仅后端本地开发需要 |
| **Node.js** | 18+ | 前端 / 文档站开发 |
| **Python** | 3.9+ | AI 服务 / 仿真服务开发 |
| **Git** | 2.0+ | 源码管理 |

### 推荐配置（本地开发）

- CPU：4 核心；内存：8 GB；磁盘：50 GB SSD
- 如需运行本地 LLM 推理，额外需要：NVIDIA GPU ≥ 8 GB 显存，或 Ascend NPU

---

## 方式一：Docker 全栈一键部署（推荐）

### 1. 克隆仓库

```bash
git clone https://github.com/JadeSnow7/graduationDesign.git
cd graduationDesign
```

### 2. 配置环境变量

```bash
cp code/.env.example code/.env
```

打开 `code/.env`，填写以下必填项：

```bash
# ── 数据库 ──────────────────────────────────────────────
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=teaching_platform
MYSQL_USER=teaching_platform
MYSQL_PASSWORD=teaching_platform_pass

# ── 后端 ────────────────────────────────────────────────
BACKEND_JWT_SECRET=your_jwt_secret_min_32_chars
BACKEND_CORS_ORIGINS=http://localhost:5173
BACKEND_SIM_BASE_URL=http://sim:8002

# ── AI 服务（使用云端 API 时填写）──────────────────────
# 推荐：使用分层变量（与 .env.example 一致）
LLM_BASE_URL_CLOUD=https://dashscope.aliyuncs.com/compatible-mode
LLM_API_KEY_CLOUD=sk-xxxxxxxxxxxxxxxx
LLM_MODEL_CLOUD=qwen-plus
LLM_ROUTING_POLICY=cloud_only      # 无本地模型时使用 cloud_only
# LLM_BASE_URL=                    # 兼容旧版单变量（可选，与 LLM_BASE_URL_CLOUD 二选一）

# ── AI 网关共享令牌（后端→AI Service 内部鉴权）──────────
AI_GATEWAY_SHARED_TOKEN=your_internal_token
```

::: details 企业微信可选配置
```bash
WECOM_CORPID=your_corp_id
WECOM_AGENTID=your_agent_id
WECOM_SECRET=your_secret
```
:::

::: details 本地 LLM 推理配置（NPU / GPU）
```bash
LLM_ROUTING_POLICY=local_first      # 本地优先，失败后 fallback 云端

# 文本模型（本地 vLLM 实例）
LLM_BASE_URL_LOCAL_TEXT=http://your-vllm-host:8000/v1
LLM_API_KEY_LOCAL_TEXT=token-local
LLM_MODEL_LOCAL_TEXT=qwen3

# 视觉模型（可选）
LLM_BASE_URL_LOCAL_VL=http://your-vllm-vl-host:8001/v1
LLM_MODEL_LOCAL_VL=qwen3-vl
AI_MULTIMODAL_ENABLED=true
```
:::

### 3. 启动全栈服务

```bash
cd code
docker-compose up -d --build
```

构建完成后将启动以下 4 个服务：MySQL、MinIO、后端 API、AI 服务（仿真服务通过后端网关代理）。

### 4. 验证服务健康状态

```bash
# 后端 API
curl http://localhost:8080/health
# 期望：{"success":true,"data":{"status":"ok"}}

# AI 服务
curl http://localhost:8001/healthz
# 期望：{"status":"ok"}

# MinIO 控制台
open http://localhost:9001   # 账号 minioadmin / minioadmin123
```

### 5. 访问 Web 前端

```bash
cd code/frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 方式二：多端本地开发（推荐开发者使用）

### 2-A  后端（Go + SQLite，无需 Docker）

最快的后端启动方式，使用本地 SQLite 代替 MySQL：

```bash
cd code/backend
./run_local_sqlite.sh
```

该脚本已预设如下环境变量并启动 `go run ./cmd/server`：

```bash
DB_DSN=sqlite:emfield.db
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8081
MINIO_ENDPOINT=localhost:9000
```

::: warning
SQLite 模式仅用于本地快速验证，不支持生产部署。
:::

### 2-B  Web 前端（React 19 + Vite）

```bash
cd code/frontend
npm install
npm run dev       # → http://localhost:5173（Vite 热重载）
```

常用命令：

```bash
npm run build     # TypeScript 编译 + Vite 打包
npm run lint      # ESLint 静态检查
npm run test      # vitest 单元测试
npm run test:e2e  # Playwright 端对端测试
npm run storybook # Storybook 组件展示 → :6006
```

### 2-C  Mobile（Expo React Native）

```bash
cd code/mobile
npm install
npx expo start
```

扫描终端中的二维码即可在手机 Expo Go 应用中预览。

::: tip
Mobile 端通过环境变量 `EXPO_PUBLIC_API_BASE_URL` 指向后端，本地调试时设置为 `http://<本机IP>:8080/api/v1`。
:::

::: details Mobile 环境变量与存储配置详情

#### 环境变量

在 `code/mobile/` 目录创建 `.env.local` 文件（或通过 `eas.json` 注入）：

```bash
# 后端 API 地址（必填，本地调试时替换为本机 IP）
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080/api/v1

# Edge Router 引擎（可选，默认 js）
# 可选值：js | rust（rust 需配合 Rust core POC 构建）
EXPO_PUBLIC_EDGE_ROUTER_ENGINE=js
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:8080`（DEV）| 后端 API 基础地址，**不含** `/api/v1` 后缀，代码内自动追加 |
| `EXPO_PUBLIC_EDGE_ROUTER_ENGINE` | `js` | 路由引擎选择：`js`（纯 JS 实现）或 `rust`（Rust core，POC） |

#### 会话存储行为

Mobile 端使用 `@react-native-async-storage/async-storage` 持久化数据，存储键如下：

| 键名 | 内容 | 裁剪策略 |
|------|------|---------|
| `@classPlatform:authSession` | JWT Token + 用户信息 | 无裁剪，登出时清除 |
| `@classPlatform:messages` | 聊天历史记录 | **保留最新 50 条**（`MAX_HISTORY=50`），超出部分丢弃 |

::: warning 历史消息限制
每次调用 `saveMessages()` 时，历史记录自动裁剪为最近 `MAX_HISTORY=50` 条消息（`messages.slice(-50)`）。长对话场景下早期上下文会丢失，设计上为移动端存储容量权衡。
:::

#### 本地排障

```bash
# 验证 API 连通性（在手机浏览器或 Expo 中访问）
curl http://<本机IP>:8080/health
# 期望：{"success":true,"data":{"status":"ok"}}

# 查看 Metro Bundler 日志
npx expo start --clear   # 清除缓存后重启
```

常见问题：
- **CORS 错误**：确认后端 `BACKEND_CORS_ORIGINS` 中包含手机的实际访问地址
- **无法连接**：移动端与电脑需在同一 Wi-Fi 网络，不能使用 `localhost`

:::


### 2-D  Desktop（Tauri）

::: warning POC 阶段
`desktop-tauri` 当前为 **POC shell**，仅暴露 `router_decide` 命令，尚无完整桌面应用脚手架（无 `package.json`）。以下命令为当前可执行的 POC 入口。
:::

```bash
cd code/desktop-tauri/src-tauri
cargo run --features tauri-command  # 需要本机已安装 Rust 工具链
```

### 2-E  AI 服务（Python FastAPI）

```bash
cd code/ai_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### 2-F  仿真服务（Python FastAPI）

```bash
cd code/simulation
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

---

## 默认账号

系统启动时自动通过种子数据创建以下账号：

| 角色 | 用户名 | 密码 | 可访问功能 |
|------|--------|------|-----------|
| 管理员 | `admin` | `admin123` | 全部权限 |
| 教师 | `teacher` | `teacher123` | 课程管理、AI/仿真 |
| 学生 | `student` | `student123` | 课程查看、AI/仿真 |

::: danger 生产环境必读
请在部署前修改所有默认密码及 `BACKEND_JWT_SECRET`，并确保 `code/.env` 不被纳入版本控制。
:::

---

## 快速功能验证

### 登录并获取 Token

```bash
TOKEN=$(curl -sS -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"student","password":"student123"}' \
  | jq -r '.data.access_token')

echo "Token: $TOKEN"
```

### 验证 AI 对话

```bash
curl -sS -X POST http://localhost:8080/api/v1/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "mode": "tutor",
    "messages": [{"role": "user", "content": "什么是 thesis statement？"}],
    "stream": false
  }' | jq '.data.reply'
```

### 验证仿真服务

```bash
curl -sS -X POST http://localhost:8080/api/v1/sim/laplace2d \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"nx": 20, "ny": 20, "v_top": 1, "v_bottom": 0, "v_left": 0, "v_right": 0}' \
  | jq '.data.metadata'
```

---

## 文档站开发

```bash
# 从仓库根目录（非 code/ 子目录）运行
npm install
npm run docs:dev     # → http://localhost:5173（VitePress 热重载）
npm run docs:build   # 构建静态站点到 docs/.vitepress/dist/
```

---

## 常见问题

::: details 端口冲突
在 `code/.env` 中修改对应端口后重新执行 `docker-compose up -d`。
:::

::: details 数据库启动失败
```bash
docker-compose logs mysql   # 查看详细错误
docker-compose down -v      # 清除数据卷后重试（会丢失数据）
docker-compose up -d
```
:::

::: details AI 返回 503 / 超时
1. 检查 `LLM_ROUTING_POLICY`：无本地模型时应设为 `cloud_only`
2. 检查 `LLM_API_KEY` 是否有效
3. 查看 AI 服务日志：`docker-compose logs ai`
:::

::: details 前端请求 CORS 错误
确认 `BACKEND_CORS_ORIGINS` 包含前端地址，例如 `http://localhost:5173`。
:::

## 下一步

- 📖 [API 参考](/04-reference/api/) — 了解所有后端接口
- 🏗️ [系统设计](/05-explanation/system-design) — 理解端云协同架构
- 🤖 [模型路由策略](/05-explanation/ai/model-routing-policy) — 本地/云端路由规则
- 🔬 [工作台接口](/04-reference/api/workspace) — 仿真异步任务 API
