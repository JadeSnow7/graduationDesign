# inference-engine-v2 测试基准平台设计

**日期：** 2026-04-17  
**项目：** inference-engine-v2（AI 学术写作辅助平台推理引擎）  
**用途：** 毕业论文答辩数据支撑 + 模型调优对比

---

## 一、背景与目标

inference-engine-v2 的核心链路是：用户输入 → LLM 场景路由（proposal/review/paragraph/format）→ Pipeline（多阶段 LLM 调用 + GraphRAG 检索）→ SSE 流式输出。

现有测试覆盖单元/集成层，缺乏系统性的质量量化手段。本设计为其补充一个**嵌入式基准测试平台**，主要目标：

1. **质量评估（最高优先级）**：用客观数字证明系统"好用"，支撑毕业论文答辩
2. **调优对比**：量化不同模型/RAG 参数的效果差异，作为消融实验依据
3. **性能记录**：顺带采集端到端延迟，辅助分析

---

## 二、架构与模块划分

### 后端新增（`backend/bench/`）

```
backend/
├── bench/
│   ├── __init__.py
│   ├── runner.py        # 遍历测试用例、调用 Pipeline、收集原始输出
│   ├── evaluator.py     # LLM-as-Judge 评分（RAG质量、生成质量）
│   ├── models.py        # BenchCase / BenchResult / RunReport Pydantic 模型
│   └── store.py         # RunReport → Redis（key: bench:run:{run_id}）
├── data/
│   └── bench/
│       └── cases.json   # 黄金测试集（20-30 条，4 个场景各 5-8 条）
└── api/
    └── bench.py         # 新路由：POST /api/bench/run、GET /api/bench/runs、GET /api/bench/runs/{id}
```

### 前端新增（`frontend/src/`）

```
pages/
└── BenchmarkPage.tsx    # 主页面：触发 → 进度 → 结果

store/
└── bench.ts             # useBenchStore（运行状态、结果列表）

api/
└── bench.ts             # apiFetch 封装的 bench API 调用
```

### 与现有代码的接触面

- `runner.py` 直接 import 现有 `core/loop.py` 的 `main_loop()`，不重复实现 Pipeline 调用
- `evaluator.py` 复用 `core/stream.py` 的 `call_model_once()`
- `store.py` 通过 FastAPI dependency 注入 `app.state.redis_client`
- `main.py` 中注册：`app.include_router(bench_router, prefix="/api")`

---

## 三、指标定义

### B — RAG 检索质量

| 指标 | 计算方式 | 说明 |
|------|----------|------|
| `rag_relevance` | LLM-as-Judge 1-5 分 | 检索到的 papers+gaps 与问题相关度 |
| `rag_keyword_hit` | 命中关键词数 / 总关键词数 | 精确可复现，不依赖 LLM |
| `gap_severity_dist` | high/medium/low 各占比 | 检验研究空白识别质量 |

Judge Prompt（RAG）：
```
给定用户问题：{input}
检索到的文献摘要：{papers}
发现的研究空白：{gaps}
请从 1 到 5 打分（5=高度相关且全面；1=完全无关）。只输出一个整数。
```

### C — 生成质量

LLM-as-Judge 对最终生成文本从三个维度各打 1-5 分：

| 维度 key | 含义 |
|----------|------|
| `quality_academic` | 学术性：用词规范、论证严谨、有引用意识 |
| `quality_completeness` | 完整性：是否覆盖用户需求的核心要点（参考 expected_coverage） |
| `quality_coherence` | 连贯性：段落逻辑通顺，结构合理 |

三分求和得 `quality_score_raw`（3-15），归一化为百分制：`quality_score = (raw - 3) / 12 * 100`。

Judge Prompt（生成质量）：
```
用户问题：{input}
期望覆盖要点：{expected_coverage}
模型生成内容：{output}

请分别从以下三个维度打 1-5 分，只输出 JSON：
{"academic": <int>, "completeness": <int>, "coherence": <int>}
```

### E — 模型/策略对比

每次 `POST /api/bench/run` 接受 `config` 参数：

```json
{
  "model": "qwen-plus",
  "rag_top_k": 5,
  "temperature": 0.7,
  "case_filter": ["proposal", "review"]
}
```

用不同 config 跑同一套用例，前端并排展示得分差异，直接用于论文消融实验章节。

---

## 四、数据模型

### `BenchResult`

```python
class BenchResult(BaseModel):
    case_id: str
    scene: str                   # 用例预期场景
    routed_scene: str            # 实际路由结果（顺带记录路由准确率）
    rag_relevance: float | None  # 1-5，Judge 失败时为 None
    rag_keyword_hit: float       # 0.0-1.0
    gap_severity_dist: dict      # {"high": int, "medium": int, "low": int}
    quality_academic: float | None
    quality_completeness: float | None
    quality_coherence: float | None
    quality_score: float | None  # 归一化百分制
    latency_ms: int
    model: str
    error: str | None            # 用例执行失败时填写
```

### `BenchConfig`

```python
class BenchConfig(BaseModel):
    model: str = "qwen-turbo"
    rag_top_k: int = 5
    temperature: float = 0.7
    case_filter: list[str] = []  # 空列表 = 全部场景
```

