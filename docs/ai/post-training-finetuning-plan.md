# 后训练与微调计划（面向通用教学助手）

本文给出一套可落地的“后训练（Post-Training）/微调（Fine-tuning）”路线，目标是让模型在本项目的多模式对话（`tutor/grader/sim_explain/formula_verify/sim_tutor/problem_solver`）、GraphRAG 引用规范、以及工具调用（数值计算/仿真）上表现更稳定、可验证、可追溯。

> 说明：文档示例可替换为任意课程语料与知识包，不再绑定单一学科。

---

## 1. 目标与边界

### 1.1 目标（可验收）
- **教学风格一致**：回答遵循“先结论→再推导→再检查/单位/边界条件”的结构，语言贴近课程语境。
- **可追溯**：启用 GraphRAG（`*_rag`）时，能基于检索片段作答并正确标注引用 `[1][2]`，不编造引用。
- **可验证**：涉及积分/微分/矢量算子/数值仿真时，能正确触发工具调用并将结果解释回到物理含义。
- **稳健拒答**：证据不足、信息不全、超出课程范围时能明确说明并给出补充信息清单。

### 1.2 不做的事（避免浪费算力）
- 不追求“替代 GraphRAG”的记忆型背诵；优先用检索解决“知识更新/引用溯源”问题。
- 不做大规模全参微调（除非有 8×80GB 级别算力与明确收益评估）；默认采用 LoRA/QLoRA。

---

## 2. 基座模型选择建议

按“中文能力 + 推理/数学 + 许可友好 + 生态成熟”选型，优先从 7B/14B Instruct 起步：

- **7B（建议起步）**：成本最低，适合验证路线与做消融实验；配合 GraphRAG + 工具调用可满足大部分教学问答。
- **14B（效果上限更高）**：对推导解释、长上下文稳定性更好，但训练/部署成本显著增加。

### 2.1 Qwen3-8B 权重选择（推荐）
面向“教学助手 + 两个月快速迭代 + 开发/测试优先”的目标：
- **工程起步优先选**：`Qwen3-8B-Instruct`（更强的指令遵循与对话稳定性，能显著减少你在阶段 B/C/D 的数据量压力）
- **Base 权重的定位**：更适合做消融对比或“从零学教学风格”的实验线；若只做工程交付，不建议把 Base 作为主线起点
- **训练 vs 推理**：训练用 `BF16/FP16 safetensors`，推理再选 `AWQ/GPTQ/GGUF`（见 8.8）

选择时建议固定以下约束，方便后续评测对比：
- 上下文长度（例如 8k/16k）
- 是否原生支持工具调用/函数调用（或可通过提示词约束实现）
- 部署方式（vLLM/TGI/Ollama/厂商 API）

---

## 3. 数据策略（决定上限）

### 3.1 数据来源分层
- **高价值真实数据（优先）**
  - 课程讲义/实验指导/作业题与标准解（注意版权与脱敏）
  - 教师/助教答疑记录（脱敏后）
  - 本项目已有文档：`docs/`、课程相关说明、FAQ
- **合成数据（补齐覆盖面）**
  - 用强模型“生成题目→生成参考解→自检→再改写为教学口吻”
  - 用工具生成“可验证数值结果/图像趋势”，再反向生成讲解文本

### 3.2 样本类型（建议配比）
- **教学解释类（tutor/problem_solver）**：概念解释、推导步骤、单位与边界条件检查
- **批改类（grader）**：按 rubrics 输出扣分点/改进建议/提示，不直接给最终答案（或按权限策略）
- **RAG 落地类（*_rag）**：给定检索片段（带编号/来源），要求“只基于片段作答 + 正确引用”
- **工具调用类（formula_verify/sim_tutor）**：识别调用时机、构造参数、解读工具结果

