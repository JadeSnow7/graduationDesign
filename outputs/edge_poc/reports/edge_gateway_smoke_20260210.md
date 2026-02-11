# Edge Gateway Smoke Test (20260210)

- API_BASE: http://127.0.0.1:8080/api/v1
- Time: 2026-02-10T11:01:09Z

## Health
- swift deploy: ok
- ai_service: ok
- backend: ok

## Cases
### 课程资源
- query: 有没有关于安培定律的学习资料？
- model: qwen3-0.6b-edge-v1
- reply_length: 176
- reply: 这个问题很关键，安培定律是电磁学的核心内容。我这里有几份详细资料：

1. 安培定律理论讲解.pdf
   - 这是完整的理论框架，涵盖了安培定律的各个方面

2. 安培定律例题解析.pptx
   - 这是精心设计的例题，适合做练习

3. 安培定律应用实例.pdf
   - 这是安培定律在不同场景中的应用

这些资料应该能帮助你全面理解安培定律。

### 学习追踪
- query: 我今天学习了什么内容？
- model: qwen3-0.6b-edge-v1
- reply_length: 259
- reply: 为您整理：
1. 写作核心概念讲解
   - thesis statement（论点陈述）
   - topic sentence（论点支持）
   - hedging（削弱论点）

2. 常见错误案例
   - 例1：论点不清晰（未明确支持）
   - 例2：论点重复（没有新观点）

3. 自测练习
   - 历史论文分析
   - 逻辑推理题

4. 遵守学术规范
   - 例1：引用规范（APA vs. MLA）
   - 例2：字数要求（1200-1500字）

建议：按照逻辑顺序复习，重点掌握核心概念。

### 简单问答
- query: 电场强度的定义是什么？
- model: qwen3-0.6b-edge-v1
- reply_length: 152
- reply: 今天我们一起学习一个核心概念：电场强度

1. 定义：
   - 是描述电场性质的物理量
   - 与电势、电场线等密切相关

2. 特点：
   - 适用于任意带电粒子
   - 公式简洁清晰

3. 应用场景：
   - 电磁场分析
   - 电路设计优化

掌握这些要点，就能更好地应用电场知识了！

### 复杂推理提示
- query: 请证明格林定理
- model: edge-local-router
- reply_length: 47
- reply: 这是一个数学证明问题，需要严密的逻辑推理。我已将问题转发给云端 AI，它会提供完整的证明过程。

