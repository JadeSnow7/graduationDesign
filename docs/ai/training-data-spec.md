# 训练数据规范

本文档定义了用于后训练（Post-Training）的数据格式标准与收集流程，目标是构建高质量的课程教学微调数据集。

---

## 1. 数据格式标准

### 1.1 基础格式（JSONL）

每条样本占一行，使用 JSON 格式：

```json
{
  "id": "sample-0001",
  "mode": "tutor",
  "messages": [
    {"role": "system", "content": "你是高校课程助教..."},
    {"role": "user", "content": "用户问题"},
    {"role": "assistant", "content": "助教回答"}
  ],
  "refusal_type": null,
  "meta": {
    "source": "faq",
    "chapter": "ch2",
    "difficulty": "medium",
    "has_tool_call": false,
    "has_rag_context": false
  }
}
```

### 1.2 必备字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识符，格式 `{类型}-{编号}` |
| `mode` | string | 对应服务端 mode：`tutor`/`grader`/`tutor_rag`/`sim_tutor` 等 |
| `messages` | array | 对话消息列表，包含 `system`/`user`/`assistant` |

### 1.3 可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `refusal_type` | string | 拒答类型：`insufficient_context`/`missing_parameters`/`out_of_scope` |
| `meta.source` | string | 数据来源：`faq`/`assignment`/`lecture`/`synthetic` |
| `meta.chapter` | string | 所属章节 |
| `meta.difficulty` | string | 难度：`easy`/`medium`/`hard` |
| `meta.has_tool_call` | boolean | 是否包含工具调用 |
| `meta.has_rag_context` | boolean | 是否包含 RAG 上下文 |

---

## 2. 样本类型示例

### 2.1 教学风格（tutor）

```json
{
  "id": "style-0001",
  "mode": "tutor",
  "messages": [
    {
      "role": "system",
      "content": "你是研究生专业英文写作课程助教。请按以下结构回答：\n### 结论\n### 解析\n### 检查（可执行性/一致性）"
    },
    {
      "role": "user",
      "content": "什么是 thesis statement？它在课程论文里起什么作用？"
    },
    {
      "role": "assistant",
      "content": "### 结论\nthesis statement 是一篇课程论文中最核心的“主张/论点”，通常出现在引言末尾，用一句或两句明确回答“我主张什么、为何重要、将如何论证”。\n\n### 推导\n一篇合格的论文需要读者在早期就知道：本文讨论的对象是什么、作者的立场是什么、后文将用哪些理由或证据支持这一立场。thesis statement 的作用就是把这些信息浓缩为可检验的主张，并为段落结构提供“组织轴”。\n\n### 检查（可执行性/一致性）\n- 可执行：是否能据此写出 3-5 个支持段落？\n- 一致性：正文每段是否都能回扣 thesis？\n- 可检验：是否避免“太泛”的空话（如 very important）？"
    }
  ],
  "meta": {"source": "lecture", "chapter": "writing_basics", "difficulty": "medium"}
}
```

### 2.2 RAG 引用（tutor_rag）

```json
{
  "id": "rag-0001",
  "mode": "tutor_rag",
  "messages": [
    {
      "role": "system",
      "content": "以下是检索到的参考片段，请只基于这些片段回答，并使用 [编号] 标注引用。\n\n[1] Thesis statement：在引言中明确论文的核心主张，并概括主要论证方向（来源：写作讲义 1.2）\n[2] Topic sentence：每段开头用一句话声明该段要证明的子观点，并与 thesis statement 保持一致（来源：写作讲义 2.1）"
    },
    {
      "role": "user",
      "content": "thesis statement 和 topic sentence 的关系是什么？"
    },
    {
      "role": "assistant",
      "content": "### 结论\nthesis statement 给出全文的核心主张与论证方向 [1]；topic sentence 则在段落层面声明“这一段要证明的子观点”，并需要与 thesis statement 保持一致 [2]。\n\n### 分析\n- thesis statement（全文层级）：定义研究立场/主张，并提示后文的主要论证路径 [1]。\n- topic sentence（段落层级）：把 thesis 拆解成可分段论证的子观点，每段用 topic sentence 明确该段贡献 [2]。\n\n### 检查（可操作）\n- 逐段自检：每个 topic sentence 是否能用一句话说明“它如何支持 thesis”？\n- 若不能：说明段落可能偏题或 thesis 过于宽泛。"
    }
  ],
  "meta": {"source": "lecture", "has_rag_context": true}
}
```

### 2.3 工具调用（sim_tutor）

> 说明：下例用于展示“tool_calls + tool_result + 最终解释”的数据结构；写作课可用同样 schema 承载字数/结构/引用格式等工具调用（工具名需与运行时可用工具保持一致）。

```json
{
  "id": "tool-0001",
  "mode": "sim_tutor",
  "messages": [
    {
      "role": "system",
      "content": "你是课程助教，可以调用以下工具进行计算..."
    },
    {
      "role": "user",
      "content": "计算频率 1GHz 时铜（σ=5.8×10⁷ S/m）的趋肤深度"
    },
    {
      "role": "assistant",
      "content": null,
      "tool_calls": [{
        "id": "call_001",
        "type": "function",
        "function": {
          "name": "evaluate_expression",
          "arguments": "{\"expression\": \"sqrt(2/(omega*mu*sigma))\", \"variables\": {\"omega\": \"2*pi*1e9\", \"mu\": \"4*pi*1e-7\", \"sigma\": \"5.8e7\"}}"
        }
      }]
    },
    {
      "role": "tool",
      "tool_call_id": "call_001",
      "content": "{\"result\": 2.09e-6, \"unit\": \"m\"}"
    },
    {
      "role": "assistant",
      "content": "### 结论\n铜在 1GHz 时的趋肤深度约为 **2.09 μm**。\n\n### 推导\n趋肤深度公式：δ = √(2/(ωμσ))...\n\n### 检查（单位/边界条件/极限情况）\n- 结果量级合理：GHz 频率下趋肤深度为微米级"
    }
  ],
  "meta": {"has_tool_call": true, "difficulty": "medium"}
}
```