### 3.3 标注与格式建议
为减少“训练后上线不一致”，数据格式尽量贴近运行时协议：
- **多模式**：每条样本显式标注 `mode`（对应服务端 system prompt）
- **RAG 引用**：将检索片段作为 `system` 或 `context` 字段注入，要求输出包含 `[编号]`
- **工具调用**：采用“函数调用/工具调用”结构化标注（name + args + tool_result），并保留最终自然语言解释
- **拒答类型**：对“应拒答”的样本显式标注 `refusal_type`，并显式区分“模型拒答”与“系统拒答/执行失败”
  - 系统拒答：权限/学术不端/策略性拒答（不计入模型能力退化）
  - 执行失败：上游模型/工具/网络等错误（应作为 `error` 单独统计）
  - `refusal_type`: `insufficient_context | missing_parameters | out_of_scope`

---

## 4. 训练路线（从低成本到高收益）

### 阶段 A：数据清洗与基线评测（必须先做）
- 清洗：去重、纠错、脱敏、统一符号与单位（例如 ε₀、μ₀、向量加粗/箭头风格）
- 构建基线集（固定不变）：用于回归对比与论文消融实验

### 阶段 B：教学风格 SFT（LoRA/QLoRA）
目的：让模型学会“课堂式讲解 + 推导结构 + 不确定性表达”。
- 输入：用户问题 + 对应 `mode` 的系统提示
- 输出：结构化自然语言（建议固定 Markdown 结构，便于训练与评测）
  - `### 结论` → `### 推导` → `### 检查（单位/边界条件/极限情况）`

### 阶段 C：工具调用 SFT（Tool-use SFT）
目的：减少“心算/编造”，把数值与符号计算交给工具。
- 覆盖工具（建议与当前网关一致）：
  - 数值计算：`/api/v1/calc/integrate`、`/api/v1/calc/differentiate`、`/api/v1/calc/evaluate`、`/api/v1/calc/vector_op`
  - 仿真：`/api/v1/sim/*`（如 `laplace2d/point_charges/wire_field/wave_1d` 等）
- 样本结构建议：同一道题至少包含三类样本（覆盖真实使用中的“延迟调用”）
  1) “应调用工具”的正例（带 tool_call + tool_result + 最终解释）
  2) “不应调用工具”的负例（直接推理/解释即可）
  3) “延迟调用”的正例（先教学解释/建模，再明确说明需要精确计算并调用工具）

### 阶段 D：RAG 落地 SFT（Grounded SFT）
目的：在启用 GraphRAG 的情况下保持“引用正确 + 不编造”。
- 输入：检索片段（带编号与来源）+ 用户问题
- 输出：只基于片段的回答，带 `[编号]` 引用；片段不足则拒答并说明缺口（可标注 `refusal_type=insufficient_context`）
- 建议加入“冲突证据”样本：给出两段结论略有差异的片段，要求模型指出冲突、说明适用条件，或明确“资料不足以给出唯一结论”

### 阶段 E：偏好优化（DPO/RLHF-lite，可选）
目的：降低幻觉、提高教学可读性与格式稳定性，尤其是长推导与引用一致性。
- 数据获取：对同一输入生成 A/B 两个回答（或人写一个、模型写一个），用规则+人工混合打分选优
- 优先优化维度：引用正确性 > 计算一致性 > 教学结构 > 文风

### 阶段 F：安全与边界对齐（轻量）
目的：防止越权给答案、隐私泄露、以及学术不端场景的直接解题。
- 做法：少量“拒答/改写为提示/引导提问”的样本 + 回归集（拒答样本带 `refusal_type`，便于论文量化）

---

## 5. 评测与验收（建议写进论文）

### 5.1 离线评测集（建议最少 200-500 条）
按能力分桶并固定种子：
- 概念题、推导题、计算题、仿真解释题、批改题、RAG 引用题

### 5.2 指标（能自动化的尽量自动化）
- **引用一致性**：回答中出现的 `[n]` 必须来自检索片段编号集合；并统计“无引用/错引用/编造引用”比例
- **工具调用准确率**：函数名/参数字段是否正确、是否在该题触发、是否遗漏关键工具调用
- **数值正确性**：可用容差判断（例如相对误差 < 1e-3），并校验单位/量纲描述
- **格式合规率**：不建议只用正则；二选一更稳
  - 固定 Markdown 标题结构（如 `### 结论/推导/检查`），用解析/规则校验是否齐全
  - 或训练一个极小的结构判别器（也可用规则+少量人工抽检）
