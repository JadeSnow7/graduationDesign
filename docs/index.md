---
layout: home

hero:
  name: "智能教学平台"
  text: "端云协同 · 以学生为中心"
  tagline: "基于大模型的高校 AI 教学系统，支持多课程学习状态追踪、个性化辅导与高保真仿真——端侧本地推理与云端 GPU 自动协同调度"
  actions:
    - theme: brand
      text: 快速开始 →
      link: /01-getting-started/quick-start
    - theme: alt
      text: API 参考
      link: /04-reference/api/
    - theme: alt
      text: 架构说明
      link: /05-explanation/system-design

features:
  - icon: 🤖
    title: 端云协同 AI
    details: 本地 NPU/CPU 优先推理，云端 GPU 按需 fallback。学生数据私有化处理，敏感内容不出园区。支持 Qwen3 / Qwen3-VL 多模态模型。
  - icon: 📊
    title: 长期学习状态追踪
    details: 事件溯源架构记录完整学习轨迹，跨课程学生画像、薄弱点自动检测与个性化引导式学习路径。
  - icon: ✍️
    title: 写作类型感知分析
    details: 区分文献综述、课程论文、学位论文的差异化 rubric 评估与学术英文润色，输出结构化 JSON 对比视图。
  - icon: 🔬
    title: 高保真 EM 仿真
    details: 内置电磁场数值仿真引擎（Laplace 2D、1D-FDTD、Biot-Savart），Python + NumPy/SciPy + Matplotlib 可视化，支持异步工作台调度。
  - icon: 🌐
    title: 多端一致体验
    details: Web（React 19 + Vite）、Mobile（Expo React Native）、Desktop（Tauri）共享同一 @classplatform/shared SDK 和 /api/v1 后端契约。
  - icon: 🔐
    title: 安全认证与权限
    details: JWT + RBAC 三角色（admin / teacher / student）权限体系，企业微信 OAuth 无缝接入，AI 网关共享令牌隔离。
---

## 平台架构一览

```mermaid
graph TB
    subgraph Clients["客户端层"]
        W["🌐 Web\nReact 19 + Vite\n:5173"]
        M["📱 Mobile\nExpo (iOS/Android)"]
        D["🖥️ Desktop\nTauri (Rust + React)"]
        WC["💬 企业微信\nWebView H5"]
    end

    subgraph Gateway["后端网关层 (Go + Gin · :8080)"]
        AUTH["JWT 鉴权 / RBAC"]
        RATELIMIT["限流 / RequestID"]
        PROXY["AI 网关代理"]
    end

    subgraph Services["能力服务层"]
        AI["🤖 AI Service\nFastAPI · :8001\nQwen3 / GraphRAG"]
        SIM["🔬 Simulation Service\nFastAPI · :8002\nEM 仿真引擎"]
    end

    subgraph Infra["基础设施层"]
        DB[("MySQL\n:3306")]
        MINIO["MinIO\n对象存储\n:9000"]
        VDB["向量索引\nFAISS / 本地文件"]
    end

    subgraph EdgeCloud["端云推理"]
        LOCAL["本地 vLLM\nNPU / CPU\nQwen3-Text / VL"]
        CLOUD["☁️ 云端 API\nDashScope / OpenAI\nFallback 专用"]
    end

    W & M & D & WC -->|HTTPS / REST| AUTH
    AUTH --> RATELIMIT --> PROXY
    PROXY -->|"/api/v1/ai/*"| AI
    PROXY -->|"/api/v1/sim/*"| SIM
    Gateway -->|GORM ORM| DB
    Gateway -->|S3 兼容| MINIO
    AI -->|"local_first\n同族 fallback"| LOCAL
    LOCAL -.->|"触发条件:\n超时/OOM/5xx"| CLOUD
    AI --> VDB
```

## 核心特性速查

| 特性 | 说明 | 相关文档 |
|------|------|----------|
| **端云协同路由** | `local_first` 策略，同族 fallback（不跨能力降级） | [模型路由策略](/05-explanation/ai/model-routing-policy) |
| **GraphRAG 知识库** | 可追溯引用、混合向量检索、热更新索引 | [GraphRAG 说明](/05-explanation/ai/graph-rag) |
| **引导式学习** | 结构化学习路径 + 薄弱点检测 + 会话持久化 | [引导式学习](/05-explanation/ai/guided-learning) |
| **多模态** | Qwen3-VL 支持图文混合输入（默认关闭） | [AI 服务接口](/04-reference/api/ai) |
| **EM 仿真工作台** | 异步任务调度 + 进度轮询 + Base64 图像输出 | [工作台接口](/04-reference/api/workspace) |
| **NPU 分层部署** | 边缘服务器 NPU + 校园 GPU + 公有云三层 | [NPU 分层部署](/03-how-to-guides/deployment/npu-tiered-deployment) |

## 推荐阅读路径

::: tip 开发者入门（30 分钟）
1. [环境要求](/01-getting-started/prerequisites) — 确认本机依赖版本
2. [快速开始](/01-getting-started/quick-start) — Docker 一键启动全栈
3. [API 总览](/04-reference/api/) — 了解 `/api/v1` 端点体系
4. [代码规范](/06-contributing/code-style) — 多端提交规范
:::

::: tip 架构师 / 运维（深度理解）
1. [系统设计](/05-explanation/system-design) — 端云协同机制与拓扑图
2. [模型路由策略](/05-explanation/ai/model-routing-policy) — 本地/云端路由决策
3. [NPU 分层部署](/03-how-to-guides/deployment/npu-tiered-deployment) — 生产环境多层部署
4. [AI 服务接口](/04-reference/api/ai) — 流式对话与工具调用契约
:::

::: tip AI 研究 / 数据
1. [GraphRAG 说明](/05-explanation/ai/graph-rag) — 知识库检索增强
2. [引导式学习](/05-explanation/ai/guided-learning) — 学习路径与薄弱点
3. [训练数据规范](/05-explanation/ai/training-data-spec) — LoRA/QLoRA 管线
4. [Qwen3-VL 迁移基线](/05-explanation/ai/qwen3-vl-migration-baseline-2026-02-09) — 多模态升级
:::

## 文档结构

| 目录 | 用途 |
|------|------|
| `01-getting-started/` | 项目简介、环境要求、快速上手 |
| `02-tutorials/` | 完整场景教程（创建课程、服务器部署） |
| `03-how-to-guides/` | 运维、部署、CI/CD 操作指南 |
| `04-reference/` | API 契约、版本治理、CLI、配置手册 |
| `05-explanation/` | 系统设计、AI 机制、架构决策解释 |
| `06-contributing/` | 协作流程、代码规范、测试指南 |
| `07-release-notes/` | 变更日志与发布说明 |
