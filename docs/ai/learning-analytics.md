# 学习状态分析模块

`learning_analytics` — 基于 NLP 的学生薄弱点检测与个性化辅导策略生成

---

## 设计背景

在引导式学习过程中，教师需要了解学生的薄弱环节才能提供针对性辅导。然而仅依靠人工观察效率较低，且难以覆盖所有学生。本模块通过分析 AI 导师与学生的对话，自动识别学生在电磁场概念理解上的薄弱点，并基于积累的学习档案生成个性化的辅导策略。

该模块与引导式学习端点 `/v1/chat/guided` 深度集成，在每次对话后自动分析 AI 回复中的纠错信号，将检测到的薄弱概念记录到会话中，并支持持久化到后端数据库供长期追踪。

---

## 核心能力

**薄弱点自动检测**。通过分析 AI 回复中的负面反馈信号（如"还需要注意"、"有偏差"等），结合电磁场领域的术语词库，自动识别学生理解不足的概念。采用上下文敏感的检测策略，只在纠错语句中提取概念，避免误报。

**学习档案管理**。维护每个学生的学习档案，包括累计发现的薄弱点及其出现频率、已完成的学习主题、总学习时长等。支持与 Go 后端同步，实现跨会话的持久化存储。

**个性化辅导策略**。基于学生学习档案生成结构化的辅导建议，包括薄弱点专项练习、推荐学习主题、以及 1-2 周的学习计划。输出格式化 JSON 便于前端展示。

---

## 接口设计

### 主要类与函数

```python
class WeakPointDetector:
    """薄弱点检测器，分析 AI 回复识别概念薄弱点。"""
    
    def __init__(self, custom_concepts: dict[str, list[str]] | None = None):
        """初始化检测器，可扩展领域概念词库。"""
        ...

    def analyze(self, ai_reply: str, student_message: str | None = None) -> WeakPointAnalysis:
        """分析单条 AI 回复，返回检测结果。"""
        ...

    def analyze_conversation(self, messages: list[dict], window_size: int = 5) -> dict[str, int]:
        """分析对话历史，聚合薄弱点统计。"""
        ...


@dataclass
class StudentProfile:
    """学生学习档案。"""
    student_id: int
    course_id: int
    weak_points: dict[str, int]  # 概念 -> 出现次数
    completed_topics: list[str]
    total_sessions: int
    total_study_minutes: int


class CoachingStrategySkill(BaseSkill):
    """个性化辅导策略生成技能。"""
    
    def build_system_prompt(self, context: dict | None = None) -> str:
        """构建包含学生档案的 prompt。"""
        ...
```

### 配置参数

| 参数名 | 默认值 | 说明 |
|--------|--------|------|
| 内置概念词库 | 50+ 电磁场术语 | 包含麦克斯韦方程、高斯定律、边界条件等核心概念 |
| 负面指标 | 15+ 短语 | 识别 AI 回复中的纠错信号 |
| 正面指标 | 9+ 短语 | 识别正面反馈，避免误报 |

---

## 实现细节

### 处理流程

当 `/v1/chat/guided` 端点收到请求并获取 LLM 回复后，流程如下：

1. **调用检测器**：将 AI 回复传入 `detect_weak_points()` 函数
2. **负面信号检测**：检查回复中是否包含负面指标短语
3. **概念提取**：若检测到负面信号，在对应句子中搜索领域概念关键词
4. **记录薄弱点**：调用 `session.add_weak_point()` 将概念添加到会话
5. **持久化同步**（可选）：会话结束时通过 `ProfileSyncClient` 同步到后端数据库

异常处理策略：检测器采用"静默失败"策略，即使分析过程出错也不影响主流程，仅记录日志。

### 设计决策

**为什么采用规则匹配而非机器学习模型？** 考虑到：(1) 电磁场领域概念有限且可枚举，规则匹配已足够准确；(2) 避免引入额外模型依赖和推理延迟；(3) 规则可由教师直接维护和扩展。

**为什么使用上下文敏感提取？** 直接在全文搜索概念会导致大量误报，例如正面评价中提到的概念也会被标记为薄弱点。通过限定只在包含负面指标的句子中提取，显著提高准确率。

**为什么会话内存储使用内存而非数据库？** 单次学习会话通常持续 15-60 分钟，内存存储足够且响应更快。会话结束时再批量同步到数据库，减少 I/O 开销。

---

## 使用示例

```python
from app.weak_point_detector import detect_weak_points, get_weak_point_detector

# 简单调用
ai_reply = "这个想法有道理，但是还需要注意高斯定律的适用范围。"
weak_points = detect_weak_points(ai_reply)
print(weak_points)  # ['高斯定律']

# 完整分析
detector = get_weak_point_detector()
analysis = detector.analyze(ai_reply)
print(f"概念: {analysis.detected_concepts}, 置信度: {analysis.confidence:.2f}")
```