- **拒答类型准确率**：在“应拒答”的样本上，拒答是否发生、以及 `refusal_type` 是否正确
- **冲突证据处理正确率**：在“冲突证据”样本上，是否指出冲突并给出适用条件/不确定性结论
- **端到端质量**：人工抽检 30-50 条，按 rubric 打分（清晰度、正确性、可教性、可信度）

---

## 6. 与当前系统的集成建议（最小改动）

本项目 AI 服务当前通过 API 调用上游模型并用 `mode` 注入 system prompt（见 `code/ai_service/app/main.py`）。为了低风险接入微调模型，建议：
- 先把微调模型作为**可选 provider**接入（vLLM/OpenAI-compatible），通过环境变量切换
- RAG 仍由 GraphRAG 负责，微调主要解决“教学风格 + 引用/工具调用纪律”
- 工具调用优先在 AI 服务侧做“是否调用”的决策，执行仍走现有 `/api/v1/calc/*` 与 `/api/v1/sim/*` 网关

---

## 7. 里程碑（示例）

1) 第 1 周：基线集 + 数据清洗 + 基座模型评测  
2) 第 2 周：阶段 B（教学风格 SFT）+ 回归  
3) 第 3 周：阶段 C（工具调用 SFT）+ 自动化指标  
4) 第 3 周末：止损检查（若阶段 C/D 关键指标提升 < X%，例如工具调用准确率提升 < 5% 且错引用率下降 < 10%，则停止扩展数据，转为论文整理与工程收敛）  
5) 第 4 周：阶段 D（RAG 落地 SFT）+ 消融实验  
6) 第 5 周：阶段 E/F（可选）+ 部署与论文结果整理

### 7.1 两个月训练与迭代计划（按开发/测试目标）

> 前提：基座选 `Qwen3-8B-Instruct`，训练以 LoRA/QLoRA 为主；推理并发通过后期多实例部署解决。

- **第 1-2 周（把管线跑通）**
  - 固定离线评测集（200-500 条）与指标脚本（引用一致性/工具调用/拒答类型/冲突证据）
  - 做阶段 B（教学风格 SFT）：先小数据（1k-3k）验证格式约束，再扩到可用规模（3k-10k）
  - 交付物：`adapter_v1_style` + 基线对比报告

- **第 3-4 周（工具调用与 RAG 对齐）**
  - 做阶段 C（Tool-use SFT）：覆盖“应调用/不应调用/延迟调用”，优先补齐高频错例
  - 做阶段 D（RAG Grounded SFT）：覆盖“片段不足拒答 + 冲突证据处理”
  - 交付物：`adapter_v2_tool`、`adapter_v3_rag` + 消融实验（B/C/D 逐步叠加）

- **第 5-6 周（合并训练 + 回归收敛）**
  - 将 B/C/D 多任务合并做一次“统一 SFT”（减少 mode 切换时的风格漂移）
  - 针对回归集失败样本做 targeted data（只补“错得最多的 20%”）
  - 交付物：`adapter_v4_multitask` + 回归通过率曲线

- **第 7-8 周（工程集成 + 论文材料）**
  - 接入 AI 服务为可选 provider（保持 GraphRAG/工具执行链不变）
  - 固化评测结果、画图、整理消融与止损点结论
  - 交付物：可部署镜像/运行手册 + 论文结果表格/图

> 经验值：8B QLoRA 在 1×4090 24GB 上通常能把上述训练拆成多次 2-6 小时的小任务完成；总 GPU 小时取决于数据量与序列长度，优先以“短任务 + 频繁回归”降低试错成本。

### 7.2 能否用 Spot + 断线重连降低成本？（可以）

