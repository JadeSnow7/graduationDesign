# GraphRAG（图结构 RAG）在本项目中的用法

本项目将 GraphRAG 作为 **AI 服务（`services/ai`）的一层检索增强**：先从本地知识库检索出“片段 + 邻接扩展（图）”，再把这些片段注入到上游大模型的对话上下文中，从而降低幻觉并让回答可追溯。

## 1. 集成点（已经接入的位置）
- AI 服务接口：`POST /v1/chat`
- 启用方式：`mode` 追加后缀 `_rag`，例如 `tutor_rag`、`grader_rag`
- 开关：环境变量 `GRAPH_RAG_ENABLED=true`

## 2. 构建知识库索引（离线）
当前实现提供一个轻量索引构建器：从 Markdown 标题层级生成“章节图”，并把每个章节正文作为可检索片段。

在仓库根目录执行：
```bash
cd emfield-teaching-platform/services/ai
python -m app.graphrag.build --input ../../docs --output app/data/graphrag_index.json --root ../..
```

你可以把 `--input` 换成你自己的讲义/题库 Markdown 目录（建议集中放在例如 `docs/course/`）。

## 3. 运行时开启
编辑 `deploy/.env`：
```env
GRAPH_RAG_ENABLED=true
GRAPH_RAG_INDEX_PATH=app/data/graphrag_index.json
```

如果你使用 Docker Compose，重新构建并启动：
```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d --build
```

## 4. 调用示例
后端入口仍是：`POST /api/v1/ai/chat`，只需把 `mode` 改成带 `_rag` 的值：
```json
{
  "mode": "tutor_rag",
  "messages": [{"role":"user","content":"什么是边界条件？"}]
}
```

## 5. 可调参数
可选环境变量：
- `GRAPH_RAG_SEED_TOP_K`：初筛片段数量（默认 4）
- `GRAPH_RAG_EXPAND_HOPS`：图扩展跳数（默认 1）
- `GRAPH_RAG_FINAL_TOP_K`：最终注入片段数量（默认 8）
- `GRAPH_RAG_MAX_CONTEXT_CHARS`：注入上下文最大字符数（默认 4000）

