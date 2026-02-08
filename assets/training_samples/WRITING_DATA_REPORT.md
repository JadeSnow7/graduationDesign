# 学术写作训练数据生成报告

## 生成时间
2026-02-08

## 数据概览

### ✅ 已生成文件

1. **训练集**: `assets/training_samples/processed/writing_sft_sample.jsonl`
   - 样本数量: **12条**
   - ID范围: writing-0001 至 writing-0012

2. **评估集**: `assets/training_samples/eval/writing_benchmark.jsonl`
   - 样本数量: **6条**
   - ID范围: writing-eval-001 至 writing-eval-006

### 📊 数据统计

#### 训练集分布
- **难度分布**:
  - easy: 4条 (33%)
  - medium: 6条 (50%)
  - hard: 2条 (17%)

- **主题覆盖** (12个主题):
  - introduction (绪论写作)
  - objectivity (客观性表述)
  - figures (图表处理)
  - paragraph (段落组织)
  - citation (引用规范)
  - results (实验结果呈现)
  - terminology (术语使用)
  - language (语言规范)
  - related_work (文献综述)
  - formula (公式排版)
  - conclusion (结论撰写)
  - experiment (实验设计)

#### 评估集分布
- **难度分布**:
  - easy: 3条 (50%)
  - medium: 3条 (50%)

- **主题覆盖** (6个主题):
  - abstract (摘要写作)
  - person (人称使用)
  - plagiarism (学术诚信)
  - acknowledgement (致谢撰写)
  - design (系统设计)
  - code (代码展示)

## 数据格式

采用与之前不同的三段式结构，更适合写作指导：

```json
{
  "id": "样本唯一标识",
  "mode": "tutor",
  "messages": [
    {
      "role": "system",
      "content": "你是学术写作课程助教。请按以下结构回答：\n### 问题诊断\n### 改进建议\n### 规范说明"
    },
    {
      "role": "user",
      "content": "学生的写作问题"
    },
    {
      "role": "assistant",
      "content": "助教回答（包含问题诊断、改进建议、规范说明三部分）"
    }
  ],
  "meta": {
    "source": "writing",
    "topic": "主题标签",
    "difficulty": "难度等级"
  }
}
```

## 内容特点

### 1. 针对性强
- 基于《学术写作规范.md》文档内容
- 涵盖学生写作中的常见问题
- 提供具体、可操作的改进建议

### 2. 结构清晰
- **问题诊断**: 明确指出问题所在
- **改进建议**: 提供具体的修改方法和步骤
- **规范说明**: 总结相关的学术写作规范

### 3. 场景丰富
- 论文各章节写作（绪论、文献综述、实验、结论等）
- 格式规范（图表、公式、引用、代码等）
- 语言表达（客观性、术语、口语化等）
- 学术诚信（抄袭、引用、代写等）

### 4. 教学导向
- 强调学术规范和诚信
- 提供改进方法而非直接代写
- 培养学生的学术写作能力

## 覆盖的写作问题

### 论文结构问题
- ✅ 绪论过于简单
- ✅ 文献综述简单罗列
- ✅ 实验部分不充分
- ✅ 结论撰写困难

### 格式规范问题
- ✅ 图表处理不当
- ✅ 公式排版不规范
- ✅ 引用格式错误
- ✅ 代码展示不当

### 语言表达问题
- ✅ 主观表述过多
- ✅ 口语化严重
- ✅ 术语使用不当
- ✅ 段落过长

### 学术诚信问题
- ✅ 抄袭行为
- ✅ 引用不规范
- ✅ 要求代写

## 与学术规范知识库的关系

### 知识库现状
- **图索引**: graphrag_index.json 包含4个PDF文件节点
  - 10、SCI写作技巧大礼包.pdf
  - 1、SCI 论文写作和发表：YOU CAN DO IT 第2版.pdf
  - 5、如何撰写和发表SCI期刊论文.pdf
  - 8、文献检索与论文写作.pdf

- **向量库**: /Users/huaodong/graduationDesign/code/ai_service/app/data/vector_index
  - 目前只有2个文件有完整chunk映射

- **规范文档**: 学术写作规范.md

### 训练数据与知识库的结合
1. **基础训练**: 使用本训练数据集进行基础写作指导能力训练
2. **知识增强**: 结合RAG从知识库检索具体的写作技巧和规范
3. **个性化指导**: 根据学生具体问题，从知识库中检索相关内容

## 使用建议

### 训练配置
```bash
# 使用写作训练数据
python train.py \
  --train_file assets/training_samples/processed/writing_sft_sample.jsonl \
  --eval_file assets/training_samples/eval/writing_benchmark.jsonl \
  --num_train_epochs 3 \
  --learning_rate 2e-5
```

### 与RAG结合
```python
# 训练后的模型可以结合RAG使用
# 1. 基础回答：使用训练数据学到的写作指导能力
# 2. 知识增强：从学术规范知识库检索具体规范和技巧
# 3. 个性化：根据学生的具体写作风格调整建议
```

### 扩展方向
1. **增加样本数量**: 建议扩展到50+训练样本
2. **增加具体案例**: 添加实际的写作案例分析
3. **增加修改示例**: 提供修改前后的对比示例
4. **增加学科差异**: 针对不同学科的写作特点
5. **增加写作阶段**: 覆盖从初稿到定稿的各个阶段

## 后续改进计划

### 短期（1-2周）
1. 扩展训练样本到30-50条
2. 添加更多具体的修改示例
3. 完善向量索引，确保所有PDF都有chunk映射

### 中期（1个月）
1. 增加学生写作风格分析样本
2. 添加多轮对话场景（如逐步指导修改）
3. 结合实际学生论文案例

### 长期（2-3个月）
1. 建立学生写作档案系统
2. 实现个性化写作指导
3. 开发写作进度跟踪功能

## 文件位置

```
graduationDesign/
├── assets/
│   └── training_samples/
│       ├── processed/
│       │   ├── style_sft_sample.jsonl          (电磁学课程，3条)
│       │   ├── style_sft_extended.jsonl        (电磁学课程，25条)
│       │   └── writing_sft_sample.jsonl        (学术写作，12条) ✨
│       └── eval/
│           ├── benchmark_sample.jsonl          (电磁学课程，2条)
│           ├── benchmark_extended.jsonl        (电磁学课程，9条)
│           └── writing_benchmark.jsonl         (学术写作，6条) ✨
├── academic/
│   └── thesis/
│       └── 学术写作规范.md                      (规范文档)
└── code/
    └── ai_service/
        └── app/
            └── data/
                ├── vector_index/                (向量库目录)
                └── graphrag_index.json          (图索引)
```

## 数据质量保证

- ✅ JSON格式验证通过
- ✅ 数据结构完整性检查通过
- ✅ 内容基于学术写作规范文档
- ✅ 覆盖学生常见写作问题
- ✅ 提供具体可操作的建议

## 🎉 总结

成功生成了18条学术写作训练数据（训练12条 + 评估6条），涵盖：
- ✅ 论文各章节写作指导
- ✅ 格式规范问题
- ✅ 语言表达问题
- ✅ 学术诚信教育

这些数据可以与现有的学术规范知识库结合，实现：
1. **基础能力**: 通过训练数据学习写作指导的基本模式
2. **知识增强**: 通过RAG从知识库检索具体规范和技巧
3. **个性化**: 根据学生具体情况提供针对性建议

建议先使用这批数据进行训练，观察效果后再决定是否需要进一步扩展。