### `RunSummary`

```python
class RunSummary(BaseModel):
    total_cases: int
    valid_cases: int             # error 为 None 的用例数
    avg_rag_relevance: float | None
    avg_rag_keyword_hit: float | None
    avg_quality_score: float | None
    avg_quality_academic: float | None
    avg_quality_completeness: float | None
    avg_quality_coherence: float | None
    routing_accuracy: float      # routed_scene == scene 的比例
```

### `RunReport`

```python
class RunReport(BaseModel):
    run_id: str                  # UUID
    created_at: str              # ISO 8601
    config: BenchConfig
    status: Literal["running", "completed", "failed"]
    results: list[BenchResult]
    summary: RunSummary          # 各指标均值（跑完后计算）
```

Redis 存储：
- `bench:run:{run_id}` → `RunReport` JSON
- `bench:runs` → run_id 列表（LPUSH，最新在前）

---

## 五、测试用例格式（`cases.json`）

```json
[
  {
    "id": "proposal-001",
    "scene": "proposal",
    "input": "我想做一个基于大模型的学术写作辅助系统，帮我写开题报告的研究背景部分",
    "expected_keywords": ["大语言模型", "学术写作", "自然语言处理", "RAG"],
    "expected_coverage": [
      "研究动机或背景",
      "现有方法的不足",
      "本研究的价值"
    ]
  }
]
```

每个场景 5-8 条，共 20-30 条。`expected_keywords` 用于精确计算 `rag_keyword_hit`；`expected_coverage` 注入 completeness Judge Prompt 作为评分锚点。

---

## 六、数据流

```
POST /api/bench/run {config}
        │
runner.py: 加载 cases.json，顺序执行（不并发，避免超 QPS）
        │
  对每条 case：
  1. 调用 main_loop() 跑完整 Pipeline
  2. 拦截 SSE 事件：捕获 papers/gaps → RAG 原料，收集 tokens → 生成文本
  3. evaluator.py:
     a. rag_keyword_hit（本地字符串匹配）
     b. call_model_once(rag_judge_prompt) → rag_relevance
     c. call_model_once(quality_judge_prompt) → 三维度分数
  4. 记录 BenchResult，实时更新 RunReport.status
        │
store.py: 写入 Redis
        │
前端轮询 GET /api/bench/runs/{id}（每 2 秒）拉取进度和结果
        │
当 status == "completed" 或 "failed" 时，停止轮询，渲染最终报告
```

---

## 七、前端设计

### 路由

`App.tsx` 新增：`/benchmark` → `BenchmarkPage`（ProtectedRoute 保护）

### BenchmarkPage 布局

```
┌─────────────────────────────────────────────────────┐
│  配置区                                              │
│  模型: [qwen-turbo ▼]  RAG Top-K: [5]               │
│  场景筛选: [全部 ▼]   Temperature: [0.7]             │
│                              [ 开始测试 ]            │
├─────────────────────────────────────────────────────┤
│  进度区（跑分时显示）                                 │
│  ████████░░░░  12 / 28 用例   当前：review-003       │
├─────────────────────────────────────────────────────┤
│  结果区                                              │
│  汇总卡片：RAG相关度、关键词命中率、生成质量百分制     │
│  雷达图：学术性 / 完整性 / 连贯性                     │
│  柱状对比图：多次 Run 的 quality_score 横向对比       │
│  明细表格：逐条用例结果，点击展开原始输出 + Judge 评语 │
└─────────────────────────────────────────────────────┘
```

### 状态管理（`useBenchStore`）

```ts
interface BenchStore {
  isRunning: boolean
  progress: { current: number; total: number; currentCase: string }
  runs: RunReport[]
  selectedRunIds: string[]   // 选中用于对比的两次 run
  startRun: (config: BenchConfig) => Promise<void>
  loadRuns: () => Promise<void>
}
```

图表库：**Recharts**（轻量，React 18 生态兼容）。

---

## 八、错误处理

- **单条用例失败**：记录 `error` 字段，分数字段置 `null`，继续执行后续用例
- **Judge 输出非法**：重试一次，再失败记 `null`，不影响其他用例均值
- **Redis 写入失败**：整个 run 标记 `failed`，前端提示重跑
- **均值计算**：跳过 `null` 值，`summary` 中标注有效样本数

---

## 九、新增测试

| 文件 | 测试内容 |
|------|----------|
| `tests/test_bench_runner.py` | Mock Pipeline，验证 runner 正确收集 papers/gaps/tokens |
| `tests/test_bench_evaluator.py` | Mock `call_model_once`，验证 Judge prompt 格式和分数解析 |
| `tests/test_bench_api.py` | Mock runner，验证 POST 返回 run_id，GET 能取到报告 |

前端：vitest 测试 `useBenchStore` 状态转换。

---

## 十、明确不做的事

- 不做实时 WebSocket 推送（轮询够用）
- 不做用例编辑器 UI（直接编辑 JSON 文件）
- 不做跨服务对比（只测当前部署实例）
- 不做自动定时跑分（手动触发）
- 不做用户权限分级（暂时所有登录用户均可访问）
