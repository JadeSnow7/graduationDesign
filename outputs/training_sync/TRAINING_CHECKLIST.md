# 第二次训练执行检查清单

**日期**: 2026-02-08
**服务器**: ssh -p 43821 root@connect.cqa1.seetacloud.com

## V2.2 收尾检查（2026-02-09）

### 后评估修复
- [x] `eval_metrics.py` 已支持 legacy benchmark（messages-only）兼容评分
- [x] writing 模板格式校验（问题诊断/改进建议/规范说明）已启用
- [x] style/writing/all 后评估报告已补齐
  - [x] `eval_report_style.json/.md`
  - [x] `eval_report_writing.json/.md`
  - [x] `eval_report_all.json/.md`

### 量化可行性
- [x] BnB 4bit（BitsAndBytesConfig）基座加载通过
- [x] BnB 4bit + LoRA（style/multitask）推理通过
- [x] GGUF 导出通过（`model-f16.gguf`、`model-q4_k_m.gguf`）
- [x] `llama-cli` 烟测通过
- [ ] `llama-cpp-python` 生成烟测通过（本轮为超时，已记录 open issue）
- [ ] Ollama 烟测（远端未安装，记录 `SKIPPED_NOT_INSTALLED`）

### 归档与备份
- [x] `TRAINING_SUMMARY.md` 已更新（含环境指纹与量化结论）
- [x] `ISSUES.md` 与 `issues.jsonl` 已双轨更新
- [x] `WORKLOG.md` 已记录关键步骤与问题处置
- [x] 权重备份目录已更新并重算 `SHA256SUMS.txt`

## 训练前准备 (Pre-Training)

### 本地准备
- [ ] 确认所有代码已提交到Git
- [ ] 确认训练数据已准备完毕
- [ ] 确认训练脚本已更新（包含writing阶段）
- [ ] 阅读训练执行计划文档

### 远程服务器连接
- [ ] SSH连接成功
- [ ] 确认服务器有GPU（nvidia-smi）
- [ ] 确认磁盘空间充足（>20GB）
- [ ] 确认网络连接正常

### 代码同步
- [ ] 拉取最新代码（git pull origin main）
- [ ] 确认关键文件存在：
  - [ ] `data/training/processed/style_sft.jsonl`
  - [ ] `data/training/processed/writing_sft.jsonl`
  - [ ] `data/training/processed/all_sft.jsonl`
  - [ ] `data/training/eval/style_benchmark.jsonl`
  - [ ] `data/training/eval/writing_benchmark.jsonl`
  - [ ] `code/ai_service/training/run_train.sh`
  - [ ] `scripts/remote_train_all.sh`

### 环境配置
- [ ] Python依赖已安装（pip install -r requirements.txt）
- [ ] PyTorch可用
- [ ] CUDA可用（或MPS for Apple Silicon）
- [ ] Transformers已安装
- [ ] PEFT已安装
- [ ] bitsandbytes已安装（可选）

### 模型访问配置
选择一种方式：
- [ ] HuggingFace Token已配置（export HF_TOKEN=...）
- [ ] 或 ModelScope已安装（pip install modelscope && export USE_MODELSCOPE=1）

### 验证检查
- [ ] 运行验证脚本通过（bash scripts/verify_training_ready.sh）
- [ ] 所有检查项显示 ✓

## 训练执行 (Training Execution)

### 阶段1: Sample训练（验证）
- [ ] 创建screen/tmux会话
- [ ] 启动Sample训练
- [ ] 监控训练进度（tail -f logs）
- [ ] 训练完成无错误
- [ ] 检查输出文件：
  - [ ] `outputs/adapter/adapter_sample/adapter_model.safetensors`
  - [ ] `outputs/adapter/adapter_sample/eval_report_sample.md`
- [ ] 评估指标合理
- [ ] GPU内存使用正常

**如果Sample训练失败，停止并排查问题！**

### 阶段2: Style训练（电磁学）
- [ ] 启动Style训练
- [ ] 监控训练进度
- [ ] 训练完成无错误
- [ ] 检查输出文件：
  - [ ] `outputs/adapter/adapter_style/adapter_model.safetensors`
  - [ ] `outputs/adapter/adapter_style/eval_report_style.md`
- [ ] 评估指标检查：
  - [ ] Key Point Coverage: >90%
  - [ ] Format Compliance: >95%
  - [ ] Refusal Accuracy: >85%

### 阶段3: Writing训练（学术写作）
- [ ] 启动Writing训练
- [ ] 监控训练进度
- [ ] 训练完成无错误
- [ ] 检查输出文件：
  - [ ] `outputs/adapter/adapter_writing/adapter_model.safetensors`
  - [ ] `outputs/adapter/adapter_writing/eval_report_writing.md`
- [ ] 评估指标检查：
  - [ ] Key Point Coverage: >85%
  - [ ] Format Compliance: >90%

### 阶段4: All训练（多任务）
- [ ] 启动All训练
- [ ] 监控训练进度
- [ ] 训练完成无错误
- [ ] 检查输出文件：
  - [ ] `outputs/adapter/adapter_multitask/adapter_model.safetensors`
  - [ ] `outputs/adapter/adapter_multitask/eval_report_all.md`
- [ ] 评估指标检查：
  - [ ] Key Point Coverage: >88%
  - [ ] Format Compliance: >92%

## 结果收集 (Results Collection)

