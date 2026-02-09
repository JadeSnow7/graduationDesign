# 第二次训练计划总结

**创建日期**: 2026-02-08
**状态**: ✅ 计划完成，准备执行

## 计划概述

基于第一次训练实施（数据准备和脚本更新），制定第二次训练的具体执行计划，在远程GPU服务器上完成所有训练阶段。

## 核心目标

1. **验证训练流程** - 通过Sample训练确保环境正常
2. **训练Style模型** - 电磁学课程助教能力（28样本）
3. **训练Writing模型** - 学术写作指导能力（12样本）
4. **训练Multitask模型** - 综合能力（40样本）
5. **收集和分析结果** - 评估各模型性能，选择最佳模型

## 已创建文档

### 1. 详细执行计划
**文件**: `outputs/training_sync/TRAINING_PLAN_EXECUTION.md`

**内容**:
- 6个执行阶段的详细步骤
- 每个阶段的命令和预期结果
- 故障排查指南
- 时间估算和检查清单

### 2. 快速参考卡
**文件**: `outputs/training_sync/QUICK_REFERENCE.md`

**内容**:
- 常用命令速查
- 一键执行方案
- 监控命令
- 下载结果命令

### 3. 执行检查清单
**文件**: `outputs/training_sync/TRAINING_CHECKLIST.md`

**内容**:
- 训练前准备检查项
- 训练执行检查项
- 结果收集检查项
- 时间和指标记录表

### 4. 自动化执行脚本
**文件**: `scripts/remote_train_all.sh`

**功能**:
- 一键执行所有训练阶段
- 自动环境检查
- 自动结果收集
- 生成综合报告

## 执行方式

### 方案A：自动化执行（推荐）

```bash
# 1. 连接服务器
ssh -p 43821 root@connect.cqa1.seetacloud.com

# 2. 进入项目目录
cd /root/graduationDesign

# 3. 拉取最新代码
git pull origin main

# 4. 一键执行所有训练
bash scripts/remote_train_all.sh
```

**优点**:
- 自动化程度高
- 包含所有检查和验证
- 自动生成报告
- 适合无人值守执行

### 方案B：手动逐步执行

```bash
# 1. 连接并准备
ssh -p 43821 root@connect.cqa1.seetacloud.com
cd /root/graduationDesign
git pull origin main

# 2. 验证环境
bash scripts/verify_training_ready.sh

# 3. 逐步训练
bash code/ai_service/training/run_train.sh sample
bash code/ai_service/training/run_train.sh style
bash code/ai_service/training/run_train.sh writing
bash code/ai_service/training/run_train.sh all
```

**优点**:
- 更好的控制
- 可以在每个阶段检查结果
- 适合调试和优化

## 训练配置

### 硬件要求
- GPU: 8GB+ VRAM（推荐16GB+）
- 内存: 16GB+
- 磁盘: 20GB+ 可用空间

### 软件要求
- Python 3.8+
- PyTorch 2.0+
- Transformers 4.30+
- PEFT 0.4+
- bitsandbytes（可选，用于QLoRA）

### 训练参数
```bash
MODEL_NAME_OR_PATH=Qwen/Qwen3-8B-Instruct
NUM_TRAIN_EPOCHS=2
PER_DEVICE_TRAIN_BATCH_SIZE=1
GRADIENT_ACCUMULATION_STEPS=8
LEARNING_RATE=1e-4
USE_QLORA=1
```

## 预期结果

### 训练时间
| 阶段 | 预计时间 |
|------|---------|
| 环境准备 | 10-15分钟 |
| Sample训练 | 5-10分钟 |
| Style训练 | 20-30分钟 |
| Writing训练 | 15-20分钟 |
| All训练 | 30-40分钟 |
| 结果收集 | 5-10分钟 |
| **总计** | **1.5-2小时** |

### 评估指标
| 模型 | Key Point Coverage | Format Compliance |
|------|-------------------|-------------------|
| Style | >90% | >95% |
| Writing | >85% | >90% |
| All | >88% | >92% |

### 输出文件
```
outputs/
├── adapter/
│   ├── adapter_sample/          # Sample模型
│   ├── adapter_style/           # Style模型
│   ├── adapter_writing/         # Writing模型
│   └── adapter_multitask/       # 多任务模型
├── logs/
│   └── train_*.log              # 训练日志
└── training_sync/
    └── run_*/
        ├── TRAINING_SUMMARY.md  # 综合报告
        ├── eval_report_*.json   # 评估报告
        └── train_*.log          # 日志备份
```

## 关键步骤

### 1. 训练前验证（必须）
```bash
bash scripts/verify_training_ready.sh
```
确保所有检查通过 ✓

### 2. Sample训练（必须）
```bash
bash code/ai_service/training/run_train.sh sample
```
如果失败，停止并排查问题

### 3. 使用Screen保持会话（推荐）
```bash
screen -S training
bash scripts/remote_train_all.sh
# Ctrl+A+D 分离会话
```

### 4. 监控训练进度
```bash
# 查看日志
tail -f outputs/logs/train_*.log

# 查看GPU
nvidia-smi -l 1
```

### 5. 下载结果到本地
```bash
# 在本地机器执行
scp -P 43821 -r root@connect.cqa1.seetacloud.com:/root/graduationDesign/outputs/adapter ./outputs/
scp -P 43821 -r root@connect.cqa1.seetacloud.com:/root/graduationDesign/outputs/training_sync/run_* ./outputs/training_sync/
```

## 故障排查

### GPU内存不足
```bash
export PER_DEVICE_TRAIN_BATCH_SIZE=1
export GRADIENT_ACCUMULATION_STEPS=16
```

### 模型下载失败
```bash
pip install modelscope
export USE_MODELSCOPE=1
```

### 训练中断
使用screen/tmux保持会话，即使SSH断开也能继续训练

### 磁盘空间不足
```bash
# 清理缓存
rm -rf ~/.cache/huggingface/hub/*
```

## 成功标准

### 必须满足
- [ ] Sample训练成功完成
- [ ] 至少一个完整模型训练成功
- [ ] 生成评估报告
- [ ] 指标在合理范围内

### 理想状态
- [ ] 所有4个阶段训练成功
- [ ] 所有指标达到预期目标
- [ ] 无错误或警告
- [ ] 结果已同步到本地

## 后续工作

### 立即执行
1. 连接远程服务器
2. 拉取最新代码
3. 运行训练脚本
4. 监控训练进度
5. 收集训练结果

### 训练完成后
1. 分析评估指标
2. 对比各模型性能
3. 选择最佳模型
4. 准备模型部署
5. 更新文档

### 持续优化
1. 收集用户反馈
2. 扩展训练数据
3. 调优超参数
4. 进行第三次训练

## 参考文档

| 文档 | 用途 |
|------|------|
| `TRAINING_PLAN_EXECUTION.md` | 详细执行步骤 |
| `QUICK_REFERENCE.md` | 快速命令参考 |
| `TRAINING_CHECKLIST.md` | 执行检查清单 |
| `IMPLEMENTATION_SUMMARY.md` | 第一次实施总结 |
| `QUICK_START_TRAINING.md` | 快速开始指南 |
| `code/ai_service/training/README.md` | 训练系统文档 |

## 联系方式

如遇问题，参考：
- 故障排查章节
- 训练README文档
- GitHub Issues

---

**计划状态**: ✅ 完成
**准备状态**: ✅ 就绪
**下一步**: 连接远程服务器开始训练

**执行命令**:
```bash
ssh -p 43821 root@connect.cqa1.seetacloud.com
cd /root/graduationDesign
git pull origin main
bash scripts/remote_train_all.sh
```