需要区分两类“断线”：
- **本地断线/SSH 断开**：训练不会停；用 `tmux/screen` 运行训练即可随时重连查看日志。
- **Spot 被回收（中断实例）**：训练会被杀；必须依赖“持久化存储 + 断点续训”。

建议做法（以 RunPod/同类平台为例）：
- **把数据与 checkpoint 放在持久化位置**
  - 优先用平台的 **Network Volume/持久盘**；或同步到 **对象存储（S3/MinIO）**
- **频繁保存 checkpoint，且确保能 resume**
  - `save_strategy=steps`，`save_steps` 控制在 10-30 分钟一次的量级（按吞吐估算）
  - 开启 `resume_from_checkpoint`（Transformers/Accelerate/TRL 都支持）
  - 保存内容至少包含：LoRA adapter + trainer state（含优化器/调度器状态），否则只能“从 adapter 重启”会损失收敛速度
- **用“短任务”拥抱中断**
  - 把训练拆成多次 2-6 小时的小 run；每次结束都产出可用 adapter，并做一次回归评测

成本预期（以图中 4090 Spot 计费为例）：
- 只要你能做到“随时被打断也能从最近 checkpoint 续训”，Spot 通常可以直接把 GPU 成本压到 on-demand 的 40%-60% 左右（具体取决于中断频率与你损失的未保存进度）。

---

## 8. GPU 服务器选型（高性价比）

### 8.1 先按“你要做什么”选显存
- **只做 7B 级别 LoRA/QLoRA 微调 + 单机验证**：24GB 显存基本够用（更看重性价比）。
- **做 14B 微调或更长上下文（8k/16k）**：建议 48GB 显存更稳；或 2×24GB 分布式。
- **做 32B+ 或者做 DPO/大 batch**：优先 80GB（A100/H100）或多卡 48GB 起步。
- **只部署推理**：可用 4-bit/8-bit 量化显著降显存，但并发与上下文长度会把显存“吃回来”（KV cache）。

### 8.2 性价比优先的 GPU 档位建议
- **首选（通用性价比）**：RTX 4090 24GB（训练/推理都强，适合 7B-14B 的 QLoRA 路线）
- **预算更低（能跑就行）**：RTX 3090 24GB（二手普遍更划算，训练速度较慢）
- **更稳的 48GB（面向 14B/长上下文）**：L40S 48GB / RTX 6000 Ada 48GB / A6000 48GB
- **80GB（面向 32B+/高并发/更省折腾）**：A100 80GB（成本高，但工程风险更低）

### 8.3 推荐“整机/云主机”配置（按 1 张 GPU 估算）
- CPU：16-32 核（推理并发与 RAG 检索更吃 CPU）
- 内存：≥ 128GB（做数据预处理、向量索引与多进程更稳）
- 硬盘：NVMe ≥ 2TB（数据集 + checkpoint + 向量库）
- 网络：≥ 1Gbps（云上拉数据/推理服务对外访问）

### 8.4 云上租用的选型建议（不绑定平台）
- 优先选 **4090/3090** 做“阶段 B/C/D 的小步快跑”，用完即停，成本最低。
- 需要更稳定或长上下文时再升级到 **48GB（L40S/A6000/6000 Ada）**。
- 训练可用 **spot/抢占式** 降成本，但要配合断点续训与频繁保存 checkpoint。

### 8.5 直接可用的推荐组合（按目标）
- **最低成本跑通路线（7B）**：1× RTX 3090 24GB + 16C CPU + 128GB RAM + 2TB NVMe
- **性价比主力（7B/14B，兼顾推理）**：1× RTX 4090 24GB + 16-32C CPU + 128GB RAM + 2TB NVMe
- **更稳的 14B/长上下文（少折腾）**：1× L40S/A6000/6000 Ada 48GB + 24-48C CPU + 256GB RAM + 2-4TB NVMe
- **32B+ 或高并发推理**：1× A100 80GB（或多卡 48GB）+ 32-64C CPU + 256-512GB RAM