### 训练报告收集
- [ ] 创建报告目录（outputs/training_sync/run_*）
- [ ] 复制所有评估报告
- [ ] 复制训练日志
- [ ] 生成综合报告（TRAINING_SUMMARY.md）

### 手动测试（可选）
- [ ] 测试Style模型预测
- [ ] 测试Writing模型预测
- [ ] 测试Multitask模型预测
- [ ] 检查预测质量

### 结果同步到本地
- [ ] 下载adapter模型到本地
- [ ] 下载训练报告到本地
- [ ] 下载训练日志到本地
- [ ] 验证文件完整性

## 结果分析 (Results Analysis)

### 性能对比
- [ ] 对比Style/Writing/All模型的评估指标
- [ ] 分析各模型的优劣
- [ ] 确定最佳模型

### 问题记录
- [ ] 记录训练过程中遇到的问题
- [ ] 记录解决方案
- [ ] 记录优化建议

### 文档更新
- [ ] 更新训练总结文档
- [ ] 记录实际训练时间
- [ ] 记录实际评估指标
- [ ] 记录经验教训

## Git提交 (Git Commit)

### 提交准备
- [ ] 检查要提交的文件
- [ ] 确认不包含大模型文件（.safetensors）
- [ ] 确认包含评估报告和日志

### 提交执行
- [ ] git add outputs/training_sync/
- [ ] git add outputs/logs/*.log
- [ ] git commit -m "training: ..."
- [ ] git push origin main

### 提交验证
- [ ] 确认推送成功
- [ ] 在GitHub上查看提交
- [ ] 确认文件正确

## 后续工作 (Follow-up)

### 模型部署
- [ ] 选择最佳模型
- [ ] 准备部署环境
- [ ] 部署模型到生产环境
- [ ] 测试部署效果

### 持续优化
- [ ] 收集用户反馈
- [ ] 分析模型表现
- [ ] 规划下一次训练
- [ ] 准备更多训练数据

## 时间记录

| 阶段 | 预计时间 | 实际时间 | 备注 |
|------|---------|---------|------|
| 环境准备 | 10-15分钟 | ___分钟 | |
| Sample训练 | 5-10分钟 | ___分钟 | |
| Style训练 | 20-30分钟 | ___分钟 | |
| Writing训练 | 15-20分钟 | ___分钟 | |
| All训练 | 30-40分钟 | ___分钟 | |
| 结果收集 | 5-10分钟 | ___分钟 | |
| **总计** | **85-125分钟** | **___分钟** | |

## 指标记录

| 模型 | Key Point Coverage | Format Compliance | Refusal Accuracy | 备注 |
|------|-------------------|-------------------|------------------|------|
| Sample | ___% | ___% | ___% | |
| Style | ___% | ___% | ___% | 目标: >90%, >95%, >85% |
| Writing | ___% | ___% | ___% | 目标: >85%, >90%, >80% |
| All | ___% | ___% | ___% | 目标: >88%, >92%, >85% |

## 问题记录

### 遇到的问题
1.
2.
3.

### 解决方案
1.
2.
3.

### 优化建议
1.
2.
3.

## 签名确认

- [ ] 训练执行人: ___________
- [ ] 执行日期: ___________
- [ ] 结果验证人: ___________
- [ ] 验证日期: ___________

---

**文档版本**: v1.0
**创建日期**: 2026-02-08
**最后更新**: 2026-02-08

## V3 收尾检查（2026-02-10）✅ 完成

### 训练执行
- [x] V3A (3 epochs, lr=2e-4): completed, metrics insufficient
- [x] V3B (4 epochs, lr=1e-4): completed, metrics optimal ✅ **Selected**
- [x] V3C (5 epochs, lr=8e-5): completed, metrics same as V3B

### 指标核验 (V3B - 重评估后)
- [x] Style: Coverage 100%, Format 100% ✅
- [x] Writing (by multitask): Coverage 100%, Format 100% ✅
- [x] All: Coverage 100%, Format 100% ✅ **超过目标阈值**
- [WARN] Writing (单任务): Coverage 0%, Format 0% (空响应问题，已弃用)

### 量化验证
- [x] BnB 4bit: 全部 PASS ✅ (主门禁通过)
- [x] GGUF: 部分失败 (quantize_q4/llama_cli/llama_cpp_python FAIL，不阻塞发布)

### 归档与备份
- [x] V3B 远端备份: /root/autodl-tmp/training_weights/run_20260209_170928_v3B/
- [x] V3C 远端备份: /root/autodl-tmp/training_weights/run_20260209_174240_v3C/
- [x] 本地回传完成: outputs/adapter_backups/
- [x] SHA256 验签: 全部 OK ✅
- [x] 训练总结报告: v3_training_final_report.md ✅

### 数据集 V3 增强
- [x] Style 新增 24 条样本 (ch1/ch2/ch3, easy/medium/hard)
- [x] Writing 新增 18 条样本 (18 个写作场景)
- [x] 数据质量门禁: 100% 通过 ✅

### 关键问题修复
- [x] Token 输出归一化 (code@d602849)
- [x] 评估脚本版本同步 (根仓库@7029527)
- [x] 重评估流程执行 (V3B/V3C)

### 上线建议
- ✅ **推荐模型**: adapter_multitask (run_20260209_170928)
- ✅ **量化方式**: BnB 4-bit
- ✅ **部署方式**: transformers + peft + bitsandbytes
- ✅ **性能指标**: 所有指标 100%