### 2.4 拒答样本

```json
{
  "id": "refusal-0001",
  "mode": "tutor_rag",
  "refusal_type": "insufficient_context",
  "messages": [
    {
      "role": "system",
      "content": "以下是检索到的参考片段：\n[1] 静电场中的高斯定律：∮D·dS = Q（来源：教材第1章）"
    },
    {
      "role": "user",
      "content": "请推导介质中平面波的相速度公式"
    },
    {
      "role": "assistant",
      "content": "### 说明\n当前检索到的片段 [1] 仅涉及概念 A，不包含概念 B 的相关内容。\n\n### 需要补充的信息\n- 关键定义/定理\n- 参数关系与适用条件\n\n建议查阅教材相应章节。"
    }
  ],
  "meta": {"source": "synthetic", "has_rag_context": true}
}
```

### 2.5 冲突证据处理

```json
{
  "id": "conflict-0001",
  "mode": "tutor_rag",
  "messages": [
    {
      "role": "system",
      "content": "[1] 片段一的结论（来源：教材第 X 节）\n[2] 片段二的结论（来源：讲义补充材料）"
    },
    {
      "role": "user",
      "content": "概念 B 在不同条件下是否成立？"
    },
    {
      "role": "assistant",
      "content": "### 结论\n这取决于条件参数。\n\n### 分析\n- [1] 描述的是条件 A\n- [2] 描述的是条件 B\n\n### 适用条件\n- 条件 A：限制说明\n- 条件 B：限制说明"
    }
  ],
  "meta": {"source": "synthetic", "difficulty": "hard"}
}
```

---

## 3. 数据收集流程

### 3.1 来源优先级

| 优先级 | 来源 | 预估数量 | 说明 |
|--------|------|----------|------|
| P0 | 课程 FAQ | 50-100 条 | 教师/助教历史答疑记录 |
| P1 | 作业解析 | 100-200 条 | 典型作业题与标准解答 |
| P2 | 讲义章节 | 50-100 条 | 按章节提取核心概念问答 |
| P3 | 合成数据 | 100-200 条 | LLM 生成 + 人工校验 |

### 3.2 收集步骤

```
1. 原始材料收集
   ├── 导出课程 FAQ（从企业微信/讨论区）
   ├── 整理作业题库与标准答案
   └── 提取讲义章节核心内容

2. 格式转换
   ├── 统一符号规范（ε₀、μ₀、向量箭头）
   ├── 添加 mode 和 meta 字段
   └── 拆分为多轮对话格式

3. 质量检查
   ├── 去重（基于问题相似度）
   ├── 纠错（公式、单位、推导步骤）
   └── 脱敏（移除学生姓名等）

4. 分桶与配比
   ├── 按类型分桶：概念/推导/计算/仿真/批改
   ├── 按难度分层：easy 30% / medium 50% / hard 20%
   └── 切分：训练 80% / 验证 10% / 测试 10%
```

### 3.3 质量检查清单

- [ ] 每条样本都有唯一 `id`
- [ ] `mode` 字段与 system prompt 匹配
- [ ] RAG 样本的引用编号与片段对应
- [ ] 工具调用样本的参数格式正确
- [ ] 拒答样本有明确的 `refusal_type`
- [ ] 无敏感信息（学生姓名、学号等）
- [ ] 符号风格统一（向量使用粗体或箭头）

---

## 4. 目标数据量

| 阶段 | 类型 | 目标数量 |
|------|------|----------|
| 阶段 B（教学风格 SFT） | tutor/grader | 200-500 条 |
| 阶段 C（工具调用 SFT） | sim_tutor/formula_verify | 100-200 条 |
| 阶段 D（RAG 落地 SFT） | *_rag | 100-200 条 |
| **总计** | | **500-1000 条** |

---

## 5. 文件存放位置

```
data/training/
├── raw/                    # 原始材料
│   ├── faq/               # FAQ 导出
│   ├── assignments/       # 作业题库
│   └── lectures/          # 讲义提取
├── processed/             # 处理后数据
│   ├── style_sft.jsonl    # 教学风格数据
│   ├── tool_sft.jsonl     # 工具调用数据
│   └── rag_sft.jsonl      # RAG 引用数据
└── eval/                  # 评估基准集
    └── benchmark.jsonl    # 固定测试集（50-100 条）
```

补充：训练脚本位于 `scripts/ai/` 与 `code/ai_service/training/`，默认读取上述目录中的 `processed/*.jsonl` 与 `eval/benchmark.jsonl`。

### 数据准备工具

使用 `prepare_training_data.py` 初始化目录结构和生成示例数据：

```bash
# 创建目录结构和示例数据
python3 code/ai_service/training/prepare_training_data.py --create-dirs --create-samples

# 验证现有数据格式
python3 code/ai_service/training/prepare_training_data.py --validate
```

评测脚本：`scripts/ai/eval_metrics.py`，用于离线回归评测。
