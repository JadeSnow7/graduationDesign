# AI服务 (AI Service)

基于 Python 的 AI 服务，提供智能问答和知识图谱功能。

## 技术栈

- Python 3.9+
- FastAPI (Web框架)
- LangChain (LLM框架)
- NetworkX (图数据库)
- OpenAI API (大语言模型)

## 开发环境

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn app.main:app --reload --port 8001
```

## 项目结构

```
app/
├── main.py           # 应用入口
├── graphrag/         # 图RAG实现
│   ├── build.py      # 知识图谱构建
│   ├── index.py      # 索引管理
│   └── retrieve.py   # 检索服务
└── models/           # 数据模型
```

## 主要功能

- 基于RAG的智能问答
- 知识图谱构建和查询
- 文档向量化和检索
- 多轮对话管理

## 配置说明

需要设置以下环境变量：
- `OPENAI_API_KEY`: OpenAI API密钥
- `OPENAI_BASE_URL`: API基础URL（可选）

## 相关文档

- [GraphRAG设计](../../docs/architecture/graphrag.md)
- [API文档](../../docs/api/ai-services.md)