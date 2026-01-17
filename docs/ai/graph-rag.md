# GraphRAG（图结构 RAG）在本项目中的用法

本项目将 GraphRAG 作为 **AI 服务（`services/ai`）的一层检索增强**：先从本地知识库检索出"片段 + 邻接扩展（图）"，再把这些片段注入到上游大模型的对话上下文中，从而降低幻觉并让回答可追溯。

## 1. 集成点

### 现有接口（向后兼容）
- AI 服务接口：`POST /v1/chat`
- 启用方式：`mode` 追加后缀 `_rag`，例如 `tutor_rag`、`grader_rag`
- 开关：环境变量 `GRAPH_RAG_ENABLED=true`

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

## 4. 调用示例

### 普通 RAG（关键词检索）
```json
{
  "mode": "tutor_rag",
  "messages": [{"role": "user", "content": "什么是边界条件？"}]
}
```

### 混合 RAG（语义+关键词，带 ACL）
```json
POST /v1/chat/hybrid
{
  "mode": "tutor_rag",
  "messages": [{"role": "user", "content": "什么是边界条件？"}],
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

## 5. ACL 过滤规则

- **教师/管理员**：可检索课程内所有内容
- **学生**：只能检索自己提交的作业内容 + 公共文档

## 6. 架构

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