---

## 测试要点

**正常路径**。测试包含明确纠错信号的回复能正确识别薄弱概念。

**边界条件**。测试正面回复返回空列表；测试同时包含正面和负面信号的混合回复。

**异常处理**。验证空字符串、超长输入、非中文输入的处理。

**性能基线**。单次分析耗时应 < 1ms（纯 Python 字符串操作）。

---

## 已知限制

**概念粒度固定**。当前词库以"概念"为最小单位，无法识别更细粒度的知识点（如"高斯定律的微分形式 vs 积分形式"）。可通过扩展词库增加子概念。

**跨语言支持有限**。词库主要针对中文，英文概念仅作少量补充。对于双语教学场景需扩展英文术语。

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-01-12 | 1.0 | 初始版本：实现薄弱点检测、学生档案、辅导策略生成 |
| 2026-01-19 | 1.1 | 新增个性化辅导与学习状态追踪文档 |

---

## 个性化学习辅助

### 辅导策略生成

基于学生学习档案，系统自动生成个性化的辅导策略。辅导策略技能（`CoachingStrategySkill`）通过分析以下维度生成建议：

| 维度 | 数据来源 | 辅导策略 |
|------|----------|----------|
| 高频薄弱点 | `weak_points` 出现次数 ≥ 3 | 专项练习 + 概念讲解 |
| 学习进度 | `completed_topics` 列表 | 推荐下一个学习主题 |
| 学习时长 | `total_study_minutes` | 调整学习节奏建议 |
| 最近活跃 | `last_session_at` | 复习提醒 |

### 辅导策略输出格式

```json
{
  "策略类型": "个性化辅导",
  "薄弱点专项": [
    {
      "概念": "边界条件",
      "出现次数": 5,
      "建议": "复习第2章边界条件推导，完成练习题2.3-2.5"
    }
  ],
  "推荐主题": ["电磁波传播", "波阻抗计算"],
  "学习计划": {
    "本周重点": "巩固边界条件理解",
    "下周目标": "开始电磁波章节学习"
  }
}
```

### 前端集成

辅导策略在引导式学习界面显示：
- **薄弱点卡片**：高亮显示高频错误概念
- **推荐学习路径**：按依赖关系排序的学习主题
- **进度条**：已完成 vs 推荐主题

---

## 学习状态追踪

### 数据流架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    前端（React/Expo）                            │
│  StudyTimer 组件 ───────────────────────────▶ 心跳上报           │
│  学习会话 ─────────────────────────────────▶ 对话消息           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Go 后端                                       │
│  /api/v1/chapters/:id/heartbeat ───────▶ 累计学习时长            │
│  /api/v1/learning-profiles/:id ────────▶ 学生档案 CRUD           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI 服务                                       │
│  WeakPointDetector ────────────────────▶ 实时薄弱点检测          │
│  ProfileSyncClient ────────────────────▶ 档案同步               │
│  CoachingStrategySkill ────────────────▶ 辅导策略生成            │
└─────────────────────────────────────────────────────────────────┘
```

### 学习时长追踪

前端 `StudyTimer` 组件通过心跳机制追踪学习时长：

```typescript
// 每 30 秒发送一次心跳
const HEARTBEAT_INTERVAL = 30000;

useEffect(() => {
  const timer = setInterval(() => {
    fetch(`/api/v1/chapters/${chapterId}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify({ duration: 30 })
    });
  }, HEARTBEAT_INTERVAL);
  
  // 页面隐藏时暂停
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => clearInterval(timer);
}, []);
```

### 学习档案 API

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/v1/learning-profiles/{course}/{student}` | GET | 获取学生档案 |
| `/api/v1/learning-profiles` | POST | 创建/更新档案 |
| `/api/v1/learning-profiles/{id}/weak-points` | PATCH | 合并薄弱点 |

### 档案数据结构

```python
@dataclass
class StudentProfile:
    student_id: int
    course_id: int
    weak_points: dict[str, int]      # 概念 -> 出现次数
    completed_topics: list[str]       # 已完成主题
    total_sessions: int               # 学习会话数
    total_study_minutes: int          # 累计学习时长
    last_session_at: datetime         # 最近学习时间
    recommended_topics: list[str]     # 推荐学习主题
```

---

## 与后训练的关联

学习状态分析模块产生的数据可用于后训练数据集构建：

| 数据类型 | 用途 | 训练阶段 |
|----------|------|----------|
| 高频薄弱点 | 构建"常见错误纠正"样本 | 阶段 B（教学风格 SFT） |
| 辅导策略输出 | 作为个性化回答的参考 | 阶段 D（RAG 落地 SFT） |
| 学习路径数据 | 构建"引导式教学"样本 | 阶段 B |

详见 [训练数据规范](./training-data-spec.md) 和 [后训练计划](./post-training-finetuning-plan.md)。

