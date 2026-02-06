# 工具调用（Tool Calling）技术文档

本文档描述 AI 服务中的工具调用机制，使大模型能够调用外部工具完成**可验证**的计算/检查任务；在写作课场景中，它可用于把“格式/结构/字数/引用”等检查从自由生成中剥离出来，降低幻觉与“编造规则”风险。

---

## 1. 概述

### 1.1 为什么需要工具调用

大语言模型在数值计算时容易产生"心算"错误，尤其是：
- 物理常数计算（如 ε₀μ₀ = 1/c²）
- 复杂公式求值（如趋肤深度 δ = √(2/ωμσ)）
- 迭代数值仿真（如二维 Laplace 方程求解）

工具调用机制让模型识别何时需要外部工具，并将计算委托给可验证的执行器。

### 1.2 核心优势

- **精确计算**：避免大模型"心算"错误
- **可验证性**：计算过程可复现、可检验
- **扩展性**：可添加更多领域工具

---

## 2. 工具列表

### 2.1 当前支持的工具

| 工具名称 | 功能 | API 端点 |
|----------|------|----------|
| `calculate_integral` | 符号/数值积分 | `/api/v1/calc/integrate` |
| `calculate_derivative` | 符号/数值微分 | `/api/v1/calc/differentiate` |
| `evaluate_expression` | 表达式求值 | `/api/v1/calc/evaluate` |
| `vector_operation` | 矢量运算 | `/api/v1/calc/vector_op` |
| `run_simulation` | 课程仿真 | `/api/v1/sim/*` |

> 说明：以上为“仿真/数学”示例工具集合，由 AI Service 调用仿真服务提供的 API；写作课的“格式/结构/引用”类工具可按相同机制扩展（见 7.1）。

### 2.2 工具定义（对应 `code/ai_service/app/tools.py`）

```python
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "evaluate_expression",
            "description": "计算数学表达式或物理公式，支持物理常数（如 ε₀、μ₀、c）",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "数学表达式，如 'sqrt(2/(omega*mu*sigma))'"
                    },
                    "variables": {
                        "type": "object",
                        "description": "变量值映射，如 {'omega': '2*pi*1e9', 'sigma': '5.8e7'}"
                    }
                },
                "required": ["expression"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_simulation",
            "description": "运行课程数值仿真",
            "parameters": {
                "type": "object",
                "properties": {
                    "sim_type": {
                        "type": "string",
                        "enum": ["laplace2d", "point_charges", "wire_field", "wave_1d"],
                        "description": "仿真类型"
                    },
                    "params": {
                        "type": "object",
                        "description": "仿真参数"
                    }
                },
                "required": ["sim_type"]
            }
        }
    }
]
```

---

## 3. 调用流程

```
┌─────────────────────────────────────────────────────────────┐
│                      用户问题                                │
│  "计算频率 1GHz 时铜的趋肤深度"                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Step 1: 模型判断                             │
│  LLM 识别需要数值计算，生成 tool_call                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Step 2: 执行工具                             │
│  调用 evaluate_expression，计算 δ = √(2/ωμσ)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Step 3: 结果注入                             │
│  将 tool_result 添加到对话上下文                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Step 4: 生成回答                             │
│  LLM 基于工具结果生成教学化解释                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 代码示例

```python
async def chat_with_tools(query: str, tools: list) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": query}
    ]
    
    # Step 1: 让模型判断是否需要工具
    response = await llm.generate(messages, tools=tools)
    
    # Step 2: 如果返回 tool_call，执行工具
    if response.tool_calls:
        for call in response.tool_calls:
            result = await execute_tool(call.function.name, call.function.arguments)
            
            # Step 3: 将工具结果注入上下文
            messages.append({
                "role": "assistant",
                "content": None,
                "tool_calls": [call]
            })
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result)
            })
        
        # Step 4: 让模型基于工具结果生成最终回答
        final_response = await llm.generate(messages)
        return final_response.content
    
    return response.content
```

---

## 4. 与现有代码的对应关系

| 模块 | 文件 | 功能 |
|------|------|------|
| 工具定义 | `code/ai_service/app/tools.py` | `AVAILABLE_TOOLS` 列表与执行器 |
| 仿真服务 | `code/simulation` | FastAPI 仿真与计算端点 |
| AI 主入口 | `code/ai_service/app/main.py` | 工具调用流程集成 |

### 4.1 `tools.py` 结构

```
app/tools.py
├── TOOLS (list)          # 工具定义列表
├── execute_tool()        # 工具执行分发器
├── evaluate_expression() # 表达式求值（SymPy）
├── calculate_integral()  # 积分计算
├── calculate_derivative()# 微分计算
├── vector_operation()    # 矢量运算
└── run_simulation()      # 仿真服务调用
```

---

## 5. API 端点

### 5.1 带工具调用的对话

```
POST /v1/chat_with_tools
Content-Type: application/json

{
  "mode": "sim_tutor",
  "messages": [
    {"role": "user", "content": "计算铜在 1GHz 的趋肤深度"}
  ],
  "enable_tools": true,
  "max_tool_calls": 3
}
```

响应：
```json
{
  "reply": "### 结论\n铜在 1GHz 时的趋肤深度约为 **2.09 μm**...",
  "tool_calls": [
    {
      "name": "evaluate_expression",
      "arguments": {"expression": "sqrt(2/(omega*mu*sigma))", ...},
      "result": {"value": 2.09e-6, "unit": "m"}
    }
  ]
}
```

---

## 6. 调试指南

### 6.1 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 工具未被调用 | 模型未识别需要工具 | 检查 system prompt 是否包含工具说明 |
| 参数解析失败 | JSON 格式错误 | 检查 arguments 字段格式 |
| 计算结果错误 | 变量/单位问题 | 检查 variables 映射与单位一致性 |

### 6.2 日志调试

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# 开启工具调用详细日志
logger = logging.getLogger("tools")
logger.setLevel(logging.DEBUG)
```

---

## 7. 后续扩展

### 7.1 计划中的工具

- `query_formula`：公式库查询（从 GraphRAG 检索公式定义）
- `solve_equation`：方程求解（支持边界条件）
- `plot_field`：场分布可视化

写作课扩展建议（按需实现）：
- `count_words`：字数/句子数/段落数统计（避免模型“目测”）
- `check_citation_style`：引用格式/一致性检查（APA/IEEE 等）
- `check_structure`：结构要素检查（thesis statement、topic sentence、conclusion 等）
- `detect_plagiarism_risk`：学术诚信风险提示（规则/相似片段定位，需结合合规数据源）

### 7.2 与后训练的关系

工具调用 SFT（阶段 C）需要构建包含以下样本类型的训练数据：
1. **应调用工具**：带 tool_call + tool_result + 最终解释
2. **不应调用工具**：直接推理/解释即可
3. **延迟调用**：先教学解释，再明确说明需要工具

详见 [训练数据规范](./training-data-spec.md)。