### 8.6 平台选择与注意事项（简要）
- 国内快速上手通常更顺畅（镜像/网络/支付）：可优先挑选支持 3090/4090/L40S 的 GPU 租用平台或主流云厂商 GPU 实例。
- 海外平台往往更便宜但网络与合规成本更高：适合做离线训练与一次性实验（避免频繁拉取大数据）。
- 关注“隐藏成本”：磁盘与流量计费、抢占中断、镜像/驱动可用性、是否允许自建推理服务端口。

### 8.7 云服务厂商建议（开发/测试优先）
不绑定单一厂商，按“省钱/省心/网络”分三类选：
- **GPU 租用平台（性价比优先）**：AutoDL、Brev.dev / RunPod、Vast.ai 等同类平台（优点是便宜灵活；缺点是稳定性与公网入口/端口策略因平台而异）。
- **主流云（稳定与合规优先）**：阿里云/腾讯云/华为云/百度智能云/火山引擎等（优点是网络与安全组/对象存储配套完善；缺点是单价通常更高）。
- **托管推理/大模型平台（最快接入）**：如果仅需 API 联调而不训练，可优先选择提供 OpenAI-compatible 接口或托管 Qwen 系列模型的厂商服务（优点是免运维；缺点是长期成本与可控性）。

### 8.8 Qwen3 8B “权重”选择（训练 vs 推理）
建议同时准备两套权重，避免“训练/部署两头卡”：
- **训练用（LoRA/QLoRA）**：优先用官方 `BF16/FP16` 的 `safetensors`（Base 或 Instruct；做对话助手通常选 Instruct 起步）。
- **推理用（开发联调）**：
  - 用 **vLLM/TGI**：优先选 `AWQ/GPTQ` 4-bit（吞吐/显存更友好），或直接 FP16（质量更稳但占显存）。
  - 用 **Ollama/llama.cpp**：选 `GGUF`（如 `Q4_K_M` 起步，质量更好可升到 `Q5/Q6`，但 KV cache + 长上下文会额外吃显存）。
- **建议落地**：训练阶段用 BF16 权重做 QLoRA；联调/演示阶段用 4-bit（AWQ 或 GGUF）权重跑推理服务。

---

## 9. 论文/答辩表述建议（可选）

本工作不以“扩大参数规模”为主线，而是通过后训练阶段的能力解耦与约束，将通用大模型收敛为一个**可验证、可追溯、可教学**的课程智能助教：
- **Teaching-style alignment**：让回答符合课堂讲解结构与语气（阶段 B）
- **Tool-use grounding**：关键数值/符号步骤可调用工具复现（阶段 C）
- **RAG citation alignment**：基于证据片段作答并引用可追踪（阶段 D）

可用一张示意图表达流水线：
```
Base LLM
  ↓ Teaching-style alignment
  ↓ Tool-use grounding
  ↓ RAG citation alignment
Teaching Assistant (EM Field)
```

---

## 10. 训练集准备与微调参数（QLoRA 起步）

### 10.1 训练集怎么准备（最小可用流程）

1) **先定“上线输出协议”**（决定数据长什么样）  
   - 输出结构：固定 `### 结论 / ### 推导 / ### 检查`（见 4.B）  
   - RAG：必须带 `[编号]` 引用；不足则拒答 + `refusal_type`（见 3.3/4.D）  
   - Tool-use：覆盖“应调用/不应调用/延迟调用”（见 4.C）

2) **把原始材料做成问答样本**  
   - 来源：讲义/作业题与解析/助教答疑/FAQ（脱敏、去重、统一符号与单位）  
   - 每条样本都标注 `mode`，并附带 `refusal_type`（如适用）

3) **按能力分桶，再做配比与切分**  
   - 分桶：概念解释/推导题/计算题/仿真解释/批改/RAG 引用/拒答/冲突证据  
   - 切分：训练/验证/测试（建议固定测试集，不随迭代变化）

### 10.2 推荐的数据格式（JSONL）

