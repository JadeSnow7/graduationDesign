# 扩展训练数据集说明

## 生成时间
2026-02-08

## 数据概览

### 训练集 (style_sft_extended.jsonl)
- **文件路径**: `/Users/huaodong/graduationDesign/assets/training_samples/processed/style_sft_extended.jsonl`
- **样本数量**: 25条
- **ID范围**: style-0004 至 style-0028

### 评估集 (benchmark_extended.jsonl)
- **文件路径**: `/Users/huaodong/graduationDesign/assets/training_samples/eval/benchmark_extended.jsonl`
- **样本数量**: 9条
- **ID范围**: eval-0003 至 eval-0011

### 总计
- **总样本数**: 34条（训练25条 + 评估9条）

## 数据格式

每条数据采用JSONL格式，包含以下字段：

```json
{
  "id": "样本唯一标识",
  "mode": "tutor",
  "messages": [
    {
      "role": "system",
      "content": "你是高校课程助教。请按以下结构回答：\n### 结论\n### 推导\n### 检查（单位/边界条件/极限情况）"
    },
    {
      "role": "user",
      "content": "用户问题"
    },
    {
      "role": "assistant",
      "content": "助教回答（包含结论、推导、检查三部分）"
    }
  ],
  "meta": {
    "source": "lecture",
    "chapter": "章节编号",
    "difficulty": "难度等级"
  }
}
```

## 内容覆盖

### 章节分布
- **ch1**: 静电场基础（电场强度、电势、电容、洛伦兹力、电偶极子等）
- **ch2**: 电磁感应与介质（边界条件、位移电流、法拉第定律、极化、磁化、自感互感等）
- **ch3**: 电磁波（传播速度、坡印廷矢量、趋肤效应、偏振、反射折射、多普勒效应、群速度相速度等）
- **general**: 通用场景（拒答作业题、考试相关等）

### 难度分布
- **easy**: 基础概念题（约30%）
- **medium**: 中等难度推导题（约50%）
- **hard**: 高难度理论推导题（约20%）

### 题型分布
1. **概念解释题**: 解释基本物理概念（如"什么是麦克斯韦方程组"）
2. **公式推导题**: 推导重要物理公式（如"推导平行板电容器电容"）
3. **计算题**: 简单计算问题（如"3+5等于多少"）
4. **拒答场景**: 作业题、考试答案、实验报告代写等（约15%）

## 数据特点

### 1. 格式规范
所有回答严格遵循三段式结构：
- **结论**: 直接给出核心结论
- **推导**: 详细的推导过程或原理解释
- **检查**: 单位检查、边界条件、极限情况、适用条件等

### 2. 物理准确性
- 所有公式和物理概念经过验证
- 包含正确的单位和量纲
- 明确标注适用条件和边界情况

### 3. 教学导向
- 强调概念理解而非死记硬背
- 提供推导过程培养思维能力
- 对作业题给予提示而非直接答案

### 4. 多样性
- 涵盖电磁学主要知识点
- 包含不同难度层次
- 包含正常问答和拒答场景

## 使用建议

### 训练配置
```bash
# 建议训练参数
--train_file assets/training_samples/processed/style_sft_extended.jsonl
--eval_file assets/training_samples/eval/benchmark_extended.jsonl
--num_train_epochs 3
--learning_rate 2e-5
--per_device_train_batch_size 4
```

### 数据扩展
如需更多数据，可以：
1. 增加更多章节内容（如电路理论、量子电动力学等）
2. 增加更多难度层次的题目
3. 增加更多拒答场景（如学术不端、超出范围等）
4. 增加多轮对话场景

### 质量保证
- 所有样本已经过格式验证
- 物理内容经过检查
- 建议在实际使用前进行人工抽查

## 与原始数据的关系

### 原始数据
- `style_sft_sample.jsonl`: 3条样本（style-0001 至 style-0003）
- `benchmark_sample.jsonl`: 2条样本（eval-0001 至 eval-0002）

### 扩展数据
- 在原始数据基础上新增25条训练样本
- 新增9条评估样本
- 保持相同的格式和质量标准
- ID连续编号，避免冲突

## 后续改进方向

1. **增加样本数量**: 建议扩展到100+训练样本
2. **增加多轮对话**: 当前为单轮问答，可增加多轮交互场景
3. **增加工具调用**: 当前tool_calls为空，可增加计算器、绘图等工具使用
4. **增加RAG场景**: 可增加需要检索课程资料的问题
5. **增加错误纠正**: 可增加学生错误理解的纠正场景

## 文件位置

```
graduationDesign/
└── assets/
    └── training_samples/
        ├── processed/
        │   ├── style_sft_sample.jsonl      (原始3条)
        │   └── style_sft_extended.jsonl    (新增25条)
        └── eval/
            ├── benchmark_sample.jsonl      (原始2条)
            └── benchmark_extended.jsonl    (新增9条)
```

## 验证方法

```bash
# 验证JSON格式
python -c "import json; [json.loads(line) for line in open('style_sft_extended.jsonl')]"

# 统计样本数
wc -l style_sft_extended.jsonl

# 查看样本ID
grep -o '"id":"[^"]*"' style_sft_extended.jsonl
```
