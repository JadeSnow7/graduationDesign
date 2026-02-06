# AI 文档索引（写作课试点）

本目录聚焦本项目的 AI 能力（训练/蒸馏/引导式学习/RAG/工具调用），并以**研究生专业英文写作**课程为默认试点场景；仿真/公式计算等能力作为“课程专属模块”保留。

## 1. 当前能力概览（与代码一致）

- **双端推理路由（本地优先）**：默认 `private + local`；仅可信网关可授权 `public` 与云路由，Header/JSON 冲突直接 `400`，并输出结构化审计日志（`request_id/request_id_source/privacy/route/final_upstream/fallback_reason`）。
- **上游模型接入**：AI Service 支持 local/cloud 双上游（`LLM_BASE_URL_LOCAL/*`、`LLM_BASE_URL_CLOUD/*`），生产固定 `LLM_ROUTING_POLICY=local_first`。
- **GraphRAG（可追溯引用）**：关键词检索 + 图扩展；并支持混合检索（关键词+语义）与索引热更新。
- **写作类型感知分析**：面向文献综述/课程论文/学位论文/摘要的 rubric 输出（结构化维度评分 + 建议）。
- **引导式学习（guided）**：生成学习路径并以苏格拉底式提问引导学生；会话内记录薄弱点与进度。
- **工具调用（可验证）**：对需要精确计算/仿真的任务，模型可触发工具调用并回注结果（示例能力）。
- **训练与评测管线**：数据规范、数据准备、LoRA/QLoRA 训练、离线评测与回归报告输出。
- **数据蒸馏与链路冒烟**：把 chat-style 数据蒸馏为 prompt/response，并用轻量 smoke 训练快速验证数据与指标输出链路。

> 代码入口：`code/ai_service/app/main.py`

## 2. 推荐阅读顺序

1. `docs/03-how-to-guides/deployment/ai-model-deployment-guide.md`（训练+部署一条龙）
2. `docs/05-explanation/ai/post-training-finetuning-plan.md`（训练路线与实验设计）
3. `docs/05-explanation/ai/training-data-spec.md`（数据格式与采集/标注建议）
4. `docs/05-explanation/ai/graph-rag.md`（RAG 与引用溯源）
5. `docs/05-explanation/ai/guided-learning.md`（引导式学习与薄弱点记录）
6. `docs/05-explanation/ai/distillation.md`（数据蒸馏与 smoke 链路验证）
7. `docs/05-explanation/ai/tool-calling.md`（工具调用机制与扩展点）
8. `docs/05-explanation/ai/learning-analytics.md`（学习状态分析与画像）
9. `docs/05-explanation/ai/papers.md`（参考论文列表：资料整理与调研入口）

## 3. 路由与合规基线

- 默认值：未显式声明时按 `privacy=private`、`route=local` 处理。
- 信任边界：只有携带 `X-AI-Gateway-Token` 且通过 `AI_GATEWAY_SHARED_TOKEN` 校验的请求，才允许 `public`/`cloud`/`auto`。
- 冲突策略：`X-Privacy-Level` 与 JSON `privacy`、`X-LLM-Route` 与 JSON `route` 冲突时返回 `400`（`CONFLICTING_ROUTING_PARAMS`）。
- 非生产兜底：`APP_ENV!=prod` 时默认 `LLM_ENABLE_CLOUD_FALLBACK_NONPROD=false`，即使 `public` 也不自动兜底云端。