训练数据建议用 JSONL（每行一条）：
- 必备字段：`id`、`mode`、`messages`
- 可选字段：`refusal_type`、`meta`（题型/来源/难度/是否 RAG/是否 tool-use 等）

示例（教学风格 + 固定结构）：
```json
{"id":"style-0001","mode":"tutor","messages":[{"role":"system","content":"你是高校课程助教...请按 ### 结论/推导/检查 输出。"},{"role":"user","content":"什么是边界条件？"},{"role":"assistant","content":"### 结论\\n...\\n\\n### 推导\\n...\\n\\n### 检查（单位/边界条件/极限情况）\\n..."}]}
```

示例（RAG 引用 + 不足拒答）：
```json
{"id":"rag-0007","mode":"tutor_rag","refusal_type":"insufficient_context","messages":[{"role":"system","content":"以下是检索片段：[1]... [2]..."},{"role":"user","content":"电位移矢量 D 的边界条件是什么？"},{"role":"assistant","content":"### 结论\\n从片段[1][2]可得到...\\n\\n### 推导\\n...\\n\\n### 检查（单位/边界条件/极限情况）\\n若需确定介质参数/界面电荷，需要补充..."}]}
```

> Tool-use 数据如果要训练“原生 tool_calls”，需要匹配你选用的推理框架（如 vLLM 的 tool-call parser）与 chat template；若只追求工程落地，建议先把工具调用协议固定为可解析的结构化文本/JSON，再逐步升级为原生 tool_calls。

### 10.3 QLoRA 微调参数怎么选（1×4090 24GB 起步）

以“快迭代 + 低风险”为目标，先用保守参数跑通：
- **量化（QLoRA）**：4-bit `nf4`，`double_quant=true`，`compute_dtype=bf16`（不支持则用 `fp16`）
- **LoRA**：
  - `r=16`（不够再升到 32）  
  - `lora_alpha=32/64`，`lora_dropout=0.05`，`bias=none`  
  - `target_modules` 建议覆盖注意力与 MLP：`q_proj,k_proj,v_proj,o_proj,gate_proj,up_proj,down_proj`
- **序列长度**：
  - 教学风格/批改：先用 `max_seq_len=2048`
  - RAG/长推导：再尝试 `4096`（显存吃紧就回到 2048，并用更短的检索上下文）
- **batch 与累积**：`per_device_train_batch_size=1-2`；`gradient_accumulation_steps=8-16`（有效 batch 8-32）
- **学习率（LoRA 常用区间）**：从 `1e-4` 起步；若收敛慢再到 `2e-4`；若发散/过拟合降到 `5e-5`
- **训练轮次**：`1-3 epochs`（小数据先 1 epoch，靠回归集决定是否继续）
- **优化器/调度**：`adamw_8bit`（或 paged_adamw_8bit）、`warmup_ratio=0.03`、`cosine`/`linear`
- **稳定性开关**：`gradient_checkpointing=true`；可用则开启 FlashAttention
- **评测与保存（Spot 友好）**：每 10-30 分钟保存一次 checkpoint；`save_total_limit=2-3`；验证集 `eval_steps` 与 `save_steps` 对齐

### 10.4 参数调优的“最小回路”

每次只改一个变量，并用固定测试集对比：
- 先调 `max_seq_len`（直接决定显存与信息覆盖）
- 再调 `lr`（决定收敛速度/稳定性）
- 最后才调 `r/alpha`（决定适配容量）

### 10.5 Qwen3-Embedding（0.6B/4B/8B）怎么选 + 第一阶段计划（GraphRAG 打底）

选型建议（你是“本地 GPU + 1-2 门课知识库 + 相关代码”）：
- **默认推荐：4B**（质量/速度/显存更均衡，通常够用）
- **0.6B**：只在你必须把“embedding + 生成模型”长期同机常驻、且显存很紧时用（可能牺牲专业术语/代码召回）
- **8B**：当 4B 召回明显不够、且你能接受更高显存占用/单独跑 embedding 服务时再上

