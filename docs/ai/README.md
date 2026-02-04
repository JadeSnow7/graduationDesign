# AI 文档索引（写作课试点）

本目录聚焦本项目的 AI 能力（训练/蒸馏/引导式学习/RAG/工具调用），并以**研究生专业英文写作**课程为默认试点场景；仿真/公式计算等能力作为“课程专属模块”保留。

## 1. 当前能力概览（与代码一致）

- **上游模型接入**：AI Service 通过 OpenAI-compatible ChatCompletions 调用上游模型（`LLM_BASE_URL/LLM_API_KEY/LLM_MODEL`）。
- **GraphRAG（可追溯引用）**：关键词检索 + 图扩展；并支持混合检索（关键词+语义）与索引热更新。
- **写作类型感知分析**：面向文献综述/课程论文/学位论文/摘要的 rubric 输出（结构化维度评分 + 建议）。
- **引导式学习（guided）**：生成学习路径并以苏格拉底式提问引导学生；会话内记录薄弱点与进度。
- **工具调用（可验证）**：对需要精确计算/仿真的任务，模型可触发工具调用并回注结果（示例能力）。
- **训练与评测管线**：数据规范、数据准备、LoRA/QLoRA 训练、离线评测与回归报告输出。
- **数据蒸馏与链路冒烟**：把 chat-style 数据蒸馏为 prompt/response，并用轻量 smoke 训练快速验证数据与指标输出链路。

> 代码入口：`code/ai_service/app/main.py`

## 2. 推荐阅读顺序

1. `docs/deployment/ai-model-deployment-guide.md`（训练+部署一条龙）
2. `docs/ai/post-training-finetuning-plan.md`（训练路线与实验设计）
3. `docs/ai/training-data-spec.md`（数据格式与采集/标注建议）
4. `docs/ai/graph-rag.md`（RAG 与引用溯源）
5. `docs/ai/guided-learning.md`（引导式学习与薄弱点记录）
6. `docs/ai/distillation.md`（数据蒸馏与 smoke 链路验证）
7. `docs/ai/tool-calling.md`（工具调用机制与扩展点）
8. `docs/ai/learning-analytics.md`（学习状态分析与画像）
9. `docs/ai/papers.md`（参考论文列表：资料整理与调研入口）
