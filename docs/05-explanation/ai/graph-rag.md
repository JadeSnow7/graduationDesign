# GraphRAG（图结构 RAG）在本项目中的用法

本项目将 GraphRAG 作为 **AI 服务（`code/ai_service`）的一层检索增强**：先从本地知识库检索出“片段 + 邻接扩展（图）”，再把这些片段注入到上游大模型的对话上下文中，从而降低幻觉并让回答可追溯。

## 1. 集成点

### 现有接口（向后兼容）
- AI 服务接口：`POST /v1/chat`
- 启用方式：`mode` 追加后缀 `_rag`，例如 `tutor_rag`、`grader_rag`
- 开关：环境变量 `GRAPH_RAG_ENABLED=true`
- 路由字段（可选）：`privacy: private|public`、`route: local|cloud|auto`

### 新增接口（v0.2.0）
- **混合检索**：`POST /v1/chat/hybrid` - 支持语义+关键词混合检索，带 ACL 过滤
- **索引更新**：`POST /v1/graphrag/index` - 添加/更新文档到索引
- **索引删除**：`DELETE /v1/graphrag/index` - 从索引中删除文档

## 2. 构建知识库索引

### 离线构建（Markdown 文档）
```bash
cd code/ai_service
python3 -m app.graphrag.build --input ../../docs --output app/data/graphrag_index.json --root ../..
```

### 在线热更新（作业/FAQ）
通过 API 调用：
```bash
curl -X POST http://localhost:8001/v1/graphrag/index \
  -H "Content-Type: application/json" \
  -d '{
    "doc_id": "assignment:12345",
    "content": "作业内容...",
    "source": "assignment:12345",
    "course_id": "course-001",
    "user_id": "student-001",
    "doc_type": "assignment"
  }'
```

## 3. 环境变量配置

```env
# 路由与隐私策略
APP_ENV=dev|staging|prod
LLM_ROUTING_POLICY=local_first
LLM_ENABLE_CLOUD_FALLBACK_NONPROD=false
AI_GATEWAY_SHARED_TOKEN=change_me
LLM_LOCAL_TIMEOUT_SEC=30   # first-byte timeout
LLM_CLOUD_TIMEOUT_SEC=60

# local / cloud 上游
LLM_BASE_URL_LOCAL=
LLM_API_KEY_LOCAL=
LLM_MODEL_LOCAL=qwen-plus
LLM_BASE_URL_CLOUD=
LLM_API_KEY_CLOUD=
LLM_MODEL_CLOUD=qwen-plus

# 基础开关
GRAPH_RAG_ENABLED=true
GRAPH_RAG_INDEX_PATH=app/data/graphrag_index.json

# 向量存储
VECTOR_STORE_PATH=app/data/vector_index
VECTOR_STORE_TYPE=faiss

# 嵌入模型（默认使用 LLM API）
EMBEDDING_PROVIDER=api        # api | local
EMBEDDING_MODEL=text-embedding-v3

# 检索参数
GRAPH_RAG_SEED_TOP_K=4
GRAPH_RAG_EXPAND_HOPS=1
GRAPH_RAG_FINAL_TOP_K=8
GRAPH_RAG_MAX_CONTEXT_CHARS=4000
```

## 4. 安全路由头与冲突策略

- 请求头：`X-Request-ID`、`X-Privacy-Level`、`X-LLM-Route`、`X-AI-Gateway-Token`
- JSON 与 Header 同时给定且冲突时：直接 `400`（`CONFLICTING_ROUTING_PARAMS`）
- 非可信调用方请求 `public` 或 `cloud/auto`：返回 `403`（`ROUTING_FORBIDDEN`）
- `request_id` 兜底：若未透传 `X-Request-ID`，AI Service 自动生成并记录 `request_id_source=generated`

## 5. Embedding 继承与兜底

- `/v1/chat/hybrid` 中 embedding 路由继承 chat 路由，不允许 embedding 独立越权。
- 当 chat 路由满足云兜底条件（`public + trusted + policy/env`）时，embedding 本地失败可复用同一授权边界尝试 cloud。
- private 请求只允许本地 embedding，不会转云。

## 6. 调用示例

### 普通 RAG（关键词检索）
```json
{
  "mode": "tutor_rag",
  "messages": [{"role": "user", "content": "文献综述应该如何组织段落并体现“文献综合”？"}]
}
```

### 混合 RAG（语义+关键词，带 ACL）
```json
POST /v1/chat/hybrid
{
  "mode": "tutor_rag",
  "messages": [{"role": "user", "content": "如何写出清晰的 thesis statement？"}],
  "course_id": "course-001",
  "user_id": "student-001",
  "user_role": "student"
}
```

或通过 Header 传递 ACL：
```
X-Course-Id: course-001
X-User-Id: student-001
X-User-Role: student
```

## 7. ACL 过滤规则

- **教师/管理员**：可检索课程内所有内容
- **学生**：只能检索自己提交的作业内容 + 公共文档

## 8. 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    API 层 (main.py)                         │
├─────────────────────────────────────────────────────────────┤
│  /v1/chat          │  /v1/chat/hybrid  │  /v1/graphrag/*   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    检索层 (retrieve.py)                      │
│  RetrievalContext (ACL) │ RRF 融合 │ 图扩展                  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────────────────┐                     ┌───────────────────┐
│   向量存储         │                     │   图索引           │
│  (FAISS)          │                     │  (JSON)           │
│  vector_store.py  │                     │  index.py         │
└───────────────────┘                     └───────────────────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    嵌入层 (embedding.py)                     │
│  APIEmbedding (外部 API) │ LocalEmbedding (本地模型)         │
└─────────────────────────────────────────────────────────────┘
```