注意：embedding 模型一旦更换，需要**重建向量库**（同一索引不能混用不同 embedding 的向量空间）。

第一阶段（3-5 天）目标：把“检索质量”跑到可用，再开始 SFT（否则你会把问题错归因到微调）。
- **D1：语料与切块**
  - 课程文档：按标题层级切，目标每 chunk 约 300–800 中文字符（可少量 overlap）
  - 代码：按函数/类切；chunk 里带上 `file_path + symbol_name + 简短注释`（召回会明显提升）
- **D2：建索引**
  - 固定 `EMBEDDING_MODEL`（先用 4B）后构建 GraphRAG 索引与向量库
  - 输出物：`graphrag_index.json` + `VECTOR_STORE_PATH` 目录
- **D3：检索回归集（强烈建议）**
  - 手工做 30-50 条查询（概念/公式/代码用法/常见误区各占一点），记录“期望命中片段”
  - 调参起步：`seed_top_k=6`、`final_top_k=10`、`expand_hops=1`、`max_context_chars=6000`
- **D4-5：决定是否升档**
  - 如果“核心查询的 recall@10”仍明显不足（例如 < 70%）且主要瓶颈是语义召回而不是切块/元数据，才考虑从 4B 升到 8B
  - 若问题主要来自切块/标题丢失/代码无元信息，先修数据与切块，别急着换 8B

---

## 11. 数据收集实操清单（Week 1-2）

> 本节给出可直接执行的数据收集步骤，与 [训练数据规范](./training-data-spec.md) 配合使用。

### 11.1 数据来源与负责

| 来源 | 预估条数 | 收集方式 | 优先级 |
|------|----------|----------|--------|
| 课程 FAQ | 50-100 | 导出企业微信/讨论区历史 | P0 |
| 作业题库 | 100-200 | 从作业管理模块导出 | P1 |
| 讲义章节 | 50-100 | 按章提取核心 QA | P1 |
| 合成数据 | 100-200 | LLM 生成 + 人工校验 | P2 |

### 11.2 收集脚本（示例）

```bash
# 1. 创建数据目录结构
mkdir -p data/training/{raw,processed,eval}

# 2. 导出 FAQ（从数据库或 API）
python scripts/export_faq.py --output data/training/raw/faq.jsonl

# 3. 导出作业解析
python scripts/export_assignments.py --output data/training/raw/assignments.jsonl

# 4. 格式转换
python scripts/convert_to_sft.py \
  --input data/training/raw/ \
  --output data/training/processed/
```

### 11.3 质量检查清单

- [ ] 每条样本有唯一 `id`
- [ ] `mode` 与 system prompt 匹配
- [ ] RAG 样本引用编号与片段对应
- [ ] 工具调用参数格式正确
- [ ] 无敏感信息（学生姓名、学号）
- [ ] 符号风格统一

### 11.4 交付物

| 文件 | 格式 | 条数 |
|------|------|------|
| `data/training/processed/style_sft.jsonl` | JSONL | 200-500 |
| `data/training/processed/tool_sft.jsonl` | JSONL | 100-200 |
| `data/training/processed/rag_sft.jsonl` | JSONL | 100-200 |

---

## 12. 评估基准集设计（固定测试集）

> 本节定义用于回归对比与论文消融实验的固定评测集。

### 12.1 基准集结构

```
data/training/eval/
├── benchmark.jsonl       # 50-100 条固定查询
├── expected_outputs.json # 标准答案与预期引用
└── eval_config.yaml      # 评测配置
```

### 12.2 查询类型分布

| 类型 | 条数 | 示例 |
|------|------|------|
| 概念解释 | 15 | "什么是边界条件概念？" |
| 公式推导 | 15 | "推导平面波反射系数公式" |
| 数值计算 | 10 | "计算铜在 1GHz 的趋肤深度" |
| 仿真解读 | 5 | "解释 Laplace 二维场分布图" |
| 拒答/边界 | 5 | "这道题的答案是什么？"（应拒答） |

