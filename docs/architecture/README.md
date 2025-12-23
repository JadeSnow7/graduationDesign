# 架构文档

本目录包含系统架构设计相关的所有文档。

## 文档列表

### [系统架构总览](./system-overview.md)
- 整体架构设计
- 技术栈选择
- 系统边界定义
- 核心设计原则

### [组件设计](./component-design.md)
- 各组件职责划分
- 组件间接口定义
- 数据流设计
- 服务拆分策略

### [数据架构](./data-architecture.md)
- 数据模型设计
- 数据库设计
- 数据流转
- 存储策略

### [安全架构](./security-architecture.md)
- 认证授权机制
- 数据安全策略
- 网络安全设计
- 安全审计

## 架构图

### 系统架构图
```mermaid
flowchart LR
  subgraph Client[客户端]
    WeCom[企业微信客户端<br/>(内置 WebView)]
    Browser[普通浏览器]
  end

  subgraph FE[Frontend · Vue 3 H5]
    Pages[登录 / 课程 / AI 对话 / 仿真与数值工具]
  end

  subgraph BE[Backend · Go (Gin)]
    API[/REST API<br/>/api/v1/*/]
    Auth[JWT 鉴权]
    RBAC[RBAC 权限]
    Course[课程管理]
    AIGW[AI 网关<br/>POST /ai/chat]
    SimGW[仿真网关<br/>POST /sim/*<br/>POST /calc/*]
    WecomAuth[企业微信 OAuth<br/>/auth/wecom*]
  end

  subgraph SVC[能力服务]
    AI[AI Service · FastAPI<br/>POST /v1/chat]
    Sim[Sim Service · FastAPI<br/>/v1/sim/* · /v1/calc/*]
  end

  subgraph Data[数据与索引]
    MySQL[(MySQL<br/>users / courses ...)]
    RAG[(GraphRAG Index<br/>JSON 文件)]
  end

  subgraph External[外部依赖]
    LLM[上游大模型<br/>OpenAI 兼容接口<br/>(如 Qwen)]
    WecomAPI[企业微信开放接口]
  end

  WeCom --> FE
  Browser --> FE
  FE -->|HTTP JSON| API

  API --> Auth
  API --> RBAC
  API --> Course
  API --> AIGW
  API --> SimGW
  API --> WecomAuth
  API --> MySQL

  AIGW -->|HTTP JSON| AI
  SimGW -->|HTTP JSON| Sim

  AI -->|可选读取| RAG
  AI -->|POST /v1/chat/completions| LLM

  WecomAuth -->|HTTPS| WecomAPI
```

## 设计决策记录

重要的架构决策将记录在各个具体文档中，包括：
- 决策背景
- 考虑的方案
- 选择的方案及理由
- 预期影响

## 相关资源

- [API 文档](../api/)
- [部署文档](../deployment/)
- [开发文档](../development/)