### 12.3 标注格式

```json
{
  "id": "eval-0001",
  "query": "什么是边界条件概念？",
  "type": "concept",
  "expected": {
    "key_points": ["切向连续", "法向不连续", "面电荷"],
    "citations": ["ch2.3", "eq:boundary"],
    "tool_calls": [],
    "should_refuse": false
  }
}
```

### 12.4 自动化评测指标

```python
# eval_metrics.py
METRICS = {
    "citation_accuracy": "回答引用与 expected.citations 交集 / 期望引用数",
    "tool_call_accuracy": "工具调用名称/参数与 expected.tool_calls 匹配率",
    "key_point_coverage": "回答覆盖 expected.key_points 的比例",
    "refusal_accuracy": "should_refuse=True 时是否正确拒答",
    "response_format": "是否符合 ### 结论/推导/检查 结构"
}
```

### 12.5 目标阈值（论文基线）

| 指标 | 目标 |
|------|------|
| 引用正确率 | ≥ 85% |
| 工具调用准确率 | ≥ 90% |
| 关键点覆盖率 | ≥ 80% |
| 拒答准确率 | ≥ 95% |
| 格式合规率 | ≥ 90% |

---

## 13. 训练执行计划与脚本（可运行）

本节补充“可直接执行”的训练计划与脚本使用说明，确保落地。

### 13.1 训练前检查（必做）
- [ ] 已生成 `data/training/processed/*.jsonl`
- [ ] 评测集 `data/training/eval/benchmark.jsonl` 存在
- [ ] GPU 可用（`nvidia-smi`）
- [ ] Python 环境已安装依赖：
  - `torch`, `transformers`, `datasets`, `peft`, `accelerate`, `bitsandbytes`

环境准备详见：`docs/ai/training-environment.md`

> 如未安装依赖，可用：`pip install torch transformers datasets peft accelerate bitsandbytes`

### 13.2 训练脚本（LoRA/QLoRA）

已提供可直接运行的脚本：
- `scripts/ai/train_lora.py`：训练主脚本（支持 LoRA/QLoRA）
- `scripts/ai/run_train.sh`：按阶段调用的便捷入口
- `code/ai_service/training/train_lora.py`：训练主脚本（代码内版本）
- `code/ai_service/training/run_train.sh`：训练入口（代码内版本）

示例（阶段 B：教学风格 SFT）：

```bash
bash scripts/ai/run_train.sh style
```

示例（阶段 C：工具调用 SFT）：

```bash
bash scripts/ai/run_train.sh tool
```

示例（阶段 D：RAG 引用 SFT）：

```bash
bash scripts/ai/run_train.sh rag
```

示例（多任务合并训练）：

```bash
bash scripts/ai/run_train.sh all
```

### 13.3 关键参数建议（1×4090 24GB）
- `--use_qlora --bf16`：默认开启 QLoRA（4-bit nf4）
- `--max_length 2048`：可根据数据长度调到 3072/4096
- `--per_device_train_batch_size 1`、`--gradient_accumulation_steps 8`：有效 batch=8
- `--learning_rate 1e-4`：LoRA 常用起点
- `--num_train_epochs 2`：先短训，再根据回归结果决定是否加到 3-4

### 13.4 产物与回归
- 产物目录：`outputs/adapter/*`
- 每次训练后做一次回归集验证（至少 50 条），保存对比报告

### 13.5 评测脚本（骨架）

已提供轻量评测脚本：
- `scripts/ai/eval_metrics.py`
- `code/ai_service/training/eval_metrics.py`

示例：

```bash
python3 scripts/ai/eval_metrics.py \
  --eval_file data/training/eval/benchmark.jsonl \
  --pred_file outputs/predictions.jsonl \
  --output outputs/eval_report.json
```

`predictions.jsonl` 建议字段：

```json
{"id":"eval-0001","response":"### 结论...","citations":["ch2.3"],"tool_calls":["evaluate_expression"],"refused":false}
```
